import { 
  Users, 
  BookOpen, 
  Map, 
  UserCheck, 
  Skull, 
  Home,
  Sword,
  Shield
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"

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
  { title: "Sessions", url: "/sessions", icon: Sword },
  { title: "Equipment", url: "/equipment", icon: Shield },
]

export function AppSidebar() {
  const { state } = useSidebar()
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

      <SidebarContent className="p-2">
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
      </SidebarContent>
    </Sidebar>
  )
}