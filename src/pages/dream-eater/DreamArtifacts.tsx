/**
 * Dream Artifacts Page
 * 
 * Displays daily immutable artifacts generated from dream compression.
 * Each artifact is a single sentence + mood + visual seed.
 */

import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { Card, CardContent } from '@/components/ui/card';
import { Gem, Calendar, Moon, Flame, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Artifact {
  id: string;
  artifact_date: string;
  sentence: string;
  mood: string;
  visual_seed: string;
  dreams_compressed: number;
  nightmares_compressed: number;
  is_immutable: boolean;
  created_at: string;
}

const VISUAL_SEED_GRADIENTS: Record<string, string> = {
  crystalline_void: 'from-cyan-500/20 via-blue-500/10 to-transparent',
  neural_storm: 'from-violet-500/20 via-purple-500/10 to-transparent',
  temporal_fracture: 'from-amber-500/20 via-orange-500/10 to-transparent',
  obsidian_depths: 'from-gray-500/20 via-slate-500/10 to-transparent',
  aurora_membrane: 'from-emerald-500/20 via-teal-500/10 to-transparent',
  quantum_fog: 'from-indigo-500/20 via-violet-500/10 to-transparent',
  spectral_lattice: 'from-pink-500/20 via-rose-500/10 to-transparent',
  void_bloom: 'from-purple-500/20 via-indigo-500/10 to-transparent',
  memory_cascade: 'from-blue-500/20 via-cyan-500/10 to-transparent',
  dream_sediment: 'from-teal-500/20 via-emerald-500/10 to-transparent',
  nightmare_residue: 'from-red-500/20 via-rose-500/10 to-transparent',
  cognitive_aurora: 'from-fuchsia-500/20 via-violet-500/10 to-transparent',
};

const DreamArtifacts = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtifacts = async () => {
      try {
        const { data } = await supabase
          .from('dream_artifacts')
          .select('*')
          .order('artifact_date', { ascending: false })
          .limit(30);

        if (data) {
          setArtifacts(data as Artifact[]);
        }
      } catch (error) {
        console.error('Failed to fetch artifacts');
      } finally {
        setLoading(false);
      }
    };

    fetchArtifacts();
  }, []);

  const getMoodBorder = (mood: string) => {
    const borders: Record<string, string> = {
      calm: 'border-emerald-500/30',
      curious: 'border-violet-500/30',
      agitated: 'border-orange-500/30',
      fractured: 'border-red-500/30',
      dormant: 'border-gray-500/30',
      feral: 'border-rose-500/30',
    };
    return borders[mood] || 'border-border/30';
  };

  return (
    <>
      <Helmet>
        <title>Dream Artifacts — Crystallized AI Memories | CMPSBL</title>
        <meta name="description" content="Immutable artifacts generated from compressed dreams. Each day's visions crystallized into permanent, verifiable memories by the DREAM consolidation engine across 40 substrate nodes." />
      </Helmet>

      <PublicNav />

      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-violet-950/20">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gem className="w-8 h-8 text-violet-400" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Dream Artifacts
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Each day's dreams compressed into a single crystallized truth.
              Immutable once formed. The Dream-Eater's distilled wisdom.
            </p>
          </motion.div>

          {/* Artifacts Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-muted-foreground mt-4">Crystallizing artifacts...</p>
            </div>
          ) : artifacts.length === 0 ? (
            <Card className="bg-muted/20">
              <CardContent className="py-12 text-center">
                <Gem className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                <p className="text-muted-foreground">No artifacts formed yet.</p>
                <p className="text-sm text-muted-foreground/60 mt-1">
                  The first artifact crystallizes at midnight...
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {artifacts.map((artifact, index) => {
                const gradient = VISUAL_SEED_GRADIENTS[artifact.visual_seed] || VISUAL_SEED_GRADIENTS.void_bloom;
                
                return (
                  <motion.div
                    key={artifact.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={cn(
                      "overflow-hidden border-2 transition-all duration-300 hover:scale-[1.01]",
                      getMoodBorder(artifact.mood)
                    )}>
                      {/* Visual gradient based on seed */}
                      <div className={cn(
                        "absolute inset-0 bg-gradient-to-br pointer-events-none",
                        gradient
                      )} />

                      <CardContent className="relative p-6">
                        {/* Date & Stats Header */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(artifact.artifact_date).toLocaleDateString('en-US', { 
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="flex items-center gap-1 text-violet-400">
                              <Moon className="w-3 h-3" />
                              {artifact.dreams_compressed}
                            </span>
                            <span className="flex items-center gap-1 text-rose-400">
                              <Flame className="w-3 h-3" />
                              {artifact.nightmares_compressed}
                            </span>
                          </div>
                        </div>

                        {/* The Sentence */}
                        <blockquote className="text-xl md:text-2xl font-serif italic text-foreground/90 text-center py-6 px-4">
                          "{artifact.sentence}"
                        </blockquote>

                        {/* Footer */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground/60">
                          <span className="capitalize flex items-center gap-1">
                            Mood: <span className="text-muted-foreground">{artifact.mood}</span>
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            {artifact.visual_seed?.replace(/_/g, ' ')}
                          </span>
                          {artifact.is_immutable && (
                            <span className="flex items-center gap-1">
                              <Lock className="w-3 h-3" />
                              Immutable
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Mystery Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-sm text-muted-foreground/50 mt-12 font-serif italic"
          >
            "Once crystallized, an artifact cannot be changed. Only accumulated."
          </motion.p>
        </div>
      </div>

      <EnhancedFooter />
    </>
  );
};

export default DreamArtifacts;
