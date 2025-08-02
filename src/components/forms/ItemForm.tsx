import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"

interface ItemFormProps {
  type: string
  formData: any
  setFormData: (updater: (prev: any) => any) => void
  onSave: (type: string) => void
}

export const ItemForm = ({ type, formData, setFormData, onSave }: ItemFormProps) => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="name">Name</Label>
      <Input 
        id="name" 
        placeholder={`Enter ${type} name`}
        value={formData.name || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
      />
    </div>
    <div className="space-y-2">
      <Label htmlFor="description">Description</Label>
      <Textarea 
        id="description" 
        placeholder="Describe the item..." 
        rows={3}
        value={formData.description || ''}
        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
      />
    </div>
    {type === 'magic' && (
      <>
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select 
            value={formData.type || ''} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weapon">Weapon</SelectItem>
              <SelectItem value="armor">Armor</SelectItem>
              <SelectItem value="potion">Potion</SelectItem>
              <SelectItem value="ring">Ring</SelectItem>
              <SelectItem value="wondrous">Wondrous Item</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rarity">Rarity</Label>
          <Select 
            value={formData.rarity || ''} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, rarity: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select rarity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="common">Common</SelectItem>
              <SelectItem value="uncommon">Uncommon</SelectItem>
              <SelectItem value="rare">Rare</SelectItem>
              <SelectItem value="very-rare">Very Rare</SelectItem>
              <SelectItem value="legendary">Legendary</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </>
    )}
    {type === 'weapons' && (
      <>
        <div className="space-y-2">
          <Label htmlFor="damage">Damage</Label>
          <Input 
            id="damage" 
            placeholder="e.g., 1d8 slashing"
            value={formData.damage || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, damage: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weapon-type">Weapon Type</Label>
          <Select 
            value={formData.weaponType || ''} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, weaponType: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select weapon type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Simple Melee">Simple Melee</SelectItem>
              <SelectItem value="Simple Ranged">Simple Ranged</SelectItem>
              <SelectItem value="Martial Melee">Martial Melee</SelectItem>
              <SelectItem value="Martial Ranged">Martial Ranged</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </>
    )}
    {type === 'pets' && (
      <>
        <div className="space-y-2">
          <Label htmlFor="species">Species</Label>
          <Input 
            id="species" 
            placeholder="e.g., Wolf, Eagle, Cat"
            value={formData.species || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="ac">Armor Class</Label>
            <Input 
              id="ac" 
              type="number" 
              placeholder="13"
              value={formData.ac || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, ac: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hp">Hit Points</Label>
            <Input 
              id="hp" 
              type="number" 
              placeholder="11"
              value={formData.hp || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, hp: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="speed">Speed</Label>
            <Input 
              id="speed" 
              placeholder="40 ft"
              value={formData.speed || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, speed: e.target.value }))}
            />
          </div>
        </div>
      </>
    )}
    <Button 
      onClick={() => onSave(type)}
      className="w-full bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
      disabled={!formData.name}
    >
      Save {type.charAt(0).toUpperCase() + type.slice(1)}
    </Button>
  </div>
)