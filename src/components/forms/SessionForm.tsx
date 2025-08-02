import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner'

interface SessionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (session: any) => void
  session?: any
  groupId: string
}

export const SessionForm = ({ open, onOpenChange, onSubmit, session, groupId }: SessionFormProps) => {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [duration, setDuration] = useState('')
  const [status, setStatus] = useState('completed')
  const [summary, setSummary] = useState('')
  const [xpGained, setXpGained] = useState('')

  useEffect(() => {
    if (session) {
      setTitle(session.title || '')
      setDate(session.date || '')
      setDuration(session.duration ? session.duration.toString() : '')
      setStatus(session.status || 'completed')
      setSummary(session.summary || '')
      setXpGained(session.xp_gained ? session.xp_gained.toString() : '')
    } else if (!open) {
      // Reset form when dialog closes without session data
      setTitle('')
      setDate('')
      setDuration('')
      setStatus('completed')
      setSummary('')
      setXpGained('')
    }
  }, [session, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title.trim() || !date) {
      toast.error('Please fill in required fields')
      return
    }

    const sessionData = {
      ...(session?.id && { id: session.id }),
      group_id: groupId,
      title: title.trim(),
      date,
      duration: duration ? parseInt(duration) : 0,
      status,
      summary: summary.trim(),
      xp_gained: xpGained ? parseInt(xpGained) : 0
    }

    onSubmit(sessionData)
    
    // Reset form
    setTitle('')
    setDate('')
    setDuration('')
    setStatus('completed')
    setSummary('')
    setXpGained('')
    
    toast.success(session ? 'Session updated!' : 'Session created!')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{session ? 'Edit Session' : 'Create New Session'}</DialogTitle>
          <DialogDescription>
            {session ? 'Update session details' : 'Record a new gaming session'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Session Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter session title"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="180"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="xp">XP Gained</Label>
              <Input
                id="xp"
                type="number"
                value={xpGained}
                onChange={(e) => setXpGained(e.target.value)}
                placeholder="1000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Session Summary</Label>
            <Textarea
              id="summary"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Describe what happened in this session..."
              rows={4}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {session ? 'Update Session' : 'Create Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}