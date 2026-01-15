import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronUp } from "lucide-react";

export function EnhancedFooter() {
  const currentYear = new Date().getFullYear();
  const [isExpanded, setIsExpanded] = useState(false);

  const productLinks = [
    { name: "Demo", href: "/demo" },
    { name: "Proof Mode", href: "/proof" },
    { name: "Substrate", href: "/substrate" },
    { name: "Decode", href: "/decode" },
    { name: "Dream", href: "/feed-dream-eater" },
  ];

  const companyLinks = [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Changelog", href: "/changelog" },
    { name: "Contact", href: "/contact" },
    { name: "Publication", href: "/publication" },
  ];

  const legalLinks = [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ];

  const techLinks = [
    { name: "llms.txt", href: "/llms.txt", external: true },
    { name: "humans.txt", href: "/humans.txt", external: true },
  ];

  return (
    <footer className="relative z-20 border-t border-border bg-background" role="contentinfo">
      {/* Mobile: Minimal footer with expand option */}
      <div className="md:hidden">
        <div className="container mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">
              © {currentYear} promptfluid®
            </p>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
              aria-expanded={isExpanded}
              aria-label="Toggle footer links"
            >
              <span>More</span>
              <ChevronUp 
                className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
              />
            </button>
          </div>
          
          {/* Expandable links on mobile */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-foreground mb-2 text-xs">Product</h3>
                <ul className="space-y-1.5">
                  {productLinks.slice(0, 3).map((link) => (
                    <li key={link.href}>
                      <Link 
                        to={link.href} 
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-medium text-foreground mb-2 text-xs">Company</h3>
                <ul className="space-y-1.5">
                  {companyLinks.slice(0, 3).map((link) => (
                    <li key={link.href}>
                      <Link 
                        to={link.href} 
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Full footer */}
      <div className="hidden md:block">
        <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Product */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 text-sm">Product</h3>
              <ul className="space-y-2">
                {productLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 text-sm">Company</h3>
              <ul className="space-y-2">
                {companyLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 text-sm">Legal</h3>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <Link 
                      to={link.href} 
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* For Developers */}
            <div>
              <h3 className="font-semibold text-foreground mb-3 text-sm">Developers</h3>
              <ul className="space-y-2">
                {techLinks.map((link) => (
                  <li key={link.href}>
                    <a 
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50">
          <div className="container mx-auto max-w-6xl px-4 py-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-muted-foreground">
              <p>© 2009-{currentYear} promptfluid® — All rights reserved</p>
              <p className="text-center sm:text-right">
                Cognitive Orchestration Substrate
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}