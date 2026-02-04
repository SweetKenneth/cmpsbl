/**
 * CmpsblNav — Enterprise Command Center
 * Ultra-polished navigation with refined micro-interactions
 */

import { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, X, ChevronRight, Code, Layers, FileText, Mail, Info, 
  Rocket, BookOpen, Users, Zap, Terminal, Cpu, MessageSquare, 
  Moon, Building2, Gamepad2, Sparkles, Globe, Brain, 
  LogOut, ArrowRight, Command, Shield, ExternalLink
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { CmpsblLogo } from "@/components/CmpsblLogo";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavItem {
  name: string;
  href: string;
  description?: string;
  icon?: React.ElementType;
  badge?: string;
  external?: boolean;
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
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

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
      icon: Cpu,
      items: [
        { name: "Capabilities Depot", href: "/capabilities", description: "86+ production-ready AI artifacts", icon: Sparkles, badge: "86+" },
        { name: "CodeLab", href: "/codelab", description: "Execute and test in real-time", icon: Terminal },
        { name: "Developer Hub", href: "/developers", description: "SDKs, APIs, and integrations", icon: Code },
        { name: "Marketplace", href: "/marketplace", description: "Pre-built templates & modules", icon: Layers },
        { name: "Gaming AI", href: "/gaming", description: "NPC engines and game logic", icon: Gamepad2 },
        ...(user ? [{ name: "Dashboard", href: "/os", description: "Your command center", icon: Cpu }] : []),
      ]
    },
    {
      name: "Substrate",
      icon: Brain,
      items: [
        { name: "CMPSBL OS", href: "/substrate", description: "Core runtime architecture", icon: Cpu },
        { name: "System Feed", href: "/system-feed", description: "Live intelligence stream", icon: Brain, badge: "Live" },
        { name: "Decode Engine", href: "/decode", description: "Intent parsing & analysis", icon: MessageSquare },
        { name: "Dream Feeder", href: "/feed-dream-eater", description: "Background processing", icon: Moon },
      ]
    },
    {
      name: "Enterprise",
      icon: Building2,
      items: [
        { name: "Use Cases", href: "/use-cases", description: "Industry applications", icon: Sparkles },
        { name: "Licensing", href: "/substrate/licensing", description: "Enterprise agreements", icon: FileText },
        { name: "Intelligence", href: "/intelligence", description: "Investor relations", icon: Zap },
        { name: "Security", href: "/security", description: "Compliance & trust", icon: Shield },
      ]
    },
    {
      name: "Resources",
      icon: BookOpen,
      items: [
        { name: "Documentation", href: "/documentation", description: "Complete API reference", icon: FileText },
        { name: "Library", href: "/library", description: "FNDTN v7 framework", icon: BookOpen },
        { name: "Namespace", href: "/namespace", description: "Governance standards", icon: Globe },
        { name: "LLMS.txt", href: "/llms-txt", description: "Machine context files", icon: Terminal },
      ]
    },
    {
      name: "Company",
      icon: Users,
      items: [
        { name: "About", href: "/about", description: "Our mission & team", icon: Info },
        { name: "Blog", href: "/blog", description: "Research & updates", icon: FileText },
        { name: "Contact", href: "/contact", description: "Get in touch", icon: Mail },
      ]
    },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isInSection = (section: NavSection) => section.items.some(item => location.pathname === item.href);

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP NAVIGATION — Enterprise Command Bar
          ══════════════════════════════════════════════════════════════════════ */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[10000] transition-all duration-300",
          scrolled 
            ? "bg-background/95 backdrop-blur-xl border-b border-border shadow-sm" 
            : "bg-background/80 backdrop-blur-sm"
        )}
        onMouseMove={handleMouseMove}
      >
        {/* Ambient glow on scroll */}
        <div className={cn(
          "absolute inset-x-0 -bottom-px h-px transition-opacity duration-500",
          scrolled ? "opacity-100" : "opacity-0"
        )}>
          <div className="h-full w-full bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 lg:px-6">
          <nav className="flex items-center justify-between h-16 lg:h-[72px]" role="navigation" aria-label="Main navigation">
            
            {/* ═══ Logo ═══ */}
            <Link 
              to="/" 
              className="relative group flex items-center gap-3 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-lg"
              aria-label="CMPSBL Home"
            >
              <CmpsblLogo size="sm" className="transition-transform duration-300 group-hover:scale-105" />
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold tracking-tight leading-none">CMPSBL</span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">Substrate OS</span>
              </div>
            </Link>

            {/* ═══ Desktop Navigation ═══ */}
            <div className="hidden lg:flex items-center gap-1">
              {navSections.map((section) => (
                <div 
                  key={section.name} 
                  className="relative"
                  onMouseEnter={() => setActiveSection(section.name)}
                  onMouseLeave={() => setActiveSection(null)}
                >
                  <button
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200",
                      activeSection === section.name 
                        ? "text-foreground" 
                        : isInSection(section) 
                          ? "text-foreground" 
                          : "text-muted-foreground hover:text-foreground"
                    )}
                    aria-expanded={activeSection === section.name}
                    aria-haspopup="true"
                  >
                    <span>{section.name}</span>
                    <ChevronRight className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200",
                      activeSection === section.name && "rotate-90"
                    )} />
                    
                    {/* Active indicator dot */}
                    {isInSection(section) && !activeSection && (
                      <motion.span 
                        layoutId="section-indicator"
                        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"
                      />
                    )}
                  </button>

                  {/* ═══ Desktop Dropdown ═══ */}
                  <AnimatePresence>
                    {activeSection === section.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-[340px]"
                      >
                        <div className="relative bg-popover rounded-xl border border-border shadow-xl overflow-hidden">
                          {/* Top accent line */}
                          <div className="h-0.5 bg-gradient-to-r from-primary via-primary/50 to-transparent" />
                          
                          <div className="p-2">
                            {section.items.map((item, idx) => (
                              <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                  "flex items-start gap-3 p-3 rounded-lg transition-colors duration-150 group/item",
                                  "hover:bg-muted/60",
                                  isActive(item.href) && "bg-muted"
                                )}
                              >
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
                                    {item.external && (
                                      <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                    )}
                                  </div>
                                  {item.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                      {item.description}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* ═══ Right Section ═══ */}
            <div className="flex items-center gap-2">
              {/* Desktop Auth Buttons */}
              <div className="hidden lg:flex items-center gap-2">
                {user ? (
                  <>
                    <Button 
                      asChild 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-lg h-9 px-3 font-medium"
                    >
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
                    <Button 
                      asChild 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-lg h-9 px-4 font-medium text-muted-foreground hover:text-foreground"
                    >
                      <Link to="/auth">Sign in</Link>
                    </Button>
                    <Button 
                      asChild 
                      size="sm" 
                      className="rounded-lg h-9 px-4 font-semibold"
                    >
                      <Link to="/developers">
                        Get Started
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {/* ═══ Mobile Menu Button ═══ */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  "lg:hidden relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200 touch-manipulation",
                  mobileMenuOpen 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-muted/50 hover:bg-muted text-foreground"
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

      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE NAVIGATION — Full Screen Command Interface
          ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999] lg:hidden"
          >
            {/* Solid background */}
            <motion.div 
              className="absolute inset-0 bg-background"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            
            {/* Content */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.05 }}
              className="relative h-full pt-20 pb-8 px-5 overflow-y-auto safe-area-inset momentum-scroll"
            >
              {/* Header */}
              <div className="mb-6">
                <motion.div 
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CmpsblLogo size="md" />
                  <div>
                    <div className="text-xl font-bold tracking-tight">CMPSBL</div>
                    <div className="text-xs text-muted-foreground font-medium">Substrate OS v7.0</div>
                  </div>
                </motion.div>
              </div>

              {/* Quick Actions */}
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-2 gap-2 mb-6"
              >
                {[
                  { name: "Capabilities", href: "/capabilities", icon: Sparkles },
                  { name: "CodeLab", href: "/codelab", icon: Terminal },
                  { name: "Documentation", href: "/documentation", icon: BookOpen },
                  { name: "Developers", href: "/developers", icon: Code },
                ].map((item, idx) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl transition-colors touch-manipulation",
                      "bg-muted/40 hover:bg-muted border border-border/50",
                      isActive(item.href) && "bg-primary/10 border-primary/20"
                    )}
                  >
                    <item.icon className={cn(
                      "w-5 h-5",
                      isActive(item.href) ? "text-primary" : "text-muted-foreground"
                    )} />
                    <span className={cn(
                      "text-sm font-semibold",
                      isActive(item.href) && "text-primary"
                    )}>
                      {item.name}
                    </span>
                  </Link>
                ))}
              </motion.div>

              {/* Navigation Sections */}
              <div className="space-y-2">
                {navSections.map((section, sectionIdx) => (
                  <motion.div
                    key={section.name}
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 + sectionIdx * 0.03 }}
                    className="rounded-xl border border-border/50 overflow-hidden bg-card"
                  >
                    <button
                      onClick={() => setExpandedMobileSection(
                        expandedMobileSection === section.name ? null : section.name
                      )}
                      className="w-full flex items-center justify-between p-4 touch-manipulation"
                      aria-expanded={expandedMobileSection === section.name}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                          <section.icon className="w-4.5 h-4.5 text-muted-foreground" />
                        </div>
                        <div className="text-left">
                          <div className="font-semibold text-sm">{section.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {section.items.length} items
                          </div>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedMobileSection === section.name ? 90 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
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
                                  "flex items-center gap-3 p-3 rounded-lg transition-colors touch-manipulation",
                                  "hover:bg-muted/50",
                                  isActive(item.href) && "bg-primary/5"
                                )}
                              >
                                {item.icon && (
                                  <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                    isActive(item.href) ? "bg-primary/10" : "bg-muted"
                                  )}>
                                    <item.icon className={cn(
                                      "w-4 h-4",
                                      isActive(item.href) ? "text-primary" : "text-muted-foreground"
                                    )} />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className={cn(
                                      "font-medium text-sm",
                                      isActive(item.href) && "text-primary"
                                    )}>
                                      {item.name}
                                    </span>
                                    {item.badge && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <span className="text-xs text-muted-foreground line-clamp-1">
                                      {item.description}
                                    </span>
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

              {/* Auth Section */}
              <motion.div 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-8 pt-6 border-t border-border"
              >
                {user ? (
                  <div className="space-y-3">
                    <Button asChild className="w-full h-12 rounded-xl font-semibold">
                      <Link to="/os">
                        <Command className="w-4 h-4 mr-2" />
                        Open Dashboard
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleSignOut}
                      className="w-full h-11 rounded-xl"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button asChild className="w-full h-12 rounded-xl font-semibold">
                      <Link to="/developers">
                        Get Started Free
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full h-11 rounded-xl">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Footer */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-mono">v7.0.0</span>
                <span>•</span>
                <span>All Systems Operational</span>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer removed - pages handle their own top padding */}
    </>
  );
}
