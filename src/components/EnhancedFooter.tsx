import { Link } from "react-router-dom";

export function EnhancedFooter() {
  return (
    <footer className="relative z-20 py-16 px-4 border-t border-border bg-background" role="contentinfo">
      <div className="container mx-auto max-w-6xl">
        {/* Logo at Top */}
        <div className="mb-12">
          <Link to="/" className="inline-block">
            <img 
              src="/favicon.png" 
              alt="promptfluid" 
              className="h-12 w-12"
            />
          </Link>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Substrate */}
          <div>
            <h4 className="font-semibold mb-5 text-sm text-foreground tracking-wide">Substrate</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/investors" className="text-primary font-medium hover:text-primary/80 transition-colors">
                  Investors
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="text-muted-foreground hover:text-foreground transition-colors">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Modules */}
          <div>
            <h4 className="font-semibold mb-5 text-sm text-foreground tracking-wide">Modules</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/projects/defense" className="text-muted-foreground hover:text-foreground transition-colors">
                  Defense
                </Link>
              </li>
              <li>
                <Link to="/projects/clarity" className="text-muted-foreground hover:text-foreground transition-colors">
                  Clarity
                </Link>
              </li>
              <li>
                <Link to="/projects/brain" className="text-muted-foreground hover:text-foreground transition-colors">
                  Brain
                </Link>
              </li>
              <li>
                <Link to="/projects" className="text-primary font-medium hover:text-primary/80 transition-colors">
                  All Modules →
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-5 text-sm text-foreground tracking-wide">Resources</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/solutions" className="text-muted-foreground hover:text-foreground transition-colors">
                  Solutions
                </Link>
              </li>
              <li>
                <Link to="/scan" className="text-primary font-medium hover:text-primary/80 transition-colors">
                  Free Scan →
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-5 text-sm text-foreground tracking-wide">Connect</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="https://twitter.com/promptfluid" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a 
                  href="https://linkedin.com/company/promptfluid" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  LinkedIn
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/promptfluid" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  GitHub
                </a>
              </li>
              <li>
                <a 
                  href="tel:7603584324" 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  (760) FLUID-AI
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2025-2026 promptfluid® — Cognitive Orchestration Substrate
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link to="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
          </div>
        </div>

        {/* Licensing Notice */}
        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground">
            For ownership inquiries or licensing: promptfluid@gmail.com
          </p>
        </div>
      </div>
    </footer>
  );
}
