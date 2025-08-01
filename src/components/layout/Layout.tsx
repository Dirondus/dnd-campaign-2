import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { GlobalSearch } from "@/components/GlobalSearch"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const navigate = useNavigate()

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Signed out successfully!')
    }
  }

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
            <div className="flex items-center gap-4">
              <GlobalSearch onResultClick={(path) => navigate(path)} />
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </header>
          
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}