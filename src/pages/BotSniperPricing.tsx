import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ArrowLeft, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export default function BotSniperPricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (tier: 'base' | 'full') => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setLoading(tier);
    try {
      const { data, error } = await supabase.functions.invoke('bot-sniper-create-checkout', {
        body: { tier }
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/bot-sniper')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            Start protecting your site from malicious bots today
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Bot Sniper Base */}
          <Card className="p-8 relative">
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">Bot Sniper Base</h3>
                <p className="text-muted-foreground mt-1">
                  Essential bot protection for growing sites
                </p>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold">$9</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <ul className="space-y-3">
                {[
                  '10,000 requests per month',
                  'Real-time bot detection',
                  'Threat scoring & classification',
                  'IP reputation tracking',
                  'API access',
                  'Email support'
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                size="lg"
                onClick={() => handleCheckout('base')}
                disabled={loading === 'base'}
              >
                {loading === 'base' ? 'Loading...' : 'Get Started'}
              </Button>
            </div>
          </Card>

          {/* Full Suite */}
          <Card className="p-8 relative border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4" />
              SPECIAL OFFER
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold">Full PromptFluid Suite</h3>
                <p className="text-muted-foreground mt-1">
                  Complete security & accessibility platform
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold">$1</span>
                  <span className="text-muted-foreground">first month</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Then $39/month • Save $119 annually
                </p>
              </div>

              <ul className="space-y-3">
                {[
                  'Everything in Bot Sniper Base',
                  'Unlimited bot detection requests',
                  'WAF (Web Application Firewall)',
                  'Malware scanning & removal',
                  'File integrity monitoring',
                  'Login security & brute force protection',
                  'WCAG compliance scanning',
                  'Auto-fix accessibility issues',
                  'Priority support',
                  'Advanced analytics'
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                size="lg"
                onClick={() => handleCheckout('full')}
                disabled={loading === 'full'}
              >
                {loading === 'full' ? 'Loading...' : 'Upgrade to Full Suite'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                Cancel anytime • 30-day money-back guarantee
              </p>
            </div>
          </Card>
        </div>

        {/* Comparison Table */}
        <Card className="p-8">
          <h3 className="text-2xl font-bold mb-6 text-center">Feature Comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4">Feature</th>
                  <th className="text-center py-4 px-4">Bot Sniper</th>
                  <th className="text-center py-4 px-4">Full Suite</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { feature: 'Bot Detection', base: true, full: true },
                  { feature: 'Request Limit', base: '10k/mo', full: 'Unlimited' },
                  { feature: 'WAF Protection', base: false, full: true },
                  { feature: 'Malware Scanning', base: false, full: true },
                  { feature: 'Accessibility Tools', base: false, full: true },
                  { feature: 'Support', base: 'Email', full: 'Priority' }
                ].map((row) => (
                  <tr key={row.feature}>
                    <td className="py-4 px-4 font-medium">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.base === 'boolean' ? (
                        row.base ? <Check className="w-5 h-5 mx-auto text-green-500" /> : '—'
                      ) : (
                        row.base
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.full === 'boolean' ? (
                        row.full ? <Check className="w-5 h-5 mx-auto text-primary" /> : '—'
                      ) : (
                        row.full
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
