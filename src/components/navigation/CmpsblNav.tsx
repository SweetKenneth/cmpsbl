/**
 * CmpsblNav — Minimal Dark Command Bar
 * Clean, reorganized navigation with no dead links
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
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
  FlaskConical,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);
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
    setMobileMenuOpen(false);
    setActiveSection(null);
    setExpandedMobileSection(null);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const navSections: NavSection[] = [
    {
      name: "Platform",
      icon: Layers,
      items: [
        { name: "Substrate", href: "/substrate", description: "Core cognitive infrastructure", icon: Cpu },
        { name: "All nodes", href: "/modules", description: "40 nodes across 12 sectors", icon: Layers },
        { name: "How it works", href: "/ai-operating-system", description: "Architecture & concepts", icon: Globe },
        { name: "Architecture", href: "/architecture", description: "System design & topology", icon: Layers },
        { name: "Runtime", href: "/runtime", description: "Execution environment", icon: Terminal },
        { name: "Foundations", href: "/foundations", description: "Core primitives", icon: Shield },
      ]
    },
    {
      name: "Products",
      icon: Sparkles,
      items: [
        { name: "CodeLab", href: "/codelab", description: "Blueprint forge & signal synthesis", icon: FlaskConical, badge: "NEW FEATURES", highlight: true },
        { name: "Artifact packs", href: "/packs", description: "Slot-based capabilities", icon: Package },
        { name: "Composable agents", href: "/composable-cognitives", description: "Pre-built AI agents", icon: Zap },
        { name: "Persistent memory", href: "/persistent-memory", description: "Add memory to any agent", icon: Brain },
        { name: "Enterprise", href: "/enterprise", description: "Scale with governed orchestration", icon: Building2 },
        { name: "Upgrade", href: "/upgrade", description: "Plans, pricing & tiers", icon: Rocket, highlight: true },
      ]
    },
    {
      name: "Developers",
      icon: Code,
      items: [
        { name: "Documentation", href: "/documentation", description: "API reference & guides", icon: FileText },
        { name: "Api access", href: "/api-access", description: "Keys, quotas & usage", icon: Code },
        { name: "Builder workspace", href: "/workspace", description: "SDK, terminal & build tools", icon: Terminal, highlight: true },
        { name: "Codelab", href: "/codelab", description: "Execute and test in real-time", icon: Terminal },
        { name: "Academy", href: "/academy", description: "Interactive tutorials", icon: GraduationCap },
        { name: "Developer guide", href: "/developers/guide", description: "SDK setup & integration", icon: BookOpen },
      ]
    },
    {
      name: "Explore",
      icon: Globe,
      items: [
        { name: "Roadmap", href: "/roadmap", description: "Five-phase evolution timeline", icon: Rocket, badge: "NEW" },
        { name: "Memory Stream", href: "/foundry", description: "Discover & crystallize pipelines", icon: Sparkles, badge: "LIVE", highlight: true },
        { name: "Use cases", href: "/use-cases", description: "Industry applications", icon: Globe },
        { name: "Showcase", href: "/showcase", description: "See what's been built", icon: Sparkles },
        { name: "Blog", href: "/blog", description: "Research & updates", icon: FileText },
        { name: "System overview", href: "/overview", description: "The full picture", icon: Globe },
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
            ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-background/80 backdrop-blur-md"
        )}
      >
        <div className={cn(
          "absolute inset-x-0 -bottom-px h-px transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0"
        )}>
          <div className="h-full w-full memory-stream-bar opacity-40" />
        </div>

        <div className="container mx-auto px-4 lg:px-6">
          <nav className="flex items-center justify-between h-16 lg:h-[72px] bg-transparent" role="navigation" aria-label="Main navigation">

            {/* Logo */}
            <Link
              to="/"
              className="relative group flex items-center gap-3 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
              aria-label="CMPSBL Home"
            >
              <CmpsblLogo size="sm" className="transition-transform duration-300 group-hover:scale-105" />
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold tracking-tight leading-none">Memory Stream</span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">Signal → Silicon</span>
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
                      className="relative bg-popover rounded-xl border border-border/80 shadow-2xl shadow-primary/[0.06] overflow-hidden pointer-events-auto"
                    >
                      <div className="h-0.5 memory-stream-bar opacity-60" />
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
                    <Button asChild size="sm" className="rounded-lg h-9 px-4 font-semibold shadow-md shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                      <Link to="/upgrade">
                        Get Started
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  "lg:hidden relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 touch-manipulation border",
                  mobileMenuOpen
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card hover:bg-secondary border-border text-foreground"
                )}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mobileMenuOpen ? "close" : "menu"}
                    initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                    transition={{ duration: 0.15 }}
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </nav>
        </div>
      </motion.header>

      {/* ═══ MOBILE NAV ═══ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] lg:hidden"
          >
            <motion.div className="absolute inset-0 bg-background pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.05 }}
              className="relative h-full pt-20 pb-[env(safe-area-inset-bottom,2rem)] px-5 overflow-y-auto overscroll-contain momentum-scroll"
              style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px) + 2rem, 6rem)' }}
            >
              {/* Mobile Header */}
              <div className="mb-6">
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-3">
                  <CmpsblLogo size="md" />
                  <div>
                    <div className="text-xl font-bold tracking-tight">Memory Stream</div>
                    <div className="text-xs text-muted-foreground font-medium">Signal → Silicon</div>
                  </div>
                </motion.div>
              </div>

              {/* Mobile Quick Actions */}
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 }} className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { name: "Memory Stream", href: "/foundry", icon: Sparkles, badge: "LIVE", highlight: true },
                  { name: "Upgrade", href: "/upgrade", icon: Zap },
                  { name: "Engines", href: "/engines", icon: Shield, badge: "20" },
                  { name: "Roadmap", href: "/roadmap", icon: Rocket, badge: "NEW" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl transition-all touch-manipulation",
                      item.highlight
                        ? "bg-primary/5 hover:bg-primary/10 border-2 border-primary/30 shadow-sm shadow-primary/10"
                        : "bg-card hover:bg-secondary border border-border shadow-sm",
                      isActive(item.href) && "bg-primary/10 border-primary/30"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5", item.highlight || isActive(item.href) ? "text-primary" : "text-muted-foreground")} />
                    <div className="flex items-center gap-2">
                      <span className={cn("text-sm font-semibold", (item.highlight || isActive(item.href)) && "text-primary")}>{item.name}</span>
                      {item.badge && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-primary/10 text-primary border border-primary/30">{item.badge}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </motion.div>

              {/* Mobile Nav Sections */}
              <div className="space-y-2">
                {navSections.map((section, sectionIdx) => (
                  <motion.div
                    key={section.name}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + sectionIdx * 0.03 }}
                    className="rounded-xl border border-border overflow-hidden bg-card"
                  >
                    <button
                      onClick={() => setExpandedMobileSection(expandedMobileSection === section.name ? null : section.name)}
                      className="w-full flex items-center justify-between p-4 touch-manipulation"
                      aria-expanded={expandedMobileSection === section.name}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center">
                          <section.icon className="w-4.5 h-4.5 text-muted-foreground" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm">{section.name}</div>
                          <div className="text-xs text-muted-foreground">{section.items.length} items</div>
                        </div>
                      </div>
                      <motion.div animate={{ rotate: expandedMobileSection === section.name ? 90 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {expandedMobileSection === section.name && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-3 pb-3 space-y-1">
                            {section.items.map((item) => (
                              <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                  "flex items-center gap-3 p-3 rounded-lg transition-colors touch-manipulation hover:bg-muted",
                                  isActive(item.href) && "bg-primary/10"
                                )}
                              >
                                {item.icon && (
                                  <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", isActive(item.href) ? "bg-primary/10" : "bg-secondary")}>
                                    <item.icon className={cn("w-4 h-4", isActive(item.href) ? "text-primary" : "text-muted-foreground")} />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={cn("font-medium text-sm", isActive(item.href) && "text-primary")}>{item.name}</span>
                                    {item.badge && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">{item.badge}</span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <span className="text-xs text-muted-foreground line-clamp-1">{item.description}</span>
                                  )}
                                </div>
                                <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
              </div>

              {/* Mobile Auth */}
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8 pt-6 border-t border-border">
                {user ? (
                  <div className="space-y-3">
                    <Button asChild className="w-full h-12 rounded-xl font-semibold">
                      <Link to="/os">
                        <Command className="w-4 h-4 mr-2" />
                        Open Dashboard
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={handleSignOut} className="w-full h-11 rounded-xl">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button asChild className="w-full h-12 rounded-xl font-semibold">
                      <Link to="/upgrade">
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full h-11 rounded-xl">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Mobile Footer */}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>All Systems Operational</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-20 sm:h-16 lg:h-[72px]" />
    </>
  );
}
