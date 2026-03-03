/**
 * MobileCommandPalette — Search-to-navigate for mobile users.
 * Searches across all public routes with fuzzy matching.
 * Touch-optimized with 44px+ tap targets.
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, X, Layers, Code, Users, Shield, Brain, Zap, FileText, Sparkles, Package, BookOpen, Settings, BarChart3, Terminal, Cpu, Eye, Moon, Hammer, ScrollText, HeartPulse, Activity, Network, Gauge, Lock, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface SearchableRoute {
  name: string;
  href: string;
  section: string;
  icon: React.ElementType;
  keywords?: string[];
}

// All navigable routes — comprehensive, nothing removed
const ALL_ROUTES: SearchableRoute[] = [
  // Platform
  { name: "Home", href: "/", section: "Platform", icon: Layers },
  { name: "How It Works", href: "/ai-operating-system", section: "Platform", icon: Layers, keywords: ["architecture", "concepts", "operating system"] },
  { name: "Substrate", href: "/substrate", section: "Platform", icon: Cpu, keywords: ["core", "infrastructure", "dashboard"] },
  { name: "Substrate Demo", href: "/demo", section: "Platform", icon: Sparkles, keywords: ["interactive", "live", "try"] },
  { name: "All Modules", href: "/modules", section: "Platform", icon: Layers, keywords: ["modules", "production", "hub"] },
  { name: "Runtime", href: "/runtime", section: "Platform", icon: Code, keywords: ["execution", "environment"] },
  { name: "Dashboard", href: "/os", section: "Platform", icon: Layers, keywords: ["command center", "control"] },
  { name: "Capability Map", href: "/capability-map", section: "Platform", icon: Network },
  { name: "Namespace", href: "/namespace", section: "Platform", icon: Layers, keywords: ["terminology", "glossary"] },
  { name: "Architecture", href: "/ai-operating-system", section: "Platform", icon: Layers, keywords: ["design", "system"] },
  { name: "System Status", href: "/status", section: "Platform", icon: Shield, keywords: ["health", "uptime", "live"] },
  { name: "System Integrity", href: "/system-integrity", section: "Platform", icon: Shield, keywords: ["diagnostics"] },
  
  // Product
  { name: "Artifact Packs", href: "/packs", section: "Product", icon: Package, keywords: ["activate", "capabilities", "slots"] },
  { name: "Composable Agents", href: "/composable-cognitives", section: "Product", icon: Zap, keywords: ["cognitives", "AI agents", "cognitive"] },
  { name: "Persistent Memory", href: "/persistent-memory", section: "Product", icon: Brain, keywords: ["memory", "agent memory", "recall"] },
  { name: "Enterprise", href: "/enterprise", section: "Product", icon: Shield, keywords: ["scale", "governed", "organization"] },
  { name: "Upgrade", href: "/upgrade", section: "Product", icon: Gauge, keywords: ["pricing", "plans", "tiers", "billing"] },
  { name: "Licensing", href: "/licensing", section: "Product", icon: FileText, keywords: ["self-hosted", "license key"] },
  { name: "Gaming Substrate", href: "/gaming", section: "Solutions", icon: Layers, keywords: ["games", "NPC", "world engine"] },

  // Developers
  { name: "Start Here", href: "/start-here", section: "Developers", icon: Code, keywords: ["getting started", "quickstart", "onboarding"] },
  { name: "Documentation", href: "/documentation", section: "Developers", icon: BookOpen, keywords: ["API", "reference", "guides", "docs"] },
  { name: "Developer Showcase", href: "/developers", section: "Developers", icon: Users, keywords: ["community", "integrations"] },
  { name: "Academy", href: "/academy", section: "Developers", icon: Code, keywords: ["tutorials", "learning", "courses"] },
  { name: "CodeLab", href: "/codelab", section: "Developers", icon: Terminal, keywords: ["execute", "test", "sandbox", "playground"] },
  { name: "API Access", href: "/api-access", section: "Developers", icon: Code, keywords: ["keys", "quotas", "tokens"] },
  { name: "DevTools", href: "/devtools", section: "Developers", icon: Terminal },
  { name: "Capabilities Docs", href: "/docs/substrate/capabilities", section: "Developers", icon: BookOpen },
  { name: "Memory Docs", href: "/docs/persistent-memory", section: "Developers", icon: BookOpen },
  { name: "Runtime Reference", href: "/docs/runtime", section: "Developers", icon: BookOpen },
  { name: "Capability Manifest", href: "/docs/manifest", section: "Developers", icon: BookOpen },

  // Tools
  { name: "DECODE", href: "/decode", section: "Tools", icon: Terminal, keywords: ["terminal", "natural language", "command"] },
  { name: "Dream Eater", href: "/feed-dream-eater", section: "Tools", icon: Moon, keywords: ["dream", "feed", "archaeology"] },
  { name: "Dream Archaeology", href: "/dream-eater/archaeology", section: "Tools", icon: Moon, keywords: ["history", "dreams"] },
  { name: "Dream Artifacts", href: "/dream-eater/artifacts", section: "Tools", icon: Moon },
  { name: "Proof Mode", href: "/proof", section: "Tools", icon: Shield, keywords: ["provenance", "audit", "verification"] },
  { name: "Lab", href: "/lab", section: "Tools", icon: HeartPulse, keywords: ["experiment", "sandbox", "research"] },
  { name: "System Feed", href: "/system-feed", section: "Tools", icon: Brain, keywords: ["intelligence", "feed"] },
  { name: "Clockless World Engine", href: "/clockless-world-engine", section: "Tools", icon: Sparkles },

  // Company
  { name: "Blog", href: "/blog", section: "Company", icon: FileText, keywords: ["research", "updates", "articles"] },
  { name: "About", href: "/about", section: "Company", icon: Users, keywords: ["mission", "team", "story"] },
  { name: "Contact", href: "/contact", section: "Company", icon: Users, keywords: ["get in touch", "email"] },
  { name: "Insights", href: "/insights", section: "Company", icon: FileText, keywords: ["analysis", "thought leadership"] },
  { name: "Showcase", href: "/showcase", section: "Company", icon: Sparkles, keywords: ["demos", "built with", "S-tier"] },
  { name: "Changelog", href: "/changelog", section: "Company", icon: Activity, keywords: ["updates", "releases", "what's new"] },
  { name: "Roadmap", href: "/roadmap", section: "Company", icon: FileText, keywords: ["future", "planned"] },
  { name: "Foundations", href: "/foundations", section: "Company", icon: FileText },
  { name: "Careers", href: "/careers", section: "Company", icon: Users, keywords: ["jobs", "hiring"] },
  { name: "Investors", href: "/investors", section: "Company", icon: BarChart3 },
  { name: "Current Projects", href: "/projects", section: "Company", icon: Layers },

  // Resources
  { name: "Documentation", href: "/documentation", section: "Resources", icon: FileText },
  { name: "Use Cases", href: "/use-cases", section: "Solutions", icon: Layers },
  { name: "Solutions", href: "/solutions", section: "Solutions", icon: Layers },
  { name: "Support", href: "/support", section: "Resources", icon: Users, keywords: ["help", "faq"] },
  { name: "llms.txt", href: "/llms-txt", section: "Resources", icon: FileText, keywords: ["machine", "protocol"] },
  { name: "humans.txt", href: "/humans-txt", section: "Resources", icon: FileText },

  // Account
  { name: "Sign In", href: "/auth", section: "Account", icon: Users, keywords: ["login", "register", "account"] },
  
  // Legal
  { name: "Privacy Policy", href: "/privacy", section: "Legal", icon: Shield },
  { name: "Terms of Service", href: "/terms", section: "Legal", icon: Shield },

  // Admin (for authenticated users)
  { name: "INTEL Panel", href: "/admin/intel", section: "Admin", icon: Eye, keywords: ["control plane", "diagnostics"] },
  { name: "Governance", href: "/admin/governance", section: "Admin", icon: Shield },
  { name: "Immunity Mesh", href: "/admin/immunity-mesh", section: "Admin", icon: Shield },
  { name: "Evolution", href: "/admin/evolution", section: "Admin", icon: Zap },
  { name: "Quarry", href: "/admin/quarry", section: "Admin", icon: Cpu },
  { name: "Patches", href: "/admin/patches", section: "Admin", icon: Shield },
  { name: "Cognitive Forge", href: "/forge", section: "Admin", icon: Hammer },
  { name: "Diligence", href: "/diligence", section: "Admin", icon: ScrollText },
  { name: "Audit Trail", href: "/audit", section: "Admin", icon: ScrollText },
];

// Sections in display order for grouped results
const SECTION_ORDER = ["Platform", "Product", "Developers", "Tools", "Company", "Solutions", "Resources", "Admin", "Account", "Legal"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MobileCommandPalette({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onOpenChange]);

  const results = useMemo(() => {
    if (!query.trim()) return ALL_ROUTES.slice(0, 10); // Show popular when empty
    const q = query.toLowerCase();
    
    // Score-based fuzzy matching
    const scored = ALL_ROUTES.map(r => {
      let score = 0;
      const name = r.name.toLowerCase();
      const section = r.section.toLowerCase();
      
      // Exact name match
      if (name === q) score += 100;
      // Name starts with query
      else if (name.startsWith(q)) score += 80;
      // Name contains query
      else if (name.includes(q)) score += 60;
      // Section match
      if (section.includes(q)) score += 30;
      // Keyword match
      if (r.keywords?.some(k => k.toLowerCase().includes(q))) score += 40;
      // Path match
      if (r.href.toLowerCase().includes(q)) score += 20;
      
      return { route: r, score };
    })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);
    
    return scored.map(s => s.route);
  }, [query]);

  // Group results by section
  const grouped = useMemo(() => {
    const map = new Map<string, SearchableRoute[]>();
    for (const r of results) {
      const list = map.get(r.section) || [];
      list.push(r);
      map.set(r.section, list);
    }
    return SECTION_ORDER
      .filter(s => map.has(s))
      .map(s => ({ section: s, routes: map.get(s)! }));
  }, [results]);

  const handleSelect = (href: string) => {
    onOpenChange(false);
    navigate(href);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[10001] bg-background/90 backdrop-blur-sm"
          onClick={() => onOpenChange(false)}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute inset-x-0 top-0 max-h-[85vh] bg-card border-b border-border shadow-2xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 p-4 border-b border-border">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search pages…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-foreground text-base placeholder:text-muted-foreground focus:outline-none"
                autoComplete="off"
                autoCorrect="off"
              />
              <button
                onClick={() => onOpenChange(false)}
                className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-2 overscroll-contain">
              {results.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No pages found for "{query}"
                </div>
              ) : (
                <div className="space-y-3">
                  {grouped.map(({ section, routes }) => (
                    <div key={section}>
                      <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {section}
                      </div>
                      <div className="space-y-0.5">
                        {routes.map((route) => (
                          <button
                            key={route.href + route.name}
                            onClick={() => handleSelect(route.href)}
                            className={cn(
                              "w-full flex items-center gap-3 p-3 rounded-lg transition-colors touch-manipulation text-left",
                              "hover:bg-muted active:bg-muted min-h-[44px]"
                            )}
                          >
                            <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                              <route.icon className="w-4 h-4 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-foreground truncate">{route.name}</div>
                              <div className="text-xs text-muted-foreground">{route.section} · {route.href}</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="p-3 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">⌘K</kbd>
              <span>to toggle · {ALL_ROUTES.length} pages indexed</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
