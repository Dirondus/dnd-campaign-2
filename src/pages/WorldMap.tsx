import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InteractiveMap } from "@/components/map/InteractiveMap"
import { RegionsList } from "@/components/RegionsList"
import { LocationsList } from "@/components/LocationsList"
import { 
  Map, Plus, MapPin, Mountain, Trees, Waves, Crown, Swords, Upload, 
  Eye, EyeOff, Search, Filter, Settings, Globe, Compass, Star,
  Calendar, Users, Shield, Zap, Castle, Home, Skull, Landmark
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/integrations/supabase/client"

const WorldMap = () => {
  const [currentMapUrl, setCurrentMapUrl] = useState<string | undefined>(undefined)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"overview" | "detailed">("overview")
  const [isUploadingMap, setIsUploadingMap] = useState(false)

  // Load active map from database on mount
  useEffect(() => {
    loadActiveMap()
  }, [])

  const loadActiveMap = async () => {
    try {
      const { data, error } = await supabase
        .from('maps')
        .select('*')
        .eq('is_active', true)
        .single()
      
      if (error && error.code !== 'PGRST116') { // Ignore "not found" error
        console.error('Failed to load active map:', error)
        return
      }
      
      if (data) {
        setCurrentMapUrl(data.image_url)
      }
    } catch (error) {
      console.error('Failed to load active map:', error)
    }
  }

  const handleMapUpload = async (file: File) => {
    setIsUploadingMap(true)
    try {
      // Upload to Supabase storage
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('maps')
        .upload(fileName, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('maps')
        .getPublicUrl(fileName)

      // Deactivate all existing maps
      await supabase
        .from('maps')
        .update({ is_active: false })
        .eq('is_active', true)

      // Save map metadata to database
      const { error: insertError } = await supabase
        .from('maps')
        .insert({
          title: file.name,
          image_url: publicUrl,
          is_active: true,
          description: 'World map'
        })

      if (insertError) throw insertError

      setCurrentMapUrl(publicUrl)
      toast.success("Map uploaded and saved successfully!")
    } catch (error: any) {
      console.error('Failed to upload map:', error)
      toast.error(`Failed to upload map: ${error.message}`)
    } finally {
      setIsUploadingMap(false)
    }
  }

  // Map layers matching waypoint categories
  const [mapLayers, setMapLayers] = useState([
    { id: "kingdom", name: "Kingdoms", active: true, icon: Castle, color: "text-blue-400" },
    { id: "city", name: "Cities & Towns", active: true, icon: Home, color: "text-yellow-400" },
    { id: "capital", name: "Capitals", active: true, icon: Crown, color: "text-purple-400" },
    { id: "forest", name: "Forests", active: true, icon: Trees, color: "text-green-400" },
    { id: "mountain", name: "Mountains", active: true, icon: Mountain, color: "text-gray-400" },
    { id: "water", name: "Water Bodies", active: true, icon: Waves, color: "text-cyan-400" },
    { id: "dungeon", name: "Dungeons", active: true, icon: Swords, color: "text-red-400" },
    { id: "ruins", name: "Ruins", active: true, icon: Skull, color: "text-orange-400" },
    { id: "landmark", name: "Landmarks", active: true, icon: Landmark, color: "text-pink-400" },
    { id: "location", name: "Other Locations", active: true, icon: MapPin, color: "text-accent" },
  ])

  // Enhanced regions with more depth
  const regions = [
    {
      id: "northern-kingdoms",
      name: "Northern Kingdoms", 
      type: "Empire",
      ruler: "Emperor Aldric Valorian III",
      population: "2.8 million",
      climate: "Harsh winters, mild summers",
      economy: "Mining, Warfare, Trade",
      threat_level: "Moderate",
      recent_events: "Border skirmishes with eastern tribes",
      icon: Crown,
      color: "from-blue-500/20 to-indigo-500/20",
      borderColor: "border-blue-500/50",
      textColor: "text-blue-400"
    },
    {
      id: "whispering-woods",
      name: "Whispering Woods",
      type: "Mystical Forest",
      ruler: "The Elder Druid Council", 
      population: "Unknown (Estimated 50,000)",
      climate: "Temperate, magical influences",
      economy: "Herbs, Magic Components, Wisdom",
      threat_level: "High",
      recent_events: "Ancient spirits have been more active",
      icon: Trees,
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-500/50",
      textColor: "text-green-400"
    },
    {
      id: "crimson-peaks",
      name: "Crimson Peaks",
      type: "Volcanic Range",
      ruler: "Dragon Lords Consortium",
      population: "125,000 (Hardy mountain folk)", 
      climate: "Extreme, volcanic activity common",
      economy: "Rare Metals, Dragon Trade, Smithing",
      threat_level: "Extreme",
      recent_events: "New dragon sighting reported",
      icon: Mountain,
      color: "from-red-500/20 to-orange-500/20",
      borderColor: "border-red-500/50",
      textColor: "text-red-400"
    },
    {
      id: "sapphire-coast",
      name: "Sapphire Coast",
      type: "Maritime Republic",
      ruler: "The Grand Trade Council",
      population: "1.2 million",
      climate: "Mediterranean, sea breezes",
      economy: "Maritime Trade, Fishing, Banking",
      threat_level: "Low",
      recent_events: "New trade routes established with distant lands",
      icon: Waves,
      color: "from-cyan-500/20 to-blue-500/20",
      borderColor: "border-cyan-500/50",
      textColor: "text-cyan-400"
    }
  ]

  // Enhanced POIs with more detail
  const pointsOfInterest = [
    {
      id: "floating-citadel",
      name: "The Floating Citadel",
      type: "Ancient Dungeon",
      difficulty: "Legendary",
      region: "whispering-woods",
      description: "A massive fortress suspended in the air by ancient magic, home to powerful arcane secrets.",
      discovered: false,
      recommended_level: "15-20",
      rewards: ["Legendary Artifacts", "Ancient Spells", "Sky Crystals"],
      dangers: ["Arcane Guardians", "Unstable Magic", "Void Rifts"],
      last_expedition: null
    },
    {
      name: "Port Meridian", 
      type: "Major City",
      difficulty: "Safe",
      region: "sapphire-coast",
      description: "The largest trading port in the known world, where adventurers begin their journeys.",
      discovered: true,
      recommended_level: "1-5",
      rewards: ["Quality Gear", "Information", "Ship Passage"],
      dangers: ["Thieves", "Corrupt Guards", "Political Intrigue"],
      last_expedition: "2 days ago"
    },
    {
      name: "The Sunken Cathedral",
      type: "Underwater Ruins",
      difficulty: "High",
      region: "sapphire-coast",
      description: "A once-sacred temple now claimed by the sea, hiding treasures and dark secrets.",
      discovered: false,
      recommended_level: "8-12",
      rewards: ["Sacred Relics", "Water Breathing Potions", "Ancient Texts"],
      dangers: ["Drowned Undead", "Water Pressure", "Cursed Artifacts"],
      last_expedition: "3 weeks ago"
    },
    {
      name: "Shadowmere Lake",
      type: "Mystical Landmark", 
      difficulty: "Moderate",
      region: "northern-kingdoms",
      description: "A mysterious lake where shadows move independently of their casters.",
      discovered: true,
      recommended_level: "5-10",
      rewards: ["Shadow Essence", "Reflection Stones", "Dark Insights"],
      dangers: ["Shadow Creatures", "Mind Effects", "Temporal Distortions"],
      last_expedition: "1 week ago"
    }
  ]

  const toggleLayer = (layerId: string) => {
    setMapLayers(layers => 
      layers.map(layer => 
        layer.id === layerId ? { ...layer, active: !layer.active } : layer
      )
    )
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Safe": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Moderate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "High": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "Legendary": return "bg-red-500/20 text-red-400 border-red-500/30"
      default: return "bg-accent/20 text-accent border-accent/30"
    }
  }

  const getThreatColor = (threat: string) => {
    switch (threat) {
      case "Low": return "text-green-400"
      case "Moderate": return "text-yellow-400"
      case "High": return "text-orange-400"
      case "Extreme": return "text-red-400"
      default: return "text-accent"
    }
  }

  const filteredPOIs = pointsOfInterest.filter(poi =>
    poi.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    poi.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredRegions = regions.filter(region =>
    region.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    region.ruler.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10 border-b border-border/50">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent/5 to-transparent" />
        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl border border-accent/30">
                  <Globe className="h-8 w-8 text-accent" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-accent bg-clip-text text-transparent">
                    World Atlas
                  </h1>
                  <p className="text-muted-foreground text-lg">
                    Navigate the realms and discover the unknown
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button className="bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-8">
        {/* Search and Filters */}
        <div className="flex items-center gap-4 flex-wrap">
          <div className="relative flex-1 min-w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations, regions, or descriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-card/50 border-border/50 focus:border-accent/50"
            />
          </div>
          <Button variant="outline" className="border-border/50">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "overview" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("overview")}
            >
              Overview
            </Button>
            <Button
              variant={viewMode === "detailed" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("detailed")}
            >
              Detailed
            </Button>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="map" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit bg-card/50 border border-border/50">
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Interactive Map
            </TabsTrigger>
            <TabsTrigger value="regions" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Regions
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locations
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
            <div className="grid lg:grid-cols-4 gap-6">
              {/* Interactive Map */}
              <div className="lg:col-span-3">
                <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-border/50 shadow-2xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      <div className="p-2 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg border border-accent/30">
                        <Map className="h-6 w-6 text-accent" />
                      </div>
                      Interactive World Map
                    </CardTitle>
                    <CardDescription className="text-base">
                      Explore the world, place waypoints, and uncover new territories
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gradient-to-br from-muted/20 to-muted/10 rounded-lg border border-border/50">
                      <InteractiveMap 
                        mapUrl={currentMapUrl} 
                        onMapUpload={handleMapUpload}
                        mapLayers={mapLayers}
                        onToggleLayer={toggleLayer}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Map Controls Sidebar */}
              <div className="space-y-4">
                {/* Layer Controls */}
                <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5 text-accent" />
                      Map Layers
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mapLayers.map((layer) => (
                      <div key={layer.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/30 hover:bg-muted/30 transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <layer.icon className={`h-4 w-4 ${layer.active ? layer.color : 'text-muted-foreground'}`} />
                          <span className={`text-sm font-medium ${layer.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {layer.name}
                          </span>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => toggleLayer(layer.id)}
                          className="h-8 w-8 p-0"
                        >
                          {layer.active ? (
                            <Eye className="h-4 w-4 text-accent" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Stats */}
                <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-border/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Star className="h-5 w-5 text-accent" />
                      World Stats
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border border-accent/20">
                        <div className="text-2xl font-bold text-accent">{regions.length}</div>
                        <div className="text-xs text-muted-foreground">Regions</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg border border-accent/20">
                        <div className="text-2xl font-bold text-accent">{pointsOfInterest.length}</div>
                        <div className="text-xs text-muted-foreground">Locations</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/20">
                        <div className="text-2xl font-bold text-green-400">
                          {pointsOfInterest.filter(poi => poi.discovered).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Discovered</div>
                      </div>
                      <div className="text-center p-3 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-lg border border-red-500/20">
                        <div className="text-2xl font-bold text-red-400">
                          {pointsOfInterest.filter(poi => !poi.discovered).length}
                        </div>
                        <div className="text-xs text-muted-foreground">Hidden</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="regions" className="space-y-6">
            <RegionsList />
          </TabsContent>
          
          <TabsContent value="locations" className="space-y-6">
            <LocationsList />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Globe className="h-6 w-6 text-accent" />
                    World Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground leading-relaxed">
                    The known world spans across {regions.length} major regions, each with its unique culture, 
                    challenges, and opportunities. From the harsh {regions.find(r => r.id === 'crimson-peaks')?.name} 
                    to the mystical {regions.find(r => r.id === 'whispering-woods')?.name}, adventurers 
                    face diverse landscapes and encounters.
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-accent">
                        {regions.reduce((sum, r) => {
                          const pop = r.population.match(/[\d.]+/)?.[0];
                          return sum + (pop ? parseFloat(pop) : 0);
                        }, 0).toFixed(1)}M
                      </div>
                      <div className="text-xs text-muted-foreground">Total Population</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-accent">
                        {Math.round((pointsOfInterest.filter(poi => poi.discovered).length / pointsOfInterest.length) * 100)}%
                      </div>
                      <div className="text-xs text-muted-foreground">World Explored</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Compass className="h-6 w-6 text-accent" />
                    Navigation Tips
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                      <MapPin className="h-4 w-4 text-accent mt-0.5" />
                      <div>
                        <div className="font-medium">Interactive Mapping</div>
                        <div className="text-muted-foreground text-xs">Click and drag to explore, zoom with mouse wheel</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                      <Eye className="h-4 w-4 text-accent mt-0.5" />
                      <div>
                        <div className="font-medium">Layer Management</div>
                        <div className="text-muted-foreground text-xs">Toggle different map layers for focused exploration</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-muted/20 rounded-lg">
                      <Search className="h-4 w-4 text-accent mt-0.5" />
                      <div>
                        <div className="font-medium">Smart Search</div>
                        <div className="text-muted-foreground text-xs">Search locations by name, type, or description</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default WorldMap