/**
 * CmpsblNav — Unique OS-Style Navigation
 * Command bar aesthetic with fluid animations
 */

import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Command, X, ChevronRight, Code, Layers, FileText, Mail, Info, 
  Rocket, BookOpen, Users, Eye, Zap, Map, Terminal, Cpu, MessageSquare, 
  Moon, Building2, Gamepad2, Sparkles, Key, Globe, ScrollText, Brain, 
  LogOut, HelpCircle, Search, ArrowRight
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
  items: NavItem[];
}

export function CmpsblNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setActiveSection(null);
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
      items: [
        { name: "Capabilities Depot", href: "/capabilities", description: "86+ Licensed Artifacts", icon: Sparkles, badge: "86+" },
        { name: "CodeLab", href: "/codelab", description: "Execution Playground", icon: Terminal },
        { name: "For Developers", href: "/developers", description: "Build Intelligent Apps", icon: Code },
        { name: "Marketplace", href: "/marketplace", description: "Templates & OS", icon: Layers },
        { name: "Gaming AI", href: "/gaming", description: "NPC Brains & Engines", icon: Gamepad2 },
        ...(user ? [{ name: "Control Panel", href: "/os", description: "Admin Console", icon: Cpu }] : []),
      ]
    },
    {
      name: "Substrate",
      icon: Cpu,
      items: [
        { name: "CMPSBL OS", href: "/substrate", description: "Cognitive Runtime", icon: Cpu },
        { name: "System Feed", href: "/system-feed", description: "Live Intelligence", icon: Brain, badge: "Live" },
        { name: "Decode", href: "/decode", description: "Intent Interpreter", icon: MessageSquare },
        { name: "Dream Feeder", href: "/feed-dream-eater", description: "Dream Processing", icon: Moon },
      ]
    },
    {
      name: "Solutions",
      icon: Building2,
      items: [
        { name: "Use Cases", href: "/use-cases", description: "Industry Applications", icon: Sparkles },
        { name: "Licensing", href: "/substrate/licensing", description: "Dev to Enterprise", icon: FileText },
        { name: "Intelligence", href: "/intelligence", description: "For Investors", icon: Zap },
      ]
    },
    {
      name: "Docs",
      icon: BookOpen,
      items: [
        { name: "Documentation", href: "/documentation", description: "API Reference", icon: FileText },
        { name: "Library", href: "/library", description: "FNDTN v7 Docs", icon: BookOpen },
        { name: "Namespace", href: "/namespace", description: "AI Governance", icon: Globe },
        { name: "LLMS.txt", href: "/llms-txt", description: "Machine Context", icon: Terminal },
      ]
    },
    {
      name: "About",
      icon: Users,
      items: [
        { name: "About", href: "/about", description: "Our Mission", icon: Info },
        { name: "Blog", href: "/blog", description: "Articles & Research", icon: FileText },
        { name: "Contact", href: "/contact", description: "Get in Touch", icon: Mail },
        { name: "Support", href: "/support", description: "AI-Powered Help", icon: HelpCircle },
      ]
    },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isInSection = (section: NavSection) => section.items.some(item => location.pathname === item.href);

  return (
    <>
      {/* Main Navigation Bar */}
      <motion.nav
        ref={navRef}
        initial={false}
        animate={{ 
          y: 0,
          opacity: 1,
        }}
        className={cn(
          "sticky top-0 z-[10000] safe-area-pt transition-all duration-300",
          scrolled 
            ? "bg-background/95 backdrop-blur-xl shadow-lg shadow-foreground/5 border-b border-border/50" 
            : "bg-background/80 backdrop-blur-md"
        )}
      >
        {/* Scanline effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,hsl(var(--foreground)/0.02)_2px,hsl(var(--foreground)/0.02)_4px)]" />
        </div>

        <div className="container mx-auto px-4 py-3 relative">
          <div className="flex items-center justify-between gap-4">
            {/* Logo Section */}
            <Link 
              to="/" 
              className="shrink-0 group flex items-center gap-3"
            >
              <div className="relative">
                <CmpsblLogo size="sm" iconOnly className="h-9 w-9 transition-transform group-hover:scale-105" />
                <motion.div 
                  className="absolute inset-0 rounded-lg bg-primary/20 blur-xl"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-lg font-bold tracking-tight">CMPSBL</span>
                <span className="text-[10px] font-mono text-muted-foreground -mt-0.5">v7.0.0</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1 flex-1 justify-center max-w-2xl">
              {navSections.map((section) => (
                <div key={section.name} className="relative group">
                  <button
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      "hover:bg-muted/60 active:scale-[0.98]",
                      isInSection(section) && "text-primary bg-primary/10"
                    )}
                    onMouseEnter={() => setActiveSection(section.name)}
                    onMouseLeave={() => setActiveSection(null)}
                  >
                    <section.icon className="w-4 h-4" />
                    {section.name}
                    <ChevronRight className={cn(
                      "w-3 h-3 transition-transform duration-200",
                      activeSection === section.name && "rotate-90"
                    )} />
                  </button>

                  {/* Desktop Dropdown */}
                  <AnimatePresence>
                    {activeSection === section.name && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 mt-1 w-72 p-2 bg-card border border-border rounded-xl shadow-2xl shadow-foreground/10"
                        onMouseEnter={() => setActiveSection(section.name)}
                        onMouseLeave={() => setActiveSection(null)}
                      >
                        <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest px-2 py-1.5 mb-1 flex items-center gap-2">
                          <section.icon className="w-3 h-3" />
                          {section.name}
                        </div>
                        <div className="h-px bg-border/50 mb-2" />
                        {section.items.map((item, idx) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                              "flex items-center gap-3 px-2 py-2.5 rounded-lg transition-all duration-150",
                              "hover:bg-muted/50 active:scale-[0.99] group/item",
                              isActive(item.href) && "bg-primary/10 text-primary"
                            )}
                          >
                            {item.icon && (
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                                isActive(item.href) ? "bg-primary/20" : "bg-muted/60 group-hover/item:bg-muted"
                              )}>
                                <item.icon className="w-4 h-4" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{item.name}</span>
                                {item.badge && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                              {item.description && (
                                <span className="text-xs text-muted-foreground">{item.description}</span>
                              )}
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 -translate-x-2 group-hover/item:opacity-100 group-hover/item:translate-x-0 transition-all" />
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Desktop Auth */}
              <div className="hidden lg:flex items-center gap-2">
                {user ? (
                  <>
                    <Button asChild size="sm" className="gap-2 font-semibold">
                      <Link to="/os">
                        <Cpu className="w-4 h-4" />
                        Dashboard
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleSignOut}
                      className="h-9 w-9"
                      title="Sign Out"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" size="sm" className="font-medium">
                      <Link to="/auth">Sign In</Link>
                    </Button>
                    <Button asChild size="sm" className="font-semibold">
                      <Link to="/developers">
                        Get Started
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </Link>
                    </Button>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  "lg:hidden p-2.5 rounded-xl transition-colors touch-target",
                  mobileMenuOpen ? "bg-primary text-primary-foreground" : "bg-muted/60 hover:bg-muted"
                )}
                whileTap={{ scale: 0.95 }}
              >
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={mobileMenuOpen ? "close" : "open"}
                    initial={{ opacity: 0, rotate: -90 }}
                    animate={{ opacity: 1, rotate: 0 }}
                    exit={{ opacity: 0, rotate: 90 }}
                    transition={{ duration: 0.15 }}
                  >
                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Command className="w-5 h-5" />}
                  </motion.div>
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Active indicator line */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: scrolled ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />
      </motion.nav>

      {/* Mobile Menu - Full OS Experience */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Solid backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] lg:hidden bg-background"
            />
            
            {/* Menu Content */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
              className="fixed top-[60px] left-0 right-0 bottom-0 z-[9999] lg:hidden bg-background overflow-hidden"
            >
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="px-4 py-4 border-b border-border/50">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Command className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">Command Center</div>
                      <div className="text-xs text-muted-foreground font-mono">CMPSBL v7.0.0</div>
                    </div>
                  </div>
                  
                  {/* Quick Action Pills */}
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
                    {[
                      { name: "CodeLab", href: "/codelab", icon: Terminal },
                      { name: "Capabilities", href: "/capabilities", icon: Sparkles },
                      { name: "Developers", href: "/developers", icon: Code },
                    ].map((item) => (
                      <Link
                        key={item.href}
                        to={item.href}
                        className={cn(
                          "shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all",
                          isActive(item.href)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/60 hover:bg-muted border border-border/50"
                        )}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Sections */}
                <div className="flex-1 overflow-y-auto momentum-scroll px-4 py-4 pb-32 safe-area-pb">
                  <nav className="space-y-3">
                    {navSections.map((section, idx) => (
                      <motion.div
                        key={section.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 + idx * 0.03 }}
                        className="bg-card rounded-2xl border border-border/50 overflow-hidden"
                      >
                        <button
                          onClick={() => setActiveSection(activeSection === section.name ? null : section.name)}
                          className="w-full flex items-center justify-between px-4 py-3.5 touch-target"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                              activeSection === section.name ? "bg-primary/20 text-primary" : "bg-muted/60"
                            )}>
                              <section.icon className="w-4.5 h-4.5" />
                            </div>
                            <span className="font-semibold">{section.name}</span>
                          </div>
                          <motion.div
                            animate={{ rotate: activeSection === section.name ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </motion.div>
                        </button>

                        <AnimatePresence>
                          {activeSection === section.name && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                              className="overflow-hidden"
                            >
                              <div className="px-4 pb-3 pt-1 space-y-1 border-t border-border/30">
                                {section.items.map((item) => (
                                  <Link
                                    key={item.href}
                                    to={item.href}
                                    className={cn(
                                      "flex items-center gap-3 px-3 py-3 rounded-xl transition-all touch-target",
                                      isActive(item.href) 
                                        ? "bg-primary/10 text-primary" 
                                        : "hover:bg-muted/50 active:bg-muted"
                                    )}
                                  >
                                    {item.icon && (
                                      <div className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                        isActive(item.href) ? "bg-primary/20" : "bg-muted/40"
                                      )}>
                                        <item.icon className="w-4 h-4" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{item.name}</span>
                                        {item.badge && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">
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
                  </nav>
                </div>

                {/* Bottom Auth Bar */}
                <div className="border-t border-border/50 bg-card/80 backdrop-blur-xl p-4 safe-area-pb">
                  {user ? (
                    <div className="flex items-center gap-3">
                      <Button asChild className="flex-1 gap-2 font-semibold">
                        <Link to="/os">
                          <Cpu className="w-4 h-4" />
                          Dashboard
                        </Link>
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSignOut}
                        className="h-11 w-11"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Button asChild variant="outline" className="flex-1 font-medium">
                        <Link to="/auth">Sign In</Link>
                      </Button>
                      <Button asChild className="flex-1 font-semibold gap-2">
                        <Link to="/developers">
                          Get Started
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
