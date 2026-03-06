/**
 * Terms of Service — Legal page with premium design treatment
 */

import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: "By accessing or using CMPSBL's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
  },
  {
    title: "2. Description of Services",
    content: "CMPSBL® provides cognitive orchestration infrastructure including but not limited to:",
    list: [
      "CMPSBL Substrate — Layered cognitive orchestration with persistent memory",
      "Composable Minds — Downloadable AI agents with persistent memory",
      "Artifact Packs — Capabilities, templates, and pipelines via the unified store",
      "NEXUS — Multi-provider AI routing with BYOK architecture",
      "DEFENSE — Enterprise-grade threat detection and bot protection overlay",
      "DECODE — Conversational AI interface with memory-backed context",
      "VISION — Full observability and system introspection",
      "INCLUSIVE — Human compatibility system with WCAG scanning and AI remediation",
      "Persistent Memory — Drop-in memory layer for any AI agent",
      "Evolution Mesh — Self-learning immune system for software",
      "Composable Cognitive Infrastructure — Templates, capabilities, and orchestration pipelines",
    ],
  },
  {
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
    title: "5. Intellectual Property",
    content: "All content, features, and functionality of our services — including but not limited to the CMPSBL platform architecture, orchestration pipelines, artifact packs, and composable Minds — are owned by CMPSBL and protected by intellectual property laws. CMPSBL® is a registered trademark. You may not copy, modify, distribute, or create derivative works without express written permission.",
  },
  {
    title: "6. Composable Cognitives & Engine Purchases",
    content: "Composable Cognitives and engines are delivered as downloadable artifacts. Upon purchase:",
    list: [
      "You receive a perpetual, non-transferable license for personal or organizational use",
      "You may not redistribute, sublicense, or resell purchased artifacts",
      "Refunds are handled according to our refund policy",
      "CMPSBL retains all intellectual property rights in the underlying technology",
    ],
  },
  {
    title: "7. Subscription & Payment Terms",
    content: "For paid subscription tiers (Creator, Architect, Enterprise), you agree to pay all applicable fees at the published rate. We reserve the right to modify pricing with 30 days written notice. One-time purchases (Template Generator, Composable Cognitives) are non-recurring and governed by the license terms at time of purchase.",
  },
  {
    title: "8. Service Availability",
    content: "We strive to maintain high availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue services with reasonable notice when possible.",
  },
  {
    title: "9. Limitation of Liability",
    content: "To the maximum extent permitted by law, CMPSBL shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.",
  },
  {
    title: "10. Indemnification",
    content: "You agree to indemnify and hold harmless CMPSBL and its affiliates from any claims, losses, or damages arising from your use of our services or violation of these terms.",
  },
  {
    title: "11. Termination",
    content: "We may terminate or suspend your access to our services at our sole discretion, without notice, for conduct that we believe violates these terms or is harmful to other users.",
  },
  {
    title: "12. Governing Law",
    content: "These terms shall be governed by the laws of the State of Texas, United States, without regard to conflict of law principles. Any disputes arising under these terms shall be resolved in the courts located in Dallas County, Texas.",
  },
  {
    title: "13. Changes to Terms",
    content: "We reserve the right to modify these terms at any time. We will provide notice of material changes. Continued use of our services after changes constitutes acceptance of the modified terms.",
  },
  {
    title: "14. Contact Information",
    content: "For questions about these Terms of Service, please contact us at:",
    contact: true,
  },
];

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Terms of Service — CMPSBL®"
        description="Terms of service for the CMPSBL Substrate platform. Covers usage rights, intellectual property, and service-level commitments."
        keywords={['CMPSBL terms of service', 'AI platform terms', 'substrate usage terms', 'service agreement AI']}
      />
      <PublicNav />

      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl relative">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-40 left-1/4 w-[300px] h-[300px] rounded-full animate-hero-orb-3" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 60%)" }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <nav className="mb-8">
            <a href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] py-2">← Back to Home</a>
          </nav>

          <div className="mb-10">
            <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
              <FileText className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold">Legal</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Terms of Service</h1>
            <p className="text-muted-foreground text-sm">Last updated: February 24, 2026</p>
          </div>

          <div className="space-y-6">
            {sections.map((section, i) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="p-5 sm:p-6 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm glass-edge"
              >
                <h2 className="text-lg sm:text-xl font-bold mb-3 text-foreground">{section.title}</h2>
                {section.content && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{section.content}</p>
                )}
                {section.list && (
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-1">
                    {section.list.map((item) => <li key={item.slice(0, 40)}>{item}</li>)}
                  </ul>
                )}
                {section.contact && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Email:</strong> Dev@CMPSBL.com<br />
                    <strong>Phone:</strong> (760) 358-4324
                  </p>
                )}
              </motion.section>
            ))}
          </div>
        </motion.div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
