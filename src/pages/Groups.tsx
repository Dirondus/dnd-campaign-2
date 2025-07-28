import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Crown, Sword, Shield, Heart } from "lucide-react"

const Groups = () => {
  const groups = [
    {
      id: 1,
      name: "The Iron Wolves",
      description: "A group of battle-hardened mercenaries seeking redemption in the northern kingdoms.",
      members: [
        { name: "Thrain Ironforge", class: "Fighter", level: 8, role: "Tank" },
        { name: "Lyra Moonwhisper", class: "Ranger", level: 7, role: "DPS" },
        { name: "Finn Lightbringer", class: "Cleric", level: 8, role: "Healer" },
        { name: "Zara Shadowstep", class: "Rogue", level: 7, role: "DPS" }
      ],
      status: "Active",
      lastSession: "2024-01-15"
    },
    {
      id: 2,
      name: "Arcane Scholars",
      description: "Young mages and scholars investigating ancient magical mysteries across the realm.",
      members: [
        { name: "Elias Starweaver", class: "Wizard", level: 6, role: "DPS" },
        { name: "Maya Frostborn", class: "Sorcerer", level: 5, role: "DPS" },
        { name: "Brother Marcus", class: "Cleric", level: 6, role: "Healer" },
        { name: "Kael Swiftarrow", class: "Ranger", level: 5, role: "DPS" }
      ],
      status: "Active",
      lastSession: "2024-01-12"
    },
    {
      id: 3,
      name: "The Crimson Tide",
      description: "Pirates and outcasts sailing the dangerous seas in search of legendary treasure.",
      members: [
        { name: "Captain Red", class: "Fighter", level: 9, role: "Tank" },
        { name: "Siren Melody", class: "Bard", level: 8, role: "Support" },
        { name: "Blackpowder Pete", class: "Artificer", level: 8, role: "DPS" },
        { name: "Silent Storm", class: "Monk", level: 8, role: "DPS" }
      ],
      status: "On Hiatus",
      lastSession: "2023-12-20"
    }
  ]

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "Tank": return <Shield className="h-4 w-4" />
      case "Healer": return <Heart className="h-4 w-4" />
      case "DPS": return <Sword className="h-4 w-4" />
      case "Support": return <Crown className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Tank": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Healer": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "DPS": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Support": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      default: return "bg-accent/20 text-accent border-accent/30"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            Adventuring Groups
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your three active adventuring parties
          </p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow">
          <Plus className="h-4 w-4 mr-2" />
          New Group
        </Button>
      </div>

      <div className="grid gap-6">
        {groups.map((group) => (
          <Card key={group.id} className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl text-foreground flex items-center gap-3">
                    <Users className="h-6 w-6 text-accent" />
                    {group.name}
                  </CardTitle>
                  <CardDescription className="mt-2 text-muted-foreground">
                    {group.description}
                  </CardDescription>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge 
                    variant={group.status === "Active" ? "default" : "secondary"}
                    className={group.status === "Active" ? "bg-accent text-accent-foreground" : ""}
                  >
                    {group.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Last: {group.lastSession}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {group.members.map((member, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted/70 transition-magical"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-foreground">{member.name}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getRoleColor(member.role)} border`}
                      >
                        <span className="flex items-center gap-1">
                          {getRoleIcon(member.role)}
                          {member.role}
                        </span>
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Level {member.level} {member.class}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" className="flex-1 border-accent/30 text-accent hover:bg-accent/10">
                  Edit Group
                </Button>
                <Button variant="outline" className="flex-1 border-primary/30 text-primary hover:bg-primary/10">
                  View Sessions
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default Groups