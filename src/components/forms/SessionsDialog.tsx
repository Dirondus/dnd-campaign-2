import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, Plus } from "lucide-react"

interface SessionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  groupName: string
}

export const SessionsDialog = ({ open, onOpenChange, groupName }: SessionsDialogProps) => {
  const sessions = [
    {
      id: 1,
      title: "The Goblin Cave",
      date: "2024-01-15",
      duration: "4 hours",
      status: "Completed",
      summary: "The party discovered a goblin hideout and rescued the missing villagers.",
      xpGained: 1200
    },
    {
      id: 2,
      title: "The Merchant's Dilemma",
      date: "2024-01-08",
      duration: "3.5 hours", 
      status: "Completed",
      summary: "Investigation into missing trade caravans revealed a bandit conspiracy.",
      xpGained: 800
    },
    {
      id: 3,
      title: "Temple of Shadows",
      date: "2024-01-22",
      duration: "5 hours",
      status: "Scheduled",
      summary: "Planned exploration of the ancient temple mentioned by the oracle.",
      xpGained: 0
    }
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <CalendarDays className="h-6 w-6 text-accent" />
            {groupName} - Sessions
          </DialogTitle>
          <DialogDescription>
            View and manage session history and upcoming adventures
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {sessions.filter(s => s.status === 'Completed').length} completed sessions
            </div>
            <Button size="sm" className="bg-gradient-primary text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              New Session
            </Button>
          </div>

          <div className="space-y-4">
            {sessions.map((session) => (
              <Card key={session.id} className="bg-gradient-card border-border">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{session.title}</CardTitle>
                      <CardDescription className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {session.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.duration}
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant={session.status === 'Completed' ? 'default' : 'secondary'}>
                      {session.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">{session.summary}</p>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      {session.xpGained > 0 && (
                        <Badge variant="outline" className="text-accent">
                          +{session.xpGained} XP
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}