/**
 * PublicNav — Premium Navigation with Glass Effects
 * Mobile-first, smooth animations, professional polish
 */

import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, X, ChevronDown, ChevronRight, Code, 
  Layers, FileText, Mail, Info, Rocket, BookOpen, Users, Eye,
  Zap, Map, Terminal, Cpu, MessageSquare, Moon, Building2, Gamepad2, Sparkles, Key, Globe, ScrollText,
  Brain, LogOut, HelpCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { CmpsblLogo } from "@/components/CmpsblLogo";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface NavSection {
  name: string;
  icon: React.ElementType;
  items: { name: string; href: string; description?: string; icon?: React.ElementType }[];
}

export function PublicNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  // Handle scroll state for nav background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setExpandedSection(null);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Organized navigation sections
  const navSections: NavSection[] = [
    {
      name: "Build",
      icon: Code,
      items: [
        { name: "Capabilities Depot", href: "/capabilities", description: "86+ Licensed Cognitive Artifacts", icon: Sparkles },
        { name: "CodeLab", href: "/codelab", description: "Execution-First Playground", icon: Terminal },
        { name: "For Developers", href: "/developers", description: "Build Intelligent Apps", icon: Code },
        { name: "Marketplace", href: "/marketplace", description: "Templates & OS", icon: Layers },
        { name: "Experimentation Lab", href: "/lab", description: "Live Template Demos", icon: Zap },
        { name: "Gaming AI", href: "/gaming", description: "NPC Brains & World Engines", icon: Gamepad2 },
        { name: "DevTools", href: "/devtools", description: "SDK & Documentation", icon: Terminal },
        ...(user ? [{ name: "Control Panel", href: "/os", description: "Admin Console", icon: Cpu }] : []),
      ]
    },
    {
      name: "CMPSBL",
      icon: Layers,
      items: [
        { name: "CMPSBL OS", href: "/substrate", description: "Cognitive Runtime", icon: Cpu },
        { name: "System Feed", href: "/system-feed", description: "Live System Intelligence", icon: Brain },
        { name: "Decode", href: "/decode", description: "Intent Interpreter", icon: MessageSquare },
        { name: "Dream Feeder", href: "/feed-dream-eater", description: "Dream Processing", icon: Moon },
        { name: "Demo", href: "/demo", description: "Interactive Demo", icon: Zap },
      ]
    },
    {
      name: "Solutions",
      icon: Building2,
      items: [
        { name: "Use Cases", href: "/use-cases", description: "Industry Applications", icon: Sparkles },
        { name: "Substrate Licensing", href: "/substrate/licensing", description: "Developer to Enterprise", icon: FileText },
        { name: "Substrate Intelligence", href: "/intelligence", description: "For Investors & Acquirers", icon: Zap },
        { name: "Projects", href: "/projects", description: "Active Development", icon: Rocket },
      ]
    },
    {
      name: "Standards",
      icon: ScrollText,
      items: [
        { name: "Documentation", href: "/documentation", description: "API Reference", icon: FileText },
        { name: "Library", href: "/library", description: "FNDTN v7 Documentation", icon: BookOpen },
        { name: "Foundations", href: "/foundations", description: "FNDTN v6.0.0 Standard", icon: Layers },
        { name: "Namespace", href: "/namespace", description: "AI Governance Namespace", icon: Globe },
        { name: "LLMS.txt", href: "/llms-txt", description: "Machine Context Standard", icon: Terminal },
        { name: "Insights", href: "/insights", description: "Observer Access", icon: Eye },
      ]
    },
    {
      name: "Resources",
      icon: BookOpen,
      items: [
        { name: "Blog", href: "/blog", description: "Articles & Research", icon: FileText },
        { name: "Evolution Log", href: "/changelog", description: "System Evolution", icon: BookOpen },
        { name: "Roadmap", href: "/roadmap", description: "Development Plan", icon: Map },
      ]
    },
    {
      name: "About",
      icon: Users,
      items: [
        { name: "About", href: "/about", description: "Our Mission", icon: Info },
        { name: "Contact", href: "/contact", description: "Get in Touch", icon: Mail },
        { name: "Support", href: "/support", description: "AI-Powered Help", icon: HelpCircle },
      ]
    },
  ];
  
  // Quick access items shown directly in nav
  const quickLinks = [
    { name: "CodeLab", href: "/codelab" },
    { name: "Developers", href: "/developers" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Licensing", href: "/substrate/licensing" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isInSection = (section: NavSection) => 
    section.items.some(item => location.pathname === item.href);

  return (
    <>
      <motion.nav
        initial={false}
        animate={{ 
          backgroundColor: scrolled ? "hsl(var(--background) / 0.95)" : "hsl(var(--background) / 0.8)",
          borderBottomColor: scrolled ? "hsl(var(--border) / 0.5)" : "transparent",
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "sticky top-0 z-[10000] backdrop-blur-xl border-b transition-shadow duration-300 safe-area-pt",
          scrolled && "shadow-lg shadow-background/10"
        )}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="shrink-0 hover:opacity-80 transition-all duration-300 hover:scale-[1.02] tap-highlight-none touch-target flex items-center"
          >
            <CmpsblLogo size="sm" className="hidden sm:block" />
            <CmpsblLogo size="sm" iconOnly className="sm:hidden h-9 w-9" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Quick Links */}
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "relative px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive(item.href)
                    ? "text-foreground bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {item.name}
                {isActive(item.href) && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-primary/10 -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </Link>
            ))}

            {/* Dropdown Sections */}
            {navSections.map((section) => (
              <DropdownMenu key={section.name}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                      isInSection(section)
                        ? "text-foreground bg-primary/10"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {section.name}
                    <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  align="start" 
                  className="w-64 p-2 bg-background/95 backdrop-blur-xl border border-border/50 shadow-xl shadow-background/20"
                  sideOffset={8}
                >
                  <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground px-2 py-1.5">
                    <section.icon className="w-3.5 h-3.5" />
                    {section.name}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border/50" />
                  {section.items.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3 w-full px-2 py-2.5 rounded-lg cursor-pointer transition-colors",
                          isActive(item.href) 
                            ? "bg-primary/10 text-primary" 
                            : "hover:bg-muted/50"
                        )}
                      >
                        {item.icon && (
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                            isActive(item.href) 
                              ? "bg-primary/20 text-primary" 
                              : "bg-muted/50 text-muted-foreground"
                          )}>
                            <item.icon className="w-4 h-4" />
                          </div>
                        )}
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-sm">{item.name}</span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground truncate">{item.description}</span>
                          )}
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}

            {/* Auth / CTA */}
            <div className="flex items-center gap-2 ml-3 pl-3 border-l border-border/50">
              {user ? (
                <>
                  <Button
                    asChild
                    size="sm"
                    className="gap-2 font-semibold shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                  >
                    <Link to="/os">
                      <Cpu className="w-4 h-4" />
                      Dashboard
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSignOut}
                    className="h-9 w-9 text-muted-foreground hover:text-foreground"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                </>
              ) : (
                <Button
                  asChild
                  size="sm"
                  className="font-semibold shadow-md hover:shadow-lg hover:shadow-primary/20 transition-all duration-300"
                >
                  <Link to="/auth">Sign In</Link>
                </Button>
              )}
            </div>
          </div>

          {/* Tablet Menu - simplified */}
          <div className="hidden md:flex lg:hidden items-center gap-1">
            {["CodeLab", "Developers", "Demo"].map((name) => {
              const href = name === "CodeLab" ? "/codelab" : name === "Developers" ? "/developers" : "/demo";
              return (
                <Link
                  key={name}
                  to={href}
                  className={cn(
                    "px-3 py-2 rounded-lg text-sm font-medium transition-colors touch-target tap-highlight-none",
                    isActive(href)
                      ? "text-foreground bg-primary/10"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {name}
                </Link>
              );
            })}
            <Button asChild size="sm" className="ml-2 font-semibold touch-target">
              <Link to="/contact">Contact</Link>
            </Button>
          </div>

          {/* Mobile Toggle - Larger touch target */}
          <motion.button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={cn(
              "md:hidden p-3 rounded-xl transition-colors touch-target tap-highlight-none",
              mobileMenuOpen ? "bg-primary/10 text-primary" : "hover:bg-muted active:bg-muted/80"
            )}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
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
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.nav>

      {/* Mobile Menu - Full Screen Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[9998] md:hidden bg-background/80 backdrop-blur-md"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />
            
            {/* Menu Panel */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed top-[57px] left-0 right-0 bottom-0 z-[9999] md:hidden bg-background overflow-y-auto overscroll-contain"
              role="dialog"
              aria-modal="true"
            >
              <div className="px-4 py-4 pb-28 safe-area-pb momentum-scroll">
                {/* Quick Access Pills - Horizontally scrollable */}
                <div className="flex gap-2.5 mb-6 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide touch-pan-x">
                  {["Capabilities", "CodeLab", "Developers", "Licensing", "Support"].map((name, idx) => {
                    const href = name === "Capabilities" ? "/capabilities" :
                                 name === "CodeLab" ? "/codelab" :
                                 name === "Developers" ? "/developers" :
                                 name === "Licensing" ? "/substrate/licensing" : "/support";
                    return (
                      <motion.div
                        key={name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.02 + idx * 0.02 }}
                      >
                        <Link
                          to={href}
                          className={cn(
                            "shrink-0 px-4 py-3 rounded-full text-sm font-semibold transition-all duration-200 touch-target tap-highlight-none",
                            isActive(href)
                              ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                              : "bg-muted/50 text-foreground hover:bg-muted border border-border/50 active:scale-95"
                          )}
                        >
                          {name}
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Sections */}
                <nav className="flex flex-col gap-3">
                  {navSections.map((section, sectionIdx) => (
                    <motion.div 
                      key={section.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + sectionIdx * 0.03 }}
                      className="rounded-2xl border border-border/50 overflow-hidden bg-card/50 backdrop-blur-sm"
                    >
                      <button
                        onClick={() => setExpandedSection(
                          expandedSection === section.name ? null : section.name
                        )}
                        className={cn(
                          "w-full flex items-center justify-between p-4 text-left transition-colors touch-target tap-highlight-none",
                          expandedSection === section.name ? "bg-muted/30" : "hover:bg-muted/20 active:bg-muted/30"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center transition-colors",
                            isInSection(section) 
                              ? "bg-primary/15 text-primary" 
                              : "bg-muted/50 text-muted-foreground"
                          )}>
                            <section.icon className="w-5 h-5" />
                          </div>
                          <span className="font-semibold text-foreground">{section.name}</span>
                          {isInSection(section) && (
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          )}
                        </div>
                        <motion.div
                          animate={{ rotate: expandedSection === section.name ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {expandedSection === section.name && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-border/30 bg-muted/10">
                              {section.items.map((item, idx) => (
                                <motion.div
                                  key={item.href}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.03 }}
                                >
                                  <Link
                                    to={item.href}
                                    className={cn(
                                      "flex items-center gap-3 px-4 py-4 transition-colors touch-target tap-highlight-none",
                                      isActive(item.href)
                                        ? "bg-primary/10 text-primary"
                                        : "hover:bg-muted/30 active:bg-muted/50"
                                    )}
                                  >
                                    {item.icon && (
                                      <div className={cn(
                                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                        isActive(item.href) 
                                          ? "bg-primary/20 text-primary" 
                                          : "bg-muted/30 text-muted-foreground"
                                      )}>
                                        <item.icon className="w-4 h-4" />
                                      </div>
                                    )}
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="font-medium text-sm">{item.name}</span>
                                      {item.description && (
                                        <span className="text-xs text-muted-foreground truncate">{item.description}</span>
                                      )}
                                    </div>
                                    <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground/50 shrink-0" />
                                  </Link>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}

                  {/* Auth Links */}
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    {user ? (
                      <>
                        <Link
                          to="/os"
                          className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 text-primary touch-target tap-highlight-none active:scale-[0.98] transition-transform"
                        >
                          <div className="w-11 h-11 rounded-xl bg-primary/20 flex items-center justify-center">
                            <Cpu className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <span className="font-semibold block">CMPSBL OS</span>
                            <span className="text-xs text-primary/70">Open Dashboard</span>
                          </div>
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 p-4 rounded-2xl border border-border/50 hover:bg-muted/30 active:bg-muted/50 text-muted-foreground w-full transition-colors touch-target tap-highlight-none"
                        >
                          <div className="w-11 h-11 rounded-xl bg-muted/50 flex items-center justify-center">
                            <LogOut className="w-5 h-5" />
                          </div>
                          <span className="font-medium">Sign Out</span>
                        </button>
                      </>
                    ) : (
                      <Link
                        to="/auth"
                        className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:shadow-xl transition-all touch-target tap-highlight-none active:scale-[0.98]"
                      >
                        <Users className="w-5 h-5" />
                        Sign In to CMPSBL
                      </Link>
                    )}
                  </div>

                  {/* Legal Links */}
                  <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    {[
                      { name: "Privacy", href: "/privacy" },
                      { name: "Terms", href: "/terms" },
                      { name: "llms.txt", href: "/llms-txt" },
                      { name: "humans.txt", href: "/humans-txt" },
                    ].map((link) => (
                      <Link 
                        key={link.href}
                        to={link.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
