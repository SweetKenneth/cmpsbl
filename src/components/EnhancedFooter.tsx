import { Link } from "react-router-dom";

export function EnhancedFooter() {
  return (
    <footer className="relative z-20 py-12 px-4 border-t border-border/50 bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl pointer-events-auto">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-8 mb-10">
          {/* Products */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-foreground">Products</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/projects/defense" className="block py-1 hover:text-primary transition-colors touch-manipulation">PromptFluid Reflex</Link></li>
              <li><Link to="/projects/brain" className="block py-1 hover:text-primary transition-colors touch-manipulation">PromptFluid Brain</Link></li>
              <li><Link to="/projects/studio" className="block py-1 hover:text-primary transition-colors touch-manipulation">PromptFluid Studio</Link></li>
              <li><Link to="/projects/ripple" className="block py-1 hover:text-primary transition-colors touch-manipulation">PromptFluid Ripple</Link></li>
              <li><Link to="/projects/access" className="block py-1 hover:text-primary transition-colors touch-manipulation">PromptFluid Access</Link></li>
              <li><Link to="/projects" className="block py-1 hover:text-primary transition-colors font-medium touch-manipulation">All Products →</Link></li>
            </ul>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-foreground">Tools</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/brain-hub" className="block py-1 hover:text-primary transition-colors touch-manipulation">Brain Hub</Link></li>
              <li><Link to="/creative-generation" className="block py-1 hover:text-primary transition-colors touch-manipulation">Creative Studio</Link></li>
              <li><Link to="/marketing-studio" className="block py-1 hover:text-primary transition-colors touch-manipulation">Marketing Suite</Link></li>
              <li><Link to="/prompt-merger" className="block py-1 hover:text-primary transition-colors touch-manipulation">Prompt Merger</Link></li>
              <li><Link to="/modernizer" className="block py-1 hover:text-primary transition-colors touch-manipulation">Modernizer</Link></li>
            </ul>
          </div>

          {/* Developers */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-foreground">Developers</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/documentation" className="block py-1 hover:text-primary transition-colors touch-manipulation">Documentation</Link></li>
              <li><Link to="/ripple-network" className="block py-1 hover:text-primary transition-colors touch-manipulation">Ripple Network</Link></li>
              <li><Link to="/threat-feed" className="block py-1 hover:text-primary transition-colors touch-manipulation">Threat Feed</Link></li>
              <li><Link to="/roadmap" className="block py-1 hover:text-primary transition-colors touch-manipulation">Product Roadmap</Link></li>
            </ul>
          </div>

          {/* Resources - WordPress & Security */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-foreground">Security Guides</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/blog" className="block py-1 hover:text-primary transition-colors touch-manipulation">All Articles →</Link></li>
              <li><Link to="/blog/wordpress-bot-defense" className="block py-1 hover:text-primary transition-colors touch-manipulation">Bot Defense Guide</Link></li>
              <li><Link to="/blog/top-security-plugins-2025" className="block py-1 hover:text-primary transition-colors touch-manipulation">Plugin Comparison</Link></li>
              <li><Link to="/blog/ai-cybersecurity-evolution-2025" className="block py-1 hover:text-primary transition-colors touch-manipulation">AI Cybersecurity</Link></li>
              <li><Link to="/blog/ai-hackers-underground-2025" className="block py-1 hover:text-primary transition-colors touch-manipulation">AI Threat Landscape</Link></li>
            </ul>
          </div>

          {/* Resources - Technology */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-foreground">Technology</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/blog/how-promptfluid-works-cascade-ai-ecosystem" className="block py-1 hover:text-primary transition-colors touch-manipulation">How It Works</Link></li>
              <li><Link to="/blog/cascade-ai-adaptive-intelligence-brain" className="block py-1 hover:text-primary transition-colors touch-manipulation">Cascade AI</Link></li>
              <li><Link to="/blog/ai-triad-intelligent-routing" className="block py-1 hover:text-primary transition-colors touch-manipulation">AI Triad</Link></li>
              <li><Link to="/blog/promptfluid-brain-adaptive-learning-core" className="block py-1 hover:text-primary transition-colors touch-manipulation">Brain Core</Link></li>
              <li><Link to="/blog/ai-automation-trends-2025" className="block py-1 hover:text-primary transition-colors touch-manipulation">Automation Trends</Link></li>
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-foreground">Company</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/about" className="block py-1 hover:text-primary transition-colors touch-manipulation">About PromptFluid</Link></li>
              <li><Link to="/investors" className="block py-1 hover:text-primary transition-colors touch-manipulation">Investors</Link></li>
              <li><Link to="/partnerships" className="block py-1 hover:text-primary transition-colors touch-manipulation">Partnerships</Link></li>
              <li><Link to="/contact" className="block py-1 hover:text-primary transition-colors touch-manipulation">Contact Us</Link></li>
              <li><a href="tel:7603584324" className="block py-1 hover:text-primary transition-colors touch-manipulation">(760) FLUID-AI</a></li>
            </ul>
          </div>

          {/* Connect & Social */}
          <div>
            <h4 className="font-semibold mb-4 text-sm text-foreground">Connect</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/blog" className="block py-1 hover:text-primary transition-colors touch-manipulation">Blog</Link></li>
              <li><Link to="/auth" className="block py-1 hover:text-primary transition-colors touch-manipulation">Sign In</Link></li>
              <li><a href="https://twitter.com/promptfluid" target="_blank" rel="noopener noreferrer" className="block py-1 hover:text-primary transition-colors touch-manipulation">Twitter/X</a></li>
              <li><a href="https://linkedin.com/company/promptfluid" target="_blank" rel="noopener noreferrer" className="block py-1 hover:text-primary transition-colors touch-manipulation">LinkedIn</a></li>
              <li><a href="https://github.com/promptfluid" target="_blank" rel="noopener noreferrer" className="block py-1 hover:text-primary transition-colors touch-manipulation">GitHub</a></li>
            </ul>
          </div>
        </div>

        {/* Popular Articles Section */}
        <div className="border-t border-border/50 pt-8 mb-8">
          <h4 className="font-semibold mb-4 text-sm text-foreground">Popular Articles</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link to="/blog/ai-product-comparison-2025" className="block py-2 text-xs text-muted-foreground hover:text-primary transition-colors touch-manipulation">
              AI Product Comparison 2025
            </Link>
            <Link to="/blog/ai-business-operations-2025" className="block py-2 text-xs text-muted-foreground hover:text-primary transition-colors touch-manipulation">
              AI in Business Operations
            </Link>
            <Link to="/blog/product-roadmap-2025" className="block py-2 text-xs text-muted-foreground hover:text-primary transition-colors touch-manipulation">
              Product Roadmap 2025
            </Link>
            <Link to="/blog/cmptbl-mission" className="block py-2 text-xs text-muted-foreground hover:text-primary transition-colors touch-manipulation">
              CMPTBL Mission
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground mb-1">
              © 2025 PromptFluid™ — AI-Powered Security & Intelligent Automation Ecosystem
            </p>
            <p className="text-xs text-muted-foreground max-w-2xl">
              PromptFluid Reflex with Bot Sniper™ technology protects WordPress sites using adaptive AI and behavioral analysis. Part of the complete <Link to="/blog/how-promptfluid-works-cascade-ai-ecosystem" className="text-primary hover:underline">PromptFluid ecosystem</Link> powered by <Link to="/blog/cascade-ai-adaptive-intelligence-brain" className="text-primary hover:underline">Cascade AI</Link>.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/" className="py-2 hover:text-primary transition-colors touch-manipulation">Home</Link>
            <span>•</span>
            <Link to="/about" className="py-2 hover:text-primary transition-colors touch-manipulation">About</Link>
            <span>•</span>
            <Link to="/contact" className="py-2 hover:text-primary transition-colors touch-manipulation">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
