import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

interface MonsterFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (monster: any) => void
  monster?: any
}

export const MonsterForm = ({ open, onOpenChange, onSubmit, monster }: MonsterFormProps) => {
  const [formData, setFormData] = useState({
    name: monster?.name || '',
    type: monster?.type || 'Beast',
    cr: monster?.cr || '1',
    environment: monster?.environment || '',
    description: monster?.description || '',
    ac: monster?.ac || 10,
    hp: monster?.hp || 10,
    speed: monster?.speed || '30 ft',
    str: monster?.str || 10,
    dex: monster?.dex || 10,
    con: monster?.con || 10,
    int: monster?.int || 10,
    wis: monster?.wis || 10,
    cha: monster?.cha || 10
  })
  
  const [abilities, setAbilities] = useState<string[]>(
    monster?.abilities || ['']
  )

  const addAbility = () => {
    setAbilities([...abilities, ''])
  }

  const removeAbility = (index: number) => {
    setAbilities(abilities.filter((_, i) => i !== index))
  }

  const updateAbility = (index: number, value: string) => {
    const updated = [...abilities]
    updated[index] = value
    setAbilities(updated)
  }

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error("Monster name is required")
      return
    }
    if (!formData.description.trim()) {
      toast.error("Description is required")
      return
    }

    const validAbilities = abilities.filter(a => a.trim())
    
    onSubmit({
      ...formData,
      abilities: validAbilities,
      lastUsed: monster?.lastUsed || "Never used",
      id: monster?.id || Date.now()
    })
    
    onOpenChange(false)
    toast.success(monster ? "Monster updated!" : "Monster created!")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{monster ? 'Edit Monster' : 'Create New Monster'}</DialogTitle>
          <DialogDescription>
            {monster ? 'Update monster information' : 'Add a new creature to your bestiary'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ancient Shadow Dragon"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beast">Beast</SelectItem>
                  <SelectItem value="Dragon">Dragon</SelectItem>
                  <SelectItem value="Undead">Undead</SelectItem>
                  <SelectItem value="Fey">Fey</SelectItem>
                  <SelectItem value="Fiend">Fiend</SelectItem>
                  <SelectItem value="Construct">Construct</SelectItem>
                  <SelectItem value="Humanoid">Humanoid</SelectItem>
                  <SelectItem value="Monstrosity">Monstrosity</SelectItem>
                  <SelectItem value="Plant">Plant</SelectItem>
                  <SelectItem value="Elemental">Elemental</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cr">Challenge Rating</Label>
              <Input
                id="cr"
                value={formData.cr}
                onChange={(e) => setFormData(prev => ({ ...prev, cr: e.target.value }))}
                placeholder="17"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="environment">Environment</Label>
            <Input
              id="environment"
              value={formData.environment}
              onChange={(e) => setFormData(prev => ({ ...prev, environment: e.target.value }))}
              placeholder="Dark caverns, shadow plane"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="A massive dragon corrupted by shadow magic..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ac">Armor Class</Label>
              <Input
                id="ac"
                type="number"
                value={formData.ac}
                onChange={(e) => setFormData(prev => ({ ...prev, ac: parseInt(e.target.value) || 10 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hp">Hit Points</Label>
              <Input
                id="hp"
                type="number"
                value={formData.hp}
                onChange={(e) => setFormData(prev => ({ ...prev, hp: parseInt(e.target.value) || 10 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speed">Speed</Label>
              <Input
                id="speed"
                value={formData.speed}
                onChange={(e) => setFormData(prev => ({ ...prev, speed: e.target.value }))}
                placeholder="30 ft"
              />
            </div>
          </div>

          <div className="grid grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label htmlFor="str">STR</Label>
              <Input
                id="str"
                type="number"
                value={formData.str}
                onChange={(e) => setFormData(prev => ({ ...prev, str: parseInt(e.target.value) || 10 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dex">DEX</Label>
              <Input
                id="dex"
                type="number"
                value={formData.dex}
                onChange={(e) => setFormData(prev => ({ ...prev, dex: parseInt(e.target.value) || 10 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="con">CON</Label>
              <Input
                id="con"
                type="number"
                value={formData.con}
                onChange={(e) => setFormData(prev => ({ ...prev, con: parseInt(e.target.value) || 10 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="int">INT</Label>
              <Input
                id="int"
                type="number"
                value={formData.int}
                onChange={(e) => setFormData(prev => ({ ...prev, int: parseInt(e.target.value) || 10 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wis">WIS</Label>
              <Input
                id="wis"
                type="number"
                value={formData.wis}
                onChange={(e) => setFormData(prev => ({ ...prev, wis: parseInt(e.target.value) || 10 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cha">CHA</Label>
              <Input
                id="cha"
                type="number"
                value={formData.cha}
                onChange={(e) => setFormData(prev => ({ ...prev, cha: parseInt(e.target.value) || 10 }))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Special Abilities</Label>
              <Button onClick={addAbility} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Ability
              </Button>
            </div>
            
            {abilities.map((ability, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={ability}
                  onChange={(e) => updateAbility(index, e.target.value)}
                  placeholder="Shadow Breath"
                  className="flex-1"
                />
                <Button
                  onClick={() => removeAbility(index)}
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  disabled={abilities.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} className="flex-1">
              {monster ? 'Update Monster' : 'Create Monster'}
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