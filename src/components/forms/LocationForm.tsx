import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { saveToSupabase, updateInSupabase, loadFromSupabase } from '@/lib/supabase-storage'
import { toast } from 'sonner'

interface LocationData {
  id?: string
  name: string
  type: string
  region_id: string | null
  description: string
  key_details: string
  background: string
  tags: string[]
}

interface LocationFormProps {
  initialData?: LocationData
  onSave: (data: LocationData) => void
  onCancel: () => void
}

interface Region {
  id: string
  name: string
}

const locationTypes = [
  'Village',
  'Town',
  'City',
  'Fortress',
  'Castle',
  'Dungeon',
  'Landmark',
  'Temple',
  'Tower',
  'Ruins',
  'Camp',
  'Outpost',
  'Harbor',
  'Market',
  'Academy'
]

export function LocationForm({ initialData, onSave, onCancel }: LocationFormProps) {
  const [formData, setFormData] = useState<LocationData>({
    name: initialData?.name || '',
    type: initialData?.type || '',
    region_id: initialData?.region_id || null,
    description: initialData?.description || '',
    key_details: initialData?.key_details || '',
    background: initialData?.background || '',
    tags: initialData?.tags || []
  })
  
  const [regions, setRegions] = useState<Region[]>([])
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadRegions()
  }, [])

  const loadRegions = async () => {
    try {
      const regionsData = await loadFromSupabase<Region>('regions')
      setRegions(regionsData)
    } catch (error) {
      console.error('Failed to load regions:', error)
    }
  }

  const handleInputChange = (field: keyof LocationData, value: string | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Location name is required')
      return
    }

    setIsSubmitting(true)
    
    try {
      let result
      if (initialData?.id) {
        result = await updateInSupabase('locations', initialData.id, formData)
      } else {
        result = await saveToSupabase('locations', formData)
      }
      
      toast.success(initialData?.id ? 'Location updated!' : 'Location created!')
      onSave({ ...formData, id: result.id })
    } catch (error) {
      console.error('Failed to save location:', error)
      toast.error('Failed to save location')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData?.id ? 'Edit Location' : 'Create New Location'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter location name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {locationTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="region">Region</Label>
            <Select 
              value={formData.region_id || ''} 
              onValueChange={(value) => handleInputChange('region_id', value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select region (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Region</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Short overview of the location"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="key_details">Key Details</Label>
            <Textarea
              id="key_details"
              value={formData.key_details}
              onChange={(e) => handleInputChange('key_details', e.target.value)}
              placeholder="Important aspects (e.g., 'Blacksmith – Level 30')"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">Background & Notes</Label>
            <Textarea
              id="background"
              value={formData.background}
              onChange={(e) => handleInputChange('background', e.target.value)}
              placeholder="Lore and extra details"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addTag()
                  }
                }}
              />
              <Button type="button" onClick={addTag} variant="outline">
                Add
              </Button>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  {tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (initialData?.id ? 'Update Location' : 'Create Location')}
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}