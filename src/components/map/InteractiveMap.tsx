import { useState, useRef, useCallback } from 'react'
import { Upload, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface InteractiveMapProps {
  mapUrl?: string
  onMapUpload?: (file: File) => void
}

export function InteractiveMap({ mapUrl, onMapUpload }: InteractiveMapProps) {
  const [currentMapUrl, setCurrentMapUrl] = useState(mapUrl)
  const [scale, setScale] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, startX: 0, startY: 0 })
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
    
    setPosition({ x: newX, y: newY })
  }, [isDragging, dragStart])

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
      style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
      
      <img
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
      </div>

      {/* Upload button overlay */}
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute top-2 right-2 px-3 py-1 bg-background/80 border border-border rounded-md text-sm hover:bg-background transition-colors z-30"
      >
        Change Map
      </button>
    </div>
  )
}