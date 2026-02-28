/**
 * MobileCommandPalette — Search-to-navigate for mobile users.
 * Searches across all public routes with fuzzy matching.
 * Touch-optimized with 44px+ tap targets.
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, ArrowRight, X, Layers, Code, Users, Shield, Brain, Zap, FileText, Sparkles, Package } from "lucide-react";
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
  { name: "How It Works", href: "/ai-operating-system", section: "Platform", icon: Layers, keywords: ["architecture", "concepts"] },
  { name: "Substrate", href: "/substrate", section: "Platform", icon: Layers, keywords: ["core", "infrastructure"] },
  { name: "Substrate Demo", href: "/demo", section: "Platform", icon: Sparkles, keywords: ["interactive", "live"] },
  { name: "All Modules", href: "/modules", section: "Platform", icon: Layers, keywords: ["modules", "production"] },
  { name: "Runtime", href: "/runtime", section: "Platform", icon: Code, keywords: ["execution", "environment"] },
  { name: "Dashboard", href: "/os", section: "Platform", icon: Layers, keywords: ["command center"] },
  
  // Product
  { name: "Artifact Packs", href: "/packs", section: "Product", icon: Package, keywords: ["activate", "capabilities", "slots"] },
  { name: "Composable Agents", href: "/composable-cognitives", section: "Product", icon: Zap, keywords: ["cognitives", "AI agents"] },
  { name: "Persistent Memory", href: "/persistent-memory", section: "Product", icon: Brain, keywords: ["memory", "agent memory"] },
  { name: "Enterprise", href: "/enterprise", section: "Product", icon: Shield, keywords: ["scale", "governed"] },
  { name: "Upgrade", href: "/upgrade", section: "Product", icon: Zap, keywords: ["pricing", "plans", "tiers"] },

  // Developers
  { name: "Start Here", href: "/start-here", section: "Developers", icon: Code, keywords: ["getting started", "quickstart"] },
  { name: "Documentation", href: "/documentation", section: "Developers", icon: FileText, keywords: ["API", "reference", "guides"] },
  { name: "Developer Showcase", href: "/developers", section: "Developers", icon: Users, keywords: ["community", "integrations"] },
  { name: "Academy", href: "/academy", section: "Developers", icon: Code, keywords: ["tutorials", "learning"] },
  { name: "CodeLab", href: "/codelab", section: "Developers", icon: Code, keywords: ["execute", "test", "sandbox"] },
  { name: "API Access", href: "/api-access", section: "Developers", icon: Code, keywords: ["keys", "quotas"] },

  // Company
  { name: "Blog", href: "/blog", section: "Company", icon: FileText, keywords: ["research", "updates"] },
  { name: "About", href: "/about", section: "Company", icon: Users, keywords: ["mission", "team"] },
  { name: "Contact", href: "/contact", section: "Company", icon: Users, keywords: ["get in touch"] },
  { name: "Insights", href: "/insights", section: "Company", icon: FileText, keywords: ["analysis", "thought leadership"] },
  { name: "Showcase", href: "/showcase", section: "Company", icon: Sparkles, keywords: ["demos", "built with"] },
  { name: "System Status", href: "/status", section: "Company", icon: Shield, keywords: ["health", "uptime", "live"] },
  { name: "Changelog", href: "/changelog", section: "Company", icon: FileText, keywords: ["updates", "releases"] },
  
  // Other
  { name: "Use Cases", href: "/use-cases", section: "Solutions", icon: Layers },
  { name: "Solutions", href: "/solutions", section: "Solutions", icon: Layers },
  { name: "Library", href: "/library", section: "Resources", icon: FileText },
  { name: "Roadmap", href: "/roadmap", section: "Company", icon: FileText },
  { name: "Privacy Policy", href: "/privacy", section: "Legal", icon: Shield },
  { name: "Terms of Service", href: "/terms", section: "Legal", icon: Shield },
  { name: "DECODE", href: "/", section: "Tools", icon: Code, keywords: ["terminal", "natural language"] },
  { name: "Dream Eater", href: "/feed-dream-eater", section: "Tools", icon: Brain, keywords: ["dream", "feed"] },
  { name: "Proof Mode", href: "/proof", section: "Tools", icon: Shield, keywords: ["provenance", "audit"] },
  { name: "Lab", href: "/lab", section: "Tools", icon: Sparkles, keywords: ["experiment", "sandbox"] },
  { name: "Sign In", href: "/auth", section: "Account", icon: Users, keywords: ["login", "register"] },
  { name: "Gaming Substrate", href: "/gaming", section: "Solutions", icon: Layers, keywords: ["games", "NPC"] },
  { name: "Capability Map", href: "/capability-map", section: "Platform", icon: Layers },
  { name: "DevTools", href: "/devtools", section: "Developers", icon: Code },
  { name: "Namespace", href: "/namespace", section: "Platform", icon: Layers, keywords: ["terminology"] },
  { name: "Foundations", href: "/foundations", section: "Company", icon: FileText },
  { name: "Support", href: "/support", section: "Company", icon: Users, keywords: ["help"] },
];

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
    if (!query.trim()) return ALL_ROUTES.slice(0, 8); // Show popular when empty
    const q = query.toLowerCase();
    return ALL_ROUTES.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.section.toLowerCase().includes(q) ||
      r.keywords?.some(k => k.toLowerCase().includes(q))
    ).slice(0, 12);
  }, [query]);

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
                placeholder="Search pages..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-foreground text-base placeholder:text-muted-foreground focus:outline-none"
                autoComplete="off"
                autoCorrect="off"
              />
              <button
                onClick={() => onOpenChange(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors touch-manipulation"
                aria-label="Close search"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto p-2">
              {results.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No pages found for "{query}"
                </div>
              ) : (
                <div className="space-y-0.5">
                  {results.map((route) => (
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
                        <div className="text-xs text-muted-foreground">{route.section}</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="p-3 border-t border-border flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <kbd className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">⌘K</kbd>
              <span>to toggle search</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
