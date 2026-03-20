/**
 * Developer Academy v2 — Interactive Learning Platform for CMPSBL
 * 8 learning tracks, live sandbox, certifications, AI tools
 * Updated for v14.4.0 substrate architecture
 */

import { useState } from 'react';
import { SEO } from '@/components/SEO';
import { PublicNav } from '@/components/PublicNav';
import { AcademyOnboarding } from '@/components/onboarding/AcademyOnboarding';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { AuthorityLinkBlock } from '@/components/seo/AuthorityLinkBlock';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InteractiveTutorial } from '@/components/developer/InteractiveTutorial';
import { SkillTreeProgress } from '@/components/developer/SkillTreeProgress';
import { SandboxEnvironment } from '@/components/developer/SandboxEnvironment';
import { CertificationBadges } from '@/components/developer/CertificationBadges';
import { AIToolsSuite } from '@/components/developer/AIToolsSuite';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BookOpen, TreeDeciduous, Box, Trophy, Sparkles,
  GraduationCap, Rocket, ArrowRight, Brain, Zap,
  Layers, Terminal, Shield, Code, Network, Target,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const LEARNING_TRACKS = [
  { icon: Brain, title: 'Memory API Basics', desc: 'Learn the 4-tier memory system: store, recall, search, and automatic cleanup', difficulty: 'Beginner', modules: 6, time: '45 min', color: 'text-primary' },
  { icon: Network, title: 'AI Routing', desc: 'Route requests across multiple AI providers with automatic failover and cost controls', difficulty: 'Beginner', modules: 4, time: '30 min', color: 'text-neon-cyan' },
  { icon: Shield, title: 'Security & Safety', desc: 'Add threat detection, rate limiting, content filtering, and audit logging', difficulty: 'Intermediate', modules: 5, time: '40 min', color: 'text-neon-green' },
  { icon: Layers, title: 'Building with Resolvers', desc: 'Learn the node → resolver pattern: naming, routing, logging, and observability', difficulty: 'Intermediate', modules: 7, time: '55 min', color: 'text-neon-purple' },
  { icon: Zap, title: 'Advanced Pipelines', desc: 'Build multi-step processing chains with quality gates and performance tracking', difficulty: 'Advanced', modules: 8, time: '60 min', color: 'text-neon-amber' },
  { icon: Target, title: 'Discovery Scoring', desc: 'Understand how capabilities are scored for novelty, usefulness, and composability', difficulty: 'Advanced', modules: 5, time: '35 min', color: 'text-neon-magenta' },
  { icon: Sparkles, title: 'Memory Stream', desc: 'Discover, crystallize, and export capabilities from the live discovery feed', difficulty: 'Intermediate', modules: 6, time: '50 min', color: 'text-primary' },
  { icon: Code, title: 'Production Ready', desc: 'Error handling, retry patterns, graceful degradation, and performance tuning', difficulty: 'Expert', modules: 9, time: '75 min', color: 'text-neon-cyan' },
];

const DIFF_COLORS: Record<string, string> = {
  Beginner: 'bg-neon-green/10 text-neon-green border-neon-green/20',
  Intermediate: 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20',
  Advanced: 'bg-neon-amber/10 text-neon-amber border-neon-amber/20',
  Expert: 'bg-neon-magenta/10 text-neon-magenta border-neon-magenta/20',
};

const DeveloperAcademy = () => {
  const [activeTrack, setActiveTrack] = useState<number | null>(null);

  return (
    <>
      <SEO
        title="Academy — 8 Learning Tracks, Live Sandbox | CMPSBL"
        description="Master CMPSBL with 8 guided tracks: memory API, AI routing, self-improvement lifecycle, quality scoring, resolver patterns, and production hardening. Earn verifiable certifications."
        image="https://cmpsbl.com/og/academy.jpg"
        keywords={['AI developer academy', 'platform SDK tutorials', 'interactive AI training', 'agentic AI course', 'CMPSBL']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'Developers', url: 'https://cmpsbl.com/developers' },
          { name: 'Academy', url: 'https://cmpsbl.com/academy' },
        ]}
      />

      <div className="min-h-screen flex flex-col bg-background">
        <PublicNav />
        <AcademyOnboarding />

        {/* Ambient */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full animate-hero-orb-1" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)" }} />
          <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] rounded-full animate-hero-orb-2" style={{ background: "radial-gradient(circle, hsl(var(--neon-cyan) / 0.03) 0%, transparent 60%)" }} />
        </div>

        <main className="flex-grow relative z-10">
          {/* ═══ HERO v2 ═══ */}
          <section className="relative py-16 md:py-24 border-b border-border/40 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-neon-cyan/5" />
            <div className="container mx-auto px-4 relative">
              <div className="max-w-4xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
                  <GraduationCap className="w-4 h-4" />
                  Interactive Learning Platform
                </div>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-5 leading-tight animate-fade-in">
                  Learn to build with{' '}
                  <span className="bg-gradient-to-r from-primary to-neon-cyan bg-clip-text text-transparent">
                    CMPSBL
                  </span>
                </h1>

                <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed animate-fade-in">
                  8 hands-on tracks from beginner to expert. Write real code in a live sandbox.
                  Earn verifiable certifications when you're done.
                </p>

                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm animate-fade-in">
                  {[
                    { icon: BookOpen, label: '8 Learning Tracks', value: '50+ modules' },
                    { icon: Terminal, label: 'Live Sandbox', value: 'Real SDK' },
                    { icon: Trophy, label: '6 Certifications', value: 'Verifiable' },
                    { icon: Sparkles, label: 'AI-Powered', value: '5 Tools' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-2.5 text-muted-foreground">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <stat.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div className="text-left">
                        <div className="text-xs font-medium text-foreground">{stat.label}</div>
                        <div className="text-[11px] text-muted-foreground">{stat.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* ═══ LEARNING TRACKS v2 ═══ */}
          <section className="py-12 md:py-16 border-b border-border/40">
            <div className="container mx-auto px-4">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Pick Your Track</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Start with the basics or jump straight to advanced topics. Each track includes
                  step-by-step tutorials, code exercises, and working examples.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                {LEARNING_TRACKS.map((track, i) => (
                  <Card
                    key={track.title}
                    className={cn(
                      'cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg group',
                      activeTrack === i && 'ring-2 ring-primary shadow-lg'
                    )}
                    onClick={() => setActiveTrack(activeTrack === i ? null : i)}
                  >
                    <CardContent className="pt-5 pb-4 px-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className={cn('w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center group-hover:scale-110 transition-transform', track.color)}>
                          <track.icon className="w-5 h-5" />
                        </div>
                        <Badge variant="outline" className={cn('text-[10px] px-2 py-0.5', DIFF_COLORS[track.difficulty])}>
                          {track.difficulty}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-sm mb-1.5">{track.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed mb-3">{track.desc}</p>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 font-mono">
                        <span>{track.modules} modules</span>
                        <span>{track.time}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ INTERACTIVE CONTENT ═══ */}
          <section className="py-8 md:py-12">
            <div className="container mx-auto px-4">
              <Tabs defaultValue="tutorial" className="space-y-6 md:space-y-8">
                <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 h-auto p-1.5 bg-muted/50">
                  <TabsTrigger value="tutorial" className="flex flex-col gap-1 py-2.5 md:py-3 data-[state=active]:bg-background">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-[10px] md:text-xs">Tutorial</span>
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="flex flex-col gap-1 py-2.5 md:py-3 data-[state=active]:bg-background">
                    <TreeDeciduous className="w-4 h-4" />
                    <span className="text-[10px] md:text-xs">Skills</span>
                  </TabsTrigger>
                  <TabsTrigger value="sandbox" className="flex flex-col gap-1 py-2.5 md:py-3 data-[state=active]:bg-background">
                    <Box className="w-4 h-4" />
                    <span className="text-[10px] md:text-xs">Sandbox</span>
                  </TabsTrigger>
                  <TabsTrigger value="badges" className="flex flex-col gap-1 py-2.5 md:py-3 data-[state=active]:bg-background">
                    <Trophy className="w-4 h-4" />
                    <span className="text-[10px] md:text-xs">Badges</span>
                  </TabsTrigger>
                  <TabsTrigger value="ai-tools" className="flex flex-col gap-1 py-2.5 md:py-3 data-[state=active]:bg-background">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-[10px] md:text-xs">AI Tools</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tutorial" className="mt-6"><InteractiveTutorial /></TabsContent>
                <TabsContent value="skills" className="mt-6"><SkillTreeProgress /></TabsContent>
                <TabsContent value="sandbox" className="mt-6"><SandboxEnvironment /></TabsContent>
                <TabsContent value="badges" className="mt-6"><CertificationBadges /></TabsContent>
                <TabsContent value="ai-tools" className="mt-6"><AIToolsSuite /></TabsContent>
              </Tabs>
            </div>
          </section>

          {/* ═══ QUICK START GUIDES — SEO content ═══ */}
          <section className="py-12 md:py-16 border-t border-border/40">
            <div className="container mx-auto px-4">
              <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold mb-3">Quick Start Guides</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  Bite-sized walkthroughs for the most common tasks. Each guide takes under 5 minutes.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                {[
                  {
                    title: 'What is a Cognitive Runtime?',
                    desc: 'Understand the difference between traditional APIs and a self-improving system that learns from every interaction. The runtime is the foundation everything else builds on.',
                    tag: 'Concept',
                    link: '/blog/what-is-a-cognitive-runtime',
                    time: '3 min read',
                  },
                  {
                    title: 'Your First Memory Stream Pull',
                    desc: 'Walk through crystallizing a discovery from the live stream — from browsing scored patterns to storing them in your vault for later use.',
                    tag: 'Hands-on',
                    link: '/foundry',
                    time: '2 min',
                  },
                  {
                    title: 'Understanding CJPI Scoring',
                    desc: 'How discoveries are ranked by novelty, utility, complexity, and composability. Learn to spot high-value patterns before they crystallize.',
                    tag: 'Concept',
                    link: '/blog/signal-to-silicon',
                    time: '4 min read',
                  },
                  {
                    title: 'Broadcasting Your First Intent',
                    desc: 'The intent mesh routes all system actions. Learn broadcastIntent(), resolver dispatch, and how to read execution receipts.',
                    tag: 'Code',
                    link: '/documentation',
                    time: '5 min',
                  },
                  {
                    title: 'Resolver Patterns',
                    desc: 'Naming conventions (node.resolver_name), logging, telemetry hooks, and the resolver lifecycle from registration to execution.',
                    tag: 'Code',
                    link: '/documentation',
                    time: '4 min',
                  },
                  {
                    title: 'Choosing Your Tier',
                    desc: 'Compare Builder, Creator, Studio, and Architect tiers. See what each unlocks in terms of daily pulls, vault capacity, and runtime slots.',
                    tag: 'Guide',
                    link: '/store?tab=plans',
                    time: '2 min',
                  },
                ].map((guide) => (
                  <Link
                    key={guide.title}
                    to={guide.link}
                    className="group block rounded-xl border border-border/30 bg-card/40 backdrop-blur-sm p-5 hover:border-primary/30 hover:bg-card/60 transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="outline" className="text-[10px] px-2 py-0.5 bg-muted/30">
                        {guide.tag}
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground/50">{guide.time}</span>
                    </div>
                    <h3 className="text-sm font-semibold mb-2 group-hover:text-primary transition-colors">{guide.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{guide.desc}</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* ═══ CTA v2 ═══ */}
          <section className="py-16 md:py-20 border-t border-border/40 bg-gradient-to-b from-background to-muted/20">
            <div className="container mx-auto px-4 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Building?</h2>
                <p className="text-muted-foreground mb-8">
                  Finish a track, earn a certification, and start building
                  production apps with persistent memory and intelligent routing.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Button asChild size="lg" className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Link to="/workspace">
                      Open Workspace
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="hover:border-primary/30 transition-colors">
                    <Link to="/codelab">Try CodeLab</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="hover:border-primary/30 transition-colors">
                    <Link to="/documentation">Read Docs</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </main>

        <AuthorityLinkBlock currentPath="/academy" />
        <EnhancedFooter />
      </div>
    </>
  );
};

export default DeveloperAcademy;
