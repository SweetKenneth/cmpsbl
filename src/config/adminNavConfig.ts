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
  Eye,
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
    id: "control-plane",
    title: "Control Plane",
    items: [
      { id: "intel", label: "INTEL Panel", path: "/admin/intel", icon: Eye, isNew: true },
      { id: "s-tier-vault", label: "S-Tier Vault", path: "/admin/s-tier-vault", icon: Shield, isNew: true },
      { id: "discovery-mining", label: "Discovery Mining", path: "/admin/discovery-mining", icon: Sparkles, isNew: true },
      { id: "os", label: "Substrate", path: "/os", icon: Cpu },
      { id: "substrate", label: "Dashboard", path: "/substrate", icon: LayoutDashboard },
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
      { id: "capabilities", label: "Capabilities", path: "/docs/substrate/capabilities", icon: Sparkles },
      { id: "explore", label: "Explore", path: "/explore", icon: Network },
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise",
    items: [
      { id: "quarry", label: "Quarry", path: "/admin/quarry", icon: Cpu, isNew: true },
      { id: "intelligence", label: "Intelligence", path: "/intelligence", icon: Zap },
      { id: "pricing", label: "Upgrade", path: "/upgrade", icon: Gauge },
      { id: "licensing", label: "Licensing", path: "/substrate/licensing", icon: FileText },
      
      { id: "cognitive-uploads", label: "Cognitive Uploads", path: "/admin/cognitive-uploads", icon: Cpu, isNew: true },
      { id: "use-cases", label: "Use Cases", path: "/use-cases", icon: BookOpen },
    ],
  },
  {
    id: "system",
    title: "System",
    items: [
      { id: "gate", label: "GATE Engine", path: "/admin/gate", icon: Shield, isNew: true },
      { id: "governance", label: "Governance", path: "/admin/governance", icon: Shield },
      { id: "immunity-mesh", label: "Immunity Mesh", path: "/admin/immunity-mesh", icon: Shield },
      { id: "evolution", label: "Evolution", path: "/admin/evolution", icon: Zap },
      { id: "ascension-nodes", label: "Ascension Nodes", path: "/admin/ascension-nodes", icon: Cpu, isNew: true },
      { id: "owner-reports", label: "Owner Reports", path: "/admin/owner-reports", icon: FileText },
      { id: "audit-center", label: "Audit Center", path: "/admin/audit-center", icon: ScrollText, isNew: true },
      { id: "email-list", label: "Email Lists", path: "/admin/email-list", icon: Activity, isNew: true },
    ],
  },
  {
    id: "surfaces",
    title: "Surfaces",
    items: [
      { id: "system-feed", label: "System Feed", path: "/system-feed", icon: Brain },
      { id: "dream-eater", label: "Dream Eater", path: "/feed-dream-eater", icon: Moon },
      { id: "proof", label: "Proof Mode", path: "/proof", icon: Shield },
      { id: "demo", label: "Demo", path: "/demo", icon: Activity },
      { id: "lab", label: "Lab", path: "/lab", icon: HeartPulse },
      { id: "analytics", label: "Analytics Intelligence", path: "/admin/analytics", icon: Eye, isNew: true },
    ],
  },
  {
    id: "resources",
    title: "Resources",
    items: [
      { id: "docs", label: "Documentation", path: "/documentation", icon: BookOpen },
      { id: "library", label: "Library", path: "/changelog", icon: FileText },
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
