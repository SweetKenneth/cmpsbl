import { Zap, CheckCircle2, ArrowRight, Network, Webhook, Globe, ShieldCheck, Activity, Calendar, Star, Code } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";

export default function RippleProduct() {
  const navigate = useNavigate();

  const handleWaitlist = () => {
    toast.success("You're on the waitlist!", {
      description: "We'll notify you when Ripple launches"
    });
  };

  const features = [
    {
      icon: Network,
      title: "API Gateway & Router",
      description: "Intelligent routing to optimal AI providers. Automatic failover, load balancing, and request optimization."
    },
    {
      icon: Webhook,
      title: "Real-Time Webhooks",
      description: "Event-driven architecture with instant notifications. Subscribe to any system event across the platform."
    },
    {
      icon: Globe,
      title: "Service Mesh Integration",
      description: "Seamless connectivity between all PromptFluid products. Unified data flow and cross-service communication."
    },
    {
      icon: ShieldCheck,
      title: "Secure Authentication",
      description: "Built-in OAuth2, JWT, and API key management. Enterprise-grade security for all integrations."
    },
    {
      icon: Activity,
      title: "Queue Management",
      description: "Asynchronous task processing with priority queues. Handle millions of jobs efficiently."
    },
    {
      icon: Code,
      title: "Event Streaming",
      description: "Real-time data streams between services. WebSocket support for live updates and notifications."
    }
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "$29",
      period: "/month",
      description: "For individual developers and small projects",
      features: [
        "100K API calls/month",
        "5 webhook endpoints",
        "Basic authentication",
        "Community support",
        "Standard rate limits",
        "Email notifications"
      ],
      cta: "Join Waitlist",
      popular: false
    },
    {
      name: "Professional",
      price: "$99",
      period: "/month",
      description: "For growing businesses with scaling needs",
      features: [
        "Everything in Starter, plus:",
        "1M API calls/month",
        "Unlimited webhooks",
        "Advanced authentication (OAuth2)",
        "Priority support",
        "Custom rate limits",
        "Slack/Discord integration"
      ],
      cta: "Join Waitlist",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with custom requirements",
      features: [
        "Everything in Professional, plus:",
        "Unlimited API calls",
        "Dedicated infrastructure",
        "Custom integrations",
        "SLA guarantees",
        "24/7 dedicated support",
        "On-premise deployment option"
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
        "API gateway prototype",
        "Basic routing logic",
        "Initial webhook system",
        "Security framework"
      ]
    },
    {
      quarter: "Q1 2026 - MVP RELEASE",
      status: "In Progress",
      items: [
        "🚀 PUBLIC MVP LAUNCH",
        "API gateway (v1.0)",
        "Intelligent provider routing",
        "Real-time webhook delivery",
        "OAuth2 authentication",
        "Queue management system",
        "Basic analytics dashboard"
      ]
    },
    {
      quarter: "Q2 2026",
      status: "Planned",
      items: [
        "Event streaming platform",
        "Advanced load balancing",
        "Multi-region deployment",
        "Custom middleware support",
        "GraphQL API layer",
        "Enhanced monitoring"
      ]
    },
    {
      quarter: "Q3 2026",
      status: "Planned",
      items: [
        "Service mesh full deployment",
        "Cross-platform synchronization",
        "Advanced caching strategies",
        "API versioning system",
        "Developer portal"
      ]
    },
    {
      quarter: "Q4 2026",
      status: "Planned",
      items: [
        "Enterprise features (SSO, RBAC)",
        "On-premise deployment option",
        "Custom plugin marketplace",
        "Advanced analytics & insights",
        "Global CDN integration"
      ]
    }
  ];

  const stats = [
    { label: "Avg Latency", value: "<15ms", icon: Zap },
    { label: "Active Webhooks", value: "Active", icon: Webhook }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <SEO 
        title="PromptFluid Ripple — Network Integration Hub | API Gateway & Service Mesh"
        description="Unified platform where all PromptFluid tools communicate seamlessly. API orchestration, real-time webhooks, and intelligent routing. Connect everything."
        canonical="https://promptfluid.com/projects/ripple"
        keywords={[
          'API gateway',
          'service mesh',
          'API orchestration',
          'webhook integration',
          'real-time events',
          'microservices',
          'API router',
          'integration platform',
          'event streaming',
          'API management',
          'service integration',
          'webhook delivery',
          'cross-service communication',
          'distributed systems',
          'API automation'
        ]}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-red-500/10 to-pink-500/10" />
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <Link to="/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Projects</span>
          </Link>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
                  <Zap className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium">Alpha • MVP Q1 2026</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                    PromptFluid Ripple
                  </span>
                </h1>

                <p className="text-2xl text-primary font-medium mb-4">
                  Network Integration Hub
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  The connective tissue of the PromptFluid ecosystem. Intelligent API routing, real-time webhooks, and seamless data flow between all products and services.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button 
                    size="lg" 
                    onClick={handleWaitlist}
                    className="group bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 hover:shadow-glow-lg text-lg"
                  >
                    <Star className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Join Alpha Waitlist
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
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center">
                        <Network className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">Network Status</div>
                        <div className="text-sm text-muted-foreground">Live metrics</div>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      Operational
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">API Requests (24h)</span>
                        <span className="text-xs text-green-500">+12% ↑</span>
                      </div>
                      <div className="text-2xl font-bold">2.5M</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Webhook Status</span>
                        <span className="text-xs text-blue-500">Demo</span>
                      </div>
                      <div className="text-2xl font-bold">Active</div>
                      <div className="text-xs text-muted-foreground">monitoring enabled</div>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Avg Response Time</span>
                        <span className="text-xs text-purple-500">&lt;15ms</span>
                      </div>
                      <div className="w-full h-2 bg-background rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 w-11/12"></div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">All systems operational</div>
                        <div className="text-xs text-muted-foreground">Last incident: 0 days ago</div>
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
                    Connect Everything
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground mb-12">
                  Powerful integration capabilities that make your services work as one
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <Card 
                    key={index}
                    className="p-6 glass border-border/50 hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center mb-4">
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
                    Scale Your Integrations
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Flexible pricing that grows with your API usage
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
                    Integration Roadmap
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Building the ultimate connectivity platform
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
                Ready to Connect?
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the alpha program and help shape the future of API integration. Limited spots available.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleWaitlist} className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500">
                <Star className="w-5 h-5 mr-2" />
                Join Alpha Program
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
                Talk to Integration Team
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
