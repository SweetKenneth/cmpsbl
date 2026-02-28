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
import { Brain, ChevronDown } from "lucide-react";
import { adminNavConfig } from "@/config/adminNavConfig";
import { cn } from "@/lib/utils";
import { useState, useCallback } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function UnifiedAdminSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  // On mobile, sidebar renders as a full-width Sheet overlay — always show text
  const collapsed = isMobile ? false : state === "collapsed";
  const location = useLocation();
  
  // Track which groups are expanded on mobile (all expanded by default)
  // Auto-expand group containing active route, collapse others on mobile
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const active = adminNavConfig.find(g => 
      g.items.some(i => location.pathname === i.path || location.pathname.startsWith(i.path + "/"))
    );
    // On initial load: expand the active group (or all if desktop)
    return new Set(active ? [active.id] : adminNavConfig.map(g => g.id));
  });
  
  const toggleGroup = useCallback((groupId: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      return next;
    });
  }, []);

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
          {adminNavConfig.map((group, groupIndex) => {
            const hasActiveItem = group.items.some(i => isActive(i.path));
            const isExpanded = expandedGroups.has(group.id);

            return (
            <SidebarGroup
              key={group.id}
              className="animate-fade-in-left px-2"
              style={{ animationDelay: `${groupIndex * 0.05}s` }}
            >
              {!collapsed && isMobile ? (
                <Collapsible open={isExpanded} onOpenChange={() => toggleGroup(group.id)}>
                  <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 min-h-[44px] touch-manipulation group">
                    <span className={cn(
                      "text-xs uppercase tracking-wider font-semibold",
                      hasActiveItem ? "text-primary" : "text-muted-foreground"
                    )}>
                      {group.title}
                      {hasActiveItem && !isExpanded && (
                        <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-primary" />
                      )}
                    </span>
                    <ChevronDown className={cn(
                      "w-4 h-4 text-muted-foreground transition-transform",
                      isExpanded && "rotate-180"
                    )} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
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
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 min-h-[44px] touch-manipulation",
                                    active
                                      ? "bg-primary/10 text-primary border-l-2 border-primary font-medium"
                                      : "hover:bg-muted/50 hover:text-foreground text-muted-foreground"
                                  )}
                                >
                                  <item.icon className="w-5 h-5 flex-shrink-0" />
                                  <span className="text-sm truncate">{item.label}</span>
                                  {item.badge && (
                                    <span className="ml-auto text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded">
                                      {item.badge}
                                    </span>
                                  )}
                                  {item.isNew && (
                                    <span className="ml-auto text-xs bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded">
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
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <>
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
                                  <span className="ml-auto text-xs bg-accent/20 text-accent-foreground px-1.5 py-0.5 rounded">
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
                </>
              )}
            </SidebarGroup>
            );
          })}
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
