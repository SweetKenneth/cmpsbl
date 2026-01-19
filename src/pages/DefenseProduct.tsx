import { Shield, Download, CheckCircle2, ArrowRight, Zap, Brain, Lock, Activity, AlertTriangle, FileCode, Calendar, Star, ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import heroImage from "@/assets/hero/defense-shield-cyber.jpg";

export default function DefenseProduct() {
  const navigate = useNavigate();

  const handleDownload = async () => {
    try {
      toast.info("Generating WordPress plugin ZIP...");
      
      // Use environment variable for Supabase URL
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const response = await fetch(`${supabaseUrl}/functions/v1/pf-wordpress-generate-zip`);
      
      if (!response.ok) {
        throw new Error('Failed to generate plugin');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'promptfluid-rckbl-rockable.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success("WordPress plugin ZIP downloaded! Ready to upload.");
    } catch (error) {
      toast.error("Download failed. Please try again.");
      console.error('Download error:', error);
    }
  };

  const features = [
    {
      icon: Brain,
      title: "AI Bot Detection",
      description: "Behavioral analysis engine detects human vs. bot patterns with high accuracy"
    },
    {
      icon: Lock,
      title: "Smart Learning",
      description: "Adaptive thresholds learn your site's normal traffic patterns over time"
    },
    {
      icon: Shield,
      title: "Web Application Firewall",
      description: "8 default security rules protect against SQL injection, XSS, and RCE attacks"
    },
    {
      icon: Activity,
      title: "Login Guard",
      description: "Brute force protection with 5-attempt lockout and IP reputation tracking"
    },
    {
      icon: FileCode,
      title: "File Integrity Monitor",
      description: "Real-time monitoring of 1000+ WordPress core files for unauthorized changes"
    },
    {
      icon: AlertTriangle,
      title: "Malware Scanner",
      description: "13 threat signatures detect backdoors, webshells, and malicious code"
    }
  ];

  const pricingTiers = [
    {
      name: "Lite",
      price: "Free",
      period: "",
      description: "Perfect for personal blogs and small sites",
      features: [
        "AI-powered bot detection",
        "Behavioral analysis",
        "Basic analytics dashboard",
        "Threat logging",
        "Community support"
      ],
      cta: "Download Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "/month",
      description: "For growing businesses and professional sites",
      features: [
        "Everything in Lite, plus:",
        "Real-time threat blocking",
        "Web application firewall (8 rules)",
        "Login guard with brute force protection",
        "File integrity monitoring",
        "Weekly malware scans",
        "Priority email support"
      ],
      cta: "Start Pro Trial",
      popular: true
    },
    {
      name: "Complete",
      price: "$39",
      period: "/month",
      description: "Enterprise-grade security for mission-critical sites",
      features: [
        "Everything in Pro, plus:",
        "Auto-remediation system",
        "Red team simulator",
        "Daily malware scans",
        "AI configuration tuning",
        "Advanced threat analytics",
        "Priority support (24/7)"
      ],
      cta: "Start Complete Trial",
      popular: false
    }
  ];

  const roadmap = [
    {
      quarter: "Q4 2025",
      status: "Completed",
      items: [
        "✅ Initial release with core bot detection",
        "✅ WordPress.org marketplace submission",
        "✅ File integrity monitoring (1000+ core files)",
        "✅ Malware scanner with 13 threat signatures",
        "✅ Smart learning system with adaptive thresholds",
        "✅ React admin dashboard with real-time analytics",
        "✅ Modular architecture with security-invoker RLS",
        "✅ Complete documentation and submission package"
      ]
    },
    {
      quarter: "Q1 2026",
      status: "In Progress - WordPress.org Approval Pending",
      items: [
        "🔄 WordPress.org approval process active",
        "🔄 PTCHBL (Patchable) (accessibility) submission queued",
        "Advanced threat intelligence integration",
        "Custom rule builder for firewall",
        "Multi-site license management",
        "Enhanced behavioral tracking dashboard",
        "API v2 with webhook support"
      ]
    },
    {
      quarter: "Q2 2026",
      status: "Planned",
      items: [
        "Cloud-based threat sharing network (global intelligence)",
        "Mobile app for remote monitoring",
        "Advanced reporting & analytics dashboard",
        "Integration with popular CDNs (Cloudflare, Fastly)",
        "Auto-update system for security patches",
        "WordPress multisite network support"
      ]
    },
    {
      quarter: "Q3 2026",
      status: "Planned",
      items: [
        "Machine learning model updates (quarterly)",
        "Zero-day exploit prediction engine",
        "Compliance reporting (GDPR, CCPA, HIPAA)",
        "White-label options for agencies",
        "Advanced API rate limiting with geo-routing",
        "Integration marketplace launch"
      ]
    }
  ];

  const stats = [
    { label: "Status", value: "Pre-Launch", icon: Shield },
    { label: "Marketplace", value: "Pending", icon: Download },
    { label: "Target Accuracy", value: "High", icon: Activity },
    { label: "Target Rating", value: "4.5+/5", icon: Star }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="RCKBL (Rockable) — AI-Powered WordPress Security | Official Download"
        description="Download RCKBL: Advanced AI-powered bot protection for WordPress. Stop credential stuffing, spam bots, and automated attacks with behavioral analysis."
        canonical="https://promptfluid.com/projects/defense"
        keywords={[
          'WordPress security plugin',
          'AI bot detection',
          'WordPress bot protection',
          'credential stuffing prevention',
          'malware scanner WordPress'
        ]}
      />

      <PublicNav />

      {/* Hero with Futuristic Defense Shield Visual */}
      <section className="relative w-full">
        <div 
          className="absolute inset-0 h-[60vh] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`,
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
              {/* Left: Info */}
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
                  <Shield className="w-4 h-4 text-primary animate-pulse" />
                  <span className="text-sm font-medium">v1.0.0 • WordPress Plugin</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
                    RCKBL (Rockable)
                  </span>
                </h1>

                <p className="text-2xl text-primary font-medium mb-4">
                  AI-Powered WordPress Security
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Stop sophisticated bot attacks before they reach your site. Advanced behavioral AI detects and blocks credential stuffing, spam bots, and automated attacks that traditional firewalls miss.
                </p>

                {/* Download CTA */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button 
                    size="lg" 
                    onClick={handleDownload}
                    className="group bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 hover:shadow-glow-lg text-lg"
                  >
                    <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                    Download Plugin
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => window.open('https://wordpress.org/plugins/promptfluid-rckbl/', '_blank')}
                  >
                    <ExternalLink className="w-5 h-5 mr-2" />
                    WordPress.org
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={() => window.open('https://github.com/promptfluid/rckbl', '_blank')}
                  >
                    <Github className="w-5 h-5 mr-2" />
                    GitHub
                  </Button>
                </div>

                {/* Quick Links */}
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <Link to="/threat-feed" className="hover:text-primary transition-colors">
                    View Live Threat Feed →
                  </Link>
                </div>

                {/* Quick Stats */}
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

              {/* Right: Visual */}
              <div className="relative">
                <div className="glass rounded-3xl p-8 border-2 border-primary/20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                        <Shield className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-semibold">Security Dashboard</div>
                        <div className="text-sm text-muted-foreground">Last 7 days</div>
                      </div>
                    </div>
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      Active
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground mb-2">Demo visualization</p>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">Threats Blocked</span>
                      <span className="text-xl font-bold text-green-500">--</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">Detection Status</span>
                      <span className="text-xl font-bold text-blue-500">Active</span>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30">
                      <span className="text-sm font-medium">System Health</span>
                      <span className="text-xl font-bold text-purple-500">Good</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">All systems protected</div>
                        <div className="text-xs text-muted-foreground">Last scan: 2 minutes ago</div>
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
                    Enterprise-Grade Security
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground mb-12">
                  Comprehensive protection powered by machine learning and behavioral analysis
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.map((feature, index) => (
                  <Card 
                    key={index}
                    className="p-6 glass border-border/50 hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center mb-4">
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
                    Choose Your Protection Level
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  Start free, upgrade as you grow. All plans include 7-day free trial.
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
                      onClick={tier.price === "Free" ? handleDownload : () => navigate('/auth')}
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
                    Product Roadmap
                  </span>
                </h2>
                <p className="text-xl text-muted-foreground">
                  What we're building next for PromptFluid Defense
                </p>
              </div>

              <div className="space-y-6">
                {roadmap.map((quarter, index) => (
                  <Card key={index} className="p-8 glass border-border/50">
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
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex-shrink-0 mt-0.5" />
                          )}
                          <span className="text-muted-foreground">{item}</span>
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
                Ready to Secure Your Site?
              </span>
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be among the first to experience AI-powered WordPress security. Pending WordPress.org approval — join our waitlist to be notified.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleDownload} className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500">
                <Download className="w-5 h-5 mr-2" />
                Download Free Version
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
                Contact Sales
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
