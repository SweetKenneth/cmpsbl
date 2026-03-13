/**
 * Enterprise — Custom Deployment & Integration
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { RelatedCapabilities } from "@/components/RelatedCapabilities";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { AuthorityLinkBlock } from "@/components/seo/AuthorityLinkBlock";
// SEO handled via <SEO> component
import { ArrowRight, Building2, Shield, Layers, Zap, Globe, Lock, Brain, Server, Users, Mail, CheckCircle, Activity, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const capabilities = [
  {
    icon: Server,
    title: "Private Infrastructure Deployment",
    description: "Deploy the complete 40-node substrate on your own servers. Air-gapped, sovereign, and fully compliant — no data ever leaves your perimeter. Supports AWS, GCP, Azure, and bare-metal.",
  },
  {
    icon: Layers,
    title: "Custom Node Configuration",
    description: "Compose the exact stack your organization needs. Activate the nodes and sectors that matter, disable what doesn't — zero bloat. Choose which of the 12 sectors to deploy.",
  },
  {
    icon: Shield,
    title: "SOC2 & Compliance Ready",
    description: "AUDIT node provides immutable append-only logging with Merkle receipt chains. GOVERNANCE plane enforces policy mesh. DEFENSE wraps the outer shell. SOC2, GDPR, HIPAA ready.",
  },
  {
    icon: Brain,
    title: "Dedicated DREAM Cycles",
    description: "Configure autonomous optimization cycles for your deployment. DREAM consolidates memory, generates heuristics, and surfaces insights — tuned to your compliance requirements and data residency rules.",
  },
  {
    icon: Globe,
    title: "Multi-Region Deployment",
    description: "Run cognitive workloads across global regions with automatic failover, latency-aware NEXUS routing, and full data residency compliance. RELAY handles cross-region message dispatch.",
  },
  {
    icon: Lock,
    title: "Governance & Audit Trail",
    description: "GOVERNANCE plane supervises all actions. Immutable audit logging via AUDIT node, role-based access through ACCESS, and full policy enforcement — enterprise-ready from day one.",
  },
  {
    icon: Users,
    title: "Dedicated Support & SLA",
    description: "Direct line to the architecture team. Guaranteed uptime SLA, priority response, and engineering partnership — not just a ticket queue. Named account engineer included.",
  },
  {
    icon: Building2,
    title: "White-Label Ready",
    description: "Embed CMPSBL's cognitive capabilities into your own products. Your brand, your customers, our 40-node substrate running invisibly underneath. Full API access included.",
  },
  {
    icon: Cpu,
    title: "BYOK Model Routing",
    description: "NEXUS routes to 14+ AI providers with your own API keys. Budget-aware routing, automatic failover, and task complexity scoring — zero LLM costs to substrate operators.",
  },
];

const enterpriseFeatures = [
  "40-node substrate with weighted matrix (Σ = 1.000)",
  "12 sectors — Kernel, CCR, OCG, Execution, ESZ, EPZ, EMZ, CSZ, Fields, Plane, Atlas, Shell",
  "Persistent memory free for all users — 4-tier architecture",
  "DREAM cycles with configurable consolidation schedules",
  "DEFENSE outer shell with bot detection & prompt injection defense",
  "NEXUS routing across 14+ AI providers with BYOK",
  "Safety switches prevent cascading failures across nodes",
  "AUDIT immutable logging with Merkle receipt chains",
  "GOVERNANCE plane with 4 operational modes",
  "Zero-downtime hot reload via CORE kernel",
];

export default function Enterprise() {
  return (
    <>
      <SEO
        title="Enterprise — Self-Hosted Private Deployment | CMPSBL"
        description="Deploy CMPSBL on your own infrastructure via LNCHBL. Air-gapped, SOC2-ready, with private Memory Stream, dedicated DREAM cycles, compliance exports, and organization-level governance controls."
        canonical="https://cmpsbl.com/enterprise"
        keywords={['enterprise AI', 'private deployment', 'on-premises AI', 'CMPSBL enterprise', 'governed AI', 'SOC2 AI']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background pt-24 pb-16 relative">
        {/* Ambient glow */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-40 right-1/4 w-[500px] h-[500px] rounded-full animate-hero-orb-1" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)" }} />
        </div>

        {/* Hero */}
        <section className="container mx-auto max-w-5xl px-4 text-center mb-20 relative z-10">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-4 text-xs tracking-widest uppercase border-primary/30">
              Enterprise
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground mb-4">
              Your AI.<br />Your Infrastructure.<br />Your Rules.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
              The complete CMPSBL substrate —{" "}
              <Link to="/architecture" className="text-primary hover:underline font-medium">40 nodes across 12 sectors</Link>{" "}
              — deployed on your servers. DREAM cycles, governed ADAPT,{" "}
              <Link to="/persistent-memory" className="text-primary hover:underline font-medium">persistent memory</Link>,{" "}
              DEFENSE shell, and NEXUS routing — configured for your{" "}
              <a href="https://gdpr.eu/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">GDPR</a>{" "}
              and{" "}
              <a href="https://www.aicpa-cima.com/topic/audit-assurance/audit-and-assurance-greater-than-soc-2" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">SOC 2</a>{" "}
              compliance requirements.
            </p>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto mb-8">
              Persistent memory is free for all users. Enterprise adds private deployment, dedicated support, SLA guarantees, and custom configuration.{" "}
              See <Link to="/solutions" className="text-primary hover:underline font-medium">all solutions</Link>{" "}
              or explore <Link to="/use-cases" className="text-primary hover:underline font-medium">real-world use cases</Link>.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
                <a href="mailto:enterprise@CMPSBL.com">
                  <Mail className="w-4 h-4" />
                  Contact Us for Pricing
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="hover:border-primary/30 transition-colors">
                <Link to="/architecture">View Architecture</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* What's Included */}
        <section className="container mx-auto max-w-4xl px-4 mb-20 relative z-10">
          <motion.div {...fadeUp}>
            <h2 className="text-2xl font-bold text-center mb-8">What Every Enterprise Deployment Includes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {enterpriseFeatures.map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border/40 bg-card/30 shimmer-on-hover card-lift"
                >
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Capabilities Grid */}
        <section className="container mx-auto max-w-6xl px-4 mb-20 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="group p-6 rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-500 shimmer-on-hover card-lift gradient-border-reveal"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <cap.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-bold text-foreground mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="container mx-auto max-w-3xl px-4 text-center relative z-10">
          <motion.div {...fadeUp} className="p-8 sm:p-12 rounded-2xl border border-border bg-gradient-to-br from-muted/30 via-card/50 to-muted/30 backdrop-blur-sm shimmer-on-hover shadow-lg shadow-primary/[0.03]">
            <Activity className="w-8 h-8 text-primary mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-black text-foreground mb-3">Let's architect your deployment.</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-xl mx-auto">
              Custom slot capacity, dedicated instances, SOC2 compliance,{" "}
              <Link to="/foundry" className="text-primary hover:underline font-medium">DREAM cycle</Link> configuration,{" "}
              multi-region NEXUS routing, and white-glove onboarding — tailored to your organization.{" "}
              Read our <Link to="/documentation" className="text-primary hover:underline font-medium">technical docs</Link> for API details.
            </p>
            <p className="text-base font-bold text-foreground mb-6">
              Contact us at{" "}
              <a href="mailto:enterprise@CMPSBL.com" className="text-primary hover:text-primary/80 transition-colors underline">
                enterprise@CMPSBL.com
              </a>
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                <a href="mailto:enterprise@CMPSBL.com">
                  <Mail className="w-4 h-4" />
                  Email Enterprise Sales
                </a>
              </Button>
              <Button asChild variant="outline" size="lg" className="hover:border-primary/30 transition-colors">
                <Link to="/contact">General Inquiries</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>
      <RelatedCapabilities />
      <PageSEOBlock path="/enterprise" title="Enterprise" faq={[
        { question: "Does CMPSBL offer enterprise deployment?", answer: "Yes. Enterprise plans include dedicated substrate infrastructure, custom SLAs, SOC 2 compliance, SSO, and priority support with a dedicated success manager." },
        { question: "Can CMPSBL be deployed on-premise?", answer: "CMPSBL supports hybrid and dedicated cloud deployments. Contact our enterprise team for custom infrastructure requirements." },
      ]} />
      <AuthorityLinkBlock currentPath="/enterprise" />
      <EnhancedFooter />
    </>
  );
}
