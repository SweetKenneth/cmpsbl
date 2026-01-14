import { Link } from "react-router-dom";

export function EnhancedFooter() {
  return (
    <footer className="relative z-20 py-3 md:py-6 px-4 border-t border-border bg-background" role="contentinfo">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025-2026 promptfluid®</p>
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            <Link to="/substrate" className="hover:text-foreground transition-colors">
              Substrate
            </Link>
            <Link to="/feed-dream-eater" className="hover:text-foreground transition-colors">
              Dream
            </Link>
            <Link to="/publication" className="hover:text-foreground transition-colors">
              DOI
            </Link>
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <a 
              href="/llms.txt" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              llms.txt
            </a>
            <a 
              href="/humans.txt" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              humans.txt
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
