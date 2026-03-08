import React from 'react';
import { SEO } from '@/components/SEO';
import { CmpsblNav } from '@/components/navigation/CmpsblNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { AuthorityLinkBlock } from '@/components/seo/AuthorityLinkBlock';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InteractiveTutorial } from '@/components/developer/InteractiveTutorial';
import { SkillTreeProgress } from '@/components/developer/SkillTreeProgress';
import { SandboxEnvironment } from '@/components/developer/SandboxEnvironment';
import { CertificationBadges } from '@/components/developer/CertificationBadges';
import { AIToolsSuite } from '@/components/developer/AIToolsSuite';
import { 
  BookOpen, TreeDeciduous, Box, Trophy, Sparkles, 
  GraduationCap, Rocket, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const DeveloperAcademy = () => {
  return (
    <>
      <SEO
        title="Developer Academy — AI Tutorials | CMPSBL"
        description="Master the CMPSBL Substrate SDK with interactive tutorials, skill progression paths, sandbox environments, and AI-powered learning tools."
        image="https://cmpsbl.com/og/academy.jpg"
        keywords={['AI developer academy', 'substrate SDK tutorials', 'interactive AI training', 'agentic AI course']}
        breadcrumbs={[
          { name: 'Home', url: 'https://cmpsbl.com' },
          { name: 'Developers', url: 'https://cmpsbl.com/developers' },
          { name: 'Academy', url: 'https://cmpsbl.com/academy' },
        ]}
      />
      
      <div className="min-h-screen flex flex-col bg-background">
        <CmpsblNav />

        {/* Ambient glow — CSS only */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full animate-hero-orb-1"
            style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)" }}
          />
        </div>
        
        <main className="flex-grow relative z-10">
          {/* Hero */}
          <section className="relative py-12 md:py-16 border-b border-border/40 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
            <div className="container mx-auto px-4 relative">
              <div className="max-w-3xl mx-auto text-center">
                <motion.div {...fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
                  <GraduationCap className="w-4 h-4" />
                  Interactive Learning Platform
                </motion.div>
                <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                  Developer Academy
                </motion.h1>
                <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-lg md:text-xl text-muted-foreground mb-6">
                  Master the substrate through hands-on tutorials, earn certifications, 
                  and get AI-powered assistance while you build.
                </motion.p>
                <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    <span>5 Interactive Modules</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span>4 Certifications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span>5 AI Tools</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Main Content */}
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

          {/* CTA */}
          <section className="py-12 md:py-16 border-t border-border/40 bg-gradient-to-b from-background to-muted/20">
            <motion.div {...fadeUp} className="container mx-auto px-4 text-center">
              <div className="max-w-2xl mx-auto">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Rocket className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to Build?</h2>
                <p className="text-muted-foreground mb-8">
                  Complete the tutorials, earn your first certification, 
                  and start building production-ready agents.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Button asChild size="lg" className="shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all">
                    <Link to="/devtools">
                      Get API Key
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/documentation">Read Documentation</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </section>
        </main>

        <AuthorityLinkBlock currentPath="/academy" />
        <EnhancedFooter />
      </div>
    </>
  );
};

export default DeveloperAcademy;
