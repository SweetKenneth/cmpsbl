/**
 * IntegrationsHub — Developer Integration Center for CodeLab
 * Comprehensive hub for Stripe, Twilio, Resend, and S3/Cloudflare integrations
 */

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  CreditCard,
  MessageSquare,
  Mail,
  HardDrive,
  Copy,
  Check,
  ExternalLink,
  Zap,
  Code,
  BookOpen,
  Lock,
  Unlock,
  ChevronRight,
  Play,
  FileCode,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgGradient: string;
  category: "payments" | "messaging" | "email" | "storage";
  features: string[];
  quickStart: string;
  codeTemplate: string;
  docsUrl: string;
  requiresAuth: boolean;
  envVars: string[];
}

const INTEGRATIONS: Integration[] = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Accept payments, subscriptions, and invoices with the world's leading payment platform.",
    icon: CreditCard,
    color: "text-neon-purple",
    bgGradient: "from-neon-purple/10 to-neon-purple/10",
    category: "payments",
    features: ["One-time payments", "Subscriptions", "Customer portal", "Webhooks", "Invoices"],
    quickStart: `// 1. Create checkout session (Edge Function)
const session = await stripe.checkout.sessions.create({
  mode: "payment", // or "subscription"
  line_items: [{ price: "price_xxx", quantity: 1 }],
  success_url: \`\${origin}/success\`,
  cancel_url: \`\${origin}/cancel\`,
});`,
    codeTemplate: `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
    apiVersion: "2025-08-27.basil",
  });

  try {
    const { priceId, mode = "payment" } = await req.json();
    
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode,
      success_url: \`\${req.headers.get("origin")}/success\`,
      cancel_url: \`\${req.headers.get("origin")}/cancel\`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});`,
    docsUrl: "https://stripe.com/docs",
    requiresAuth: true,
    envVars: ["STRIPE_SECRET_KEY"],
  },
  {
    id: "twilio",
    name: "Twilio",
    description: "Send SMS, WhatsApp messages, and voice calls with powerful communication APIs.",
    icon: MessageSquare,
    color: "text-destructive",
    bgGradient: "from-destructive/10 to-neon-amber/10",
    category: "messaging",
    features: ["SMS messaging", "WhatsApp", "Voice calls", "Programmable messaging", "Verification"],
    quickStart: `// Send SMS with Twilio
const message = await twilioClient.messages.create({
  body: "Hello from your app!",
  from: "+1234567890",
  to: "+0987654321",
});`,
    codeTemplate: `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  try {
    const { to, message } = await req.json();

    const response = await fetch(
      \`https://api.twilio.com/2010-04-01/Accounts/\${accountSid}/Messages.json\`,
      {
        method: "POST",
        headers: {
          "Authorization": "Basic " + btoa(\`\${accountSid}:\${authToken}\`),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber!,
          Body: message,
        }),
      }
    );

    const data = await response.json();
    return new Response(JSON.stringify({ success: true, sid: data.sid }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});`,
    docsUrl: "https://www.twilio.com/docs",
    requiresAuth: true,
    envVars: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN", "TWILIO_PHONE_NUMBER"],
  },
  {
    id: "resend",
    name: "Resend",
    description: "Modern email API for developers. Send transactional and marketing emails with ease.",
    icon: Mail,
    color: "text-neon-cyan",
    bgGradient: "from-neon-cyan/10 to-neon-blue/10",
    category: "email",
    features: ["Transactional emails", "Email templates", "Analytics", "Webhooks", "React Email"],
    quickStart: `// Send email with Resend
const { data } = await resend.emails.send({
  from: "noreply@yourdomain.com",
  to: ["user@example.com"],
  subject: "Welcome!",
  html: "<p>Hello from your app!</p>",
});`,
    codeTemplate: `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

  try {
    const { to, subject, html, from = "noreply@yourdomain.com" } = await req.json();

    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    });

    if (error) throw new Error(error.message);

    return new Response(JSON.stringify({ success: true, id: data?.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});`,
    docsUrl: "https://resend.com/docs",
    requiresAuth: true,
    envVars: ["RESEND_API_KEY"],
  },
  {
    id: "s3",
    name: "S3 / Cloudflare R2",
    description: "Object storage for files, images, and assets. Compatible with AWS S3 and Cloudflare R2.",
    icon: HardDrive,
    color: "text-neon-amber",
    bgGradient: "from-neon-amber/10 to-neon-amber/10",
    category: "storage",
    features: ["File uploads", "Signed URLs", "CDN delivery", "Bucket policies", "Multipart uploads"],
    quickStart: `// Upload file to S3/R2
const command = new PutObjectCommand({
  Bucket: "my-bucket",
  Key: "uploads/" + filename,
  Body: fileBuffer,
  ContentType: contentType,
});
await s3Client.send(command);`,
    codeTemplate: `import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { S3Client, PutObjectCommand, GetObjectCommand } from "npm:@aws-sdk/client-s3@3.400.0";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner@3.400.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const s3Client = new S3Client({
  region: "auto",
  endpoint: Deno.env.get("S3_ENDPOINT"), // e.g., Cloudflare R2 endpoint
  credentials: {
    accessKeyId: Deno.env.get("S3_ACCESS_KEY_ID")!,
    secretAccessKey: Deno.env.get("S3_SECRET_ACCESS_KEY")!,
  },
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, key, contentType } = await req.json();
    const bucket = Deno.env.get("S3_BUCKET_NAME")!;

    if (action === "getUploadUrl") {
      const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: contentType,
      });
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return new Response(JSON.stringify({ url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "getDownloadUrl") {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key });
      const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
      return new Response(JSON.stringify({ url }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error("Invalid action");
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});`,
    docsUrl: "https://docs.aws.amazon.com/s3/",
    requiresAuth: true,
    envVars: ["S3_ENDPOINT", "S3_ACCESS_KEY_ID", "S3_SECRET_ACCESS_KEY", "S3_BUCKET_NAME"],
  },
];

const CATEGORY_META = {
  payments: { label: "Payments", icon: CreditCard, color: "text-neon-purple" },
  messaging: { label: "Messaging", icon: MessageSquare, color: "text-destructive" },
  email: { label: "Email", icon: Mail, color: "text-neon-cyan" },
  storage: { label: "Storage", icon: HardDrive, color: "text-neon-amber" },
};

export function IntegrationsHub() {
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"overview" | "template" | "guide">("overview");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const integration = INTEGRATIONS.find((i) => i.id === selectedIntegration);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Integration Hub</h2>
            <p className="text-muted-foreground">
              Connect your app to popular services with ready-to-use templates
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Unlock className="w-4 h-4 text-neon-green" />
          <span>Templates are public</span>
          <span className="mx-2">•</span>
          <Lock className="w-4 h-4 text-neon-amber" />
          <span>Live connectors require auth</span>
        </div>
      </div>

      {/* Integration Cards Grid */}
      {!selectedIntegration && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INTEGRATIONS.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className={cn(
                  "p-5 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg border-2 hover:border-primary/50",
                  `bg-gradient-to-br ${item.bgGradient}`
                )}
                onClick={() => setSelectedIntegration(item.id)}
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center shrink-0">
                    <Icon className={cn("w-6 h-6", item.color)} />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <Badge variant="outline" className="text-xs capitalize">
                      {item.category}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {item.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {item.features.slice(0, 3).map((f, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">
                      {f}
                    </Badge>
                  ))}
                  {item.features.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{item.features.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    {item.requiresAuth ? (
                      <>
                        <Lock className="w-3 h-3" /> Auth required
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3" /> Public
                      </>
                    )}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Integration Detail View */}
      {integration && (
        <div className="space-y-6">
          {/* Back button and header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedIntegration(null);
                setActiveSection("overview");
              }}
            >
              ← Back to all
            </Button>
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  `bg-gradient-to-br ${integration.bgGradient}`
                )}
              >
                <integration.icon className={cn("w-5 h-5", integration.color)} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{integration.name}</h3>
                <p className="text-sm text-muted-foreground">{integration.description}</p>
              </div>
            </div>
          </div>

          {/* Section tabs - mobile optimized */}
          <Tabs value={activeSection} onValueChange={(v) => setActiveSection(v as typeof activeSection)}>
            <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 pb-2">
              <TabsList className="inline-flex w-auto min-w-max sm:grid sm:w-full sm:grid-cols-3 sm:max-w-md">
                <TabsTrigger value="overview" className="gap-2 whitespace-nowrap px-4">
                  <Sparkles className="w-4 h-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="template" className="gap-2 whitespace-nowrap px-4">
                  <Code className="w-4 h-4" />
                  Template
                </TabsTrigger>
                <TabsTrigger value="guide" className="gap-2 whitespace-nowrap px-4">
                  <BookOpen className="w-4 h-4" />
                  Guide
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6 mt-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Features */}
                <Card className="p-5">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-neon-amber" />
                    Features
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {integration.features.map((f, i) => (
                      <Badge key={i} variant="secondary">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Environment Variables */}
                <Card className="p-5">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-neon-green" />
                    Required Secrets
                  </h4>
                  <div className="space-y-2">
                    {integration.envVars.map((env, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-2 rounded bg-muted/50 font-mono text-sm"
                      >
                        <span>{env}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyCode(env, `env-${i}`)}
                        >
                          {copiedId === `env-${i}` ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Quick Start */}
              <Card className="p-5">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Play className="w-4 h-4 text-neon-cyan" />
                  Quick Start
                </h4>
                <div className="relative">
                  <pre className="bg-muted/80 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-border/50">
                    <code>{integration.quickStart}</code>
                  </pre>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => copyCode(integration.quickStart, "quickstart")}
                  >
                    {copiedId === "quickstart" ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </Card>

              {/* External Links */}
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="outline" className="gap-2">
                  <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    Official Docs
                  </a>
                </Button>
              </div>
            </TabsContent>

            {/* Template Tab */}
            <TabsContent value="template" className="space-y-6 mt-6">
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-neon-purple" />
                    Edge Function Template
                  </h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      supabase/functions/{integration.id}/index.ts
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => copyCode(integration.codeTemplate, "template")}
                    >
                      {copiedId === "template" ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy Template
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <pre className="bg-muted/80 p-4 rounded-lg font-mono text-xs overflow-x-auto border border-border/50 max-h-[500px] overflow-y-auto">
                    <code>{integration.codeTemplate}</code>
                  </pre>
                </div>
              </Card>
            </TabsContent>

            {/* Guide Tab */}
            <TabsContent value="guide" className="space-y-6 mt-6">
              <Card className="p-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-neon-green" />
                  Setup Guide: {integration.name}
                </h4>
                <div className="space-y-6">
                  {/* Step 1 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                      1
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Create an account</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        Sign up for {integration.name} and create a project or app.
                      </p>
                      <Button asChild variant="outline" size="sm" className="gap-2">
                        <a href={integration.docsUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" />
                          Visit {integration.name}
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                      2
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Get your API keys</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        Locate your API credentials in the {integration.name} dashboard. You'll need:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {integration.envVars.map((env, i) => (
                          <Badge key={i} variant="secondary" className="font-mono text-xs">
                            {env}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                      3
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Add secrets to your project</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        Add your API keys as secrets in Cloud. Go to Settings → Cloud → Secrets.
                      </p>
                    </div>
                  </div>

                  {/* Step 4 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 font-bold text-primary">
                      4
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Create the Edge Function</h5>
                      <p className="text-sm text-muted-foreground mb-2">
                        Create a new file at{" "}
                        <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
                          supabase/functions/{integration.id}/index.ts
                        </code>{" "}
                        and paste the template code.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                          setActiveSection("template");
                        }}
                      >
                        <Code className="w-3 h-3" />
                        View Template
                      </Button>
                    </div>
                  </div>

                  {/* Step 5 */}
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center shrink-0 font-bold text-neon-green">
                      ✓
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2 text-neon-green">You're ready!</h5>
                      <p className="text-sm text-muted-foreground">
                        Call your Edge Function from the frontend using{" "}
                        <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
                          supabase.functions.invoke('{integration.id}', {"{ body }"}
                        </code>
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
