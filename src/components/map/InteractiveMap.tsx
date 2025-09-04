import { useState, useRef, useCallback, useEffect } from 'react'
import { WaypointIconSelector, waypointCategories } from './WaypointIconSelector'
import { Upload, ZoomIn, ZoomOut, RotateCcw, MapPin, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface InteractiveMapProps {
  mapUrl?: string
  onMapUpload?: (file: File) => void
}

const MAP_BORDER_SIZE = 2000 // Fixed border size

export function InteractiveMap({ mapUrl, onMapUpload }: InteractiveMapProps) {
  const [currentMapUrl, setCurrentMapUrl] = useState(mapUrl)
  const [waypoints, setWaypoints] = useState<any[]>([])
  const [selectedWaypointType, setSelectedWaypointType] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, startX: 0, startY: 0 })
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 })
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 })
  const [isWaypointDialogOpen, setIsWaypointDialogOpen] = useState(false)
  const [newWaypointData, setNewWaypointData] = useState({ 
    title: '', 
    description: '', 
    category: '', 
    x: 0, 
    y: 0 
  })

  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update container dimensions on resize
  useEffect(() => {
    const updateContainerSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerDimensions({ width: rect.width, height: rect.height })
      }
    }

    updateContainerSize()
    window.addEventListener('resize', updateContainerSize)
    return () => window.removeEventListener('resize', updateContainerSize)
  }, [])

  // Calculate scale to fit container completely
  const calculateFitScale = useCallback(() => {
    if (!imageDimensions.width || !imageDimensions.height || !containerDimensions.width || !containerDimensions.height) {
      return 1
    }

    // Use Math.min to ensure entire image fits within container
    const scaleX = containerDimensions.width / imageDimensions.width
    const scaleY = containerDimensions.height / imageDimensions.height
    return Math.min(scaleX, scaleY) // Fit entire image within container
  }, [imageDimensions, containerDimensions])

  // Handle image load with proper fitting within container
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const img = imageRef.current
      // Use actual image dimensions
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
      
      // Calculate scale to fit entire image within container
      const scaleX = containerDimensions.width / img.naturalWidth
      const scaleY = containerDimensions.height / img.naturalHeight
      const fitScale = Math.min(scaleX, scaleY) // Fit entire image within container
      setScale(fitScale)
      
      // Center the image
      const scaledWidth = img.naturalWidth * fitScale
      const scaledHeight = img.naturalHeight * fitScale
      setPosition({
        x: (containerDimensions.width - scaledWidth) / 2,
        y: (containerDimensions.height - scaledHeight) / 2
      })
    }
  }, [containerDimensions])

  // Constrain movement to keep image within bounds
  const constrainPosition = useCallback((newX: number, newY: number, currentScale: number) => {
    if (!imageDimensions.width || !imageDimensions.height || !containerDimensions.width || !containerDimensions.height) {
      return { x: newX, y: newY }
    }

    const scaledWidth = imageDimensions.width * currentScale
    const scaledHeight = imageDimensions.height * currentScale
    
    // Calculate constraints to keep at least 100px of image visible on each side
    const minVisibleArea = 100
    const maxX = containerDimensions.width - minVisibleArea
    const minX = minVisibleArea - scaledWidth
    const maxY = containerDimensions.height - minVisibleArea  
    const minY = minVisibleArea - scaledHeight
    
    return {
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY))
    }
  }, [imageDimensions, containerDimensions])

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top

    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const fitScale = calculateFitScale()
    const newScale = Math.max(fitScale * 0.1, Math.min(scale * delta, fitScale * 10)) // Much wider zoom range

    // Calculate new position to zoom towards mouse with constraints
    const newX = mouseX - (mouseX - position.x) * (newScale / scale)
    const newY = mouseY - (mouseY - position.y) * (newScale / scale)
    
    const constrainedPosition = constrainPosition(newX, newY, newScale)
    
    setScale(newScale)
    setPosition(constrainedPosition)
  }, [scale, position, calculateFitScale, constrainPosition])

  // Handle mouse events for dragging
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return
    setIsDragging(true)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      startX: position.x,
      startY: position.y
    })
  }, [position])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    
    const newX = dragStart.startX + (e.clientX - dragStart.x)
    const newY = dragStart.startY + (e.clientY - dragStart.y)
    
    // Apply constraints to keep image within bounds
    const constrainedPosition = constrainPosition(newX, newY, scale)
    setPosition(constrainedPosition)
  }, [isDragging, dragStart, scale, constrainPosition])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Zoom control functions
  const handleZoomIn = () => {
    const fitScale = calculateFitScale()
    const newScale = Math.min(scale * 1.2, fitScale * 10)
    
    // Zoom towards center with constraints
    const centerX = containerDimensions.width / 2
    const centerY = containerDimensions.height / 2
    const newX = centerX - (centerX - position.x) * (newScale / scale)
    const newY = centerY - (centerY - position.y) * (newScale / scale)
    
    const constrainedPosition = constrainPosition(newX, newY, newScale)
    
    setScale(newScale)
    setPosition(constrainedPosition)
  }

  const handleZoomOut = () => {
    const fitScale = calculateFitScale()
    const newScale = Math.max(scale * 0.8, fitScale * 0.1)
    
    // Zoom towards center with constraints
    const centerX = containerDimensions.width / 2
    const centerY = containerDimensions.height / 2
    const newX = centerX - (centerX - position.x) * (newScale / scale)
    const newY = centerY - (centerY - position.y) * (newScale / scale)
    
    const constrainedPosition = constrainPosition(newX, newY, newScale)
    
    setScale(newScale)
    setPosition(constrainedPosition)
  }

  const handleResetView = () => {
    if (imageDimensions.width && imageDimensions.height && containerDimensions.width && containerDimensions.height) {
      // Reset to fit entire image within view
      const scaleX = containerDimensions.width / imageDimensions.width
      const scaleY = containerDimensions.height / imageDimensions.height
      const fitScale = Math.min(scaleX, scaleY)
      setScale(fitScale)
      
      // Center the image
      const scaledWidth = imageDimensions.width * fitScale
      const scaledHeight = imageDimensions.height * fitScale
      setPosition({
        x: (containerDimensions.width - scaledWidth) / 2,
        y: (containerDimensions.height - scaledHeight) / 2
      })
    }
  }

  // Handle map click for waypoint placement
  const handleMapClick = useCallback((e: React.MouseEvent) => {
    if (isDragging || !currentMapUrl || !selectedWaypointType) return

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    // Calculate relative position within the image
    const clickX = e.clientX - rect.left
    const clickY = e.clientY - rect.top
    
    // Convert to image coordinates
    const imageX = (clickX - position.x) / scale
    const imageY = (clickY - position.y) / scale
    
    // Convert to percentage for storage
    const xPercent = (imageX / imageDimensions.width) * 100
    const yPercent = (imageY / imageDimensions.height) * 100

    // Only place if within image bounds
    if (xPercent >= 0 && xPercent <= 100 && yPercent >= 0 && yPercent <= 100) {
      // Store coordinates and open dialog
      setNewWaypointData({
        title: '',
        description: '',
        category: selectedWaypointType,
        x: xPercent,
        y: yPercent
      })
      setIsWaypointDialogOpen(true)
      setSelectedWaypointType(null)
    }
  }, [isDragging, currentMapUrl, selectedWaypointType, position, scale])

  // Handle waypoint creation
  const handleCreateWaypoint = () => {
    const newWaypoint = {
      id: Date.now().toString(),
      x_position: newWaypointData.x,
      y_position: newWaypointData.y,
      category: newWaypointData.category,
      title: newWaypointData.title || `Waypoint ${waypoints.length + 1}`,
      description: newWaypointData.description || 'New waypoint'
    }
    setWaypoints(prev => [...prev, newWaypoint])
    setIsWaypointDialogOpen(false)
    setNewWaypointData({ title: '', description: '', category: '', x: 0, y: 0 })
  }

  // Handle file upload with persistence
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setCurrentMapUrl(url)
      
      // Save to localStorage for persistence
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          localStorage.setItem('currentMapData', event.target.result as string)
          localStorage.setItem('currentMapName', file.name)
        }
      }
      reader.readAsDataURL(file)
      
      if (onMapUpload) {
        onMapUpload(file)
      }
    }
  }

  // Load saved map on component mount
  useEffect(() => {
    const savedMapData = localStorage.getItem('currentMapData')
    if (savedMapData && !currentMapUrl) {
      setCurrentMapUrl(savedMapData)
    }
  }, [])

  // Reset view when map changes
  useEffect(() => {
    if (currentMapUrl && imageRef.current) {
      // Reset to fit the new image
      handleImageLoad()
    }
  }, [currentMapUrl, handleImageLoad])

  // Auto-fit when container dimensions change  
  useEffect(() => {
    if (currentMapUrl && imageDimensions.width && imageDimensions.height) {
      const scaleX = containerDimensions.width / imageDimensions.width
      const scaleY = containerDimensions.height / imageDimensions.height
      const fitScale = Math.min(scaleX, scaleY) // Fit entire image within container
      setScale(fitScale)
      
      // Center the image
      const scaledWidth = imageDimensions.width * fitScale
      const scaledHeight = imageDimensions.height * fitScale
      setPosition({
        x: (containerDimensions.width - scaledWidth) / 2,
        y: (containerDimensions.height - scaledHeight) / 2
      })
    }
  }, [containerDimensions, imageDimensions, currentMapUrl])

  // Save waypoints to localStorage whenever they change
  useEffect(() => {
    if (waypoints.length > 0) {
      localStorage.setItem('mapWaypoints', JSON.stringify(waypoints))
    }
  }, [waypoints])

  // Load saved waypoints on component mount
  useEffect(() => {
    const savedWaypoints = localStorage.getItem('mapWaypoints')
    if (savedWaypoints) {
      try {
        setWaypoints(JSON.parse(savedWaypoints))
      } catch (error) {
        console.error('Failed to load saved waypoints:', error)
      }
    }
  }, [])

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
      onClick={handleMapClick}
      style={{ cursor: isDragging ? 'grabbing' : selectedWaypointType ? 'crosshair' : 'grab' }}
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
        className="absolute select-none pointer-events-none"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
        onLoad={handleImageLoad}
        draggable={false}
      />
      
      {/* Render waypoints */}
      {waypoints?.map((waypoint) => {
        if (!imageDimensions.width || !imageDimensions.height) return null
        
        // Calculate waypoint position in pixels
        const waypointX = position.x + (waypoint.x_position / 100) * imageDimensions.width * scale
        const waypointY = position.y + (waypoint.y_position / 100) * imageDimensions.height * scale
        
        return (
          <div
            key={waypoint.id}
            className="absolute w-6 h-6 -translate-x-3 -translate-y-3 cursor-pointer z-10"
            style={{
              left: waypointX,
              top: waypointY,
            }}
            onClick={(e) => {
              e.stopPropagation()
              // Handle waypoint click if needed
            }}
          >
            <WaypointIconSelector 
              category={waypoint.category || 'location'} 
              className="w-6 h-6 text-primary drop-shadow-lg" 
            />
            <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-background/90 border border-border rounded px-2 py-1 text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity z-20">
              {waypoint.title}
            </div>
          </div>
        )
      })}
      
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
        <Dialog>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="outline"
              className="bg-background/80 hover:bg-background"
            >
              <MapPin className="w-4 h-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Waypoint</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="waypoint-type">Waypoint Type</Label>
                <Select
                  value={selectedWaypointType || ''}
                  onValueChange={setSelectedWaypointType}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select waypoint type" />
                  </SelectTrigger>
                  <SelectContent>
                    {waypointCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <category.icon className={`w-4 h-4 ${category.color}`} />
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedWaypointType && (
                <p className="text-sm text-muted-foreground">
                  Select a waypoint type above, then click on the map to place it.
                </p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upload button overlay */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute top-2 right-2 px-3 py-1 bg-background/80 border border-border rounded-md text-sm hover:bg-background transition-colors z-30"
      >
        Change Map
      </button>

      {/* Waypoint creation dialog */}
      <Dialog open={isWaypointDialogOpen} onOpenChange={setIsWaypointDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Waypoint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="waypoint-title">Title</Label>
              <Input
                id="waypoint-title"
                value={newWaypointData.title}
                onChange={(e) => setNewWaypointData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter waypoint title"
              />
            </div>
            <div>
              <Label htmlFor="waypoint-description">Description</Label>
              <Textarea
                id="waypoint-description"
                value={newWaypointData.description}
                onChange={(e) => setNewWaypointData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe this location..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsWaypointDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateWaypoint}>
                Create Waypoint
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}