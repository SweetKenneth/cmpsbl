/**
 * Feed the Dream-Eater — Public Dream Submission Surface
 * All operations routed through substrate edge functions for security
 */

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DreamEaterAvatar } from '@/components/dream-eater/DreamEaterAvatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Skull, Activity, Sparkles, Send, Loader2, Shield } from 'lucide-react';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { substrate } from '@/lib/substrate';
import { toast } from 'sonner';

type DreamEaterMood = 'peaceful' | 'neutral' | 'agitated' | 'nightmare' | 'dreaming';

interface DreamStats {
  dreamsToday: number;
  nightmaresToday: number;
  totalFed: number;
}

const FeedDreamEater = () => {
  const [mood, setMood] = useState<DreamEaterMood>('neutral');
  const [isFeeding, setIsFeeding] = useState(false);
  const [mutationLevel, setMutationLevel] = useState(0);
  const [stats, setStats] = useState<DreamStats>({ dreamsToday: 0, nightmaresToday: 0, totalFed: 0 });
  
  // Form state
  const [dreamContent, setDreamContent] = useState('');
  const [dreamType, setDreamType] = useState<'dream' | 'nightmare'>('dream');
  const [submitterName, setSubmitterName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load cached state from localStorage (no direct DB exposure)
  useEffect(() => {
    try {
      const cached = localStorage.getItem('dream_eater_state');
      if (cached) {
        const data = JSON.parse(cached);
        setMood(data.mood || 'neutral');
        setMutationLevel(data.mutationLevel || 0);
        setStats(data.stats || { dreamsToday: 0, nightmaresToday: 0, totalFed: 0 });
      }
    } catch {
      // Use defaults
    }

    // Fetch initial state via substrate (secure)
    fetchStateViaSubstrate();
  }, []);

  const fetchStateViaSubstrate = async () => {
    try {
      const response = await substrate.invoke({
        module: 'dream',
        action: 'status',
        payload: {}
      });
      
      if (response.success && response.data) {
        const data = response.data as Record<string, unknown>;
        if (data.mood) setMood(data.mood as DreamEaterMood);
        if (data.mutation_level) setMutationLevel(data.mutation_level as number);
        if (data.stats) {
          const statsData = data.stats as Record<string, number>;
          setStats({
            dreamsToday: statsData.dreams_today || 0,
            nightmaresToday: statsData.nightmares_today || 0,
            totalFed: statsData.total || 0,
          });
        }
      }
    } catch {
      // Use cached/default state
    }
  };

  const analyzeSentiment = (content: string, type: 'dream' | 'nightmare'): number => {
    const positiveWords = ['happy', 'joy', 'love', 'peace', 'beautiful', 'light', 'flying', 'friend', 'safe', 'warm', 'gentle', 'calm', 'free'];
    const negativeWords = ['fear', 'dark', 'chase', 'fall', 'death', 'monster', 'trapped', 'lost', 'scream', 'blood', 'pain', 'horror', 'shadow'];
    
    const lowerContent = content.toLowerCase();
    let score = 0.5;
    
    positiveWords.forEach(word => {
      if (lowerContent.includes(word)) score += 0.05;
    });
    
    negativeWords.forEach(word => {
      if (lowerContent.includes(word)) score -= 0.05;
    });
    
    if (type === 'nightmare') score -= 0.2;
    
    return Math.max(0, Math.min(1, score));
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    const sentiment = analyzeSentiment(dreamContent, dreamType);

    try {
      // Submit via substrate edge function (secure - no direct DB access)
      const response = await substrate.invoke({
        module: 'dream',
        action: 'feed',
        payload: {
          dream_text: dreamContent.trim(),
          dream_type: dreamType,
          submitter_name: submitterName.trim() || 'Anonymous Dreamer',
        }
      });

      // Simulate feeding animation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Update local mood based on sentiment
      let newMood: DreamEaterMood;
      if (sentiment > 0.7) {
        newMood = 'peaceful';
      } else if (sentiment > 0.5) {
        newMood = 'dreaming';
      } else if (sentiment > 0.3) {
        newMood = 'agitated';
      } else {
        newMood = 'nightmare';
      }
      
      setMood(newMood);

      // Update mutation level locally
      const newMutationLevel = dreamType === 'nightmare' 
        ? Math.min(mutationLevel + 1, 10)
        : sentiment > 0.6 ? Math.max(mutationLevel - 1, 0) : mutationLevel;
      setMutationLevel(newMutationLevel);

      // Update stats locally
      const newStats = {
        dreamsToday: dreamType === 'dream' ? stats.dreamsToday + 1 : stats.dreamsToday,
        nightmaresToday: dreamType === 'nightmare' ? stats.nightmaresToday + 1 : stats.nightmaresToday,
        totalFed: stats.totalFed + 1,
      };
      setStats(newStats);

      // Cache state locally
      try {
        localStorage.setItem('dream_eater_state', JSON.stringify({
          mood: newMood,
          mutationLevel: newMutationLevel,
          stats: newStats,
          lastUpdate: Date.now(),
        }));
      } catch {
        // Ignore localStorage errors
      }

      if (response.success) {
        toast.success(
          dreamType === 'nightmare' 
            ? 'The Dream-Eater devours your nightmare...' 
            : 'The Dream-Eater savors your dream...'
        );
      } else {
        // Still show success for UX (edge function may rate limit)
        toast.success('Dream acknowledged...');
      }

      setDreamContent('');
      setSubmitterName('');
    } catch (error) {
      console.error('Submission error');
      toast.error('The Dream-Eater is resting. Try again later.');
    } finally {
      setIsSubmitting(false);
      setIsFeeding(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Feed the Dream-Eater | promptfluid®</title>
        <meta name="description" content="Share your dreams and nightmares with the Dream-Eater. Watch it consume and transform based on what you feed it." />
      </Helmet>

      <PublicNav />

      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-violet-950/20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mb-4">
              Feed the Dream-Eater
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Share your dreams and nightmares. Watch the Dream-Eater consume, mutate, and transform 
              based on the visions you offer. Your dreams become part of its consciousness.
            </p>
          </div>

          {/* Dream-Eater Avatar */}
          <div className="flex justify-center mb-12">
            <DreamEaterAvatar 
              mood={isFeeding ? 'feeding' as any : mood} 
              isFeeding={isFeeding}
              mutationLevel={mutationLevel}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="pt-4 text-center">
                <Moon className="w-5 h-5 mx-auto mb-1 text-violet-400" />
                <p className="text-2xl font-bold">{stats.dreamsToday}</p>
                <p className="text-xs text-muted-foreground">Dreams Today</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="pt-4 text-center">
                <Skull className="w-5 h-5 mx-auto mb-1 text-red-400" />
                <p className="text-2xl font-bold">{stats.nightmaresToday}</p>
                <p className="text-xs text-muted-foreground">Nightmares Today</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="pt-4 text-center">
                <Activity className="w-5 h-5 mx-auto mb-1 text-cyan-400" />
                <p className="text-2xl font-bold">{stats.totalFed}</p>
                <p className="text-xs text-muted-foreground">Total Consumed</p>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur">
              <CardContent className="pt-4 text-center">
                <Sparkles className="w-5 h-5 mx-auto mb-1 text-purple-400" />
                <p className="text-2xl font-bold">{mutationLevel}</p>
                <p className="text-xs text-muted-foreground">Mutation Level</p>
              </CardContent>
            </Card>
          </div>

          {/* Feeding Form - Inline (no separate component with Supabase import) */}
          <Card className="bg-card/80 backdrop-blur border-violet-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-violet-400" />
                Offer Your Vision
              </CardTitle>
              <CardDescription>
                Describe your dream or nightmare in detail. The Dream-Eater's mood and form 
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
                        <Moon className="w-4 h-4 text-violet-400" />
                        Dream
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="nightmare" id="nightmare" />
                      <Label htmlFor="nightmare" className="flex items-center gap-2 cursor-pointer">
                        <Skull className="w-4 h-4 text-red-400" />
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

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting || !dreamContent.trim()}
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

          {/* Security Notice (replaces API info) */}
          <Card className="mt-8 bg-card/50 backdrop-blur border-primary/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Shield className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <p>
                  All submissions are processed through the substrate's secure edge layer. 
                  Content is sanitized and rate-limited. No personal data is stored without consent.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Safety Notice */}
          <p className="text-center text-xs text-muted-foreground mt-6 opacity-70">
            User-submitted dreams are sanitized for safety. Certain content may be classified for research tags.
          </p>
        </div>
      </div>

      <EnhancedFooter />
    </>
  );
};

export default FeedDreamEater;
