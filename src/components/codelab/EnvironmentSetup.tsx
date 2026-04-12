/**
 * EnvironmentSetup — Helper for configuring secrets and environment variables
 * Interactive guide for setting up integrations
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Key, Shield, CheckCircle2, AlertCircle, Copy, Check, ExternalLink,
  Lock, Unlock, Eye, EyeOff, HelpCircle, ChevronRight, Sparkles,
  CreditCard, MessageSquare, Mail, HardDrive, Brain, Zap
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface EnvVariable {
  key: string;
  description: string;
  required: boolean;
  category: string;
  docsUrl?: string;
  example?: string;
  service: string;
  icon: React.ElementType;
}

const ENV_VARIABLES: EnvVariable[] = [
  // Stripe
  {
    key: "STRIPE_SECRET_KEY",
    description: "Secret key for Stripe API (starts with sk_)",
    required: true,
    category: "payments",
    service: "Stripe",
    icon: CreditCard,
    docsUrl: "https://stripe.com/docs/keys",
    example: "sk_test_..."
  },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    description: "Webhook signing secret for Stripe events",
    required: false,
    category: "payments",
    service: "Stripe",
    icon: CreditCard,
    docsUrl: "https://stripe.com/docs/webhooks",
    example: "whsec_..."
  },
  // Twilio
  {
    key: "TWILIO_ACCOUNT_SID",
    description: "Your Twilio Account SID",
    required: true,
    category: "messaging",
    service: "Twilio",
    icon: MessageSquare,
    docsUrl: "https://www.twilio.com/docs/usage/api/account-sid",
    example: "AC..."
  },
  {
    key: "TWILIO_AUTH_TOKEN",
    description: "Your Twilio Auth Token",
    required: true,
    category: "messaging",
    service: "Twilio",
    icon: MessageSquare,
    docsUrl: "https://www.twilio.com/docs/usage/api/authentication",
  },
  {
    key: "TWILIO_PHONE_NUMBER",
    description: "Your Twilio phone number for sending SMS",
    required: true,
    category: "messaging",
    service: "Twilio",
    icon: MessageSquare,
    example: "+1234567890"
  },
  // Resend
  {
    key: "RESEND_API_KEY",
    description: "API key for Resend email service",
    required: true,
    category: "email",
    service: "Resend",
    icon: Mail,
    docsUrl: "https://resend.com/docs/api-reference/introduction",
    example: "re_..."
  },
  // S3/R2
  {
    key: "S3_ENDPOINT",
    description: "S3-compatible endpoint URL (e.g., Cloudflare R2)",
    required: true,
    category: "storage",
    service: "S3/R2",
    icon: HardDrive,
    example: "https://account.r2.cloudflarestorage.com"
  },
  {
    key: "S3_ACCESS_KEY_ID",
    description: "Access key ID for S3/R2",
    required: true,
    category: "storage",
    service: "S3/R2",
    icon: HardDrive,
  },
  {
    key: "S3_SECRET_ACCESS_KEY",
    description: "Secret access key for S3/R2",
    required: true,
    category: "storage",
    service: "S3/R2",
    icon: HardDrive,
  },
  {
    key: "S3_BUCKET_NAME",
    description: "Name of your S3/R2 bucket",
    required: true,
    category: "storage",
    service: "S3/R2",
    icon: HardDrive,
    example: "my-app-bucket"
  },
  // OpenAI
  {
    key: "OPENAI_API_KEY",
    description: "API key for OpenAI services",
    required: false,
    category: "ai",
    service: "OpenAI",
    icon: Brain,
    docsUrl: "https://platform.openai.com/api-keys",
    example: "sk-..."
  },
  // Anthropic
  {
    key: "ANTHROPIC_API_KEY",
    description: "API key for Anthropic Claude",
    required: false,
    category: "ai",
    service: "Anthropic",
    icon: Brain,
    docsUrl: "https://console.anthropic.com/",
    example: "sk-ant-..."
  },
  // Google AI
  {
    key: "GOOGLE_AI_API_KEY",
    description: "API key for Google AI (Gemini)",
    required: false,
    category: "ai",
    service: "Google",
    icon: Zap,
    docsUrl: "https://makersuite.google.com/app/apikey",
  },
];

const CATEGORIES = [
  { id: "all", label: "All", icon: Key },
  { id: "payments", label: "Payments", icon: CreditCard },
  { id: "messaging", label: "Messaging", icon: MessageSquare },
  { id: "email", label: "Email", icon: Mail },
  { id: "storage", label: "Storage", icon: HardDrive },
  { id: "ai", label: "AI Providers", icon: Brain },
];

export function EnvironmentSetup() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [checkedVars, setCheckedVars] = useState<Record<string, boolean>>({});

  const filteredVars = ENV_VARIABLES.filter(
    v => selectedCategory === "all" || v.category === selectedCategory
  );

  const groupedVars = filteredVars.reduce((acc, v) => {
    if (!acc[v.service]) acc[v.service] = [];
    acc[v.service].push(v);
    return acc;
  }, {} as Record<string, EnvVariable[]>);

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleCheck = (key: string) => {
    setCheckedVars(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const checkedCount = Object.values(checkedVars).filter(Boolean).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green to-neon-cyan flex items-center justify-center">
            <Key className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Environment Setup</h2>
            <p className="text-muted-foreground">
              Configure secrets and API keys for your integrations
            </p>
          </div>
        </div>
        {checkedCount > 0 && (
          <Badge variant="secondary" className="text-sm">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            {checkedCount} configured
          </Badge>
        )}
      </div>

      {/* Info Alert */}
      <Alert className="border-neon-amber/30 bg-neon-amber/5">
        <Shield className="w-4 h-4 text-neon-amber" />
        <AlertDescription className="text-sm">
          <strong>Security Note:</strong> Never expose secret keys in client-side code. 
          Use edge functions or backend routes to safely access these values. 
          All secrets are stored encrypted and only accessible server-side.
        </AlertDescription>
      </Alert>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const count = cat.id === "all" 
            ? ENV_VARIABLES.length 
            : ENV_VARIABLES.filter(v => v.category === cat.id).length;
          return (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? "default" : "outline"}
              size="sm"
              className="gap-2 shrink-0"
              onClick={() => setSelectedCategory(cat.id)}
            >
              <Icon className="w-4 h-4" />
              {cat.label}
              <Badge variant="secondary" className="text-xs h-5 px-1.5">
                {count}
              </Badge>
            </Button>
          );
        })}
      </div>

      {/* Variables List */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          {Object.entries(groupedVars).map(([service, vars]) => {
            const firstVar = vars[0];
            const Icon = firstVar?.icon || Key;
            
            return (
              <Card key={service} className="p-4">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/50">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{service}</h3>
                    <p className="text-xs text-muted-foreground">
                      {vars.filter(v => v.required).length} required, {vars.filter(v => !v.required).length} optional
                    </p>
                  </div>
                  {firstVar?.docsUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto gap-1 text-xs"
                      asChild
                    >
                      <a href={firstVar.docsUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-3 h-3" />
                        Docs
                      </a>
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  {vars.map(envVar => (
                    <div
                      key={envVar.key}
                      className={cn(
                        "p-3 rounded-lg border transition-colors",
                        checkedVars[envVar.key] 
                          ? "border-neon-green/50 bg-neon-green/5" 
                          : "border-border/50 bg-muted/20"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Checkbox
                          checked={checkedVars[envVar.key] || false}
                          onCheckedChange={() => toggleCheck(envVar.key)}
                          className="mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <code className="font-mono text-sm font-semibold">
                              {envVar.key}
                            </code>
                            {envVar.required ? (
                              <Badge variant="destructive" className="text-[10px] h-4 px-1">
                                required
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] h-4 px-1">
                                optional
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {envVar.description}
                          </p>
                          {envVar.example && (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">Example:</span>
                              <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                                {envVar.example}
                              </code>
                            </div>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="shrink-0"
                          onClick={() => copyKey(envVar.key)}
                        >
                          {copiedKey === envVar.key ? (
                            <Check className="w-4 h-4 text-neon-green" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Quick Setup Guide */}
      <Card className="p-4 border-primary/30 bg-primary/5">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold mb-2">Quick Setup Steps</h4>
            <ol className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold shrink-0">1</span>
                <span>Copy the environment variable names you need</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold shrink-0">2</span>
                <span>Add them to your Cloud secrets (Cloud → Secrets)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold shrink-0">3</span>
                <span>Access them in Edge Functions via <code className="bg-muted px-1 rounded">Deno.env.get("KEY")</code></span>
              </li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  );
}
