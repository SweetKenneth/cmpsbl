import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Rocket, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const plans = [
  {
    name: "Starter",
    price: 19,
    icon: Zap,
    features: ["Basic builder access", "3 projects", "Limited spins", "Community support"],
    color: "blue"
  },
  {
    name: "Pro",
    price: 49,
    icon: Rocket,
    features: ["Unlimited projects", "API access", "Early integrations", "Priority support"],
    color: "primary",
    popular: true
  },
  {
    name: "Studio",
    price: 99,
    icon: Crown,
    features: ["Team slots", "Private instances", "Priority builds", "Dedicated support"],
    color: "purple"
  }
];

export default function Subscriptions() {
  const [currentPlan, setCurrentPlan] = useState("Pro");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      // Mock data for now
      setCurrentPlan('Pro');
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (planName: string) => {
    toast.success(`Switching to ${planName} plan...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Crown className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
        </div>
        <p className="text-muted-foreground">Choose the plan that fits your needs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrent = currentPlan === plan.name;
          
          return (
            <Card
              key={plan.name}
              className={`p-6 relative ${plan.popular ? 'border-primary shadow-lg' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              
              <div className="text-center space-y-4">
                <Icon className={`w-12 h-12 mx-auto text-${plan.color}-500`} />
                <div>
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mt-2">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/mo</span>
                  </div>
                </div>

                <div className="space-y-3 text-left">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  className="w-full"
                  variant={isCurrent ? "outline" : "default"}
                  disabled={isCurrent}
                  onClick={() => handlePlanChange(plan.name)}
                >
                  {isCurrent ? 'Current Plan' : 'Upgrade'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Enterprise</h3>
            <p className="text-sm text-muted-foreground">
              Custom pricing for teams with advanced needs
            </p>
            <ul className="space-y-1 text-sm">
              <li>• White-label solutions</li>
              <li>• Private models</li>
              <li>• Full integration support</li>
              <li>• Dedicated account manager</li>
            </ul>
          </div>
          <Button>Contact Sales</Button>
        </div>
      </Card>
    </div>
  );
}
