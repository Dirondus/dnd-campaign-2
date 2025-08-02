import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Plus, Wand2, Sword, Heart, Search } from "lucide-react"
import { toast } from 'sonner'

const CampaignTools = () => {
  const [activeTab, setActiveTab] = useState("magic")
  const [searchTerm, setSearchTerm] = useState('')
  const [weaponSearchTerm, setWeaponSearchTerm] = useState('')
  const [petSearchTerm, setPetSearchTerm] = useState('')

  // Dynamic state management for all campaign tools
  const [magicItems, setMagicItems] = useState([
    {
      id: '1',
      name: 'Flame Tongue',
      description: 'A magical sword that bursts into flames when the command word is spoken.',
      type: 'Weapon',
      rarity: 'Rare',
      properties: { damage: '+1d6 fire', attunement: true }
    }
  ])

  const [weapons, setWeapons] = useState([
    {
      id: '1',
      name: 'Longsword',
      description: 'A standard military sword with a straight, double-edged blade.',
      damage: '1d8 slashing',
      weaponType: 'Martial Melee',
      properties: { versatile: '1d10' }
    }
  ])

  const [pets, setPets] = useState([
    {
      id: '1',
      name: 'Shadow',
      description: 'A loyal wolf companion with dark fur and glowing eyes.',
      species: 'Wolf',
      stats: { ac: 13, hp: 11, speed: '40 ft' }
    }
  ])

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})

  const handleSaveItem = useCallback((type: string) => {
    const newItem = {
      id: Date.now().toString(),
      ...formData
    }

    if (type === 'pets') {
      newItem.stats = {
        ac: parseInt(formData.ac) || 0,
        hp: parseInt(formData.hp) || 0,
        speed: formData.speed || ''
      }
    }

    if (type === 'magic') {
      setMagicItems(prev => [...prev, newItem])
    } else if (type === 'weapons') {
      setWeapons(prev => [...prev, newItem])
    } else if (type === 'pets') {
      setPets(prev => [...prev, newItem])
    }

    setFormData({})
    setIsDialogOpen(false)
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added successfully!`)
  }, [formData])

  const ItemForm = ({ type, onSave }: { type: string, onSave: () => void }) => (
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
        onClick={() => handleSaveItem(type)}
        className="w-full bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
        disabled={!formData.name}
      >
        Save {type.charAt(0).toUpperCase() + type.slice(1)}
      </Button>
    </div>
  )

  const ItemCard = ({ item, type }: { item: any, type: string }) => (
    <Card className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg text-foreground">{item.name}</CardTitle>
            <CardDescription className="text-muted-foreground">
              {type === 'magic' && `${item.type} • ${item.rarity}`}
              {type === 'weapons' && `${item.weaponType} • ${item.damage}`}
              {type === 'pets' && `${item.species} • AC ${item.stats?.ac}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
        <div className="flex flex-wrap gap-2">
          {type === 'magic' && item.properties?.attunement && (
            <Badge variant="outline" className="text-xs">Requires Attunement</Badge>
          )}
          {type === 'weapons' && item.properties?.versatile && (
            <Badge variant="outline" className="text-xs">Versatile ({item.properties.versatile})</Badge>
          )}
          {type === 'pets' && (
            <Badge variant="outline" className="text-xs">{item.stats?.hp} HP</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            Campaign Tools
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage magical items, weapons, and companions
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="magic" className="flex items-center gap-2">
            <Wand2 className="h-4 w-4" />
            Magic Items
          </TabsTrigger>
          <TabsTrigger value="weapons" className="flex items-center gap-2">
            <Sword className="h-4 w-4" />
            Weapons
          </TabsTrigger>
          <TabsTrigger value="pets" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Pets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="magic" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search magic items..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => {
                setEditingItem(null)
                setFormData({})
                setIsDialogOpen(true)
              }}
              className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Magic Item
            </Button>
          </div>
          
          <div className="grid gap-4">
            {magicItems.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
              <ItemCard key={item.id} item={item} type="magic" />
            ))}
            {magicItems.length === 0 && (
              <Card className="bg-gradient-card border-border shadow-deep">
                <CardContent className="p-12 text-center">
                  <Wand2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Magic Items</h3>
                  <p className="text-muted-foreground mb-6">
                    No magic items have been added yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="weapons" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search weapons..." 
                className="pl-10"
                value={weaponSearchTerm}
                onChange={(e) => setWeaponSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => {
                setEditingItem(null)
                setFormData({})
                setIsDialogOpen(true)
              }}
              className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Weapon
            </Button>
          </div>
          
          <div className="grid gap-4">
            {weapons.filter(item => item.name.toLowerCase().includes(weaponSearchTerm.toLowerCase())).map((item) => (
              <ItemCard key={item.id} item={item} type="weapons" />
            ))}
            {weapons.length === 0 && (
              <Card className="bg-gradient-card border-border shadow-deep">
                <CardContent className="p-12 text-center">
                  <Sword className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Weapons</h3>
                  <p className="text-muted-foreground mb-6">
                    No weapons have been added yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="pets" className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search pets..." 
                className="pl-10"
                value={petSearchTerm}
                onChange={(e) => setPetSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => {
                setEditingItem(null)
                setFormData({})
                setIsDialogOpen(true)
              }}
              className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Pet
            </Button>
          </div>
          
          <div className="grid gap-4">
            {pets.filter(item => item.name.toLowerCase().includes(petSearchTerm.toLowerCase())).map((item) => (
              <ItemCard key={item.id} item={item} type="pets" />
            ))}
            {pets.length === 0 && (
              <Card className="bg-gradient-card border-border shadow-deep">
                <CardContent className="p-12 text-center">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Pets</h3>
                  <p className="text-muted-foreground mb-6">
                    No pets have been added yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {activeTab === 'magic' && 'Add Magic Item'}
              {activeTab === 'weapons' && 'Add Weapon'}
              {activeTab === 'pets' && 'Add Pet'}
            </DialogTitle>
            <DialogDescription>
              {activeTab === 'magic' && 'Create a new magical item for your campaign'}
              {activeTab === 'weapons' && 'Create a new weapon for your campaign'}
              {activeTab === 'pets' && 'Create a new companion for your campaign'}
            </DialogDescription>
          </DialogHeader>
          <ItemForm type={activeTab} onSave={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CampaignTools