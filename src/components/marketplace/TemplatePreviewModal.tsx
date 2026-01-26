/**
 * TemplatePreviewModal — Full preview with code, features, and purchase
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Code, Copy, Check, ShoppingCart, CreditCard, Eye,
  Sparkles, Zap, Clock, Star, Lock, Shield,
  Brain, Moon, MessageSquare, Settings, Server
} from 'lucide-react';
import type { Template } from '@/data/templates';
import { getTemplatePricing, formatPrice } from '@/config/marketplace-products';

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

const difficultyStyles: Record<string, string> = {
  beginner: 'bg-system-green/20 text-system-green border-system-green/30',
  intermediate: 'bg-system-amber/20 text-system-amber border-system-amber/30',
  advanced: 'bg-destructive/20 text-destructive border-destructive/30',
  premium: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  elite: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
  pro: 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
};

interface TemplatePreviewModalProps {
  template: Template | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBuy: (template: Template) => void;
  isLoading?: boolean;
}

export function TemplatePreviewModal({ 
  template, 
  open, 
  onOpenChange, 
  onBuy, 
  isLoading 
}: TemplatePreviewModalProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');

  if (!template) return null;

  const Icon = template.icon;
  const CategoryIcon = categoryIcons[template.category] || Zap;
  const pricing = getTemplatePricing(template.difficulty, template.id);

  const copyCode = () => {
    navigator.clipboard.writeText(template.code);
    setCopied(true);
    toast.success("Code snippet copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col lg:flex-row h-full max-h-[90vh]">
          {/* Left: Preview Content */}
          <div className="flex-1 flex flex-col min-w-0">
            <DialogHeader className="px-6 pt-6 pb-4 border-b shrink-0">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <DialogTitle className="text-xl font-bold mb-2">
                    {template.name}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="gap-1">
                      <CategoryIcon className="w-3 h-3" />
                      {template.category}
                    </Badge>
                    <Badge variant="outline" className={cn("text-xs", difficultyStyles[template.difficulty])}>
                      {template.difficulty}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      {template.estimatedTime}
                    </div>
                  </div>
                </div>
              </div>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
              <TabsList className="mx-6 mt-4 grid grid-cols-3 w-auto self-start">
                <TabsTrigger value="preview" className="gap-1.5">
                  <Eye className="w-4 h-4" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="code" className="gap-1.5">
                  <Code className="w-4 h-4" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="features" className="gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  Features
                </TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 px-6 py-4">
                <TabsContent value="preview" className="mt-0 space-y-4">
                  {/* Visual Preview */}
                  <div className="aspect-video rounded-xl bg-gradient-to-br from-primary/10 via-primary/5 to-muted/50 border flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 mx-auto rounded-2xl bg-card border shadow-xl flex items-center justify-center">
                        <Icon className="w-12 h-12 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-lg font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Interactive preview coming soon
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="p-4 rounded-xl bg-muted/50 border">
                    <h4 className="font-medium mb-2">About this template</h4>
                    <p className="text-sm text-muted-foreground">
                      {template.description}
                    </p>
                  </div>

                  {/* Use Cases */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-violet-500/5 border border-violet-500/20">
                      <Brain className="w-6 h-6 text-violet-500 mb-2" />
                      <h4 className="font-medium text-sm mb-1">Memory Enabled</h4>
                      <p className="text-xs text-muted-foreground">
                        Persists state across sessions
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                      <Shield className="w-6 h-6 text-rose-500 mb-2" />
                      <h4 className="font-medium text-sm mb-1">Drift Protected</h4>
                      <p className="text-xs text-muted-foreground">
                        Self-correcting behavior
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="code" className="mt-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Code Preview</h4>
                    <Button variant="outline" size="sm" onClick={copyCode} className="gap-1.5">
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-system-green" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                  <div className="relative">
                    <pre className="p-4 rounded-xl bg-zinc-950 text-zinc-100 overflow-x-auto text-sm font-mono">
                      <code>{template.code}</code>
                    </pre>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Full implementation code included with purchase. This is a preview snippet.
                  </p>
                </TabsContent>

                <TabsContent value="features" className="mt-0 space-y-4">
                  <div className="grid gap-3">
                    {template.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                        <div className="p-1.5 rounded-lg bg-primary/10">
                          <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <span className="font-medium text-sm">{feature}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      What you get
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-system-green" />
                        Full source code
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-system-green" />
                        Integration documentation
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-system-green" />
                        Single-project license
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-system-green" />
                        Substrate compatibility
                      </li>
                    </ul>
                  </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>

          {/* Right: Purchase Panel */}
          <div className="w-full lg:w-80 border-t lg:border-t-0 lg:border-l bg-muted/30 p-6 flex flex-col">
            <div className="flex-1 space-y-6">
              {/* Price */}
              <div className="text-center lg:text-left">
                <div className="text-4xl font-black text-primary">
                  {formatPrice(pricing.amount)}
                </div>
                <p className="text-sm text-muted-foreground">One-time payment</p>
              </div>

              {/* Quick Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span>Single-project license</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Code className="w-4 h-4 text-muted-foreground" />
                  <span>Full source code included</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <span>Secure payment via Stripe</span>
                </div>
              </div>

              {/* Rating placeholder */}
              <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
                  ))}
                </div>
                <span className="text-sm font-medium">5.0</span>
                <span className="text-xs text-muted-foreground">(Preview)</span>
              </div>
            </div>

            {/* CTA */}
            <div className="space-y-3 pt-6 border-t">
              <Button 
                size="lg" 
                className="w-full gap-2"
                onClick={() => onBuy(template)}
                disabled={isLoading}
              >
                <CreditCard className="w-5 h-5" />
                {isLoading ? 'Processing...' : 'Purchase Now'}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Instant delivery after payment
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
