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

  const footerSections: FooterSection[] = [
    {
      title: "Platform",
      links: [
        { name: "CMPSBL OS", href: "/substrate" },
        { name: "Decode", href: "/decode" },
        { name: "Dream Feeder", href: "/feed-dream-eater" },
        { name: "Demo", href: "/demo" },
      ]
    },
    {
      title: "Build",
      links: [
        { name: "Gaming AI", href: "/gaming" },
        { name: "Developers", href: "/developers" },
        { name: "CodeLab", href: "/codelab" },
        { name: "Documentation", href: "/documentation" },
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About", href: "/about" },
        { name: "Blog", href: "/blog" },
        { name: "Evolution Log", href: "/changelog" },
        { name: "Contact", href: "/contact" },
      ]
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy", href: "/privacy" },
        { name: "Terms", href: "/terms" },
        { name: "llms.txt", href: "/llms-txt" },
        { name: "humans.txt", href: "/humans-txt" },
      ]
    },
  ];

  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com/promptfluid" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com/promptfluid" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com/company/promptfluid" },
  ];

  return (
    <>
      <footer className="relative z-20 border-t border-border bg-gradient-to-b from-background to-muted/30" role="contentinfo">
        {/* Decorative gradient */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        
        {/* Main Footer Content */}
        <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 md:grid-cols-5 lg:gap-12">
            {/* Brand Column */}
            <div className="col-span-2 sm:col-span-2 md:col-span-1 mb-4 md:mb-0">
              <Link to="/" className="inline-block hover:opacity-80 transition-opacity mb-4">
                <CmpsblLogo size="md" />
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 max-w-xs">
                The cognitive operating system where machines learn to dream.
              </p>
              
              {/* Social Links */}
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all duration-200"
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    title={social.name}
                  >
                    <social.icon className="w-4 h-4" />
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
                  {/* Add Evolution button to Build section */}
                  {section.title === "Build" && (
                    <li>
                      <button
                        onClick={() => setEvolutionOpen(true)}
                        className="group inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5 group-hover:animate-pulse" />
                        Evolution
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-border/50 bg-muted/20">
          <div className="container mx-auto max-w-7xl px-4 py-5">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Copyright */}
              <p className="text-xs text-muted-foreground text-center sm:text-left">
                © 2009-{currentYear} promptfluid® — All rights reserved
              </p>
              
              {/* Brand Line */}
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                <span>CMPSBL (Composable) By PromptFluid</span>
                <span className="hidden sm:inline text-border">•</span>
                <span className="inline-flex items-center gap-1.5">
                  Made with <Heart className="w-3 h-3 text-red-500 fill-red-500 animate-pulse" /> by humans who care
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
