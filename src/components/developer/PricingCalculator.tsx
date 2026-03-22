/**
 * Pricing Calculator
 * ROI calculator with time-cost analysis vs DIY
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, Clock, DollarSign, Zap, ArrowRight, CheckCircle2, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

// DIY cost estimates
const DIY_COSTS = {
  vectorDbMonthly: 50, // Pinecone/Weaviate basic tier
  computeMonthly: 100, // Basic server costs
  developerHourlyRate: 150, // Average senior dev rate
  setupTimeHours: 80, // Initial implementation
  maintenanceHoursMonthly: 10, // Ongoing maintenance
  debuggingHoursMonthly: 5, // Bug fixes and issues
};

// CMPSBL pricing
const CMPSBL_PRICING = {
  free: { monthly: 0, annual: 0, requests: 1000 },
  builder: { monthly: 49, annual: 490, requests: 50000 },
  pro: { monthly: 149, annual: 1490, requests: 500000 },
  enterprise: { monthly: 499, annual: 4990, requests: -1 }, // unlimited
};

export function PricingCalculator({ className }: { className?: string }) {
  const [teamSize, setTeamSize] = useState([3]);
  const [monthlyRequests, setMonthlyRequests] = useState([50000]);
  const [isAnnual, setIsAnnual] = useState(true);
  
  const calculations = useMemo(() => {
    const team = teamSize[0];
    const requests = monthlyRequests[0];
    
    // Determine recommended tier
    let recommendedTier: 'free' | 'builder' | 'pro' | 'enterprise' = 'free';
    if (requests > 500000 || team > 10) recommendedTier = 'enterprise';
    else if (requests > 50000 || team > 5) recommendedTier = 'pro';
    else if (requests > 1000 || team > 1) recommendedTier = 'builder';
    
    const tierPricing = CMPSBL_PRICING[recommendedTier];
    const cmpsblMonthly = isAnnual 
      ? tierPricing.annual / 12 
      : tierPricing.monthly;
    const cmpsblAnnual = isAnnual ? tierPricing.annual : tierPricing.monthly * 12;
    
    // DIY costs
    const diySetupCost = DIY_COSTS.setupTimeHours * DIY_COSTS.developerHourlyRate;
    const diyMonthlyInfra = DIY_COSTS.vectorDbMonthly + DIY_COSTS.computeMonthly;
    const diyMonthlyLabor = (DIY_COSTS.maintenanceHoursMonthly + DIY_COSTS.debuggingHoursMonthly) 
      * DIY_COSTS.developerHourlyRate;
    const diyMonthlyTotal = diyMonthlyInfra + diyMonthlyLabor;
    const diyFirstYearTotal = diySetupCost + (diyMonthlyTotal * 12);
    
    // Time savings
    const timeSavedSetupHours = DIY_COSTS.setupTimeHours;
    const timeSavedMonthlyHours = DIY_COSTS.maintenanceHoursMonthly + DIY_COSTS.debuggingHoursMonthly;
    const timeSavedAnnualHours = timeSavedSetupHours + (timeSavedMonthlyHours * 12);
    
    // Value of time saved (opportunity cost)
    const opportunityCostSaved = timeSavedAnnualHours * DIY_COSTS.developerHourlyRate;
    
    // Total savings
    const annualSavings = diyFirstYearTotal - cmpsblAnnual;
    const savingsPercentage = Math.round((annualSavings / diyFirstYearTotal) * 100);
    
    return {
      recommendedTier,
      cmpsblMonthly,
      cmpsblAnnual,
      diySetupCost,
      diyMonthlyTotal,
      diyFirstYearTotal,
      timeSavedAnnualHours,
      opportunityCostSaved,
      annualSavings,
      savingsPercentage,
    };
  }, [teamSize, monthlyRequests, isAnnual]);

  const tierColors = {
    free: 'text-muted-foreground',
    builder: 'text-neon-blue',
    pro: 'text-neon-purple',
    enterprise: 'text-neon-amber',
  };

  return (
    <Card className={cn("border-primary/20 overflow-hidden", className)}>
      <CardHeader className="bg-gradient-to-br from-primary/5 to-neon-purple/5 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calculator className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">ROI Calculator</CardTitle>
            <p className="text-sm text-muted-foreground">
              See how much you save vs building yourself
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Inputs */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Team Size</span>
              <span className="font-medium">{teamSize[0]} developers</span>
            </div>
            <Slider
              value={teamSize}
              onValueChange={setTeamSize}
              min={1}
              max={20}
              step={1}
              className="py-2"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>Monthly Requests</span>
              <span className="font-medium">{monthlyRequests[0].toLocaleString()}</span>
            </div>
            <Slider
              value={monthlyRequests}
              onValueChange={setMonthlyRequests}
              min={1000}
              max={1000000}
              step={1000}
              className="py-2"
            />
          </div>
        </div>
        
        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 py-2">
          <span className={cn("text-sm", !isAnnual && "font-medium")}>Monthly</span>
          <Switch checked={isAnnual} onCheckedChange={setIsAnnual} />
          <span className={cn("text-sm", isAnnual && "font-medium")}>
            Annual
            <Badge variant="outline" className="ml-2 text-[10px] text-neon-green border-neon-green/30">
              Save ~17%
            </Badge>
          </span>
        </div>
        
        {/* Comparison */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* DIY Column */}
          <motion.div 
            className="p-4 rounded-xl bg-destructive/5 border border-destructive/20"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h3 className="font-semibold text-sm mb-3 text-destructive">Build It Yourself</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Setup cost</span>
                <span>${calculations.diySetupCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly infra + labor</span>
                <span>${calculations.diyMonthlyTotal.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/50 font-medium">
                <span>First Year Total</span>
                <span className="text-destructive">
                  ${calculations.diyFirstYearTotal.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {calculations.timeSavedAnnualHours}+ hours of dev time
            </div>
          </motion.div>
          
          {/* CMPSBL Column */}
          <motion.div 
            className="p-4 rounded-xl bg-neon-green/5 border border-neon-green/20"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm text-neon-green">CMPSBL</h3>
              <Badge className={cn("text-[10px] capitalize", tierColors[calculations.recommendedTier])}>
                {calculations.recommendedTier} tier
              </Badge>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Setup cost</span>
                <span className="text-neon-green">$0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly cost</span>
                <span>${Math.round(calculations.cmpsblMonthly).toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border/50 font-medium">
                <span>First Year Total</span>
                <span className="text-neon-green">
                  ${calculations.cmpsblAnnual.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-neon-green">
              <CheckCircle2 className="w-3 h-3" />
              Ready in under an hour
            </div>
          </motion.div>
        </div>
        
        {/* Savings Summary */}
        <motion.div 
          className="p-4 rounded-xl bg-gradient-to-r from-primary/10 to-neon-purple/10 border border-primary/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="font-semibold">Your Savings</span>
            </div>
            <Badge className="bg-primary/10 text-primary border-primary/20">
              {calculations.savingsPercentage}% less
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                ${calculations.annualSavings.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">saved first year</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neon-purple">
                {calculations.timeSavedAnnualHours}h
              </div>
              <div className="text-xs text-muted-foreground">dev time saved</div>
            </div>
          </div>
        </motion.div>
        
        {/* CTA */}
        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link to="/store?tab=plans">
              Get Started with {calculations.recommendedTier.charAt(0).toUpperCase() + calculations.recommendedTier.slice(1)}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
