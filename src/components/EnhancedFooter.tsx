import { Link } from "react-router-dom";

export function EnhancedFooter() {
  return (
    <footer className="relative z-20 py-3 md:py-6 px-4 border-t border-border bg-background" role="contentinfo">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© 2025-2026 promptfluid®</p>
          <nav className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link to="/investors" className="hover:text-foreground transition-colors">
              Investors
            </Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
