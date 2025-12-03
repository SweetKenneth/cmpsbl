import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Zap, TrendingUp, Check, ArrowRight, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BotSniperHome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      {/* Hero Section */}
      <section className="pt-20 pb-16 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            AI-Powered Bot Detection
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Stop Malicious Bots
            <br />
            <span className="text-primary">Before They Strike</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time AI detection that identifies and blocks bot traffic with 99% accuracy. 
            Protect your site from scraping, credential stuffing, and automated attacks.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/bot-sniper/pricing')} className="text-lg px-8">
              View Pricing
            </Button>
          </div>

          <p className="text-sm text-muted-foreground pt-2">
            3-day free trial • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-12 px-6 bg-muted/30">
        <div className="max-w-6xl mx-auto grid md:grid-cols-4 gap-8 text-center">
          <div>
            <p className="text-4xl font-bold text-primary">99%</p>
            <p className="text-muted-foreground mt-1">Detection Accuracy</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary">&lt;50ms</p>
            <p className="text-muted-foreground mt-1">Response Time</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary">10M+</p>
            <p className="text-muted-foreground mt-1">Threats Blocked</p>
          </div>
          <div>
            <p className="text-4xl font-bold text-primary">24/7</p>
            <p className="text-muted-foreground mt-1">Protection</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Advanced Bot Detection</h2>
            <p className="text-xl text-muted-foreground">
              AI-powered analysis that adapts to evolving threats
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Behavioral Analysis',
                description: 'Advanced ML models detect bot patterns in real-time, analyzing request velocity, user agent signatures, and behavioral anomalies.'
              },
              {
                icon: Activity,
                title: 'IP Reputation Tracking',
                description: 'Dynamic reputation scoring learns from historical data to identify repeat offenders and emerging threat sources.'
              },
              {
                icon: Zap,
                title: 'Instant Response',
                description: 'Sub-50ms detection enables real-time blocking without impacting legitimate user experience.'
              },
              {
                icon: TrendingUp,
                title: 'Threat Intelligence',
                description: 'Detailed analytics and threat classification help you understand attack patterns and optimize defenses.'
              },
              {
                icon: Shield,
                title: 'API-First Design',
                description: 'Simple REST API integrates with any stack. Get up and running in minutes with comprehensive documentation.'
              },
              {
                icon: Activity,
                title: 'Adaptive Learning',
                description: 'Self-improving detection algorithms that learn from your traffic patterns to reduce false positives.'
              }
            ].map((feature) => (
              <Card key={feature.title} className="p-6 hover:shadow-lg transition-shadow">
                <feature.icon className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h2 className="text-4xl font-bold">Simple, Transparent Pricing</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card className="p-8">
              <h3 className="text-2xl font-bold mb-4">Bot Sniper Base</h3>
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-5xl font-bold">$9</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 text-left mb-8">
                {['10,000 requests/mo', 'Real-time detection', 'API access', 'Email support'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" onClick={() => navigate('/bot-sniper/pricing')}>
                Get Started
              </Button>
            </Card>

            <Card className="p-8 border-primary relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                BEST VALUE
              </div>
              <h3 className="text-2xl font-bold mb-4">Full Suite</h3>
              <div className="space-y-1 mb-6">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$1</span>
                  <span className="text-muted-foreground">first month</span>
                </div>
                <p className="text-sm text-muted-foreground">Then $39/mo</p>
              </div>
              <ul className="space-y-3 text-left mb-8">
                {['Unlimited requests', 'WAF protection', 'Malware scanning', 'Priority support'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-primary" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" onClick={() => navigate('/bot-sniper/pricing')}>
                Upgrade to Full Suite
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="p-12 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Protect Your Site?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Start your free 3-day trial today. No credit card required.
            </p>
            <Button size="lg" onClick={() => navigate('/auth')} className="text-lg px-8">
              Start Free Trial
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Card>
        </div>
      </section>
    </div>
  );
}
