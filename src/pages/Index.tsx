import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Users, BookOpen, Map, UserCheck, Skull, Dice6, Save } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import heroImage from "@/assets/dnd-hero.jpg"

const Index = () => {
  const navigate = useNavigate()
  const [quickNotes, setQuickNotes] = useState('')
  const [stats, setStats] = useState({
    groups: 0,
    npcs: 0,
    monsters: 0,
    loreEntries: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
    loadQuickNotes()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [groupsData, npcsData, monstersData, loreData] = await Promise.all([
        supabase.from('groups').select('id'),
        supabase.from('npcs').select('id'),
        supabase.from('monsters').select('id'),
        supabase.from('lore_entries').select('id')
      ])

      setStats({
        groups: groupsData.data?.length || 0,
        npcs: npcsData.data?.length || 0,
        monsters: monstersData.data?.length || 0,
        loreEntries: loreData.data?.length || 0
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadQuickNotes = () => {
    const saved = localStorage.getItem('campaign-quick-notes')
    if (saved) {
      setQuickNotes(saved)
    }
  }

  const saveQuickNotes = () => {
    localStorage.setItem('campaign-quick-notes', quickNotes)
    toast.success('Notes saved!')
  }
  
  const quickActions = [
    { title: "Manage Groups", description: "View and organize your 3 party groups", icon: Users, href: "/groups", color: "bg-gradient-primary" },
    { title: "Explore Lore", description: "Dive into the world's rich history", icon: BookOpen, href: "/lore", color: "bg-gradient-accent" },
    { title: "World Map", description: "Navigate the realm", icon: Map, href: "/map", color: "bg-gradient-primary" },
    { title: "NPCs Database", description: "Manage characters and allies", icon: UserCheck, href: "/npcs", color: "bg-gradient-accent" },
    { title: "Monster Manual", description: "Browse creatures and foes", icon: Skull, href: "/monsters", color: "bg-gradient-primary" },
    { title: "Campaign Tools", description: "Magic items, weapons, and pets", icon: Dice6, href: "/tools", color: "bg-gradient-accent" },
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative h-96 rounded-xl overflow-hidden shadow-magical">
        <img 
          src={heroImage} 
          alt="D&D Campaign World" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent flex items-center">
          <div className="p-8 max-w-2xl">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-accent bg-clip-text text-transparent">
              Welcome, Dungeon Master
            </h1>
            <p className="text-xl text-foreground/80 mb-6">
              Your campaign portal awaits. Manage groups, craft lore, and guide your adventurers through epic tales.
            </p>
            <Button 
              className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
              onClick={() => navigate('/tools')}
            >
              Begin Adventure
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Link key={action.title} to={action.href}>
            <Card className="h-full bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical hover:scale-[1.02] group">
              <CardHeader>
                <div className={`w-12 h-12 rounded-lg ${action.color} flex items-center justify-center mb-3 shadow-golden group-hover:shadow-glow-accent transition-glow`}>
                  <action.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <CardTitle className="text-foreground group-hover:text-accent transition-magical">
                  {action.title}
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {action.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      {/* Campaign Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gradient-card border-border shadow-deep">
          <CardHeader>
            <CardTitle className="text-accent">Campaign Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Active Groups:</span>
              <span className="text-2xl font-bold text-accent">{loading ? '...' : stats.groups}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">NPCs Created:</span>
              <span className="text-2xl font-bold text-accent">{loading ? '...' : stats.npcs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Monsters Catalogued:</span>
              <span className="text-2xl font-bold text-accent">{loading ? '...' : stats.monsters}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Lore Entries:</span>
              <span className="text-2xl font-bold text-accent">{loading ? '...' : stats.loreEntries}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-deep">
          <CardHeader>
            <CardTitle className="text-accent flex items-center justify-between">
              Quick Notes
              <Button 
                onClick={saveQuickNotes}
                size="sm"
                variant="outline"
                className="border-accent/30 text-accent hover:bg-accent/10"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={quickNotes}
              onChange={(e) => setQuickNotes(e.target.value)}
              placeholder="Jot down quick notes about your campaign..."
              rows={4}
              className="bg-background/50 border-border"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
