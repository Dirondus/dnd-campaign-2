import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SessionForm } from "@/components/forms/SessionForm"
import { Plus, Edit, Calendar, Trash2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface SessionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupName: string
  groupId: string
}

export const SessionsDialog = ({ open, onOpenChange, groupName, groupId }: SessionsDialogProps) => {
  const [sessions, setSessions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [sessionFormOpen, setSessionFormOpen] = useState(false)
  const [editingSession, setEditingSession] = useState<any>(null)

  useEffect(() => {
    if (open && groupId) {
      fetchSessions()
    }
  }, [open, groupId])

  const fetchSessions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('group_id', groupId)
        .order('date', { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (error: any) {
      toast.error('Failed to load sessions: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async (sessionData: any) => {
    try {
      const user = await supabase.auth.getUser()
      if (!user.data.user) {
        toast.error('You must be logged in')
        return
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert([{
          ...sessionData,
          created_by: user.data.user.id
        }])
        .select()
        .single()

      if (error) throw error
      setSessions(prev => [data, ...prev])
      setSessionFormOpen(false)
    } catch (error: any) {
      toast.error('Failed to create session: ' + error.message)
    }
  }

  const handleUpdateSession = async (sessionData: any) => {
    try {
      const { data, error } = await supabase
        .from('sessions')
        .update(sessionData)
        .eq('id', sessionData.id)
        .select()
        .single()

      if (error) throw error
      setSessions(prev => prev.map(s => s.id === sessionData.id ? data : s))
      setEditingSession(null)
      setSessionFormOpen(false)
    } catch (error: any) {
      toast.error('Failed to update session: ' + error.message)
    }
  }

  const handleEditSession = (session: any) => {
    setEditingSession(session)
    setSessionFormOpen(true)
  }

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('id', sessionId)

      if (error) throw error
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      toast.success('Session deleted successfully!')
    } catch (error: any) {
      toast.error('Failed to delete session: ' + error.message)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              Sessions for {groupName}
            </DialogTitle>
            <DialogDescription>
              Manage gaming sessions and track party progress
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Session History</h3>
              <Button 
                onClick={() => setSessionFormOpen(true)}
                className="bg-gradient-primary text-primary-foreground"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Session
              </Button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.length === 0 ? (
                  <Card className="bg-gradient-card border-border">
                    <CardContent className="p-8 text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Sessions Yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start recording your adventures!
                      </p>
                      <Button 
                        onClick={() => setSessionFormOpen(true)}
                        className="bg-gradient-primary text-primary-foreground"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Session
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  sessions.map((session) => (
                    <Card key={session.id} className="bg-gradient-card border-border">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{session.title}</CardTitle>
                            <CardDescription>{session.date} • {session.duration} minutes</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={session.status === 'completed' ? 'default' : session.status === 'ongoing' ? 'secondary' : 'outline'}
                            >
                              {session.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-sm mb-4">{session.summary}</p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4">
                            <span className="text-sm font-medium">XP Gained: {session.xp_gained || 0}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={() => handleEditSession(session)}
                              variant="outline" 
                              size="sm"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              onClick={() => handleDeleteSession(session.id)}
                              variant="outline" 
                              size="sm"
                              className="text-destructive border-destructive/30 hover:bg-destructive/10"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <SessionForm
        open={sessionFormOpen}
        onOpenChange={(open) => {
          setSessionFormOpen(open)
          if (!open) setEditingSession(null)
        }}
        onSubmit={editingSession ? handleUpdateSession : handleCreateSession}
        session={editingSession}
        groupId={groupId}
      />
    </>
  )
}