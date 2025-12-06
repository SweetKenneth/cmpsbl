import { Globe, CheckCircle2, ArrowRight, Eye, Keyboard, MousePointer, Type, CheckSquare, Heart, Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

export default function AccessProduct() {
  const openCMPTBL = () => {
    window.open("https://cmptbl.promptfluid.com", "_blank");
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

  const stats = [
    { label: "WCAG Guidelines", value: "86+", icon: CheckSquare },
    { label: "Compliance Rate", value: "100%", icon: CheckCircle2 },
    { label: "Always", value: "Free", icon: Heart },
    { label: "AI-Powered", value: "Fixes", icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <SEO 
        title="PromptFluid Access — Free Accessibility Platform | WCAG Compliance"
        description="Make the web accessible to everyone — 100% free. AI-powered WCAG compliance, automated alt text, screen reader optimization, and accessibility fixes. Accessibility should never be behind a paywall."
        canonical="https://promptfluid.com/products/access"
        keywords={[
          'free web accessibility',
          'free WCAG compliance',
          'accessibility testing free',
          'screen reader optimization',
          'free accessibility scanner',
          'alt text generator free',
          'accessibility for all',
          'free accessibility audit',
          'inclusive design',
          'ADA compliance free',
          'accessibility automation'
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
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium">100% Free — The Way It Should Be</span>
                </div>

                <h1 className="text-5xl md:text-6xl font-bold mb-6">
                  <span className="bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 bg-clip-text text-transparent">
                    PromptFluid Access
                  </span>
                </h1>

                <p className="text-2xl text-primary font-medium mb-4">
                  Free Accessibility For All
                </p>

                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  We believe accessibility should never be locked behind a paywall. Scan your website, 
                  get AI-powered fixes, and make the web work for everyone — completely free, forever.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <Button 
                    size="lg" 
                    onClick={openCMPTBL}
                    className="group bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500 hover:shadow-glow-lg text-lg"
                  >
                    <Accessibility className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Free Accessibility Scan
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    asChild
                  >
                    <Link to="/blog/accessibility-free-for-all">
                      Read Our Mission
                    </Link>
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
                    <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                      Free Forever
                    </Badge>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">WCAG 2.2 Compliance</span>
                      <span className="text-2xl font-bold text-green-500">100%</span>
                    </div>
                    <div className="w-full h-3 bg-background rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-green-500 to-blue-500 w-full"></div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Free Scanning</span>
                      </div>
                      <span className="text-xs font-medium text-green-500">Unlimited</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">AI-Powered Fixes</span>
                      </div>
                      <span className="text-xs font-medium text-green-500">Included</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        <span className="text-sm">No Credit Card</span>
                      </div>
                      <span className="text-xs font-medium text-green-500">Ever</span>
                    </div>
                  </div>

                  <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
                    <div className="flex items-start gap-3">
                      <Heart className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-sm">Accessibility is a right</div>
                        <div className="text-xs text-muted-foreground">Not a premium feature</div>
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

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
                Accessibility for Everyone
              </span>
            </h2>
            <p className="text-xl text-muted-foreground mb-6">
              Comprehensive tools to make your applications accessible to all users — 100% free
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
        </div>
      </div>

      {/* Mission Section */}
      <div className="bg-gradient-to-b from-primary/5 to-transparent py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Heart className="w-12 h-12 text-red-500 mx-auto mb-6" />
            <blockquote className="text-2xl md:text-3xl font-medium mb-6">
              "Accessibility is not a feature. It's a fundamental right. 
              And rights shouldn't have a price tag."
            </blockquote>
            <p className="text-muted-foreground mb-6">
              — Kenneth Sweet, Founder of PromptFluid
            </p>
            <Button variant="link" asChild>
              <Link to="/blog/accessibility-free-for-all">
                Read Our Full Mission Statement
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto p-8 md:p-12 bg-gradient-to-br from-primary/10 via-primary-variant/5 to-accent/10 border-primary/20 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Make Your Site Accessible?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of website owners making the web work for everyone. 
            It's free. It's fast. It's the right thing to do.
          </p>
          <Button size="lg" onClick={openCMPTBL} className="shadow-glow hover:shadow-glow-lg">
            <Accessibility className="w-5 h-5 mr-2" />
            Start Free Accessibility Scan
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-sm text-muted-foreground mt-6">
            No signup required • Unlimited scans • AI-powered fixes included
          </p>
        </Card>
      </div>
    </div>
  );
}