import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DreamEaterAvatar } from '@/components/dream-eater/DreamEaterAvatar';
import { DreamFeederForm } from '@/components/dream-eater/DreamFeederForm';
import { supabase } from '@/integrations/supabase/client';
import { Moon, Skull, Activity, Sparkles } from 'lucide-react';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';

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

  useEffect(() => {
    fetchDreamEaterState();
    fetchStats();
  }, []);

  const fetchDreamEaterState = async () => {
    const { data } = await supabase
      .from('dream_eater_state')
      .select('*')
      .limit(1)
      .single();

    if (data) {
      setMood(data.current_mood as DreamEaterMood);
      setMutationLevel(data.mutation_level || 0);
    }
  };

  const fetchStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    const { count: todayDreams } = await supabase
      .from('dream_feeder_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('dream_type', 'dream')
      .gte('created_at', today);

    const { count: todayNightmares } = await supabase
      .from('dream_feeder_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('dream_type', 'nightmare')
      .gte('created_at', today);

    const { count: total } = await supabase
      .from('dream_feeder_submissions')
      .select('*', { count: 'exact', head: true });

    setStats({
      dreamsToday: todayDreams || 0,
      nightmaresToday: todayNightmares || 0,
      totalFed: total || 0,
    });
  };

  const handleFeedStart = () => {
    setIsFeeding(true);
  };

  const handleFeedComplete = async (dreamType: 'dream' | 'nightmare', sentiment: number) => {
    setIsFeeding(false);
    
    // Update mood based on sentiment
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

    // Update mutation level based on nightmares
    if (dreamType === 'nightmare') {
      setMutationLevel(prev => Math.min(prev + 1, 10));
    } else if (sentiment > 0.6) {
      setMutationLevel(prev => Math.max(prev - 1, 0));
    }

    // Update database state
    await supabase
      .from('dream_eater_state')
      .update({
        current_mood: newMood,
        mood_score: sentiment,
        dreams_consumed_today: dreamType === 'dream' ? stats.dreamsToday + 1 : stats.dreamsToday,
        nightmares_consumed_today: dreamType === 'nightmare' ? stats.nightmaresToday + 1 : stats.nightmaresToday,
        last_fed_at: new Date().toISOString(),
        mutation_level: mutationLevel,
        updated_at: new Date().toISOString(),
      })
      .eq('id', (await supabase.from('dream_eater_state').select('id').limit(1).single()).data?.id);

    // Refresh stats
    fetchStats();
  };

  return (
    <>
      <Helmet>
        <title>Feed the Dream-Eater | PromptFluid</title>
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

          {/* Feeding Form */}
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
              <DreamFeederForm 
                onFeedStart={handleFeedStart}
                onFeedComplete={handleFeedComplete}
              />
            </CardContent>
          </Card>

          {/* API Info */}
          <Card className="mt-8 bg-card/50 backdrop-blur border-primary/10">
            <CardHeader>
              <CardTitle className="text-lg">Developer API</CardTitle>
              <CardDescription>
                Feed the Dream-Eater from your own applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <code className="block p-4 bg-muted/50 rounded-lg text-sm overflow-x-auto">
                POST https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/dream-feeder-api
              </code>
              <p className="text-xs text-muted-foreground mt-2">
                Content-Type: application/json required. No HTML allowed. Max 2000 chars.
                Research Mode: classifier tags may be applied.
              </p>
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
