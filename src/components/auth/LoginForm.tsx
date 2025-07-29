import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { LogIn, User } from 'lucide-react'

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { signInWithUsername } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) return

    setIsLoading(true)
    const { error } = await signInWithUsername(username.trim())
    
    if (error) {
      toast.error('Login failed: ' + error.message)
    } else {
      toast.success('Welcome to the campaign!')
    }
    setIsLoading(false)
  }

  const handleGuestLogin = async () => {
    setIsLoading(true)
    const { error } = await signInWithUsername('Guest')
    
    if (error) {
      toast.error('Failed to access guest account')
    } else {
      toast.success('Welcome, Guest!')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-dark p-4">
      <Card className="w-full max-w-md bg-gradient-card border-border shadow-magical">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            Campaign Portal
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your username to access the campaign
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-foreground">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background/50 border-border"
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-gradient-primary text-primary-foreground shadow-magical hover:shadow-glow-primary transition-glow"
              disabled={isLoading || !username.trim()}
            >
              <LogIn className="h-4 w-4 mr-2" />
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full border-accent/30 text-accent hover:bg-accent/10"
            onClick={handleGuestLogin}
            disabled={isLoading}
          >
            <User className="h-4 w-4 mr-2" />
            Continue as Guest
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            <p>Available usernames:</p>
            <p className="text-accent">Keyeen, Duane (Admins)</p>
            <p className="text-foreground">Dirondus (User)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}