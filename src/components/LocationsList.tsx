import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Plus, Edit, Trash2, MapPin, Building } from 'lucide-react'
import { LocationForm } from './forms/LocationForm'
import { loadFromSupabase, deleteFromSupabase } from '@/lib/supabase-storage'
import { toast } from 'sonner'
import { WaypointIcon } from './map/WaypointIconSelector'

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

interface Waypoint {
  id: string
  title: string
  description: string
  category: string
  x_position: number
  y_position: number
  map_id?: string
  created_at: string
}

export function LocationsList() {
  const [locations, setLocations] = useState<Location[]>([])
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadLocations()
    loadRegions()
    loadWaypoints()
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

  const loadWaypoints = async () => {
    try {
      const waypointsData = await loadFromSupabase<Waypoint>('waypoints')
      setWaypoints(waypointsData)
    } catch (error) {
      console.error('Failed to load waypoints:', error)
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

  const handleDeleteWaypoint = async (waypointId: string) => {
    if (!confirm('Are you sure you want to delete this waypoint?')) return
    
    try {
      await deleteFromSupabase('waypoints', waypointId)
      setWaypoints(prev => prev.filter(w => w.id !== waypointId))
      toast.success('Waypoint deleted!')
    } catch (error) {
      console.error('Failed to delete waypoint:', error)
      toast.error('Failed to delete waypoint')
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

  // Combine locations and waypoints, group by region/category
  const combinedItems = [
    ...locations.map(loc => ({ ...loc, itemType: 'location' as const })),
    ...waypoints.map(wp => ({ 
      id: wp.id, 
      name: wp.title, 
      type: wp.category, 
      region_id: null, 
      description: wp.description, 
      key_details: '', 
      background: '', 
      tags: [], 
      created_at: wp.created_at,
      itemType: 'waypoint' as const,
      isWaypoint: true
    }))
  ]

  const itemsByRegion = combinedItems.reduce((acc, item) => {
    const regionName = item.itemType === 'location' ? getRegionName(item.region_id) : 'Map Waypoints'
    if (!acc[regionName]) {
      acc[regionName] = []
    }
    acc[regionName].push(item)
    return acc
  }, {} as Record<string, typeof combinedItems>)

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

      {Object.entries(itemsByRegion).map(([regionName, regionItems]) => (
        <div key={regionName} className="space-y-4">
          <h3 className="text-lg font-semibold text-muted-foreground">
            {regionName} ({regionItems.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {regionItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {item.itemType === 'waypoint' ? (
                        <WaypointIcon category={item.type} size={16} />
                      ) : (
                        getTypeIcon(item.type)
                      )}
                      <CardTitle className="text-lg">{item.name}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      {item.itemType === 'location' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditLocation(item as Location)
                          }}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          if (item.itemType === 'location') {
                            handleDeleteLocation(item.id)
                          } else {
                            handleDeleteWaypoint(item.id)
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="w-fit">
                      {item.type}
                    </Badge>
                    {item.itemType === 'waypoint' && (
                      <Badge variant="secondary" className="w-fit text-xs">
                        Map Waypoint
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent onClick={() => {
                  if (item.itemType === 'location') {
                    setSelectedLocation(item as Location)
                  } else {
                    setSelectedWaypoint(waypoints.find(w => w.id === item.id) || null)
                  }
                }}>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  
                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {item.tags.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{item.tags.length - 3}
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

      {locations.length === 0 && waypoints.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-semibold mb-2">No Locations or Waypoints Created</h3>
          <p>Start mapping your world by creating locations or adding waypoints to the map.</p>
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

      {/* Waypoint Detail Dialog */}
      <Dialog open={!!selectedWaypoint} onOpenChange={() => setSelectedWaypoint(null)}>
        <DialogContent className="max-w-2xl">
          {selectedWaypoint && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <WaypointIcon category={selectedWaypoint.category} size={24} />
                <h2 className="text-2xl font-bold">{selectedWaypoint.title}</h2>
                <Badge variant="outline">{selectedWaypoint.category}</Badge>
                <Badge variant="secondary" className="text-xs">Map Waypoint</Badge>
              </div>
              
              {selectedWaypoint.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground">{selectedWaypoint.description}</p>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleDeleteWaypoint(selectedWaypoint.id)
                    setSelectedWaypoint(null)
                  }}
                >
                  Delete Waypoint
                </Button>
                <Button variant="outline" onClick={() => setSelectedWaypoint(null)}>
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