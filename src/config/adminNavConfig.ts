import {
  LayoutDashboard,
  Brain,
  Shield,
  Sparkles,
  Users,
  Key,
  Settings,
  Activity,
  CreditCard,
  Network,
  BookOpen,
  Zap,
  FileText,
  Lock,
  Cpu,
  ScrollText,
  HeartPulse,
  Moon,
  Hammer,
  Terminal,
  Gauge,
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
      { id: "os", label: "Substrate OS", path: "/os", icon: Cpu },
      { id: "substrate", label: "Dashboard", path: "/substrate", icon: LayoutDashboard },
      { id: "system-feed", label: "System Feed", path: "/system-feed", icon: Brain, isNew: true },
      { id: "dream-eater", label: "Dream Eater", path: "/feed-dream-eater", icon: Moon },
      { id: "decode", label: "Decode", path: "/decode", icon: Terminal },
    ],
  },
  {
    id: "tools",
    title: "Tools",
    items: [
      { id: "cognitive-forge", label: "Cognitive Forge", path: "/forge", icon: Hammer, isNew: true },
      { id: "codelab", label: "CodeLab", path: "/codelab", icon: Terminal },
      { id: "devtools", label: "DevTools", path: "/devtools", icon: Terminal },
      { id: "capabilities", label: "Capabilities", path: "/capabilities", icon: Sparkles, badge: "86+" },
      { id: "synergies", label: "Synergies", path: "/synergies", icon: Network, badge: "120" },
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise",
    items: [
      { id: "intelligence", label: "Intelligence", path: "/intelligence", icon: Zap },
      { id: "marketplace", label: "Marketplace", path: "/marketplace", icon: Gauge },
      { id: "licensing", label: "Licensing", path: "/substrate/licensing", icon: FileText },
      { id: "patches", label: "Patch Distribution", path: "/admin/patches", icon: Shield, isNew: true },
      { id: "use-cases", label: "Use Cases", path: "/use-cases", icon: BookOpen },
    ],
  },
  {
    id: "system",
    title: "System",
    items: [
      { id: "proof", label: "Proof Mode", path: "/proof", icon: Shield },
      { id: "demo", label: "Demo", path: "/demo", icon: Activity },
      { id: "audit", label: "Audit Trail", path: "/audit", icon: ScrollText },
      { id: "lab", label: "Lab", path: "/lab", icon: HeartPulse },
    ],
  },
  {
    id: "resources",
    title: "Resources",
    items: [
      { id: "docs", label: "Documentation", path: "/documentation", icon: BookOpen },
      { id: "library", label: "Library", path: "/library", icon: FileText },
      { id: "developers", label: "Developers", path: "/developers", icon: Users },
      { id: "changelog", label: "Changelog", path: "/changelog", icon: Activity },
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
