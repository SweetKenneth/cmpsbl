/**
 * TemplateGallery — Now redirects to paid Marketplace
 * Templates are no longer free, must purchase at /marketplace
 */

import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Package, ShoppingCart, Sparkles, ArrowRight, Code, Lock
} from "lucide-react";

export function TemplateGallery() {
  return (
    <div className="space-y-6">
      {/* Marketplace Redirect Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <CardHeader className="text-center pb-4">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
            <Package className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Templates Marketplace</CardTitle>
          <CardDescription className="text-base max-w-lg mx-auto">
            Browse 72+ production-ready templates. All templates require a purchase for single-project use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Pricing Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
              <Badge className="mb-2 bg-system-green/20 text-system-green border-system-green/30">Starter</Badge>
              <p className="text-2xl font-bold">$9</p>
              <p className="text-xs text-muted-foreground">Beginner templates</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
              <Badge className="mb-2 bg-system-amber/20 text-system-amber border-system-amber/30">Advanced</Badge>
              <p className="text-2xl font-bold">$29</p>
              <p className="text-xs text-muted-foreground">Intermediate templates</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50 text-center">
              <Badge className="mb-2 bg-destructive/20 text-destructive border-destructive/30">Enterprise</Badge>
              <p className="text-2xl font-bold">$49+</p>
              <p className="text-xs text-muted-foreground">Advanced templates</p>
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
          <Button asChild size="lg" className="w-full gap-2">
            <Link to="/marketplace">
              <ShoppingCart className="w-5 h-5" />
              Browse Marketplace
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>

          {/* SDK Free Reminder */}
          <div className="text-center p-4 rounded-lg bg-system-green/5 border border-system-green/20">
            <Sparkles className="w-5 h-5 mx-auto mb-2 text-system-green" />
            <p className="text-sm">
              <span className="font-medium text-system-green">SDK is 100% free</span>
              <span className="text-muted-foreground"> — only pay for templates you want to use</span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Category Preview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { name: "Gaming", count: 8, color: "text-violet-500" },
          { name: "World Engine", count: 5, color: "text-cyan-500" },
          { name: "AI Agents", count: 12, color: "text-emerald-500" },
          { name: "RAG Pipelines", count: 9, color: "text-amber-500" },
        ].map((cat) => (
          <Link 
            key={cat.name} 
            to="/marketplace"
            className="p-3 rounded-lg bg-muted/50 border border-border/50 hover:border-primary/50 transition-colors text-center group"
          >
            <p className={`font-medium text-sm ${cat.color}`}>{cat.name}</p>
            <p className="text-xs text-muted-foreground">{cat.count} templates</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
