import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { 
  LayoutDashboard,
  Shield,
  Brain,
  Zap,
  Accessibility,
  Megaphone,
  Key,
  Activity,
  ScrollText,
  Settings,
  Menu,
  X,
  Upload,
  Combine,
  TrendingUp,
  Sparkles,
  Download,
  ChevronDown,
  ChevronRight,
  Users,
  CreditCard,
  BarChart3,
  AlertTriangle,
  Eye,
  Search,
  FileText,
  GitBranch,
  Network,
  Database,
  Code,
  Wrench,
  RefreshCw,
  Package,
  Rocket,
  TrendingUpIcon,
  Map as MapIcon,
  Briefcase,
  Target,
  Microscope,
  Palette,
  DollarSign,
  LockKeyhole,
  Cpu,
  HeartPulse,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavSection {
  title: string;
  items: Array<{
    name: string;
    href: string;
    icon: any;
  }>;
}

const navSections: NavSection[] = [
  {
    title: "Main Dashboards",
    items: [
      { name: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
      { name: "Vision Control", href: "/admin/vision", icon: Brain },
      { name: "Defense Shield", href: "/admin/defense", icon: Shield },
      { name: "Projects", href: "/admin/projects", icon: Briefcase },
      { name: "INCLUSIVE", href: "/cluster/inclusive-layer-accessibility", icon: Eye },
    ],
  },
  {
    title: "Brain Intelligence",
    items: [
      { name: "Brain Console", href: "/brain", icon: Brain },
      { name: "System Admin", href: "/cascade-admin", icon: Sparkles },
      { name: "Nexus Brain", href: "/nexus-brain", icon: Brain },
      { name: "Brain Memory", href: "/brain-memory", icon: Database },
      { name: "Brain Reports", href: "/brain-reports", icon: FileText },
      { name: "Brain Training", href: "/brain/training", icon: Upload },
      { name: "Brain Learning", href: "/brain-learning", icon: TrendingUp },
      { name: "Brain Analytics", href: "/brain-analytics", icon: BarChart3 },
      { name: "ML Models", href: "/brain-ml", icon: Cpu },
      { name: "Learning Intelligence", href: "/learning-intelligence", icon: TrendingUpIcon },
    ],
  },
  {
    title: "Defense & Security",
    items: [
      { name: "Defense Console", href: "/defense", icon: Shield },
      { name: "Detections", href: "/detections", icon: Eye },
      { name: "Bot Detection", href: "/bot-detection", icon: Search },
      { name: "Behavior Analysis", href: "/behavior-analysis", icon: Activity },
      { name: "Captcha", href: "/captcha", icon: LockKeyhole },
      { name: "Device Fingerprint", href: "/device-fingerprint", icon: Target },
      { name: "Threat Intelligence", href: "/threat-intelligence", icon: AlertTriangle },
      { name: "Threat Feed", href: "/threat-feed", icon: Zap },
      { name: "Security Rules", href: "/rules", icon: FileText },
      { name: "Red Team", href: "/red-team", icon: Microscope },
      { name: "Defense Keys", href: "/admin/reflex-keys", icon: Key },
    ],
  },
  {
    title: "Creation",
    items: [
      { name: "Creative Generation", href: "/creative-generation", icon: Sparkles },
      { name: "Prompt Merger", href: "/prompt-merger", icon: Combine },
    ],
  },
  {
    title: "Access & Ripple",
    items: [
      { name: "Access Console", href: "/access-console", icon: Accessibility },
      { name: "Ripple Studio", href: "/ripple-studio", icon: Megaphone },
      { name: "Sites Management", href: "/sites", icon: Network },
      { name: "SEO Intelligence", href: "/seo", icon: TrendingUpIcon },
    ],
  },
  {
    title: "Core Management",
    items: [
      { name: "Users", href: "/core/users", icon: Users },
      { name: "Subscriptions", href: "/core/subscriptions", icon: CreditCard },
      { name: "Usage Analytics", href: "/core/usage", icon: BarChart3 },
      { name: "Google Analytics", href: "/analytics", icon: TrendingUpIcon },
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Integrations", href: "/integrations", icon: GitBranch },
    ],
  },
  {
    title: "System Operations",
    items: [
      { name: "Immunity Mesh", href: "/admin/immunity-mesh", icon: Shield },
      { name: "System Health", href: "/system-health", icon: HeartPulse },
      { name: "Health Monitor", href: "/health", icon: Activity },
      { name: "Diagnostics", href: "/diagnostics", icon: Microscope },
      { name: "Repair Tools", href: "/repair", icon: Wrench },
      { name: "Updates", href: "/updates", icon: RefreshCw },
      { name: "Deployment", href: "/deployment", icon: Rocket },
      { name: "APIs", href: "/apis", icon: Code },
      { name: "Logs", href: "/logs", icon: ScrollText },
      { name: "System Map", href: "/system-map", icon: MapIcon },
    ],
  },
  {
    title: "Business & Resources",
    items: [
      { name: "Market Portal", href: "/market-portal", icon: DollarSign },
      { name: "Investor Packets", href: "/admin/investor-packets", icon: Briefcase },
      { name: "WordPress Plugin", href: "/projects", icon: Download },
      { name: "Roadmap", href: "/roadmap", icon: Map },
    ],
  },
];

export function Sidebar({ isOpen, onToggle }: { isOpen?: boolean; onToggle?: () => void }) {
  const location = useLocation();
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    "Main Dashboards": true,
    "Brain Intelligence": false,
    "Defense & Security": false,
    "Creation": false,
    "Access & Ripple": false,
    "Core Management": false,
    "System Operations": false,
    "Business & Resources": false,
  });

  // Use external state if provided, otherwise use internal state
  const open = isOpen !== undefined ? isOpen : internalIsOpen;
  const toggle = onToggle || (() => setInternalIsOpen(!internalIsOpen));

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-[9998] animate-fade-in"
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-[9999]",
          "w-72 glass border-r border-border/50 flex flex-col",
          "transform transition-transform duration-300 ease-in-out",
          open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header with Menu Toggle */}
        <div className="p-4 lg:p-6 border-b border-border/50">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={toggle}
              className="lg:hidden glass p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-bold glow-text">CMPSBL</h1>
              <p className="text-xs text-muted-foreground">Signal → Silicon</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 space-y-2 overflow-y-auto">
          {navSections.map((section, sectionIndex) => (
            <div key={section.title} className="mb-2">
              {/* Section Header */}
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
              >
                <span>{section.title}</span>
                {expandedSections[section.title] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Section Items */}
              {expandedSections[section.title] && (
                <div className="mt-1 space-y-1">
                  {section.items.map((item, itemIndex) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={toggle}
                        className={cn(
                          "flex items-center gap-3 px-3 lg:px-4 py-2 rounded-lg transition-all duration-300",
                          "group relative overflow-hidden",
                          "animate-fade-in",
                          isActive
                            ? "bg-primary/20 text-primary border border-primary/30 shadow-[0_0_20px_rgba(0,217,255,0.3)]"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        )}
                        style={{ animationDelay: `${(sectionIndex * 100 + itemIndex * 30)}ms` }}
                      >
                        <div
                          className={cn(
                            "absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                            isActive && "opacity-100"
                          )}
                        />
                        <item.icon
                          className={cn(
                            "w-4 h-4 relative z-10 flex-shrink-0",
                            isActive && "animate-glow"
                          )}
                        />
                        <span className="font-medium relative z-10 text-xs lg:text-sm">
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          {/* Settings - Always at bottom */}
          <div className="border-t border-border/50 pt-3 mt-4">
            <Link
              to="/settings"
              onClick={toggle}
              className={cn(
                "flex items-center gap-3 px-3 lg:px-4 py-2.5 rounded-lg transition-all duration-300",
                "group relative overflow-hidden",
                location.pathname === "/settings"
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              <Settings className="w-5 h-5 relative z-10 flex-shrink-0" />
              <span className="font-medium relative z-10 text-sm lg:text-base">Settings</span>
            </Link>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center font-mono">
            CMPSBL® · Memory Stream
          </p>
        </div>
      </aside>
    </>
  );
}
