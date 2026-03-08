/**
 * Persistent Memory Marketing Landing Page
 *
 * 
 * Hero-driven conversion page focusing on the value proposition
 * without mentioning substrate, OS, or internal architecture.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Brain, 
  Zap, 
  Clock, 
  ArrowRight, 
  CheckCircle, 
  Code,
  Layers,
  RefreshCw,
  Target,
  Shield,
  Sparkles
} from 'lucide-react';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { AuthorityLinkBlock } from '@/components/seo/AuthorityLinkBlock';
import { SEO } from '@/components/SEO';

const PersistentMemoryLanding = () => {
  return (
    <>
      <SEO 
        title="Persistent Memory for AI Agents | CMPSBL"
        description="Add persistent memory to any AI agent in under an hour. Works with LangChain, CrewAI, and custom frameworks. Free tier available."
        image="https://cmpsbl.com/og/persistent-memory.jpg"
        keywords={['persistent memory AI', 'agent memory API', 'AI memory system', 'LangChain memory', 'episodic memory AI', 'context engineering']}
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
        {/* ══════════════════════════════════════════════════════════════════════
            HERO SECTION
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="relative pt-24 pb-20 overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
                  <Clock className="w-4 h-4 mr-2" />
                  Under 1 Hour Integration
                </Badge>
              </motion.div>
              
              <motion.h1 
                className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Add persistent memory to your agent{' '}
                <span className="text-primary">in under an hour</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                No rewrites. No new framework. Your agent just stops forgetting.
              </motion.p>
              
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Button asChild size="lg" className="text-lg px-8 h-14 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                  <Link to="/docs/persistent-memory">
                    Get Started (FREE)
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 h-14"
                  onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  See how it works
                </Button>
              </motion.div>

              {/* Platform badges */}
              <motion.div 
                className="flex flex-wrap gap-3 justify-center mt-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Badge variant="outline" className="px-4 py-2">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                  Works with vibe-coded agents
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                  Works with Node.js apps
                </Badge>
                <Badge variant="outline" className="px-4 py-2">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                  Works with React apps
                </Badge>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════════════════
            WHY AGENTS FORGET
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Why agents forget</h2>
                <p className="text-lg text-muted-foreground">Every conversation starts from zero</p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: RefreshCw,
                    title: "Context resets between sessions",
                    description: "Each conversation starts with a blank slate. Nothing carries over."
                  },
                  {
                    icon: Layers,
                    title: "Wrappers don't preserve identity",
                    description: "Prompt engineering and wrappers can't maintain long-term memory."
                  },
                  {
                    icon: Target,
                    title: "Behavior drifts over time",
                    description: "Without memory, agents can't learn or maintain consistency."
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full border-destructive/20 bg-destructive/5">
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

        {/* ══════════════════════════════════════════════════════════════════════
            WHAT PERSISTENT MEMORY CHANGES
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">What persistent memory changes</h2>
                <p className="text-lg text-muted-foreground">Your agent becomes continuous</p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: Zap,
                    title: "Consistent behavior across time",
                    description: "Your agent maintains personality and knowledge between sessions."
                  },
                  {
                    icon: Brain,
                    title: "Recall of what mattered, not everything",
                    description: "Smart retrieval surfaces relevant context without noise."
                  },
                  {
                    icon: Sparkles,
                    title: "Agents that improve instead of reset",
                    description: "Learn from interactions and get better over time."
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full border-primary/20 bg-primary/5">
                      <CardContent className="pt-6">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                          <item.icon className="w-6 h-6 text-primary" />
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

        {/* ══════════════════════════════════════════════════════════════════════
            NOT ANOTHER FRAMEWORK
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Not another agent framework</h2>
                <p className="text-lg text-muted-foreground">Keep your stack. We add continuity.</p>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-6">
                {[
                  {
                    icon: CheckCircle,
                    title: "You keep your agent",
                    description: "Works with LangChain, CrewAI, AutoGen, or your custom agent."
                  },
                  {
                    icon: CheckCircle,
                    title: "You keep your stack",
                    description: "React, Node.js, Python — it all works. No migration required."
                  },
                  {
                    icon: CheckCircle,
                    title: "We add continuity",
                    description: "Drop-in memory that just works. No infrastructure to manage."
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="h-full">
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

        {/* ══════════════════════════════════════════════════════════════════════
            HOW IT WORKS
            ══════════════════════════════════════════════════════════════════════ */}
        <section id="how-it-works" className="py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">How it works</h2>
                <p className="text-lg text-muted-foreground">Three steps to persistent memory</p>
              </motion.div>

              <div className="space-y-8">
                {[
                  {
                    step: "1",
                    title: "Import the memory SDK",
                    code: "import { withPersistentMemory } from '@cmpsbl/memory';",
                    note: "No additional infrastructure required"
                  },
                  {
                    step: "2",
                    title: "Wrap your existing agent",
                    code: `import { withPersistentMemory } from '@cmpsbl/memory';

const agent = withPersistentMemory({
  agentId: 'my-agent',
  scope: 'project'
});`,
                    note: "Works with your existing agent logic"
                  },
                  {
                    step: "3",
                    title: "Run your app like normal",
                    code: `// Memory recall happens automatically
const context = await agent.getContext(userMessage);

// Use context in your prompts
const prompt = userMessage + context.contextString;`,
                    note: "No vector database setup required"
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.step}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
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

        {/* ══════════════════════════════════════════════════════════════════════
            WHAT'S INCLUDED FREE
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <motion.div 
                className="text-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl md:text-4xl font-bold mb-4">What's included for free</h2>
                <p className="text-lg text-muted-foreground">Everything you need to get started</p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-6">
                {[
                  {
                    icon: Brain,
                    title: "Automatic Recall",
                    description: "Relevant memories are retrieved automatically based on semantic similarity."
                  },
                  {
                    icon: Shield,
                    title: "Safe Defaults",
                    description: "Bounded storage and automatic decay prevent runaway memory growth."
                  },
                  {
                    icon: Layers,
                    title: "Per-Agent Isolation",
                    description: "Each agent's memory is completely isolated from others."
                  },
                  {
                    icon: Zap,
                    title: "Graceful Degradation",
                    description: "Memory failures never crash your app — they degrade silently."
                  }
                ].map((item, index) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
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

        {/* ══════════════════════════════════════════════════════════════════════
            FINAL CTA
            ══════════════════════════════════════════════════════════════════════ */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <motion.div 
              className="max-w-3xl mx-auto text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Card className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-primary/20">
                <CardContent className="pt-12 pb-12">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to add memory?</h2>
                  <p className="text-lg text-muted-foreground mb-8">
                    Start with the free tier. Upgrade when you need advanced features.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild size="lg" className="text-lg px-8 h-14">
                      <Link to="/docs/persistent-memory">
                        Get Started (FREE)
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="text-lg px-8 h-14">
                      <Link to="/explore">
                        Explore All Capabilities
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
