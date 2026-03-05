/**
 * Enterprise — Custom Deployment & Integration
 *
 */

import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { ArrowRight, Building2, Shield, Layers, Zap, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

const capabilities = [
  {
    icon: Shield,
    title: "Your Infrastructure, Your Data",
    description: "Deploy the complete substrate on your own servers. Air-gapped, sovereign, and fully compliant — no data ever leaves your perimeter.",
  },
  {
    icon: Layers,
    title: "Custom System Configuration",
    description: "Compose the exact stack your organization needs. Activate the packs that matter, disable what doesn't — zero bloat.",
  },
  {
    icon: Zap,
    title: "Dedicated Support & SLA",
    description: "Direct line to the architecture team. Guaranteed uptime, priority response, and engineering partnership — not just a ticket queue.",
  },
  {
    icon: Globe,
    title: "Multi-Region Deployment",
    description: "Run cognitive workloads across global regions with automatic failover, latency-aware routing, and full data residency compliance.",
  },
  {
    icon: Lock,
    title: "Governance & Audit",
    description: "Immutable audit logging, role-based access, regulatory compliance exports, and full policy enforcement — enterprise-ready from day one.",
  },
  {
    icon: Building2,
    title: "White-Label Ready",
    description: "Embed CMPSBL's cognitive capabilities into your own products. Your brand, your customers, our infrastructure running invisibly underneath.",
  },
];

export default function Enterprise() {
  return (
    <>
      <SEO
        title="Enterprise — CMPSBL"
        description="Deploy the CMPSBL cognitive substrate on your own infrastructure. Private deployment, custom systems, priority support, and compliance-ready orchestration."
        canonical="https://cmpsbl.com/enterprise"
        keywords={['enterprise AI', 'private deployment', 'on-premises AI', 'CMPSBL enterprise']}
      />
      <PublicNav />
      <main className="min-h-screen bg-background pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto max-w-5xl px-4 text-center mb-20">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-4 text-xs tracking-widest uppercase">
              Enterprise
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
              Your AI.<br />Your Infrastructure.<br />Your Rules.
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              The complete CMPSBL substrate — deployed on your servers. DREAM cycles, governed ADAPT, persistent memory, and EVOLUTION — configured for your compliance requirements.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg" className="gap-2">
                <Link to="/contact">
                  Talk to Us <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/solutions">View Solutions</Link>
              </Button>
            </div>
          </motion.div>
        </section>

        {/* Capabilities Grid */}
        <section className="container mx-auto max-w-6xl px-4 mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capabilities.map((cap, i) => (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group p-6 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <cap.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{cap.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cap.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto max-w-3xl px-4 text-center">
          <motion.div {...fadeUp} className="p-8 rounded-2xl border border-border bg-muted/30">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">Let's architect your deployment.</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              Custom slot capacity, dedicated instances, SOC2 compliance, DREAM cycle configuration, and white-glove onboarding — tailored to your organization.
            </p>
            <Button asChild size="lg" className="gap-2">
              <Link to="/contact">
                Schedule a Consultation <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.div>
        </section>
      </main>
      <EnhancedFooter />
    </>
  );
}
