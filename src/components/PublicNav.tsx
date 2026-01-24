import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, X, ChevronDown, Code, 
  Layers, FileText, Mail, Info, Rocket, BookOpen, Users,
  Zap, Map, Terminal, Cpu, MessageSquare, Moon, Building2, Gamepad2, Sparkles
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

interface NavSection {
  name: string;
  icon: React.ElementType;
  items: { name: string; href: string; description?: string; icon?: React.ElementType }[];
}

export function PublicNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const location = useLocation();
  const { user } = useAuth();

  // Organized navigation sections
  const navSections: NavSection[] = [
    {
      name: "CMPSBL",
      icon: Layers,
      items: [
        { name: "CMPSBL OS", href: "/substrate", description: "Cognitive Runtime", icon: Cpu },
        { name: "Decode", href: "/decode", description: "Intent Interpreter", icon: MessageSquare },
        { name: "Dream Feeder", href: "/feed-dream-eater", description: "Dream Processing", icon: Moon },
        { name: "Demo", href: "/demo", description: "Interactive Demo", icon: Zap },
      ]
    },
    {
      name: "Build",
      icon: Code,
      items: [
        { name: "For Developers", href: "/developers", description: "Build Intelligent Apps", icon: Code },
        { name: "Marketplace", href: "/marketplace", description: "Templates & OS ($9-$599)", icon: Sparkles },
        { name: "Gaming AI", href: "/gaming", description: "NPC Brains & World Engines", icon: Gamepad2 },
        { name: "CodeLab", href: "/codelab", description: "Templates & Workbench", icon: Terminal },
        { name: "Documentation", href: "/documentation", description: "API Reference", icon: FileText },
        ...(user ? [{ name: "Control Panel", href: "/os", description: "Admin Console", icon: Cpu }] : []),
      ]
    },
    {
      name: "Solutions",
      icon: Building2,
      items: [
        { name: "Use Cases", href: "/use-cases", description: "Industry Applications", icon: Sparkles },
        { name: "Enterprise", href: "/solutions", description: "Business Solutions", icon: Building2 },
        { name: "Projects", href: "/projects", description: "Active Development", icon: Rocket },
      ]
    },
    {
      name: "Resources",
      icon: BookOpen,
      items: [
        { name: "Blog", href: "/blog", description: "Articles & Research", icon: FileText },
        { name: "Changelog", href: "/changelog", description: "Version History", icon: BookOpen },
        { name: "Roadmap", href: "/roadmap", description: "Development Plan", icon: Map },
      ]
    },
    {
      name: "About",
      icon: Users,
      items: [
        { name: "About", href: "/about", description: "Our Mission", icon: Info },
        { name: "Contact", href: "/contact", description: "Get in Touch", icon: Mail },
      ]
    },
  ];

  // Flat list for mobile
  const allNavItems = navSections.flatMap(section => section.items);
  
  // Quick access items shown directly in nav
  const quickLinks = [
    { name: "Developers", href: "/developers" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Use Cases", href: "/use-cases" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const isInSection = (section: NavSection) => 
    section.items.some(item => location.pathname === item.href);

  return (
    <>
      <nav
        className="sticky top-0 z-[10000] bg-background/95 backdrop-blur-md border-b border-border/50"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="shrink-0 hover:opacity-80 transition-opacity"
          >
            <CmpsblLogo size="sm" className="hidden sm:block" />
            <CmpsblLogo size="sm" iconOnly className="sm:hidden h-8 w-8" />
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Quick Links */}
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(item.href)
                    ? "text-foreground bg-muted font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.name}
              </Link>
            ))}

            {/* Dropdown Sections */}
            {navSections.map((section) => (
              <DropdownMenu key={section.name}>
                <DropdownMenuTrigger asChild>
                  <button
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isInSection(section)
                        ? "text-foreground bg-muted font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {section.name}
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-background border border-border">
                  <DropdownMenuLabel className="flex items-center gap-2 text-xs text-muted-foreground">
                    <section.icon className="w-3 h-3" />
                    {section.name}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {section.items.map((item) => (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link
                        to={item.href}
                        className={`flex items-center gap-3 w-full cursor-pointer ${
                          isActive(item.href) ? "bg-muted" : ""
                        }`}
                      >
                        {item.icon && <item.icon className="w-4 h-4 text-muted-foreground" />}
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          {item.description && (
                            <span className="text-xs text-muted-foreground">{item.description}</span>
                          )}
                        </div>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ))}

            {/* Auth / CTA */}
            {user ? (
              <Link
                to="/os"
                className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/auth"
                className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Tablet Menu - simplified */}
          <div className="hidden md:flex lg:hidden items-center gap-1">
            <Link
              to="/demo"
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive("/demo")
                  ? "text-foreground bg-muted font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Demo
            </Link>
            <Link
              to="/codelab"
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive("/codelab")
                  ? "text-foreground bg-muted font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              CodeLab
            </Link>
            <Link
              to="/developers"
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive("/developers")
                  ? "text-foreground bg-muted font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Developers
            </Link>
            <Link
              to="/contact"
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Mobile Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[9998] md:hidden bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div 
            className="fixed top-[57px] left-0 right-0 bottom-0 z-[9999] md:hidden bg-background overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            <div className="container mx-auto px-4 py-4">
              {/* Search-like quick access */}
              <div className="flex gap-2 mb-4 overflow-x-auto pb-2 -mx-4 px-4">
                {["Developers", "Gaming", "Use Cases", "Demo", "Contact"].map((name) => {
                  const href = name === "Developers" ? "/developers" :
                               name === "Gaming" ? "/gaming" :
                               name === "Use Cases" ? "/use-cases" :
                               name === "Demo" ? "/demo" : "/contact";
                  return (
                    <Link
                      key={name}
                      to={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                        isActive(href)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground hover:bg-muted/80"
                      }`}
                    >
                      {name}
                    </Link>
                  );
                })}
              </div>

              {/* Sections */}
              <nav className="flex flex-col gap-2">
                {navSections.map((section) => (
                  <div key={section.name} className="border border-border rounded-xl overflow-hidden">
                    <button
                      onClick={() => setExpandedSection(
                        expandedSection === section.name ? null : section.name
                      )}
                      className={`w-full flex items-center justify-between p-4 text-left transition-colors ${
                        isInSection(section) ? "bg-muted/50" : "hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <section.icon className="w-5 h-5 text-primary" />
                        <span className="font-medium">{section.name}</span>
                        {isInSection(section) && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <ChevronDown 
                        className={`w-4 h-4 text-muted-foreground transition-transform ${
                          expandedSection === section.name ? "rotate-180" : ""
                        }`} 
                      />
                    </button>
                    
                    {expandedSection === section.name && (
                      <div className="border-t border-border bg-muted/20">
                        {section.items.map((item) => (
                          <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex items-center gap-3 p-4 transition-colors ${
                              isActive(item.href)
                                ? "bg-primary/10 text-primary"
                                : "hover:bg-muted/50"
                            }`}
                          >
                            {item.icon && <item.icon className="w-4 h-4" />}
                            <div className="flex flex-col">
                              <span className="font-medium">{item.name}</span>
                              {item.description && (
                                <span className="text-xs text-muted-foreground">{item.description}</span>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Auth Link */}
                {user ? (
                  <Link
                    to="/os"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-primary/30 bg-primary/5 text-primary"
                  >
                    <Cpu className="w-5 h-5" />
                    <span className="font-medium">CMPSBL OS</span>
                  </Link>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-border hover:bg-muted/30"
                  >
                    <Users className="w-5 h-5" />
                    <span className="font-medium">Sign In</span>
                  </Link>
                )}

                {/* Legal */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <Link 
                      to="/privacy" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-foreground"
                    >
                      Privacy
                    </Link>
                    <Link 
                      to="/terms" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-foreground"
                    >
                      Terms
                    </Link>
                    <Link 
                      to="/llms-txt" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="hover:text-foreground"
                    >
                      llms.txt
                    </Link>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}
