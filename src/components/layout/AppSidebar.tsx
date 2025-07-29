import { 
  Users, 
  BookOpen, 
  Map, 
  UserCheck, 
  Skull, 
  Home,
  Wand2,
  LogOut,
  Crown
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const navigationItems = [
  { title: "Campaign Home", url: "/", icon: Home },
  { title: "Groups", url: "/groups", icon: Users },
  { title: "Lore & World", url: "/lore", icon: BookOpen },
  { title: "World Map", url: "/map", icon: Map },
  { title: "NPCs", url: "/npcs", icon: UserCheck },
  { title: "Monsters", url: "/monsters", icon: Skull },
]

const campaignItems = [
  { title: "Campaign Tools", url: "/tools", icon: Wand2 },
]

export function AppSidebar() {
  const { state } = useSidebar()
  const { profile, signOut, isAdmin } = useAuth()
  const location = useLocation()
  const currentPath = location.pathname
  const isCollapsed = state === "collapsed"

  const isActive = (path: string) => currentPath === path
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground shadow-glow-primary" : "hover:bg-muted/50 hover:shadow-golden transition-magical"

  return (
    <Sidebar
      className="bg-gradient-dark border-border shadow-deep"
      collapsible="icon"
    >
      <div className="p-4 border-b border-border">
        {!isCollapsed && (
          <h2 className="text-xl font-bold bg-gradient-accent bg-clip-text text-transparent">
            Campaign Portal
          </h2>
        )}
      </div>

      <SidebarContent className="p-2 flex flex-col h-full">
        <SidebarGroup>
          <SidebarGroupLabel className="text-accent font-semibold mb-2">
            Main Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={`${getNavCls({ isActive: isActive(item.url) })} rounded-md p-2 flex items-center gap-3`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className="text-accent font-semibold mb-2">
            Campaign Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {campaignItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end 
                      className={`${getNavCls({ isActive: isActive(item.url) })} rounded-md p-2 flex items-center gap-3`}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span className="font-medium">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Info - Fixed at bottom */}
        <div className="mt-auto pt-4 border-t border-border">
          {profile && !isCollapsed && (
            <div className="p-3 rounded-lg bg-muted/30 mb-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
                  {isAdmin && <Crown className="h-4 w-4 text-accent-foreground" />}
                  {!isAdmin && <span className="text-sm font-bold text-accent-foreground">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {profile.display_name || profile.username}
                  </p>
                  <div className="flex items-center gap-1">
                    <Badge 
                      variant={isAdmin ? "default" : "secondary"} 
                      className={`text-xs ${isAdmin ? "bg-accent text-accent-foreground" : ""}`}
                    >
                      {profile.role}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            onClick={signOut}
            className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-muted/50"
          >
            <LogOut className="h-4 w-4 mr-3" />
            {!isCollapsed && "Sign Out"}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}