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
import { AdminSidebarSearch } from "@/components/navigation/AdminSidebarSearch";

export function UnifiedAdminSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  // On mobile, sidebar renders as a full-width Sheet overlay — always show text
  const collapsed = isMobile ? false : state === "collapsed";
  const location = useLocation();
  
  const [sidebarFilter, setSidebarFilter] = useState('');
  
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
      <SidebarContent className="glass-panel border-r border-border/50 relative overflow-hidden">
        {/* Substrate ambient glow in sidebar */}
        <div className="absolute inset-0 pointer-events-none animate-substrate-breathe">
          <div 
            className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.08), transparent)" }}
          />
          <div 
            className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl"
            style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.06), transparent)" }}
          />
        </div>
        
        {/* Logo Section */}
        <div className="p-3 sm:p-4 border-b border-border/50 relative">
          <NavLink to="/admin/intel" className="flex items-center gap-3" onClick={handleNavClick}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-neon-cyan flex items-center justify-center animate-signal-pulse flex-shrink-0">
              <Brain className="w-5 h-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="font-bold text-sm memory-stream-gradient-text truncate">CMPSBL</h2>
                <p className="text-[10px] text-muted-foreground tracking-widest uppercase truncate">Signal → Silicon</p>
              </div>
            )}
          </NavLink>
        </div>

        {/* Sidebar Search */}
        {!collapsed && (
          <AdminSidebarSearch onFilterChange={setSidebarFilter} />
        )}

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto py-2">
          {adminNavConfig.map((group, groupIndex) => {
            // Filter items by search query
            const filteredItems = sidebarFilter
              ? group.items.filter(i => i.label.toLowerCase().includes(sidebarFilter) || i.path.toLowerCase().includes(sidebarFilter))
              : group.items;
            if (sidebarFilter && filteredItems.length === 0) return null;
            const itemsToRender = sidebarFilter ? filteredItems : group.items;
            const hasActiveItem = itemsToRender.some(i => isActive(i.path));
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
                        {itemsToRender.map((item) => {
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
                      {itemsToRender.map((item) => {
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
          <div className="p-3 sm:p-4 border-t border-border/50 relative">
            <div className="h-[2px] w-full rounded-full memory-stream-bar mb-3 opacity-60" />
            <p className="text-[10px] text-muted-foreground text-center tracking-widest uppercase">
              Memory Stream · Admin
            </p>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
