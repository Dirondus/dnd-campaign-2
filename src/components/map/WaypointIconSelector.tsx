import { 
  Castle, 
  Trees, 
  Mountain, 
  Waves, 
  Home, 
  Swords, 
  Crown, 
  Skull, 
  Map,
  MapPin,
  Compass,
  Landmark
} from "lucide-react"

export const waypointCategories = [
  { value: 'kingdom', label: 'Kingdom', icon: Castle, color: 'text-blue-400' },
  { value: 'forest', label: 'Forest', icon: Trees, color: 'text-green-400' },
  { value: 'mountain', label: 'Mountain', icon: Mountain, color: 'text-gray-400' },
  { value: 'water', label: 'Water', icon: Waves, color: 'text-cyan-400' },
  { value: 'city', label: 'City', icon: Home, color: 'text-yellow-400' },
  { value: 'dungeon', label: 'Dungeon', icon: Swords, color: 'text-red-400' },
  { value: 'capital', label: 'Capital', icon: Crown, color: 'text-purple-400' },
  { value: 'ruins', label: 'Ruins', icon: Skull, color: 'text-orange-400' },
  { value: 'landmark', label: 'Landmark', icon: Landmark, color: 'text-pink-400' },
  { value: 'location', label: 'General Location', icon: MapPin, color: 'text-accent' }
]

export const getWaypointIcon = (category: string) => {
  const found = waypointCategories.find(cat => cat.value === category)
  return found || waypointCategories[waypointCategories.length - 1] // Default to location
}

interface WaypointIconProps {
  category: string
  size?: number
  className?: string
}

export const WaypointIcon = ({ category, size = 16, className = '' }: WaypointIconProps) => {
  const { icon: Icon, color } = getWaypointIcon(category)
  return <Icon size={size} className={`${color} ${className}`} />
}