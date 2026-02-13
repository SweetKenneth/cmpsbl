import { Code2, Download, CheckCircle2, ArrowRight, Zap, Layers, Globe, Package, Sparkles, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";

export default function StudioProduct() {
  const navigate = useNavigate();

  const handleWaitlist = () => {
    toast.success("You're on the waitlist!", {
      description: "We'll notify you when Studio launches"
    });
  };

  const features = [
    {
      icon: Code2,
      title: "AI Code Generation",
      description: "Natural language to production code. Describe what you want, Studio builds it with best practices automatically."
    },
    {
      icon: Zap,
      title: "Instant Deployment",
      description: "Push to production in seconds. Integrated CI/CD pipeline handles everything from build to deployment."
    },
    {
      icon: Layers,
      title: "Component Library",
      description: "Pre-built, accessible, and responsive components. Drag, drop, customize, and deploy instantly."
    },
    {
      icon: Globe,
      title: "Multi-Platform Export",
      description: "Export to React, Vue, Angular, or vanilla JavaScript. One codebase, multiple deployment targets."
    },
    {
      icon: Package,
      title: "Built-in Optimization",
      description: "Automatic code splitting, lazy loading, image optimization, and performance tuning built-in."
    },
    {
      icon: Sparkles,
      title: "Smart Refactoring",
      description: "AI analyzes your code for improvements. Suggests optimizations, security fixes, and best practices."
    }
  ];

  const pricingTiers = [
    {
      name: "Developer",
      price: "$29",
      period: "/month",
      description: "Perfect for indie developers and side projects",
      features: [
        "5 active projects",
        "AI code generation (50 requests/day)",
        "Instant deployment to Vercel/Netlify",
        "Component library access",
        "Basic analytics",
        "Community support"
      ],
      cta: "Join Waitlist",
      popular: false
    },
    {
      name: "Professional",
      price: "$79",
      period: "/month",
      description: "For professional developers and small teams",
      features: [
        "Everything in Developer, plus:",
        "Unlimited projects",
        "AI code generation (500 requests/day)",
        "Multi-platform export",
        "Advanced analytics",
        "Version control integration",
        "Priority support"
      ],
      cta: "Join Waitlist",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For agencies and large development teams",
      features: [
        "Everything in Professional, plus:",
        "White-label deployment",
        "Custom component libraries",
        "Unlimited AI requests",
        "Self-hosted option",
        "SLA guarantees",
        "Dedicated support"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const roadmap = [
    {
      quarter: "Q4 2025",
      status: "Completed",
      items: [
        "Core architecture design",
        "AI code generation engine prototype",
        "Component library foundation",
        "Initial deployment pipeline",
        "Beta testing framework"
      ]
    },
    {
      quarter: "Q1 2026",
      status: "In Progress",
      items: [
        "Private beta launch (invite-only)",
        "React component library (200+ components)",
        "Vercel/Netlify integration",
        "AI prompt refinement",
        "Performance optimization engine"
      ]
    },
    {
      quarter: "Q2 2026 - MVP RELEASE",
      status: "Planned",
      items: [
        "🚀 PUBLIC MVP LAUNCH",
        "Multi-platform export (React, Vue, Angular)",
        "Advanced code generation (full apps)",
        "Team collaboration features",
        "Git integration (GitHub, GitLab)",
        "Analytics dashboard"
      ]
    },
    {
      quarter: "Q3 2026",
      status: "Planned",
      items: [
        "Mobile app builder",
        "Custom design system creator",
        "A/B testing integration",
        "Advanced deployment strategies",
        "AI-powered testing automation"
      ]
    },
    {
      quarter: "Q4 2026",
      status: "Planned",
      items: [
        "Database schema designer",
        "API endpoint generator",
        "Microservices architecture support",
        "Enterprise features (SSO, RBAC)",
        "White-label platform"
      ]
    }
  ];

  const stats = [
    { label: "Status", value: "Planned", icon: Star },
    { label: "Components Target", value: "200+", icon: Layers },
    { label: "Target Build Time", value: "<5min", icon: Zap },
    { label: "Target Quality Score", value: "98/100", icon: Code2 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <SEO 
        title="CMPSBL Studio — Rapid Application Builder | AI-Powered"
        description="Build production-ready applications in minutes with CMPSBL Studio. AI-powered code generation, instant deployment, and 200+ pre-built components."
        canonical="https://cmpsbl.com/projects/studio"
        keywords={[
          'rapid application development',
          'AI code generation',
          'no-code platform',
          'low-code builder',
          'instant deployment',
          'component library',
          'React builder',
          'Vue builder',
          'Angular builder',
          'AI app builder',
          'automatic deployment',
          'web application builder',
          'development automation',
          'code generation AI',
          'rapid prototyping'
        ]}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-indigo-500/10" />
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <Link to="/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Projects</span>
          </Link>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
                  <Code2 className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium">Beta • Coming Q2 2026</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
                    PromptFluid Studio
                  </span>
                </h1>

                <p className="text-2xl text-primary font-medium mb-4">
                  Rapid Application Builder
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Transform ideas into production applications in minutes. AI-powered code generation, instant deployment, and a comprehensive component library make development effortless.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button 
                    size="lg" 
                    onClick={handleWaitlist}
                    className="group bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:shadow-glow-lg text-lg"
                  >
                    <Star className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Join Beta Waitlist
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/contact')}
                  >
                    Request Demo
                  </Button>
                </div>

                <div className="flex flex-wrap gap-6">
                  {stats.slice(0, 2).map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2">
                      <stat.icon className="w-5 h-5 text-primary" />
                      <div>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <div className="text-sm text-muted-foreground">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="glass rounded-3xl p-8 border-2 border-primary/20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center">
                        <Code2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">Build Dashboard</div>
                        <div className="text-sm text-muted-foreground">Active project</div>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      Building
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Code Generation</span>
                        <span className="text-xs text-green-500">Complete</span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-green-400 w-full"></div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Optimization</span>
                        <span className="text-xs text-blue-500">Running</span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Deployment</span>
                        <span className="text-xs text-muted-foreground">Pending</span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-gray-500 to-gray-400 w-1/4"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">Est. completion: 2 minutes</div>
                        <div className="text-xs text-muted-foreground">Your app will be live soon</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="features" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-12">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
            </TabsList>

            <TabsContent value="features" className="space-y-8">
              <div>
                <h2 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                    Build Faster Than Ever
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground mb-12">
                  AI-powered development tools that transform how you build applications
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <Card 
                    key={index}
                    className="p-6 glass border-border/50 hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                    Early Bird Pricing
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Lock in beta pricing. First 1,000 users get 50% off forever.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {pricingTiers.map((tier, index) => (
                  <Card 
                    key={index}
                    className={`p-8 glass relative ${
                      tier.popular 
                        ? 'border-primary shadow-glow' 
                        : 'border-border/50'
                    }`}
                  >
                    {tier.popular && (
                      <Badge className="absolute top-4 right-4 bg-primary">
                        Most Popular
                      </Badge>
                    )}

                    <div className="mb-6">
                      <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className="text-4xl font-bold">{tier.price}</span>
                        <span className="text-muted-foreground">{tier.period}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{tier.description}</p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button 
                      className="w-full"
                      variant={tier.popular ? "default" : "outline"}
                      onClick={tier.cta === "Contact Sales" ? () => navigate('/contact') : handleWaitlist}
                    >
                      {tier.cta}
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="roadmap" className="space-y-8">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                    Development Roadmap
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Our journey to revolutionizing application development
                </p>
              </div>

              <div className="space-y-6">
                {roadmap.map((quarter, index) => (
                  <Card key={index} className={`p-8 glass ${quarter.quarter.includes('MVP') ? 'border-2 border-primary shadow-glow' : 'border-border/50'}`}>
                    <div className="flex items-center gap-4 mb-6">
                      <Calendar className="w-6 h-6 text-primary" />
                      <div>
                        <h3 className="text-2xl font-bold">{quarter.quarter}</h3>
                        <Badge 
                          variant="outline"
                          className={
                            quarter.status === "Completed" 
                              ? "border-green-500 text-green-500" 
                              : quarter.status === "In Progress"
                              ? "border-blue-500 text-blue-500"
                              : "border-gray-500 text-gray-500"
                          }
                        >
                          {quarter.status}
                        </Badge>
                      </div>
                    </div>

                    <ul className="space-y-3">
                      {quarter.items.map((item, i) => (
                        <li key={i} className="flex items-start gap-3">
                          {quarter.status === "Completed" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          ) : quarter.status === "In Progress" ? (
                            <Zap className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                          ) : item.includes('🚀') ? (
                            <Star className="w-5 h-5 text-primary fill-primary flex-shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <span className={item.includes('🚀') ? 'font-bold text-primary' : 'text-muted-foreground'}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Final CTA */}
          <div className="mt-20 text-center p-12 rounded-3xl glass border border-primary/20">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                Be First to Build
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the waitlist for early access to Studio when we launch in Q2 2026.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleWaitlist} className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500">
                <Star className="w-5 h-5 mr-2" />
                Join Beta Waitlist
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
                Talk to Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
