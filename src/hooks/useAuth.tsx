import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { User, Session } from '@supabase/supabase-js'

interface Profile {
  id: string
  username: string
  role: 'admin' | 'user' | 'guest'
  display_name: string | null
}

interface AuthContextType {
  session: Session | null
  user: User | null
  profile: Profile | null
  isLoading: boolean
  signInWithUsername: (username: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        
        if (session?.user) {
          // Fetch user profile after authentication
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            if (profileData) {
              setProfile(profileData)
            }
          }, 0)
        } else {
          setProfile(null)
        }
        setIsLoading(false)
      }
    )

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Fetch user profile
        setTimeout(async () => {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          if (profileData) {
            setProfile(profileData)
          }
        }, 0)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithUsername = async (username: string) => {
    try {
      // First, find the profile with this username
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (profileError || !profileData) {
        return { error: new Error('Username not found') }
      }

      // Create a session for this user by setting their profile
      setProfile(profileData)
      
      // Create a mock session for username-based auth
      const mockUser = {
        id: profileData.id,
        email: `${username}@campaign.local`,
        user_metadata: { username: profileData.username },
        app_metadata: {},
        aud: 'authenticated',
        created_at: new Date().toISOString(),
      } as User

      const mockSession = {
        access_token: 'mock-token',
        token_type: 'bearer',
        user: mockUser,
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'mock-refresh',
      } as Session

      setSession(mockSession)
      setUser(mockUser)

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    setSession(null)
    setUser(null)
    setProfile(null)
  }

  const isAdmin = profile?.role === 'admin'

  const value = {
    session,
    user,
    profile,
    isLoading,
    signInWithUsername,
    signOut,
    isAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}