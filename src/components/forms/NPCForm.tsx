import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface NPCFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (npc: any) => void
  npc?: any
}

export const NPCForm = ({ open, onOpenChange, onSubmit, npc }: NPCFormProps) => {
  const [formData, setFormData] = useState({
    name: npc?.name || '',
    title: npc?.title || '',
    location: npc?.location || '',
    relationship: npc?.relationship || 'Neutral',
    importance: npc?.importance || 'Medium',
    description: npc?.description || '',
    background: npc?.background || '',
    goals: npc?.goals || '',
    secrets: npc?.secrets || ''
  })

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Name is required")
      return
    }
    if (!formData.description.trim()) {
      toast.error("Description is required")
      return
    }

    onSubmit({
      ...formData,
      lastEncounter: npc?.lastEncounter || "Never met",
      id: npc?.id || Date.now()
    })
    
    onOpenChange(false)
    toast.success(npc ? "NPC updated!" : "NPC created!")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{npc ? 'Edit NPC' : 'Create New NPC'}</DialogTitle>
          <DialogDescription>
            {npc ? 'Update NPC information' : 'Create a new non-player character'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Lord Aldric Blackwood"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Title/Role</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Noble of Valdris"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Blackwood Manor"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship</Label>
              <Select value={formData.relationship} onValueChange={(value) => setFormData(prev => ({ ...prev, relationship: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ally">Ally</SelectItem>
                  <SelectItem value="Enemy">Enemy</SelectItem>
                  <SelectItem value="Neutral">Neutral</SelectItem>
                  <SelectItem value="Unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="importance">Importance</Label>
              <Select value={formData.importance} onValueChange={(value) => setFormData(prev => ({ ...prev, importance: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="A powerful noble who secretly funds the resistance..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="background">Background</Label>
            <Textarea
              id="background"
              value={formData.background}
              onChange={(e) => setFormData(prev => ({ ...prev, background: e.target.value }))}
              placeholder="Born into nobility, lost family in the war..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goals">Goals & Motivations</Label>
              <Textarea
                id="goals"
                value={formData.goals}
                onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                placeholder="Seeks to overthrow the corrupt council..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secrets">Secrets & Notes</Label>
              <Textarea
                id="secrets"
                value={formData.secrets}
                onChange={(e) => setFormData(prev => ({ ...prev, secrets: e.target.value }))}
                placeholder="Secretly a member of the resistance..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              {npc ? 'Update NPC' : 'Create NPC'}
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