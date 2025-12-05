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
  Server,
  CloudCog,
  BookOpen,
  Zap,
  Globe,
  FileText,
  Lock,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  isNew?: boolean;
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export const adminNavConfig: NavGroup[] = [
  {
    id: "dashboards",
    title: "Dashboards",
    items: [
      { id: "overview", label: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
      { id: "vision", label: "Vision Control", path: "/admin/vision", icon: Brain },
      { id: "defense", label: "Defense Shield", path: "/admin/defense", icon: Shield },
      { id: "projects", label: "Projects", path: "/admin/projects", icon: Briefcase },
      { id: "clarity", label: "Clarity", path: "/admin/clarity", icon: Eye },
    ],
  },
  {
    id: "brain-tools",
    title: "Brain Tools",
    items: [
      { id: "brain-hub", label: "Brain Hub", path: "/brain-hub", icon: Brain },
      { id: "brain-ml", label: "ML Engine", path: "/brain-ml", icon: Database },
      { id: "brain-analytics", label: "Analytics", path: "/brain-analytics", icon: BarChart3 },
      { id: "brain-learning", label: "Learning", path: "/brain-learning", icon: TrendingUp },
      { id: "brain-training", label: "Training", path: "/brain-training", icon: BookOpen },
      { id: "sentience", label: "Sentience", path: "/sentience-hub", icon: Sparkles },
    ],
  },
  {
    id: "clarity-tools",
    title: "Clarity Tools",
    items: [
      { id: "clarity-dashboard", label: "Dashboard", path: "/clarity/dashboard", icon: Eye },
      { id: "clarity-portfolio", label: "Portfolio", path: "/clarity/portfolio", icon: Globe },
      { id: "clarity-reports", label: "Reports", path: "/clarity/reports", icon: FileText },
      { id: "clarity-admin", label: "Admin Panel", path: "/clarity/admin", icon: Settings },
    ],
  },
  {
    id: "system",
    title: "System",
    items: [
      { id: "system-health", label: "Health Monitor", path: "/admin/system-health", icon: Activity },
      { id: "system-map", label: "System Map", path: "/admin/system-map", icon: Network },
      { id: "cascade-dreams", label: "Cascade Dreams", path: "/admin/cascade-dreams", icon: CloudCog },
      { id: "deployment", label: "Deployment", path: "/admin/deployment", icon: Rocket },
      { id: "diagnostics", label: "Diagnostics", path: "/admin/diagnostics", icon: Server },
      { id: "settings", label: "Settings", path: "/admin/settings", icon: Settings },
    ],
  },
  {
    id: "management",
    title: "Management",
    items: [
      { id: "users", label: "Users", path: "/admin/users", icon: Users },
      { id: "api-keys", label: "API Keys", path: "/admin/api-keys", icon: Key },
      { id: "access-control", label: "Access Control", path: "/admin/access-control", icon: Lock },
      { id: "billing", label: "Billing", path: "/admin/billing", icon: CreditCard },
    ],
  },
];

// Flat list for quick lookups
export const allAdminNavItems = adminNavConfig.flatMap((group) => group.items);

// Get nav item by path
export const getNavItemByPath = (path: string): NavItem | undefined => {
  return allAdminNavItems.find((item) => item.path === path);
};

// Check if path is in admin nav
export const isAdminPath = (path: string): boolean => {
  return allAdminNavItems.some((item) => path.startsWith(item.path));
};
