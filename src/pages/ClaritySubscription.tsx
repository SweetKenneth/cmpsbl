import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  tier: string;
  name: string;
  price: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    tier: 'free',
    name: 'Free',
    price: '$0',
    features: [
      '1 site',
      '5 scans per month',
      'Basic WCAG 2.2 Level A',
      'Manual issue review',
      'Email support',
    ],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: '$49',
    popular: true,
    features: [
      '5 sites',
      'Unlimited scans',
      'Full WCAG 2.2 AA + AAA',
      'AI auto-fix',
      'Real-time monitoring',
      'Priority support',
      'Weekly reports',
    ],
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    price: '$199',
    features: [
      'Unlimited sites',
      'Unlimited scans',
      'Full WCAG 2.2 + Custom rules',
      'Advanced AI auto-fix',
      'White-label reports',
      'API access',
      'Dedicated support',
      'SLA guarantee',
    ],
  },
];

export default function ClaritySubscription() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState<string>('free');
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('pf_clarity_subscriptions')
        .select('plan_tier, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (data) {
        setCurrentPlan(data.plan_tier);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async (planTier: string) => {
    if (planTier === 'free') {
      toast({
        title: 'Already on Free plan',
        description: 'You are already using the free tier',
      });
      return;
    }

    setCheckoutLoading(planTier);
    try {
      const { data, error } = await supabase.functions.invoke('pf-clarity-stripe-checkout', {
        body: { plan_tier: planTier },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: 'Checkout failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setCheckoutLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/clarity/dashboard')} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            Select the perfect plan for your accessibility needs
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <Card
              key={plan.tier}
              className={`p-8 relative ${
                plan.popular ? 'border-primary border-2 shadow-lg' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.price !== '$0' && <span className="text-muted-foreground">/month</span>}
                </div>
                {currentPlan === plan.tier && (
                  <Badge variant="outline" className="mb-4">Current Plan</Badge>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleCheckout(plan.tier)}
                disabled={currentPlan === plan.tier || checkoutLoading === plan.tier}
                className="w-full"
                variant={plan.popular ? 'default' : 'outline'}
              >
                {checkoutLoading === plan.tier ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentPlan === plan.tier ? (
                  'Current Plan'
                ) : plan.tier === 'free' ? (
                  'Get Started'
                ) : (
                  'Upgrade Now'
                )}
              </Button>
            </Card>
          ))}
        </div>

        <Card className="p-8 bg-primary/5 border-primary/20">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
            <p className="text-muted-foreground mb-6">
              Contact our sales team for custom enterprise packages with volume discounts,
              dedicated support, and tailored features.
            </p>
            <Button variant="outline" onClick={() => navigate('/contact')}>
              Contact Sales
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
