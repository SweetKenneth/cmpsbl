/**
 * 404 — Signal Lost
 * Cinematic not-found page with smart suggestions and search
 */
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Home, BookOpen, Search, ArrowRight, Waves } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";

const SUGGESTIONS = [
  { name: "Memory Stream", href: "/foundry", description: "Crystallize memories from the stream" },
  { name: "Documentation", href: "/documentation", description: "API reference & guides" },
  { name: "Upgrade", href: "/upgrade", description: "Plans, pricing & tiers" },
  { name: "Runtime Agents", href: "/composable-cognitives", description: "Sealed AI runtime agents" },
  { name: "Persistent Memory", href: "/persistent-memory", description: "Add memory to any agent" },
  { name: "Blog", href: "/blog", description: "Research & updates" },
  { name: "Start Here", href: "/start-here", description: "Get oriented fast" },
  { name: "Academy", href: "/academy", description: "Interactive tutorials" },
];

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    import('@/integrations/supabase/client').then(({ supabase }) => {
      supabase.from('analytics_events').insert({
        event_type: '404',
        category: 'error',
        page: location.pathname,
        label: document.referrer || 'direct',
        metadata: { userAgent: navigator.userAgent?.slice(0, 200) },
      } as any).then(() => {});
    });
    const timer = setTimeout(() => setShowContent(true), 400);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  const smartSuggestions = useMemo(() => {
    const pathParts = location.pathname.toLowerCase().split("/").filter(Boolean);
    if (pathParts.length === 0) return SUGGESTIONS.slice(0, 4);
    return SUGGESTIONS.filter(s =>
      pathParts.some(p =>
        s.name.toLowerCase().includes(p) ||
        s.href.toLowerCase().includes(p) ||
        s.description.toLowerCase().includes(p)
      )
    ).slice(0, 4);
  }, [location.pathname]);

  const displayedSuggestions = smartSuggestions.length > 0 ? smartSuggestions : SUGGESTIONS.slice(0, 4);

  const filteredSuggestions = query.trim()
    ? SUGGESTIONS.filter(s =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.description.toLowerCase().includes(query.toLowerCase())
      )
    : displayedSuggestions;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <SEO title="Signal Lost — CMPSBL" description="This path dissolved before crystallization." noindex />

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 50%)' }}
        />
        <div className="absolute inset-0 substrate-grid-bg opacity-[0.06]" />
        {/* Animated scan line */}
        <motion.div
          className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
          initial={{ top: '20%' }}
          animate={{ top: ['20%', '80%', '20%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <AnimatePresence>
        {showContent && (
          <motion.div
            className="relative z-10 text-center max-w-lg w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            {/* Status chip */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-destructive/10 border border-destructive/20 mb-8"
            >
              <Waves className="w-3.5 h-3.5 text-destructive/70" />
              <span className="text-xs font-mono text-destructive/70">Signal dissolved before crystallization</span>
            </motion.div>

            {/* 404 number */}
            <motion.h1
              initial={{ opacity: 0, scale: 1.4, filter: 'blur(16px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.7, delay: 0.1, type: 'spring', stiffness: 100 }}
              className="text-[7rem] sm:text-[9rem] font-extralight leading-none text-foreground mb-2 relative select-none"
            >
              <span className="memory-stream-gradient-text">404</span>
              {/* Ghost echo */}
              <motion.span
                className="absolute inset-0 text-[7rem] sm:text-[9rem] font-extralight text-primary/8 pointer-events-none"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.4, 1.6], opacity: [0.2, 0.05, 0] }}
                transition={{ duration: 2.5, delay: 0.4, ease: 'easeOut' }}
              >
                404
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg text-muted-foreground mb-1"
            >
              This path never crystallized from the Memory Stream.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xs font-mono text-muted-foreground/30 mb-2"
            >
              {location.pathname}
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-xs font-mono text-muted-foreground/40 mb-8"
            >
              Quality floor: 68 · Only stable systems survive
            </motion.p>

            {/* Search */}
            <motion.div
              className="relative mb-6 max-w-sm mx-auto"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
              <input
                type="text"
                placeholder="Search the stream…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-card/60 backdrop-blur-md border border-border/40 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all placeholder:text-muted-foreground/40"
              />
            </motion.div>

            {/* Suggestions */}
            <motion.div
              className="mb-8 space-y-1 max-w-sm mx-auto text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
            >
              <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest px-1 font-mono mb-2">
                {query.trim() ? "Results" : "Crystallized paths"}
              </p>
              {filteredSuggestions.map((s, i) => (
                <motion.div
                  key={s.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + i * 0.06 }}
                >
                  <Link
                    to={s.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-card/80 transition-all group border border-transparent hover:border-border/40 hover:shadow-sm hover:shadow-primary/5"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{s.name}</div>
                      <div className="text-xs text-muted-foreground/60">{s.description}</div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-3 justify-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              <Button
                onClick={() => navigate('/')}
                className="gap-2 shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all min-h-[44px]"
              >
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button asChild variant="outline" className="gap-2 backdrop-blur-sm hover:border-primary/30 transition-colors min-h-[44px]">
                <Link to="/start-here">
                  <BookOpen className="w-4 h-4" />
                  Start Here
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotFound;
