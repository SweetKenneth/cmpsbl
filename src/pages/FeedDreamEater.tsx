/**
 * Feed the Dream-Eater v2.0.0 — Living Entity Submission Surface
 * 
 * Features:
 * - Real-time state sync
 * - Mutation milestones
 * - Cryptic echo responses
 * - Public stream integration
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SEO } from '@/components/SEO';
import { LivingDreamEaterAvatar, type DreamEaterMood as AvatarMood } from '@/components/dream-eater/LivingDreamEaterAvatar';
import { DreamStreamTicker } from '@/components/dream-eater/DreamStreamTicker';
import { DreamEchoDisplay } from '@/components/dream-eater/DreamEchoDisplay';
import { MilestoneToast } from '@/components/dream-eater/MilestoneToast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Moon, Skull, Activity, Sparkles, Send, Loader2, Shield, Radio, Brain, Gem } from 'lucide-react';
import { CmpsblNav } from '@/components/navigation/CmpsblNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { useLivingState, type DreamEaterMood } from '@/hooks/useLivingDreamState';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Milestone {
  milestone_level: number;
  milestone_name: string;
  description?: string | null;
}

const FeedDreamEater = () => {
  const { state, milestones, loading, isLive, consume } = useLivingState();
  
  // Form state
  const [dreamContent, setDreamContent] = useState('');
  const [dreamType, setDreamType] = useState<'dream' | 'nightmare'>('dream');
  const [submitterName, setSubmitterName] = useState('');
  const [optInExcerpt, setOptInExcerpt] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFeeding, setIsFeeding] = useState(false);
  
  // Echo & milestone state
  const [currentEcho, setCurrentEcho] = useState<string | null>(null);
  const [unlockedMilestone, setUnlockedMilestone] = useState<Milestone | null>(null);
  const [nightmareIntensity, setNightmareIntensity] = useState(0);

  // Respect reduced motion preference
  const reducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dreamContent.trim()) {
      toast.error('Please describe your dream');
      return;
    }

    if (dreamContent.length < 10) {
      toast.error('Please provide more detail (at least 10 characters)');
      return;
    }

    setIsSubmitting(true);
    setIsFeeding(true);
    setCurrentEcho(null);
    setUnlockedMilestone(null);

    try {
      const result = await consume(dreamContent.trim(), dreamType, optInExcerpt);

      // Feeding animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (result) {
        // Set nightmare intensity for visual effects
        if (result.intensity) {
          setNightmareIntensity(result.intensity);
          setTimeout(() => setNightmareIntensity(0), 3000);
        }

        // Show echo
        if (result.echo) {
          setCurrentEcho(result.echo);
        }

        // Show milestone unlock
        if (result.milestones_unlocked?.length > 0) {
          setUnlockedMilestone(result.milestones_unlocked[0] as Milestone);
        }

        toast.success(
          dreamType === 'nightmare' 
            ? 'The Dream-Eater devours your nightmare...' 
            : 'The Dream-Eater savors your dream...'
        );
      } else {
        toast.success('Dream acknowledged...');
      }

      setDreamContent('');
      setSubmitterName('');
      setOptInExcerpt(false);
    } catch {
      toast.error('The Dream-Eater is resting. Try again later.');
    } finally {
      setIsSubmitting(false);
      setIsFeeding(false);
    }
  }, [dreamContent, dreamType, optInExcerpt, consume]);

  const currentMood: DreamEaterMood = state?.current_mood || 'calm';
  const mutationLevel = state?.mutation_level || 0;

  return (
    <>
      <SEO 
        title="Dream Feeder — Live Persistent Memory Demo | CMPSBL"
        description="Feed dreams to a living AI entity and watch it evolve. CMPSBL's interactive demo shows persistent memory, DREAM Engine consolidation, mutation scoring, and memory crystallization happening in real time."
        canonical="https://cmpsbl.com/feed-dream-eater"
        image="https://cmpsbl.com/og-dream-eater.jpg"
        keywords={['AI memory demo', 'persistent memory', 'dream eater', 'interactive AI', 'AI consciousness', 'neural network demo', 'CMPSBL']}
      />

      <CmpsblNav />

      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-neon-purple/20">
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Header with new copy */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-primary mb-4">
              This System Remembers
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              It changes when you speak to it. You are not feeding a model.
              <span className="block mt-1 text-foreground/80 font-medium">
                You are feeding a mind.
              </span>
            </p>

            {/* Live indicator */}
            <div className="flex items-center justify-center gap-2 mt-4 text-sm text-muted-foreground">
              <motion.div
                className={isLive ? "w-2 h-2 rounded-full bg-neon-green" : "w-2 h-2 rounded-full bg-neon-amber"}
                animate={isLive ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
              <span className="font-mono text-xs uppercase tracking-wider">
                {isLive ? 'Connected' : 'Connecting...'}
              </span>
            </div>
          </motion.div>

          {/* Dream-Eater Avatar - Living Version */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-8"
          >
            <LivingDreamEaterAvatar 
              mood={(isFeeding ? 'feeding' : currentMood) as AvatarMood}
              mutationLevel={mutationLevel}
              isFeeding={isFeeding}
              nightmareIntensity={nightmareIntensity}
              reducedMotion={reducedMotion}
            />
          </motion.div>

          {/* Echo Display */}
          <AnimatePresence>
            {currentEcho && (
              <div className="max-w-xl mx-auto mb-8">
                <DreamEchoDisplay 
                  echo={currentEcho} 
                  mood={currentMood}
                  onDismiss={() => setCurrentEcho(null)}
                />
              </div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="pt-4 text-center">
                <Moon className="w-5 h-5 mx-auto mb-1 text-neon-purple" />
                <p className="text-2xl font-bold">{state?.dreams_consumed_today || 0}</p>
                <p className="text-xs text-muted-foreground">Dreams Today</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="pt-4 text-center">
                <Skull className="w-5 h-5 mx-auto mb-1 text-neon-magenta" />
                <p className="text-2xl font-bold">{state?.nightmares_consumed_today || 0}</p>
                <p className="text-xs text-muted-foreground">Nightmares Today</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="pt-4 text-center">
                <Activity className="w-5 h-5 mx-auto mb-1 text-neon-cyan" />
                <p className="text-2xl font-bold capitalize">{currentMood}</p>
                <p className="text-xs text-muted-foreground">Current Mood</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="pt-4 text-center">
                <Sparkles className="w-5 h-5 mx-auto mb-1 text-neon-amber" />
                <p className="text-2xl font-bold">{mutationLevel}</p>
                <p className="text-xs text-muted-foreground">Mutation Level</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="feed" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="feed" className="gap-2">
                <Moon className="w-4 h-4" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="stream" className="gap-2">
                <Radio className="w-4 h-4" />
                Live Stream
              </TabsTrigger>
            </TabsList>

            {/* Feed Tab */}
            <TabsContent value="feed">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-card/80 backdrop-blur border-neon-purple/20">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Moon className="w-5 h-5 text-neon-purple" />
                      Offer Your Vision
                    </CardTitle>
                    <CardDescription>
                      Describe your dream or nightmare. The Dream-Eater's mood and form 
                      will shift based on what it consumes.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="submitter">Your Name (optional)</Label>
                        <Input
                          id="submitter"
                          placeholder="Anonymous Dreamer"
                          value={submitterName}
                          onChange={(e) => setSubmitterName(e.target.value)}
                          maxLength={50}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="space-y-3">
                        <Label>What are you feeding?</Label>
                        <RadioGroup
                          value={dreamType}
                          onValueChange={(value) => setDreamType(value as 'dream' | 'nightmare')}
                          className="flex gap-4"
                          disabled={isSubmitting}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="dream" id="dream" />
                            <Label htmlFor="dream" className="flex items-center gap-2 cursor-pointer">
                              <Moon className="w-4 h-4 text-neon-purple" />
                              Dream
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="nightmare" id="nightmare" />
                            <Label htmlFor="nightmare" className="flex items-center gap-2 cursor-pointer">
                              <Skull className="w-4 h-4 text-neon-magenta" />
                              Nightmare
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="content">Describe your {dreamType}</Label>
                        <Textarea
                          id="content"
                          placeholder={dreamType === 'nightmare' 
                            ? "Tell me about the shadows that haunt your sleep..." 
                            : "Share the visions that visit you in slumber..."
                          }
                          value={dreamContent}
                          onChange={(e) => setDreamContent(e.target.value)}
                          className="min-h-[150px] resize-none"
                          maxLength={2000}
                          disabled={isSubmitting}
                        />
                        <p className="text-xs text-muted-foreground text-right">
                          {dreamContent.length}/2000
                        </p>
                      </div>

                      {/* Opt-in excerpt */}
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="optIn"
                          checked={optInExcerpt}
                          onCheckedChange={(checked) => setOptInExcerpt(checked === true)}
                          disabled={isSubmitting}
                        />
                        <Label 
                          htmlFor="optIn" 
                          className="text-sm text-muted-foreground cursor-pointer"
                        >
                          Share a brief excerpt in the public stream (anonymous)
                        </Label>
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        size="lg"
                        disabled={isSubmitting || !dreamContent.trim() || loading}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Feeding...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Feed the Dream-Eater
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>

            {/* Live Stream Tab */}
            <TabsContent value="stream">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="bg-card/80 backdrop-blur border-border/30">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Radio className="w-5 h-5 text-neon-green" />
                      Public Dream Stream
                    </CardTitle>
                    <CardDescription>
                      Watch the Dream-Eater consume in real-time. Anonymous and continuous.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DreamStreamTicker maxItems={8} />
                  </CardContent>
                </Card>
              </motion.div>
            </TabsContent>
          </Tabs>

          {/* Links to Archaeology & Artifacts */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4 mt-8"
          >
            <Link to="/dream-eater/archaeology">
              <Button variant="outline" className="gap-2">
                <Brain className="w-4 h-4" />
                Dream Archaeology
              </Button>
            </Link>
            <Link to="/dream-eater/artifacts">
              <Button variant="outline" className="gap-2">
                <Gem className="w-4 h-4" />
                Daily Artifacts
              </Button>
            </Link>
          </motion.div>

          {/* Security Notice */}
          <Card className="mt-8 bg-card/50 backdrop-blur border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 text-neon-green flex-shrink-0" />
                <p>
                  All submissions are processed through the substrate's secure edge layer. 
                  Content is sanitized and rate-limited. No personal data is stored without consent.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Dream Eater Sub-pages */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link to="/dream-eater/archaeology">
              <Button variant="outline" size="sm" className="gap-2">
                <Brain className="w-4 h-4" />
                Dream Archaeology
              </Button>
            </Link>
            <Link to="/dream-eater/artifacts">
              <Button variant="outline" size="sm" className="gap-2">
                <Gem className="w-4 h-4" />
                Dream Artifacts
              </Button>
            </Link>
          </div>

          {/* Mystery Footer */}
          <p className="text-center text-xs text-muted-foreground/50 mt-8 font-serif italic">
            "The substrate remembers what you have forgotten."
          </p>
        </div>
      </div>

      {/* Milestone Toast */}
      <MilestoneToast 
        milestone={unlockedMilestone} 
        onDismiss={() => setUnlockedMilestone(null)} 
      />

      <EnhancedFooter />
    </>
  );
};

export default FeedDreamEater;
