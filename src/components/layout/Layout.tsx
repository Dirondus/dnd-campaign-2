import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { useAuth } from "@/hooks/useAuth"
import { Badge } from "@/components/ui/badge"
import { Crown } from "lucide-react"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { profile, isAdmin } = useAuth()
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-dark">
        <AppSidebar />
        
        <main className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm px-6">
            <div className="flex items-center">
              <SidebarTrigger className="text-accent hover:text-accent-glow transition-magical mr-4" />
              <h1 className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                D&D Campaign Hub
              </h1>
            </div>
            
            {profile && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {profile.display_name || profile.username}
                  </p>
                  <div className="flex items-center gap-1 justify-end">
                    <Badge 
                      variant={isAdmin ? "default" : "secondary"} 
                      className={`text-xs ${isAdmin ? "bg-accent text-accent-foreground" : ""}`}
                    >
                      {isAdmin && <Crown className="h-3 w-3 mr-1" />}
                      {profile.role}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </header>
          
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}