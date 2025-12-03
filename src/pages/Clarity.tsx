import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Zap, FileText, Settings, Download, CheckCircle, TrendingUp, Clock } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { useNavigate } from "react-router-dom";

const Clarity = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="PromptFluid Clarity - Universal AI Accessibility Scanner | WCAG Auto-Fix"
        description="Install once. Comply forever. Universal JavaScript agent for WordPress, React, Next.js, and any website. 86 WCAG checks with AI-powered auto-fix. Rollback-safe accessibility automation."
        canonical="https://www.promptfluid.com/projects/clarity"
        keywords={[
          'website accessibility automation',
          'AI accessibility scanner',
          'WCAG auto fix',
          'universal accessibility agent',
          'accessibility compliance tool',
          'ADA website compliance',
          'AI website fixing',
          'automatic accessibility repair',
          'WCAG 2.2 compliance software',
          'accessibility monitoring'
        ]}
      />
      
      <PublicNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-32 pb-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="container relative z-10 mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-4" variant="outline">
              <Shield className="w-3 h-3 mr-1" />
              Version 4.1.0 - Universal Edition
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              PromptFluid Clarity
            </h1>
            <p className="text-2xl md:text-3xl font-bold mb-4 text-foreground">
              Install once. Comply forever.
            </p>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              AI-driven accessibility that actually fixes your site — not just reports it. Run Clarity on any site with one line of code. Full WCAG 2.2 compliance with automatic remediation, continuous monitoring, and rollback-safe architecture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={() => navigate("/scan")}>
                <Zap className="w-4 h-4 mr-2" />
                Run a Free Scan
              </Button>
              <Button size="lg" onClick={() => navigate("/auth")}>
                Start Free Trial
              </Button>
              <Button size="lg" variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download Manual
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "WCAG Checks", value: "86" },
              { label: "Auto-Fix Types", value: "24" },
              { label: "Compliance Levels", value: "A, AA, AAA" },
              { label: "Universal Agent", value: "100%" },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How Clarity Works</h2>
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Install the Agent</h3>
                    <p className="text-muted-foreground">
                      Add one line of JavaScript to your site. Works with WordPress, React, Next.js, Vue, Angular, and any HTML.
                    </p>
                    <pre className="mt-4 p-3 bg-muted rounded text-xs overflow-x-auto">
{`<script src="https://cdn.promptfluid.com/clarity-agent.js" 
        data-clarity-key="YOUR_KEY"></script>`}
                    </pre>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Run Initial Scan</h3>
                    <p className="text-muted-foreground">
                      Clarity scans your entire site (up to 50 pages on One-Time Fix, unlimited on Continuous) and generates a full compliance report.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">AI Auto-Fixes Issues</h3>
                    <p className="text-muted-foreground">
                      24 types of accessibility issues are automatically fixed: missing alt text, form labels, ARIA attributes, heading hierarchy, keyboard navigation, and more.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary">4</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Review & Approve</h3>
                    <p className="text-muted-foreground">
                      Complex issues are flagged for human review. Approve all auto-fixes in the wizard before they go live.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary">5</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Deploy Changes</h3>
                    <p className="text-muted-foreground">
                      Fixes are deployed to production instantly. All changes are stored in a 30-day rollback buffer for safety.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary">6</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Continuous Monitoring</h3>
                    <p className="text-muted-foreground">
                      Clarity runs daily scans (Continuous plan) to catch new issues. Get email/Slack alerts for critical accessibility violations.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary">7</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Rollback If Needed</h3>
                    <p className="text-muted-foreground">
                      If any fix causes an issue, instantly rollback to any point in the last 30 days with zero downtime.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl font-bold text-primary">8</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">Stay Compliant</h3>
                    <p className="text-muted-foreground">
                      Your site stays WCAG 2.2 compliant 24/7. Clarity learns from every fix and gets smarter over time.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Tabs */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-5xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="pricing">Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-8">
              <div className="grid md:grid-cols-2 gap-8">
                <Card className="p-6">
                  <Shield className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Full WCAG 2.2 Coverage</h3>
                  <p className="text-muted-foreground">
                    86 automated accessibility checks covering WCAG Level A, AA, and AAA criteria.
                    Comprehensive scanning for images, forms, navigation, color contrast, and more.
                  </p>
                </Card>

                <Card className="p-6">
                  <Zap className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Real Code Repair</h3>
                  <p className="text-muted-foreground">
                    Unlike overlays that just hide problems, Clarity actually fixes your HTML/DOM.
                    24 auto-fix types with AI-generated alt text, form labels, ARIA attributes, and semantic structure corrections.
                  </p>
                </Card>

                <Card className="p-6">
                  <FileText className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-2xl font-bold mb-3">Universal JavaScript Agent</h3>
                  <p className="text-muted-foreground">
                    Single agent works across WordPress, React, Next.js, Vue, Angular, and vanilla HTML.
                    Zero platform lock-in with seamless Supabase-managed backend.
                  </p>
                </Card>

                <Card className="p-6">
                  <Settings className="w-12 h-12 text-primary mb-4" />
                  <h3 className="text-2xl font-bold mb-3">PromptFluid Nexus AI Integration</h3>
                  <p className="text-muted-foreground">
                    Powered by PromptFluid's AI orchestration layer. Intelligent alt-text generation,
                    semantic analysis, and continuous learning from accessibility patterns.
                  </p>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="features" className="mt-8">
              <Card className="p-8">
                <h3 className="text-2xl font-bold mb-6">Complete Feature Set</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    "86 WCAG 2.2 automated checks (A, AA, AAA)",
                    "24 auto-fix capabilities",
                    "AI-generated alt text for images",
                    "Form label and ARIA attribute fixes",
                    "Heading hierarchy correction",
                    "Keyboard accessibility enhancement",
                    "Skip navigation link insertion",
                    "Real-time compliance scoring",
                    "Detailed issue reporting",
                    "Human review flagging system",
                    "30-day rollback buffer",
                    "Continuous monitoring (Continuous plan)",
                    "Email/Slack/Discord alerts",
                    "Team collaboration (Enterprise)",
                    "White-label reports (Enterprise)",
                    "API access (Enterprise)",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="mt-8">
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  {
                    name: "Free",
                    price: "$0",
                    period: "",
                    features: [
                      "View-only reports",
                      "1 scan per month",
                      "Basic compliance scoring",
                      "Community support"
                    ],
                  },
                  {
                    name: "One-Time Fix",
                    price: "$199",
                    period: "one-time",
                    features: [
                      "50 pages scanned",
                      "Auto-fix enabled",
                      "30-day rollback",
                      "Email support",
                      "One-time deployment"
                    ],
                  },
                  {
                    name: "Continuous",
                    price: "$69",
                    period: "/month",
                    altPrice: "$690/year (save $138)",
                    features: [
                      "Unlimited scans",
                      "3 sites included",
                      "Daily monitoring",
                      "Email/Slack alerts",
                      "Priority support"
                    ],
                    popular: true,
                  },
                  {
                    name: "Enterprise",
                    price: "$249",
                    period: "/month",
                    features: [
                      "Unlimited sites",
                      "API access",
                      "SSO authentication",
                      "White-label reports",
                      "Dedicated support",
                      "Custom SLA"
                    ],
                  },
                ].map((plan, i) => (
                  <Card key={i} className={`p-6 ${plan.popular ? "border-primary border-2 shadow-glow" : ""}`}>
                    {plan.popular && (
                      <Badge className="mb-4">Most Popular</Badge>
                    )}
                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-2">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                    </div>
                    {plan.altPrice && (
                      <p className="text-xs text-muted-foreground mb-4">{plan.altPrice}</p>
                    )}
                    <ul className="space-y-3 mb-6 min-h-[200px]">
                      {plan.features.map((feature, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      onClick={() => navigate(plan.name === "Free" ? "/scan" : "/auth")}
                    >
                      {plan.name === "Free" ? "Try Free Scan" : "Get Started"}
                    </Button>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
};

export default Clarity;
