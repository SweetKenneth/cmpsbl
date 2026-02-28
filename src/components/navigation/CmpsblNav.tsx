/**
 * CmpsblNav — Minimal Dark Command Bar
 * Clean, reorganized navigation with no dead links
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Code,
  Layers,
  FileText,
  Info,
  Rocket,
  BookOpen,
  Users,
  Zap,
  Terminal,
  Cpu,
  Moon,
  Building2,
  Sparkles,
  GraduationCap,
  Globe,
  Brain,
  LogOut,
  ArrowRight,
  Command,
  Shield,
  ExternalLink,
  Mail,
  Package,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CmpsblLogo } from "@/components/CmpsblLogo";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  description?: string;
  icon?: React.ElementType;
  badge?: string;
  external?: boolean;
  highlight?: boolean;
}

interface NavSection {
  name: string;
  icon: React.ElementType;
  items: NavItem[];
}

export function CmpsblNav() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const headerRef = useRef<HTMLElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const sectionButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [dropdownAnchor, setDropdownAnchor] = useState<DOMRect | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setActiveSection(null);
  }, [location.pathname]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navSections: NavSection[] = [
    {
      name: "Platform",
      icon: Layers,
      items: [
        { name: "How It Works", href: "/ai-operating-system", description: "Architecture & concepts", icon: Globe },
        { name: "Substrate", href: "/substrate", description: "Core cognitive infrastructure", icon: Cpu },
        { name: "Substrate Demo", href: "/demo", description: "Interactive live demo", icon: Sparkles },
        { name: "All Modules", href: "/modules", description: "9 production modules", icon: Layers },
        { name: "Runtime", href: "/runtime", description: "Execution environment", icon: Terminal },
        ...(user ? [{ name: "Dashboard", href: "/os", description: "Your command center", icon: Cpu }] : []),
      ]
    },
    {
      name: "Product",
      icon: Sparkles,
      items: [
        { name: "Artifact Packs", href: "/packs", description: "Activate capabilities with slot-based control", icon: Package, badge: "24 PACKS" },
        { name: "Composable Agents", href: "/composable-cognitives", description: "Pre-built AI agents powered by the substrate", icon: Zap },
        { name: "Persistent Memory", href: "/persistent-memory", description: "Add memory to any agent", icon: Brain, badge: "FREE" },
        { name: "Enterprise", href: "/enterprise", description: "Scale with governed orchestration", icon: Building2 },
        { name: "Upgrade", href: "/upgrade", description: "Plans, pricing & tiers", icon: Rocket, highlight: true },
      ]
    },
    {
      name: "Developers",
      icon: Code,
      items: [
        { name: "Start Here", href: "/start-here", description: "Get oriented fast", icon: Rocket },
        { name: "Documentation", href: "/documentation", description: "API reference & guides", icon: FileText },
        { name: "Developer Showcase", href: "/developers", description: "Community builds & integrations", icon: Users },
        { name: "Academy", href: "/academy", description: "Interactive tutorials", icon: GraduationCap },
        { name: "CodeLab", href: "/codelab", description: "Execute and test in real-time", icon: Terminal },
        { name: "API Access", href: "/api-access", description: "Keys, quotas & usage", icon: Code },
      ]
    },
    {
      name: "Company",
      icon: Users,
      items: [
        { name: "Blog", href: "/blog", description: "Research & updates", icon: FileText },
        { name: "About", href: "/about", description: "Our mission & team", icon: Info },
        { name: "Contact", href: "/contact", description: "Get in touch", icon: Mail },
        { name: "Insights", href: "/insights", description: "Analysis & thought leadership", icon: BookOpen },
        { name: "Showcase", href: "/showcase", description: "See what's been built", icon: Sparkles },
        { name: "System Status", href: "/status", description: "Live health & uptime", icon: Shield, badge: "LIVE" },
      ]
    },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isInSection = (section: NavSection) => section.items.some(item => location.pathname === item.href);

  const activeNavSection = activeSection
    ? (navSections.find((s) => s.name === activeSection) ?? null)
    : null;

  useEffect(() => {
    if (!activeSection) {
      setDropdownAnchor(null);
      return;
    }
    const update = () => {
      const el = sectionButtonRefs.current[activeSection];
      if (!el) return;
      setDropdownAnchor(el.getBoundingClientRect());
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [activeSection]);

  useEffect(() => {
    if (!activeSection) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (!target) return;
      if (dropdownRef.current?.contains(target)) return;
      if (headerRef.current?.contains(target)) return;
      setActiveSection(null);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActiveSection(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [activeSection]);

  const dropdownTop = dropdownAnchor ? Math.round(dropdownAnchor.bottom + 8) : 0;
  const dropdownLeft = dropdownAnchor
    ? Math.round(Math.min(dropdownAnchor.left, window.innerWidth - 360))
    : 0;

  return (
    <>
      {/* ═══ DESKTOP NAV ═══ */}
      <motion.header
        ref={headerRef}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[10000] transition-all duration-300",
          scrolled
            ? "bg-background border-b border-border shadow-sm"
            : "bg-background"
        )}
      >
        <div className={cn(
          "absolute inset-x-0 -bottom-px h-px transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0"
        )}>
          <div className="h-full w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 lg:px-6">
          <nav className="flex items-center justify-between h-16 lg:h-[72px] bg-transparent" role="navigation" aria-label="Main navigation">

            {/* Logo */}
            <Link
              to="/"
              className="relative group flex items-center gap-3 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
              aria-label="CMPSBL Home"
            >
              <CmpsblLogo size="sm" priority className="transition-transform duration-300 group-hover:scale-105" />
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold tracking-tight leading-none">Clockless</span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">Cognitive Reality</span>
              </div>
            </Link>

            {/* Desktop Nav Sections */}
            <div className="hidden lg:flex items-center gap-1">
              {navSections.map((section) => (
                <div key={section.name} className="relative">
                  <button
                    ref={(el) => { sectionButtonRefs.current[section.name] = el; }}
                    type="button"
                    onClick={() => setActiveSection((prev) => (prev === section.name ? null : section.name))}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                      activeSection === section.name
                        ? "text-foreground"
                        : isInSection(section)
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-expanded={activeSection === section.name}
                    aria-haspopup="menu"
                  >
                    <span>{section.name}</span>
                    <ChevronRight className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200",
                      activeSection === section.name && "rotate-90"
                    )} />
                    {isInSection(section) && !activeSection && (
                      <motion.span layoutId="section-indicator" className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </button>
                </div>
              ))}
            </div>

            {/* Desktop Dropdown Portal */}
            {activeNavSection && dropdownAnchor &&
              createPortal(
                <AnimatePresence>
                  <motion.div
                    key={activeNavSection.name}
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.15, ease: "easeOut" }}
                    className="hidden lg:block fixed w-[340px]"
                    style={{ top: dropdownTop, left: dropdownLeft, zIndex: 2147483647 }}
                  >
                    <div
                      ref={dropdownRef}
                      className="relative bg-popover rounded-xl border border-border shadow-xl overflow-hidden pointer-events-auto"
                    >
                      <div className="h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
                      <div className="p-2">
                        {activeNavSection.items.map((item) => {
                          const linkClass = cn(
                            "flex items-start gap-3 p-3 rounded-lg transition-colors duration-150 group/item",
                            "hover:bg-muted",
                            isActive(item.href) && "bg-muted"
                          );
                          const content = (
                            <>
                              {item.icon && (
                                <div className={cn(
                                  "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors duration-150",
                                  "bg-muted group-hover/item:bg-primary/10",
                                  isActive(item.href) && "bg-primary/10 text-primary"
                                )}>
                                  <item.icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive(item.href) ? "text-primary" : "text-muted-foreground group-hover/item:text-primary"
                                  )} />
                                </div>
                              )}
                              <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "font-semibold text-sm transition-colors",
                                    isActive(item.href) ? "text-primary" : "text-foreground"
                                  )}>
                                    {item.name}
                                  </span>
                                  {item.badge && (
                                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                      {item.badge}
                                    </span>
                                  )}
                                  {item.external && <ExternalLink className="w-3 h-3 text-muted-foreground" />}
                                </div>
                                {item.description && (
                                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                                )}
                              </div>
                            </>
                          );
                          return item.external ? (
                            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className={linkClass}>{content}</a>
                          ) : (
                            <Link key={item.href} to={item.href} className={linkClass}>{content}</Link>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>,
                document.body
              )}

            {/* Right Section */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2">
                {user ? (
                  <>
                    <Button asChild variant="ghost" size="sm" className="rounded-lg h-9 px-3 font-medium">
                      <Link to="/os">
                        <Command className="w-4 h-4 mr-1.5" />
                        Dashboard
                      </Link>
                    </Button>
                    <div className="w-px h-5 bg-border mx-1" />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSignOut}
                      className="rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground"
                      aria-label="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" size="sm" className="rounded-lg h-9 px-4 font-medium text-muted-foreground hover:text-foreground">
                      <Link to="/auth">Sign in</Link>
                    </Button>
                    <Button asChild size="sm" className="rounded-lg h-9 px-4 font-semibold">
                      <Link to="/upgrade">
                        Get Started
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile fullscreen menu removed to prevent page-covering overlay */}
            </div>
          </nav>
        </div>
      </motion.header>

      {/* Mobile fullscreen menu removed to avoid any overlay covering site content */}

      {/* Spacer */}
      <div className="h-20 sm:h-16 lg:h-[72px]" />
    </>
  );
}
