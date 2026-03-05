import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import { Sparkles, Home, BookOpen, Terminal, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { motion, AnimatePresence } from "framer-motion";



// Popular destinations for suggestions
const SUGGESTIONS = [
  { name: "Memory Stream", href: "/foundry", description: "Crystallize pipelines from the stream" },
  { name: "Documentation", href: "/documentation", description: "API reference & guides" },
  { name: "Upgrade", href: "/upgrade", description: "Plans, pricing & tiers" },
  { name: "Composable Agents", href: "/composable-cognitives", description: "Pre-built AI agents" },
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
    // Track 404 silently via analytics — no console noise
    import('@/integrations/supabase/client').then(({ supabase }) => {
      supabase.from('analytics_events').insert({
        event_type: '404',
        category: 'error',
        page: location.pathname,
        label: document.referrer || 'direct',
        metadata: { userAgent: navigator.userAgent?.slice(0, 200) },
      } as any).then(() => {});
    });
    // Cinematic delay — dissolve effect before content appears
    const timer = setTimeout(() => setShowContent(true), 600);
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
      
      {/* Background — CSS-only for performance */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Fading radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.15) 0%, transparent 50%)' }}
        />
        
        {/* Subtle grid */}
        <div className="absolute inset-0 substrate-grid-bg opacity-[0.08]" />
      </div>

      <AnimatePresence>
        {showContent && (
          <motion.div 
            className="relative z-10 text-center max-w-lg w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-center gap-2 mb-8"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              >
                <Sparkles className="w-5 h-5 text-primary/60" />
              </motion.div>
              <span className="text-sm text-muted-foreground font-mono">Signal dissolved before crystallization</span>
            </motion.div>

            {/* Cinematic 404 with crystallization shatter */}
            <motion.h1
              initial={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.8, delay: 0.2, type: 'spring', stiffness: 100 }}
              className="text-7xl font-light text-foreground mb-4 relative"
            >
              <span className="memory-stream-gradient-text">404</span>
              {/* Ghost echo */}
              <motion.span
                className="absolute inset-0 text-7xl font-light text-primary/10 pointer-events-none"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.3, 1.5], opacity: [0.3, 0.1, 0] }}
                transition={{ duration: 2, delay: 0.5, ease: 'easeOut' }}
              >
                404
              </motion.span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-lg text-muted-foreground mb-2"
            >
              This path never crystallized from the Memory Stream.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xs font-mono text-muted-foreground/50 mb-6"
            >
              Quality floor: 68 · Only stable systems survive
            </motion.p>

            {/* Search box with signal-border */}
            <motion.div 
              className="relative mb-6 max-w-sm mx-auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search the stream..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-muted/20 backdrop-blur-sm border border-border/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30 transition-all signal-border"
              />
            </motion.div>

            {/* Smart suggestions with staggered crystallize-in */}
            <motion.div 
              className="mb-8 space-y-2 max-w-sm mx-auto text-left"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <p className="text-xs text-muted-foreground uppercase tracking-wider px-1 font-mono">
                {query.trim() ? "Results" : "Crystallized paths"}
              </p>
              {filteredSuggestions.map((s, i) => (
                <motion.div
                  key={s.href}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.9 + i * 0.08 }}
                >
                  <Link
                    to={s.href}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/30 backdrop-blur-sm transition-all group border border-transparent hover:border-border/30"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.description}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0" />
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-3 justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Button onClick={() => navigate('/')} variant="outline" className="gap-2 backdrop-blur-sm">
                <Home className="w-4 h-4" />
                Home
              </Button>
              <Button asChild variant="outline" className="gap-2 backdrop-blur-sm">
                <Link to="/foundry">
                  <Sparkles className="w-4 h-4" />
                  Memory Stream
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-2 backdrop-blur-sm">
                <Link to="/status">
                  <Terminal className="w-4 h-4" />
                  System Status
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
