import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Scroll, Landmark, Globe, Crown } from "lucide-react"

const Lore = () => {
  const loreCategories = [
    {
      title: "Kingdoms & Nations",
      icon: Crown,
      count: 5,
      description: "Political entities and their histories",
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      entries: [
        "The Northern Kingdom of Valdris",
        "The Maritime Republic of Coralis", 
        "The Desert Emirates of Qadesh"
      ]
    },
    {
      title: "Ancient History",
      icon: Scroll,
      count: 8,
      description: "Events that shaped the world",
      color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      entries: [
        "The Great Sundering",
        "War of the Five Crowns",
        "The Dragon Wars"
      ]
    },
    {
      title: "Locations & Places",
      icon: Landmark,
      count: 12,
      description: "Important cities, dungeons, and landmarks",
      color: "bg-green-500/20 text-green-400 border-green-500/30",
      entries: [
        "The Floating City of Aerion",
        "Darkwood Forest",
        "The Sunken Temple of Tides"
      ]
    },
    {
      title: "World Mechanics",
      icon: Globe,
      count: 3,
      description: "Magic systems, cosmology, and natural laws",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      entries: [
        "The Weave and Magic",
        "Planar Geography",
        "Divine Pantheon"
      ]
    }
  ]

  const recentEntries = [
    {
      title: "The Whispering Woods",
      category: "Locations",
      summary: "A haunted forest where trees remember ancient secrets and speak to those who listen...",
      lastUpdated: "2024-01-15"
    },
    {
      title: "Order of the Silver Dawn",
      category: "Organizations", 
      summary: "A secretive order of paladins dedicated to protecting the realm from otherworldly threats...",
      lastUpdated: "2024-01-12"
    },
    {
      title: "The Convergence War",
      category: "History",
      summary: "The devastating conflict when multiple planes of existence briefly merged...",
      lastUpdated: "2024-01-10"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            World Lore & Knowledge
          </h1>
          <p className="text-muted-foreground mt-2">
            The comprehensive guide to your campaign world
          </p>
        </div>
        <Button className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow">
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loreCategories.map((category) => (
          <Card key={category.title} className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer group">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-lg ${category.color} border`}>
                  <category.icon className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-accent border-accent/30">
                  {category.count}
                </Badge>
              </div>
              <CardTitle className="text-lg text-foreground group-hover:text-accent transition-magical">
                {category.title}
              </CardTitle>
              <CardDescription className="text-muted-foreground text-sm">
                {category.description}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Recent Entries */}
      <Card className="bg-gradient-card border-border shadow-deep">
        <CardHeader>
          <CardTitle className="text-xl text-accent flex items-center gap-3">
            <BookOpen className="h-6 w-6" />
            Recent Entries
          </CardTitle>
          <CardDescription>
            Latest additions to your world's knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentEntries.map((entry, index) => (
            <div 
              key={index}
              className="p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted/70 transition-magical cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-foreground hover:text-accent transition-magical">
                  {entry.title}
                </h4>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {entry.category}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {entry.lastUpdated}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {entry.summary}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer">
          <CardContent className="p-6 text-center">
            <Scroll className="h-8 w-8 text-accent mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Timeline Builder</h3>
            <p className="text-sm text-muted-foreground">Create chronological events</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer">
          <CardContent className="p-6 text-center">
            <Globe className="h-8 w-8 text-accent mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">World Builder</h3>
            <p className="text-sm text-muted-foreground">Design locations and regions</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer">
          <CardContent className="p-6 text-center">
            <BookOpen className="h-8 w-8 text-accent mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Lore Generator</h3>
            <p className="text-sm text-muted-foreground">AI-assisted world building</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Lore