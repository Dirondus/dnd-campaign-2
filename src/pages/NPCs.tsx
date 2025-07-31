import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { UserCheck, Plus, Search, Crown, Sword, Shield, Users, Star, Filter } from "lucide-react"
import { NPCForm } from "@/components/forms/NPCForm"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const NPCs = () => {

  const [npcs, setNpcs] = useState([
    {
      id: 1,
      name: "Lord Aldric Blackwood",
      title: "Noble of Valdris",
      location: "Blackwood Manor",
      relationship: "Ally",
      importance: "High",
      description: "A powerful noble who secretly funds the resistance against the corrupt council.",
      lastEncounter: "Never met",
      background: "Born into nobility, lost family in the war",
      goals: "Seeks to overthrow the corrupt council",
      secrets: "Secretly leads the underground resistance"
    },
    {
      id: 2,
      name: "Granny Weatherby",
      title: "Village Witch",
      location: "Thornwick Village", 
      relationship: "Neutral",
      importance: "Medium",
      description: "An elderly herbalist with knowledge of ancient curses and remedies.",
      lastEncounter: "Never met",
      background: "Former court wizard, now in exile",
      goals: "Protect the village from supernatural threats",
      secrets: "Knows the location of a powerful artifact"
    },
    {
      id: 3,
      name: "Captain Ironbeard",
      title: "Pirate Captain",
      location: "The Crimson Tide",
      relationship: "Enemy",
      importance: "High", 
      description: "A ruthless pirate captain seeking the same treasure as the adventurers.",
      lastEncounter: "Never met",
      background: "Former naval officer turned pirate",
      goals: "Find the legendary treasure of Blackwater Bay",
      secrets: "Has a map showing the treasure's location"
    }
  ])

  const [npcFormOpen, setNpcFormOpen] = useState(false)
  const [npcDetailsOpen, setNpcDetailsOpen] = useState(false)
  const [editingNpc, setEditingNpc] = useState<any>(null)
  const [selectedNpc, setSelectedNpc] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRelationship, setFilterRelationship] = useState<string | null>(null)

  const handleCreateNpc = (npcData: any) => {
    setNpcs(prev => [...prev, npcData])
  }

  const handleEditNpc = (npc: any) => {
    setEditingNpc(npc)
    setNpcFormOpen(true)
  }

  const handleUpdateNpc = (updatedNpc: any) => {
    setNpcs(prev => prev.map(npc => 
      npc.id === updatedNpc.id ? updatedNpc : npc
    ))
    setEditingNpc(null)
  }

  const handleViewDetails = (npc: any) => {
    setSelectedNpc(npc)
    setNpcDetailsOpen(true)
  }

  const filteredNpcs = npcs.filter(npc => {
    const matchesSearch = npc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         npc.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         npc.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = !filterRelationship || npc.relationship === filterRelationship
    return matchesSearch && matchesFilter
  })

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
        <Button 
          onClick={() => setNpcFormOpen(true)}
          className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create NPC
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="bg-gradient-card border-border shadow-deep">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search NPCs by name, location, or description..." 
                className="pl-10 bg-background/50 border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="border-accent/30 text-accent hover:bg-accent/10"
              onClick={() => setFilterRelationship(filterRelationship ? null : 'Ally')}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

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
            {filteredNpcs.length} Total
          </Badge>
        </div>

        {filteredNpcs.length === 0 ? (
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
            {filteredNpcs.map((npc, index) => (
              <Card key={index} className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical">
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
                      Last encounter: {npc.lastEncounter}
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
                
                {selectedNpc.goals && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Goals & Motivations</h4>
                    <p className="text-muted-foreground">{selectedNpc.goals}</p>
                  </div>
                )}
                
                {selectedNpc.secrets && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Secrets & Notes</h4>
                    <p className="text-muted-foreground">{selectedNpc.secrets}</p>
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold text-foreground mb-2">Last Encounter</h4>
                  <p className="text-muted-foreground">{selectedNpc.lastEncounter}</p>
                </div>
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