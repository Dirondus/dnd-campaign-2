import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

interface SectionSearchProps {
  data: any[]
  onFilter: (filteredData: any[]) => void
  searchFields: string[]
  placeholder?: string
}

export const SectionSearch = ({ data, onFilter, searchFields, placeholder = "Search..." }: SectionSearchProps) => {
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!searchTerm.trim()) {
      onFilter(data)
      return
    }

    const term = searchTerm.toLowerCase()
    const filtered = data.filter(item => {
      return searchFields.some(field => {
        const value = getNestedValue(item, field)
        if (Array.isArray(value)) {
          return value.some(v => v?.toString().toLowerCase().includes(term))
        }
        return value?.toString().toLowerCase().includes(term)
      })
    })

    onFilter(filtered)
  }, [searchTerm, data, searchFields, onFilter])

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj)
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder={placeholder}
        className="pl-10 bg-background/50 border-border"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )
}