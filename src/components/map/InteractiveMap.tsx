import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { waypointCategories, WaypointIcon } from "./WaypointIconSelector"

import { MapPin, Upload, X, Edit, Trash2 } from "lucide-react"
import { toast } from 'sonner'

interface Waypoint {
  id: string
  title: string
  description: string
  category: string
  x: number
  y: number
}

interface InteractiveMapProps {
  mapUrl?: string
  onMapUpload?: (file: File) => void
}

export function InteractiveMap({ mapUrl, onMapUpload }: InteractiveMapProps) {
  const [waypoints, setWaypoints] = useState<Waypoint[]>([])
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint | null>(null)
  const [isAddingWaypoint, setIsAddingWaypoint] = useState(false)
  const [newWaypoint, setNewWaypoint] = useState({ title: '', description: '', category: 'location', x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [currentMapUrl, setCurrentMapUrl] = useState(mapUrl)
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const mapRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleMapClick = useCallback((e: React.MouseEvent) => {
    if (!isAddingWaypoint || !mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left - pan.x) / zoom) / rect.width * 100
    const y = ((e.clientY - rect.top - pan.y) / zoom) / rect.height * 100

    setNewWaypoint(prev => ({ ...prev, x, y }))
  }, [isAddingWaypoint, zoom, pan])

  // Constrain panning to keep image within bounds
  const constrainPan = useCallback((newPan: { x: number, y: number }) => {
    if (!mapRef.current || !imageDimensions.width) return newPan
    
    const container = mapRef.current.getBoundingClientRect()
    const scaledWidth = imageDimensions.width * zoom
    const scaledHeight = imageDimensions.height * zoom
    
    const maxPanX = Math.max(0, scaledWidth - container.width)
    const maxPanY = Math.max(0, scaledHeight - container.height)
    
    return {
      x: Math.max(-maxPanX, Math.min(0, newPan.x)),
      y: Math.max(-maxPanY, Math.min(0, newPan.y))
    }
  }, [zoom, imageDimensions])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAddingWaypoint) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const newPan = {
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    }
    setPan(constrainPan(newPan))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newZoom = Math.max(0.3, Math.min(5, zoom * delta))
    setZoom(newZoom)
    
    // Adjust pan to keep zoom centered
    const rect = mapRef.current?.getBoundingClientRect()
    if (rect) {
      const centerX = rect.width / 2
      const centerY = rect.height / 2
      const newPan = {
        x: centerX - (centerX - pan.x) * (newZoom / zoom),
        y: centerY - (centerY - pan.y) * (newZoom / zoom)
      }
      setPan(constrainPan(newPan))
    }
  }

  const addWaypoint = () => {
    if (!newWaypoint.title.trim()) return
    
    const waypoint: Waypoint = {
      id: Date.now().toString(),
      title: newWaypoint.title,
      description: newWaypoint.description,
      category: newWaypoint.category,
      x: newWaypoint.x,
      y: newWaypoint.y
    }
    
    setWaypoints(prev => [...prev, waypoint])
    setNewWaypoint({ title: '', description: '', category: 'location', x: 0, y: 0 })
    setIsAddingWaypoint(false)
    toast.success('Waypoint added!')
  }

  const deleteWaypoint = (id: string) => {
    setWaypoints(prev => prev.filter(w => w.id !== id))
    setSelectedWaypoint(null)
    toast.success('Waypoint removed!')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string
        setCurrentMapUrl(imageUrl)
        
        // Get image dimensions
        const img = new Image()
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height })
          setZoom(1)
          setPan({ x: 0, y: 0 })
        }
        img.src = imageUrl
        
        toast.success('Map uploaded successfully!')
      }
      reader.readAsDataURL(file)
      if (onMapUpload) {
        onMapUpload(file)
      }
    } else {
      toast.error('Please upload a valid image file!')
    }
  }

  return (
    <div className="space-y-4">
      {/* Map Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newZoom = Math.min(5, zoom * 1.2)
              setZoom(newZoom)
              setPan(constrainPan(pan))
            }}
          >
            Zoom In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newZoom = Math.max(0.3, zoom * 0.8)
              setZoom(newZoom)
              setPan(constrainPan(pan))
            }}
          >
            Zoom Out
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }}
          >
            Reset View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAddingWaypoint(!isAddingWaypoint)}
            className={isAddingWaypoint ? "bg-primary text-primary-foreground" : ""}
          >
            {isAddingWaypoint ? "Cancel Waypoint" : "Add Waypoint"}
          </Button>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            {currentMapUrl ? "Change Map" : "Upload Map"}
          </Button>
        </div>
      </div>

      {/* Map Container */}
      <Card className="bg-gradient-card border-border shadow-deep">
        <CardContent className="p-0">
          <div 
            ref={mapRef}
            className="relative w-full h-[600px] bg-muted/30 border-2 border-dashed border-border rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onClick={handleMapClick}
          >
            {currentMapUrl ? (
              <div
                className="relative"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '0 0'
                }}
              >
                <img 
                  src={currentMapUrl} 
                  alt="Campaign Map" 
                  className="w-full h-full object-contain pointer-events-none"
                  draggable={false}
                />
                
                {/* Waypoints */}
                {waypoints.map((waypoint) => (
                  <div
                    key={waypoint.id}
                    className="absolute w-8 h-8 bg-background rounded-full border-2 border-accent shadow-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
                    style={{
                      left: `${waypoint.x}%`,
                      top: `${waypoint.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedWaypoint(waypoint)
                    }}
                  >
                    <WaypointIcon category={waypoint.category} size={20} />
                  </div>
                ))}

                {/* New waypoint preview */}
                {isAddingWaypoint && newWaypoint.x > 0 && (
                  <div
                    className="absolute w-8 h-8 bg-primary rounded-full border-2 border-background shadow-lg flex items-center justify-center opacity-70"
                    style={{
                      left: `${newWaypoint.x}%`,
                      top: `${newWaypoint.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <WaypointIcon category={newWaypoint.category} size={20} className="text-background" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Upload className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Map Uploaded</h3>
                  <p className="text-muted-foreground mb-4">
                    No map has been uploaded yet
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Waypoint Info Dialog */}
      {selectedWaypoint && (
        <Dialog open={!!selectedWaypoint} onOpenChange={() => setSelectedWaypoint(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                {selectedWaypoint.title}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <WaypointIcon category={selectedWaypoint.category} size={24} />
                <Badge variant="secondary">{waypointCategories.find(c => c.value === selectedWaypoint.category)?.label}</Badge>
              </div>
              <p className="text-muted-foreground">{selectedWaypoint.description}</p>
              <div className="flex justify-between items-center">
                <Badge variant="outline">
                  Position: {selectedWaypoint.x.toFixed(1)}%, {selectedWaypoint.y.toFixed(1)}%
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => deleteWaypoint(selectedWaypoint.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Waypoint Dialog */}
      {isAddingWaypoint && newWaypoint.x > 0 && (
        <Dialog open={true} onOpenChange={() => setIsAddingWaypoint(false)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Waypoint</DialogTitle>
              <DialogDescription>
                Create a new waypoint at the selected location
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={newWaypoint.category} 
                  onValueChange={(value) => setNewWaypoint(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {waypointCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <WaypointIcon category={category.value} size={16} />
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newWaypoint.title}
                  onChange={(e) => setNewWaypoint(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter waypoint title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newWaypoint.description}
                  onChange={(e) => setNewWaypoint(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this location..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingWaypoint(false)}>
                  Cancel
                </Button>
                <Button onClick={addWaypoint} disabled={!newWaypoint.title.trim()}>
                  Add Waypoint
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Waypoints List */}
      {waypoints.length > 0 && (
        <Card className="bg-gradient-card border-border shadow-deep">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Waypoints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {waypoints.map((waypoint) => (
                <div
                  key={waypoint.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors cursor-pointer"
                  onClick={() => setSelectedWaypoint(waypoint)}
                >
                  <div className="flex items-center gap-3">
                    <WaypointIcon category={waypoint.category} size={20} />
                    <div>
                      <h4 className="font-medium text-foreground">{waypoint.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {waypoint.description}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {waypointCategories.find(c => c.value === waypoint.category)?.label}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}