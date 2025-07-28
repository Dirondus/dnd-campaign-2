import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { UserCheck, Plus, Search, Crown, Sword, Shield, Users, Star } from "lucide-react"

const NPCs = () => {
  const npcCategories = [
    { name: "Allies", count: 0, color: "bg-green-500/20 text-green-400 border-green-500/30", icon: Shield },
    { name: "Enemies", count: 0, color: "bg-red-500/20 text-red-400 border-red-500/30", icon: Sword },
    { name: "Neutrals", count: 0, color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: Users },
    { name: "Important", count: 0, color: "bg-purple-500/20 text-purple-400 border-purple-500/30", icon: Star },
  ]

  const sampleNPCs = [
    {
      name: "Lord Aldric Blackwood",
      title: "Noble of Valdris",
      location: "Blackwood Manor",
      relationship: "Ally",
      importance: "High",
      description: "A powerful noble who secretly funds the resistance against the corrupt council.",
      lastEncounter: "Never met"
    },
    {
      name: "Granny Weatherby",
      title: "Village Witch",
      location: "Thornwick Village", 
      relationship: "Neutral",
      importance: "Medium",
      description: "An elderly herbalist with knowledge of ancient curses and remedies.",
      lastEncounter: "Never met"
    },
    {
      name: "Captain Ironbeard",
      title: "Pirate Captain",
      location: "The Crimson Tide",
      relationship: "Enemy",
      importance: "High", 
      description: "A ruthless pirate captain seeking the same treasure as the adventurers.",
      lastEncounter: "Never met"
    }
  ]

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
        <Button className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow">
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
              />
            </div>
            <Button variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Categories Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {npcCategories.map((category) => (
          <Card key={category.name} className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer">
            <CardContent className="p-4 text-center">
              <div className={`inline-flex p-3 rounded-lg ${category.color} border mb-3`}>
                <category.icon className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
              <p className="text-2xl font-bold text-accent">{category.count}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* NPC List */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <UserCheck className="h-6 w-6 text-accent" />
          <h2 className="text-xl font-semibold text-foreground">All NPCs</h2>
          <Badge variant="outline" className="text-accent border-accent/30">
            {sampleNPCs.length} Total
          </Badge>
        </div>

        {sampleNPCs.length === 0 ? (
          <Card className="bg-gradient-card border-border shadow-deep">
            <CardContent className="p-12 text-center">
              <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No NPCs Created Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start building your world by creating memorable non-player characters. Add allies, enemies, and neutral characters to bring your campaign to life.
              </p>
              <Button className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First NPC
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {sampleNPCs.map((npc, index) => (
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
                      <Button variant="outline" size="sm" className="border-accent/30 text-accent hover:bg-accent/10">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
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
    </div>
  )
}

export default NPCs