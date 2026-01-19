import { Link } from "react-router-dom";
import { Shield, Brain, Zap, Users, ArrowRight, CheckCircle, Accessibility, Eye, Wrench, Server } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import heroImage from "@/assets/hero/neural-command-center.jpg";
import earthWindowImage from "@/assets/hero/cognitive-pathways.jpg";
import founderPhoto from "@/assets/founder-kenneth-sweet.png";
export default function About() {
  const products = [
    { icon: Shield, name: "RCKBL", description: "Complete website defense against bots and threats" },
    { icon: Eye, name: "RNDRBL", description: "Accessibility browser with layover controls" },
    { icon: Accessibility, name: "PTCHBL", description: "Free WCAG scanner with AI-powered fixes" },
    { icon: Wrench, name: "SPLCBL", description: "WordPress plugin compliance validator" },
    { icon: Brain, name: "Cascade", description: "Autonomous AI with dreaming cycles" },
    { icon: Server, name: "AI Nexus", description: "Multi-provider AI routing gateway" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="About promptfluid® | Cognitive Orchestration Substrate"
        description="promptfluid is a cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems."
        canonical="https://promptfluid.com/about"
        keywords={['promptfluid substrate', 'cognitive orchestration', 'AI infrastructure', 'autonomous systems', 'accessibility tools']}
      />
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About PromptFluid",
          "description": "PromptFluid is building AI-powered infrastructure for security, accessibility, and autonomous systems",
          "url": "https://promptfluid.com/about",
          "mainEntity": {
            "@type": "Organization",
            "name": "PromptFluid",
            "foundingDate": "2009",
            "founder": { "@type": "Person", "name": "Kenneth E Sweet Jr", "jobTitle": "Founder" }
          }
        })}
      </script>
      
      <PublicNav />
      
      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <img 
          src={heroImage}
          alt="Modern sustainable architecture with natural light, representing PromptFluid's grounded approach to building AI systems"
          className="absolute inset-0 w-full h-[60vh] object-cover"
        />
        <div className="absolute inset-0 h-[60vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-20 max-w-4xl">
          <nav className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </nav>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
            promptfluid<sup className="text-lg">®</sup> substrate
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
            A cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. Model-agnostic. Provider-agnostic. Runs on commodity cloud.
          </p>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-card border border-border rounded-lg p-8 md:p-12">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <img 
                src={founderPhoto}
                alt="Kenneth E. Sweet Jr. - Founder of PromptFluid"
                className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/20 flex-shrink-0"
              />
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-4 text-foreground">About the Founder</h2>
                <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                  I build systems that start as abstract ideas and end up running on their own.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  promptfluid began as a focused effort to make AI orchestration actually useful—routing that adapts, memory that persists, and learning cycles that run autonomously.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  Everything here is built to work without supervision. The goal is infrastructure that improves itself over time.
                </p>
                <blockquote className="border-l-4 border-primary pl-6 my-6 italic text-foreground/90">
                  "AI should amplify human capability, not replace human judgment. We build systems that think alongside you, not instead of you."
                </blockquote>
                <div className="pt-6 border-t border-border">
                  <p className="text-foreground font-semibold">Kenneth E Sweet Jr</p>
                  <p className="text-sm text-muted-foreground">Founder & Security Engineer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Earth Window */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        <img 
          src={earthWindowImage}
          alt="Space station control room with panoramic view of Earth from orbit"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
            <p className="text-2xl md:text-5xl font-bold text-white [text-shadow:_0_4px_24px_rgba(0,0,0,0.8)]">
              "100+ projects shipped. We're closers."
            </p>
          </blockquote>
        </div>
      </section>

      {/* Shipped Products */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Shipped Products</h2>
          <p className="text-muted-foreground mb-10 text-lg">
            Six live systems. Real, operational, and independently verifiable.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <div key={index} className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-all">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <product.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-card border border-border rounded-lg p-6 md:p-8">
            <p className="text-lg text-foreground/90 leading-relaxed">
              <span className="font-semibold">100+ projects shipped</span> over 15 years—sites, apps, web apps, and enterprise software. We design from concept to working software to polished enterprise-grade systems. <span className="text-muted-foreground">We ship real systems.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-foreground">What Drives Us</h2>
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
              <div key={index} className="bg-card border border-border rounded-lg p-8">
                <value.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-semibold mb-3 text-foreground">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-12 text-center text-foreground">Our Journey</h2>
          <div className="space-y-6">
            {[
              { year: "2009", event: "Started building software—sites, apps, and tools for clients" },
              { year: "2024", event: "PromptFluid founded. Cascade development begins." },
              { year: "2025", event: "Six products live: RCKBL, RNDRBL, PTCHBL, SPLCBL, Cascade, AI Nexus" },
              { year: "Now", event: "Seeking seed investment to scale infrastructure" }
            ].map((milestone, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-20 text-primary font-bold text-lg">{milestone.year}</div>
                <div className="flex-grow bg-card border border-border p-6 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-[hsl(var(--system-green))] inline mr-2" />
                  <span className="text-foreground">{milestone.event}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">Ready to Explore?</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Discover how PromptFluid's infrastructure can work for you.
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
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
