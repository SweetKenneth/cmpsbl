/**
 * CmpsblNav — Enterprise-Grade Sectioned Navigation
 * Desktop: Grouped dropdown menus with mega-menu feel
 * Mobile: Full-screen accordion sections with quick-link grid
 * 
 * v19.0.0 — SYMBIOTIC Epoch
 */

import { useState, useEffect, useRef } from "react";
import { NpmAnnouncementBanner } from "./NpmAnnouncementBanner";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  ArrowRight,
  LogOut,
  Command,
  Sparkles,
  CreditCard,
  Package,
  Globe,
  ShoppingBag,
  Layers,
  Brain,
  Shield,
  Wrench,
  ChevronDown,
  BookOpen,
  Building2,
  Users,
  Newspaper,
  Cpu,
  Rocket,
  ScrollText,
  Award,
  Eye,
  ExternalLink,
  Key,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CmpsblLogo } from "@/components/CmpsblLogo";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

// MARKETPLACE_URL removed (v19.1) — /marketplace now redirects to /store

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  description?: string;
  badge?: string;
  external?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

/** ─── NAV SECTIONS ─── */
const NAV_SECTIONS: NavSection[] = [
  {
    title: "Products",
    items: [
      { name: "Shield", href: "/shield", icon: Shield, description: "Free code security scanner", badge: "FREE" },
      { name: "Ascension", href: "/ascension-v2", icon: Sparkles, description: "Code diagnostic & transformation engine" },
      { name: "Mana", href: "/mana", icon: Layers, description: "Silent Layer 2 attachment engine", badge: "PATENT" },
      { name: "Memory Stream", href: "/foundry", icon: Brain, description: "Live cognitive processing feed", badge: "LIVE" },
      { name: "Assembly", href: "/assembly", icon: Wrench, description: "Custom substrate engineering service", badge: "SERVICE" },
    ],
  },
  {
    title: "Explore",
    items: [
      { name: "Store", href: "/store", icon: ShoppingCart, description: "Layers, Meta Engines & Meta Agents", badge: "BUY" },
      { name: "Showroom", href: "/showroom", icon: Eye, description: "Interactive capability showcase" },
      { name: "Case Studies", href: "/case-studies", icon: Award, description: "Real-world Ascension results" },
      { name: "Use Cases", href: "/use-cases", icon: Cpu, description: "Real-world implementation examples" },
    ],
  },
  {
    title: "Developers",
    items: [
      { name: "API Access", href: "/api-access", icon: Key, description: "Get a free key — one endpoint, 40 primitives", badge: "FREE" },
      { name: "Documentation", href: "/documentation", icon: BookOpen, description: "API reference, SDKs & guides" },
      { name: "Changelog", href: "/changelog", icon: ScrollText, description: "Version history & release notes" },
      { name: "Blog", href: "/blog", icon: Newspaper, description: "Engineering insights & updates" },
      { name: "Heritage Paper", href: "/heritage-paper", icon: Award, description: "The founding technical paper" },
    ],
  },
  {
    title: "Company",
    items: [
      { name: "About", href: "/about", icon: Building2, description: "Our mission & story" },
      { name: "Plans", href: "/plans", icon: CreditCard, description: "Free or Pro" },
      { name: "Investors", href: "/investors", icon: Award, description: "Investment thesis & traction" },
      { name: "Contact", href: "/contact", icon: Users, description: "Get in touch" },
    ],
  },
];

/** Flat list for quick access */
const ALL_NAV_ITEMS = NAV_SECTIONS.flatMap((s) => s.items);

/** Top quick-links for mobile grid — funnel targets */
const MOBILE_QUICK_LINKS = ALL_NAV_ITEMS.filter((i) =>
  ["/ascension-v2", "/store", "/api-access", "/plans"].includes(i.href)
);

export function CmpsblNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setOpenSection(null);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;
  const bannerHeight = 36;

  const handleSectionEnter = (title: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenSection(title);
  };

  const handleSectionLeave = () => {
    timeoutRef.current = setTimeout(() => setOpenSection(null), 150);
  };

  const handleDropdownEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  /** Render nav link — external vs internal */
  const NavAnchor = ({
    item,
    children,
    className,
    onClick,
  }: {
    item: NavItem;
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
  }) => {
    if (item.external) {
      return (
        <a href={item.href} rel="noopener noreferrer" className={className} onClick={onClick}>
          {children}
        </a>
      );
    }
    return (
      <Link to={item.href} className={className} onClick={onClick}>
        {children}
      </Link>
    );
  };

  return (
    <>
      <NpmAnnouncementBanner />

      {/* ═══ HEADER ═══ */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        style={{ top: bannerHeight }}
        className={cn(
          "fixed left-0 right-0 z-[10000] transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm"
            : "bg-background/80 backdrop-blur-md"
        )}
      >
        {/* Shimmer bar */}
        <div className={cn(
          "absolute inset-x-0 -bottom-px h-px transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0"
        )}>
          <div className="h-full w-full memory-stream-bar opacity-40" />
        </div>

        <div className="container mx-auto px-4 lg:px-6">
          <nav className="flex items-center justify-between h-16 lg:h-[72px]" role="navigation" aria-label="Main navigation">

            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/"
                className="relative group flex items-center gap-3 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
                aria-label="CMPSBL Home"
              >
                <CmpsblLogo size="sm" priority className="transition-transform duration-300 group-hover:scale-105" />
                <div className="hidden sm:flex flex-col">
                  <span className="text-lg font-bold tracking-tight leading-none">CMPSBL</span>
                  <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">Signal → Silicon</span>
                </div>
              </Link>
            </div>

            {/* ─── Desktop Section Dropdowns ─── */}
            <div className="hidden lg:flex items-center gap-0.5" ref={dropdownRef}>
              {NAV_SECTIONS.map((section) => (
                <div
                  key={section.title}
                  className="relative"
                  onMouseEnter={() => handleSectionEnter(section.title)}
                  onMouseLeave={handleSectionLeave}
                >
                  <button
                    className={cn(
                      "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                      openSection === section.title
                        ? "text-foreground bg-secondary/50"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    onClick={() => setOpenSection(openSection === section.title ? null : section.title)}
                    aria-expanded={openSection === section.title}
                  >
                    {section.title}
                    <ChevronDown className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200",
                      openSection === section.title && "rotate-180"
                    )} />
                  </button>

                  <AnimatePresence>
                    {openSection === section.title && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        onMouseEnter={handleDropdownEnter}
                        onMouseLeave={handleSectionLeave}
                        className="absolute top-full left-0 mt-1 w-72 rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-xl shadow-black/10 p-2 z-50"
                      >
                        {section.items.map((item) => (
                          <NavAnchor
                            key={item.href}
                            item={item}
                            className={cn(
                              "group flex items-start gap-3 p-3 rounded-lg transition-all duration-150",
                              !item.external && isActive(item.href)
                                ? "bg-primary/10"
                                : "hover:bg-secondary/80"
                            )}
                          >
                            <div className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                              !item.external && isActive(item.href)
                                ? "bg-primary/15 text-primary"
                                : "bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                            )}>
                              <item.icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className={cn(
                                  "text-sm font-semibold",
                                  !item.external && isActive(item.href) && "text-primary"
                                )}>
                                  {item.name}
                                </span>
                                {item.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                                    {item.badge}
                                  </span>
                                )}
                                {item.external && (
                                  <ExternalLink className="w-3 h-3 text-muted-foreground/50" />
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                              )}
                            </div>
                          </NavAnchor>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* ─── Right Section ─── */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2">
                {user ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" aria-label="Account menu">
                        <Avatar className="h-9 w-9 border-2 border-border hover:border-primary transition-colors cursor-pointer">
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                            {user.email?.charAt(0).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 p-2">
                      <div className="px-3 py-2 border-b border-border mb-1">
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <Link to="/workbench" className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors">
                        <Package className="w-4 h-4" />
                        My Workbench
                      </Link>
                      <Link to="/plans" className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors">
                        <CreditCard className="w-4 h-4" />
                        My Plan
                      </Link>
                      <Link to="/os" className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors">
                        <Command className="w-4 h-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted transition-colors text-destructive"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <>
                    <Button asChild variant="ghost" size="sm" className="rounded-lg h-9 px-4 font-medium text-muted-foreground hover:text-foreground">
                      <Link to="/auth">Sign in</Link>
                    </Button>
                    <Button asChild size="sm" className="rounded-lg h-9 px-4 font-semibold shadow-md shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                      <Link to="/ascension-v2">
                        Run Diagnostic
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

      {/* ═══ MOBILE NAV — Full-screen Accordion ═══ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] lg:hidden"
          >
            <motion.div className="absolute inset-0 bg-background" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.05 }}
              className="relative h-full pt-28 pb-[env(safe-area-inset-bottom,2rem)] px-5 overflow-y-auto overscroll-contain"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom, 0px) + 2rem, 6rem)" }}
            >
              {/* Mobile Header */}
              <div className="mb-6">
                <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex items-center gap-3">
                  <CmpsblLogo size="md" />
                  <div>
                    <div className="text-xl font-bold tracking-tight">CMPSBL</div>
                    <div className="text-xs text-muted-foreground font-medium">Governed Cognitive Infrastructure</div>
                  </div>
                </motion.div>
              </div>

              {/* ── Quick-Link Grid (top 4) ── */}
              <motion.div
                initial={{ y: 15, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.12 }}
                className="grid grid-cols-2 gap-2.5 mb-6"
              >
                {MOBILE_QUICK_LINKS.map((item) => (
                  <NavAnchor
                    key={item.href}
                    item={item}
                    className={cn(
                      "group relative overflow-hidden flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all touch-manipulation",
                      "bg-card hover:bg-secondary border-border",
                      !item.external && isActive(item.href) && "border-primary/40 bg-primary/5"
                    )}
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out bg-gradient-to-r from-transparent via-primary/10 to-transparent" />
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                      !item.external && isActive(item.href) ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                    )}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-center leading-tight">{item.name}</span>
                      {item.badge && (
                        <span className="text-[8px] font-bold px-1 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">{item.badge}</span>
                      )}
                    </div>
                  </NavAnchor>
                ))}
              </motion.div>

              {/* ── Section Accordions ── */}
              <div className="space-y-2 mb-8">
                {NAV_SECTIONS.map((section, sIdx) => {
                  const isSectionOpen = openSection === section.title;
                  return (
                    <motion.div
                      key={section.title}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 + sIdx * 0.04 }}
                      className="rounded-xl border border-border bg-card overflow-hidden"
                    >
                      <button
                        onClick={() => setOpenSection(isSectionOpen ? null : section.title)}
                        className="w-full flex items-center justify-between px-4 py-3.5 touch-manipulation"
                        aria-expanded={isSectionOpen}
                      >
                        <span className="text-sm font-bold tracking-wide uppercase text-muted-foreground">{section.title}</span>
                        <ChevronDown className={cn(
                          "w-4 h-4 text-muted-foreground transition-transform duration-200",
                          isSectionOpen && "rotate-180"
                        )} />
                      </button>

                      <AnimatePresence initial={false}>
                        {isSectionOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                          >
                            <div className="px-2 pb-2 space-y-0.5">
                              {section.items.map((item) => (
                                <NavAnchor
                                  key={item.href}
                                  item={item}
                                  className={cn(
                                    "group relative overflow-hidden flex items-center gap-3 p-3 rounded-lg transition-all touch-manipulation",
                                    !item.external && isActive(item.href)
                                      ? "bg-primary/10"
                                      : "hover:bg-secondary/80"
                                  )}
                                >
                                  <div className={cn(
                                    "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                    !item.external && isActive(item.href) ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground"
                                  )}>
                                    <item.icon className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className={cn("text-sm font-semibold", !item.external && isActive(item.href) && "text-primary")}>
                                        {item.name}
                                      </span>
                                      {item.badge && (
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/30">
                                          {item.badge}
                                        </span>
                                      )}
                                      {item.external && <ExternalLink className="w-3 h-3 text-muted-foreground/50" />}
                                    </div>
                                    {item.description && (
                                      <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{item.description}</p>
                                    )}
                                  </div>
                                </NavAnchor>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>

              {/* Mobile Auth */}
              <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="pt-6 border-t border-border">
                {user ? (
                  <div className="space-y-3">
                    <Button asChild variant="outline" className="w-full h-11 rounded-xl font-medium">
                      <Link to="/workbench">
                        <Package className="w-4 h-4 mr-2" />
                        My Workbench
                      </Link>
                    </Button>
                    <Button asChild className="w-full h-12 rounded-xl font-semibold">
                      <Link to="/os">
                        <Command className="w-4 h-4 mr-2" />
                        Dashboard
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
                      <Link to="/ascension-v2">
                        Run Diagnostic
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
                <div className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                <span>All Systems Operational</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer — accounts for fixed nav + banner */}
      <div style={{ height: `calc(${bannerHeight}px + 72px)` }} className="sm:hidden" />
      <div style={{ height: `calc(${bannerHeight}px + 64px)` }} className="hidden sm:block lg:hidden" />
      <div style={{ height: `calc(${bannerHeight}px + 72px)` }} className="hidden lg:block" />
    </>
  );
}
