/**
 * Substrate Insights — Observer Tier
 * Premium design with glass-edge cards, gradient accents, card-lift
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { PageSEOBlock } from "@/components/seo/PageSEOBlock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye, BarChart3, FileText, BookOpen, ArrowRight,
  CheckCircle, Shield, Layers, Users, Mail
} from "lucide-react";

const OBSERVER_FEATURES = [
  {
    icon: Eye,
    title: "Read-Only Visibility",
    description: "Access to documentation, architecture diagrams, and system overviews without modification rights.",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    icon: BarChart3,
    title: "Public Metrics",
    description: "View aggregate performance benchmarks and validation methodology results.",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    icon: FileText,
    title: "Documentation Access",
    description: "Full access to the architecture library covering all 40 nodes across 12 sectors.",
    gradient: "from-violet-500 to-purple-600",
  },
  {
    icon: BookOpen,
    title: "Research Materials",
    description: "Access to academic-grade documentation suitable for citation and reference.",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    icon: Shield,
    title: "Standards Reference",
    description: "Review AIGVRN governance namespace and LLMS.txt machine context standards.",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    icon: Layers,
    title: "Architecture Overview",
    description: "Understand the layered kernel architecture — 40 nodes across 12 sectors.",
    gradient: "from-blue-500 to-indigo-600",
  },
];

const QUICK_LINKS = [
  { to: "/foundations", icon: Layers, title: "Architecture Library", desc: "Documents covering architecture, modules, meshes, and zones" },
  { to: "/namespace", icon: Shield, title: "Governance Namespace", desc: "AI governance standards and 12 domain surfaces" },
  { to: "/llms-txt", icon: FileText, title: "LLMS.txt Standard", desc: "Machine-readable context format for AI systems" },
];

export default function Insights() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Insights — Observer-Level Architecture View | CMPSBL"
        description="Read-only observer access to CMPSBL's cognitive substrate: browse node specifications, Memory Stream signals, architecture diagrams, resolver catalogs, and system documentation."
        keywords={['CMPSBL insights', 'observer access', 'substrate architecture', 'node specifications', 'resolver catalog']}
      />

      <PublicNav />

      <main className="flex-1 relative">
        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-40 right-1/4 w-[400px] h-[400px] rounded-full animate-hero-orb-2" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)" }} />
        </div>

        <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl relative z-10">
          {/* Hero */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12 sm:mb-16"
          >
            <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
              <Eye className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold">Observer Access</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mb-4">
              Platform <span className="text-primary">Insights</span>
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6 leading-relaxed">
              Observer-level access to the CMPSBL cognitive substrate.
              Explore documentation, architecture, and standards with read-only visibility.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <Badge variant="outline" className="border-primary/20">Production</Badge>
              <Badge variant="outline" className="border-primary/20">40 Nodes</Badge>
              <Badge variant="outline" className="border-primary/20">Read-Only</Badge>
            </div>
          </motion.div>

          {/* Features Grid */}
          <section className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 mb-6"
            >
              <CheckCircle className="w-5 h-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">What Observers Access</h2>
            </motion.div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {OBSERVER_FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                  className="group p-5 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm card-lift shimmer-on-hover glass-edge"
                >
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-3 shadow-md`}>
                    <feature.icon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-bold mb-1.5">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Observer Scope */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-16 relative p-6 sm:p-8 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm glass-edge overflow-hidden"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] memory-stream-bar opacity-30" />
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-black tracking-tight">Observer Scope</h2>
            </div>
            <div className="text-sm text-muted-foreground leading-relaxed space-y-3">
              <p>
                The <strong className="text-foreground">Observer</strong> tier provides read-only access to CMPSBL documentation,
                architecture references, and standards materials. Observers can review the full
                documentation library, understand the 9-module + 5-mesh + 9-zone kernel architecture, and access
                governance namespace documentation.
              </p>
              <p>
                This tier is designed for researchers, evaluators, and those seeking to understand
                the substrate class before deeper engagement. All materials are citation-ready
                and suitable for academic or commercial evaluation.
              </p>
            </div>
          </motion.section>

          {/* Quick Links */}
          <section className="mb-16">
            <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-6">Available Resources</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {QUICK_LINKS.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <Link to={link.to} className="block h-full">
                    <div className="h-full p-5 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm card-lift shimmer-on-hover glass-edge group">
                      <link.icon className="w-7 h-7 text-primary mb-3 group-hover:scale-110 transition-transform duration-300" />
                      <h3 className="font-bold mb-1">{link.title}</h3>
                      <p className="text-sm text-muted-foreground">{link.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Registration CTA */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-6 sm:p-10 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card/30 to-primary/5 backdrop-blur-sm text-center glass-edge overflow-hidden mb-12"
          >
            <div className="absolute inset-x-0 top-0 h-[2px] memory-stream-bar opacity-40" />
            <Eye className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-black mb-3 tracking-tight">Register as Observer</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6 text-sm leading-relaxed">
              Join the observer list to receive updates on CMPSBL documentation releases,
              standards publications, and research materials.
            </p>
            <Button size="lg" asChild className="gap-2 shadow-lg shadow-primary/15 hover:shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all">
              <Link to="/register">
                Register Now <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </motion.section>

          {/* Applied Engagements */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="p-6 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-sm glass-edge mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4 text-primary" />
                  Interested in Applied Engagements?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Applied engagements are scoped, research-first, and selective.
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link to="/contact">
                  Contact Us <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Attribution */}
          <div className="p-6 rounded-2xl bg-card/30 border border-border/20 text-center">
            <p className="text-sm text-muted-foreground">
              CMPSBL® by{" "}
              <a
                href="https://orcid.org/0009-0001-4237-1243"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Kenneth E. Sweet Jr.
              </a>
              {" "}• CMPSBL® • 2026
            </p>
          </div>
        </div>
      </main>

      <PageSEOBlock path="/insights" title="System Insights" />
      <EnhancedFooter />
    </div>
  );
}
