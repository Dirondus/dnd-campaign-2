import { useState, useRef, useCallback, useEffect } from 'react'
import { WaypointIconSelector } from './WaypointIconSelector'
import { Upload } from 'lucide-react'

interface InteractiveMapProps {
  mapUrl?: string
  onMapUpload?: (file: File) => void
}

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

  // Calculate scale to fit image within container
  const calculateFitScale = useCallback(() => {
    if (!imageDimensions.width || !imageDimensions.height || !containerDimensions.width || !containerDimensions.height) {
      return 1
    }

    const scaleX = containerDimensions.width / imageDimensions.width
    const scaleY = containerDimensions.height / imageDimensions.height
    return Math.min(scaleX, scaleY, 1) // Don't scale up beyond original size
  }, [imageDimensions, containerDimensions])

  // Handle image load
  const handleImageLoad = useCallback(() => {
    if (imageRef.current) {
      const img = imageRef.current
      setImageDimensions({ width: img.naturalWidth, height: img.naturalHeight })
      
      // Auto-fit image to container
      const fitScale = calculateFitScale()
      setScale(fitScale)
      
      // Center the image
      const scaledWidth = img.naturalWidth * fitScale
      const scaledHeight = img.naturalHeight * fitScale
      setPosition({
        x: (containerDimensions.width - scaledWidth) / 2,
        y: (containerDimensions.height - scaledHeight) / 2
      })
    }
  }, [calculateFitScale, containerDimensions])

  // Constrain position to prevent image from going outside bounds
  const constrainPosition = useCallback((newX: number, newY: number, currentScale: number) => {
    if (!imageDimensions.width || !imageDimensions.height) return { x: newX, y: newY }

    const scaledWidth = imageDimensions.width * currentScale
    const scaledHeight = imageDimensions.height * currentScale

    // Calculate bounds
    const minX = Math.min(0, containerDimensions.width - scaledWidth)
    const maxX = Math.max(0, containerDimensions.width - scaledWidth)
    const minY = Math.min(0, containerDimensions.height - scaledHeight)
    const maxY = Math.max(0, containerDimensions.height - scaledHeight)

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
    const newScale = Math.max(fitScale * 0.5, Math.min(scale * delta, fitScale * 3)) // Constrain zoom range

    // Calculate new position to zoom towards mouse
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
    
    const constrainedPosition = constrainPosition(newX, newY, scale)
    setPosition(constrainedPosition)
  }, [isDragging, dragStart, scale, constrainPosition])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

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
      // Add waypoint to local state
      const newWaypoint = {
        id: Date.now().toString(),
        x_position: xPercent,
        y_position: yPercent,
        category: selectedWaypointType,
        title: `Waypoint ${waypoints.length + 1}`,
        description: 'New waypoint'
      }
      setWaypoints(prev => [...prev, newWaypoint])
      setSelectedWaypointType(null)
    }
  }, [isDragging, currentMapUrl, selectedWaypointType, position, scale, imageDimensions, waypoints])

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file)
      setCurrentMapUrl(url)
      if (onMapUpload) {
        onMapUpload(file)
      }
    }
  }

  // Reset view when map changes
  useEffect(() => {
    if (currentMapUrl && imageRef.current) {
      // Reset to fit the new image
      handleImageLoad()
    }
  }, [currentMapUrl, handleImageLoad])

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
          </div>
        )
      })}
      
      {/* Upload button overlay */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute top-2 right-2 px-3 py-1 bg-background/80 border border-border rounded-md text-sm hover:bg-background transition-colors"
      >
        Change Map
      </button>
    </div>
  )
}