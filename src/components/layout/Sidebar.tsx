import { BarChart3, ChevronLeft, ChevronRight, Database, Home, LayoutDashboard, Settings, Star, Users } from "lucide-react";
import { NavLink } from "react-router-dom";
import { fine } from "@/lib/fine";
import { useSidebar } from "./sidebar-provider";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dashboard } from "@/types/dashboard";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { data: session } = fine.auth.useSession();
  const isAdmin = session?.user?.email === "admin@example.com"; // Simple admin check for demo
  const { expanded, toggleExpanded } = useSidebar();
  const [favoriteDashboards, setFavoriteDashboards] = useState<Dashboard[]>([]);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!session?.user) return;
      
      try {
        // In a real app, we would fetch favorites from a dedicated table
        // For this demo, we'll use localStorage to store favorites
        const storedFavorites = localStorage.getItem(`favorites_${session.user.id}`);
        if (storedFavorites) {
          setFavoriteDashboards(JSON.parse(storedFavorites));
        }
      } catch (error) {
        console.error("Error fetching favorites:", error);
      }
    };
    
    fetchFavorites();
  }, [session]);

  return (
    <div className="relative h-full">
      <Sidebar expanded={expanded} className="border-r">
        <div className="absolute right-0 top-2 z-10">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={toggleExpanded}
          >
            {expanded ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>
        
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>{expanded ? "Dashboards" : ""}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                        isActive ? "text-primary" : ""
                      }
                    >
                      <Home className="h-5 w-5 mr-2" />
                      {expanded && <span>Home</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/dashboards"
                      className={({ isActive }) =>
                        isActive ? "text-primary" : ""
                      }
                    >
                      <LayoutDashboard className="h-5 w-5 mr-2" />
                      {expanded && <span>My Dashboards</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/templates"
                      className={({ isActive }) =>
                        isActive ? "text-primary" : ""
                      }
                    >
                      <BarChart3 className="h-5 w-5 mr-2" />
                      {expanded && <span>Templates</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          {favoriteDashboards.length > 0 && (
            <SidebarGroup>
              <SidebarGroupLabel>{expanded ? "Favorites" : ""}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {favoriteDashboards.map((dashboard) => (
                    <SidebarMenuItem key={dashboard.id}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={`/dashboards/${dashboard.id}`}
                          className={({ isActive }) =>
                            isActive ? "text-primary" : ""
                          }
                        >
                          <Star className="h-5 w-5 mr-2 fill-current" />
                          {expanded && <span className="truncate">{dashboard.name}</span>}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}

          {isAdmin && (
            <SidebarGroup>
              <SidebarGroupLabel>{expanded ? "Administration" : ""}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/admin/databases"
                        className={({ isActive }) =>
                          isActive ? "text-primary" : ""
                        }
                      >
                        <Database className="h-5 w-5 mr-2" />
                        {expanded && <span>Database Connections</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/admin/users"
                        className={({ isActive }) =>
                          isActive ? "text-primary" : ""
                        }
                      >
                        <Users className="h-5 w-5 mr-2" />
                        {expanded && <span>User Management</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/admin/settings"
                        className={({ isActive }) =>
                          isActive ? "text-primary" : ""
                        }
                      >
                        <Settings className="h-5 w-5 mr-2" />
                        {expanded && <span>Settings</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )}
        </SidebarContent>
      </Sidebar>
    </div>
  );
}