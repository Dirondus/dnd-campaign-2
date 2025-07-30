import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

import { MapPin, Upload, X, Edit } from "lucide-react"
import { toast } from 'sonner'

interface Waypoint {
  id: string
  title: string
  description: string
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
  const [newWaypoint, setNewWaypoint] = useState({ title: '', description: '', x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const mapRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleMapClick = useCallback((e: React.MouseEvent) => {
    if (!isAddingWaypoint || !mapRef.current) return

    const rect = mapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left - pan.x) / zoom) / rect.width * 100
    const y = ((e.clientY - rect.top - pan.y) / zoom) / rect.height * 100

    setNewWaypoint(prev => ({ ...prev, x, y }))
  }, [isAddingWaypoint, zoom, pan])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isAddingWaypoint) return
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom(prev => Math.max(0.5, Math.min(3, prev * delta)))
  }

  const addWaypoint = () => {
    if (!newWaypoint.title.trim()) return
    
    const waypoint: Waypoint = {
      id: Date.now().toString(),
      title: newWaypoint.title,
      description: newWaypoint.description,
      x: newWaypoint.x,
      y: newWaypoint.y
    }
    
    setWaypoints(prev => [...prev, waypoint])
    setNewWaypoint({ title: '', description: '', x: 0, y: 0 })
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
    if (file && onMapUpload) {
      onMapUpload(file)
      toast.success('Map uploaded successfully!')
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
            onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
          >
            Zoom In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(prev => Math.max(0.5, prev * 0.8))}
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
        </div>
      </div>

      {/* Map Container */}
      <Card className="bg-gradient-card border-border shadow-deep">
        <CardContent className="p-0">
          <div 
            ref={mapRef}
            className="relative w-full h-96 bg-muted/30 border-2 border-dashed border-border rounded-lg overflow-hidden cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            onClick={handleMapClick}
          >
            {mapUrl ? (
              <div
                className="relative"
                style={{
                  transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                  transformOrigin: '0 0'
                }}
              >
                <img 
                  src={mapUrl} 
                  alt="Campaign Map" 
                  className="w-full h-full object-contain pointer-events-none"
                  draggable={false}
                />
                
                {/* Waypoints */}
                {waypoints.map((waypoint) => (
                  <div
                    key={waypoint.id}
                    className="absolute w-6 h-6 bg-accent rounded-full border-2 border-background shadow-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
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
                    <MapPin className="h-3 w-3 text-background" />
                  </div>
                ))}

                {/* New waypoint preview */}
                {isAddingWaypoint && newWaypoint.x > 0 && (
                  <div
                    className="absolute w-6 h-6 bg-primary rounded-full border-2 border-background shadow-lg flex items-center justify-center opacity-70"
                    style={{
                      left: `${newWaypoint.x}%`,
                      top: `${newWaypoint.y}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <MapPin className="h-3 w-3 text-background" />
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
              <p className="text-muted-foreground">{selectedWaypoint.description}</p>
              <div className="flex justify-between items-center">
                <Badge variant="outline">
                  Position: {selectedWaypoint.x.toFixed(1)}%, {selectedWaypoint.y.toFixed(1)}%
                </Badge>
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
                    <MapPin className="h-4 w-4 text-accent" />
                    <div>
                      <h4 className="font-medium text-foreground">{waypoint.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {waypoint.description}
                      </p>
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