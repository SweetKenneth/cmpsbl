/**
 * Field — The Developer Hub
 *
 * Public-facing showcase of the substrate "in the wild" (XCTBL universe federation)
 * + scaffolding for upcoming substrate training content.
 *
 * Strict rule: NO XCTBL lore terminology bleeds onto this page.
 * Each federation site is described in neutral, enterprise-clean language.
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, BookOpen, Code2, Network, Sparkles } from "lucide-react";

const FEDERATION_SITES = [
  { code: "XCTBL",  url: "https://xctbl.com",  role: "Federation hub" },
  { code: "RCRDBL", url: "https://rcrdbl.com", role: "Records & retention" },
  { code: "RNDRBL", url: "https://rndrbl.com", role: "Engineering log" },
  { code: "PTCHBL", url: "https://ptchbl.com", role: "Settler narrative" },
  { code: "SPLCBL", url: "https://splcbl.com", role: "Navigation surface" },
  { code: "RCKBL",  url: "https://rckbl.com",  role: "Companion narrative" },
  { code: "RSVBL",  url: "https://rsvbl.com",  role: "Preservation archive" },
  { code: "RSLVBL", url: "https://rslvbl.com", role: "Transmissions hub" },
];

const TRAINING_TRACKS = [
  {
    title: "Quickstart",
    desc: "Install @cmpsbl/runtime, attach Layer 2, run your first governed call.",
    eta: "Coming this week",
    icon: Sparkles,
  },
  {
    title: "Primitives Reference",
    desc: "The 40-primitive matrix — what each organ, layer, engine, and agent does.",
    eta: "Coming this week",
    icon: BookOpen,
  },
  {
    title: "Tutorials",
    desc: "Step-by-step walkthroughs for Ascension, Mana wrapping, and Lex governance.",
    eta: "In progress",
    icon: Code2,
  },
];

export default function Field() {
  return (
    <>
      <SEO
        title="Developer Hub — CMPSBL® in the Field"
        description="The CMPSBL substrate in the wild: 8 independent worlds federate against one public 40-primitive registry. Plus tutorials, references, and quickstarts."
        canonical="https://cmpsbl.com/field"
      />
      <div className="min-h-screen bg-background flex flex-col">
        <PublicNav />

        <main className="flex-1">
          {/* Hero */}
          <section className="border-b border-border/50">
            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-16 lg:py-24">
              <Badge variant="outline" className="mb-4 font-mono text-[10px] uppercase tracking-[0.2em]">
                Developer Hub
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
                The Substrate in the Field
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-3xl leading-relaxed">
                Eight independent worlds. Forty primitives. One public registry.
                If a fixed 40-primitive matrix can power eight federated universes
                consistently, it can power your stack.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild>
                  <a href="#in-the-wild">
                    See it in the wild
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="#learn">Learn the substrate</a>
                </Button>
              </div>
            </div>
          </section>

          {/* In the Wild */}
          <section id="in-the-wild" className="border-b border-border/50">
            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-16">
              <div className="flex items-center gap-2 mb-2">
                <Network className="h-5 w-5 text-primary" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Federation
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">In the Wild</h2>
              <p className="text-muted-foreground max-w-2xl mb-10">
                Eight independent sites pull the canonical 40-primitive registry from
                <code className="mx-1 px-1.5 py-0.5 bg-muted rounded text-xs font-mono">cmpsbl.com/api/public/primitives.json</code>
                and express the same matrix through their own surfaces. Each site is
                independently themed and operated. No shared SSO, no shared codebase —
                only the public registry binds them.
              </p>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {FEDERATION_SITES.map((site) => (
                  <a
                    key={site.code}
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group"
                  >
                    <Card className="h-full hover:border-primary/50 hover:bg-card/80 transition-all">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg font-mono tracking-wider">
                            {site.code}
                          </CardTitle>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="text-xs">
                          {site.role}
                        </CardDescription>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>

              <div className="mt-8 p-4 rounded-lg border border-border/50 bg-muted/20">
                <p className="text-xs font-mono text-muted-foreground">
                  <span className="text-foreground">Public registry:</span>{" "}
                  <a
                    href="/api/public/primitives.json"
                    className="text-primary hover:underline"
                  >
                    /api/public/primitives.json
                  </a>{" "}
                  · 40 primitives · CORS-open · read-only
                </p>
              </div>
            </div>
          </section>

          {/* Learn the Substrate */}
          <section id="learn">
            <div className="max-w-6xl mx-auto px-4 lg:px-6 py-16">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="h-5 w-5 text-primary" />
                <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Training
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">Learn the Substrate</h2>
              <p className="text-muted-foreground max-w-2xl mb-10">
                Hands-on training for the 40-primitive matrix. Quickstarts, reference docs,
                and end-to-end tutorials — landing here as we ship them.
              </p>

              <div className="grid md:grid-cols-3 gap-4">
                {TRAINING_TRACKS.map((track) => {
                  const Icon = track.icon;
                  return (
                    <Card key={track.title} className="h-full">
                      <CardHeader>
                        <Icon className="h-5 w-5 text-primary mb-2" />
                        <CardTitle className="text-lg">{track.title}</CardTitle>
                        <CardDescription>{track.desc}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="secondary" className="text-[10px] font-mono uppercase tracking-wider">
                          {track.eta}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Button variant="outline" asChild>
                  <a href="/api-access">
                    API Access
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/documentation">Documentation</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/foundations">Foundations</a>
                </Button>
              </div>
            </div>
          </section>
        </main>

        <EnhancedFooter />
      </div>
    </>
  );
}
