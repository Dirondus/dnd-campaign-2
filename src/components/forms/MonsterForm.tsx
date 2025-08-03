import { useState, useEffect } from 'react'
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
    name: '',
    type: 'Beast',
    size: 'Medium',
    dangerRating: '1',
    environment: '',
    description: '',
    hp: 10,
    strengthDice: '1d6',
    magicDice: '1d4'
  })
  
  const [elements, setElements] = useState<string[]>([''])
  const [abilities, setAbilities] = useState<string[]>([''])

  // Pre-fill form when editing
  useEffect(() => {
    if (monster) {
      setFormData({
        name: monster.name || '',
        type: monster.type || 'Beast',
        size: monster.size || 'Medium',
        dangerRating: monster.danger_rating || '1',
        environment: monster.environment || '',
        description: monster.description || '',
        hp: monster.hit_points || 10,
        strengthDice: monster.strength_dice || '1d6',
        magicDice: monster.magic_dice || '1d4'
      })
      setElements(monster.elements && monster.elements.length > 0 ? monster.elements : [''])
      setAbilities(monster.abilities && monster.abilities.length > 0 ? monster.abilities : [''])
    } else {
      setFormData({
        name: '',
        type: 'Beast',
        size: 'Medium',
        dangerRating: '1',
        environment: '',
        description: '',
        hp: 10,
        strengthDice: '1d6',
        magicDice: '1d4'
      })
      setElements([''])
      setAbilities([''])
    }
  }, [monster, open])

  const addElement = () => {
    setElements([...elements, ''])
  }

  const removeElement = (index: number) => {
    setElements(elements.filter((_, i) => i !== index))
  }

  const updateElement = (index: number, value: string) => {
    const updated = [...elements]
    updated[index] = value
    setElements(updated)
  }

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

    const validElements = elements.filter(e => e.trim())
    const validAbilities = abilities.filter(a => a.trim())
    
    onSubmit({
      ...formData,
      elements: validElements,
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
          <div className="grid grid-cols-4 gap-4">
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
              <Label htmlFor="size">Size</Label>
              <Select value={formData.size} onValueChange={(value) => setFormData(prev => ({ ...prev, size: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tiny">Tiny</SelectItem>
                  <SelectItem value="Small">Small</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Large">Large</SelectItem>
                  <SelectItem value="Huge">Huge</SelectItem>
                  <SelectItem value="Gargantuan">Gargantuan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dangerRating">Danger Rating</Label>
              <Input
                id="dangerRating"
                value={formData.dangerRating}
                onChange={(e) => setFormData(prev => ({ ...prev, dangerRating: e.target.value }))}
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
              <Label htmlFor="hp">Hit Points</Label>
              <Input
                id="hp"
                type="number"
                value={formData.hp}
                onChange={(e) => setFormData(prev => ({ ...prev, hp: parseInt(e.target.value) || 10 }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="strengthDice">Strength Dice</Label>
              <Input
                id="strengthDice"
                value={formData.strengthDice}
                onChange={(e) => setFormData(prev => ({ ...prev, strengthDice: e.target.value }))}
                placeholder="1d6"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="magicDice">Magic Dice</Label>
              <Input
                id="magicDice"
                value={formData.magicDice}
                onChange={(e) => setFormData(prev => ({ ...prev, magicDice: e.target.value }))}
                placeholder="1d4"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Elements</Label>
              <Button onClick={addElement} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Element
              </Button>
            </div>
            
            {elements.map((element, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={element}
                  onChange={(e) => updateElement(index, e.target.value)}
                  placeholder="Fire, Shadow, etc."
                  className="flex-1"
                />
                <Button
                  onClick={() => removeElement(index)}
                  size="sm"
                  variant="outline"
                  className="text-destructive"
                  disabled={elements.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Abilities</Label>
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
                  placeholder="Shadow Breath, Fire Immunity, etc."
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