import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Menu, X, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/promptfluid-logo.png";

export function PublicNav() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Substrate", href: "/substrate", highlight: true },
    { name: "Modules", href: "/projects" },
    { name: "Blog", href: "/blog" },
    { name: "Investors", href: "/investors" },
    { name: "About", href: "/about" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav
        className="relative z-[10000] bg-background/95 backdrop-blur-sm border-b border-border/50 container mx-auto px-4 py-3 md:py-4"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" aria-label="promptfluid Home">
            <img
              src={logo}
              alt="promptfluid logo"
              width={116}
              height={40}
              className="h-8 lg:h-10 w-auto object-contain"
              loading="eager"
              decoding="async"
            />
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground border border-border rounded-full px-2 py-0.5">
              <Layers className="w-3 h-3" />
              substrate
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className={`text-sm font-medium transition-colors ${
                  item.highlight 
                    ? "text-primary hover:text-primary/80" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <Link to="/investors" className="hidden sm:block">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                Acquisition
              </Button>
            </Link>
            <Button
              onClick={() => navigate("/contact")}
              size="sm"
              className="hidden sm:flex"
            >
              Contact
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-[9998] lg:hidden bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div 
            className="fixed top-16 left-0 right-0 z-[9999] lg:hidden bg-background border-b border-border shadow-lg"
            role="dialog"
            aria-modal="true"
          >
            <div className="container mx-auto px-4 py-6">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-3 px-4 rounded-lg text-base font-medium transition-colors ${
                      item.highlight 
                        ? "text-primary bg-primary/5" 
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="border-t border-border mt-4 pt-4 flex flex-col gap-3">
                  <Link to="/investors" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Acquisition Inquiry
                    </Button>
                  </Link>
                  <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full">
                      Contact Us
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </nav>
            </div>
          </div>
        </>
      )}
    </>
  );
}
