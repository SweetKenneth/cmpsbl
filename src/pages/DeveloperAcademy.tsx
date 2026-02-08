import React from 'react';
import { Helmet } from 'react-helmet-async';
import { CmpsblNav } from '@/components/navigation/CmpsblNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InteractiveTutorial } from '@/components/developer/InteractiveTutorial';
import { SkillTreeProgress } from '@/components/developer/SkillTreeProgress';
import { SandboxEnvironment } from '@/components/developer/SandboxEnvironment';
import { CertificationBadges } from '@/components/developer/CertificationBadges';
import { AIToolsSuite } from '@/components/developer/AIToolsSuite';
import { 
  BookOpen, TreeDeciduous, Box, Trophy, Sparkles, 
  GraduationCap, Rocket
} from 'lucide-react';

const DeveloperAcademy = () => {
  return (
    <>
      <Helmet>
        <title>Developer Academy | CMPSBL Substrate</title>
        <meta name="description" content="Master the CMPSBL Substrate SDK with interactive tutorials, skill progression, and AI-powered learning tools." />
      </Helmet>
      
      <div className="min-h-screen flex flex-col bg-background">
        <CmpsblNav />
        
        <main className="flex-grow">
          {/* Hero */}
          <section className="relative py-16 border-b border-border/40 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
            <div className="container mx-auto px-4 relative">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm mb-6">
                  <GraduationCap className="w-4 h-4" />
                  Interactive Learning Platform
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  Developer Academy
                </h1>
                <p className="text-xl text-muted-foreground mb-6">
                  Master the substrate through hands-on tutorials, earn certifications, 
                  and get AI-powered assistance while you build.
                </p>
                <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    5 Interactive Modules
                  </div>
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    4 Certifications
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    5 AI Tools
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Main Content */}
          <section className="py-12">
            <div className="container mx-auto px-4">
              <Tabs defaultValue="tutorial" className="space-y-8">
                <TabsList className="grid w-full max-w-3xl mx-auto grid-cols-5 h-auto p-1">
                  <TabsTrigger value="tutorial" className="flex flex-col gap-1 py-3">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-xs">Tutorial</span>
                  </TabsTrigger>
                  <TabsTrigger value="skills" className="flex flex-col gap-1 py-3">
                    <TreeDeciduous className="w-4 h-4" />
                    <span className="text-xs">Skill Tree</span>
                  </TabsTrigger>
                  <TabsTrigger value="sandbox" className="flex flex-col gap-1 py-3">
                    <Box className="w-4 h-4" />
                    <span className="text-xs">Sandbox</span>
                  </TabsTrigger>
                  <TabsTrigger value="badges" className="flex flex-col gap-1 py-3">
                    <Trophy className="w-4 h-4" />
                    <span className="text-xs">Badges</span>
                  </TabsTrigger>
                  <TabsTrigger value="ai-tools" className="flex flex-col gap-1 py-3">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs">AI Tools</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="tutorial">
                  <InteractiveTutorial />
                </TabsContent>

                <TabsContent value="skills">
                  <SkillTreeProgress />
                </TabsContent>

                <TabsContent value="sandbox">
                  <SandboxEnvironment />
                </TabsContent>

                <TabsContent value="badges">
                  <CertificationBadges />
                </TabsContent>

                <TabsContent value="ai-tools">
                  <AIToolsSuite />
                </TabsContent>
              </Tabs>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 border-t border-border/40">
            <div className="container mx-auto px-4 text-center">
              <div className="max-w-2xl mx-auto">
                <Rocket className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h2 className="text-2xl font-bold mb-4">Ready to Build?</h2>
                <p className="text-muted-foreground mb-6">
                  Complete the tutorials, earn your first certification, 
                  and start building production-ready agents.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <a href="/devtools" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors">
                    Get API Key
                  </a>
                  <a href="/docs" className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg font-medium hover:bg-muted/50 transition-colors">
                    Read Documentation
                  </a>
                </div>
              </div>
            </div>
          </section>
        </main>

        <EnhancedFooter />
      </div>
    </>
  );
};

export default DeveloperAcademy;
