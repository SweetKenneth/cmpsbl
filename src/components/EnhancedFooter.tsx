/**
 * Enhanced Footer — Clean minimal dark design, no dead links
 * XCTBL link preserved per user request
 */

import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CmpsblLogo } from "@/components/CmpsblLogo";
import { EvolutionModal } from "@/components/EvolutionModal";
import { XctblModal } from "@/components/XctblModal";
import { Sparkles, Gamepad2, Heart, Github, Twitter, Linkedin } from "lucide-react";
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

  const footerSections: FooterSection[] = [
    {
      title: "Platform",
      links: [
        { name: "AI Operating System", href: "/ai-operating-system", highlight: true },
        { name: "Architecture", href: "/architecture" },
        { name: "Foundations", href: "/foundations" },
        { name: "Proof Mode", href: "/proof" },
        { name: "Runtime", href: "/runtime" },
        { name: "Substrate", href: "/substrate" },
      ]
    },
    {
      title: "Products",
      links: [
        { name: "Artifact Packs", href: "/packs" },
        { name: "Dream Eater", href: "/feed-dream-eater" },
        { name: "Engines", href: "/engines", highlight: true },
        { name: "Enterprise", href: "/enterprise" },
        { name: "Minds", href: "/composable-cognitives", highlight: true },
        { name: "Persistent Memory", href: "/persistent-memory" },
        { name: "World Engine", href: "/gaming" },
      ]
    },
    {
      title: "Developers",
      links: [
        { name: "Academy", href: "/academy" },
        { name: "API Access", href: "/api-access" },
        { name: "DevTools", href: "/devtools" },
        { name: "Documentation", href: "/documentation" },
        { name: "Integrations", href: "/integrations" },
        { name: "Start Here", href: "/start-here", highlight: true },
      ]
    },
    {
      title: "Discover",
      links: [
        { name: "Capability Map", href: "/capability-map" },
        { name: "Community", href: "/community" },
        { name: "EVOLUTION", href: "/evolution", highlight: true },
        { name: "Fossil Record", href: "/changelog" },
        { name: "Showcase", href: "/showcase" },
        { name: "Use Cases", href: "/use-cases" },
      ]
    },
  ];

  const legalLinks: FooterLink[] = [
    { name: "About", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
    { name: "Investors", href: "/investors" },
    { name: "Licensing", href: "mailto:hello@CMPSBL.com" },
    { name: "Solutions", href: "/solutions" },
    { name: "Support", href: "/support" },
    { name: "Changelog", href: "/changelog" },
    { name: "Namespace", href: "/namespace" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "XCTBL", href: "#xctbl" },
  ];

  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com/cmpsbl" },
    { name: "Twitter", icon: Twitter, href: "https://x.com/cmpsbl" },
    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/cmpsbl" },
  ];

  return (
    <>
      <footer className="relative z-20 border-t border-border bg-gradient-to-b from-background to-muted/30" role="contentinfo">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="container mx-auto max-w-7xl px-4 py-10 sm:py-12 md:py-16">
          {/* Main grid: brand + 4 link columns */}
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] lg:gap-10">
            {/* Brand Column */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1 mb-6 lg:mb-0">
              <Link to="/" className="inline-block hover:opacity-80 transition-opacity mb-3">
                <CmpsblLogo size="sm" className="sm:hidden" />
                <CmpsblLogo size="md" className="hidden sm:block" />
              </Link>
              <p className="text-xs sm:text-sm text-foreground font-semibold leading-relaxed mb-1 max-w-[280px]">
                Composable AI Infrastructure
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed mb-2 max-w-[280px]">
                Cognitive infrastructure with persistent memory, composable engines, and governed runtime.
              </p>
              <Link 
                to="/upgrade" 
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-primary hover:text-primary/80 transition-colors mb-4"
              >
                View Plans → Builder (free) · Creator · Architect
              </Link>

              {/* Social Links */}
              <div className="flex items-center gap-2">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl sm:rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary flex items-center justify-center transition-all duration-200 touch-target"
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
            {footerSections.map((section) => (
              <div key={section.title} className="min-w-0">
                <h3 className="font-semibold text-foreground mb-4 text-sm tracking-wide">{section.title}</h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "text-sm transition-colors inline-block",
                            link.highlight ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className={cn(
                            "text-sm transition-colors inline-block",
                            link.highlight ? "text-primary hover:text-primary/80" : "text-muted-foreground hover:text-foreground"
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

        {/* Bottom Bar */}
        <div className="border-t border-border/50 bg-muted/20">
          <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-5 pb-20 sm:pb-5">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              {/* Copyright */}
              <p className="text-[11px] sm:text-xs text-muted-foreground text-center lg:text-left">
                © 2009-{currentYear} CMPSBL® — All rights reserved
              </p>

              {/* Legal links — desktop inline, mobile stacked */}
              <div className="hidden lg:flex items-center gap-5">
                {legalLinks.map((link) => (
                  link.href === "#xctbl" ? (
                    <button
                      key={link.name}
                      onClick={() => setXctblOpen(true)}
                      className="group inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Gamepad2 className="w-3 h-3 group-hover:animate-pulse" />
                      {link.name}
                    </button>
                  ) : link.href.startsWith('mailto:') ? (
                    <a
                      key={link.name}
                      href={link.href}
                      className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </div>

              {/* Mobile legal links — keep existing stacked style */}
              <div className="flex lg:hidden flex-wrap justify-center gap-x-4 gap-y-1.5">
                {legalLinks.map((link) => (
                  link.href === "#xctbl" ? (
                    <button
                      key={link.name}
                      onClick={() => setXctblOpen(true)}
                      className="group inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Gamepad2 className="w-3 h-3 group-hover:animate-pulse" />
                      {link.name}
                    </button>
                  ) : link.href.startsWith('mailto:') ? (
                    <a
                      key={link.name}
                      href={link.href}
                      className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  )
                ))}
              </div>

              {/* Made with love */}
              <div className="text-[11px] sm:text-xs text-muted-foreground text-center lg:text-right">
                <span className="inline-flex items-center gap-1">
                  Made with <Heart className="w-3 h-3 text-destructive fill-destructive animate-pulse" /> by humans who care
                </span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      <EvolutionModal isOpen={evolutionOpen} onClose={() => setEvolutionOpen(false)} />
      <XctblModal isOpen={xctblOpen} onClose={() => setXctblOpen(false)} />
    </>
  );
}
