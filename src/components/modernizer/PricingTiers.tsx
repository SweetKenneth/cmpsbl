import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Zap, Rocket, Crown, Sparkles } from 'lucide-react';

const tiers = [
  {
    name: 'Starter',
    price: '$19',
    period: '/month',
    description: 'Perfect for trying out the Modernizer',
    icon: Zap,
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
    icon: Rocket,
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
    icon: Crown,
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
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 space-y-4"
      >
        <Badge variant="outline" className="gap-2 px-4 py-2">
          <Sparkles className="w-4 h-4" />
          Simple Pricing
        </Badge>
        <h2 className="text-3xl md:text-4xl font-bold">
          Choose Your Plan
        </h2>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Start with a free 3-day trial. No credit card required.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {tiers.map((tier, idx) => {
          const Icon = tier.icon;
          return (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card 
                className={`relative p-6 h-full transition-all duration-300 ${
                  tier.highlighted 
                    ? 'border-2 border-primary shadow-xl bg-gradient-to-b from-primary/5 to-transparent scale-[1.02]' 
                    : 'border border-border/50 hover:shadow-lg hover:border-primary/30 bg-card/80'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-full text-xs font-semibold">
                    Most Popular
                  </div>
                )}

                <div className="space-y-5">
                  <div className="space-y-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tier.highlighted ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{tier.name}</h3>
                      <p className="text-sm text-muted-foreground">{tier.description}</p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground text-sm">{tier.period}</span>
                  </div>

                  <ul className="space-y-2.5">
                    {tier.features.map((feature, featureIdx) => (
                      <li key={featureIdx} className="flex items-start gap-2">
                        <Check className={`w-4 h-4 flex-shrink-0 mt-0.5 ${tier.highlighted ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full h-10 ${
                      tier.highlighted 
                        ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90' 
                        : ''
                    }`}
                    variant={tier.highlighted ? 'default' : 'outline'}
                  >
                    {tier.cta}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-10 text-center"
      >
        <p className="text-sm text-muted-foreground">
          All plans include our 30-day money-back guarantee.{' '}
          <a href="#" className="text-primary hover:underline">Compare plans in detail →</a>
        </p>
      </motion.div>
    </div>
  );
};
