import { Link } from "react-router-dom";

export function EnhancedFooter() {
  return (
    <footer className="relative z-20 py-12 px-4 border-t border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl pointer-events-auto">
        {/* Main Footer Grid - Investor-Facing First */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
          {/* Company & Investors - First Column */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-foreground">Company</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/investors" className="block py-1 hover:text-primary transition-colors touch-manipulation font-medium text-primary">Investors →</Link></li>
              <li><Link to="/about" className="block py-1 hover:text-primary transition-colors touch-manipulation">About PromptFluid</Link></li>
              <li><Link to="/pillars/promptfluid-the-firsts" className="block py-1 hover:text-primary transition-colors touch-manipulation">The Firsts</Link></li>
              <li><Link to="/partnerships" className="block py-1 hover:text-primary transition-colors touch-manipulation">Partnerships</Link></li>
              <li><Link to="/contact" className="block py-1 hover:text-primary transition-colors touch-manipulation">Contact Us</Link></li>
              <li><a href="tel:7603584324" className="block py-1 hover:text-primary transition-colors touch-manipulation">(760) FLUID-AI</a></li>
            </ul>
          </div>

          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-foreground">Products</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/projects/defense" className="block py-1 hover:text-primary transition-colors touch-manipulation">PromptFluid Reflex</Link></li>
              <li><Link to="/projects/clarity" className="block py-1 hover:text-primary transition-colors touch-manipulation">PromptFluid Clarity</Link></li>
              <li><Link to="/projects/brain" className="block py-1 hover:text-primary transition-colors touch-manipulation">PromptFluid Brain</Link></li>
              <li><Link to="/projects/studio" className="block py-1 hover:text-primary transition-colors touch-manipulation">PromptFluid Studio</Link></li>
              <li><Link to="/projects/ripple" className="block py-1 hover:text-primary transition-colors touch-manipulation">PromptFluid Ripple</Link></li>
              <li><Link to="/projects" className="block py-1 hover:text-primary transition-colors font-medium touch-manipulation">All Products →</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-foreground">Resources</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/blog" className="block py-1 hover:text-primary transition-colors touch-manipulation">Blog</Link></li>
              <li><Link to="/roadmap" className="block py-1 hover:text-primary transition-colors touch-manipulation">Product Roadmap</Link></li>
              <li><Link to="/solutions" className="block py-1 hover:text-primary transition-colors touch-manipulation">Solutions & Pricing</Link></li>
              <li><Link to="/scan" className="block py-1 hover:text-primary transition-colors touch-manipulation font-medium text-primary">Free Scan →</Link></li>
            </ul>
          </div>

          {/* Learn */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-foreground">Learn</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/blog/how-promptfluid-works-cascade-ai-ecosystem" className="block py-1 hover:text-primary transition-colors touch-manipulation">How It Works</Link></li>
              <li><Link to="/blog/cascade-ai-adaptive-intelligence-brain" className="block py-1 hover:text-primary transition-colors touch-manipulation">Cascade AI</Link></li>
              <li><Link to="/blog/clarity-accessibility-mission" className="block py-1 hover:text-primary transition-colors touch-manipulation">Clarity Mission</Link></li>
              <li><Link to="/blog/product-roadmap-2025" className="block py-1 hover:text-primary transition-colors touch-manipulation">2025 Vision</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-foreground">Connect</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><a href="https://twitter.com/promptfluid" target="_blank" rel="noopener noreferrer" className="block py-1 hover:text-primary transition-colors touch-manipulation">Twitter/X</a></li>
              <li><a href="https://linkedin.com/company/promptfluid" target="_blank" rel="noopener noreferrer" className="block py-1 hover:text-primary transition-colors touch-manipulation">LinkedIn</a></li>
              <li><a href="https://github.com/promptfluid" target="_blank" rel="noopener noreferrer" className="block py-1 hover:text-primary transition-colors touch-manipulation">GitHub</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground mb-1">
              © 2025 PromptFluid™ — AI-Powered Security & Intelligent Automation
            </p>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Building the world's first AI that dreams. Products pending WordPress.org approval.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/privacy" className="py-2 hover:text-primary transition-colors touch-manipulation">Privacy</Link>
            <span>•</span>
            <Link to="/terms" className="py-2 hover:text-primary transition-colors touch-manipulation">Terms</Link>
            <span>•</span>
            <Link to="/auth" className="py-2 hover:text-primary transition-colors touch-manipulation text-muted-foreground/60">Employee Login</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
