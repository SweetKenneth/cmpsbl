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
  Cpu,
  Microscope,
  Target,
  AlertTriangle,
  Search,
  Combine,
  Palette,
  Megaphone,
  Accessibility,
  GitBranch,
  ScrollText,
  Map as MapIcon,
  HeartPulse,
  Wrench,
  RefreshCw,
  Code,
  DollarSign,
  Download,
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
      { id: "brain-training", label: "Training", path: "/brain/training", icon: BookOpen },
      { id: "brain-learning", label: "Learning", path: "/brain-learning", icon: TrendingUp },
      { id: "brain-analytics", label: "Analytics", path: "/brain-analytics", icon: BarChart3 },
      { id: "cascade-mindmap", label: "Cascade Mindmap", path: "/cascade-mindmap", icon: Network },
      { id: "sentience", label: "Sentience Hub", path: "/sentience-hub", icon: Sparkles },
      { id: "learning-intelligence", label: "Learning Intelligence", path: "/learning-intelligence", icon: Cpu },
    ],
  },
  {
    id: "studio-tools",
    title: "Studio & Creation",
    items: [
      { id: "creative-generation", label: "Creative Generation", path: "/creative-generation", icon: Sparkles },
      { id: "prompt-merger", label: "Prompt Merger", path: "/prompt-merger", icon: Combine },
      { id: "marketing-studio", label: "Marketing Studio", path: "/marketing-studio", icon: Palette },
      { id: "creative-studio", label: "Creative Studio", path: "/admin/creative-studio", icon: Zap },
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
      { id: "system-health", label: "Health Monitor", path: "/admin/system-health", icon: HeartPulse },
      { id: "system-map", label: "System Map", path: "/admin/system-map", icon: MapIcon },
      { id: "cascade-dreams", label: "Cascade Dreams", path: "/admin/cascade-dreams", icon: CloudCog },
      { id: "cascade-status", label: "Cascade Status", path: "/admin/cascade-status", icon: Activity },
      { id: "cascade-governance", label: "Governance", path: "/admin/cascade-governance", icon: Shield },
      { id: "nexus", label: "Nexus Admin", path: "/admin/nexus", icon: Network },
      { id: "deployment", label: "Deployment", path: "/admin/deployment", icon: Rocket },
      { id: "diagnostics", label: "Diagnostics", path: "/admin/diagnostics", icon: Microscope },
      { id: "audit", label: "Audit Logs", path: "/admin/audit", icon: ScrollText },
      { id: "settings", label: "Settings", path: "/admin/settings", icon: Settings },
    ],
  },
  {
    id: "management",
    title: "Management",
    items: [
      { id: "users", label: "Users", path: "/admin/users", icon: Users },
      { id: "api-keys", label: "API Keys", path: "/admin/api-keys", icon: Key },
      { id: "reflex-keys", label: "Reflex Keys", path: "/admin/reflex-keys", icon: Key },
      { id: "access-control", label: "Access Control", path: "/admin/access-control", icon: Lock },
      { id: "billing", label: "Billing", path: "/admin/billing", icon: CreditCard },
      { id: "subscriptions", label: "Subscriptions", path: "/admin/subscriptions", icon: CreditCard },
    ],
  },
  {
    id: "business",
    title: "Business",
    items: [
      { id: "investor-packets", label: "Investor Packets", path: "/admin/investor-packets", icon: Briefcase },
      { id: "partnerships", label: "Partnerships", path: "/partnerships", icon: GitBranch },
      { id: "marketing", label: "Marketing", path: "/marketing", icon: Megaphone },
      { id: "ripple-network", label: "Ripple Network", path: "/ripple-network", icon: Network },
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
