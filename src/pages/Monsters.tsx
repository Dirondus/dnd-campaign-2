import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skull, Plus, Search, Zap, Shield, Sword, Crown, Eye, Trash2 } from "lucide-react"
import { MonsterForm } from "@/components/forms/MonsterForm"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

const Monsters = () => {
  const monsterTypes = [
    { name: "Beast", count: 0, color: "bg-green-500/20 text-green-400 border-green-500/30", icon: Sword },
    { name: "Undead", count: 0, color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Skull },
    { name: "Dragon", count: 0, color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Crown },
    { name: "Fey", count: 0, color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Zap },
    { name: "Fiend", count: 0, color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: Skull },
    { name: "Construct", count: 0, color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: Shield },
  ]

  const dangerRatings = [
    { range: "DR 0-2", count: 0, description: "Weak creatures, good for low-level encounters" },
    { range: "DR 3-7", count: 0, description: "Moderate threats for mid-level parties" },
    { range: "DR 8-15", count: 0, description: "Dangerous foes for experienced adventurers" },
    { range: "DR 16+", count: 0, description: "Legendary creatures and world-ending threats" },
  ]

  const [monsters, setMonsters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [monsterFormOpen, setMonsterFormOpen] = useState(false)
  const [editingMonster, setEditingMonster] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [viewingMonster, setViewingMonster] = useState<any>(null)
  const [selectedType, setSelectedType] = useState<string>('')

  useEffect(() => {
    fetchMonsters()
  }, [])

  const fetchMonsters = async () => {
    try {
      const { data, error } = await supabase
        .from('monsters')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMonsters(data || [])
    } catch (error: any) {
      toast.error('Failed to load monsters: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMonster = async (monsterData: any) => {
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        toast.error('You must be logged in to create monsters')
        return
      }

      const { data, error } = await supabase
        .from('monsters')
        .insert([{
          name: monsterData.name,
          type: monsterData.type,
          size: monsterData.size,
          danger_rating: monsterData.dangerRating,
          hit_points: monsterData.hp,
          strength_dice: monsterData.strengthDice,
          magic_dice: monsterData.magicDice,
          elements: monsterData.elements || [],
          description: monsterData.description,
          abilities: monsterData.abilities || [],
          created_by: user.data.user.id
        }])
        .select()
        .single()

      if (error) throw error
      setMonsters(prev => [data, ...prev])
      toast.success('Monster created successfully!')
    } catch (error: any) {
      toast.error('Failed to create monster: ' + error.message)
    }
  }

  const handleEditMonster = (monster: any) => {
    setEditingMonster(monster)
    setMonsterFormOpen(true)
  }

  const handleUpdateMonster = async (updatedMonster: any) => {
    try {
      const { data, error } = await supabase
        .from('monsters')
        .update({
          name: updatedMonster.name,
          type: updatedMonster.type,
          size: updatedMonster.size,
          danger_rating: updatedMonster.dangerRating,
          hit_points: updatedMonster.hp,
          strength_dice: updatedMonster.strengthDice,
          magic_dice: updatedMonster.magicDice,
          elements: updatedMonster.elements || [],
          description: updatedMonster.description,
          abilities: updatedMonster.abilities || []
        })
        .eq('id', updatedMonster.id)
        .select()
        .single()

      if (error) throw error
      setMonsters(prev => prev.map(m => 
        m.id === updatedMonster.id ? data : m
      ))
      setEditingMonster(null)
      toast.success('Monster updated successfully!')
    } catch (error: any) {
      toast.error('Failed to update monster: ' + error.message)
    }
  }

  const handleDeleteMonster = async (monsterId: string) => {
    if (!confirm('Are you sure you want to delete this monster?')) return

    try {
      const { error } = await supabase
        .from('monsters')
        .delete()
        .eq('id', monsterId)

      if (error) throw error
      setMonsters(prev => prev.filter(m => m.id !== monsterId))
      toast.success('Monster deleted successfully!')
    } catch (error: any) {
      toast.error('Failed to delete monster: ' + error.message)
    }
  }

  const handleViewStats = (monster: any) => {
    setViewingMonster(monster)
  }

  const handleTypeFilter = (type: string) => {
    setSelectedType(selectedType === type ? '' : type)
  }

  const getDangerColor = (dr: string) => {
    const drNum = parseInt(dr || '0')
    if (drNum <= 2) return "bg-green-500/20 text-green-400 border-green-500/30"
    if (drNum <= 7) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    if (drNum <= 15) return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "dragon": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "undead": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "beast": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "fey": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "fiend": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "plant": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
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
            Monster Manual
          </h1>
          <p className="text-muted-foreground mt-2">
            Catalog of creatures and encounters for your campaign
          </p>
        </div>
        <Button 
          onClick={() => setMonsterFormOpen(true)}
          className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Monster
        </Button>
      </div>

      {/* Search and Filter */}
      <Card className="bg-gradient-card border-border shadow-deep">
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search monsters by name, type, or challenge rating..." 
                className="pl-10 bg-background/50 border-border"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="border-accent/30 text-accent hover:bg-accent/10"
              onClick={() => setSelectedType('')}
            >
              {selectedType ? `Filter: ${selectedType}` : 'Filter by Type'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monster Types */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Monster Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {monsterTypes.map((type) => (
            <Card 
              key={type.name} 
              className={`bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer ${
                selectedType === type.name ? 'ring-2 ring-accent' : ''
              }`}
              onClick={() => handleTypeFilter(type.name)}
            >
              <CardContent className="p-4 text-center">
                <div className={`inline-flex p-3 rounded-lg ${type.color} border mb-3`}>
                  <type.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{type.name}</h3>
                <p className="text-lg font-bold text-accent">
                  {monsters.filter(m => m.type === type.name).length}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Danger Ratings */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Danger Ratings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dangerRatings.map((dr) => (
            <Card key={dr.range} className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-foreground">{dr.range}</h3>
                  <span className="text-2xl font-bold text-accent">
                    {monsters.filter(m => {
                      const drNum = parseInt(m.danger_rating || '0')
                      if (dr.range === "DR 0-2") return drNum <= 2
                      if (dr.range === "DR 3-7") return drNum >= 3 && drNum <= 7
                      if (dr.range === "DR 8-15") return drNum >= 8 && drNum <= 15
                      if (dr.range === "DR 16+") return drNum >= 16
                      return false
                    }).length}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{dr.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Monster List */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <Skull className="h-6 w-6 text-accent" />
          <h2 className="text-xl font-semibold text-foreground">All Monsters</h2>
          <Badge variant="outline" className="text-accent border-accent/30">
            {monsters.length} Total
          </Badge>
        </div>

        {monsters.length === 0 ? (
          <Card className="bg-gradient-card border-border shadow-deep">
            <CardContent className="p-12 text-center">
              <Skull className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Monsters Added Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Build your bestiary by adding creatures, monsters, and encounters. Create custom creatures or import from official sources.
              </p>
              <Button 
                onClick={() => setMonsterFormOpen(true)}
                className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Monster
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {monsters
              .filter(m => 
                m.name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
                (selectedType === '' || m.type === selectedType)
              )
              .map((monster) => (
              <Card key={monster.id} className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-foreground flex items-center gap-3">
                        <Skull className="h-5 w-5 text-accent" />
                        {monster.name}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-1">
                        {monster.size} {monster.type}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getDangerColor(monster.danger_rating)}>
                        DR {monster.danger_rating || '0'}
                      </Badge>
                      <Badge className={getTypeColor(monster.type)}>
                        {monster.type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {monster.description}
                  </p>
                  {monster.elements && monster.elements.length > 0 && (
                    <div className="mb-3">
                      <h4 className="text-sm font-semibold text-foreground mb-2">Elements:</h4>
                      <div className="flex flex-wrap gap-2">
                        {monster.elements.map((element: string, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {element}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Abilities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {monster.abilities?.map((ability: string, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {ability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Created: {new Date(monster.created_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => handleEditMonster(monster)}
                        variant="outline" 
                        size="sm" 
                        className="border-accent/30 text-accent hover:bg-accent/10"
                      >
                        Edit
                      </Button>
                      <Button 
                        onClick={() => handleViewStats(monster)}
                        variant="outline" 
                        size="sm" 
                        className="border-primary/30 text-primary hover:bg-primary/10"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Stats
                      </Button>
                      <Button 
                        onClick={() => handleDeleteMonster(monster.id)}
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

      <MonsterForm
        open={monsterFormOpen}
        onOpenChange={(open) => {
          setMonsterFormOpen(open)
          if (!open) setEditingMonster(null)
        }}
        onSubmit={editingMonster ? handleUpdateMonster : handleCreateMonster}
        monster={editingMonster}
      />

      {/* Monster Stats Dialog */}
      <Dialog open={!!viewingMonster} onOpenChange={() => setViewingMonster(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Skull className="h-5 w-5" />
              {viewingMonster?.name} - Stats
            </DialogTitle>
          </DialogHeader>
          {viewingMonster && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Type:</Label>
                  <p className="text-muted-foreground">{viewingMonster.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Size:</Label>
                  <p className="text-muted-foreground">{viewingMonster.size}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Danger Rating:</Label>
                  <p className="text-muted-foreground">{viewingMonster.danger_rating}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Hit Points:</Label>
                  <p className="text-muted-foreground">{viewingMonster.hit_points}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Strength Dice:</Label>
                  <p className="text-muted-foreground">{viewingMonster.strength_dice}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Magic Dice:</Label>
                  <p className="text-muted-foreground">{viewingMonster.magic_dice}</p>
                </div>
              </div>
              
              {viewingMonster.elements && viewingMonster.elements.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold">Elements:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {viewingMonster.elements.map((element: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {element}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <Label className="text-sm font-semibold">Description:</Label>
                <p className="text-muted-foreground">{viewingMonster.description}</p>
              </div>
              
              {viewingMonster.abilities && viewingMonster.abilities.length > 0 && (
                <div>
                  <Label className="text-sm font-semibold">Abilities:</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {viewingMonster.abilities.map((ability: string, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {ability}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Monsters