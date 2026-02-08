import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, TrendingUp, Check, ArrowRight, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import heroImage from "@/assets/hero/defense-shield-cyber.jpg";

export default function RCKBLHome() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Shield,
      title: "Behavioral Analysis",
      description: "ML models detect bot patterns in real-time, analyzing velocity, signatures, and anomalies."
    },
    {
      icon: Activity,
      title: "IP Reputation",
      description: "Dynamic scoring learns from historical data to identify repeat offenders."
    },
    {
      icon: Zap,
      title: "Instant Response",
      description: "Sub-50ms detection enables real-time blocking without impacting UX."
    },
    {
      icon: TrendingUp,
      title: "Threat Intelligence",
      description: "Analytics and classification help understand attack patterns."
    },
    {
      icon: Shield,
      title: "API-First",
      description: "Simple REST API integrates with any stack in minutes."
    },
    {
      icon: Activity,
      title: "Adaptive Learning",
      description: "Self-improving algorithms reduce false positives over time."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Defense Module — AI-Powered Bot Protection | CMPSBL"
        description="Stop sophisticated bot attacks with AI-powered behavioral analysis. Credential stuffing, spam bots, and automated attacks blocked in real-time."
        canonical="https://cmpsbl.com/bot-sniper"
        keywords={['WordPress security', 'bot detection', 'AI security', 'CMPSBL Defense']}
      />

      <PublicNav />

      {/* Hero with Futuristic Defense Shield Visual */}
      <section className="relative w-full">
        <div 
          className="absolute inset-0 h-[70vh] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />
        <div className="absolute inset-0 h-[70vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-20">
          <div className="max-w-4xl">
            <Badge variant="outline" className="mb-6 border-[hsl(var(--system-amber))]/30 text-[hsl(var(--system-amber))]">
              Pending WordPress.org Approval
            </Badge>

            <Badge variant="outline" className="mb-6 ml-2 border-primary/30 text-primary">
              <Shield className="w-3 h-3 mr-2" />
              AI-Powered Security
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Stop Malicious Bots Before They Strike
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl leading-relaxed">
              AI-powered detection that identifies and blocks bot traffic. Protect your WordPress site from scraping, credential stuffing, and automated attacks.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <Button size="lg" onClick={() => navigate('/contact')} className="bg-primary hover:bg-primary/90">
                Join Waitlist
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/projects/defense')}>
                Learn More
              </Button>
            </div>

            <p className="text-sm text-muted-foreground">
              Pending WordPress.org approval • Pricing shown is planned pricing
            </p>
          </div>
        </div>
      </section>

      {/* Metrics Bar */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto text-center">
            <div>
              <p className="text-3xl font-bold text-primary mb-1">AI</p>
              <p className="text-sm text-muted-foreground">Behavioral Analysis</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary mb-1">Real-time</p>
              <p className="text-sm text-muted-foreground">Threat Detection</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary mb-1">Adaptive</p>
              <p className="text-sm text-muted-foreground">CAPTCHA System</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary mb-1">WordPress</p>
              <p className="text-sm text-muted-foreground">Native Plugin</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Advanced Bot Detection</h2>
            <p className="text-xl text-muted-foreground">
              AI-powered analysis that adapts to evolving threats
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6 bg-card border-border hover:border-primary/40 transition-all">
                <feature.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Earth Window */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
            <p className="text-2xl md:text-4xl font-light text-white drop-shadow-lg">
              "Security that thinks for itself."
            </p>
          </blockquote>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Simple, Transparent Pricing</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8 bg-card border-border">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Defense Base</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-bold text-foreground">$9</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {["10,000 requests/mo", "Real-time detection", "API access", "Email support"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-[hsl(var(--system-green))]" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant="outline" onClick={() => navigate('/bot-sniper/pricing')}>
                Get Started
              </Button>
            </Card>

            <Card className="p-8 bg-card border-primary relative">
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                BEST VALUE
              </Badge>
              <h3 className="text-2xl font-bold mb-4 text-foreground">Full Suite</h3>
              <div className="space-y-1 mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-foreground">$1</span>
                  <span className="text-muted-foreground">first month</span>
                </div>
                <p className="text-sm text-muted-foreground">Then $39/mo</p>
              </div>
              <ul className="space-y-3 mb-8">
                {["Unlimited requests", "WAF protection", "Malware scanning", "Priority support"].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full bg-primary hover:bg-primary/90" onClick={() => navigate('/bot-sniper/pricing')}>
                Upgrade to Full Suite
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">
            Ready to Protect Your Site?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start your free 3-day trial. No credit card required.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90">
            Start Free Trial
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
