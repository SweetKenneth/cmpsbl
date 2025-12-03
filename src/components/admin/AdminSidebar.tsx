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
import {
  LayoutDashboard,
  Brain,
  Shield,
  Briefcase,
  Eye,
  Sparkles,
  Users,
  Key,
  Settings,
  Database,
  Activity,
  CreditCard,
  Rocket,
  BarChart3,
  TrendingUp,
  Network,
  Zap,
  Server,
  GitBranch,
  CloudCog,
} from "lucide-react";

const navigationGroups = [
  {
    title: "Dashboards",
    items: [
      { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Vision Control", href: "/admin/vision", icon: Brain },
      { name: "Defense Shield", href: "/admin/defense", icon: Shield },
      { name: "Projects", href: "/admin/projects", icon: Briefcase },
      { name: "Clarity", href: "/admin/clarity", icon: Eye },
    ],
  },
  {
    title: "Brain Tools",
    items: [
      { name: "Brain Hub", href: "/brain-hub", icon: Brain },
      { name: "ML Engine", href: "/brain-ml", icon: Database },
      { name: "Analytics", href: "/brain-analytics", icon: BarChart3 },
      { name: "Learning", href: "/brain-learning", icon: TrendingUp },
      { name: "Sentience", href: "/sentience-hub", icon: Sparkles },
    ],
  },
  {
    title: "System",
    items: [
      { name: "Health Monitor", href: "/admin/system-health", icon: Activity },
      { name: "System Map", href: "/admin/system-map", icon: Network },
      { name: "Cascade Dreams", href: "/admin/cascade-dreams", icon: CloudCog },
      { name: "Deployment", href: "/admin/deployment", icon: Rocket },
      { name: "Diagnostics", href: "/admin/diagnostics", icon: Server },
      { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
  },
  {
    title: "Management",
    items: [
      { name: "Users", href: "/admin/users", icon: Users },
      { name: "API Keys", href: "/admin/api-keys", icon: Key },
      { name: "Access Control", href: "/admin/access-control", icon: Shield },
      { name: "Billing", href: "/admin/billing", icon: CreditCard },
    ],
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;
  const getNavClass = (path: string) =>
    isActive(path)
      ? "bg-primary/10 text-primary border-l-2 border-primary font-medium glow-primary"
      : "hover:bg-muted/50 hover:text-foreground";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="glass-panel border-r">
        {/* Logo Section */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center animate-pulse-glow">
              <Brain className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h2 className="font-bold text-sm gradient-text">PromptFluid</h2>
                <p className="text-xs text-muted-foreground">Vision Admin</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Groups */}
        {navigationGroups.map((group, groupIndex) => (
          <SidebarGroup key={group.title} className="animate-fade-in-left" style={{ animationDelay: `${groupIndex * 0.1}s` }}>
            {!collapsed && (
              <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground">
                {group.title}
              </SidebarGroupLabel>
            )}
            
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${getNavClass(item.href)}`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        {!collapsed && <span className="text-sm">{item.name}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
