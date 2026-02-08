/**
 * Enhanced Footer — Premium design with animations and mobile polish
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CmpsblLogo } from "@/components/CmpsblLogo";
import { EvolutionModal } from "@/components/EvolutionModal";
import { ArrowUpRight, Sparkles, Heart, Github, Twitter, Linkedin } from "lucide-react";
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

  // Footer links — distinct from nav menu (no duplicates)
  // Nav has: Platform (dev tools), Substrate, Enterprise, Resources, Company
  // Footer has: Substrate internals, Learning, Standards, Contact & Legal
  const footerSections: FooterSection[] = [
    {
      title: "Substrate",
      links: [
        { name: "CMPSBL OS", href: "/substrate" },
        { name: "System Feed", href: "/system-feed" },
        { name: "Decode Engine", href: "/decode" },
        { name: "Dream Feeder", href: "/feed-dream-eater" },
        { name: "Proof Mode", href: "/proof" },
      ]
    },
    {
      title: "Learn",
      links: [
        { name: "Developer Academy", href: "/academy" },
        { name: "INCLUSIVE Module", href: "/cluster/inclusive-module-accessibility" },
        { name: "Publication", href: "/publication" },
        { name: "Library", href: "/library" },
        { name: "Use Cases", href: "/use-cases" },
        { name: "Demo", href: "/demo" },
      ]
    },
    {
      title: "Standards",
      links: [
        { name: "Namespace", href: "/namespace" },
        { name: "Foundations", href: "/foundations" },
        { name: "llms.txt", href: "/llms-txt" },
        { name: "humans.txt", href: "/humans-txt" },
        { name: "Changelog", href: "/changelog" },
        { name: "Roadmap", href: "/roadmap" },
      ]
    },
    {
      title: "Contact",
      links: [
        { name: "Support", href: "/support" },
        { name: "Contact", href: "/contact" },
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
        { name: "Investors", href: "/investors" },
      ]
    },
  ];

  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com/cmpsbl" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/cmpsbl" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/cmpsbl" },
  ];

  return (
    <>
      <footer className="relative z-20 border-t border-border bg-gradient-to-b from-background to-muted/30" role="contentinfo">
        {/* Decorative gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        {/* Main Footer Content */}
        <div className="container mx-auto max-w-7xl px-4 py-10 sm:py-12 md:py-16">
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:grid-cols-5 lg:gap-12">
            {/* Brand Column - Full width on mobile */}
            <div className="col-span-2 md:col-span-1 mb-6 md:mb-0">
              <Link to="/" className="inline-block hover:opacity-80 transition-opacity mb-3 sm:mb-4">
                <CmpsblLogo size="sm" className="sm:hidden" />
                <CmpsblLogo size="md" className="hidden sm:block" />
              </Link>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4 max-w-[280px]">
                The cognitive operating system where machines learn to dream.
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
                  {/* Add Evolution button to Substrate section */}
                  {section.title === "Substrate" && (
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
                <span>CMPSBL (Composable) By PromptFluid</span>
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
    </>
  );
}
