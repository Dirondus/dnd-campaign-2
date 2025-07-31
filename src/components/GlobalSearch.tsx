import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { loadFromStorage } from "@/lib/storage"

interface SearchResult {
  type: 'group' | 'lore' | 'npc' | 'monster' | 'magic-item' | 'weapon' | 'pet'
  title: string
  description: string
  path: string
}

interface GlobalSearchProps {
  onResultClick: (path: string) => void
}

export const GlobalSearch = ({ onResultClick }: GlobalSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [allData, setAllData] = useState<any>({})

  useEffect(() => {
    // Load all data from storage
    const groups = loadFromStorage('groups', [])
    const lore = loadFromStorage('lore', [])
    const npcs = loadFromStorage('npcs', [])
    const monsters = loadFromStorage('monsters', [])
    const magicItems = loadFromStorage('magic-items', [])
    const weapons = loadFromStorage('weapons', [])
    const pets = loadFromStorage('pets', [])

    setAllData({ groups, lore, npcs, monsters, magicItems, weapons, pets })
  }, [])

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([])
      return
    }

    const searchResults: SearchResult[] = []
    const term = searchTerm.toLowerCase()

    // Search groups
    allData.groups?.forEach((group: any) => {
      if (group.name.toLowerCase().includes(term) || 
          group.description?.toLowerCase().includes(term) ||
          group.members?.some((m: any) => m.name.toLowerCase().includes(term))) {
        searchResults.push({
          type: 'group',
          title: group.name,
          description: group.description || '',
          path: '/groups'
        })
      }
    })

    // Search lore
    allData.lore?.forEach((entry: any) => {
      if (entry.title.toLowerCase().includes(term) || 
          entry.content?.toLowerCase().includes(term) ||
          entry.tags?.some((tag: string) => tag.toLowerCase().includes(term))) {
        searchResults.push({
          type: 'lore',
          title: entry.title,
          description: entry.content?.substring(0, 100) + '...' || '',
          path: '/lore'
        })
      }
    })

    // Search NPCs
    allData.npcs?.forEach((npc: any) => {
      if (npc.name.toLowerCase().includes(term) || 
          npc.role?.toLowerCase().includes(term) ||
          npc.location?.toLowerCase().includes(term)) {
        searchResults.push({
          type: 'npc',
          title: npc.name,
          description: `${npc.role} in ${npc.location}`,
          path: '/npcs'
        })
      }
    })

    // Search monsters
    allData.monsters?.forEach((monster: any) => {
      if (monster.name.toLowerCase().includes(term) || 
          monster.type?.toLowerCase().includes(term) ||
          monster.elements?.some((el: string) => el.toLowerCase().includes(term))) {
        searchResults.push({
          type: 'monster',
          title: monster.name,
          description: `${monster.type} - Danger ${monster.dangerRating}`,
          path: '/monsters'
        })
      }
    })

    // Search magic items, weapons, pets
    // Search magic items, weapons, pets
    if (allData.magicItems) {
      allData.magicItems.forEach((item: any) => {
        if (item.name?.toLowerCase().includes(term) || 
            item.description?.toLowerCase().includes(term)) {
          searchResults.push({
            type: 'magic-item',
            title: item.name,
            description: item.description?.substring(0, 100) + '...' || '',
            path: '/tools'
          })
        }
      })
    }

    setResults(searchResults.slice(0, 10)) // Limit to 10 results
  }, [searchTerm, allData])

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search across all content..." 
          className="pl-10 w-full max-w-md bg-background/50 border-border"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border border-border rounded-md shadow-magical max-h-80 overflow-y-auto">
          {results.map((result, index) => (
            <div
              key={index}
              className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
              onClick={() => {
                onResultClick(result.path)
                setSearchTerm('')
                setResults([])
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs px-2 py-1 rounded bg-accent/20 text-accent">
                  {result.type}
                </span>
                <span className="font-medium text-foreground">{result.title}</span>
              </div>
              <p className="text-xs text-muted-foreground">{result.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}