import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Brain, Zap, Globe, Accessibility, Store, Rocket, CheckCircle2, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

export default function Roadmap() {
  const quarters = [
    {
      period: "Q1 2025",
      status: "In Progress",
      items: [
        {
          icon: Shield,
          title: "PromptFluid Defense - WordPress Plugin",
          description: "AI-powered bot detection and threat intelligence for WordPress. Advanced behavioral analysis, adaptive CAPTCHA, and real-time threat blocking. Launching on WordPress.org.",
          status: "Launch Ready",
          technologies: ["Machine Learning", "Behavioral Analysis", "Fingerprinting", "PHP", "React"]
        },
        {
          icon: Brain,
          title: "Autonomous Learning Engine",
          description: "Self-improving AI that learns from every interaction. Adapts security patterns, optimizes performance, and predicts threats before they materialize.",
          status: "Active Development",
          technologies: ["Neural Networks", "Vector Embeddings", "Reinforcement Learning"]
        }
      ]
    },
    {
      period: "Q2 2025",
      status: "Planned",
      items: [
        {
          icon: Zap,
          title: "Rapid Application Builder",
          description: "Transform ideas into production applications in minutes. AI-assisted development with automatic security, optimization, and deployment built-in.",
          status: "Design Phase",
          technologies: ["React", "Next.js", "AI Code Generation", "Vercel Edge"]
        },
        {
          icon: Accessibility,
          title: "Universal Accessibility Suite",
          description: "Automated WCAG compliance, intelligent alt-text generation, and inclusive design tools. Making every website accessible to everyone.",
          status: "Research",
          technologies: ["Computer Vision", "NLP", "WCAG 2.2", "ARIA"]
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
          technologies: ["GPT-4", "Claude", "SEO AI", "Market Intelligence"]
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
    "Launch Ready": "text-green-500 bg-green-500/10 border-green-500/20",
    "Active Development": "text-blue-500 bg-blue-500/10 border-blue-500/20",
    "Design Phase": "text-purple-500 bg-purple-500/10 border-purple-500/20",
    "Research": "text-orange-500 bg-orange-500/10 border-orange-500/20",
    "Concept": "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    "Planning": "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    "Roadmap": "text-pink-500 bg-pink-500/10 border-pink-500/20"
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
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

      {/* Animated background */}
      <div className="fixed inset-0 opacity-30 dark:opacity-20" style={{ background: 'var(--gradient-mesh)' }} />
      <div className="fixed top-20 left-10 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse" />
      <div className="fixed bottom-20 right-10 w-96 h-96 bg-primary-variant/20 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Navigation */}
      <PublicNav />

      {/* Header */}
      <header className="relative z-10 container mx-auto px-4 py-20">
        <nav className="mb-12">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            ← Back to Home
          </Link>
        </nav>

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Building the Future
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              2025-2026 Roadmap
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-8 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            We're building intelligent tools that democratize technology—making enterprise-grade AI accessible to developers, 
            agencies, and businesses of all sizes. Here's what's flowing through our development pipeline.
          </p>

          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span>2 Projects Launching Q1</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>6 In Development</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              <span>8 Planned for 2025-2026</span>
            </div>
          </div>
        </div>
      </header>

      {/* Roadmap Timeline */}
      <section className="relative z-10 container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto space-y-16">
          {quarters.map((quarter, qIndex) => (
            <div key={quarter.period} className="animate-fade-in" style={{ animationDelay: `${qIndex * 0.1}s` }}>
              {/* Quarter Header */}
              <div className="flex items-center gap-4 mb-8">
                <div className="glass px-6 py-3 rounded-full border border-primary/20">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                    {quarter.period}
                  </h2>
                </div>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/50 via-primary-variant/50 to-transparent" />
                <span className="text-sm text-muted-foreground uppercase tracking-wider">{quarter.status}</span>
              </div>

              {/* Quarter Items */}
              <div className="grid md:grid-cols-2 gap-6">
                {quarter.items.map((item, iIndex) => (
                  <article
                    key={item.title}
                    className="group p-8 rounded-2xl glass border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-elegant"
                    style={{ animationDelay: `${(qIndex * 0.1) + (iIndex * 0.05)}s` }}
                  >
                    {/* Icon & Status */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                        <item.icon className="w-7 h-7 text-primary-foreground" />
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-medium ${statusColors[item.status as keyof typeof statusColors]}`}>
                        {item.status}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
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
                          className="px-3 py-1 text-xs font-medium rounded-full bg-muted/50 text-muted-foreground border border-border/50"
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

      {/* Philosophy Section */}
      <section className="relative z-10 container mx-auto px-4 py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Our Development Philosophy
            </span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <div className="glass p-6 rounded-xl">
              <h3 className="font-semibold mb-2 text-primary">AI-First</h3>
              <p className="text-sm text-muted-foreground">
                Every tool leverages cutting-edge AI to automate, optimize, and adapt to user needs.
              </p>
            </div>
            <div className="glass p-6 rounded-xl">
              <h3 className="font-semibold mb-2 text-primary">Accessible</h3>
              <p className="text-sm text-muted-foreground">
                Enterprise power with startup simplicity. Technology that works for everyone.
              </p>
            </div>
            <div className="glass p-6 rounded-xl">
              <h3 className="font-semibold mb-2 text-primary">Integrated</h3>
              <p className="text-sm text-muted-foreground">
                All our tools communicate seamlessly, creating a unified development experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center p-12 md:p-16 rounded-3xl glass border border-primary/20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary-variant/10 to-accent/10" />
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                Be Part of the Journey
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join early adopters shaping the future of intelligent software. Get exclusive access to new tools as we build them.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button 
                  size="lg"
                  className="group relative overflow-hidden bg-gradient-to-r from-primary via-primary-variant to-accent text-lg px-8 py-6 hover:shadow-glow-lg transition-all duration-300"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Early Access
                    <Rocket className="w-5 h-5 group-hover:translate-y-[-4px] transition-transform" />
                  </span>
                </Button>
              </Link>
              <Link to="/about">
                <Button 
                  size="lg"
                  variant="outline"
                  className="group text-lg px-8 py-6 border-2 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                >
                  <span className="flex items-center gap-2">
                    Learn More
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <EnhancedFooter />
    </div>
  );
}
