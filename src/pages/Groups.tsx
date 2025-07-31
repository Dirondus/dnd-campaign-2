import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Plus, Crown, Sword, Shield, Heart, Trash2 } from "lucide-react"
import { GroupForm } from "@/components/forms/GroupForm"
import { SessionsDialog } from "@/components/forms/SessionsDialog"
import { saveToStorage, loadFromStorage } from "@/lib/storage"

const Groups = () => {
  const [groups, setGroups] = useState(() => loadFromStorage('groups', []))

  const [groupFormOpen, setGroupFormOpen] = useState(false)
  const [sessionsDialogOpen, setSessionsDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<any>(null)
  const [selectedGroupForSessions, setSelectedGroupForSessions] = useState<any>(null)

  useEffect(() => {
    saveToStorage('groups', groups)
  }, [groups])

  const handleCreateGroup = (groupData: any) => {
    setGroups(prev => [...prev, groupData])
  }

  const handleEditGroup = (group: any) => {
    setEditingGroup(group)
    setGroupFormOpen(true)
  }

  const handleUpdateGroup = (updatedGroup: any) => {
    setGroups(prev => prev.map(group => 
      group.id === updatedGroup.id ? updatedGroup : group
    ))
    setEditingGroup(null)
  }

  const handleViewSessions = (group: any) => {
    setSelectedGroupForSessions(group)
    setSessionsDialogOpen(true)
  }

  const handleDeleteGroup = (groupId: number) => {
    setGroups(prev => prev.filter(g => g.id !== groupId))
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            Adventuring Groups
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage your three active adventuring parties
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
        {groups.map((group) => (
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
                    Last: {group.lastSession}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {group.members.map((member, index) => (
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
        ))}
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