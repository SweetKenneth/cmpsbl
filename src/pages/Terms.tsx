/**
 * Terms of Service — Legal page with TOC sidebar and active section tracking
 */

import { useState, useEffect, useRef } from "react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { RelatedCapabilities } from "@/components/RelatedCapabilities";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { FileText, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const sections = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: "By accessing or using CMPSBL's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
  },
  {
    id: "services",
    title: "2. Description of Services",
    content: "CMPSBL® provides cognitive orchestration infrastructure including but not limited to:",
    list: [
      "CMPSBL Substrate — Layered cognitive orchestration with persistent memory",
      "Composable Minds — Downloadable AI agents with persistent memory",
      "Capability Packs — Capabilities, templates, and memories via the unified store",
      "NEXUS — Multi-provider AI routing with BYOK architecture",
      "DEFENSE — Enterprise-grade threat detection and bot protection overlay",
      "DECODE — Conversational AI interface with memory-backed context",
      "VISION — Full observability and system introspection",
      "INCLUSIVE — Human compatibility system with WCAG scanning and AI remediation",
      "Persistent Memory — Drop-in memory layer for any AI agent",
      "Evolution Mesh — Self-learning immune system for software",
      "Composable Cognitive Infrastructure — Templates, capabilities, and orchestration chains",
    ],
  },
  {
    id: "accounts",
    title: "3. User Accounts",
    content: "To access certain features, you may need to create an account. You agree to:",
    list: [
      "Provide accurate and complete information",
      "Maintain the security of your account credentials",
      "Notify us immediately of any unauthorized access",
      "Accept responsibility for all activities under your account",
    ],
  },
  {
    id: "acceptable-use",
    title: "4. Acceptable Use",
    content: "You agree not to use our services to:",
    list: [
      "Violate any applicable laws or regulations",
      "Infringe on intellectual property rights",
      "Transmit malware or harmful code",
      "Attempt to gain unauthorized access to systems",
      "Engage in fraudulent or deceptive activities",
      "Harass, abuse, or harm others",
      "Reverse-engineer, decompile, or attempt to extract source code from any engine or cognitive",
      "Redistribute, sublicense, or resell purchased cognitives or engines without written permission",
    ],
  },
  {
    id: "ip",
    title: "5. Intellectual Property",
    content: "All content, features, and functionality of our services — including but not limited to the CMPSBL platform architecture, orchestration systems, capability packs, and composable Minds — are owned by CMPSBL and protected by intellectual property laws. CMPSBL® is a registered trademark. You may not copy, modify, distribute, or create derivative works without express written permission.",
  },
  {
    id: "purchases",
    title: "6. Composable Cognitives & Engine Purchases",
    content: "Composable Cognitives and engines are delivered as downloadable capability packs. Upon purchase:",
    list: [
      "You receive a perpetual, non-transferable license for personal or organizational use",
      "You may not redistribute, sublicense, or resell purchased capability packs",
      "Refunds are handled according to our refund policy",
      "CMPSBL retains all intellectual property rights in the underlying technology",
    ],
  },
  {
    id: "payment",
    title: "7. Subscription & Payment Terms",
    content: "For paid subscription tiers (Creator, Architect, Enterprise), you agree to pay all applicable fees at the published rate. We reserve the right to modify pricing with 30 days written notice. One-time purchases (Template Generator, Composable Cognitives) are non-recurring and governed by the license terms at time of purchase.",
  },
  {
    id: "availability",
    title: "8. Service Availability",
    content: "We strive to maintain high availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue services with reasonable notice when possible.",
  },
  {
    id: "liability",
    title: "9. Limitation of Liability",
    content: "To the maximum extent permitted by law, CMPSBL shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.",
  },
  {
    id: "indemnification",
    title: "10. Indemnification",
    content: "You agree to indemnify and hold harmless CMPSBL and its affiliates from any claims, losses, or damages arising from your use of our services or violation of these terms.",
  },
  {
    id: "termination",
    title: "11. Termination",
    content: "We may terminate or suspend your access to our services at our sole discretion, without notice, for conduct that we believe violates these terms or is harmful to other users.",
  },
  {
    id: "governing-law",
    title: "12. Governing Law",
    content: "These terms shall be governed by the laws of the State of Texas, United States, without regard to conflict of law principles. Any disputes arising under these terms shall be resolved in the courts located in Dallas County, Texas.",
  },
  {
    id: "changes",
    title: "13. Changes to Terms",
    content: "We reserve the right to modify these terms at any time. We will provide notice of material changes. Continued use of our services after changes constitutes acceptance of the modified terms.",
  },
  {
    id: "contact",
    title: "14. Contact Information",
    content: "For questions about these Terms of Service, please contact us at:",
    contact: true,
  },
];

export default function Terms() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    sections.forEach((s) => {
      const el = sectionRefs.current[s.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Terms of Service — Usage & Licensing | CMPSBL®"
        description="CMPSBL terms of service: usage rights for the 40-node substrate, Memory Stream artifact ownership, engine licensing, cognitive agent IP, tier-specific SLAs, and acceptable use policies."
        keywords={['CMPSBL terms of service', 'AI platform terms', 'engine licensing', 'memory stream ownership']}
      />
      <PublicNav />

      <main className="container mx-auto px-4 pt-24 pb-16 max-w-6xl relative">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-40 left-1/4 w-[300px] h-[300px] rounded-full animate-hero-orb-3" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 60%)" }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <nav className="mb-8">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] py-2">
              <ChevronRight className="w-3 h-3 rotate-180 mr-1" /> Back to Home
            </Link>
          </nav>

          <div className="mb-10">
            <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
              <FileText className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold">Legal</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Terms of Service</h1>
            <p className="text-muted-foreground text-sm">Last updated: February 24, 2026</p>
          </div>

          <div className="flex gap-8">
            {/* Sticky TOC — desktop only */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-28">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono mb-3">On this page</p>
                <nav className="space-y-0.5">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className={cn(
                        "block text-xs py-1.5 pl-3 border-l-2 transition-all duration-200",
                        activeSection === s.id
                          ? "border-primary text-primary font-medium"
                          : "border-transparent text-muted-foreground/60 hover:text-muted-foreground hover:border-border"
                      )}
                    >
                      {s.title.replace(/^\d+\.\s*/, "")}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-5">
              {sections.map((section, i) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  ref={(el) => { sectionRefs.current[section.id] = el; }}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02 }}
                  className="p-5 sm:p-6 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm glass-edge scroll-mt-28"
                >
                  <h2 className="text-lg sm:text-xl font-bold mb-3 text-foreground">{section.title}</h2>
                  {section.content && (
                    <p className="text-sm text-muted-foreground leading-relaxed mb-3">{section.content}</p>
                  )}
                  {section.list && (
                    <ul className="space-y-2 ml-1">
                      {section.list.map((item) => (
                        <li key={item.slice(0, 40)} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1 h-1 rounded-full bg-primary/60 mt-2 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.contact && (
                    <div className="mt-3 p-4 rounded-xl bg-muted/30 border border-border/30">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Email:</strong> Dev@CMPSBL.com<br />
                        <strong className="text-foreground">Phone:</strong> (760) 358-4324
                      </p>
                    </div>
                  )}
                </motion.section>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      <RelatedCapabilities />
      <EnhancedFooter />
    </div>
  );
}
