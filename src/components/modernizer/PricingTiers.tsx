import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Zap, Rocket, Crown } from 'lucide-react';

const tiers = [
  {
    name: 'Starter',
    price: '$19',
    period: '/month',
    description: 'Perfect for trying out the Modernizer',
    icon: <Zap className="w-6 h-6" />,
    features: [
      '3 modernizations per month',
      'Export source code',
      'Basic accessibility scoring',
      'SEO optimization',
      'Email support'
    ],
    cta: 'Start Free Trial',
    highlighted: false
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/month',
    description: 'For professionals and small teams',
    icon: <Rocket className="w-6 h-6" />,
    features: [
      'Unlimited modernizations',
      'Everything in Starter',
      'Vercel hosting included',
      'Custom domain support',
      'Priority support',
      'Advanced analytics'
    ],
    cta: 'Upgrade to Pro',
    highlighted: true
  },
  {
    name: 'Studio',
    price: '$99',
    period: '/month',
    description: 'For agencies and enterprise teams',
    icon: <Crown className="w-6 h-6" />,
    features: [
      'Everything in Pro',
      'White-label platform',
      'Team collaboration (5 seats)',
      'API access',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee'
    ],
    cta: 'Contact Sales',
    highlighted: false
  }
];

export const PricingTiers = () => {
  return (
    <div className="py-8">
      <div className="text-center mb-12 space-y-3">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Choose Your Plan
        </h2>
        <p className="text-muted-foreground text-lg">
          Start with a free 3-day trial. No credit card required.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {tiers.map((tier, idx) => (
          <Card 
            key={idx}
            className={`relative p-8 transition-all duration-300 ${
              tier.highlighted 
                ? 'border-2 border-primary shadow-2xl scale-105 bg-gradient-to-b from-primary/5 to-transparent' 
                : 'border hover:shadow-lg hover:border-primary/30'
            }`}
          >
            {tier.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full text-sm font-semibold">
                Most Popular
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  tier.highlighted ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {tier.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                </div>
              </div>

              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">{tier.price}</span>
                <span className="text-muted-foreground">{tier.period}</span>
              </div>

              <ul className="space-y-3">
                {tier.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`w-full h-11 ${
                  tier.highlighted 
                    ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90' 
                    : 'bg-secondary hover:bg-secondary/80'
                }`}
              >
                {tier.cta}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <p className="text-sm text-muted-foreground">
          All plans include our 30-day money-back guarantee.{' '}
          <a href="#" className="text-primary hover:underline">Compare plans in detail →</a>
        </p>
      </div>
    </div>
  );
};
