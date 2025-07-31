import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface Member {
  name: string
  class: string
  level: number
  role: string
}

interface GroupFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (group: any) => void
  group?: any
}

export const GroupForm = ({ open, onOpenChange, onSubmit, group }: GroupFormProps) => {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    status: group?.status || 'Active'
  })
  
  const [members, setMembers] = useState<Member[]>(
    group?.members || [{ name: '', class: 'Fighter', level: 1, role: 'Tank' }]
  )

  const addMember = () => {
    setMembers([...members, { name: '', class: 'Fighter', level: 1, role: 'Tank' }])
  }

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index))
  }

  const updateMember = (index: number, field: keyof Member, value: string | number) => {
    const updated = [...members]
    updated[index] = { ...updated[index], [field]: value }
    setMembers(updated)
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Group name is required")
      return
    }
    
    const validMembers = members.filter(m => m.name.trim())
    if (validMembers.length === 0) {
      toast.error("At least one member is required")
      return
    }

    onSubmit({
      ...formData,
      members: validMembers,
      lastSession: group?.lastSession || "Never",
      id: group?.id || Date.now()
    })
    
    onOpenChange(false)
    toast.success(group ? "Group updated!" : "Group created!")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{group ? 'Edit Group' : 'Create New Group'}</DialogTitle>
          <DialogDescription>
            {group ? 'Update group information and party members' : 'Create a new adventuring group and add party members'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="The Iron Wolves"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Hiatus">On Hiatus</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
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
              placeholder="A group of battle-hardened mercenaries seeking redemption..."
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Party Members</Label>
              <Button onClick={addMember} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Member
              </Button>
            </div>
            
            {members.map((member, index) => (
              <div key={index} className="grid grid-cols-5 gap-3 p-4 bg-muted/30 rounded-lg">
                <div className="space-y-1">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={member.name}
                    onChange={(e) => updateMember(index, 'name', e.target.value)}
                    placeholder="Character name"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Class</Label>
                  <Select value={member.class} onValueChange={(value) => updateMember(index, 'class', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fighter">Fighter</SelectItem>
                      <SelectItem value="Wizard">Wizard</SelectItem>
                      <SelectItem value="Cleric">Cleric</SelectItem>
                      <SelectItem value="Rogue">Rogue</SelectItem>
                      <SelectItem value="Ranger">Ranger</SelectItem>
                      <SelectItem value="Barbarian">Barbarian</SelectItem>
                      <SelectItem value="Bard">Bard</SelectItem>
                      <SelectItem value="Druid">Druid</SelectItem>
                      <SelectItem value="Monk">Monk</SelectItem>
                      <SelectItem value="Paladin">Paladin</SelectItem>
                      <SelectItem value="Sorcerer">Sorcerer</SelectItem>
                      <SelectItem value="Warlock">Warlock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Level</Label>
                  <Input
                    type="number"
                    value={member.level}
                    onChange={(e) => updateMember(index, 'level', parseInt(e.target.value) || 1)}
                    min="1"
                    max="20"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Role</Label>
                  <Select value={member.role} onValueChange={(value) => updateMember(index, 'role', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tank">Tank</SelectItem>
                      <SelectItem value="DPS">DPS</SelectItem>
                      <SelectItem value="Healer">Healer</SelectItem>
                      <SelectItem value="Support">Support</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => removeMember(index)}
                    size="sm"
                    variant="outline"
                    className="text-destructive"
                    disabled={members.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              {group ? 'Update Group' : 'Create Group'}
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