/**
 * Dream Archaeology Page
 * 
 * Read-only analytics surface showing what the Dream-Eater has learned.
 * No raw dream content exposed - only aggregated themes and patterns.
 */

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Brain, TrendingUp, Moon, Flame, Calendar, Eye } from 'lucide-react';

interface ArchaeologyEntry {
  id: string;
  period_start: string;
  period_end: string;
  mood_distribution: Record<string, number>;
  nightmare_ratio: number;
  total_consumed: number;
  insight: string;
  created_at: string;
}

interface DreamEaterState {
  current_mood: string;
  mutation_level: number;
  dreams_consumed_today: number;
  nightmares_consumed_today: number;
}

const DreamArchaeology = () => {
  const [entries, setEntries] = useState<ArchaeologyEntry[]>([]);
  const [state, setState] = useState<DreamEaterState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [archaeologyRes, stateRes] = await Promise.all([
          supabase
            .from('dream_archaeology')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10),
          supabase
            .from('dream_eater_state')
            .select('*')
            .single()
        ]);

        if (archaeologyRes.data) {
          setEntries(archaeologyRes.data as ArchaeologyEntry[]);
        }
        if (stateRes.data) {
          setState(stateRes.data as DreamEaterState);
        }
      } catch (error) {
        console.error('Failed to fetch archaeology data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      calm: 'bg-neon-green',
      curious: 'bg-neon-purple',
      agitated: 'bg-neon-amber',
      fractured: 'bg-destructive',
      dormant: 'bg-muted-foreground',
      feral: 'bg-neon-magenta',
    };
    return colors[mood] || 'bg-muted';
  };

  return (
    <>
      <Helmet>
        <title>Dream Archaeology — Memory Pattern Explorer | CMPSBL</title>
        <meta name="description" content="Dig into patterns the CMPSBL Dream-Eater has absorbed: mood distributions, recurring themes, mutation chains, and memory compression trends from thousands of user-submitted dreams." />
      </Helmet>

      <PublicNav />

      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-neon-purple/20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Brain className="w-8 h-8 text-neon-purple" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-purple to-primary bg-clip-text text-transparent">
                Dream Archaeology
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              What the Dream-Eater has learned. Patterns extracted from the collective unconscious.
              No raw visions exposed — only the shapes that remain.
            </p>
          </motion.div>

          {/* Current State */}
          {state && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="mb-8 bg-gradient-to-br from-neon-purple/30 to-primary/20 border-neon-purple/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-neon-purple" />
                    Current State
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 rounded-lg bg-background/30">
                      <p className="text-sm text-muted-foreground mb-1">Mood</p>
                      <p className="text-xl font-bold capitalize">{state.current_mood}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background/30">
                      <p className="text-sm text-muted-foreground mb-1">Mutation Level</p>
                      <p className="text-xl font-bold">{state.mutation_level}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background/30">
                      <p className="text-sm text-muted-foreground mb-1">Dreams Today</p>
                      <p className="text-xl font-bold text-neon-purple">{state.dreams_consumed_today}</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background/30">
                      <p className="text-sm text-muted-foreground mb-1">Nightmares Today</p>
                      <p className="text-xl font-bold text-neon-magenta">{state.nightmares_consumed_today}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Historical Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-muted-foreground" />
              Historical Patterns
            </h2>

            {loading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground mt-4">Excavating memories...</p>
              </div>
            ) : entries.length === 0 ? (
              <Card className="bg-muted/20">
                <CardContent className="py-12 text-center">
                  <Brain className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground">No patterns recorded yet.</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    The Dream-Eater is still learning...
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {entries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="bg-card/50 backdrop-blur border-border/30">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            {new Date(entry.period_start).toLocaleDateString()} — {new Date(entry.period_end).toLocaleDateString()}
                          </CardTitle>
                          <div className="flex items-center gap-2 text-sm">
                            <Moon className="w-4 h-4 text-neon-purple" />
                            <span>{entry.total_consumed}</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {/* Mood Distribution Bar */}
                        <div className="mb-4">
                          <p className="text-xs text-muted-foreground mb-2">Mood Distribution</p>
                          <div className="flex h-3 rounded-full overflow-hidden bg-muted/30">
                            {Object.entries(entry.mood_distribution || {}).map(([mood, count]) => {
                              const total = Object.values(entry.mood_distribution || {}).reduce((a, b) => a + b, 0);
                              const percentage = total > 0 ? (count / total) * 100 : 0;
                              return (
                                <div
                                  key={mood}
                                  className={getMoodColor(mood)}
                                  style={{ width: `${percentage}%` }}
                                  title={`${mood}: ${count}`}
                                />
                              );
                            })}
                          </div>
                        </div>

                        {/* Nightmare Ratio */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-2">
                            <Flame className="w-4 h-4 text-neon-magenta" />
                            <span className="text-sm">
                              Nightmare Ratio: {(entry.nightmare_ratio * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>

                        {/* Insight */}
                        {entry.insight && (
                          <p className="text-sm text-muted-foreground/80 italic border-l-2 border-neon-purple/30 pl-3">
                            {entry.insight}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Mystery Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground/50 mt-12 font-serif italic"
          >
            "The substrate remembers what you have forgotten."
          </motion.p>
        </div>
      </div>

      <EnhancedFooter />
    </>
  );
};

export default DreamArchaeology;
