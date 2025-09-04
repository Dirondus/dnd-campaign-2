import { useState, useRef } from 'react'
import { Upload } from 'lucide-react'

interface InteractiveMapProps {
  mapUrl?: string
  onMapUpload?: (file: File) => void
}

export function InteractiveMap({ mapUrl, onMapUpload }: InteractiveMapProps) {
  const [currentMapUrl, setCurrentMapUrl] = useState(mapUrl)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
    <div className="relative w-full h-96 bg-background border border-border rounded-lg overflow-hidden">
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
        className="w-full h-full object-contain"
        draggable={false}
      />
      
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