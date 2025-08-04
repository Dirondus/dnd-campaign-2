import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Plus, Scroll, Landmark, Globe, Crown, Clock, Layers, Trash2 } from "lucide-react"
import { SectionSearch } from "@/components/search/SectionSearch"
import { LoreForm } from "@/components/forms/LoreForm"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

const Lore = () => {
  const loreCategories = [
    {
      title: "Kingdoms & Nations",
      icon: Crown,
      description: "Political entities and their histories",
      color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    },
    {
      title: "Ancient History",
      icon: Scroll,
      description: "Events that shaped the world",
      color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    },
    {
      title: "Locations & Places",
      icon: Landmark,
      description: "Important cities, dungeons, and landmarks",
      color: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    {
      title: "World Mechanics",
      icon: Globe,
      description: "Magic systems, cosmology, and natural laws",
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    }
  ]

  const [loreEntries, setLoreEntries] = useState<any[]>([])
  const [filteredEntries, setFilteredEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [loreFormOpen, setLoreFormOpen] = useState(false)
  const [timelineBuilderOpen, setTimelineBuilderOpen] = useState(false)
  const [worldBuilderOpen, setWorldBuilderOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [editingEntry, setEditingEntry] = useState<any>(null)

  useEffect(() => {
    fetchLoreEntries()
  }, [])

  const fetchLoreEntries = async () => {
    try {
      const { data, error } = await supabase
        .from('lore_entries')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) throw error
      setLoreEntries(data || [])
      setFilteredEntries(data || [])
    } catch (error: any) {
      toast.error('Failed to load lore entries: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEntry = async (entryData: any) => {
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        toast.error('You must be logged in to create lore entries')
        return
      }

      const { data, error } = await supabase
        .from('lore_entries')
        .insert([{
          title: entryData.title,
          category: entryData.category,
          summary: entryData.summary,
          content: entryData.content,
          tags: entryData.tags || [],
          created_by: user.data.user.id
        }])
        .select()
        .single()

      if (error) throw error
      setLoreEntries(prev => [data, ...prev])
      toast.success('Lore entry created successfully!')
    } catch (error: any) {
      toast.error('Failed to create lore entry: ' + error.message)
    }
  }

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry)
    setLoreFormOpen(true)
  }

  const handleUpdateEntry = async (updatedEntry: any) => {
    try {
      const currentUser = await supabase.auth.getUser()
      console.log('Current user ID:', currentUser.data.user?.id)
      console.log('Updating lore entry with ID:', updatedEntry.id)
      console.log('Update data:', updatedEntry)
      
      const { data, error } = await supabase
        .from('lore_entries')
        .update({
          title: updatedEntry.title,
          category: updatedEntry.category,
          summary: updatedEntry.summary,
          content: updatedEntry.content,
          tags: updatedEntry.tags || []
        })
        .eq('id', updatedEntry.id)
        .select()
        .maybeSingle()

      console.log('Supabase response - data:', data, 'error:', error)
      
      if (error) throw error
      if (!data) throw new Error('No record found to update')
      setLoreEntries(prev => prev.map(entry => 
        entry.id === updatedEntry.id ? data : entry
      ))
      setEditingEntry(null)
      toast.success('Lore entry updated successfully!')
    } catch (error: any) {
      console.error('Lore update error:', error)
      toast.error('Failed to update lore entry: ' + error.message)
    }
  }

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this lore entry?')) return

    try {
      const { error } = await supabase
        .from('lore_entries')
        .delete()
        .eq('id', entryId)

      if (error) throw error
      setLoreEntries(prev => prev.filter(entry => entry.id !== entryId))
      toast.success('Lore entry deleted successfully!')
    } catch (error: any) {
      toast.error('Failed to delete lore entry: ' + error.message)
    }
  }


  const getCategoryEntries = (categoryTitle: string) => {
    return loreEntries.filter(entry => entry.category === categoryTitle || 
      (categoryTitle === "Kingdoms & Nations" && entry.category === "Kingdoms") ||
      (categoryTitle === "Locations & Places" && entry.category === "Locations"))
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
            World Lore & Knowledge
          </h1>
          <p className="text-muted-foreground mt-2">
            The comprehensive guide to your campaign world
          </p>
        </div>
        <div className="flex gap-4 items-center">
          <SectionSearch 
            data={selectedCategory ? loreEntries.filter(entry => entry.category === selectedCategory) : loreEntries}
            onFilter={setFilteredEntries}
            searchFields={['title', 'content', 'summary', 'tags']}
            placeholder="Search lore entries..."
          />
          <Button 
            onClick={() => setLoreFormOpen(true)}
            className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>
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
            filteredEntries.map((entry) => (
              <div 
                key={entry.id}
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
                      {new Date(entry.updated_at).toLocaleDateString()}
                    </span>
                    <div className="flex gap-1">
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditEntry(entry)
                        }}
                        variant="outline" 
                        size="sm" 
                        className="h-6 w-6 p-0 border-accent/30 text-accent hover:bg-accent/10"
                      >
                        ✏
                      </Button>
                      <Button 
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteEntry(entry.id)
                        }}
                        variant="outline" 
                        size="sm" 
                        className="h-6 w-6 p-0 text-destructive border-destructive/30 hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-2">
                  {entry.summary}
                </p>
                {entry.tags && entry.tags.length > 0 && (
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