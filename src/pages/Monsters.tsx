import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skull, Plus, Search, Zap, Shield, Sword, Crown } from "lucide-react"
import { MonsterForm } from "@/components/forms/MonsterForm"

const Monsters = () => {
  const monsterTypes = [
    { name: "Beasts", count: 0, color: "bg-green-500/20 text-green-400 border-green-500/30", icon: Sword },
    { name: "Undead", count: 0, color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Skull },
    { name: "Dragons", count: 0, color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Crown },
    { name: "Fey", count: 0, color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Zap },
    { name: "Fiends", count: 0, color: "bg-orange-500/20 text-orange-400 border-orange-500/30", icon: Skull },
    { name: "Constructs", count: 0, color: "bg-gray-500/20 text-gray-400 border-gray-500/30", icon: Shield },
  ]

  const challengeRatings = [
    { range: "CR 0-2", count: 0, description: "Weak creatures, good for low-level encounters" },
    { range: "CR 3-7", count: 0, description: "Moderate threats for mid-level parties" },
    { range: "CR 8-15", count: 0, description: "Dangerous foes for experienced adventurers" },
    { range: "CR 16+", count: 0, description: "Legendary creatures and world-ending threats" },
  ]

  const [monsters, setMonsters] = useState([
    {
      name: "Ancient Shadow Dragon",
      type: "Dragon",
      cr: "17",
      environment: "Dark caverns, shadow plane",
      abilities: ["Shadow Breath", "Legendary Actions", "Frightful Presence"],
      description: "A massive dragon corrupted by shadow magic, capable of manipulating darkness itself.",
      lastUsed: "Never used"
    },
    {
      name: "Corrupted Treant",
      type: "Plant",
      cr: "9", 
      environment: "Blighted forests",
      abilities: ["Animate Trees", "Toxic Spores", "Regeneration"],
      description: "Once a guardian of the forest, now twisted by dark magic into a vengeful entity.",
      lastUsed: "Never used"
    },
    {
      name: "Void Wraith",
      type: "Undead",
      cr: "12",
      environment: "Abandoned temples, void rifts",
      abilities: ["Life Drain", "Incorporeal Movement", "Void Magic"],
      description: "A spirit torn from reality itself, seeking to drag others into the endless void.",
      lastUsed: "Never used"
    }
  ])

  const [monsterFormOpen, setMonsterFormOpen] = useState(false)
  const [editingMonster, setEditingMonster] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const handleCreateMonster = (monsterData: any) => {
    setMonsters(prev => [...prev, { ...monsterData, id: Date.now() }])
  }

  const handleEditMonster = (monster: any) => {
    setEditingMonster(monster)
    setMonsterFormOpen(true)
  }

  const getCRColor = (cr: string) => {
    const crNum = parseInt(cr)
    if (crNum <= 2) return "bg-green-500/20 text-green-400 border-green-500/30"
    if (crNum <= 7) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    if (crNum <= 15) return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    return "bg-red-500/20 text-red-400 border-red-500/30"
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "dragon": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "undead": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "beast": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "fey": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "fiend": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "plant": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
      default: return "bg-accent/20 text-accent border-accent/30"
    }
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
            <Button variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
              Filter by CR
            </Button>
            <Button variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
              Filter by Type
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Monster Types */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Monster Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {monsterTypes.map((type) => (
            <Card key={type.name} className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer">
              <CardContent className="p-4 text-center">
                <div className={`inline-flex p-3 rounded-lg ${type.color} border mb-3`}>
                  <type.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-foreground text-sm mb-1">{type.name}</h3>
                <p className="text-lg font-bold text-accent">{type.count}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Challenge Ratings */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">Challenge Ratings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {challengeRatings.map((cr) => (
            <Card key={cr.range} className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold text-foreground">{cr.range}</h3>
                  <span className="text-2xl font-bold text-accent">{cr.count}</span>
                </div>
                <p className="text-sm text-muted-foreground">{cr.description}</p>
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
              <Button className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Monster
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {monsters.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase())).map((monster, index) => (
              <Card key={index} className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl text-foreground flex items-center gap-3">
                        <Skull className="h-5 w-5 text-accent" />
                        {monster.name}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground mt-1">
                        📍 {monster.environment}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getCRColor(monster.cr)}>
                        CR {monster.cr}
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
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Special Abilities:</h4>
                    <div className="flex flex-wrap gap-2">
                      {monster.abilities.map((ability, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {ability}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Last used: {monster.lastUsed}
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
                      <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
                        View Stats
                      </Button>
                      <Button variant="outline" size="sm" className="border-secondary/30 text-secondary hover:bg-secondary/10">
                        Use in Encounter
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
        onSubmit={handleCreateMonster}
        monster={editingMonster}
      />
    </div>
  )
}

export default Monsters