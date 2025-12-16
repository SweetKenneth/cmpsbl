import { Link } from "react-router-dom";
import { Shield, Brain, Zap, Users, ArrowRight, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

export default function About() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SEO 
        title="About PromptFluid™ | Building AI That Flows with Cascade Intelligence"
        description="Founded in 2024, PromptFluid is building an adaptive AI ecosystem powered by Cascade—our intelligent orchestration engine. From WordPress security to enterprise automation, discover how we're creating technology that learns, adapts, and flows naturally."
        canonical="https://promptfluid.com/about"
        type="website"
        keywords={['PromptFluid company', 'Cascade AI platform', 'AI ecosystem builder', 'adaptive machine learning', 'AI that flows', 'PromptFluid products', 'intelligent automation', 'behavioral AI security', 'Kenneth E Sweet Jr', 'AI orchestration platform', 'machine learning ecosystem', 'enterprise AI solutions', 'PromptFluid Reflex', 'Bot Sniper technology', 'WordPress security AI']}
      />
      
      {/* Structured Data - About/Company Page */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About PromptFluid",
          "description": "PromptFluid is building AI-powered security and automation tools, starting with Reflex—the leading WordPress bot protection plugin",
          "url": "https://promptfluid.com/about",
          "mainEntity": {
            "@type": "Organization",
            "name": "PromptFluid",
            "foundingDate": "2024",
            "founder": {
              "@type": "Person",
              "name": "Kenneth E Sweet Jr",
              "jobTitle": "Founder & CEO"
            },
            "numberOfEmployees": {
              "@type": "QuantitativeValue",
              "value": "5-10"
            },
            "slogan": "AI That Flows",
            "description": "Enterprise AI-powered WordPress security and intelligent automation platform"
          }
        })}
      </script>
      
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [{
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://promptfluid.com"
          }, {
            "@type": "ListItem",
            "position": 2,
            "name": "About",
            "item": "https://promptfluid.com/about"
          }]
        })}
      </script>
      
      {/* Navigation */}
      <PublicNav />
      
      {/* Hero Section */}
      <header className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-primary/10"></div>
        <div className="container mx-auto max-w-6xl relative z-10">
          <nav className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </nav>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 glow-text">
            Building AI That Flows
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl leading-relaxed">
            Founded in 2024, PromptFluid™ is creating an ecosystem of adaptive AI systems powered by <strong className="text-foreground">Cascade</strong>—our 
            intelligent orchestration engine. We believe AI should flow naturally, learning and adapting without friction. From WordPress 
            security to enterprise automation, our products work together seamlessly, unified by machine learning that evolves with your needs. 
            This is technology that thinks, adapts, and protects—AI that truly flows.
          </p>
        </div>
      </header>

      {/* Mission Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="glass glass-hover p-12 rounded-2xl">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              At PromptFluid, we're building an ecosystem where artificial intelligence, automation, and creativity merge seamlessly. 
              Every <Link to="/projects" className="text-primary hover:underline">product, plugin, and module</Link> operates under the principle of <strong className="text-foreground">adaptive intelligence</strong>—systems 
              that learn, flow, and evolve without friction.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-6">
              Our core technology, <Link to="/blog/cascade-ai-adaptive-intelligence-brain" className="text-primary hover:underline font-semibold">Cascade AI</Link>, serves as the intelligent orchestration layer 
              connecting all our products. It manages prompt evolution, learning, and memory across the entire PromptFluid ecosystem. 
              From <Link to="/blog/promptfluid-defense-ai-security" className="text-primary hover:underline">security</Link> to <Link to="/blog/ai-automation-trends-2025" className="text-primary hover:underline">automation</Link> to <Link to="/blog/promptfluid-studio-build-apps-that-think" className="text-primary hover:underline">development</Link>, Cascade ensures everything works together naturally.
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're not building isolated tools—we're creating a <Link to="/blog/how-promptfluid-works-cascade-ai-ecosystem" className="text-primary hover:underline">unified platform</Link> where each product enhances the others. Machine learning 
              models share insights, adaptive algorithms improve across the ecosystem, and <Link to="/blog/ai-triad-intelligent-routing" className="text-primary hover:underline">intelligent automation</Link> flows from one system to 
              the next. This is AI that actually works the way it should: seamlessly, intelligently, and naturally.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold mb-6">Experience the Ecosystem</h2>
          <p className="text-xl text-muted-foreground mb-8">
            Discover how PromptFluid's adaptive AI can transform your security, automation, and development workflows.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/projects">
              <Button size="lg" className="bg-primary hover:bg-primary/80 text-white shadow-[0_0_30px_rgba(14,165,233,0.4)]">
                Explore Our Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                Contact Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* First Product Announcement */}
      <section className="py-16 px-4 bg-muted/30 border-t border-border/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-sm px-4 py-2">
              Announcing Our First Product
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              PromptFluid Reflex with{" "}
              <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                Bot Sniper™
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our flagship product brings <Link to="/blog/cascade-ai-adaptive-intelligence-brain" className="text-primary hover:underline">Cascade AI's adaptive intelligence</Link> to <Link to="/blog/wordpress-bot-defense" className="text-primary hover:underline">WordPress security</Link>, 
              delivering enterprise-grade bot protection through behavioral analysis and machine learning.
            </p>
          </div>

          <div className="glass glass-hover p-10 rounded-2xl mb-8">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <Shield className="w-7 h-7 text-primary" />
                  What Makes Reflex Different
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Traditional <Link to="/blog/top-security-plugins-2025" className="text-primary hover:underline">WordPress security plugins</Link> rely on outdated signature matching and IP blocking—methods that 
                  sophisticated bots easily bypass. <strong className="text-foreground">PromptFluid Reflex</strong> uses <Link to="/blog/ai-cybersecurity-evolution-2025" className="text-primary hover:underline">behavioral 
                  AI</Link> powered by our Cascade engine to analyze actual user behavior patterns in real-time.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Our proprietary <strong className="text-foreground">Bot Sniper™</strong> technology detects credential stuffing, 
                  brute force attacks, web scraping, and <Link to="/blog/ai-hackers-underground-2025" className="text-primary hover:underline">AI-powered bots</Link> by understanding how they behave—not just what they look like. 
                  The system learns and adapts continuously, getting smarter with every threat it encounters.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Built by security engineers with Fortune 500 experience, Reflex brings enterprise-grade protection to WordPress 
                  sites of all sizes. It's the first product in our ecosystem—and it's just the beginning.
                </p>
              </div>
              <div className="space-y-4">
                <div className="glass p-6 rounded-xl border border-primary/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    Powered by Cascade AI
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Adaptive learning that improves protection across the entire PromptFluid ecosystem
                  </p>
                </div>
                <div className="glass p-6 rounded-xl border border-primary/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Bot Sniper™ Technology
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Precision behavioral analysis that detects threats traditional systems miss
                  </p>
                </div>
                <div className="glass p-6 rounded-xl border border-primary/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    Real-Time Protection
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    24/7 automated defense that adapts to emerging threats instantly
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Submitted to WordPress.org for approval—will be available as a free download with premium plans starting at $19/month
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/products/defense">
                <Button size="lg" className="shadow-glow hover:shadow-glow-lg">
                  Learn About Reflex
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/projects/defense">
                <Button size="lg" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">What Drives Us</h2>
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
                description: "Enterprise power without enterprise complexity. Whether you're protecting WordPress sites or building custom apps, our tools just work."
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
              <article 
                key={value.title}
                className="glass glass-hover p-8 rounded-xl animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <value.icon className="w-12 h-12 text-primary mb-4 animate-glow" />
                <h3 className="text-2xl font-semibold mb-3">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Journey</h2>
          <div className="space-y-6">
            {[
              { year: "2024", event: "PromptFluid founded with vision to create AI that dreams and learns autonomously" },
              { year: "Q4 2024", event: "Cascade AI achieves world's first autonomous dream cycles — reflecting, synthesizing, and evolving" },
              { year: "Q1 2025", event: "Reflex Bot Sniper live on WordPress.org • Clarity (CMPTBL) launches as 100% free accessibility platform" },
              { year: "2025", event: "250+ edge functions deployed • 10 integrated modules • Dream-Eater public feeding API launched" },
              { year: "2025+", event: "Expanding enterprise platform with multi-provider AI routing (Groq, Together, Hyperbolic, DeepSeek, Cerebras)" }
            ].map((milestone, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="flex-shrink-0 w-20 text-primary font-bold text-lg">{milestone.year}</div>
                <div className="flex-grow glass glass-hover p-6 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400 inline mr-2" />
                  <span className="text-foreground">{milestone.event}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-8 text-center">Powered by Modern Tech</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto">
            We build on proven, scalable infrastructure including <strong>React</strong>, <strong>Vite</strong>, 
            <strong> Supabase</strong>, <strong>Deno Edge Functions</strong>, and intelligent AI routing across 
            <a href="https://groq.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> Groq</a>, 
            <a href="https://together.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> Together</a>, 
            <a href="https://hyperbolic.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> Hyperbolic</a>, 
            <a href="https://deepseek.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> DeepSeek</a>, and 
            <a href="https://cerebras.ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline"> Cerebras</a>.
            Smart routing ensures maximum uptime with free-tier optimization across all providers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {['React', 'Vite', 'TypeScript', 'Supabase', 'Deno', 'Groq AI', 'Together AI', 'Hyperbolic', 'DeepSeek', 'Cerebras', 'Replicate', 'Stability AI'].map((tech) => (
              <div key={tech} className="glass px-6 py-3 rounded-full text-sm font-medium">
                {tech}
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <EnhancedFooter />
    </div>
  );
}
