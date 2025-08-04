import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface LoreFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (entry: any) => void
  entry?: any
}

export const LoreForm = ({ open, onOpenChange, onSubmit, entry }: LoreFormProps) => {
  const [formData, setFormData] = useState({
    title: '',
    category: 'Locations',
    summary: '',
    content: '',
    tags: ''
  })

  // Pre-fill form when editing
  useEffect(() => {
    if (entry) {
      setFormData({
        title: entry.title || '',
        category: entry.category || 'Locations',
        summary: entry.summary || '',
        content: entry.content || '',
        tags: entry.tags?.join(', ') || ''
      })
    } else {
      setFormData({
        title: '',
        category: 'Locations',
        summary: '',
        content: '',
        tags: ''
      })
    }
  }, [entry, open])

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required")
      return
    }
    if (!formData.summary.trim()) {
      toast.error("Summary is required")
      return
    }

    onSubmit({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      lastUpdated: new Date().toISOString().split('T')[0],
      id: entry?.id // Preserve original ID when editing, undefined when creating
    })
    
    onOpenChange(false)
    toast.success(entry ? "Lore entry updated!" : "Lore entry created!")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{entry ? 'Edit Lore Entry' : 'Create New Lore Entry'}</DialogTitle>
          <DialogDescription>
            {entry ? 'Update lore entry information' : 'Add new knowledge to your world'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="The Whispering Woods"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kingdoms & Nations">Kingdoms & Nations</SelectItem>
                  <SelectItem value="Ancient History">Ancient History</SelectItem>
                  <SelectItem value="Locations">Locations & Places</SelectItem>
                  <SelectItem value="World Mechanics">World Mechanics</SelectItem>
                  <SelectItem value="Organizations">Organizations</SelectItem>
                  <SelectItem value="Artifacts">Artifacts</SelectItem>
                  <SelectItem value="Legends">Legends & Myths</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea
              id="summary"
              value={formData.summary}
              onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="A brief description of this lore entry..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Detailed Content</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Detailed information about this lore entry..."
              rows={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="forest, magic, ancient, dangerous"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              {entry ? 'Update Entry' : 'Create Entry'}
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}