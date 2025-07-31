import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Scroll, Landmark, Globe, Crown, Clock, Layers } from "lucide-react"
import { LoreForm } from "@/components/forms/LoreForm"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

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

  const [loreEntries, setLoreEntries] = useState([
    {
      id: 1,
      title: "The Whispering Woods",
      category: "Locations",
      summary: "A haunted forest where trees remember ancient secrets and speak to those who listen...",
      lastUpdated: "2024-01-15",
      content: "The Whispering Woods stretch for hundreds of miles across the northern border...",
      tags: ["forest", "haunted", "ancient", "secrets"]
    },
    {
      id: 2,
      title: "Order of the Silver Dawn",
      category: "Organizations", 
      summary: "A secretive order of paladins dedicated to protecting the realm from otherworldly threats...",
      lastUpdated: "2024-01-12",
      content: "Founded three centuries ago after the first planar incursion...",
      tags: ["order", "paladins", "protection", "secret"]
    },
    {
      id: 3,
      title: "The Convergence War",
      category: "History",
      summary: "The devastating conflict when multiple planes of existence briefly merged...",
      lastUpdated: "2024-01-10",
      content: "The Convergence War began when arcane experiments went catastrophically wrong...",
      tags: ["war", "planes", "convergence", "catastrophe"]
    }
  ])

  const [loreFormOpen, setLoreFormOpen] = useState(false)
  const [timelineBuilderOpen, setTimelineBuilderOpen] = useState(false)
  const [worldBuilderOpen, setWorldBuilderOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<any>(null)

  const handleCreateEntry = (entryData: any) => {
    setLoreEntries(prev => [...prev, entryData])
  }

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry)
    setLoreFormOpen(true)
  }

  const handleUpdateEntry = (updatedEntry: any) => {
    setLoreEntries(prev => prev.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ))
    setEditingEntry(null)
  }

  const filteredEntries = selectedCategory 
    ? loreEntries.filter(entry => entry.category === selectedCategory)
    : loreEntries

  const getCategoryEntries = (categoryTitle: string) => {
    return loreEntries.filter(entry => entry.category === categoryTitle || 
      (categoryTitle === "Kingdoms & Nations" && entry.category === "Kingdoms") ||
      (categoryTitle === "Locations & Places" && entry.category === "Locations"))
  }

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
        <Button 
          onClick={() => setLoreFormOpen(true)}
          className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Categories Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loreCategories.map((category) => {
          const categoryEntries = getCategoryEntries(category.title)
          return (
            <Card 
              key={category.title} 
              className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer group"
              onClick={() => setSelectedCategory(selectedCategory === category.title ? null : category.title)}
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${category.color} border`}>
                    <category.icon className="h-6 w-6" />
                  </div>
                  <Badge variant="outline" className="text-accent border-accent/30">
                    {categoryEntries.length}
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
          )
        })}
      </div>

      {/* Filtered Entries */}
      <Card className="bg-gradient-card border-border shadow-deep">
        <CardHeader>
          <CardTitle className="text-xl text-accent flex items-center gap-3">
            <BookOpen className="h-6 w-6" />
            {selectedCategory ? `${selectedCategory} Entries` : 'Recent Entries'}
          </CardTitle>
          <CardDescription>
            {selectedCategory 
              ? `All entries in the ${selectedCategory} category`
              : "Latest additions to your world's knowledge base"
            }
          </CardDescription>
          {selectedCategory && (
            <Button 
              onClick={() => setSelectedCategory(null)}
              variant="outline" 
              size="sm"
            >
              Show All Categories
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {selectedCategory ? `No entries in ${selectedCategory}` : 'No lore entries yet'}
              </p>
              <Button 
                onClick={() => setLoreFormOpen(true)}
                variant="outline" 
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Entry
              </Button>
            </div>
          ) : (
            filteredEntries.map((entry, index) => (
              <div 
                key={entry.id}
                className="p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted/70 transition-magical cursor-pointer"
                onClick={() => handleEditEntry(entry)}
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
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {entry.summary}
                </p>
                {entry.tags && (
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag: string, tagIndex: number) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card 
          className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer"
          onClick={() => setTimelineBuilderOpen(true)}
        >
          <CardContent className="p-6 text-center">
            <Clock className="h-8 w-8 text-accent mx-auto mb-3" />
            <h3 className="font-semibold text-foreground mb-2">Timeline Builder</h3>
            <p className="text-sm text-muted-foreground">Create chronological events</p>
          </CardContent>
        </Card>
        
        <Card 
          className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical cursor-pointer"
          onClick={() => setWorldBuilderOpen(true)}
        >
          <CardContent className="p-6 text-center">
            <Layers className="h-8 w-8 text-accent mx-auto mb-3" />
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

      <LoreForm
        open={loreFormOpen}
        onOpenChange={(open) => {
          setLoreFormOpen(open)
          if (!open) setEditingEntry(null)
        }}
        onSubmit={editingEntry ? handleUpdateEntry : handleCreateEntry}
        entry={editingEntry}
      />

      {/* Timeline Builder Dialog */}
      <Dialog open={timelineBuilderOpen} onOpenChange={setTimelineBuilderOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Clock className="h-6 w-6 text-accent" />
              Timeline Builder
            </DialogTitle>
            <DialogDescription>
              Create and manage chronological events in your world's history
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-12">
              <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">Timeline Builder</h3>
              <p className="text-muted-foreground mb-6">
                Create chronological events and build your world's history timeline.
              </p>
              <Button className="bg-gradient-primary text-primary-foreground" onClick={() => toast.success("Timeline Builder coming soon!")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Historical Event
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* World Builder Dialog */}
      <Dialog open={worldBuilderOpen} onOpenChange={setWorldBuilderOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <Layers className="h-6 w-6 text-accent" />
              World Builder
            </DialogTitle>
            <DialogDescription>
              Design locations, regions, and world features
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center py-12">
              <Layers className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">World Builder</h3>
              <p className="text-muted-foreground mb-6">
                Create detailed locations, regions, and geographical features for your world.
              </p>
              <Button className="bg-gradient-primary text-primary-foreground" onClick={() => toast.success("World Builder coming soon!")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Lore