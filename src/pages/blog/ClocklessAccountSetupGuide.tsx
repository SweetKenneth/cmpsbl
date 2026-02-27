/**
 * PILLAR POST: Getting Started with CMPSBL — Account Setup & Artifact Pack Guide
 * 1600+ words, multiple images, heavy internal linking
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Layers, Shield, Brain, Zap, Package, Target, Fingerprint, Activity, Route, Lightbulb, ChevronRight, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

import heroImg from "@/assets/blog/clockless-account-setup-artifact-packs.jpg";
import artifactPackImg from "@/assets/blog/artifact-pack-capabilities.jpg";
import modulesImg from "@/assets/blog/clockless-modules-deep-dive.jpg";

export default function ClocklessAccountSetupGuide() {
  return (
    <>
      <SEO
        title="Getting Started with CMPSBL: Account Setup & Artifact Packs"
        description="Complete guide to setting up your CMPSBL account and choosing the right artifact pack. Learn what makes composable cognitive infrastructure different from traditional AI platforms."
        type="article"
        publishedTime="2026-02-27"
        keywords={['CMPSBL setup guide', 'artifact pack selection', 'composable AI infrastructure', 'cognitive substrate account', 'AI platform onboarding', 'Clockless Cognitive Reality']}
      />
      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="pt-24 pb-12 border-b border-border/50">
          <div className="container mx-auto px-4 max-w-4xl">
            <Button variant="ghost" size="sm" asChild className="mb-6">
              <Link to="/blog"><ArrowLeft className="w-4 h-4 mr-2" />Back to Blog</Link>
            </Button>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge className="bg-primary/10 text-primary border-primary/20">Pillar Guide</Badge>
              <Badge variant="outline">Getting Started</Badge>
              <Badge variant="outline">Platform</Badge>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Getting Started with CMPSBL: Your Complete Account Setup &amp; Artifact Pack Guide
            </h1>

            <p className="text-xl text-muted-foreground mb-6">
              Everything you need to know about setting up your CMPSBL account, choosing the right artifact pack for your use case, and understanding what composable cognitive infrastructure gives you that no other platform can.
            </p>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />February 27, 2026</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />18 min read</span>
            </div>

            <img src={heroImg} alt="CMPSBL account setup dashboard showing artifact pack selection wizard" className="w-full rounded-xl border border-border/50 shadow-xl" />
          </div>
        </section>

        {/* Article Body */}
        <article className="container mx-auto px-4 max-w-4xl py-12 prose prose-invert prose-lg max-w-none">
          <p className="text-xl leading-relaxed">
            When you sign up for <Link to="/" className="text-primary hover:underline">CMPSBL</Link>, you're not just creating another cloud account. You're provisioning a <strong>governed cognitive substrate</strong> — a living runtime where memory persists, intelligence compounds, and every module operates under auditable governance. This guide walks you through the entire setup process, from account creation to choosing your first artifact pack.
          </p>

          <h2 id="what-is-cmpsbl" className="text-2xl font-bold mt-12 mb-4">What Is CMPSBL?</h2>
          <p>
            CMPSBL is composable AI infrastructure featuring the Clockless Cognitive Reality engine — where intelligence isn't just computed, it's <em>retained</em>. Unlike traditional AI platforms that treat every request as stateless, CMPSBL provides a unified substrate with{" "}
            <Link to="/persistent-memory" className="text-primary hover:underline">persistent memory</Link>, {" "}
            <Link to="/modules" className="text-primary hover:underline">modular architecture</Link>, and{" "}
            <Link to="/blog/autonomous-ai-governance-runtime-enforcement" className="text-primary hover:underline">runtime governance</Link> built in from the ground up.
          </p>
          <p>
            If you're coming from platforms like <a href="https://openai.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI <ExternalLink className="w-3 h-3 inline" /></a>, <a href="https://www.anthropic.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Anthropic <ExternalLink className="w-3 h-3 inline" /></a>, or <a href="https://cloud.google.com/vertex-ai" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Vertex AI <ExternalLink className="w-3 h-3 inline" /></a>, the biggest difference is that CMPSBL doesn't just route your prompts — it <strong>remembers, learns, and evolves</strong> across every interaction through its Clockless Cognitive Reality engine.
          </p>

          <h2 id="account-creation" className="text-2xl font-bold mt-12 mb-4">Step 1: Creating Your Account</h2>
          <p>
            Account creation takes under two minutes. Visit the <Link to="/explore" className="text-primary hover:underline">CMPSBL Explorer</Link> or go directly to the <Link to="/store" className="text-primary hover:underline">Artifact Store</Link> to get started. Here's what happens when you provision your substrate:
          </p>

          <Card className="my-6 border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Fingerprint className="w-5 h-5 text-primary" /> What Gets Provisioned</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span><strong>Developer Identity</strong> — API keys, credential management, and tier-based entitlements via the <Link to="/modules" className="text-primary hover:underline">IDENTITY module</Link></span></li>
                <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span><strong>Memory Substrate</strong> — Your own three-tier memory architecture (hot/warm/cold) through <Link to="/persistent-memory" className="text-primary hover:underline">MEMORY</Link></span></li>
                <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span><strong>Governance Layer</strong> — Audit trails, bounded authority, and compliance logging via <Link to="/blog/autonomous-ai-governance-runtime-enforcement" className="text-primary hover:underline">GOVERNOR</Link></span></li>
                <li className="flex items-start gap-2"><ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" /><span><strong>Runtime Defense</strong> — Behavioral threat detection and prompt injection guards from <Link to="/blog/adversarial-ai-defense-module-response-2026" className="text-primary hover:underline">DEFENSE</Link></span></li>
              </ul>
            </CardContent>
          </Card>

          <p>
            Every account — even free tier — gets the full baseline substrate. There's no feature-gating on core architecture. The difference between tiers is <strong>capacity and throughput</strong>, not capability. This is fundamentally different from how <a href="https://aws.amazon.com/bedrock/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">AWS Bedrock <ExternalLink className="w-3 h-3 inline" /></a> or similar platforms handle tiering.
          </p>

          <h2 id="artifact-packs" className="text-2xl font-bold mt-12 mb-4">Step 2: Choosing Your Artifact Pack</h2>

          <img src={artifactPackImg} alt="Artifact pack revealing layered cognitive capabilities" className="w-full rounded-xl border border-border/50 shadow-lg my-8" />

          <p>
            This is where CMPSBL diverges from every other platform on the market. An <strong>artifact pack</strong> isn't a bundle of API credits or a list of models — it's a curated set of <em>substrate-native capabilities</em> that express emergent system behaviors. Each pack contains at least one crystallized pipeline or cross-domain orchestration that can only exist because of the unified runtime.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">What Makes Artifact Packs Unique</h3>
          <p>
            Traditional AI platforms sell you model access. You get GPT-4, Claude, or Gemini — but they're isolated inference endpoints. Artifact packs on CMPSBL are different because they leverage the <Link to="/substrate" className="text-primary hover:underline">full substrate architecture</Link>:
          </p>

          <div className="grid md:grid-cols-2 gap-4 my-6">
            {[
              { icon: Brain, title: "Memory-Aware Pipelines", desc: "Capabilities that remember context across invocations. Your artifact pack's pipelines access the same memory substrate your agents use." },
              { icon: Route, title: "Multi-Provider Routing", desc: "Packs can route to different models based on task complexity. A single pipeline might use fast inference for classification and deep reasoning for synthesis." },
              { icon: Shield, title: "Governed Execution", desc: "Every capability in a pack runs under the governance layer. Audit trails, rate limits, and compliance logging are automatic." },
              { icon: Activity, title: "Observable by Default", desc: "Pack execution feeds into the observability layer. You can trace every step of a pipeline through the system feed." },
            ].map((item, i) => (
              <Card key={i} className="border-border/50">
                <CardContent className="p-5">
                  <item.icon className="w-6 h-6 text-primary mb-2" />
                  <h4 className="font-bold mb-1">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <h3 className="text-xl font-bold mt-8 mb-3">How to Choose the Right Pack</h3>
          <p>
            Visit the <Link to="/store" className="text-primary hover:underline">Artifact Store</Link> to browse all available packs. Here's a decision framework:
          </p>

          <Card className="my-6 border-border/50">
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Target className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold">Building Conversational Agents?</h4>
                    <p className="text-sm text-muted-foreground">Look for packs with MEMORY and DECODE capabilities. These give your agents <Link to="/blog/why-agents-forget" className="text-primary hover:underline">persistent episodic memory</Link> and natural language understanding that survives across sessions.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold">Security-Critical Applications?</h4>
                    <p className="text-sm text-muted-foreground">Choose packs with DEFENSE and GOVERNOR modules included. Read about our <Link to="/blog/cmpsbl-defense-ai-security" className="text-primary hover:underline">security architecture</Link> and <Link to="/proof" className="text-primary hover:underline">Proof Mode</Link> for cryptographic execution verification.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Layers className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold">Multi-Agent Orchestration?</h4>
                    <p className="text-sm text-muted-foreground">You need packs with RELAY and RIPPLE capabilities for agent-to-agent communication. See <Link to="/blog/building-agents-that-learn" className="text-primary hover:underline">building agents that learn</Link> for architectural patterns.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 text-primary shrink-0 mt-1" />
                  <div>
                    <h4 className="font-bold">Research & Experimentation?</h4>
                    <p className="text-sm text-muted-foreground">Start with a free-tier pack that includes BRAIN and DREAM capabilities. The <Link to="/feed-dream-eater" className="text-primary hover:underline">Dream Feeder</Link> lets you explore autonomous learning cycles.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <h2 id="what-packs-offer" className="text-2xl font-bold mt-12 mb-4">What Artifact Packs Give You That No Other Infrastructure Can</h2>

          <img src={modulesImg} alt="Substrate modules connected by luminous pathways" className="w-full rounded-xl border border-border/50 shadow-lg my-8" />

          <p>
            This isn't marketing — it's architecture. Here's what the unified substrate runtime enables that fragmented cloud services can't replicate:
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">1. Cross-Module Memory Persistence</h3>
          <p>
            When you invoke a capability from your artifact pack, it has access to the same <Link to="/persistent-memory" className="text-primary hover:underline">three-tier memory architecture</Link> that every other module uses. A DEFENSE scan result can inform a BRAIN analysis, which feeds into a DREAM cycle, which produces a heuristic improvement — all sharing the same contextual memory. On platforms like <a href="https://www.langchain.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LangChain <ExternalLink className="w-3 h-3 inline" /></a>, you'd need to build this integration yourself. On CMPSBL, it's built in. Check out our <Link to="/blog/langchain-memory-integration" className="text-primary hover:underline">LangChain memory integration guide</Link> to see how we compare.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">2. Emergent Capability Synergies</h3>
          <p>
            Artifact packs contain <strong>synergy pipelines</strong> — capabilities that emerge only when multiple modules operate in concert. A feedback loop detection pipeline, for instance, requires PULSE (observability), BRAIN (analysis), and GOVERNOR (approval) working together in a single DAG. You can't compose this from separate API calls to different providers.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">3. Autonomous Evolution</h3>
          <p>
            Every artifact pack benefits from the substrate's <Link to="/blog/evolving-software-v6-breakthrough" className="text-primary hover:underline">autonomous evolution capabilities</Link>. The system proposes improvements, validates them in shadow mode, and — with governor approval — applies them to production. Your pack's capabilities literally get better over time without you touching a line of code.
          </p>

          <h3 className="text-xl font-bold mt-8 mb-3">4. Zero-Trust Security by Default</h3>
          <p>
            Every capability invocation in every pack runs through the <Link to="/blog/adversarial-ai-defense-module-response-2026" className="text-primary hover:underline">DEFENSE module's zero-trust mesh</Link>. Prompt injection shielding, behavioral anomaly detection, and IP reputation scoring are active on every request — not as add-ons, but as substrate primitives. Compare this to <a href="https://owasp.org/www-project-top-ten/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OWASP's security recommendations <ExternalLink className="w-3 h-3 inline" /></a> for AI systems and you'll see we exceed every guideline.
          </p>

          <h2 id="after-setup" className="text-2xl font-bold mt-12 mb-4">Step 3: After Setup — What's Next</h2>
          <p>
            Once your account is provisioned and your artifact pack is active, here's your recommended path:
          </p>

          <ol className="space-y-3 my-6">
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">1</span>
              <span>Explore the <Link to="/decode" className="text-primary hover:underline">DECODE terminal</Link> — interact with your substrate through natural language commands.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">2</span>
              <span>Check the <Link to="/system-feed" className="text-primary hover:underline">System Feed</Link> to watch your substrate in action. Every module event is observable.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">3</span>
              <span>Read the <Link to="/developers" className="text-primary hover:underline">Developer Hub</Link> for SDK integration guides and API documentation.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">4</span>
              <span>Study the <Link to="/blog/clockless-modules-deep-dive" className="text-primary hover:underline">module deep dive</Link> to understand what each module brings to your stack.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">5</span>
              <span>Join the ecosystem by exploring <Link to="/composable-cognitives" className="text-primary hover:underline">Composable Cognitives</Link> — portable AI agents you own permanently.</span>
            </li>
          </ol>

          <h2 id="faq" className="text-2xl font-bold mt-12 mb-4">Frequently Asked Questions</h2>

          <div className="space-y-6 my-6">
            <div>
              <h4 className="font-bold mb-1">Can I change my artifact pack later?</h4>
              <p className="text-muted-foreground">Yes. Packs are additive — you can upgrade, swap, or layer additional packs at any time. Your memory and governance history are preserved across changes.</p>
            </div>
            <div>
              <h4 className="font-bold mb-1">Is there a free tier?</h4>
              <p className="text-muted-foreground">Absolutely. Every account gets the full substrate architecture. Free tier limits throughput and storage, but the <em>capabilities</em> are identical. See our <Link to="/upgrade" className="text-primary hover:underline">pricing page</Link> for details.</p>
            </div>
            <div>
              <h4 className="font-bold mb-1">How does this compare to using OpenAI + Pinecone + LangChain separately?</h4>
              <p className="text-muted-foreground">You'd be stitching together inference, memory, orchestration, and governance from different vendors. CMPSBL provides all of these as a unified runtime where they share context, memory, and governance natively. Read our <Link to="/blog/rag-without-infrastructure" className="text-primary hover:underline">RAG Without Infrastructure</Link> post for a direct comparison.</p>
            </div>
          </div>

          {/* Related Posts */}
          <div className="border-t border-border/50 mt-16 pt-12">
            <h2 className="text-2xl font-bold mb-6">Continue Reading</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Link to="/blog/clockless-what-makes-it-different" className="group p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-all">
                <Badge variant="outline" className="mb-2 text-xs">Cluster</Badge>
                <h3 className="font-bold group-hover:text-primary transition-colors">What Makes CMPSBL Different</h3>
                <p className="text-sm text-muted-foreground mt-1">Why developers and enterprises are choosing composable cognitive infrastructure over traditional AI platforms.</p>
              </Link>
              <Link to="/blog/clockless-modules-deep-dive" className="group p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-all">
                <Badge variant="outline" className="mb-2 text-xs">Cluster</Badge>
                <h3 className="font-bold group-hover:text-primary transition-colors">Inside the Modules: What Makes Each One Special</h3>
                <p className="text-sm text-muted-foreground mt-1">A deep dive into every substrate module and the unique capabilities they bring to your stack.</p>
              </Link>
              <Link to="/blog/sparta-epoch-rebuild-from-scratch" className="group p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-all">
                <Badge variant="outline" className="mb-2 text-xs">Technical</Badge>
                <h3 className="font-bold group-hover:text-primary transition-colors">The Full Substrate Rebuild</h3>
                <p className="text-sm text-muted-foreground mt-1">How we refactored the entire substrate from scratch and emerged with a production-grade layered kernel.</p>
              </Link>
              <Link to="/blog/why-agents-forget" className="group p-5 rounded-xl border border-border/50 hover:border-primary/30 transition-all">
                <Badge variant="outline" className="mb-2 text-xs">Research</Badge>
                <h3 className="font-bold group-hover:text-primary transition-colors">Why AI Agents Forget Everything</h3>
                <p className="text-sm text-muted-foreground mt-1">The fundamental memory problem in AI — and how CMPSBL solves it architecturally.</p>
              </Link>
            </div>
          </div>
        </article>
      </main>
      <EnhancedFooter />
    </>
  );
}
