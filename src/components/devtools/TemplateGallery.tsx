/**
 * TemplateGallery — Marketplace Advertisement
 * Showcases unique templates available in the Marketplace
 * Does NOT redirect - advertises and links to /marketplace
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, ShoppingCart, Sparkles, ArrowRight, Code, Lock, Crown, Star,
  Brain, Shield, Zap, Moon, Eye, MessageSquare
} from "lucide-react";

// Highlight the unique value proposition
const marketplaceHighlights = [
  { label: "97+ Templates", description: "Production-ready patterns" },
  { label: "Drift Prevention", description: "Solve AI behavioral drift" },
  { label: "Memory Systems", description: "Persistent AI memory" },
  { label: "Self-Healing", description: "Auto-correcting AI" },
];

export function TemplateGallery() {
  return (
    <div className="space-y-6">
      {/* Marketplace Promo Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-neon-purple/5">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-neon-purple flex items-center justify-center">
            <Package className="w-8 h-8 text-primary-foreground" />
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <CardTitle className="text-2xl">Templates Marketplace</CardTitle>
            <Badge className="bg-gradient-to-r from-neon-amber to-neon-amber text-white border-0">
              <Crown className="w-3 h-3 mr-1" />
              Exclusive
            </Badge>
          </div>
          <CardDescription className="text-base max-w-lg mx-auto">
            97+ production-ready templates with features you can't find anywhere else. 
            All templates include our proprietary drift prevention technology.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Value Highlights */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {marketplaceHighlights.map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-muted/50 border border-border/50 text-center">
                <p className="font-semibold text-sm text-primary">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Pricing Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
              <Badge className="mb-2 bg-neon-green/20 text-neon-green border-neon-green/30">Starter</Badge>
              <p className="text-2xl font-bold">$27</p>
              <p className="text-xs text-muted-foreground">Beginner templates</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
              <Badge className="mb-2 bg-neon-amber/20 text-neon-amber border-neon-amber/30">Advanced</Badge>
              <p className="text-2xl font-bold">$87-$147</p>
              <p className="text-xs text-muted-foreground">Intermediate templates</p>
            </div>
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
              <Badge className="mb-2 bg-primary/20 text-primary border-primary/30">Premium+</Badge>
              <p className="text-2xl font-bold">$299-$499</p>
              <p className="text-xs text-muted-foreground">Advanced & Elite</p>
            </div>
          </div>

          {/* License Info */}
          <div className="flex items-start gap-3 p-4 rounded-lg bg-muted/30 border border-border/50">
            <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium text-sm">Single-Project License</p>
              <p className="text-xs text-muted-foreground">
                Each purchased template can be used in one project. The SDK remains free for all developers.
              </p>
            </div>
          </div>

          {/* CTA */}
          <Button asChild size="lg" className="w-full gap-2 bg-gradient-to-r from-primary to-neon-purple hover:opacity-90">
            <Link to="/store">
              <ShoppingCart className="w-5 h-5" />
              Browse Runtime Agents
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          {/* SDK Free Reminder */}
          <div className="text-center p-4 rounded-lg bg-neon-green/5 border border-neon-green/20">
            <Sparkles className="w-5 h-5 mx-auto mb-2 text-neon-green" />
            <p className="text-sm">
              <span className="font-medium text-neon-green">SDK is 100% free</span>
              <span className="text-muted-foreground"> — only pay for templates you want</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Category Preview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { name: "Brain", count: 25, color: "text-neon-purple", icon: Brain },
          { name: "Defense", count: 15, color: "text-neon-magenta", icon: Shield },
          { name: "Nexus", count: 12, color: "text-neon-green", icon: Zap },
          { name: "Dream", count: 10, color: "text-neon-purple", icon: Moon },
        ].map((cat) => {
          const Icon = cat.icon;
          return (
            <Link 
              key={cat.name} 
              to="/store"
              className="p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors text-center group"
            >
              <Icon className={`w-5 h-5 mx-auto mb-1 ${cat.color}`} />
              <p className={`font-medium text-sm ${cat.color}`}>{cat.name}</p>
              <p className="text-xs text-muted-foreground">{cat.count} templates</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
