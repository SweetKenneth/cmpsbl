/**
 * Enterprise — Custom Deployment & Integration
 * v10.5.4 ARCHITECT Epoch
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
    title: "Private Substrate Deployment",
    description: "Run the full cognitive substrate on your own infrastructure with air-gapped security and compliance guarantees.",
  },
  {
    icon: Layers,
    title: "Custom Module Configuration",
    description: "Select, compose, and configure substrate modules to match your organization's specific workflows and requirements.",
  },
  {
    icon: Zap,
    title: "Priority Support & SLA",
    description: "Dedicated engineering support, guaranteed uptime SLAs, and direct access to the substrate architecture team.",
  },
  {
    icon: Globe,
    title: "Multi-Region Orchestration",
    description: "Deploy cognitive workloads across global regions with automatic failover and data residency compliance.",
  },
  {
    icon: Lock,
    title: "Governance & Compliance",
    description: "Enterprise-grade audit logging, role-based access control, and regulatory compliance tooling built into every layer.",
  },
  {
    icon: Building2,
    title: "White-Label Solutions",
    description: "Brand the substrate as your own — embed cognitive capabilities into your products without exposing the underlying platform.",
  },
];

export default function Enterprise() {
  return (
    <>
      <SEO
        title="Enterprise — CMPSBL"
        description="Deploy the CMPSBL cognitive substrate on your own infrastructure. Private deployment, custom modules, priority support, and compliance-ready orchestration."
      />
      <PublicNav />
      <main className="min-h-screen bg-background pt-24 pb-16">
        {/* Hero */}
        <section className="container mx-auto max-w-5xl px-4 text-center mb-20">
          <motion.div {...fadeUp}>
            <Badge variant="outline" className="mb-4 text-xs tracking-widest uppercase">
              Enterprise
            </Badge>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
              Cognitive Infrastructure,<br />Your Terms
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              The full power of the CMPSBL substrate — deployed privately, configured precisely, and supported continuously for organizations that demand more.
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
            <h2 className="text-2xl font-bold text-foreground mb-3">Ready to deploy?</h2>
            <p className="text-muted-foreground mb-6">
              Our team will architect a substrate deployment tailored to your organization's scale, security, and compliance requirements.
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
