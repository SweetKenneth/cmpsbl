import {
  LayoutDashboard,
  Brain,
  Shield,
  Eye,
  Sparkles,
  Users,
  Key,
  Settings,
  Activity,
  CreditCard,
  BarChart3,
  Network,
  BookOpen,
  Zap,
  Globe,
  FileText,
  Lock,
  Cpu,
  Microscope,
  Combine,
  Palette,
  Megaphone,
  ScrollText,
  HeartPulse,
  Moon,
  Beaker,
  Hammer,
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
    id: "core",
    title: "Core",
    items: [
      { id: "overview", label: "Overview", path: "/admin/dashboard", icon: LayoutDashboard },
      { id: "defense", label: "Defense", path: "/admin/defense", icon: Shield },
      { id: "clarity", label: "Clarity", path: "/clarity/dashboard", icon: Eye },
      { id: "dream-eater", label: "Dream Eater", path: "/feed-dream-eater", icon: Moon },
    ],
  },
  {
    id: "tools",
    title: "Tools",
    items: [
      { id: "cognitive-forge", label: "Cognitive Forge", path: "/forge", icon: Hammer, isNew: true },
    ],
  },
  {
    id: "labs",
    title: "Labs",
    items: [
      { id: "brain-hub", label: "Brain Hub", path: "/brain-hub", icon: Brain },
      { id: "creative-generation", label: "Creative Gen", path: "/creative-generation", icon: Sparkles },
      { id: "prompt-merger", label: "Prompt Merger", path: "/prompt-merger", icon: Combine, isNew: true },
      { id: "marketing-studio", label: "Marketing", path: "/marketing-studio", icon: Palette },
      { id: "sentience", label: "Sentience", path: "/sentience-hub", icon: Cpu },
      { id: "decode-mindmap", label: "Mindmap", path: "/decode-mindmap", icon: Network },
    ],
  },
  {
    id: "system",
    title: "System",
    items: [
      { id: "system-health", label: "Health", path: "/admin/system-health", icon: HeartPulse },
      { id: "cascade-status", label: "Cascade", path: "/admin/cascade-status", icon: Activity },
      { id: "diagnostics", label: "Diagnostics", path: "/admin/diagnostics", icon: Microscope },
      { id: "audit", label: "Audit", path: "/admin/audit", icon: ScrollText },
      { id: "settings", label: "Settings", path: "/admin/settings", icon: Settings },
    ],
  },
  {
    id: "management",
    title: "Manage",
    items: [
      { id: "users", label: "Users", path: "/admin/users", icon: Users },
      { id: "api-keys", label: "API Keys", path: "/admin/api-keys", icon: Key },
      { id: "access-control", label: "Access", path: "/admin/access-control", icon: Lock },
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
