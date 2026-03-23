/**
 * Surface C — Project Starter Panel
 * Buttons to initialize real projects with substrate
 */

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Rocket, Package, Database, Key, Cloud, Copy, Check,
  ExternalLink, Terminal, FileCode, Zap
} from "lucide-react";
import { toast } from "sonner";

interface StarterOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  steps: { title: string; code?: string; link?: string; description?: string }[];
}

const starters: StarterOption[] = [
  {
    id: "nextjs",
    title: "Next.js Project",
    description: "Create a new Next.js app with substrate SDK pre-configured",
    icon: FileCode,
    color: "text-white bg-black",
    steps: [
      {
        title: "Create Next.js App",
        code: `npx create-next-app@latest my-substrate-app --typescript --tailwind --eslint`,
        description: "Initialize a new Next.js project with TypeScript and Tailwind"
      },
      {
        title: "Import SDK",
        code: `import { substrate } from '@cmpsbl/sdk';`,
        description: "Add Supabase for substrate communication"
      },
      {
        title: "Create Substrate Client",
        code: `// lib/substrate.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function substrate(module: string, action: string, payload?: any) {
  const { data, error } = await supabase.functions.invoke('pf-substrate', {
    body: { module, action, payload }
  });
  if (error) throw error;
  return data;
}`,
        description: "Create the substrate client helper"
      },
      {
        title: "Add Environment Variables",
        code: `# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://bxodolqqczjuahwdrswy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here`,
        description: "Configure your environment"
      }
    ]
  },
  {
    id: "sdk",
    title: "Install SDK",
    description: "Add substrate SDK to an existing project",
    icon: Package,
    color: "text-neon-green bg-neon-green/10",
    steps: [
      {
        title: "Import SDK",
        code: `import { substrate } from '@cmpsbl/sdk';`,
        description: "Import the substrate SDK into your project"
      },
      {
        title: "Copy Substrate Client",
        code: `// Download from cmpsbl.com/sdk/substrate.ts
// Or copy from the CodeLab Explorer cards`,
        description: "Get the substrate client code"
      },
      {
        title: "Initialize Client",
        code: `import { substrate } from './lib/substrate';

// Example usage
const health = await substrate.vision.health();
const memory = await substrate.brain.query("recent insights");`,
        description: "Start using the substrate"
      }
    ]
  },
  {
    id: "supabase",
    title: "Supabase Schema",
    description: "Set up substrate tables in your Supabase project",
    icon: Database,
    color: "text-neon-green bg-neon-green/10",
    steps: [
      {
        title: "Core Tables",
        code: `-- Brain Memories
CREATE TABLE brain_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  memory_type VARCHAR(50) NOT NULL,
  confidence NUMERIC(3,2) DEFAULT 0.5,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Defense Events
CREATE TABLE defense_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip VARCHAR(45),
  fingerprint_hash VARCHAR(64),
  risk_score NUMERIC(3,2),
  action VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW()
);`,
        description: "Create the core substrate tables"
      },
      {
        title: "Enable RLS",
        code: `-- Enable Row Level Security
ALTER TABLE brain_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE defense_events ENABLE ROW LEVEL SECURITY;

-- Public read for memories (customize as needed)
CREATE POLICY "Public read" ON brain_memories FOR SELECT USING (true);`,
        description: "Secure your tables with RLS"
      }
    ]
  },
  {
    id: "byok",
    title: "BYOK Integrations",
    description: "Bring your own API keys for AI providers",
    icon: Key,
    color: "text-neon-amber bg-neon-amber/10",
    steps: [
      {
        title: "OpenAI",
        code: `# Add to Supabase Edge Function secrets
supabase secrets set OPENAI_API_KEY=sk-...`,
        description: "For GPT models via Nexus"
      },
      {
        title: "Anthropic",
        code: `supabase secrets set ANTHROPIC_API_KEY=sk-ant-...`,
        description: "For Claude models"
      },
      {
        title: "Google AI",
        code: `supabase secrets set GOOGLE_API_KEY=...`,
        description: "For Gemini models"
      },
      {
        title: "Configure Nexus Routing",
        description: "The NEXUS Organ will auto-detect available providers and route accordingly"
      }
    ]
  },
  {
    id: "vercel",
    title: "Deploy to Vercel",
    description: "One-click deploy your substrate-powered app",
    icon: Cloud,
    color: "text-black bg-white border",
    steps: [
      {
        title: "Push to GitHub",
        code: `git init
git add .
git commit -m "Initial substrate app"
git remote add origin https://github.com/you/my-substrate-app.git
git push -u origin main`,
        description: "Push your code to GitHub"
      },
      {
        title: "Import to Vercel",
        link: "https://vercel.com/new",
        description: "Import your repository and deploy"
      },
      {
        title: "Add Environment Variables",
        description: "Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel dashboard"
      }
    ]
  }
];

export function ProjectStarter() {
  const [copied, setCopied] = useState<string | null>(null);

  const copyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">Start Building</h2>
        <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
          Choose a starter to quickly set up your substrate-powered application
        </p>
      </div>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {starters.map((starter) => (
          <Dialog key={starter.id}>
            <DialogTrigger asChild>
              <Card className="p-6 cursor-pointer hover:border-primary/50 transition-colors group">
                <div className={`w-12 h-12 rounded-xl ${starter.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <starter.icon className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{starter.title}</h3>
                <p className="text-sm text-muted-foreground">{starter.description}</p>
                <div className="mt-4 flex items-center gap-2 text-primary text-sm font-medium">
                  <Zap className="w-4 h-4" />
                  Get Started
                </div>
              </Card>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg ${starter.color} flex items-center justify-center`}>
                    <starter.icon className="w-5 h-5" />
                  </div>
                  {starter.title}
                </DialogTitle>
                <DialogDescription>{starter.description}</DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {starter.steps.map((step, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="w-6 h-6 rounded-full p-0 flex items-center justify-center text-xs">
                        {index + 1}
                      </Badge>
                      <h4 className="font-medium">{step.title}</h4>
                    </div>
                    
                    {step.description && (
                      <p className="text-sm text-muted-foreground ml-8">{step.description}</p>
                    )}
                    
                    {step.code && (
                      <div className="relative ml-8">
                        <pre className="bg-muted/50 p-4 rounded-lg text-xs sm:text-sm font-mono overflow-auto max-h-64">
                          {step.code}
                        </pre>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={() => copyCode(step.code!, `${starter.id}-${index}`)}
                        >
                          {copied === `${starter.id}-${index}` ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    )}
                    
                    {step.link && (
                      <a
                        href={step.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-primary text-sm hover:underline ml-8"
                      >
                        Open Link
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {/* Quick Commands */}
      <Card className="p-6 mt-8">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Terminal className="w-5 h-5" />
          Quick Commands
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Check substrate health</p>
            <code className="text-sm font-mono">substrate.vision.pulse()</code>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Query memories</p>
            <code className="text-sm font-mono">substrate.brain.query("...")</code>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Generate text</p>
            <code className="text-sm font-mono">substrate.nexus.text("...")</code>
          </div>
          <div className="bg-muted/30 p-4 rounded-lg">
            <p className="text-xs text-muted-foreground mb-2">Analyze request</p>
            <code className="text-sm font-mono">substrate.defense.analyze({`{...}`})</code>
          </div>
        </div>
      </Card>
    </div>
  );
}
