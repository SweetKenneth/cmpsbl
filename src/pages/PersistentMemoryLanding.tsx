/**
 * Persistent Memory Marketing Landing Page
 * Hero-driven conversion page — FREE for all users
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, Zap, Clock, ArrowRight, CheckCircle, Code,
  Layers, RefreshCw, Target, Shield, Sparkles, Gift,
  Database, Activity, Lock, Users
} from 'lucide-react';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { AuthorityLinkBlock } from '@/components/seo/AuthorityLinkBlock';
import { SEO } from '@/components/SEO';
import { InteractivePlayground } from '@/components/developer/InteractivePlayground';

const PersistentMemoryLanding = () => {
  return (
    <>
      <SEO 
        title="Persistent Memory for AI Agents — Free for All Users | CMPSBL"
        description="Add persistent memory to any AI agent in under an hour. 4-tier architecture, DREAM consolidation, automatic recall. Free for all users — no credit card required."
        image="https://cmpsbl.com/og/persistent-memory.jpg"
        keywords={['persistent memory AI', 'agent memory API', 'AI memory system', 'free AI memory', 'context engineering', 'episodic memory AI']}
        howTo={{
          name: 'Add Persistent Memory to Your AI Agent',
          description: 'Three steps to give your agent persistent memory that survives across sessions.',
          totalTime: 'PT1H',
          steps: [
            { name: 'Import the memory SDK', text: 'Import withPersistentMemory from the @cmpsbl/memory package.' },
            { name: 'Wrap your existing agent', text: 'Wrap your agent with withPersistentMemory({ agentId, scope }).' },
            { name: 'Run your app', text: 'Memory recall happens automatically. Use context in your prompts.' },
          ],
        }}
      />
      <PublicNav />
      
      <main className="min-h-screen bg-background">
        {/* ═══ HERO ═══ */}
        <section className="relative pt-24 pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Badge className="mb-6 px-4 py-2 text-sm bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                  <Gift className="w-4 h-4 mr-2" />
                  Free for All Users — No Credit Card Required
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Your AI agent{' '}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">never forgets again</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                4-tier persistent memory with automatic recall, DREAM consolidation, and smart decay. 
                Add it to any agent in under an hour.
              </motion.p>

              <motion.p
                className="text-lg text-emerald-500 font-semibold mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
              >
                Completely free. No limits on the free tier. No catch.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button asChild size="lg" className="text-lg px-8 h-14 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <Link to="/docs/persistent-memory">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 h-14 hover:border-primary/30 transition-colors"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  See how it works
                </Button>
              </motion.div>

              {/* Compatibility */}
              <motion.div 
                className="flex flex-wrap gap-3 justify-center mt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                {[
                  "Works with LangChain",
                  "Works with CrewAI",
                  "Works with custom agents",
                  "Works with React apps",
                ].map(text => (
                  <Badge key={text} variant="outline" className="px-4 py-2">
                    <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                    {text}
                  </Badge>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ WHY AGENTS FORGET ═══ */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">The problem every AI builder faces</h2>
                <p className="text-lg text-muted-foreground">Your agent starts from zero. Every. Single. Time.</p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: RefreshCw, title: "Context resets between sessions", description: "Users repeat themselves. Agents can't build on previous conversations. Every interaction is a blank slate." },
                  { icon: Layers, title: "Wrappers don't preserve identity", description: "Prompt engineering and system prompts can't maintain long-term knowledge. Memory requires infrastructure." },
                  { icon: Target, title: "Behavior drifts without memory", description: "Without recall, agents can't learn preferences, maintain consistency, or improve over time." }
                ].map((item, i) => (
                  <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card className="h-full border-destructive/20 bg-destructive/5 hover:border-destructive/30 transition-colors card-lift">
                      <CardContent className="pt-6">
                        <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center mb-4">
                          <item.icon className="w-6 h-6 text-destructive" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ THE SOLUTION ═══ */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Badge className="mb-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/30">FREE FOR ALL USERS</Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">4-tier memory that just works</h2>
                <p className="text-lg text-muted-foreground">Powered by the BRAIN and MEMORY nodes of the CMPSBL Substrate</p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { icon: Database, title: "Hot → Warm → Cold → Legacy", description: "4-tier architecture with automatic demotion. Recent memories are instant (<10ms). Historical knowledge persists forever. No manual management." },
                  { icon: Brain, title: "Automatic Semantic Recall", description: "Relevant memories surface automatically based on semantic similarity. Your agent remembers what matters without you writing retrieval logic." },
                  { icon: Sparkles, title: "DREAM Consolidation", description: "Off-peak cycles compress redundant memories, generate heuristics, discover patterns, and prune stale entries. Your agent improves while it sleeps." },
                  { icon: Shield, title: "Protected Memory Types", description: "Identity, safety rules, compliance constraints, and governance directives are locked at value 1.0 with zero decay. They never fade." },
                  { icon: Lock, title: "Per-Agent Isolation", description: "Each agent's memory is completely isolated. Multi-tenant safe. No cross-contamination between agents or users." },
                  { icon: Activity, title: "Graceful Degradation", description: "Memory failures never crash your app. The system degrades silently — your agent works without memory rather than erroring out." },
                ].map((item, i) => (
                  <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                    <Card className="h-full border-primary/20 bg-primary/5 hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-300 shimmer-on-hover">
                      <CardContent className="pt-6 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <item.icon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ NOT ANOTHER FRAMEWORK ═══ */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Keep your stack. We add continuity.</h2>
                <p className="text-lg text-muted-foreground">No rewrites. No new framework. No migration.</p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: CheckCircle, title: "You keep your agent", description: "Works with LangChain, CrewAI, AutoGen, or your custom agent. No framework lock-in." },
                  { icon: CheckCircle, title: "You keep your stack", description: "React, Node.js, Python — it all works. Drop-in integration, no infrastructure to manage." },
                  { icon: CheckCircle, title: "We add memory", description: "Your agent just stops forgetting. Under an hour to integrate. Free forever on the base tier." }
                ].map((item, i) => (
                  <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card className="h-full hover:border-primary/20 hover:-translate-y-0.5 transition-all duration-300">
                      <CardContent className="pt-6">
                        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-4">
                          <item.icon className="w-6 h-6 text-emerald-500" />
                        </div>
                        <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                        <p className="text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Three steps to persistent memory</h2>
                <p className="text-lg text-muted-foreground">Under an hour. Zero infrastructure.</p>
              </motion.div>

              <div className="space-y-8">
                {[
                  { step: "1", title: "Import the memory SDK", code: "import { withPersistentMemory } from '@cmpsbl/memory';", note: "No additional infrastructure required" },
                  { step: "2", title: "Wrap your existing agent", code: `const agent = withPersistentMemory({\n  agentId: 'my-agent',\n  scope: 'project'\n});`, note: "Works with your existing agent logic" },
                  { step: "3", title: "Run your app like normal", code: `// Memory recall happens automatically\nconst context = await agent.getContext(userMessage);\n\n// Use context in your prompts\nconst prompt = userMessage + context.contextString;`, note: "No vector database setup required" }
                ].map((item, i) => (
                  <motion.div key={item.step} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card className="hover:border-primary/20 transition-colors">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                            {item.step}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
                            <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm mb-3">
                              <code>{item.code}</code>
                            </pre>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-emerald-500" />
                              {item.note}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FREE TIER DETAILS ═══ */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <Badge className="mb-4 bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-base px-5 py-2">
                  <Gift className="w-5 h-5 mr-2" />
                  $0 / month — forever
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need, included free</h2>
                <p className="text-lg text-muted-foreground">No credit card. No trial period. No catches.</p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { icon: Brain, title: "Full 4-Tier Memory", description: "Hot, warm, cold, and legacy tiers — all included. Automatic demotion and smart retrieval." },
                  { icon: Sparkles, title: "DREAM Consolidation", description: "Autonomous off-peak optimization that compresses, prunes, and discovers patterns." },
                  { icon: Shield, title: "Protected Memory Types", description: "Identity and safety rules locked at value 1.0. They never decay or get evicted." },
                  { icon: Zap, title: "Semantic Search", description: "Relevance-based recall across all tiers. RPS scoring model with automatic decay management." },
                  { icon: Lock, title: "Per-Agent Isolation", description: "Complete data isolation between agents. Multi-tenant safe out of the box." },
                  { icon: Activity, title: "Graceful Degradation", description: "Memory failures never crash your app. Silent fallback to memoryless operation." },
                ].map((item, i) => (
                  <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                    <Card className="h-full hover:border-primary/20 hover:-translate-y-0.5 hover:shadow-sm transition-all duration-300">
                      <CardContent className="pt-6 flex items-start gap-4">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <item.icon className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-1">{item.title}</h3>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ LIVE DEMO ═══ */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <motion.div className="text-center mb-8" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Try it live</h2>
                <p className="text-lg text-muted-foreground">Store, recall, and forget — no signup required</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
                <InteractivePlayground />
              </motion.div>
            </div>
          </div>
        </section>

        {/* ═══ SOCIAL PROOF ═══ */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <div className="grid grid-cols-3 gap-8">
                {[
                  { value: "4", label: "Memory Tiers" },
                  { value: "<10ms", label: "Hot Tier Latency" },
                  { value: "$0", label: "Free Forever" },
                ].map((stat, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <div className="text-3xl font-bold text-primary font-mono tabular-nums">{stat.value}</div>
                    <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FINAL CTA ═══ */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div className="max-w-3xl mx-auto text-center" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Card className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-primary/20">
                <CardContent className="pt-12 pb-12">
                  <Gift className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Stop building memory infrastructure.</h2>
                  <p className="text-lg text-muted-foreground mb-2">
                    Persistent memory is <span className="text-emerald-500 font-bold">free for all users</span>. 
                    No credit card. No trial expiration. Just memory that works.
                  </p>
                  <p className="text-sm text-muted-foreground mb-8">
                    Your agent remembers preferences, learns patterns, and improves over time — starting today.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="text-lg px-8 h-14 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                      <Link to="/docs/persistent-memory">
                        Get Started Free
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="text-lg px-8 h-14 hover:border-primary/30 transition-colors">
                      <Link to="/modules">
                        Explore All 40 Nodes
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </section>
      </main>
      
      <AuthorityLinkBlock currentPath="/persistent-memory" />
      <EnhancedFooter />
    </>
  );
};

export default PersistentMemoryLanding;
