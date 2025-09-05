import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'
import { saveToSupabase, updateInSupabase } from '@/lib/supabase-storage'
import { toast } from 'sonner'

interface RegionData {
  id?: string
  name: string
  category: string
  description: string
  history: string
  notable_features: string
  tags: string[]
}

interface RegionFormProps {
  initialData?: RegionData
  onSave: (data: RegionData) => void
  onCancel: () => void
}

const regionCategories = [
  'Kingdom',
  'Province',
  'Wildlands',
  'Empire',
  'City-State',
  'Territory',
  'Realm',
  'Dominion'
]

export function RegionForm({ initialData, onSave, onCancel }: RegionFormProps) {
  const [formData, setFormData] = useState<RegionData>({
    name: initialData?.name || '',
    category: initialData?.category || '',
    description: initialData?.description || '',
    history: initialData?.history || '',
    notable_features: initialData?.notable_features || '',
    tags: initialData?.tags || []
  })
  
  const [newTag, setNewTag] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: keyof RegionData, value: string) => {
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
      toast.error('Region name is required')
      return
    }

    setIsSubmitting(true)
    
    try {
      let result
      if (initialData?.id) {
        result = await updateInSupabase('regions', initialData.id, formData)
      } else {
        result = await saveToSupabase('regions', formData)
      }
      
      toast.success(initialData?.id ? 'Region updated!' : 'Region created!')
      onSave({ ...formData, id: result.id })
    } catch (error) {
      console.error('Failed to save region:', error)
      toast.error('Failed to save region')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData?.id ? 'Edit Region' : 'Create New Region'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Region Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter region name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {regionCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Short overview of the region"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="history">History & Background</Label>
            <Textarea
              id="history"
              value={formData.history}
              onChange={(e) => handleInputChange('history', e.target.value)}
              placeholder="Detailed lore and history of the region"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notable_features">Notable Features</Label>
            <Textarea
              id="notable_features"
              value={formData.notable_features}
              onChange={(e) => handleInputChange('notable_features', e.target.value)}
              placeholder="Key landmarks, resources, and points of interest"
              rows={3}
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
              {isSubmitting ? 'Saving...' : (initialData?.id ? 'Update Region' : 'Create Region')}
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