import { Link } from "react-router-dom";
import { useMetric } from "@/stores/publicMetricsStore";
import { Shield, Brain, Zap, Users, ArrowRight, CheckCircle, Accessibility, Eye, Wrench, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { AuthorityLinkBlock } from "@/components/seo/AuthorityLinkBlock";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero/neon-data-center.jpg";
import earthWindowImage from "@/assets/hero/neon-dream-cosmos.jpg";
import { TEAM_MEMBERS, DEPARTMENTS } from "@/data/team";

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
  const linesOfCodeDisplay = useMetric('linesOfCodeDisplay');
  const products = [
    { icon: Brain, name: "Persistent Memory", description: "Multi-tier memory that survives sessions — your AI never forgets a user, a preference, or a pattern." },
    { icon: Server, name: "NEXUS Router", description: "Intelligent multi-provider routing that picks the optimal AI model for every request automatically." },
    { icon: Shield, name: "DEFENSE Shell", description: "Adaptive threat detection, behavioral analysis, and rate limiting — security that learns." },
    { icon: Eye, name: "VISION", description: "Full observability across every module — latency, cost, throughput, and real-time health dashboards." },
    { icon: Accessibility, name: "INCLUSIVE", description: "WCAG 2.2 scanning, AI-powered remediation, and accessibility compliance reporting." },
    { icon: Zap, name: "Artifact Packs", description: "24 activatable capability packs across 6 domains — choose 3, 6, or 12 depending on your tier." },
  ];

  const founder = TEAM_MEMBERS[0];
  const teamMembers = TEAM_MEMBERS.slice(1);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="About CMPSBL — Team & Mission"
        description="CMPSBL is a cognitive infrastructure lab based in Dallas, TX. Meet the team building governed AI operating systems with persistent memory and adaptive intelligence."
        canonical="https://cmpsbl.com/about"
        image="https://cmpsbl.com/og/about.jpg"
        keywords={['about CMPSBL', 'CMPSBL team', 'cognitive infrastructure', 'AI startup Texas', 'Dallas AI company']}
        faq={[
          { question: 'Who founded CMPSBL?', answer: 'CMPSBL was founded in 2009 by a veteran software engineer in Dallas, Texas. The team has since grown to include AI researchers, security specialists, and systems engineers.' },
          { question: 'What does CMPSBL stand for?', answer: 'CMPSBL stands for Composable — reflecting the modular, composable nature of the cognitive infrastructure substrate. Every module can be independently deployed, swapped, and evolved.' },
          { question: 'Where is CMPSBL based?', answer: 'CMPSBL is headquartered in Dallas, Texas, USA, serving teams and enterprises worldwide with composable cognitive infrastructure.' },
        ]}
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
            "alternateName": "Composable",
            "foundingDate": "2009",
            "numberOfEmployees": { "@type": "QuantitativeValue", "minValue": 6 },
            "founder": { "@type": "Person", "name": founder.name, "jobTitle": "Founder & Chief Architect" }
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
            CMPSBL<sup className="text-lg">®</sup>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.15 }} className="text-xl text-foreground/90 max-w-3xl leading-relaxed [text-shadow:_0_2px_10px_hsl(var(--background))]">
            The operating system for AI applications. Persistent memory, intelligent routing, governed orchestration, and enterprise security — in one composable substrate.
          </motion.p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 px-4 bg-muted/30 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <motion.div {...fadeUp} className="bg-card border border-border rounded-xl p-8 md:p-12 shadow-lg hover:shadow-xl transition-shadow duration-500">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <motion.img 
                src={founder.photo}
                alt={`${founder.name} - Founder of CMPSBL`}
                className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20 flex-shrink-0"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              />
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4 text-foreground">About the Founder</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                   I've been shipping software since 2009. CMPSBL is the answer to a question I kept running into: why does every AI team rebuild the same infrastructure from scratch?
                 </p>
                 <p className="text-muted-foreground leading-relaxed mb-6">
                   So I built the layer that should already exist — persistent memory, intelligent routing, adaptive security, and governed orchestration. One substrate. Every AI application.
                 </p>
                 <p className="text-muted-foreground leading-relaxed mb-6">
                   The result is infrastructure that compounds — it gets smarter the longer it runs. That's not marketing. That's the architecture.
                 </p>
                <motion.blockquote
                  {...fadeUp}
                  className="border-l-4 border-primary pl-6 my-6 italic text-foreground/90"
                >
                  "AI should amplify human capability, not replace human judgment. We build systems that think alongside you, not instead of you."
                </motion.blockquote>
                <div className="pt-6 border-t border-border">
                  <p className="text-foreground font-semibold">{founder.name}</p>
                  <p className="text-sm text-muted-foreground">{founder.role}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.div {...fadeUp} className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Researchers, engineers, and specialists building the cognitive infrastructure layer for autonomous AI systems.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                {...stagger(index * 0.08)}
                className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <img 
                    src={member.photo} 
                    alt={`${member.name} - ${member.role}`}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-primary/10"
                  />
                  <div>
                    <h3 className="font-semibold text-foreground">{member.name}</h3>
                    <p className="text-sm text-primary">{member.role}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  {member.bio.split('.').slice(0, 2).join('.') + '.'}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {member.expertise.slice(0, 3).map((tag) => (
                    <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border text-muted-foreground">
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
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
               "Infrastructure that compounds — every day it runs, it gets better."
             </p>
          </motion.blockquote>
        </div>
      </section>

      {/* Shipped Products */}
      <section className="py-16 px-4 relative z-10">
        <div className="container mx-auto max-w-6xl">
          <motion.h2 {...fadeUp} className="text-3xl font-bold mb-4 text-foreground">What We Ship</motion.h2>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="text-muted-foreground mb-10 text-lg">
            Production modules, 24 artifact packs, and 300+ orchestration pipelines. Everything your AI needs to remember, route, learn, and protect itself.
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
              <span className="font-semibold">{codename} Epoch</span> — {linesOfCodeDisplay} lines of production code powering persistent memory, intelligent routing, governed orchestration, and adaptive security. <span className="text-muted-foreground">Ship AI that compounds from day one.</span>
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
                 title: "Memory is the Moat",
                 description: "AI without memory is a parlor trick. We give your agents permanent recall — context that compounds across every session."
               },
               {
                 icon: Shield,
                 title: "Security is Non-Negotiable",
                 description: "Adaptive threat detection, behavioral analysis, and governance rules baked into every layer. Not bolted on after the fact."
               },
               {
                 icon: Zap,
                 title: "Ship in Hours, Not Months",
                 description: "Free templates, production-ready modules, and a runtime that handles orchestration so you can focus on what makes your product different."
               },
               {
                 icon: Users,
                 title: "Built for Builders",
                 description: "Whether you're a solo developer or a 50-person team, the same substrate scales with you. Start free, upgrade when capacity demands it."
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
              { year: "2009", event: "CMPSBL's founding team starts shipping software — hundreds of projects across industries" },
               { year: "2024", event: "CMPSBL® formally established — the substrate architecture crystallizes around persistent memory and governed orchestration" },
               { year: "2025", event: "Production launch — artifact packs, NEXUS routing, DEFENSE shell, and the full Builder/Creator/Architect tier model" },
               { year: "Now", event: "Live cognitive infrastructure powering AI applications — free tier, no lock-in, shipping daily" }
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

      {/* Licensing CTA Section */}
      <section className="py-20 px-4 bg-muted/30 relative z-10">
        <div className="container mx-auto max-w-4xl text-center">
          <motion.div {...fadeUp}>
            <Badge className="mb-6 px-4 py-1.5 text-sm bg-primary/10 text-primary border-primary/30">
              Internal Proprietary Software
            </Badge>
            <h2 className="text-3xl font-bold mb-6 text-foreground">Licensing & Acquisition Inquiries</h2>
             <p className="text-xl text-muted-foreground mb-4">
               The CMPSBL Substrate is internal proprietary software built for use by our internal development team.
             </p>
             <p className="text-lg text-muted-foreground mb-8">
               Interested in licensing or potential acquisition? Reach out to our team.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <a href="mailto:hello@CMPSBL.com">
                 <Button size="lg" className="bg-primary hover:bg-primary/90">
                   Email hello@CMPSBL.com
                   <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
               </a>
               <Link to="/publication">
                 <Button size="lg" variant="outline">
                   Read Our Publication
                 </Button>
               </Link>
             </div>
          </motion.div>
        </div>
      </section>

      <AuthorityLinkBlock currentPath="/about" />
      <EnhancedFooter />
    </div>
  );
}
