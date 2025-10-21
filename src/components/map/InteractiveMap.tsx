import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, ZoomIn, ZoomOut, RotateCcw, Plus, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { WaypointIcon, waypointCategories } from './WaypointIconSelector'
import { loadFromSupabase, saveToSupabase, deleteFromSupabase } from '@/lib/supabase-storage'
import { toast } from 'sonner'

interface Waypoint {
  id: string
  title: string
  description: string
  category: string
  x_position: number
  y_position: number
  map_id?: string
}

interface InteractiveMapProps {
  mapUrl?: string
  onMapUpload?: (file: File) => void
  mapLayers: { id: string; name: string; active: boolean; icon: any; color: string }[]
  onToggleLayer: (layerId: string) => void
}

export function InteractiveMap({ mapUrl, onMapUpload, mapLayers, onToggleLayer }: InteractiveMapProps) {
  const [currentMapUrl, setCurrentMapUrl] = useState(mapUrl)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, startX: 0, startY: 0 })
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false)
  const [showWaypointDialog, setShowWaypointDialog] = useState(false)
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null)
  const [newWaypoint, setNewWaypoint] = useState({ 
    title: '', 
    description: '', 
    category: 'location',
    x_position: 0, 
    y_position: 0 
  })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    loadWaypoints()
  }, [])

  const loadWaypoints = async () => {
    try {
      const waypointsData = await loadFromSupabase<Waypoint>('waypoints')
      setWaypoints(waypointsData)
    } catch (error) {
      console.error('Failed to load waypoints:', error)
    }
  }

  // Handle zoom with mouse wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.1, Math.min(scale * delta, 5))

    // Calculate new position to zoom towards mouse
    const newX = mouseX - (mouseX - position.x) * (newScale / scale)
    const newY = mouseY - (mouseY - position.y) * (newScale / scale)
    
    setScale(newScale)
    setPosition({ x: newX, y: newY })
  }, [scale, position])

  // Handle mouse events for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    
    if (isAddingWaypoint) {
      handleMapClick(e)
      return
    }
    
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y
    })
  }, [position, isAddingWaypoint])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current || !imageRef.current) return
    
    const container = containerRef.current.getBoundingClientRect()
    const imgNaturalWidth = imageRef.current.naturalWidth
    const imgNaturalHeight = imageRef.current.naturalHeight
    
    // Calculate scaled map dimensions
    const mapWidth = imgNaturalWidth * scale
    const mapHeight = imgNaturalHeight * scale
    
    // Calculate raw new position
    let newX = dragStart.startX + (e.clientX - dragStart.x)
    let newY = dragStart.startY + (e.clientY - dragStart.y)
    
    // Calculate boundaries
    // When map is larger than container, clamp so edges can't go past container edges
    // When map is smaller, center it or allow minimal movement
    const minX = mapWidth > container.width ? container.width - mapWidth : (container.width - mapWidth) / 2
    const maxX = mapWidth > container.width ? 0 : (container.width - mapWidth) / 2
    const minY = mapHeight > container.height ? container.height - mapHeight : (container.height - mapHeight) / 2
    const maxY = mapHeight > container.height ? 0 : (container.height - mapHeight) / 2
    
    // Clamp position to boundaries
    newX = Math.max(minX, Math.min(maxX, newX))
    newY = Math.max(minY, Math.min(maxY, newY))
    
    setPosition({ x: newX, y: newY })
  }, [isDragging, dragStart, scale])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Zoom control functions
  const handleZoomIn = () => {
    const newScale = Math.min(scale * 1.2, 5)
    setScale(newScale)
  }

  const handleZoomOut = () => {
    const newScale = Math.max(scale * 0.8, 0.1)
    setScale(newScale)
  }

  const handleResetView = () => {
    setScale(1)
    setPosition({ x: 0, y: 0 })
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setCurrentMapUrl(url)
      // Reset view when new image is uploaded
      setScale(1)
      setPosition({ x: 0, y: 0 })
      
      if (onMapUpload) {
        onMapUpload(file)
      }
    }
  }

  // Handle waypoint creation
  const handleMapClick = (e: React.MouseEvent) => {
    if (!isAddingWaypoint || !containerRef.current) return
    
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left - position.x) / scale) / rect.width * 100
    const y = ((e.clientY - rect.top - position.y) / scale) / rect.height * 100
    
    setNewWaypoint(prev => ({
      ...prev,
      x_position: x,
      y_position: y
    }))
    setShowWaypointDialog(true)
    setIsAddingWaypoint(false)
  }

  const handleWaypointSave = async () => {
    if (!newWaypoint.title.trim()) {
      toast.error('Waypoint title is required')
      return
    }

    try {
      const waypointData = await saveToSupabase('waypoints', newWaypoint)
      setWaypoints(prev => [...prev, waypointData as Waypoint])
      setShowWaypointDialog(false)
      setNewWaypoint({ title: '', description: '', category: 'location', x_position: 0, y_position: 0 })
      toast.success('Waypoint created!')
    } catch (error) {
      console.error('Failed to create waypoint:', error)
      toast.error('Failed to create waypoint')
    }
  }

  const handleWaypointClick = (waypoint: Waypoint, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedWaypoint(waypoint)
  }

  const handleWaypointDelete = async (waypointId: string) => {
    try {
      await deleteFromSupabase('waypoints', waypointId)
      setWaypoints(prev => prev.filter(w => w.id !== waypointId))
      setSelectedWaypoint(null)
      toast.success('Waypoint deleted!')
    } catch (error) {
      console.error('Failed to delete waypoint:', error)
      toast.error('Failed to delete waypoint')
    }
  }

  // Filter waypoints based on active layers
  const visibleWaypoints = waypoints.filter(waypoint => {
    const layer = mapLayers.find(l => l.id === waypoint.category)
    return layer?.active !== false
  })

  if (!currentMapUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-muted/20 rounded-lg border-2 border-dashed border-muted">
        <Upload className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
        <p className="text-muted-foreground mb-4">No map uploaded</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Upload Map
        </button>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-96 bg-background border border-border rounded-lg overflow-hidden"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: isDragging ? 'grabbing' : isAddingWaypoint ? 'crosshair' : 'grab' }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <img
        ref={imageRef}
        src={currentMapUrl}
        alt="Campaign Map"
        className="w-full h-full object-contain select-none pointer-events-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
        draggable={false}
      />
      
      {/* Render waypoints */}
      {visibleWaypoints.map((waypoint) => (
        <div
          key={waypoint.id}
          className="absolute z-20 cursor-pointer transform -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${waypoint.x_position}%`,
            top: `${waypoint.y_position}%`,
            transform: `translate(-50%, -50%) scale(${Math.max(0.5, Math.min(2, scale))})`
          }}
          onClick={(e) => handleWaypointClick(waypoint, e)}
        >
          <div className="bg-background/90 border border-border rounded-full p-2 shadow-lg hover:bg-background transition-colors">
            <WaypointIcon category={waypoint.category} size={20} />
          </div>
        </div>
      ))}
      
      {/* Control buttons */}
      <div className="absolute top-2 left-2 flex flex-col gap-2 z-30">
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomIn}
          className="bg-background/80 hover:bg-background"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleZoomOut}
          className="bg-background/80 hover:bg-background"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleResetView}
          className="bg-background/80 hover:bg-background"
        >
          <RotateCcw className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant={isAddingWaypoint ? "default" : "outline"}
          onClick={() => setIsAddingWaypoint(!isAddingWaypoint)}
          className="bg-background/80 hover:bg-background"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Upload button overlay */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute top-2 right-2 px-3 py-1 bg-background/80 border border-border rounded-md text-sm hover:bg-background transition-colors z-30"
      >
        Change Map
      </button>

      {/* Waypoint Creation Dialog */}
      <Dialog open={showWaypointDialog} onOpenChange={setShowWaypointDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Waypoint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                value={newWaypoint.title}
                onChange={(e) => setNewWaypoint(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Waypoint title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select 
                value={newWaypoint.category} 
                onValueChange={(value) => setNewWaypoint(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {waypointCategories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <cat.icon className={`w-4 h-4 ${cat.color}`} />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newWaypoint.description}
                onChange={(e) => setNewWaypoint(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Waypoint description"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleWaypointSave}>Create Waypoint</Button>
              <Button variant="outline" onClick={() => setShowWaypointDialog(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Waypoint Details Dialog */}
      <Dialog open={!!selectedWaypoint} onOpenChange={() => setSelectedWaypoint(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedWaypoint && (
                <>
                  <WaypointIcon category={selectedWaypoint.category} size={20} />
                  {selectedWaypoint.title}
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          {selectedWaypoint && (
            <div className="space-y-4">
              <div>
                <Badge variant="secondary">
                  {waypointCategories.find(cat => cat.value === selectedWaypoint.category)?.label}
                </Badge>
              </div>
              {selectedWaypoint.description && (
                <div>
                  <h4 className="font-medium text-sm mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedWaypoint.description}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleWaypointDelete(selectedWaypoint.id)}
                >
                  Delete Waypoint
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedWaypoint(null)}>
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