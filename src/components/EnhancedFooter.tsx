import { Link } from "react-router-dom";

export function EnhancedFooter() {
  const currentYear = new Date().getFullYear();

  const substrateLinks = [
    { name: "Substrate Modules", href: "/developers" },
    { name: "Substrate OS", href: "/substrate" },
    { name: "Decode", href: "/decode" },
    { name: "Dream", href: "/feed-dream-eater" },
    { name: "Demo", href: "/demo" },
  ];

  const sdkLinks = [
    { name: "Documentation", href: "/documentation" },
    { name: "Changelog", href: "/changelog" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ];

  const techLinks = [
    { name: "llms.txt", href: "/llms-txt" },
    { name: "humans.txt", href: "/humans-txt" },
  ];

  return (
    <footer className="relative z-20 border-t border-border bg-background" role="contentinfo">
      {/* Main Footer */}
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Substrate */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm">Substrate</h3>
            <ul className="space-y-2">
              {substrateLinks.map((link) => (
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

          {/* SDK */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm">SDK</h3>
            <ul className="space-y-2">
              {sdkLinks.map((link) => (
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
    </footer>
  );
}