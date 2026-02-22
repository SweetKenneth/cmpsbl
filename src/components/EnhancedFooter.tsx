/**
 * Enhanced Footer — Premium design with animations and mobile polish
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CmpsblLogo } from "@/components/CmpsblLogo";
import { EvolutionModal } from "@/components/EvolutionModal";
import { XctblModal } from "@/components/XctblModal";
import { ArrowUpRight, Sparkles, Gamepad2, Heart, Github, Twitter, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";

interface FooterLink {
  name: string;
  href: string;
  external?: boolean;
  highlight?: boolean;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

export function EnhancedFooter() {
  const currentYear = new Date().getFullYear();
  const [evolutionOpen, setEvolutionOpen] = useState(false);
  const [xctblOpen, setXctblOpen] = useState(false);

  // Footer links — distinct from nav menu (no duplicates)
  // Nav has: Platform (dev tools), Substrate, Enterprise, Resources, Company
  // Footer has: Substrate internals, Learning, Standards, Contact & Legal
  const footerSections: FooterSection[] = [
    {
      title: "The Substrate",
      links: [
        { name: "Module Atlas", href: "/modules", highlight: true },
        { name: "Architecture", href: "/substrate" },
        { name: "Proof Mode", href: "/proof" },
        { name: "Decode Engine", href: "/decode" },
        { name: "System Feed", href: "/system-feed" },
        { name: "Documentation", href: "/docs" },
      ]
    },
    {
      title: "Create",
      links: [
        { name: "Start Here", href: "/start-here", highlight: true },
        { name: "Academy", href: "/academy" },
        { name: "CodeLab", href: "/codelab" },
        { name: "Sandbox", href: "/lab" },
        { name: "DevTools", href: "/devtools" },
        { name: "API Access", href: "/api-access" },
      ]
    },
    {
      title: "Discover",
      links: [
        { name: "Blog", href: "/blog" },
        { name: "Insights", href: "/insights" },
        { name: "Publication", href: "/publication" },
        { name: "Library", href: "/library" },
        { name: "Use Cases", href: "/use-cases" },
        { name: "Composable Cognitives", href: "/composable-cognitives" },
      ]
    },
    {
      title: "Ecosystem",
      links: [
        { name: "Cognitive Reality", href: "/clockless-world-engine" },
        { name: "Live Demo", href: "/demo" },
        { name: "Gaming AI", href: "/gaming" },
        { name: "Showcase", href: "/showcase" },
        { name: "Uptime", href: "/status", highlight: true },
        { name: "Enterprise", href: "/enterprise" },
      ]
    },
    {
      title: "Framework",
      links: [
        { name: "Pricing", href: "/pricing" },
        { name: "Licensing", href: "/licensing" },
        { name: "Namespace", href: "/namespace" },
        { name: "Foundations", href: "/foundations" },
        { name: "Roadmap", href: "/roadmap" },
        { name: "Changelog", href: "/changelog" },
      ]
    },
    {
      title: "Connect",
      links: [
        { name: "About", href: "/about" },
        { name: "Contact", href: "/contact" },
        { name: "Investors", href: "/investors" },
        { name: "Support", href: "/support" },
        { name: "Legal", href: "/privacy" },
        { name: "Careers", href: "/careers" },
      ]
    },
  ];

  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com/SweetKenneth" },
    { name: "Twitter", icon: Twitter, href: "https://x.com/kennethesweetjr?s=21" },
    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/in/kennethesweetjr?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
  ];

  return (
    <>
      <footer className="relative z-20 border-t border-border bg-gradient-to-b from-background to-muted/30" role="contentinfo">
        {/* Decorative gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        {/* Main Footer Content */}
        <div className="container mx-auto max-w-7xl px-4 py-10 sm:py-12 md:py-16">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-7 lg:gap-8">
            {/* Brand Column - Full width on mobile */}
            <div className="col-span-2 md:col-span-1 mb-6 md:mb-0">
              <Link to="/" className="inline-block hover:opacity-80 transition-opacity mb-3 sm:mb-4">
                <CmpsblLogo size="sm" className="sm:hidden" />
                <CmpsblLogo size="md" className="hidden sm:block" />
              </Link>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-1 max-w-[280px] font-semibold text-foreground">
                Where machines learn to dream.
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed mb-4 max-w-[280px]">
                A Cognitive Reality System · powered by the CMPSBL Substrate.
              </p>
              
              {/* Social Links - Larger touch targets on mobile */}
              <div className="flex items-center gap-2 sm:gap-2">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl sm:rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all duration-200 touch-target tap-highlight-none"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    title={social.name}
                  >
                    <social.icon className="w-5 h-5 sm:w-4 sm:h-4" />
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {footerSections.map((section, idx) => (
              <div key={section.title} className="min-w-0">
                <h3 className="font-semibold text-foreground mb-4 text-sm tracking-wide">
                  {section.title}
                </h3>
                <ul className="space-y-2.5">
                  {/* Add Evolution button to The Substrate section */}
                  {section.title === "The Substrate" && (
                    <li>
                      <button
                        onClick={() => setEvolutionOpen(true)}
                        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 group-hover:animate-pulse" />
                        Evolution Video
                      </button>
                    </li>
                  )}
                  {/* Add XCTBL button to Ecosystem section */}
                  {section.title === "Ecosystem" && (
                    <li>
                      <button
                        onClick={() => setXctblOpen(true)}
                        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Gamepad2 className="w-3.5 h-3.5 group-hover:animate-pulse" />
                        Breaktime? Try XCTBL
                      </button>
                    </li>
                  )}
                  {section.links.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "group inline-flex items-center gap-1 text-sm transition-colors",
                            link.highlight 
                              ? "text-primary hover:text-primary/80" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {link.name}
                          <ArrowUpRight className="w-3 h-3 opacity-0 -translate-y-0.5 translate-x-0.5 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all" />
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className={cn(
                            "text-sm transition-colors inline-block",
                            link.highlight 
                              ? "text-primary hover:text-primary/80" 
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {link.name}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar - Extra padding for mobile nav bar */}
        <div className="border-t border-border/50 bg-muted/20">
          <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-5 pb-20 sm:pb-5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
              {/* Copyright */}
              <p className="text-[11px] sm:text-xs text-muted-foreground text-center sm:text-left">
                © 2009-{currentYear} CMPSBL® — All rights reserved
              </p>
              
              {/* Brand Line - Stack on very small screens */}
              <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-4 text-[11px] sm:text-xs text-muted-foreground text-center">
                <span>Clockless — A Cognitive Reality System · powered by the CMPSBL Substrate · By PromptFluid</span>
                <span className="hidden sm:inline text-border">•</span>
                <span className="inline-flex items-center gap-1">
                  Made with <Heart className="w-3 h-3 text-destructive fill-destructive animate-pulse" /> by humans who care
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Evolution Modal */}
      <EvolutionModal isOpen={evolutionOpen} onClose={() => setEvolutionOpen(false)} />

      {/* XCTBL Modal */}
      <XctblModal isOpen={xctblOpen} onClose={() => setXctblOpen(false)} />
    </>
  );
}
