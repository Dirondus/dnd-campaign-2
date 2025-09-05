import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, MapPin, Building } from 'lucide-react'
import { LocationForm } from './forms/LocationForm'
import { loadFromSupabase, deleteFromSupabase } from '@/lib/supabase-storage'
import { toast } from 'sonner'

interface Location {
  id: string
  name: string
  type: string
  region_id: string | null
  description: string
  key_details: string
  background: string
  tags: string[]
  created_at: string
}

interface Region {
  id: string
  name: string
}

export function LocationsList() {
  const [locations, setLocations] = useState<Location[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLocations()
    loadRegions()
  }, [])

  const loadLocations = async () => {
    try {
      setIsLoading(true)
      const locationsData = await loadFromSupabase<Location>('locations')
      setLocations(locationsData)
    } catch (error) {
      console.error('Failed to load locations:', error)
      toast.error('Failed to load locations')
    } finally {
      setIsLoading(false)
    }
  }

  const loadRegions = async () => {
    try {
      const regionsData = await loadFromSupabase<Region>('regions')
      setRegions(regionsData)
    } catch (error) {
      console.error('Failed to load regions:', error)
    }
  }

  const handleCreateLocation = () => {
    setEditingLocation(null)
    setShowForm(true)
  }

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location)
    setShowForm(true)
  }

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm('Are you sure you want to delete this location?')) return
    
    try {
      await deleteFromSupabase('locations', locationId)
      setLocations(prev => prev.filter(l => l.id !== locationId))
      toast.success('Location deleted!')
    } catch (error) {
      console.error('Failed to delete location:', error)
      toast.error('Failed to delete location')
    }
  }

  const handleSaveLocation = (locationData: any) => {
    if (editingLocation) {
      setLocations(prev => prev.map(l => l.id === editingLocation.id ? { ...locationData, created_at: l.created_at } : l))
    } else {
      setLocations(prev => [{ ...locationData, created_at: new Date().toISOString() }, ...prev])
    }
    setShowForm(false)
    setEditingLocation(null)
  }

  const getRegionName = (regionId: string | null) => {
    if (!regionId) return 'No Region'
    const region = regions.find(r => r.id === regionId)
    return region?.name || 'Unknown Region'
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'city':
      case 'town':
      case 'village':
        return <Building className="w-4 h-4" />
      default:
        return <MapPin className="w-4 h-4" />
    }
  }

  // Group locations by region
  const locationsByRegion = locations.reduce((acc, location) => {
    const regionName = getRegionName(location.region_id)
    if (!acc[regionName]) {
      acc[regionName] = []
    }
    acc[regionName].push(location)
    return acc
  }, {} as Record<string, Location[]>)

  if (isLoading) {
    return <div className="text-center py-8">Loading locations...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Locations</h2>
          <p className="text-muted-foreground">Manage specific places and points of interest</p>
        </div>
        <Button onClick={handleCreateLocation} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Location
        </Button>
      </div>

      {Object.entries(locationsByRegion).map(([regionName, regionLocations]) => (
        <div key={regionName} className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">
            {regionName} ({regionLocations.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionLocations.map((location) => (
              <Card key={location.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(location.type)}
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditLocation(location)
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteLocation(location.id)
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Badge variant="outline" className="w-fit">
                    {location.type}
                  </Badge>
                </CardHeader>
                <CardContent onClick={() => setSelectedLocation(location)}>
                  {location.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {location.description}
                    </p>
                  )}
                  
                  {location.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {location.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {location.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{location.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {locations.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Locations Created</h3>
          <p>Start mapping your world by creating your first location.</p>
        </div>
      )}

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <LocationForm
            initialData={editingLocation || undefined}
            onSave={handleSaveLocation}
            onCancel={() => setShowForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={!!selectedLocation} onOpenChange={() => setSelectedLocation(null)}>
        <DialogContent className="max-w-2xl">
          {selectedLocation && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                {getTypeIcon(selectedLocation.type)}
                <h2 className="text-2xl font-bold">{selectedLocation.name}</h2>
                <Badge variant="outline">{selectedLocation.type}</Badge>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Region: {getRegionName(selectedLocation.region_id)}
              </div>
              
              {selectedLocation.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedLocation.description}</p>
                </div>
              )}
              
              {selectedLocation.key_details && (
                <div>
                  <h3 className="font-semibold mb-2">Key Details</h3>
                  <p className="text-muted-foreground">{selectedLocation.key_details}</p>
                </div>
              )}
              
              {selectedLocation.background && (
                <div>
                  <h3 className="font-semibold mb-2">Background & Notes</h3>
                  <p className="text-muted-foreground">{selectedLocation.background}</p>
                </div>
              )}
              
              {selectedLocation.tags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedLocation.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button onClick={() => handleEditLocation(selectedLocation)}>
                  Edit Location
                </Button>
                <Button variant="outline" onClick={() => setSelectedLocation(null)}>
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