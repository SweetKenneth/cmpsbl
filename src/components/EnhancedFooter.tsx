import { Link } from "react-router-dom";
import { CmpsblLogo } from "@/components/CmpsblLogo";

export function EnhancedFooter() {
  const currentYear = new Date().getFullYear();

  const cmpsblLinks = [
    { name: "CMPSBL OS", href: "/substrate" },
    { name: "Decode", href: "/decode" },
    { name: "Dream Feeder", href: "/feed-dream-eater" },
    { name: "Demo", href: "/demo" },
  ];

  const buildLinks = [
    { name: "Gaming AI", href: "/gaming" },
    { name: "Developers", href: "/developers" },
    { name: "CodeLab", href: "/codelab" },
    { name: "Documentation", href: "/documentation" },
  ];

  const resourceLinks = [
    { name: "Blog", href: "/blog" },
    { name: "Changelog", href: "/changelog" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const legalLinks = [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "llms.txt", href: "/llms-txt" },
    { name: "humans.txt", href: "/humans-txt" },
  ];

  return (
    <footer className="relative z-20 border-t border-border bg-background" role="contentinfo">
      {/* Main Footer */}
      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* CMPSBL - with logo at top */}
          <div>
            <Link to="/" className="hover:opacity-80 transition-opacity block mb-4">
              <CmpsblLogo size="md" />
            </Link>
            <ul className="space-y-2">
              {cmpsblLinks.map((link) => (
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

          {/* Build */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm">Build</h3>
            <ul className="space-y-2">
              {buildLinks.map((link) => (
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

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-foreground mb-3 text-sm">Resources</h3>
            <ul className="space-y-2">
              {resourceLinks.map((link) => (
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
            <div className="text-center sm:text-right">
              <p>CMPSBL (Composable) By PromptFluid</p>
              <p className="mt-1">Made by humans who care ❤️</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
