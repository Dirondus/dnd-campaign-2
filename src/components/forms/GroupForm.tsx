import { useState, useEffect } from 'react'
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
  element: string
  level: number
  weapon: string
  finalLevel?: number
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
    group?.members || [{ name: '', element: 'Fire', level: 1, weapon: 'Sword' }]
  )

  // Reset form when not editing
  useEffect(() => {
    if (!group) {
      setFormData({ name: '', description: '', status: 'Active' })
      setMembers([{ name: '', element: 'Fire', level: 1, weapon: 'Sword' }])
    }
  }, [group, open])

  const addMember = () => {
    setMembers([...members, { name: '', element: 'Fire', level: 1, weapon: 'Sword' }])
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
      last_session: group?.last_session || null,
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
                  <Label className="text-xs">Element</Label>
                  <Select value={member.element} onValueChange={(value) => updateMember(index, 'element', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fire">Fire</SelectItem>
                      <SelectItem value="Water">Water</SelectItem>
                      <SelectItem value="Earth">Earth</SelectItem>
                      <SelectItem value="Wind">Wind</SelectItem>
                      <SelectItem value="Light">Light</SelectItem>
                      <SelectItem value="Dark">Dark</SelectItem>
                      <SelectItem value="Ice">Ice</SelectItem>
                      <SelectItem value="Blood">Blood</SelectItem>
                      <SelectItem value="Sound">Sound</SelectItem>
                      <SelectItem value="Sand">Sand</SelectItem>
                      <SelectItem value="Mist">Mist</SelectItem>
                      <SelectItem value="Heat">Heat</SelectItem>
                      <SelectItem value="Lava">Lava</SelectItem>
                      <SelectItem value="Plant">Plant</SelectItem>
                      <SelectItem value="Lightning">Lightning</SelectItem>
                      <SelectItem value="Metal">Metal</SelectItem>
                      <SelectItem value="Ash">Ash</SelectItem>
                      <SelectItem value="Soul">Soul</SelectItem>
                      <SelectItem value="Bone">Bone</SelectItem>
                      <SelectItem value="Crystal">Crystal</SelectItem>
                      <SelectItem value="Venom">Venom</SelectItem>
                      <SelectItem value="Wood">Wood</SelectItem>
                      <SelectItem value="Plasma">Plasma</SelectItem>
                      <SelectItem value="Physical">Physical</SelectItem>
                      <SelectItem value="Gravity">Gravity</SelectItem>
                      <SelectItem value="Chaos">Chaos</SelectItem>
                      <SelectItem value="Phase">Phase</SelectItem>
                      <SelectItem value="Quake">Quake</SelectItem>
                      <SelectItem value="Nuclear">Nuclear</SelectItem>
                      <SelectItem value="Sun">Sun</SelectItem>
                      <SelectItem value="Moon">Moon</SelectItem>
                      <SelectItem value="Storm">Storm</SelectItem>
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
                    max="100"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Weapon</Label>
                  <Select value={member.weapon} onValueChange={(value) => updateMember(index, 'weapon', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sword">Sword</SelectItem>
                      <SelectItem value="Shield">Shield</SelectItem>
                      <SelectItem value="Axe">Axe</SelectItem>
                      <SelectItem value="Gauntlets">Gauntlets</SelectItem>
                      <SelectItem value="Bow">Bow</SelectItem>
                      <SelectItem value="Spear">Spear</SelectItem>
                      <SelectItem value="Mace">Mace</SelectItem>
                      <SelectItem value="Hammer">Hammer</SelectItem>
                      <SelectItem value="Nun-chucks">Nun-chucks</SelectItem>
                      <SelectItem value="Gun">Gun</SelectItem>
                      <SelectItem value="Scythe">Scythe</SelectItem>
                      <SelectItem value="Staff">Staff</SelectItem>
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