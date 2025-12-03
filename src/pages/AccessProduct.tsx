import { Globe, CheckCircle2, ArrowRight, Eye, Keyboard, MousePointer, Type, CheckSquare, Calendar, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";

export default function AccessProduct() {
  const navigate = useNavigate();

  const handleWaitlist = () => {
    toast.success("You're on the waitlist!", {
      description: "We'll notify you when Access launches"
    });
  };

  const features = [
    {
      icon: Eye,
      title: "Screen Reader Optimization",
      description: "Automatically generates semantic HTML and ARIA labels for perfect screen reader compatibility."
    },
    {
      icon: Keyboard,
      title: "Keyboard Navigation",
      description: "Ensures all interactive elements are keyboard accessible with proper focus management and shortcuts."
    },
    {
      icon: Type,
      title: "Alt Text Generation",
      description: "AI-powered image descriptions that meet WCAG guidelines. Automatic alt text for all visuals."
    },
    {
      icon: MousePointer,
      title: "Touch Target Sizing",
      description: "Automatically adjusts interactive elements to meet 44x44px minimum touch target requirements."
    },
    {
      icon: CheckSquare,
      title: "Automated WCAG Testing",
      description: "Continuous compliance monitoring against WCAG 2.1 Level AA and AAA standards."
    },
    {
      icon: Globe,
      title: "Color Contrast Analyzer",
      description: "Real-time color contrast checking and automatic adjustments for optimal readability."
    }
  ];

  const pricingTiers = [
    {
      name: "Starter",
      price: "$49",
      period: "/month",
      description: "For small businesses and startups",
      features: [
        "5 websites monitored",
        "Automated WCAG 2.1 AA compliance",
        "Basic accessibility reports",
        "Monthly audits",
        "Email support",
        "Community resources"
      ],
      cta: "Join Waitlist",
      popular: false
    },
    {
      name: "Professional",
      price: "$149",
      period: "/month",
      description: "For agencies and growing companies",
      features: [
        "Everything in Starter, plus:",
        "25 websites monitored",
        "WCAG 2.1 AAA compliance",
        "Advanced analytics",
        "Weekly audits",
        "Priority support",
        "API access"
      ],
      cta: "Join Waitlist",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large organizations with compliance needs",
      features: [
        "Everything in Professional, plus:",
        "Unlimited websites",
        "Custom compliance frameworks",
        "Dedicated accessibility specialist",
        "Daily audits",
        "Legal compliance reports",
        "White-label options"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  const roadmap = [
    {
      quarter: "Q1 2026",
      status: "In Progress",
      items: [
        "Core accessibility framework",
        "WCAG 2.1 compliance engine",
        "Basic screen reader testing",
        "Color contrast analyzer",
        "Initial API design"
      ]
    },
    {
      quarter: "Q2 2026",
      status: "Planned",
      items: [
        "AI-powered alt text generation",
        "Keyboard navigation testing",
        "Touch target analyzer",
        "Automated remediation suggestions",
        "Beta testing program launch"
      ]
    },
    {
      quarter: "Q3 2026 - MVP RELEASE",
      status: "Planned",
      items: [
        "🚀 PUBLIC MVP LAUNCH",
        "Full WCAG 2.1 AA compliance",
        "Real-time monitoring dashboard",
        "Automated testing suite",
        "Screen reader emulation",
        "Compliance reporting",
        "WordPress plugin"
      ]
    },
    {
      quarter: "Q4 2026",
      status: "Planned",
      items: [
        "WCAG 2.1 AAA support",
        "Multi-language accessibility",
        "Advanced analytics",
        "Browser extension",
        "Slack/Teams integration"
      ]
    },
    {
      quarter: "Q1 2027",
      status: "Planned",
      items: [
        "AI-powered remediation (auto-fix)",
        "Custom compliance frameworks",
        "Legal compliance templates",
        "Developer training platform",
        "Enterprise audit tools"
      ]
    }
  ];

  const stats = [
    { label: "WCAG Guidelines", value: "78", icon: CheckSquare },
    { label: "Compliance Rate", value: "94%", icon: CheckCircle2 },
    { label: "Issues Detected", value: "2.5K+", icon: Eye },
    { label: "Avg Fix Time", value: "<5min", icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <SEO 
        title="PromptFluid Access — Universal Accessibility Platform | WCAG Compliance"
        description="Make the web accessible to everyone. Automated WCAG compliance, AI-powered alt text, screen reader optimization, and continuous accessibility monitoring."
        canonical="https://promptfluid.com/projects/access"
        keywords={[
          'web accessibility',
          'WCAG compliance',
          'accessibility testing',
          'screen reader optimization',
          'keyboard navigation',
          'alt text generator',
          'color contrast',
          'accessibility audit',
          'inclusive design',
          'ADA compliance',
          'Section 508',
          'accessibility automation',
          'WCAG 2.1',
          'accessibility tools',
          'digital accessibility'
        ]}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-violet-500/10 to-purple-500/10" />
        
        <div className="container mx-auto px-4 py-16 relative z-10">
          <Link to="/projects" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>Back to Projects</span>
          </Link>

          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
                  <Globe className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium">Coming Soon • MVP Q3 2026</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
                    PromptFluid Access
                  </span>
                </h1>

                <p className="text-2xl text-primary font-medium mb-4">
                  Universal Accessibility Platform
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Make the web accessible to everyone. Automated WCAG compliance, screen reader optimization, and tools that ensure your applications work for all users.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button 
                    size="lg" 
                    onClick={handleWaitlist}
                    className="group bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 hover:shadow-glow-lg text-lg"
                  >
                    <Star className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Join Waitlist
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => navigate('/contact')}
                  >
                    Request Information
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
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                        <Globe className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">Accessibility Score</div>
                        <div className="text-sm text-muted-foreground">Your website</div>
                      </div>
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
                      In Development
                    </Badge>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">WCAG 2.1 AA Compliance</span>
                      <span className="text-2xl font-bold text-green-500">94%</span>
                    </div>
                    <div className="w-full h-3 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 w-[94%]"></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Keyboard Navigation</span>
                      </div>
                      <span className="text-xs font-medium text-green-500">Passing</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Color Contrast</span>
                      </div>
                      <span className="text-xs font-medium text-green-500">Passing</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-yellow-500" />
                        <span className="text-sm">Alt Text Coverage</span>
                      </div>
                      <span className="text-xs font-medium text-yellow-500">87% (3 issues)</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">Coming Q3 2026</div>
                        <div className="text-xs text-muted-foreground">Automated compliance for all</div>
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
                    Accessibility for Everyone
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground mb-12">
                  Comprehensive tools to make your applications accessible to all users
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <Card 
                    key={index}
                    className="p-6 glass border-border/50 hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-4">
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
                    Compliance Made Simple
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Affordable accessibility for organizations of all sizes
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
                    Accessibility Roadmap
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Our journey to universal web accessibility
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
                            <Globe className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
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
                Make Your Site Accessible
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join the movement toward universal accessibility. Be notified when PromptFluid Access launches in Q3 2026.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleWaitlist} className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500">
                <Star className="w-5 h-5 mr-2" />
                Join Waitlist
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
