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
  crystalline_void: 'from-neon-cyan/20 via-neon-blue/10 to-transparent',
  neural_storm: 'from-neon-purple/20 via-neon-purple/10 to-transparent',
  temporal_fracture: 'from-neon-amber/20 via-neon-amber/10 to-transparent',
  obsidian_depths: 'from-gray-500/20 via-slate-500/10 to-transparent',
  aurora_membrane: 'from-neon-green/20 via-neon-cyan/10 to-transparent',
  quantum_fog: 'from-primary/20 via-neon-purple/10 to-transparent',
  spectral_lattice: 'from-neon-magenta/20 via-neon-magenta/10 to-transparent',
  void_bloom: 'from-neon-purple/20 via-primary/10 to-transparent',
  memory_cascade: 'from-neon-blue/20 via-neon-cyan/10 to-transparent',
  dream_sediment: 'from-neon-cyan/20 via-neon-green/10 to-transparent',
  nightmare_residue: 'from-destructive/20 via-neon-magenta/10 to-transparent',
  cognitive_aurora: 'from-neon-magenta/20 via-neon-purple/10 to-transparent',
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
      calm: 'border-neon-green/30',
      curious: 'border-neon-purple/30',
      agitated: 'border-neon-amber/30',
      fractured: 'border-destructive/30',
      dormant: 'border-gray-500/30',
      feral: 'border-neon-magenta/30',
    };
    return borders[mood] || 'border-border/30';
  };

  return (
    <>
      <Helmet>
        <title>Dream Artifacts — Crystallized Memories | CMPSBL</title>
        <meta name="description" content="Browse immutable dream artifacts crystallized by CMPSBL's DREAM engine. Each entry is a compressed, scored, permanent memory generated from user-fed dreams — verifiable and exportable." />
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
              <Gem className="w-8 h-8 text-neon-purple" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-neon-purple to-primary bg-clip-text text-transparent">
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
              <div className="w-8 h-8 border-2 border-neon-purple border-t-transparent rounded-full animate-spin mx-auto" />
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
                            <span className="flex items-center gap-1 text-neon-purple">
                              <Moon className="w-3 h-3" />
                              {artifact.dreams_compressed}
                            </span>
                            <span className="flex items-center gap-1 text-neon-magenta">
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
