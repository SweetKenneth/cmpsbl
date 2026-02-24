import { Link } from "react-router-dom";
import { useMetric } from "@/stores/publicMetricsStore";
import { Shield, Brain, Zap, Users, ArrowRight, CheckCircle, Accessibility, Eye, Wrench, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero/neon-data-center.jpg";
import earthWindowImage from "@/assets/hero/neon-dream-cosmos.jpg";
import founderPhoto from "@/assets/founder-kenneth-sweet.png";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay },
});

export default function About() {
  const version = useMetric('version');
  const codename = useMetric('codename');
  const products = [
    { icon: Brain, name: "CMPSBL Substrate", description: "21-module cognitive orchestration substrate with persistent memory" },
    { icon: Shield, name: "DEFENSE Module", description: "Enterprise-grade threat detection and bot protection" },
    { icon: Eye, name: "VISION Module", description: "Full observability and system introspection layer" },
    { icon: Server, name: "NEXUS Gateway", description: "Multi-provider AI routing with BYOK architecture" },
    { icon: Accessibility, name: "INCLUSIVE Module", description: "Human compatibility pipeline with WCAG scanning & AI remediation" },
    { icon: Zap, name: "Engines", description: "Production-ready cognitive orchestrations" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="About CMPSBL — Founded 2009, Dallas TX"
        description="CMPSBL was founded by Kenneth E Sweet Jr. From Dallas, TX to a layered cognitive infrastructure powering the future of AI."
        canonical="https://cmpsbl.com/about"
        keywords={['about CMPSBL', 'Kenneth Sweet', 'CMPSBL founder', 'Dallas AI company', 'cognitive infrastructure story', 'AI startup Texas']}
      />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About CMPSBL",
          "description": "CMPSBL is building cognitive infrastructure for AI applications — memory, learning, security, and multi-provider routing.",
          "url": "https://cmpsbl.com/about",
          "mainEntity": {
            "@type": "Organization",
            "name": "CMPSBL",
            "alternateName": "PromptFluid",
            "foundingDate": "2009",
            "founder": { "@type": "Person", "name": "Kenneth E Sweet Jr", "jobTitle": "Founder" }
          }
        })}
      </script>
      
      <PublicNav />
      
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 60%)" }}
          animate={{ x: [-40, 40, -40], y: [-20, 20, -20] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
      
      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <img 
          src={heroImage}
          alt="Modern sustainable architecture with natural light, representing CMPSBL's grounded approach to building AI systems"
          className="absolute inset-0 w-full h-[60vh] object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 h-[60vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-20 max-w-4xl">
          <nav className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </nav>
          
          <motion.h1 {...fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground [text-shadow:_0_2px_20px_hsl(var(--background))]">
            CMPSBL<sup className="text-lg">®</sup> by PromptFluid
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.15 }} className="text-xl text-foreground/90 max-w-3xl leading-relaxed [text-shadow:_0_2px_10px_hsl(var(--background))]">
            A cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. Model-agnostic. Provider-agnostic. Runs on commodity cloud.
          </motion.p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 px-4 bg-muted/30 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fadeUp} className="bg-card border border-border rounded-xl p-8 md:p-12 shadow-lg hover:shadow-xl transition-shadow duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <motion.img 
                src={founderPhoto}
                alt="Kenneth E. Sweet Jr. - Founder of CMPSBL, created by PromptFluid"
                className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20 flex-shrink-0"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              />
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4 text-foreground">About the Founder</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  I build systems that start as abstract ideas and end up running on their own.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  CMPSBL began as a focused effort to make AI orchestration actually useful—routing that adapts, memory that persists, and learning cycles that run autonomously.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Everything here is built to work without supervision. The goal is infrastructure that improves itself over time.
                </p>
                <motion.blockquote
                  {...fadeUp}
                  className="border-l-4 border-primary pl-6 my-6 italic text-foreground/90"
                >
                  "AI should amplify human capability, not replace human judgment. We build systems that think alongside you, not instead of you."
                </motion.blockquote>
                <div className="pt-6 border-t border-border">
                  <p className="text-foreground font-semibold">Kenneth E Sweet Jr</p>
                  <p className="text-sm text-muted-foreground">Founder & Security Engineer</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Earth Window */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        <img 
          src={earthWindowImage}
          alt="Space station control room with panoramic view of Earth from orbit"
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.blockquote
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-3xl px-8"
          >
            <p className="text-2xl md:text-5xl font-bold text-white [text-shadow:_0_4px_24px_rgba(0,0,0,0.8)]">
              "100+ projects shipped. We're closers."
            </p>
          </motion.blockquote>
        </div>
      </section>

      {/* Shipped Products */}
      <section className="py-16 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.h2 {...fadeUp} className="text-3xl font-bold mb-4 text-foreground">The Substrate</motion.h2>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="text-muted-foreground mb-10 text-lg">
            21 integrated modules. 300 synergy pipelines. 100 crystallized Crown Jewel pipelines. Production-ready cognitive infrastructure.
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={index}
                {...stagger(index * 0.08)}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <product.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div {...fadeUp} className="mt-12 bg-card border border-border rounded-xl p-6 md:p-8 shadow-sm">
            <p className="text-lg text-foreground/90 leading-relaxed">
              <span className="font-semibold">v{version} {codename} Epoch</span> — 175,000+ lines of production code. 400+ capabilities, 76 engines, 24 meta-engines, and a self-evolving architecture that improves itself overnight. <span className="text-muted-foreground">The substrate that thinks.</span>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 bg-muted/30 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.h2 {...fadeUp} className="text-3xl font-bold mb-12 text-center text-foreground">What Drives Us</motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Brain,
                title: "Intelligent by Default",
                description: "AI that learns, adapts, and improves automatically. From threat detection to content generation, our tools think for you."
              },
              {
                icon: Shield,
                title: "Built for Everyone",
                description: "Enterprise power without enterprise complexity. Whether protecting sites or building apps, our tools just work."
              },
              {
                icon: Zap,
                title: "Speed & Simplicity",
                description: "Deploy in minutes, not weeks. Build applications, generate content, and protect sites with tools designed for rapid execution."
              },
              {
                icon: Users,
                title: "Accessibility First",
                description: "Making the web inclusive isn't optional—it's fundamental. Every tool we build considers universal access from day one."
              }
            ].map((value, index) => (
              <motion.div
                key={index}
                {...stagger(index * 0.1)}
                className="bg-card border border-border rounded-xl p-8 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
              >
                <value.icon className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-2xl font-semibold mb-3 text-foreground">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-16 px-4 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <motion.h2 {...fadeUp} className="text-3xl font-bold mb-12 text-center text-foreground">Our Journey</motion.h2>
          <div className="space-y-6">
            {[
              { year: "2009", event: "Started building software—sites, apps, and tools for clients" },
              { year: "2024", event: "CMPSBL® founded. Substrate development begins." },
              { year: "2025", event: `v${version} ${codename} Epoch — 21 modules, 300 pipelines, 100 Crown Jewel pipelines, Composable Artifacts Store` },
              { year: "Now", event: "Production infrastructure serving developers and enterprises" }
            ].map((milestone, index) => (
              <motion.div
                key={index}
                {...stagger(index * 0.1)}
                className="flex items-start gap-4"
              >
                <div className="flex-shrink-0 w-20 text-primary font-bold text-lg">{milestone.year}</div>
                <div className="flex-grow bg-card border border-border p-6 rounded-xl hover:border-primary/20 transition-colors">
                  <CheckCircle className="w-5 h-5 text-[hsl(var(--system-green))] inline mr-2" />
                  <span className="text-foreground">{milestone.event}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30 relative z-10">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div {...fadeUp}>
            <h2 className="text-3xl font-bold mb-6 text-foreground">Ready to Explore?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Discover how CMPSBL's cognitive infrastructure can work for you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/investors">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  Investor Information
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline">
                  Contact Team
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
