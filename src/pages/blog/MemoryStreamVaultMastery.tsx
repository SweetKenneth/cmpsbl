/**
 * Your Vault: Mastering Pipeline Management in the Memory Stream
 */
import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles, ArrowRight, Download, Layers, Shield, CheckCircle, Archive, FileJson, Lock, Eye } from "lucide-react";
import { SEO } from "@/components/SEO";
import { AuthorBio } from "@/components/AuthorBio";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/blog/memory-stream-vault-mastery.jpg";

export default function MemoryStreamVaultMastery() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Your Vault: Mastering Pipeline Management in the Memory Stream — CMPSBL"
        description="Learn how to manage, organize, and export your crystallized pipelines. A complete guide to the Memory Stream Vault — from auto-save mechanics to JSON materialization and tier-based analytics."
        type="article"
        publishedTime="2026-03-04"
        keywords={['memory stream vault', 'pipeline management', 'JSON export', 'crystallized pipelines', 'CMPSBL vault', 'pipeline inventory', 'software asset management']}
      />

      <PublicNav />

      <section className="relative z-10 container mx-auto px-4 pt-20 md:pt-32 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Research
          </Link>

          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
            <Archive className="w-3 h-3 mr-1" />
            Featured
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
            Your Vault: Mastering Pipeline Management in the Memory Stream
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Your Vault is more than storage — it's a governed, secure inventory of every pipeline you've ever crystallized. 
            Here's how to use it effectively, from organization to export to analytics.
          </p>

          <AuthorBio publishDate="2026-03-04" readTime="16 min read" />
        </div>
      </section>

      <section className="relative w-full h-[50vh] overflow-hidden">
        <img
          src={heroImage}
          alt="Digital vault with crystallized software artifacts organized by tier on illuminated obsidian shelves"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </section>

      <article className="container mx-auto max-w-3xl px-4 py-16 space-y-16">

        {/* Auto-Save */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground">Automatic Persistence</h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Every pipeline you crystallize is <strong className="text-foreground">automatically saved to your Vault</strong>. 
              There's no save button, no confirmation dialog, no risk of losing a discovery. The moment the crystallization 
              engine produces a result, it's persisted to the database with your user ID attached via row-level security.
            </p>
            <p>
              This means your Vault is always up to date. If your browser crashes mid-crystallization, if your network 
              drops, if you accidentally close the tab — your discoveries are safe. The persistence happens server-side, 
              not in your browser.
            </p>

            <Card className="p-6 bg-muted/30 border-border">
              <h4 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security Model
              </h4>
              <ul className="space-y-2">
                {[
                  "Row-Level Security (RLS) ensures only you can access your Vault",
                  "Server-side persistence — no client-side storage dependency",
                  "Immutable provenance chain — discovery metadata cannot be altered after crystallization",
                  "Rate-limited access to prevent enumeration attacks",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </section>

        {/* What's Stored */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground">What's in Each Pipeline Record</h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              Every Vault entry contains a comprehensive metadata record. This isn't just a name and a score — it's a 
              full provenance document that traces the pipeline from signal to crystal:
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: FileJson, label: "Pipeline Name", desc: "Human-readable identifier generated by the engine" },
                { icon: Layers, label: "Category", desc: "Domain classification (data, utility, framework, etc.)" },
                { icon: Sparkles, label: "CJPI Score", desc: "Composite quality score from 68–100" },
                { icon: Archive, label: "Quality Tier", desc: "Mint, Prime, Relic, Mythic, or Apex" },
                { icon: Eye, label: "System Chain", desc: "Which substrate nodes contributed to discovery" },
                { icon: Shield, label: "Provenance Hash", desc: "Cryptographic fingerprint of the discovery event" },
              ].map((item) => (
                <div key={item.label} className="flex gap-3 items-start p-3 rounded-lg border border-border bg-card">
                  <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-foreground text-sm">{item.label}</span>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vault Analytics */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground">Vault Analytics</h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              The <Link to="/foundry" className="text-primary hover:underline">Memory Stream dashboard</Link> provides real-time 
              analytics about your Vault:
            </p>
            <ul className="space-y-3 ml-6">
              {[
                "Total pipeline count — how many discoveries you've crystallized",
                "Best pull — your highest CJPI score and its tier",
                "Total crystallizations — lifetime count including re-pulls",
                "Streak days — consecutive days with at least one crystallization",
                "Tier distribution — breakdown of Mint, Prime, Relic, Mythic, and Apex counts",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p>
              These metrics aren't vanity numbers — they give you genuine insight into the quality distribution of 
              your collection and help you understand the statistical patterns of the discovery engine.
            </p>
          </div>
        </section>

        {/* Exporting */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground">Materializing & Exporting Pipelines</h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <p>
              The Memory Stream isn't a walled garden. Every pipeline in your Vault can be{" "}
              <strong className="text-foreground">materialized</strong> — exported as a complete JSON artifact that you 
              own and can use however you want.
            </p>
            <p>
              There are two export methods:
            </p>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="p-5 bg-muted/30">
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" />
                  Single Export
                </h4>
                <p className="text-sm text-muted-foreground">
                  Click "Export" on any individual pipeline in your Vault to download its complete JSON artifact 
                  including metadata, scoring breakdown, and provenance chain.
                </p>
              </Card>

              <Card className="p-5 bg-muted/30">
                <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                  <Archive className="w-4 h-4 text-primary" />
                  Bulk Export
                </h4>
                <p className="text-sm text-muted-foreground">
                  Export your entire Vault as a single JSON file — useful for backup, analysis, 
                  or feeding into your own development pipeline.
                </p>
              </Card>
            </div>

            <p>
              Materialized JSON includes everything: the pipeline specification, system chain, quality dimensions, 
              and a timestamp-linked provenance record. It's the full artifact, not a summary.
            </p>
          </div>
        </section>

        {/* Best Practices */}
        <section>
          <h2 className="text-3xl font-bold mb-6 text-foreground">Vault Best Practices</h2>
          <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
            <ol className="space-y-4 list-decimal list-outside ml-6">
              <li>
                <strong className="text-foreground">Crystallize regularly.</strong> The engine's pattern detection improves 
                with activity. Regular crystallization gives you a statistically meaningful sample of the stream.
              </li>
              <li>
                <strong className="text-foreground">Export your Relics and above.</strong> High-tier discoveries are rare. 
                Materialize them immediately so you have a local backup alongside the server-side persistence.
              </li>
              <li>
                <strong className="text-foreground">Track your tier distribution.</strong> Understanding your personal 
                distribution helps you appreciate just how special high-tier pulls are — and confirms the weighted 
                engine is working as designed.
              </li>
              <li>
                <strong className="text-foreground">Use the system chain data.</strong> Every pipeline records which substrate 
                nodes contributed. This gives you insight into which parts of the{" "}
                <Link to="/architecture" className="text-primary hover:underline">38-node architecture</Link> are most active in 
                producing high-quality software.
              </li>
              <li>
                <strong className="text-foreground">Don't sleep on Mint.</strong> Mint-tier pipelines are production-grade 
                software. They may not have the glamour of a Mythic pull, but they're genuinely useful tools that 
                would cost thousands to develop from scratch.
              </li>
            </ol>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-card border border-border rounded-xl p-8 text-center space-y-4">
          <h3 className="text-2xl font-bold text-foreground">Open Your Vault</h3>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Sign in and view your complete crystallization history, analytics, and export options.
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg">
              <Link to="/foundry">
                <Archive className="w-4 h-4 mr-2" />
                Open Memory Stream
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/blog/memory-stream-crystallization-guide">Complete Guide <ArrowRight className="w-4 h-4 ml-2" /></Link>
            </Button>
          </div>
        </section>

        {/* Related */}
        <section>
          <h3 className="text-xl font-bold mb-4 text-foreground">Related Reading</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { title: "Memory Stream: The Complete Guide", href: "/blog/memory-stream-crystallization-guide" },
              { title: "Signal → Silicon: The Full Narrative", href: "/blog/signal-to-silicon-narrative" },
              { title: "Anatomy of Memory Stream Tiers", href: "/blog/memory-stream-tier-anatomy-rarity" },
              { title: "Autonomous Discovery Engine Architecture", href: "/blog/autonomous-discovery-engine-architecture" },
            ].map((link) => (
              <Link key={link.href} to={link.href} className="block p-4 border border-border rounded-lg hover:border-primary/40 transition-colors">
                <span className="text-sm font-medium text-primary">{link.title}</span>
                <ArrowRight className="w-3 h-3 text-muted-foreground inline ml-2" />
              </Link>
            ))}
          </div>
        </section>
      </article>

      <EnhancedFooter />
    </div>
  );
}
