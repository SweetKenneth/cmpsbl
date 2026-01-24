/**
 * Template & OS Marketplace — CMPSBL Developer Store
 * The World's First Production-Ready AI Governance OS
 */

import { useState, useMemo } from "react";
import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TEMPLATES, type Template } from "@/data/templates";
import { MARKETPLACE_PRODUCTS, getTemplatePricing, formatPrice, SDK_FREE_MESSAGE } from "@/config/marketplace-products";
import { MarketplaceHero } from "@/components/marketplace/MarketplaceHero";
import {
  Search, Package, Download, Star, Code, Copy, Check,
  ShoppingCart, CreditCard, Shield, Brain, MessageSquare,
  Zap, Eye, Moon, Settings, Server, Cpu, Sparkles, 
  ExternalLink, Key, Lock
} from "lucide-react";

const categoryIcons: Record<string, React.ElementType> = {
  brain: Brain,
  decode: MessageSquare,
  defense: Shield,
  nexus: Zap,
  vision: Eye,
  dream: Moon,
  system: Settings,
  world_engine: Server,
};

const difficultyBadgeStyles: Record<string, string> = {
  beginner: "bg-system-green/20 text-system-green border-system-green/30",
  intermediate: "bg-system-amber/20 text-system-amber border-system-amber/30", 
  advanced: "bg-destructive/20 text-destructive border-destructive/30",
  premium: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  elite: "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
};

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [copied, setCopied] = useState(false);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return TEMPLATES.filter((template) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          template.name.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          template.features.some(f => f.toLowerCase().includes(query));
        if (!matches) return false;
      }
      if (categoryFilter && template.category !== categoryFilter) return false;
      return true;
    });
  }, [searchQuery, categoryFilter]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TEMPLATES.forEach(t => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, []);

  const handleCheckout = async (type: 'os' | 'template', template?: Template) => {
    setIsCheckingOut(true);
    try {
      let priceId: string;
      let productId: string;
      let templateName: string | undefined;

      if (type === 'os') {
        priceId = MARKETPLACE_PRODUCTS.os_license.price_id;
        productId = MARKETPLACE_PRODUCTS.os_license.product_id;
      } else if (template) {
        const pricing = getTemplatePricing(template.difficulty);
        priceId = pricing.price_id;
        productId = pricing.product_id;
        templateName = template.name;
      } else {
        throw new Error("Template required for template purchase");
      }

      const { data, error } = await supabase.functions.invoke('marketplace-checkout', {
        body: {
          product_type: type,
          price_id: priceId,
          product_id: productId,
          template_name: templateName,
        },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error("Checkout failed. Please try again.");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <SEO
        title="Developer Marketplace | CMPSBL — World's First AI Governance OS"
        description="The only operating system that gives LLMs persistent memory, real-time governance, and autonomous improvement. Templates from $9, OS License $599. SDK is FREE."
        keywords={["CMPSBL", "AI governance OS", "cognitive operating system", "AI templates", "LLM memory", "AI security", "AI SDK"]}
      />
      <div className="min-h-screen bg-background">
        <PublicNav />

        {/* Cinematic Hero */}
        <MarketplaceHero />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {/* Tabs: Templates / OS */}
          <Tabs defaultValue="templates" className="space-y-8">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="templates" className="gap-2">
                <Code className="w-4 h-4" />
                Templates
                <Badge variant="secondary" className="ml-1">{TEMPLATES.length}</Badge>
              </TabsTrigger>
              <TabsTrigger value="os" className="gap-2">
                <Server className="w-4 h-4" />
                Substrate OS
              </TabsTrigger>
            </TabsList>

            {/* Templates Tab */}
            <TabsContent value="templates" className="space-y-6">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={categoryFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(null)}
                >
                  All ({TEMPLATES.length})
                </Button>
                {Object.entries(categoryCounts).map(([category, count]) => {
                  const Icon = categoryIcons[category] || Zap;
                  return (
                    <Button
                      key={category}
                      variant={categoryFilter === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCategoryFilter(categoryFilter === category ? null : category)}
                      className="gap-1"
                    >
                      <Icon className="w-3 h-3" />
                      {category} ({count})
                    </Button>
                  );
                })}
              </div>

              {/* Pricing Legend */}
              <div className="flex flex-wrap gap-4 p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center gap-2">
                  <Badge className={difficultyBadgeStyles.beginner}>Beginner</Badge>
                  <span className="text-sm font-medium">{formatPrice(MARKETPLACE_PRODUCTS.templates.starter.amount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={difficultyBadgeStyles.intermediate}>Intermediate</Badge>
                  <span className="text-sm font-medium">{formatPrice(MARKETPLACE_PRODUCTS.templates.advanced.amount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={difficultyBadgeStyles.advanced}>Advanced</Badge>
                  <span className="text-sm font-medium">{formatPrice(MARKETPLACE_PRODUCTS.templates.enterprise.amount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={difficultyBadgeStyles.premium}>Premium</Badge>
                  <span className="text-sm font-medium">{formatPrice(MARKETPLACE_PRODUCTS.templates.premium.amount)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={difficultyBadgeStyles.elite}>Elite</Badge>
                  <span className="text-sm font-medium">{formatPrice(MARKETPLACE_PRODUCTS.templates.elite.amount)}</span>
                </div>
              </div>

              {/* Template Grid */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredTemplates.map((template) => {
                  const Icon = template.icon;
                  const CategoryIcon = categoryIcons[template.category] || Zap;
                  const pricing = getTemplatePricing(template.difficulty, template.id);
                  
                  return (
                    <Card 
                      key={template.id} 
                      className="group hover:border-primary/50 transition-all cursor-pointer"
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base truncate">{template.name}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className={`text-xs ${difficultyBadgeStyles[template.difficulty]}`}>
                                {template.difficulty}
                              </Badge>
                              <span className="text-sm font-bold text-primary">
                                {formatPrice(pricing.amount)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <CardDescription className="line-clamp-2 mt-2">
                          {template.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-wrap gap-1 mb-3">
                          {template.features.slice(0, 2).map((f, i) => (
                            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-muted">
                              {f}
                            </span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs gap-1">
                            <CategoryIcon className="w-3 h-3" />
                            {template.category}
                          </Badge>
                          <Button size="sm" className="gap-1">
                            <ShoppingCart className="w-3 h-3" />
                            Buy
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No templates match your search.</p>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter(null);
                  }}>
                    Clear filters
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* OS Tab */}
            <TabsContent value="os" className="space-y-8">
              <div className="max-w-3xl mx-auto">
                <Card className="relative overflow-hidden border-primary/30">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-neon-cyan/5 pointer-events-none" />
                  
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-neon-cyan flex items-center justify-center">
                      <Cpu className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-2xl">Substrate OS License</CardTitle>
                    <CardDescription className="text-base">
                      Self-host the complete promptfluid® cognitive operating system
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    {/* Price */}
                    <div className="text-center">
                      <div className="text-5xl font-black text-primary">$599</div>
                      <p className="text-sm text-muted-foreground">One-time payment • Single-install license</p>
                    </div>

                    {/* What's Included */}
                    <div className="space-y-3">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Package className="w-4 h-4 text-primary" />
                        What's Included
                      </h4>
                      <ul className="grid gap-2">
                        {[
                          "Complete 12-module kernel architecture",
                          "BYOK (Bring Your Own Keys) configuration",
                          "5 starter templates included",
                          "Self-hosted deployment support",
                          "License key activation system",
                          "Documentation & setup guides",
                        ].map((item, i) => (
                          <li key={i} className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-system-green" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* License Info */}
                    <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-start gap-3">
                        <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium text-sm">Single-Install License</p>
                          <p className="text-xs text-muted-foreground">
                            Each license key can only be activated once. For multiple installations, 
                            purchase additional licenses. Enterprise volume discounts available.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <Button 
                      size="lg" 
                      className="w-full gap-2"
                      onClick={() => handleCheckout('os')}
                      disabled={isCheckingOut}
                    >
                      <CreditCard className="w-5 h-5" />
                      {isCheckingOut ? "Processing..." : "Purchase License"}
                    </Button>
                    
                    <p className="text-xs text-center text-muted-foreground">
                      Secure payment via Stripe. License key delivered instantly.
                    </p>
                  </CardContent>
                </Card>

                {/* SDK Free Reminder */}
                <div className="mt-8 p-6 rounded-xl bg-system-green/5 border border-system-green/20 text-center">
                  <Sparkles className="w-8 h-8 mx-auto mb-3 text-system-green" />
                  <h3 className="font-semibold mb-2">Don't need self-hosting?</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    The promptfluid® SDK is completely free for developers building on our hosted platform.
                    Only pay for templates if you want pre-built solutions.
                  </p>
                  <Button variant="outline" className="gap-2" asChild>
                    <a href="/devtools">
                      <Code className="w-4 h-4" />
                      Explore Free SDK
                    </a>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>

        <EnhancedFooter />
      </div>

      {/* Template Detail Modal */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedTemplate && (
                <>
                  <selectedTemplate.icon className="w-6 h-6 text-primary" />
                  {selectedTemplate.name}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          {selectedTemplate && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-6">
                {/* Pricing & Metadata */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={difficultyBadgeStyles[selectedTemplate.difficulty]}>
                    {selectedTemplate.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    {categoryIcons[selectedTemplate.category] && (
                      <>
                        {(() => {
                          const CatIcon = categoryIcons[selectedTemplate.category];
                          return <CatIcon className="w-3 h-3 mr-1" />;
                        })()}
                      </>
                    )}
                    {selectedTemplate.category}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    ~{selectedTemplate.estimatedTime}
                  </span>
                  <div className="ml-auto">
                    <span className="text-2xl font-bold text-primary">
                      {formatPrice(getTemplatePricing(selectedTemplate.difficulty, selectedTemplate.id).amount)}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <h4 className="font-medium mb-2">Features</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.features.map((f, i) => (
                      <Badge key={i} variant="secondary">{f}</Badge>
                    ))}
                  </div>
                </div>

                {/* Code Preview */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Code className="w-4 h-4" />
                      Code Preview
                    </h4>
                    <Button variant="ghost" size="sm" onClick={() => copyCode(selectedTemplate.code)}>
                      {copied ? <Check className="w-4 h-4 text-system-green" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm max-h-[300px]">
                    <code>{selectedTemplate.code}</code>
                  </pre>
                </div>

                {/* License Info */}
                <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                  <p className="text-sm text-muted-foreground">
                    <strong>Single-Project License:</strong> This template can be used in one project. 
                    For use in additional projects, purchase another license.
                  </p>
                </div>

                {/* Purchase Button */}
                <Button 
                  size="lg" 
                  className="w-full gap-2"
                  onClick={() => handleCheckout('template', selectedTemplate)}
                  disabled={isCheckingOut}
                >
                  <ShoppingCart className="w-5 h-5" />
                  {isCheckingOut ? "Processing..." : `Purchase for ${formatPrice(getTemplatePricing(selectedTemplate.difficulty, selectedTemplate.id).amount)}`}
                </Button>
              </div>
            </ScrollArea>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
