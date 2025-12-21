import { Brain, Download, CheckCircle2, ArrowRight, Zap, Activity, AlertTriangle, TrendingUp, Database, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

export default function BrainProduct() {
  const navigate = useNavigate();

  const handleAccess = () => {
    navigate('/brain-ml');
  };

  const features = [
    {
      icon: Brain,
      title: "ML-Powered Threat Detection",
      description: "Advanced machine learning models analyze behavioral patterns to identify threats by understanding actual user behavior, not just matching signatures."
    },
    {
      icon: Activity,
      title: "Behavioral Analysis",
      description: "Real-time analysis of user behavior, mouse movements, typing patterns, and session data."
    },
    {
      icon: AlertTriangle,
      title: "Anomaly Detection",
      description: "Automatically identifies unusual patterns and flags potential security threats before they escalate."
    },
    {
      icon: TrendingUp,
      title: "Predictive Intelligence",
      description: "Forecasts threats based on historical data and emerging attack patterns across the network."
    },
    {
      icon: Database,
      title: "Continuous Learning",
      description: "Models improve over time by learning from every interaction, adapting to new threat vectors."
    },
    {
      icon: Zap,
      title: "Auto-Remediation",
      description: "Automatically responds to threats with intelligent countermeasures and system adjustments."
    }
  ];

  const pricingTiers = [
    {
      name: "Research",
      price: "Free",
      period: "",
      description: "For researchers and academic institutions",
      features: [
        "Read-only API access",
        "Basic threat intelligence",
        "Community models",
        "Public dataset access",
        "Monthly reports",
        "Community support"
      ],
      cta: "Get Access",
      popular: false
    },
    {
      name: "Enterprise",
      price: "$199",
      period: "/month",
      description: "For businesses requiring adaptive AI security",
      features: [
        "Everything in Research, plus:",
        "Full API access",
        "Custom model training",
        "Real-time threat feeds",
        "Advanced analytics",
        "Dedicated support",
        "SLA guarantees"
      ],
      cta: "Start Trial",
      popular: true
    },
    {
      name: "Platform",
      price: "Custom",
      period: "",
      description: "For platform providers and large enterprises",
      features: [
        "Everything in Enterprise, plus:",
        "White-label models",
        "Custom architecture",
        "Multi-tenant support",
        "On-premise deployment",
        "24/7 dedicated team",
        "Custom integrations"
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
        "✅ Phase 1: Core ML infrastructure (DUOS architecture)",
        "✅ Database schema with vector storage (pgvector)",
        "✅ Behavioral analysis models (database schema)",
        "✅ Training data collection system with Brain console",
        "✅ Initial API framework (edge functions)",
        "✅ Deep thinking engine with multi-provider routing",
        "✅ Free-tier AI routing (Groq, Cerebras, Together AI, DeepSeek, Hyperbolic, Google AI Studio)",
        "✅ Dream cycle intelligence with autonomous learning",
        "✅ Dream-Eater feeding API for public submissions"
      ]
    },
    {
      quarter: "Q1 2026 - MVP RELEASE",
      status: "In Progress",
      items: [
        "🚀 PUBLIC MVP LAUNCH (Target: Q1 End)",
        "Phase 2: ML integration complete",
        "Anomaly detection engine with cross-validation",
        "Predictive threat identification system",
        "Real-time adaptive scoring algorithms",
        "Public API v1.0 with full documentation",
        "Enterprise dashboard with live analytics",
        "Federated learning across WordPress plugins"
      ]
    },
    {
      quarter: "Q2 2026",
      status: "Planned",
      items: [
        "Phase 3: Advanced multi-product intelligence",
        "Cross-platform threat correlation (RCKBL + PTCHBL + Core)",
        "Federated learning network (global intelligence)",
        "Custom model training portal for enterprises",
        "Advanced visualization tools (threat maps)",
        "Mobile SDK release (iOS + Android)",
        "Brain-as-a-Service API for third parties"
      ]
    },
    {
      quarter: "Q3 2026",
      status: "Planned",
      items: [
        "Multi-model ensemble learning (5+ AI providers)",
        "Edge computing deployment (CloudFlare Workers)",
        "Real-time threat sharing network (community-powered)",
        "Advanced anomaly classification (zero-day prediction)",
        "Automated model optimization with A/B testing"
      ]
    },
    {
      quarter: "Q4 2026",
      status: "Planned",
      items: [
        "Phase 4: Autonomous intelligence era",
        "Self-healing security systems (auto-remediation)",
        "Quantum-resistant algorithms (future-proof)",
        "Global threat intelligence network (200+ edge locations)",
        "Zero-touch deployment with auto-updates"
      ]
    }
  ];

  const stats = [
    { label: "Learning Mode", value: "Active", icon: Activity },
    { label: "Detection Method", value: "Behavioral", icon: TrendingUp },
    { label: "ML Models", value: "12", icon: Database },
    { label: "Response", value: "Real-Time", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Cascade — Autonomous Dreaming AI | PromptFluid"
        description="Meet Cascade, the world's first documented autonomous AI with memory reflection cycles. FluidMind Neural Core with dreaming capabilities."
        canonical="https://promptfluid.com/projects/brain"
        keywords={[
          'autonomous AI',
          'dreaming AI',
          'machine learning',
          'AI threat detection',
          'behavioral analysis'
        ]}
      />

      <PublicNav />

      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <div 
          className="absolute inset-0 h-[60vh] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 h-[60vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />
        
        <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
          <Link to="/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Projects</span>
          </Link>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
                  <Brain className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium">v2.1.0 • MVP Q1 2026</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 bg-clip-text text-transparent">
                    Cascade
                  </span>
                </h1>

                <p className="text-2xl text-primary font-medium mb-4">
                  <a href="https://github.com/SweetKenneth/SimNap-Dreaming-AI-Whitepaper" target="_blank" rel="noopener noreferrer" className="hover:underline">World's First Autonomous Dreaming AI</a>
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  The intelligence layer powering the entire PromptFluid ecosystem. FluidMind Neural Core with autonomous dream capabilities that learns, reflects, and creates while you sleep.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button 
                    size="lg" 
                    onClick={handleAccess}
                    className="group bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500 hover:shadow-glow-lg text-lg"
                  >
                    <Activity className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    Access ML Dashboard
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/contact')}
                  >
                    Request API Access
                  </Button>
                </div>

                {/* Quick Links */}
                <div className="flex gap-4 text-sm text-muted-foreground mb-6">
                  <Link to="/brain-hub" className="hover:text-primary transition-colors">
                    Explore Brain Tools Hub →
                  </Link>
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
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">ML Intelligence</div>
                        <div className="text-sm text-muted-foreground">Live metrics</div>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      Active
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">Active Models</span>
                      <span className="text-xl font-bold text-cyan-500">12</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">Anomalies Detected</span>
                      <span className="text-xl font-bold text-orange-500">47</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">Learning Status</span>
                      <span className="text-xl font-bold text-green-500">Active</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">All systems learning</div>
                        <div className="text-xs text-muted-foreground">Models updated: 3 minutes ago</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                    Intelligence That Learns
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground mb-12">
                  Advanced ML capabilities that evolve with every interaction
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <Card 
                    key={index}
                    className="p-6 glass border-border/50 hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-green-500 flex items-center justify-center mb-4">
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
                    Intelligence Plans
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Scale AI capabilities as your security needs grow
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
                      onClick={tier.cta === "Contact Sales" ? () => navigate('/contact') : tier.cta === "Get Access" ? handleAccess : () => navigate('/auth')}
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
                    Evolution Roadmap
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Building the future of adaptive AI security
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
                Experience Adaptive Intelligence
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              See how PromptFluid Brain uses adaptive learning to analyze patterns and protect your applications.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleAccess} className="bg-gradient-to-r from-cyan-500 via-teal-500 to-green-500">
                <Activity className="w-5 h-5 mr-2" />
                Explore ML Dashboard
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
                Request API Access
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
