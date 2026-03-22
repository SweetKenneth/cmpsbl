/**
 * AgencySection — Commercial licensing for agencies
 * Component for funnel phase G
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { 
  Building2, Check, ArrowRight, Users, Star, 
  Zap, Shield, Crown, Calendar
} from 'lucide-react';
import { AGENCY_PACKS } from '@/config/marketplace-bundles';

interface AgencySectionProps {
  onCheckout?: (packId: string, billingCycle: 'monthly' | 'annual') => void;
  isLoading?: boolean;
}

export function AgencySection({ onCheckout, isLoading }: AgencySectionProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  return (
    <section className="py-12 sm:py-16 relative overflow-hidden" id="agencies">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-neon-purple/[0.02] via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto px-4 relative">
        {/* Section header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <Badge className="mb-4 gap-1.5 bg-gradient-to-r from-neon-purple to-neon-purple text-white border-0 shadow-lg">
            <Building2 className="w-3.5 h-3.5" />
            For Agencies
          </Badge>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-3">
            Commercial Licensing
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Deploy cognitive templates for your clients with full commercial rights, priority support, and optional white-labeling.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                billingCycle === 'monthly' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
                billingCycle === 'annual' 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted text-muted-foreground hover:text-foreground"
              )}
            >
              Annual
              <Badge className="bg-[hsl(var(--neon-green)/0.2)] text-[hsl(var(--neon-green))] border-0 text-[10px]">
                Save 25%
              </Badge>
            </button>
          </div>
        </motion.div>

        {/* Agency Packs Grid */}
        <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {AGENCY_PACKS.map((pack, index) => {
            const price = billingCycle === 'annual' 
              ? Math.round(pack.annualPrice / 12) 
              : pack.monthlyPrice;
            const isPopular = index === 1;

            return (
              <motion.div
                key={pack.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                className={cn(isPopular && "sm:-mt-4 sm:mb-4")}
              >
                <Card className={cn(
                  "h-full border-2 transition-all hover:shadow-xl relative",
                  isPopular 
                    ? "border-[hsl(var(--neon-purple)/0.5)] shadow-lg shadow-[hsl(var(--neon-purple)/0.1)]" 
                    : "hover:border-primary/50"
                )}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[hsl(var(--neon-purple))] text-white border-0 gap-1 shadow-lg">
                        <Star className="w-3 h-3 fill-current" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "p-2.5 rounded-xl",
                        index === 0 && "bg-[hsl(var(--neon-cyan)/0.1)]",
                        index === 1 && "bg-[hsl(var(--neon-purple)/0.1)]",
                        index === 2 && "bg-[hsl(var(--neon-amber)/0.1)]"
                      )}>
                        {index === 0 && <Users className="w-5 h-5 text-[hsl(var(--neon-cyan))]" />}
                        {index === 1 && <Building2 className="w-5 h-5 text-[hsl(var(--neon-purple))]" />}
                        {index === 2 && <Crown className="w-5 h-5 text-[hsl(var(--neon-amber))]" />}
                      </div>
                      <div>
                        <h4 className="font-bold">{pack.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          {pack.templateCount === -1 ? 'All templates' : `${pack.templateCount} templates`}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-4">{pack.description}</p>

                    {/* Pricing */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-primary">
                          ${(price / 100).toFixed(0)}
                        </span>
                        <span className="text-sm text-muted-foreground">/mo</span>
                      </div>
                      {billingCycle === 'annual' && (
                        <p className="text-xs text-neon-green">
                          Billed annually (${(pack.annualPrice / 100).toLocaleString()}/yr)
                        </p>
                      )}
                    </div>

                    {/* Entitlements */}
                    <ul className="space-y-2 mb-6">
                      {pack.entitlements.map((entitlement, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-neon-green shrink-0 mt-0.5" />
                          {entitlement}
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Button 
                      className="w-full gap-2"
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => onCheckout?.(pack.id, billingCycle)}
                      disabled={isLoading}
                    >
                      {index === 2 ? 'Contact Sales' : 'Get Started'}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Trust indicators */}
        <motion.div 
          className="flex flex-wrap justify-center gap-6 mt-10 pt-8 border-t border-border/30"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {[
            { icon: Shield, label: 'Commercial License', color: 'text-neon-green' },
            { icon: Users, label: 'Multi-Client Rights', color: 'text-neon-purple' },
            { icon: Zap, label: 'Priority Support', color: 'text-neon-amber' },
          ].map(({ icon: TrustIcon, label, color }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrustIcon className={`w-4 h-4 ${color}`} />
              <span>{label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
