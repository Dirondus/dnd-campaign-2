import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from '@/hooks/useAuth'
import { Plus, Wand2, Sword, Heart, Search, Edit, Trash2 } from "lucide-react"
import { toast } from 'sonner'

const CampaignTools = () => {
  const { isAdmin } = useAuth()
  const [activeTab, setActiveTab] = useState("magic")

  // Sample data - in real app this would come from Supabase
  const [magicItems] = useState([
    {
      id: '1',
      name: 'Flame Tongue',
      description: 'A magical sword that bursts into flames when the command word is spoken.',
      type: 'Weapon',
      rarity: 'Rare',
      properties: { damage: '+1d6 fire', attunement: true }
    }
  ])

  const [weapons] = useState([
    {
      id: '1',
      name: 'Longsword',
      description: 'A standard military sword with a straight, double-edged blade.',
      damage: '1d8 slashing',
      weaponType: 'Martial Melee',
      properties: { versatile: '1d10' }
    }
  ])

  const [pets] = useState([
    {
      id: '1',
      name: 'Shadow',
      description: 'A loyal wolf companion with dark fur and glowing eyes.',
      species: 'Wolf',
      stats: { ac: 13, hp: 11, speed: '40 ft' }
    }
  ])

  const ItemForm = ({ type, onSave }: { type: string, onSave: () => void }) => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder={`Enter ${type} name`} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" placeholder="Describe the item..." rows={3} />
      </div>
      {type === 'magic' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select>
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
            <Select>
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
      {type === 'weapon' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="damage">Damage</Label>
            <Input id="damage" placeholder="e.g., 1d8 slashing" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="weapon-type">Weapon Type</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select weapon type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="simple-melee">Simple Melee</SelectItem>
                <SelectItem value="simple-ranged">Simple Ranged</SelectItem>
                <SelectItem value="martial-melee">Martial Melee</SelectItem>
                <SelectItem value="martial-ranged">Martial Ranged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
      {type === 'pet' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="species">Species</Label>
            <Input id="species" placeholder="e.g., Wolf, Eagle, Cat" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ac">Armor Class</Label>
              <Input id="ac" type="number" placeholder="13" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hp">Hit Points</Label>
              <Input id="hp" type="number" placeholder="11" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="speed">Speed</Label>
              <Input id="speed" placeholder="40 ft" />
            </div>
          </div>
        </>
      )}
      <Button 
        onClick={() => {
          toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} saved!`)
          onSave()
        }}
        className="w-full bg-gradient-primary text-primary-foreground"
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
              {type === 'weapon' && `${item.weaponType} • ${item.damage}`}
              {type === 'pet' && `${item.species} • AC ${item.stats?.ac}`}
            </CardDescription>
          </div>
          {isAdmin && (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm mb-3">{item.description}</p>
        <div className="flex flex-wrap gap-2">
          {type === 'magic' && item.properties?.attunement && (
            <Badge variant="outline" className="text-xs">Requires Attunement</Badge>
          )}
          {type === 'weapon' && item.properties?.versatile && (
            <Badge variant="outline" className="text-xs">Versatile ({item.properties.versatile})</Badge>
          )}
          {type === 'pet' && (
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
              <Input placeholder="Search magic items..." className="pl-10" />
            </div>
            {isAdmin && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Magic Item
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Magic Item</DialogTitle>
                    <DialogDescription>Create a new magical item for your campaign.</DialogDescription>
                  </DialogHeader>
                  <ItemForm type="magic" onSave={() => {}} />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="grid gap-4">
            {magicItems.map((item) => (
              <ItemCard key={item.id} item={item} type="magic" />
            ))}
            {magicItems.length === 0 && (
              <Card className="bg-gradient-card border-border shadow-deep">
                <CardContent className="p-12 text-center">
                  <Wand2 className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Magic Items</h3>
                  <p className="text-muted-foreground mb-6">
                    {isAdmin ? "Start adding magical items to your campaign." : "No magic items have been added yet."}
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
              <Input placeholder="Search weapons..." className="pl-10" />
            </div>
            {isAdmin && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Weapon
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Weapon</DialogTitle>
                    <DialogDescription>Create a new weapon for your campaign.</DialogDescription>
                  </DialogHeader>
                  <ItemForm type="weapon" onSave={() => {}} />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="grid gap-4">
            {weapons.map((item) => (
              <ItemCard key={item.id} item={item} type="weapon" />
            ))}
            {weapons.length === 0 && (
              <Card className="bg-gradient-card border-border shadow-deep">
                <CardContent className="p-12 text-center">
                  <Sword className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Weapons</h3>
                  <p className="text-muted-foreground mb-6">
                    {isAdmin ? "Start adding weapons to your campaign arsenal." : "No weapons have been added yet."}
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
              <Input placeholder="Search pets..." className="pl-10" />
            </div>
            {isAdmin && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-primary text-primary-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Pet
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Pet</DialogTitle>
                    <DialogDescription>Create a new companion for your campaign.</DialogDescription>
                  </DialogHeader>
                  <ItemForm type="pet" onSave={() => {}} />
                </DialogContent>
              </Dialog>
            )}
          </div>
          
          <div className="grid gap-4">
            {pets.map((item) => (
              <ItemCard key={item.id} item={item} type="pet" />
            ))}
            {pets.length === 0 && (
              <Card className="bg-gradient-card border-border shadow-deep">
                <CardContent className="p-12 text-center">
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Pets</h3>
                  <p className="text-muted-foreground mb-6">
                    {isAdmin ? "Start adding companion animals to your campaign." : "No pets have been added yet."}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CampaignTools