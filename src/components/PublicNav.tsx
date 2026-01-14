import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

export function PublicNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { name: "Demo", href: "/demo" },
    { name: "Proof", href: "/proof" },
    { name: "Substrate", href: "/substrate" },
    { name: "Decode", href: "/decode" },
    { name: "Dream", href: "/feed-dream-eater" },
    { name: "Blog", href: "/blog" },
    { name: "About", href: "/about" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav
        className="sticky top-0 z-[10000] bg-background/95 backdrop-blur-md border-b border-border/50"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link 
            to="/" 
            className="text-lg font-semibold text-foreground tracking-tight hover:text-primary transition-colors"
          >
            promptfluid<span className="text-primary">®</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive(item.href)
                    ? "text-foreground bg-muted font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to="/contact"
              className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Contact
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[9998] md:hidden bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div 
            className="fixed top-[57px] left-0 right-0 z-[9999] md:hidden bg-background border-b border-border shadow-xl"
            role="dialog"
            aria-modal="true"
          >
            <div className="container mx-auto px-4 py-3">
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-3 px-4 rounded-lg text-sm transition-colors ${
                      isActive(item.href)
                        ? "text-foreground bg-muted font-medium"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="border-t border-border my-2" />
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-3 px-4 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                >
                  Contact Us
                </Link>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}