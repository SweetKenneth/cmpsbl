import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { Sparkles, Home, BookOpen, Terminal, Search, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

// Popular destinations for suggestions
const SUGGESTIONS = [
  { name: "Modules", href: "/modules", description: "Browse all substrate modules" },
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

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  // Fuzzy match suggestions based on the attempted path
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <SEO title="Page Not Found — CMPSBL" description="This page doesn't exist in the substrate." noindex />
      
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-[80px]" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-violet-500/5 blur-[60px]" />
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="w-5 h-5 text-primary/60" />
          <span className="text-sm text-muted-foreground">Lost in the substrate</span>
        </div>

        <h1 className="text-6xl font-light text-foreground mb-4">404</h1>
        
        <p className="text-lg text-muted-foreground mb-6">
          This path dissolves into the void.
        </p>

        {/* Search box */}
        <div className="relative mb-6 max-w-sm mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for a page..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-muted/30 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Smart suggestions */}
        <div className="mb-8 space-y-2 max-w-sm mx-auto text-left">
          <p className="text-xs text-muted-foreground uppercase tracking-wider px-1">
            {query.trim() ? "Results" : "Maybe you meant"}
          </p>
          {filteredSuggestions.map((s) => (
            <Link
              key={s.href}
              to={s.href}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{s.name}</div>
                <div className="text-xs text-muted-foreground">{s.description}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/documentation">
              <BookOpen className="w-4 h-4" />
              Docs
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link to="/status">
              <Terminal className="w-4 h-4" />
              System Status
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
