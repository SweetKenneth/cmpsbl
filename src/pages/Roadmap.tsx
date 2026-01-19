import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Brain, Zap, Globe, Accessibility, Store, Rocket, CheckCircle2, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/hero/cognitive-pathways.jpg";
import neuralImage from "@/assets/hero/neural-command-center.jpg";
export default function Roadmap() {
  const quarters = [
    {
      period: "Q1 2025",
      status: "In Progress",
      items: [
        {
          icon: Shield,
          title: "RCKBL (Rockable) - WordPress Plugin",
          description: "AI-powered bot detection and threat intelligence for WordPress. Behavioral analysis, adaptive CAPTCHA, and real-time threat blocking. Currently pending WordPress.org approval.",
          status: "Pending Approval",
          technologies: ["Machine Learning", "Behavioral Analysis", "Fingerprinting", "PHP", "React"]
        },
        {
          icon: Brain,
          title: "Dream Eater - Experimental AI",
          description: "Experimental AI system exploring autonomous dream cycles and self-reflection concepts. Early stage research and development.",
          status: "Experimental",
          technologies: ["AI Orchestration", "Scheduled Tasks", "Pattern Recognition"]
        }
      ]
    },
    {
      period: "Q2 2025",
      status: "In Progress",
      items: [
        {
          icon: Accessibility,
          title: "PTCHBL (Patchable) Accessibility Suite",
          description: "100% free WCAG compliance scanning and AI-powered fixes. Live at PTCHBL.com — accessibility should never be behind a paywall.",
          status: "Live",
          technologies: ["Computer Vision", "NLP", "WCAG 2.2", "ARIA"]
        },
        {
          icon: Zap,
          title: "AI Provider Network",
          description: "Intelligent routing across free-tier AI providers (Groq, Cerebras, Together AI, DeepSeek, Hyperbolic, Google AI Studio) for zero-cost AI operations.",
          status: "Active Development",
          technologies: ["API Gateway", "Load Balancing", "Free-tier Optimization"]
        }
      ]
    },
    {
      period: "Q3 2025",
      status: "Planned",
      items: [
        {
          icon: Store,
          title: "AI Marketing Studio",
          description: "Autonomous content generation, SEO optimization, competitor analysis, and campaign management. Marketing that thinks for itself.",
          status: "Concept",
          technologies: ["Free-tier AI Routing", "SEO AI", "Market Intelligence"]
        },
        {
          icon: Globe,
          title: "Multi-Site Orchestration",
          description: "Manage hundreds of websites from one unified dashboard. Automated updates, security monitoring, and performance optimization across your entire portfolio.",
          status: "Planning",
          technologies: ["Distributed Systems", "Real-time Sync", "Cloud Infrastructure"]
        }
      ]
    },
    {
      period: "Q4 2025 - 2026",
      status: "Vision",
      items: [
        {
          icon: Rocket,
          title: "Enterprise AI Platform",
          description: "White-label solutions, custom AI models, and dedicated infrastructure. Scale from startup to enterprise with intelligent automation.",
          status: "Roadmap",
          technologies: ["Custom Models", "Private Cloud", "API Gateway", "Enterprise SLA"]
        },
        {
          icon: Brain,
          title: "Predictive Intelligence Network",
          description: "Global threat intelligence sharing, predictive analytics, and zero-day protection. Learning from millions of sites to protect yours.",
          status: "Research",
          technologies: ["Federated Learning", "Threat Intelligence", "Global CDN"]
        }
      ]
    }
  ];

  const statusColors = {
    "Live": "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    "Pending Approval": "text-amber-500 bg-amber-500/10 border-amber-500/20",
    "Active Development": "text-blue-500 bg-blue-500/10 border-blue-500/20",
    "Design Phase": "text-purple-500 bg-purple-500/10 border-purple-500/20",
    "Research": "text-orange-500 bg-orange-500/10 border-orange-500/20",
    "Concept": "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    "Planning": "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    "Roadmap": "text-pink-500 bg-pink-500/10 border-pink-500/20",
    "Experimental": "text-purple-400 bg-purple-400/10 border-purple-400/20"
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="2025-2026 Roadmap | PromptFluid™ — Building the Future of AI Tools"
        description="Explore PromptFluid's ambitious roadmap: AI-powered WordPress security, rapid application development, universal accessibility tools, intelligent marketing automation, and enterprise AI solutions. See what we're building to democratize technology."
        canonical="https://promptfluid.com/roadmap"
        keywords={[
          'AI development roadmap',
          'WordPress security plugin',
          'AI automation tools',
          'accessibility software',
          'intelligent marketing',
          'rapid application development',
          'enterprise AI platform',
          'technology roadmap 2025',
          'AI-powered tools',
          'developer productivity'
        ]}
      />

      <PublicNav />

      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <img 
          src={heroImage}
          alt="Product roadmap visualization with timeline and milestones representing PromptFluid's strategic direction"
          className="absolute inset-0 w-full h-[60vh] object-cover"
        />
        <div className="absolute inset-0 h-[60vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-20">
          <nav className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </nav>

          <div className="max-w-4xl">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              <Sparkles className="w-3 h-3 mr-2" />
              Building the Future
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              2025-2026 Roadmap
            </h1>

            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              We're building intelligent tools that democratize technology—making enterprise-grade AI accessible to developers, 
              agencies, and businesses of all sizes.
            </p>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[hsl(var(--system-green))]" />
                <span>2 Projects Launching Q1</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                <span>6 In Development</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[hsl(var(--system-amber))]" />
                <span>8 Planned for 2025-2026</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Timeline */}
      <section className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto space-y-16">
          {quarters.map((quarter, qIndex) => (
            <div key={quarter.period}>
              {/* Quarter Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="px-6 py-3 rounded-full bg-card border border-border">
                  <h2 className="text-2xl font-bold text-primary">
                    {quarter.period}
                  </h2>
                </div>
                <div className="h-px flex-1 bg-border" />
                <span className="text-sm text-muted-foreground uppercase tracking-wider">{quarter.status}</span>
              </div>

              {/* Quarter Items */}
              <div className="grid md:grid-cols-2 gap-6">
                {quarter.items.map((item) => (
                  <article
                    key={item.title}
                    className="group p-8 rounded-lg bg-card border border-border hover:border-primary/40 transition-all"
                  >
                    {/* Icon & Status */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <item.icon className="w-7 h-7 text-primary" />
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium ${statusColors[item.status as keyof typeof statusColors]}`}>
                        {item.status}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-3 text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {item.description}
                    </p>

                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2">
                      {item.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 text-xs font-medium rounded-full bg-muted text-muted-foreground border border-border"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Earth Window */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        <img 
          src={neuralImage}
          alt="Abstract neural network visualization representing future AI capabilities"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
            <p className="text-2xl md:text-4xl font-light text-foreground drop-shadow-lg">
              "Technology that works for everyone."
            </p>
          </blockquote>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Our Development Philosophy
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="bg-card border border-border p-6 rounded-lg">
              <h3 className="font-semibold mb-2 text-primary">AI-First</h3>
              <p className="text-sm text-muted-foreground">
                Every tool leverages cutting-edge AI to automate, optimize, and adapt to user needs.
              </p>
            </div>
            <div className="bg-card border border-border p-6 rounded-lg">
              <h3 className="font-semibold mb-2 text-primary">Accessible</h3>
              <p className="text-sm text-muted-foreground">
                Enterprise power with startup simplicity. Technology that works for everyone.
              </p>
            </div>
            <div className="bg-card border border-border p-6 rounded-lg">
              <h3 className="font-semibold mb-2 text-primary">Integrated</h3>
              <p className="text-sm text-muted-foreground">
                All our tools communicate seamlessly, creating a unified development experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6 text-foreground">
            Be Part of the Journey
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join early adopters shaping the future of intelligent software. Get exclusive access to new tools as we build them.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Get Early Access
                <Rocket className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/about">
              <Button size="lg" variant="outline">
                Learn More
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
