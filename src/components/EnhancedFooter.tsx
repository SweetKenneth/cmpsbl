import { Link } from "react-router-dom";
import { Layers, Mail, Phone } from "lucide-react";

export function EnhancedFooter() {
  return (
    <footer className="relative z-20 py-16 px-4 border-t border-border bg-background" role="contentinfo">
      <div className="container mx-auto max-w-6xl">
        {/* Logo at Top */}
        <div className="mb-12 flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-3">
            <img 
              src="/favicon.png" 
              alt="promptfluid" 
              width={40}
              height={40}
              className="h-10 w-10"
              loading="lazy"
              decoding="async"
            />
            <span className="text-lg font-semibold text-foreground">promptfluid<sup className="text-xs">®</sup></span>
          </Link>
          <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground border border-border rounded-full px-2 py-0.5">
            <Layers className="w-3 h-3" />
            The AI Substrate
          </span>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          {/* Substrate */}
          <div>
            <h4 className="font-semibold mb-5 text-sm text-foreground tracking-wide">Substrate</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/substrate" className="text-primary font-medium hover:text-primary/80 transition-colors">
                  Dashboard →
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/investors" className="text-muted-foreground hover:text-foreground transition-colors">
                  Acquisition
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
                <Link to="/projects/brain" className="text-muted-foreground hover:text-foreground transition-colors">
                  Brain
                </Link>
              </li>
              <li>
                <Link to="/projects/defense" className="text-muted-foreground hover:text-foreground transition-colors">
                  Defense
                </Link>
              </li>
              <li>
                <Link to="/projects/clarity" className="text-muted-foreground hover:text-foreground transition-colors">
                  Vision
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
                <Link to="/documentation" className="text-muted-foreground hover:text-foreground transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <a href="https://PTCHBL.com" target="_blank" rel="noopener noreferrer" className="text-primary font-medium hover:text-primary/80 transition-colors">
                  Try PTCHBL Free →
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-5 text-sm text-foreground tracking-wide">Contact</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a 
                  href="mailto:promptfluid@gmail.com" 
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Mail className="w-3 h-3" />
                  Email
                </a>
              </li>
              <li>
                <a 
                  href="tel:7603584324" 
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                >
                  <Phone className="w-3 h-3" />
                  (760) FLUID-AI
                </a>
              </li>
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
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm text-muted-foreground">
              © 2025-2026 promptfluid® — The AI Orchestration Substrate
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

        {/* Acquisition Notice */}
        <div className="mt-8 p-4 rounded-lg bg-muted/30 border border-border text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Acquisition inquiries:</span>{" "}
            <a href="mailto:promptfluid@gmail.com" className="text-primary hover:underline">promptfluid@gmail.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
