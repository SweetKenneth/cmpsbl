/**
 * TemplateGenerator — Marketplace Advertisement in CodeLab
 * Showcases unique templates available ONLY in the Marketplace
 * Does NOT redirect - just advertises and links
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, ShoppingCart, Sparkles, ArrowRight, Lock, Crown, Star,
  Brain, Shield, Zap, Moon, Eye, MessageSquare, Settings, TrendingUp,
  Fingerprint, Flame, Target
} from "lucide-react";

// Featured templates to showcase (teasers only)
const featuredTemplates = [
  {
    id: "drift-prevention-engine",
    name: "Drift Prevention Engine",
    tagline: "THE solution for AI behavioral drift",
    price: "$399",
    icon: Brain,
    color: "text-violet-500",
    bgGradient: "from-violet-500/20 to-fuchsia-500/20",
    exclusive: true,
  },
  {
    id: "self-healing-chatbot",
    name: "Self-Healing Chatbot",
    tagline: "Auto-corrects drift in real-time",
    price: "$449",
    icon: MessageSquare,
    color: "text-cyan-500",
    bgGradient: "from-cyan-500/20 to-blue-500/20",
    exclusive: true,
  },
  {
    id: "cognitive-firewall",
    name: "Cognitive Firewall",
    tagline: "Prevents jailbreaks & prompt injection",
    price: "$399",
    icon: Shield,
    color: "text-rose-500",
    bgGradient: "from-rose-500/20 to-red-500/20",
    exclusive: true,
  },
  {
    id: "autonomous-improvement-loop",
    name: "Autonomous Improvement Loop",
    tagline: "AI that learns overnight",
    price: "$499",
    icon: Moon,
    color: "text-purple-500",
    bgGradient: "from-purple-500/20 to-indigo-500/20",
    exclusive: true,
  },
];

const categories = [
  { id: "brain", name: "Brain", icon: Brain, count: 25, color: "text-violet-500" },
  { id: "decode", name: "Decode", icon: MessageSquare, count: 18, color: "text-cyan-500" },
  { id: "defense", name: "Defense", icon: Shield, count: 15, color: "text-rose-500" },
  { id: "nexus", name: "Nexus", icon: Zap, count: 12, color: "text-emerald-500" },
  { id: "vision", name: "Vision", icon: Eye, count: 10, color: "text-blue-500" },
  { id: "dream", name: "Dream", icon: Moon, count: 10, color: "text-purple-500" },
  { id: "system", name: "System", icon: Settings, count: 7, color: "text-slate-500" },
];

export function TemplateGenerator() {
  return (
    <div className="space-y-6">
      {/* Hero Promo Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-violet-500/5 overflow-hidden relative">
        <div className="absolute top-4 right-4">
          <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 gap-1">
            <Crown className="w-3 h-3" />
            Exclusive
          </Badge>
        </div>
        
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
              <Package className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-2xl">Templates Marketplace</CardTitle>
              <CardDescription className="text-base">
                97+ production-ready templates you can't find anywhere else
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Value Proposition */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20">
            <div className="flex items-start gap-3">
              <Fingerprint className="w-6 h-6 text-amber-500 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-200">
                  Solve AI Behavioral Drift — The #1 Problem in Production AI
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Our templates include memory persistence, self-correction, and behavioral anchoring 
                  that you won't find in any other marketplace.
                </p>
              </div>
            </div>
          </div>

          {/* Featured Templates Preview */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="font-medium text-sm">Featured Templates</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featuredTemplates.map((template) => {
                const Icon = template.icon;
                return (
                  <div
                    key={template.id}
                    className={`p-3 rounded-xl bg-gradient-to-br ${template.bgGradient} border border-border/50 hover:border-primary/50 transition-all group`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-background/80 flex items-center justify-center shrink-0">
                        <Icon className={`w-5 h-5 ${template.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{template.name}</p>
                          {template.exclusive && (
                            <Lock className="w-3 h-3 text-amber-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{template.tagline}</p>
                        <p className="text-sm font-bold text-primary mt-1">{template.price}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Category Summary */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="font-medium text-sm">Browse by Category</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div 
                    key={cat.id}
                    className="p-2 rounded-lg bg-muted/50 border border-border/50 text-center"
                  >
                    <Icon className={`w-4 h-4 mx-auto mb-1 ${cat.color}`} />
                    <p className="font-medium text-xs">{cat.name}</p>
                    <p className="text-[10px] text-muted-foreground">{cat.count} templates</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50 text-center">
              <Badge className="mb-2 bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px]">Starter</Badge>
              <p className="text-lg font-bold">$27+</p>
              <p className="text-[10px] text-muted-foreground">Beginner</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50 text-center">
              <Badge className="mb-2 bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px]">Advanced</Badge>
              <p className="text-lg font-bold">$87+</p>
              <p className="text-[10px] text-muted-foreground">Intermediate</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50 text-center">
              <Badge className="mb-2 bg-rose-500/20 text-rose-400 border-rose-500/30 text-[10px]">Premium</Badge>
              <p className="text-lg font-bold">$299+</p>
              <p className="text-[10px] text-muted-foreground">Advanced</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-center">
              <Badge className="mb-2 bg-primary/20 text-primary border-primary/30 text-[10px]">Elite</Badge>
              <p className="text-lg font-bold">$399+</p>
              <p className="text-[10px] text-muted-foreground">Pro</p>
            </div>
          </div>

          {/* CTA */}
          <Button asChild size="lg" className="w-full gap-2 bg-gradient-to-r from-primary to-violet-600 hover:opacity-90">
            <Link to="/store">
              <ShoppingCart className="w-5 h-5" />
              Browse Runtime Agents
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          {/* SDK Reminder */}
          <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-sm">
              <span className="font-medium text-emerald-400">SDK is 100% free</span>
              <span className="text-muted-foreground"> — templates give you a head start</span>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
