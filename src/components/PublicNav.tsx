import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Menu, X, ChevronDown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Twitter, Github, MessageSquare, Youtube, Instagram, Facebook } from "lucide-react";

export function PublicNav() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [socialExpanded, setSocialExpanded] = useState(false);

  const products = [
    { name: "PromptFluid Reflex", desc: "WordPress Security with Bot Sniper™", href: "/projects/defense" },
    { name: "PromptFluid Brain", desc: "Adaptive Learning Core", href: "/projects/brain" },
    { name: "PromptFluid Studio", desc: "Rapid App Development", href: "/projects/studio" },
    { name: "PromptFluid Ripple", desc: "Network Integration", href: "/projects/ripple" },
    { name: "PromptFluid Clarity", desc: "AI Accessibility Scanner", href: "/projects/clarity" },
  ];

  const resources = {
    "Security Insights": [
      { name: "WordPress Bot Defense Guide", href: "/blog/wordpress-bot-defense" },
      { name: "Top Security Plugins 2025", href: "/blog/top-security-plugins-2025" },
      { name: "AI Cybersecurity Evolution", href: "/blog/ai-cybersecurity-evolution-2025" },
    ],
    "Technology": [
      { name: "How PromptFluid Works", href: "/blog/how-promptfluid-works-cascade-ai-ecosystem" },
      { name: "Cascade AI Intelligence", href: "/blog/cascade-ai-adaptive-intelligence-brain" },
      { name: "Clarity Accessibility Mission", href: "/blog/clarity-accessibility-mission" },
    ],
    "Products": [
      { name: "Reflex Security", href: "/blog/promptfluid-defense-ai-security" },
      { name: "Brain Learning Core", href: "/blog/promptfluid-brain-adaptive-learning-core" },
      { name: "Studio App Builder", href: "/blog/promptfluid-studio-build-apps-that-think" },
    ],
    "Business": [
      { name: "AI Product Comparison 2025", href: "/blog/ai-product-comparison-2025" },
      { name: "Product Roadmap 2025", href: "/blog/product-roadmap-2025" },
      { name: "Market Analysis", href: "/blog/promptfluid-market-disruptor" },
    ],
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="relative z-[10000] container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          {/* Desktop - Show company name */}
          <Link to="/" className="hidden lg:flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              PromptFluid
            </h1>
          </Link>

          {/* Mobile - Expandable Social Menu */}
          <div className="flex lg:hidden relative">
            {/* Main Toggle Button */}
            <button
              onClick={() => setSocialExpanded(!socialExpanded)}
              className={`group relative p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-accent/5 hover:from-primary/30 hover:to-accent/10 transition-all duration-500 border border-primary/20 z-50 ${
                socialExpanded ? 'shadow-[0_8px_30px_rgba(122,95,255,0.4)] scale-110 rotate-90' : 'hover:shadow-[0_8px_20px_rgba(122,95,255,0.3)] hover:scale-105'
              }`}
              style={{ transform: 'perspective(1000px) rotateX(2deg)', transformStyle: 'preserve-3d' }}
            >
              <div className={`transition-transform duration-500 ${socialExpanded ? 'rotate-180' : ''}`}>
                <Sparkles className="w-4 h-4 text-primary transition-colors relative" style={{ transform: 'translateZ(10px)' }} />
              </div>
            </button>

            {/* Flowing Expanded Social Links */}
            {socialExpanded && (
              <div className="fixed left-4 top-24 z-40 flex flex-col gap-3">
                {/* Connecting Flow Line */}
                <div 
                  className="absolute left-1/2 top-0 w-0.5 h-full bg-gradient-to-b from-primary via-primary-variant to-accent opacity-40 animate-[fade-in_0.5s_ease-out]"
                  style={{ transform: 'translateX(-50%)' }}
                />
                
                {/* Twitter/X */}
                <a 
                  href="https://x.com/promptfluid" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative p-3 rounded-xl bg-gradient-to-br from-[#1DA1F2]/20 to-[#1DA1F2]/5 hover:from-[#1DA1F2]/30 hover:to-[#1DA1F2]/10 transition-all duration-300 hover:scale-110 border border-[#1DA1F2]/20 hover:shadow-[0_8px_20px_rgba(29,161,242,0.4)] backdrop-blur-md animate-[slide-in-right_0.4s_ease-out] z-10"
                  style={{ 
                    transform: 'perspective(1000px) rotateX(2deg) translateX(0)', 
                    transformStyle: 'preserve-3d',
                    animationDelay: '0.1s',
                    animationFillMode: 'both'
                  }}
                >
                  <Twitter className="w-5 h-5 text-[#1DA1F2] transition-colors relative" style={{ transform: 'translateZ(10px)' }} />
                </a>

                {/* GitHub */}
                <a 
                  href="https://github.com/promptfluid" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative p-3 rounded-xl bg-gradient-to-br from-foreground/20 to-foreground/5 hover:from-foreground/30 hover:to-foreground/10 transition-all duration-300 hover:scale-110 border border-foreground/20 hover:shadow-[0_8px_20px_rgba(255,255,255,0.3)] backdrop-blur-md animate-[slide-in-right_0.4s_ease-out] z-10"
                  style={{ 
                    transform: 'perspective(1000px) rotateX(2deg) translateX(0)', 
                    transformStyle: 'preserve-3d',
                    animationDelay: '0.2s',
                    animationFillMode: 'both'
                  }}
                >
                  <Github className="w-5 h-5 text-foreground transition-colors relative" style={{ transform: 'translateZ(10px)' }} />
                </a>

                {/* Discord */}
                <a 
                  href="https://discord.gg/promptfluid" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative p-3 rounded-xl bg-gradient-to-br from-[#5865F2]/20 to-[#5865F2]/5 hover:from-[#5865F2]/30 hover:to-[#5865F2]/10 transition-all duration-300 hover:scale-110 border border-[#5865F2]/20 hover:shadow-[0_8px_20px_rgba(88,101,242,0.4)] backdrop-blur-md animate-[slide-in-right_0.4s_ease-out] z-10"
                  style={{ 
                    transform: 'perspective(1000px) rotateX(2deg) translateX(0)', 
                    transformStyle: 'preserve-3d',
                    animationDelay: '0.3s',
                    animationFillMode: 'both'
                  }}
                >
                  <MessageSquare className="w-5 h-5 text-[#5865F2] transition-colors relative" style={{ transform: 'translateZ(10px)' }} />
                </a>

                {/* YouTube */}
                <a 
                  href="https://youtube.com/@promptfluid" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative p-3 rounded-xl bg-gradient-to-br from-[#FF0000]/20 to-[#FF0000]/5 hover:from-[#FF0000]/30 hover:to-[#FF0000]/10 transition-all duration-300 hover:scale-110 border border-[#FF0000]/20 hover:shadow-[0_8px_20px_rgba(255,0,0,0.4)] backdrop-blur-md animate-[slide-in-right_0.4s_ease-out] z-10"
                  style={{ 
                    transform: 'perspective(1000px) rotateX(2deg) translateX(0)', 
                    transformStyle: 'preserve-3d',
                    animationDelay: '0.4s',
                    animationFillMode: 'both'
                  }}
                >
                  <Youtube className="w-5 h-5 text-[#FF0000] transition-colors relative" style={{ transform: 'translateZ(10px)' }} />
                </a>

                {/* Instagram */}
                <a 
                  href="https://instagram.com/promptfluid" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative p-3 rounded-xl bg-gradient-to-br from-[#E4405F]/20 to-[#E4405F]/5 hover:from-[#E4405F]/30 hover:to-[#E4405F]/10 transition-all duration-300 hover:scale-110 border border-[#E4405F]/20 hover:shadow-[0_8px_20px_rgba(228,64,95,0.4)] backdrop-blur-md animate-[slide-in-right_0.4s_ease-out] z-10"
                  style={{ 
                    transform: 'perspective(1000px) rotateX(2deg) translateX(0)', 
                    transformStyle: 'preserve-3d',
                    animationDelay: '0.5s',
                    animationFillMode: 'both'
                  }}
                >
                  <Instagram className="w-5 h-5 text-[#E4405F] transition-colors relative" style={{ transform: 'translateZ(10px)' }} />
                </a>

                {/* Facebook */}
                <a 
                  href="https://www.facebook.com/share/1XwkVu3M6t/?mibextid=wwXIfr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group relative p-3 rounded-xl bg-gradient-to-br from-[#1877F2]/20 to-[#1877F2]/5 hover:from-[#1877F2]/30 hover:to-[#1877F2]/10 transition-all duration-300 hover:scale-110 border border-[#1877F2]/20 hover:shadow-[0_8px_20px_rgba(24,119,242,0.4)] backdrop-blur-md animate-[slide-in-right_0.4s_ease-out] z-10"
                  style={{ 
                    transform: 'perspective(1000px) rotateX(2deg) translateX(0)', 
                    transformStyle: 'preserve-3d',
                    animationDelay: '0.6s',
                    animationFillMode: 'both'
                  }}
                >
                  <Facebook className="w-5 h-5 text-[#1877F2] transition-colors relative" style={{ transform: 'translateZ(10px)' }} />
                </a>
              </div>
            )}

            {/* Backdrop */}
            {socialExpanded && (
              <div 
                className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm animate-[fade-in_0.3s_ease-out]"
                onClick={() => setSocialExpanded(false)}
              />
            )}
          </div>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center gap-1 mr-4">
            {/* Free Scan - Highlighted */}
            <Link
              to="/scan"
              className="relative text-sm font-bold px-4 py-2 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 hover:from-primary/30 hover:to-accent/30 transition-all duration-300 shadow-glow border border-primary/30 animate-pulse"
            >
              <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                Free Scan
              </span>
            </Link>

            {/* Products Mega Menu */}
            <div
              className="relative group"
              onMouseEnter={() => setActiveDropdown("products")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium px-4 py-2 flex items-center gap-1">
                Products
                <ChevronDown className="w-4 h-4" />
              </button>
              {activeDropdown === "products" && (
                <div className="absolute top-full left-0 mt-2 w-[600px] glass border border-border/50 rounded-xl shadow-2xl p-6 animate-in fade-in-0 zoom-in-95">
                  <div className="grid grid-cols-2 gap-4">
                    {products.map((product) => (
                      <Link
                        key={product.href}
                        to={product.href}
                        className="p-3 rounded-lg hover:bg-muted/50 transition-colors group/item"
                      >
                        <div className="font-medium text-sm group-hover/item:text-primary transition-colors">
                          {product.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {product.desc}
                        </div>
                      </Link>
                    ))}
                    <Link
                      to="/projects"
                      className="p-3 rounded-lg hover:bg-primary/10 transition-colors border border-primary/20"
                    >
                      <div className="font-medium text-sm text-primary">
                        View All Products →
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Solutions */}
            <Link
              to="/solutions"
              className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium px-4 py-2"
            >
              Solutions
            </Link>

            {/* Resources Mega Menu */}
            <div
              className="relative group"
              onMouseEnter={() => setActiveDropdown("resources")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium px-4 py-2 flex items-center gap-1">
                Resources
                <ChevronDown className="w-4 h-4" />
              </button>
              {activeDropdown === "resources" && (
                <div className="absolute top-full right-0 mt-2 w-[800px] glass border border-border/50 rounded-xl shadow-2xl p-6 animate-in fade-in-0 zoom-in-95">
                  <div className="grid grid-cols-4 gap-6">
                    {Object.entries(resources).map(([category, links]) => (
                      <div key={category}>
                        <h3 className="font-semibold text-sm mb-3 text-primary">
                          {category}
                        </h3>
                        <ul className="space-y-2">
                          {links.map((link) => (
                            <li key={link.href}>
                              <Link
                                to={link.href}
                                className="text-xs text-muted-foreground hover:text-primary transition-colors block"
                              >
                                {link.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/50">
                    <Link
                      to="/roadmap"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      View Product Roadmap →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Investors - Prominent */}
            <Link
              to="/investors"
              className="text-primary hover:text-primary/80 transition-colors text-sm font-bold px-4 py-2"
            >
              Investors
            </Link>

            {/* About */}
            <Link
              to="/about"
              className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium px-4 py-2"
            >
              About
            </Link>

            {/* Blog */}
            <Link
              to="/blog"
              className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium px-4 py-2"
            >
              Blog
            </Link>

            {/* Contact */}
            <Link
              to="/contact"
              className="text-foreground/80 hover:text-primary transition-colors text-sm font-medium px-4 py-2"
            >
              Contact
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/investors")}
              className="shadow-glow hover:shadow-glow-lg"
            >
              Learn More
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden glass p-2 rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Toggle menu"
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
            className="fixed inset-0 z-[9998] lg:hidden bg-black/60 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed top-20 left-0 right-0 bottom-0 z-[9999] lg:hidden glass border-t border-border/50 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Free Scan - Highlighted Mobile */}
              <Link
                to="/scan"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-4 rounded-lg bg-gradient-to-r from-primary/20 to-accent/20 border-2 border-primary/40 shadow-glow"
              >
                <div className="font-bold text-primary text-center">
                  🎯 Run a Free Accessibility Scan
                </div>
              </Link>

              {/* Products */}
              <div>
                <h3 className="font-semibold mb-3 text-primary">Products</h3>
                <ul className="space-y-2 pl-4">
                  {products.map((product) => (
                    <li key={product.href}>
                      <Link
                        to={product.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-sm text-muted-foreground hover:text-primary transition-colors block"
                      >
                        {product.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Solutions */}
              <div>
                <Link
                  to="/solutions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-semibold text-primary hover:underline"
                >
                  Solutions & Pricing
                </Link>
              </div>

              {/* Resources */}
              {Object.entries(resources).map(([category, links]) => (
                <div key={category}>
                  <h3 className="font-semibold mb-3 text-primary">{category}</h3>
                  <ul className="space-y-2 pl-4">
                    {links.map((link) => (
                      <li key={link.href}>
                        <Link
                          to={link.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors block"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}

              {/* Investors & About */}
              <div className="pt-4 border-t border-border/50 space-y-4">
                <Link
                  to="/investors"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-bold text-primary hover:underline block text-lg"
                >
                  ⭐ Investors
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-semibold text-primary hover:underline block"
                >
                  About PromptFluid
                </Link>
                <Link
                  to="/blog"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-semibold text-primary hover:underline block"
                >
                  Blog & Resources
                </Link>
                <Link
                  to="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-semibold text-primary hover:underline block"
                >
                  Contact Us
                </Link>
                <Link
                  to="/pillars/promptfluid-the-firsts"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-semibold text-primary hover:underline block"
                >
                  The Firsts
                </Link>
                <Link
                  to="/roadmap"
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-semibold text-primary hover:underline block"
                >
                  Product Roadmap
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
