import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, MapPin, Crown } from 'lucide-react'
import { RegionForm } from './forms/RegionForm'
import { loadFromSupabase, deleteFromSupabase } from '@/lib/supabase-storage'
import { toast } from 'sonner'

interface Region {
  id: string
  name: string
  category: string
  description: string
  history: string
  notable_features: string
  tags: string[]
  created_at: string
}

export function RegionsList() {
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingRegion, setEditingRegion] = useState<Region | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadRegions()
  }, [])

  const loadRegions = async () => {
    try {
      setIsLoading(true)
      const regionsData = await loadFromSupabase<Region>('regions')
      setRegions(regionsData)
    } catch (error) {
      console.error('Failed to load regions:', error)
      toast.error('Failed to load regions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRegion = () => {
    setEditingRegion(null)
    setShowForm(true)
  }

  const handleEditRegion = (region: Region) => {
    setEditingRegion(region)
    setShowForm(true)
  }

  const handleDeleteRegion = async (regionId: string) => {
    if (!confirm('Are you sure you want to delete this region?')) return
    
    try {
      await deleteFromSupabase('regions', regionId)
      setRegions(prev => prev.filter(r => r.id !== regionId))
      toast.success('Region deleted!')
    } catch (error) {
      console.error('Failed to delete region:', error)
      toast.error('Failed to delete region')
    }
  }

  const handleSaveRegion = (regionData: any) => {
    if (editingRegion) {
      setRegions(prev => prev.map(r => r.id === editingRegion.id ? { ...regionData, created_at: r.created_at } : r))
    } else {
      setRegions(prev => [{ ...regionData, created_at: new Date().toISOString() }, ...prev])
    }
    setShowForm(false)
    setEditingRegion(null)
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'kingdom':
      case 'empire':
        return <Crown className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return <div className="text-center py-8">Loading regions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Regions</h2>
          <p className="text-muted-foreground">Manage the major regions of your world</p>
        </div>
        <Button onClick={handleCreateRegion} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Region
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regions.map((region) => (
          <Card key={region.id} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(region.category)}
                  <CardTitle className="text-lg">{region.name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditRegion(region)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteRegion(region.id)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Badge variant="outline" className="w-fit">
                {region.category}
              </Badge>
            </CardHeader>
            <CardContent onClick={() => setSelectedRegion(region)}>
              {region.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {region.description}
                </p>
              )}
              
              {region.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {region.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {region.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{region.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {regions.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Regions Created</h3>
          <p>Start building your world by creating your first region.</p>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <RegionForm
            initialData={editingRegion || undefined}
            onSave={handleSaveRegion}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedRegion} onOpenChange={() => setSelectedRegion(null)}>
        <DialogContent className="max-w-2xl">
          {selectedRegion && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                {getCategoryIcon(selectedRegion.category)}
                <h2 className="text-2xl font-bold">{selectedRegion.name}</h2>
                <Badge variant="outline">{selectedRegion.category}</Badge>
              </div>
              
              {selectedRegion.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedRegion.description}</p>
                </div>
              )}
              
              {selectedRegion.history && (
                <div>
                  <h3 className="font-semibold mb-2">History & Background</h3>
                  <p className="text-muted-foreground">{selectedRegion.history}</p>
                </div>
              )}
              
              {selectedRegion.notable_features && (
                <div>
                  <h3 className="font-semibold mb-2">Notable Features</h3>
                  <p className="text-muted-foreground">{selectedRegion.notable_features}</p>
                </div>
              )}
              
              {selectedRegion.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedRegion.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={() => handleEditRegion(selectedRegion)}>
                  Edit Region
                </Button>
                <Button variant="outline" onClick={() => setSelectedRegion(null)}>
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