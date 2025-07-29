import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { InteractiveMap } from "@/components/map/InteractiveMap"
import { useAuth } from "@/hooks/useAuth"
import { Map, Plus, MapPin, Mountain, Trees, Waves, Crown, Swords, Upload } from "lucide-react"
import { toast } from "sonner"

const WorldMap = () => {
  const { isAdmin } = useAuth()
  const [currentMapUrl, setCurrentMapUrl] = useState<string | undefined>(undefined)
  const mapLayers = [
    { name: "Political Boundaries", active: true, color: "text-red-400" },
    { name: "Terrain Features", active: true, color: "text-green-400" },
    { name: "Cities & Towns", active: true, color: "text-blue-400" },
    { name: "Roads & Routes", active: false, color: "text-yellow-400" },
    { name: "Dungeons & POIs", active: true, color: "text-purple-400" },
    { name: "Player Locations", active: true, color: "text-accent" },
  ]

  const regions = [
    {
      name: "Northern Kingdoms", 
      type: "Kingdom",
      ruler: "King Aldric III",
      population: "~2.5 million",
      climate: "Temperate, cold winters",
      icon: Crown,
      color: "bg-blue-500/20 text-blue-400 border-blue-500/30"
    },
    {
      name: "Whispering Woods",
      type: "Forest",
      ruler: "Druid Circle", 
      population: "Unknown",
      climate: "Mystical, ever-changing",
      icon: Trees,
      color: "bg-green-500/20 text-green-400 border-green-500/30"
    },
    {
      name: "Crimson Peaks",
      type: "Mountain Range",
      ruler: "Dragon Lords",
      population: "Sparse settlements", 
      climate: "Harsh, volcanic activity",
      icon: Mountain,
      color: "bg-red-500/20 text-red-400 border-red-500/30"
    },
    {
      name: "Sapphire Coast",
      type: "Coastal Region",
      ruler: "Trade Consortium",
      population: "~800,000",
      climate: "Mediterranean, sea breeze",
      icon: Waves,
      color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
    }
  ]

  const pointsOfInterest = [
    {
      name: "The Floating Citadel",
      type: "Dungeon",
      difficulty: "Legendary",
      description: "An ancient fortress suspended in the air by powerful magic.",
      discovered: false
    },
    {
      name: "Port Meridian", 
      type: "City",
      difficulty: "Safe",
      description: "A bustling trade port and starting point for many adventures.",
      discovered: true
    },
    {
      name: "The Sunken Cathedral",
      type: "Ruins",
      difficulty: "High",
      description: "Sacred temple now flooded, hiding ancient treasures.",
      discovered: false
    },
    {
      name: "Shadowmere Lake",
      type: "Landmark", 
      difficulty: "Moderate",
      description: "A mysterious lake where shadows move independently.",
      discovered: true
    }
  ]

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Safe": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Moderate": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "High": return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "Legendary": return "bg-red-500/20 text-red-400 border-red-500/30"
      default: return "bg-accent/20 text-accent border-accent/30"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            World Map
          </h1>
          <p className="text-muted-foreground mt-2">
            Explore and manage your campaign world
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" className="border-accent/30 text-accent hover:bg-accent/10">
              <MapPin className="h-4 w-4 mr-2" />
              Add Location
            </Button>
            <Button className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow">
              <Plus className="h-4 w-4 mr-2" />
              Create Region
            </Button>
          </div>
        )}
      </div>

      {/* Interactive Map */}
      <Card className="bg-gradient-card border-border shadow-deep">
        <CardHeader>
          <CardTitle className="text-xl text-accent flex items-center gap-3">
            <Map className="h-6 w-6" />
            Interactive World Map
          </CardTitle>
          <CardDescription>
            {isAdmin 
              ? "Click and drag to explore, zoom with mouse wheel, click to add waypoints" 
              : "Click and drag to explore, zoom with mouse wheel"
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InteractiveMap 
            mapUrl={currentMapUrl} 
            onMapUpload={(file) => {
              const url = URL.createObjectURL(file)
              setCurrentMapUrl(url)
              toast.success("Map uploaded successfully!")
            }}
          />
        </CardContent>
      </Card>

      {/* Map Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Layer Controls */}
        <Card className="bg-gradient-card border-border shadow-deep">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Map Layers</CardTitle>
            <CardDescription>Toggle visibility of different map elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mapLayers.map((layer) => (
              <div key={layer.name} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-magical">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${layer.active ? 'bg-accent' : 'bg-muted'}`} />
                  <span className={`text-sm ${layer.active ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {layer.name}
                  </span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-12 text-xs">
                  {layer.active ? 'On' : 'Off'}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="bg-gradient-card border-border shadow-deep">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">World Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Regions:</span>
              <span className="text-xl font-bold text-accent">{regions.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Points of Interest:</span>
              <span className="text-xl font-bold text-accent">{pointsOfInterest.length}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Discovered:</span>
              <span className="text-xl font-bold text-accent">
                {pointsOfInterest.filter(poi => poi.discovered).length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Hidden:</span>
              <span className="text-xl font-bold text-accent">
                {pointsOfInterest.filter(poi => !poi.discovered).length}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="bg-gradient-card border-border shadow-deep">
          <CardHeader>
            <CardTitle className="text-lg text-foreground">Map Legend</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <Crown className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">Kingdoms & Nations</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-accent" />
              <span className="text-sm text-muted-foreground">Cities & Towns</span>
            </div>
            <div className="flex items-center gap-3">
              <Swords className="h-4 w-4 text-red-400" />
              <span className="text-sm text-muted-foreground">Dungeons & Danger</span>
            </div>
            <div className="flex items-center gap-3">
              <Mountain className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-muted-foreground">Mountain Ranges</span>
            </div>
            <div className="flex items-center gap-3">
              <Trees className="h-4 w-4 text-green-400" />
              <span className="text-sm text-muted-foreground">Forests & Wilds</span>
            </div>
            <div className="flex items-center gap-3">
              <Waves className="h-4 w-4 text-cyan-400" />
              <span className="text-sm text-muted-foreground">Water Bodies</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Regions */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-3">
          <Crown className="h-6 w-6 text-accent" />
          Regions & Territories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {regions.map((region, index) => (
            <Card key={index} className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical">
              <CardHeader>
                <CardTitle className="text-lg text-foreground flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${region.color} border`}>
                    <region.icon className="h-5 w-5" />
                  </div>
                  {region.name}
                </CardTitle>
                <CardDescription>
                  {region.type} • Ruled by {region.ruler}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Population:</span>
                  <span className="text-foreground">{region.population}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Climate:</span>
                  <span className="text-foreground">{region.climate}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Points of Interest */}
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-3">
          <MapPin className="h-6 w-6 text-accent" />
          Points of Interest
        </h2>
        <div className="grid gap-4">
          {pointsOfInterest.map((poi, index) => (
            <Card key={index} className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{poi.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {poi.type}
                      </Badge>
                      <Badge className={getDifficultyColor(poi.difficulty)}>
                        {poi.difficulty}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{poi.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={poi.discovered ? "default" : "secondary"} className="text-xs">
                      {poi.discovered ? "Discovered" : "Hidden"}
                    </Badge>
                    <Button variant="outline" size="sm" className="border-accent/30 text-accent hover:bg-accent/10">
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default WorldMap