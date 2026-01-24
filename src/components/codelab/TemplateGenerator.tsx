/**
 * TemplateGenerator — Now redirects to paid Marketplace
 * Templates are no longer available for free download
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, ShoppingCart, Sparkles, ArrowRight, Code, Lock,
  Brain, Shield, Zap, Moon, Eye, MessageSquare, Settings
} from "lucide-react";

const categories = [
  { id: "brain", name: "Brain", icon: Brain, count: 12, color: "text-violet-500" },
  { id: "decode", name: "Decode", icon: MessageSquare, count: 11, color: "text-cyan-500" },
  { id: "defense", name: "Defense", icon: Shield, count: 10, color: "text-emerald-500" },
  { id: "nexus", name: "Nexus", icon: Zap, count: 9, color: "text-amber-500" },
  { id: "vision", name: "Vision", icon: Eye, count: 10, color: "text-rose-500" },
  { id: "dream", name: "Dream", icon: Moon, count: 10, color: "text-purple-500" },
  { id: "system", name: "System", icon: Settings, count: 10, color: "text-blue-500" },
];

export function TemplateGenerator() {
  return (
    <div className="space-y-6">
      {/* Marketplace Redirect Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Code className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Template Library → Marketplace</CardTitle>
          <CardDescription className="text-base max-w-lg mx-auto">
            Our 72+ templates are now available in the Developer Marketplace. 
            Purchase templates for single-project use at competitive prices.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Category Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link 
                  key={cat.id} 
                  to="/marketplace"
                  className="p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors text-center group"
                >
                  <Icon className={`w-5 h-5 mx-auto mb-1 ${cat.color}`} />
                  <p className="font-medium text-xs">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">{cat.count}</p>
                </Link>
              );
            })}
          </div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
              <Badge className="mb-2 bg-system-green/20 text-system-green border-system-green/30">Starter</Badge>
              <p className="text-xl font-bold">$9</p>
              <p className="text-xs text-muted-foreground">Beginner</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
              <Badge className="mb-2 bg-system-amber/20 text-system-amber border-system-amber/30">Advanced</Badge>
              <p className="text-xl font-bold">$29</p>
              <p className="text-xs text-muted-foreground">Intermediate</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
              <Badge className="mb-2 bg-destructive/20 text-destructive border-destructive/30">Enterprise</Badge>
              <p className="text-xl font-bold">$49</p>
              <p className="text-xs text-muted-foreground">Advanced</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
              <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">Premium</Badge>
              <p className="text-xl font-bold">$99-$199</p>
              <p className="text-xs text-muted-foreground">World Engine+</p>
            </div>
          </div>

          {/* CTA */}
          <Button asChild size="lg" className="w-full gap-2">
            <Link to="/marketplace">
              <ShoppingCart className="w-5 h-5" />
              Visit Marketplace
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          {/* SDK Free Note */}
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-system-green/5 border border-system-green/20">
            <Sparkles className="w-4 h-4 text-system-green" />
            <span className="text-sm">
              <span className="font-medium text-system-green">SDK is free</span>
              <span className="text-muted-foreground"> — templates sold separately</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
