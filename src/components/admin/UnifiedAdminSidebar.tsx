import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Brain } from "lucide-react";
import { adminNavConfig } from "@/config/adminNavConfig";
import { cn } from "@/lib/utils";

export function UnifiedAdminSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") {
      return location.pathname === path || location.pathname === "/admin";
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const handleNavClick = () => {
    // Auto-close sidebar on mobile after navigation
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar className={cn(collapsed ? "w-14" : "w-64")} collapsible="icon">
      <SidebarContent className="glass-panel border-r border-border/50">
        {/* Logo Section */}
        <div className="p-3 sm:p-4 border-b border-border/50">
          <NavLink to="/admin/dashboard" className="flex items-center gap-3" onClick={handleNavClick}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center animate-pulse-glow flex-shrink-0">
              <Brain className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="font-bold text-sm gradient-text truncate">CMPSBL</h2>
                <p className="text-xs text-muted-foreground truncate">Substrate Admin</p>
              </div>
            )}
          </NavLink>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-2">
          {adminNavConfig.map((group, groupIndex) => (
            <SidebarGroup
              key={group.id}
              className="animate-fade-in-left px-2"
              style={{ animationDelay: `${groupIndex * 0.05}s` }}
            >
              {!collapsed && (
                <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground px-3 py-2">
                  {group.title}
                </SidebarGroupLabel>
              )}

              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active = isActive(item.path);
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.path}
                            onClick={handleNavClick}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2.5 sm:py-2 rounded-lg transition-all duration-200",
                              active
                                ? "bg-primary/10 text-primary border-l-2 border-primary font-medium"
                                : "hover:bg-muted/50 hover:text-foreground text-muted-foreground"
                            )}
                          >
                            <item.icon className="w-5 h-5 flex-shrink-0" />
                            {!collapsed && (
                              <span className="text-sm truncate">{item.label}</span>
                            )}
                            {!collapsed && item.badge && (
                              <span className="ml-auto text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                                {item.badge}
                              </span>
                            )}
                            {!collapsed && item.isNew && (
                              <span className="ml-auto text-xs bg-green-500/20 text-green-500 px-1.5 py-0.5 rounded">
                                New
                              </span>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>

        {/* Footer */}
        {!collapsed && (
          <div className="p-3 sm:p-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground text-center">
              CMPSBL Admin
            </p>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
