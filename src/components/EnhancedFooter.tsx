/**
 * Enhanced Footer — Clean minimal dark design, no dead links
 * XCTBL link preserved per user request
 */

import { useState } from "react";
import { Link } from "react-router-dom";
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
        { name: "Substrate", href: "/substrate" },
        { name: "All nodes", href: "/modules" },
        { name: "How it works", href: "/ai-operating-system" },
        { name: "Runtime", href: "/runtime" },
        { name: "Foundations", href: "/foundations" },
        { name: "Capability map", href: "/capability-map" },
        { name: "Proof mode", href: "/proof" },
        { name: "System status", href: "/status" },
        { name: "Scanner", href: "/scanner" },
      ]
    },
    {
      title: "Products",
      links: [
        { name: "Engines", href: "/engines", highlight: true },
        { name: "Capability packs", href: "/packs" },
        { name: "Composable agents", href: "/composable-cognitives", highlight: true },
        { name: "Persistent memory", href: "/persistent-memory" },
        { name: "Dream eater", href: "/feed-dream-eater" },
        { name: "World engine", href: "/gaming" },
        { name: "Projects", href: "/projects" },
        { name: "Clockless engine", href: "/clockless-world-engine" },
        { name: "CodeLab", href: "/codelab", highlight: true },
      ]
    },
    {
      title: "Developers",
      links: [
        { name: "Documentation", href: "/documentation" },
        { name: "API access", href: "/api-access" },
        { name: "Builder workspace", href: "/workspace" },
        { name: "Academy", href: "/academy" },
        { name: "Developer guide", href: "/developers/guide" },
        { name: "System integrity", href: "/system-integrity", highlight: true },
        { name: "Developer showcase", href: "/developers" },
        { name: "Use cases", href: "/use-cases" },
        { name: "Experiment Lab", href: "/lab" },
      ]
    },
    {
      title: "Explore",
      links: [
        { name: "Memory Stream", href: "/foundry", highlight: true },
        { name: "Agent memory", href: "/persistent-memory", highlight: true },
        { name: "Blog", href: "/blog" },
        { name: "Showcase", href: "/showcase" },
        { name: "System overview", href: "/overview" },
        { name: "Publication", href: "/publication" },
        { name: "Roadmap", href: "/roadmap" },
        { name: "Changelog", href: "/changelog" },
        { name: "About", href: "/about" },
      ]
    },
  ];

  const legalLinks: FooterLink[] = [
    { name: "Company", href: "/promptfluid" },
    { name: "Careers", href: "/careers" },
    { name: "Contact", href: "/contact" },
    { name: "Investors", href: "/investors" },
    { name: "Solutions", href: "/solutions" },
    { name: "Memories", href: "/blog/the-first-line-of-code" },
    { name: "Support", href: "/support" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "LLMs.txt", href: "/llms-txt" },
    { name: "humans.txt", href: "/humans-txt" },
    { name: "XCTBL", href: "#xctbl" },
  ];

  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com/cmpsbl" },
    { name: "Twitter", icon: Twitter, href: "https://x.com/cmpsbl" },
    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/cmpsbl" },
  ];

  return (
    <>
      <footer className="relative z-20 border-t border-border/50 bg-gradient-to-b from-background via-background to-muted/20" role="contentinfo">
        {/* Memory Stream flowing accent bar at top of footer */}
        <div className="absolute inset-x-0 top-0 h-[2px] memory-stream-bar opacity-70" />
        <div className="absolute inset-x-0 top-[2px] h-px bg-gradient-to-r from-transparent via-primary/15 to-transparent" />
        <div className="absolute inset-x-0 top-[3px] h-8 bg-gradient-to-b from-primary/[0.02] to-transparent pointer-events-none" />
        {/* Subtle background texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]" style={{backgroundImage: "radial-gradient(circle at 20% 50%, hsl(var(--primary)), transparent 50%), radial-gradient(circle at 80% 50%, hsl(var(--neon-purple)), transparent 50%)"}} />

        <div className="container mx-auto max-w-7xl px-4 py-10 sm:py-12 md:py-16">
          {/* Main grid: brand + 4 link columns */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-8 lg:grid-cols-[1.3fr_1fr_1fr_1fr_1fr] lg:gap-10">
            {/* Brand Column */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1 mb-2 lg:mb-0">
              <Link to="/" className="inline-block hover:opacity-80 transition-opacity mb-3">
                <CmpsblLogo size="sm" className="sm:hidden" />
                <CmpsblLogo size="md" className="hidden sm:block" />
              </Link>
              <p className="text-xs sm:text-sm text-foreground font-semibold leading-relaxed mb-1 max-w-[280px]">
                Signal → Silicon
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed mb-2 max-w-[280px]">
                The Memory Stream captures raw system behavior and crystallizes it into production-grade software — and when exceptional, into physical silicon.
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
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl sm:rounded-lg bg-muted/50 hover:bg-primary/10 hover:text-primary hover:scale-110 hover:-translate-y-1 flex items-center justify-center transition-all duration-300 touch-target"
                    title={social.name}
                  >
                    <social.icon className="w-5 h-5 sm:w-4 sm:h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {footerSections.map((section) => (
              <div key={section.title} className="min-w-0">
                <h3 className="font-semibold text-foreground mb-4 text-sm tracking-wide uppercase text-muted-foreground/80">{section.title}</h3>
                <ul className="space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "text-sm transition-all duration-300 inline-block underline-reveal",
                            link.highlight ? "text-primary hover:text-primary/80 font-medium" : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {link.name}
                        </a>
                      ) : (
                        <Link
                          to={link.href}
                          className={cn(
                            "text-sm transition-all duration-300 inline-block underline-reveal hover:translate-x-0.5",
                            link.highlight ? "text-primary hover:text-primary/80 font-medium" : "text-muted-foreground hover:text-foreground"
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
        <div className="border-t border-border/50 bg-gradient-to-b from-muted/20 to-muted/30">
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
              <div className="flex lg:hidden flex-wrap justify-center gap-x-4 gap-y-2.5">
                {legalLinks.map((link) => (
                  link.href === "#xctbl" ? (
                    <button
                      key={link.name}
                      onClick={() => setXctblOpen(true)}
                      className="group inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors min-h-[36px] py-1"
                    >
                      <Gamepad2 className="w-3 h-3 group-hover:animate-pulse" />
                      {link.name}
                    </button>
                  ) : link.href.startsWith('mailto:') ? (
                    <a
                      key={link.name}
                      href={link.href}
                      className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors min-h-[36px] inline-flex items-center py-1"
                    >
                      {link.name}
                    </a>
                  ) : (
                    <Link
                      key={link.name}
                      to={link.href}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors min-h-[36px] inline-flex items-center py-1"
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
