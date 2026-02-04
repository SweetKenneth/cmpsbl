/**
 * CmpsblNav — Neural-Link Navigation System
 * A radically unique, futuristic navigation experience
 */

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, X, ChevronDown, Code, Layers, FileText, Mail, Info, 
  Rocket, BookOpen, Users, Zap, Terminal, Cpu, MessageSquare, 
  Moon, Building2, Gamepad2, Sparkles, Globe, Brain, 
  LogOut, ArrowRight, Activity, Hexagon
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
}

interface NavSection {
  name: string;
  icon: React.ElementType;
  color: string;
  items: NavItem[];
}

export function CmpsblNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [expandedMobileSection, setExpandedMobileSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setHoveredSection(null);
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
      name: "Build",
      icon: Code,
      color: "from-fuchsia-500 to-purple-600",
      items: [
        { name: "Capabilities", href: "/capabilities", description: "86+ AI Artifacts", icon: Sparkles, badge: "86+" },
        { name: "CodeLab", href: "/codelab", description: "Execute & Test", icon: Terminal },
        { name: "Developers", href: "/developers", description: "Build Apps", icon: Code },
        { name: "Marketplace", href: "/marketplace", description: "Templates", icon: Layers },
        { name: "Gaming AI", href: "/gaming", description: "NPC Engines", icon: Gamepad2 },
        ...(user ? [{ name: "Dashboard", href: "/os", description: "Control Panel", icon: Cpu }] : []),
      ]
    },
    {
      name: "Substrate",
      icon: Cpu,
      color: "from-cyan-500 to-blue-600",
      items: [
        { name: "CMPSBL OS", href: "/substrate", description: "Core Runtime", icon: Cpu },
        { name: "System Feed", href: "/system-feed", description: "Live Intel", icon: Brain, badge: "Live" },
        { name: "Decode", href: "/decode", description: "Intent Parser", icon: MessageSquare },
        { name: "Dream Feeder", href: "/feed-dream-eater", description: "Processing", icon: Moon },
      ]
    },
    {
      name: "Solutions",
      icon: Building2,
      color: "from-amber-500 to-orange-600",
      items: [
        { name: "Use Cases", href: "/use-cases", description: "Applications", icon: Sparkles },
        { name: "Licensing", href: "/substrate/licensing", description: "Enterprise", icon: FileText },
        { name: "Intelligence", href: "/intelligence", description: "Investors", icon: Zap },
      ]
    },
    {
      name: "Learn",
      icon: BookOpen,
      color: "from-emerald-500 to-teal-600",
      items: [
        { name: "Docs", href: "/documentation", description: "API Reference", icon: FileText },
        { name: "Library", href: "/library", description: "FNDTN v7", icon: BookOpen },
        { name: "Namespace", href: "/namespace", description: "Governance", icon: Globe },
        { name: "LLMS.txt", href: "/llms-txt", description: "Machine CTX", icon: Terminal },
      ]
    },
    {
      name: "Connect",
      icon: Users,
      color: "from-rose-500 to-pink-600",
      items: [
        { name: "About", href: "/about", description: "Mission", icon: Info },
        { name: "Blog", href: "/blog", description: "Research", icon: FileText },
        { name: "Contact", href: "/contact", description: "Reach Us", icon: Mail },
      ]
    },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isInSection = (section: NavSection) => section.items.some(item => location.pathname === item.href);

  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
          DESKTOP NAVIGATION — Neural Link Bar
          ══════════════════════════════════════════════════════════════════════ */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[10000] transition-all duration-500",
          scrolled 
            ? "bg-background border-b border-border/50" 
            : "bg-transparent"
        )}
      >
        {/* Neural pulse line */}
        <div className="absolute bottom-0 left-0 right-0 h-px overflow-hidden">
          <motion.div 
            className="absolute inset-y-0 w-32 bg-gradient-to-r from-transparent via-primary to-transparent"
            animate={{ x: ["-100%", "400%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            
            {/* ═══ Logo ═══ */}
            <Link to="/" className="relative group flex items-center gap-3 shrink-0">
              <div className="relative">
                <Hexagon className="w-10 h-10 text-primary transition-transform group-hover:rotate-[30deg] duration-500" strokeWidth={1.5} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="w-5 h-5 text-primary" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="text-xl font-black tracking-tighter">CMPSBL</div>
                <div className="text-[9px] font-mono text-muted-foreground tracking-widest">SUBSTRATE OS</div>
              </div>
            </Link>

            {/* ═══ Desktop Center Navigation ═══ */}
            <div className="hidden lg:flex items-center">
              <div className="flex items-center bg-muted/30 rounded-full p-1.5 border border-border/50">
                {navSections.map((section) => (
                  <div 
                    key={section.name} 
                    className="relative"
                    onMouseEnter={() => setHoveredSection(section.name)}
                    onMouseLeave={() => setHoveredSection(null)}
                  >
                    <button
                      className={cn(
                        "relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
                        hoveredSection === section.name && "text-foreground",
                        isInSection(section) && "text-foreground",
                        !hoveredSection && !isInSection(section) && "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {/* Active/Hover background pill */}
                      {(hoveredSection === section.name || (isInSection(section) && !hoveredSection)) && (
                        <motion.div
                          layoutId="nav-pill"
                          className={cn(
                            "absolute inset-0 rounded-full bg-gradient-to-r",
                            section.color,
                            "opacity-15"
                          )}
                          transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        />
                      )}
                      <section.icon className="w-4 h-4 relative z-10" />
                      <span className="relative z-10">{section.name}</span>
                      <ChevronDown className={cn(
                        "w-3 h-3 relative z-10 transition-transform duration-200",
                        hoveredSection === section.name && "rotate-180"
                      )} />
                    </button>

                    {/* ═══ Desktop Mega Dropdown ═══ */}
                    <AnimatePresence>
                      {hoveredSection === section.name && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-80"
                        >
                          {/* Arrow indicator */}
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-card border-l border-t border-border" />
                          
                          <div className="relative bg-card rounded-2xl border border-border shadow-2xl shadow-black/20 overflow-hidden">
                            {/* Gradient header */}
                            <div className={cn("h-1.5 bg-gradient-to-r", section.color)} />
                            
                            <div className="p-3">
                              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 py-2 flex items-center gap-2">
                                <section.icon className="w-3.5 h-3.5" />
                                {section.name}
                              </div>
                              
                              <div className="space-y-1">
                                {section.items.map((item) => (
                                  <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group/item",
                                      "hover:bg-muted/50",
                                      isActive(item.href) && "bg-muted"
                                    )}
                                  >
                                    {item.icon && (
                                      <div className={cn(
                                        "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                        "bg-gradient-to-br",
                                        section.color,
                                        "text-white shadow-lg"
                                      )}>
                                        <item.icon className="w-4 h-4" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm">{item.name}</span>
                                        {item.badge && (
                                          <span className={cn(
                                            "text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r",
                                            section.color,
                                            "text-white"
                                          )}>
                                            {item.badge}
                                          </span>
                                        )}
                                      </div>
                                      {item.description && (
                                        <span className="text-xs text-muted-foreground">{item.description}</span>
                                      )}
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            {/* ═══ Right Section ═══ */}
            <div className="flex items-center gap-3">
              {/* Desktop Auth Buttons */}
              <div className="hidden lg:flex items-center gap-2">
                {user ? (
                  <>
                    <Button asChild size="sm" className="rounded-full px-5 font-semibold">
                      <Link to="/os">
                        <Cpu className="w-4 h-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSignOut}
                      className="rounded-full"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" size="sm" className="rounded-full px-4 font-medium">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <Button asChild size="sm" className="rounded-full px-5 font-semibold bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 border-0">
                      <Link to="/developers">
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-1" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {/* ═══ Mobile Menu Button ═══ */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  "lg:hidden relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300",
                  mobileMenuOpen 
                    ? "bg-primary text-primary-foreground rotate-90" 
                    : "bg-muted/50 hover:bg-muted text-foreground"
                )}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={mobileMenuOpen ? "close" : "menu"}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.15 }}
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </motion.div>
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* ══════════════════════════════════════════════════════════════════════
          MOBILE NAVIGATION — Full Screen Neural Interface
          ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] lg:hidden"
          >
            {/* Solid white/dark background */}
            <div className="absolute inset-0 bg-background" />
            
            {/* Content */}
            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ delay: 0.1 }}
              className="relative h-full pt-20 pb-8 px-6 overflow-y-auto"
            >
              {/* Header */}
              <div className="mb-8">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15 }}
                  className="flex items-center gap-4 mb-6"
                >
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
                      <Activity className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl font-black tracking-tight">CMPSBL</div>
                    <div className="text-sm text-muted-foreground">Neural Navigation</div>
                  </div>
                </motion.div>

                {/* Quick access buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: "Capabilities", href: "/capabilities", icon: Sparkles, color: "from-fuchsia-500 to-purple-600" },
                    { name: "CodeLab", href: "/codelab", icon: Terminal, color: "from-cyan-500 to-blue-600" },
                    { name: "Docs", href: "/documentation", icon: BookOpen, color: "from-emerald-500 to-teal-600" },
                  ].map((item, idx) => (
                    <motion.div
                      key={item.href}
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 + idx * 0.05 }}
                    >
                      <Link
                        to={item.href}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-2xl transition-all",
                          "bg-muted/50 hover:bg-muted border border-border/50",
                          isActive(item.href) && "bg-gradient-to-br text-white border-0 " + item.color
                        )}
                      >
                        <item.icon className="w-6 h-6" />
                        <span className="text-xs font-semibold">{item.name}</span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Navigation Sections */}
              <div className="space-y-3">
                {navSections.map((section, sectionIdx) => (
                  <motion.div
                    key={section.name}
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.25 + sectionIdx * 0.05 }}
                    className="rounded-2xl border border-border/50 overflow-hidden bg-card"
                  >
                    <button
                      onClick={() => setExpandedMobileSection(
                        expandedMobileSection === section.name ? null : section.name
                      )}
                      className="w-full flex items-center justify-between p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br text-white",
                          section.color
                        )}>
                          <section.icon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="font-bold">{section.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {section.items.length} items
                          </div>
                        </div>
                      </div>
                      <motion.div
                        animate={{ rotate: expandedMobileSection === section.name ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
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
                                  "flex items-center gap-3 p-3 rounded-xl transition-all",
                                  "hover:bg-muted/50",
                                  isActive(item.href) && "bg-muted"
                                )}
                              >
                                {item.icon && (
                                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                    <item.icon className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{item.name}</span>
                                    {item.badge && (
                                      <span className={cn(
                                        "text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-gradient-to-r text-white",
                                        section.color
                                      )}>
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  {item.description && (
                                    <span className="text-xs text-muted-foreground">{item.description}</span>
                                  )}
                                </div>
                                <ArrowRight className="w-4 h-4 text-muted-foreground" />
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
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 pt-6 border-t border-border/50"
              >
                {user ? (
                  <div className="space-y-3">
                    <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-fuchsia-600 to-purple-600">
                      <Link to="/os">
                        <Cpu className="w-5 h-5 mr-2" />
                        Open Dashboard
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleSignOut}
                      className="w-full h-12 rounded-2xl"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button asChild className="w-full h-14 rounded-2xl text-lg font-bold bg-gradient-to-r from-fuchsia-600 to-purple-600 border-0">
                      <Link to="/developers">
                        Get Started Free
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full h-12 rounded-2xl">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                  </div>
                )}
              </motion.div>

              {/* Footer */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-center"
              >
                <div className="text-xs text-muted-foreground font-mono">
                  CMPSBL SUBSTRATE OS v7.0.0
                </div>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs text-emerald-500 font-medium">All Systems Online</span>
                </div>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer for fixed nav */}
      <div className="h-16 lg:h-20" />
    </>
  );
}
