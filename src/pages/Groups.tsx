import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Crown, Sword, Shield, Heart, Trash2 } from "lucide-react"
import { GroupForm } from "@/components/forms/GroupForm"
import { SessionsDialog } from "@/components/forms/SessionsDialog"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

const Groups = () => {
  const [groups, setGroups] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [groupFormOpen, setGroupFormOpen] = useState(false)
  const [sessionsDialogOpen, setSessionsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<any>(null)
  const [selectedGroupForSessions, setSelectedGroupForSessions] = useState<any>(null)

  useEffect(() => {
    fetchGroups()
  }, [])

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGroups(data || [])
    } catch (error: any) {
      toast.error('Failed to load groups: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGroup = async (groupData: any) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .insert([{
          name: groupData.name,
          description: groupData.description,
          status: groupData.status || 'Active',
          members: groupData.members || [],
          last_session: groupData.lastSession || null
        }])
        .select()
        .single()

      if (error) throw error
      setGroups(prev => [data, ...prev])
      toast.success('Group created successfully!')
    } catch (error: any) {
      toast.error('Failed to create group: ' + error.message)
    }
  }

  const handleEditGroup = (group: any) => {
    setEditingGroup(group)
    setGroupFormOpen(true)
  }

  const handleUpdateGroup = async (updatedGroup: any) => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .update({
          name: updatedGroup.name,
          description: updatedGroup.description,
          status: updatedGroup.status,
          members: updatedGroup.members,
          last_session: updatedGroup.lastSession
        })
        .eq('id', updatedGroup.id)
        .select()
        .single()

      if (error) throw error
      setGroups(prev => prev.map(group => 
        group.id === updatedGroup.id ? data : group
      ))
      setEditingGroup(null)
      toast.success('Group updated successfully!')
    } catch (error: any) {
      toast.error('Failed to update group: ' + error.message)
    }
  }

  const handleViewSessions = (group: any) => {
    setSelectedGroupForSessions(group)
    setSessionsDialogOpen(true)
  }

  const handleDeleteGroup = async (groupId: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return

    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupId)

      if (error) throw error
      setGroups(prev => prev.filter(g => g.id !== groupId))
      toast.success('Group deleted successfully!')
    } catch (error: any) {
      toast.error('Failed to delete group: ' + error.message)
    }
  }

  const getWeaponIcon = (weapon: string) => {
    switch (weapon) {
      case "Sword": return <Sword className="h-4 w-4" />
      case "Shield": return <Shield className="h-4 w-4" />
      case "Bow": return <Crown className="h-4 w-4" />
      case "Staff": return <Crown className="h-4 w-4" />
      default: return <Sword className="h-4 w-4" />
    }
  }

  const getElementColor = (element: string) => {
    switch (element) {
      case "Fire": return "bg-red-500/20 text-red-400 border-red-500/30"
      case "Water": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Earth": return "bg-green-500/20 text-green-400 border-green-500/30"
      case "Wind": return "bg-gray-500/20 text-gray-400 border-gray-500/30"
      case "Light": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Dark": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
      case "Ice": return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
      default: return "bg-accent/20 text-accent border-accent/30"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            Adventuring Groups
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your active adventuring parties
          </p>
        </div>
        <Button 
          onClick={() => setGroupFormOpen(true)}
          className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Group
        </Button>
      </div>

      <div className="grid gap-6">
        {groups.length === 0 ? (
          <Card className="bg-gradient-card border-border shadow-deep">
            <CardContent className="p-12 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No Groups Created Yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start by creating your first adventuring group. Add party members, track their progress, and manage sessions.
              </p>
              <Button 
                onClick={() => setGroupFormOpen(true)}
                className="bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          groups.map((group) => (
            <Card key={group.id} className="bg-gradient-card border-border shadow-deep hover:shadow-magical transition-magical">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-foreground flex items-center gap-3">
                      <Users className="h-6 w-6 text-accent" />
                      {group.name}
                    </CardTitle>
                    <CardDescription className="mt-2 text-muted-foreground">
                      {group.description}
                    </CardDescription>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge 
                      variant={group.status === "Active" ? "default" : "secondary"}
                      className={group.status === "Active" ? "bg-accent text-accent-foreground" : ""}
                    >
                      {group.status}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Last: {group.last_session || 'Never'}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {group.members?.map((member: any, index: number) => (
                    <div 
                      key={index}
                      className="p-4 rounded-lg bg-muted/50 border border-border hover:bg-muted/70 transition-magical"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-foreground">{member.name}</h4>
                        <div className="flex gap-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getElementColor(member.element)} border`}
                          >
                            {member.element}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className="text-xs border-accent/30"
                          >
                            <span className="flex items-center gap-1">
                              {getWeaponIcon(member.weapon)}
                              {member.weapon}
                            </span>
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Level {member.level} {member.element} User
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-2">
                  <Button 
                    onClick={() => handleEditGroup(group)}
                    variant="outline" 
                    className="flex-1 border-accent/30 text-accent hover:bg-accent/10"
                  >
                    Edit Group
                  </Button>
                  <Button 
                    onClick={() => handleViewSessions(group)}
                    variant="outline" 
                    className="flex-1 border-primary/30 text-primary hover:bg-primary/10"
                  >
                    View Sessions
                  </Button>
                  <Button 
                    onClick={() => handleDeleteGroup(group.id)}
                    variant="outline" 
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <GroupForm
        open={groupFormOpen}
        onOpenChange={(open) => {
          setGroupFormOpen(open)
          if (!open) setEditingGroup(null)
        }}
        onSubmit={editingGroup ? handleUpdateGroup : handleCreateGroup}
        group={editingGroup}
      />

      <SessionsDialog
        open={sessionsDialogOpen}
        onOpenChange={setSessionsDialogOpen}
        groupName={selectedGroupForSessions?.name || ''}
      />
    </div>
  )
}

export default Groups