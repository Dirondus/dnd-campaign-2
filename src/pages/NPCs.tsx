import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { UserCheck, Plus, Search, Crown, Sword, Shield, Users, Star, Filter, Trash2 } from "lucide-react"
import { SectionSearch } from "@/components/search/SectionSearch"
import { NPCForm } from "@/components/forms/NPCForm"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

const NPCs = () => {
  const [npcs, setNpcs] = useState<any[]>([])
  const [filteredNpcs, setFilteredNpcs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [npcFormOpen, setNpcFormOpen] = useState(false)
  const [npcDetailsOpen, setNpcDetailsOpen] = useState(false)
  const [editingNpc, setEditingNpc] = useState<any>(null)
  const [selectedNpc, setSelectedNpc] = useState<any>(null)
  const [filterRelationship, setFilterRelationship] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    fetchNpcs()
    checkAdminStatus()
  }, [])

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const adminUUIDs = [
        '97d19cec-8106-44ef-9a6e-4fb1d9a2e78a',
        'e4eceed4-c78d-4fb0-ba45-92a4cbaecae7'
      ];
      setIsAdmin(adminUUIDs.includes(user.id));
    }
  };

  const fetchNpcs = async () => {
    try {
      const { data, error } = await supabase
        .from('npcs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setNpcs(data || [])
      setFilteredNpcs(data || [])
    } catch (error: any) {
      toast.error('Failed to load NPCs: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNpc = async (npcData: any) => {
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        toast.error('You must be logged in to create NPCs')
        return
      }

      const { data, error } = await supabase
        .from('npcs')
        .insert([{
          name: npcData.name,
          title: npcData.title,
          location: npcData.location,
          relationship: npcData.relationship,
          importance: npcData.importance,
          description: npcData.description,
          background: npcData.background,
          notes: npcData.notes,
          image_url: npcData.imageUrl,
          created_by: user.data.user.id
        }])
        .select()
        .single()

      if (error) throw error
      setNpcs(prev => [data, ...prev])
      toast.success('NPC created successfully!')
    } catch (error: any) {
      toast.error('Failed to create NPC: ' + error.message)
    }
  }

  const handleEditNpc = (npc: any) => {
    setEditingNpc(npc)
    setNpcFormOpen(true)
  }

  const handleUpdateNpc = async (updatedNpc: any) => {
    try {
      const { data, error } = await supabase
        .from('npcs')
        .update({
          name: updatedNpc.name,
          title: updatedNpc.title,
          location: updatedNpc.location,
          relationship: updatedNpc.relationship,
          importance: updatedNpc.importance,
          description: updatedNpc.description,
          background: updatedNpc.background,
          notes: updatedNpc.notes,
          image_url: updatedNpc.imageUrl
        })
        .eq('id', updatedNpc.id)
        .select()
        .single()

      if (error) throw error
      setNpcs(prev => prev.map(npc => 
        npc.id === updatedNpc.id ? data : npc
      ))
      setEditingNpc(null)
      toast.success('NPC updated successfully!')
    } catch (error: any) {
      toast.error('Failed to update NPC: ' + error.message)
    }
  }

  const handleDeleteNpc = async (npcId: string) => {
    if (!confirm('Are you sure you want to delete this NPC?')) return

    try {
      const { error } = await supabase
        .from('npcs')
        .delete()
        .eq('id', npcId)

      if (error) throw error
      setNpcs(prev => prev.filter(npc => npc.id !== npcId))
      toast.success('NPC deleted successfully!')
    } catch (error: any) {
      toast.error('Failed to delete NPC: ' + error.message)
    }
  }

  const handleViewDetails = (npc: any) => {
    setSelectedNpc(npc)
    setNpcDetailsOpen(true)
  }

  // Filter by relationship when set
  const displayedNpcs = filterRelationship 
    ? filteredNpcs.filter(npc => npc.relationship === filterRelationship)
    : filteredNpcs

  const getCategoryCount = (relationship: string) => {
    return npcs.filter(npc => npc.relationship === relationship).length
  }

  const getRelationshipColor = (relationship: string) => {
    switch (relationship) {
      case "Ally": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Enemy": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Neutral": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default: return "bg-accent/20 text-accent border-accent/30"
    }
  }

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case "High": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "Medium": return "bg-amber-500/20 text-amber-400 border-amber-500/30"
      case "Low": return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      default: return "bg-accent/20 text-accent border-accent/30"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            NPCs & Characters
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage all non-player characters in your campaign
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <SectionSearch 
            data={npcs}
            onFilter={setFilteredNpcs}
            searchFields={['name', 'location', 'description', 'title']}
            placeholder="Search NPCs..."
          />
          {isAdmin && (
            <Button 
              onClick={() => setNpcFormOpen(true)}
              className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create NPC
            </Button>
          )}
        </div>
      </div>


      {/* Categories Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer"
          onClick={() => setFilterRelationship(filterRelationship === 'Ally' ? null : 'Ally')}
        >
          <CardContent className="p-4 text-center">
            <div className="inline-flex p-3 rounded-lg bg-green-500/20 text-green-400 border-green-500/30 border mb-3">
              <Shield className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Allies</h3>
            <p className="text-2xl font-bold text-accent">{getCategoryCount('Ally')}</p>
          </CardContent>
        </Card>
        <Card 
          className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer"
          onClick={() => setFilterRelationship(filterRelationship === 'Enemy' ? null : 'Enemy')}
        >
          <CardContent className="p-4 text-center">
            <div className="inline-flex p-3 rounded-lg bg-red-500/20 text-red-400 border-red-500/30 border mb-3">
              <Sword className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Enemies</h3>
            <p className="text-2xl font-bold text-accent">{getCategoryCount('Enemy')}</p>
          </CardContent>
        </Card>
        <Card 
          className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer"
          onClick={() => setFilterRelationship(filterRelationship === 'Neutral' ? null : 'Neutral')}
        >
          <CardContent className="p-4 text-center">
            <div className="inline-flex p-3 rounded-lg bg-blue-500/20 text-blue-400 border-blue-500/30 border mb-3">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Neutrals</h3>
            <p className="text-2xl font-bold text-accent">{getCategoryCount('Neutral')}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="inline-flex p-3 rounded-lg bg-purple-500/20 text-purple-400 border-purple-500/30 border mb-3">
              <Star className="h-6 w-6" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">Important</h3>
            <p className="text-2xl font-bold text-accent">{npcs.filter(npc => npc.importance === 'High').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* NPC List */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <UserCheck className="h-6 w-6 text-accent" />
          <h2 className="text-xl font-semibold text-foreground">
            {filterRelationship ? `${filterRelationship} NPCs` : 'All NPCs'}
          </h2>
          <Badge variant="outline" className="text-accent border-accent/30">
            {displayedNpcs.length} Total
          </Badge>
        </div>

        {displayedNpcs.length === 0 ? (
          <Card className="bg-gradient-card border-border shadow-deep">
            <CardContent className="p-12 text-center">
              <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No NPCs Created Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start building your world by creating memorable non-player characters. Add allies, enemies, and neutral characters to bring your campaign to life.
              </p>
              <Button 
                onClick={() => setNpcFormOpen(true)}
                className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First NPC
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {displayedNpcs.map((npc) => (
              <Card key={npc.id} className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-foreground flex items-center gap-3">
                        <Crown className="h-5 w-5 text-accent" />
                        {npc.name}
                      </CardTitle>
                      <CardDescription className="text-accent font-medium">
                        {npc.title}
                      </CardDescription>
                      <p className="text-sm text-muted-foreground mt-2">
                        📍 {npc.location}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getRelationshipColor(npc.relationship)}>
                        {npc.relationship}
                      </Badge>
                      <Badge className={getImportanceColor(npc.importance)}>
                        {npc.importance}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {npc.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Created: {new Date(npc.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditNpc(npc)
                        }}
                        variant="outline" 
                        size="sm" 
                        className="border-accent/30 text-accent hover:bg-accent/10"
                      >
                        Edit
                      </Button>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewDetails(npc)
                        }}
                        variant="outline" 
                        size="sm" 
                        className="border-primary/30 text-primary hover:bg-primary/10"
                      >
                        View Details
                      </Button>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteNpc(npc.id)
                        }}
                        variant="outline" 
                        size="sm" 
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <NPCForm
        open={npcFormOpen}
        onOpenChange={(open) => {
          setNpcFormOpen(open)
          if (!open) setEditingNpc(null)
        }}
        onSubmit={editingNpc ? handleUpdateNpc : handleCreateNpc}
        npc={editingNpc}
      />

      {/* NPC Details Dialog */}
      <Dialog open={npcDetailsOpen} onOpenChange={setNpcDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-accent" />
              {selectedNpc?.name}
            </DialogTitle>
            <DialogDescription>
              {selectedNpc?.title} • {selectedNpc?.location}
            </DialogDescription>
          </DialogHeader>
          {selectedNpc && (
            <div className="space-y-6">
              <div className="flex gap-4">
                <Badge className={getRelationshipColor(selectedNpc.relationship)}>
                  {selectedNpc.relationship}
                </Badge>
                <Badge className={getImportanceColor(selectedNpc.importance)}>
                  {selectedNpc.importance}
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedNpc.description}</p>
                </div>
                
                {selectedNpc.background && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Background</h4>
                    <p className="text-muted-foreground">{selectedNpc.background}</p>
                  </div>
                )}
                
                {selectedNpc.notes && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Notes</h4>
                    <p className="text-muted-foreground">{selectedNpc.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setNpcDetailsOpen(false)
                    handleEditNpc(selectedNpc)
                  }}
                  className="flex-1"
                >
                  Edit NPC
                </Button>
                <Button 
                  onClick={() => setNpcDetailsOpen(false)}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default NPCs