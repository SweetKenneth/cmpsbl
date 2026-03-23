import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle2, Star, Trophy, Zap, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';

interface Skill {
  skill_key: string;
  name: string;
  description: string;
  category: string;
  tier: number;
  xp_required: number;
  prerequisites: string[];
  unlocks: string[];
  icon: string;
  progress?: { xp_earned: number; is_completed: boolean } | null;
  is_unlocked: boolean;
}

const TIER_STYLES: Record<number, { gradient: string; border: string; text: string }> = {
  1: { gradient: 'from-primary/20 to-primary/5', border: 'border-primary/40', text: 'text-primary' },
  2: { gradient: 'from-accent/20 to-accent/5', border: 'border-accent/40', text: 'text-accent-foreground' },
  3: { gradient: 'from-secondary/30 to-secondary/10', border: 'border-secondary', text: 'text-secondary-foreground' },
  4: { gradient: 'from-muted to-muted/50', border: 'border-muted-foreground/40', text: 'text-muted-foreground' },
  5: { gradient: 'from-primary/30 to-accent/20', border: 'border-primary/50', text: 'text-primary' },
};

const TIER_NAMES: Record<number, string> = {
  1: 'Foundation',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Expert',
  5: 'Mastery',
};

const SKILL_DEFINITIONS: Omit<Skill, 'is_unlocked' | 'progress'>[] = [
  // Tier 1 — Foundation
  { skill_key: 'sdk_basics', name: 'SDK Fundamentals', description: 'Initialize the substrate client and connect to the 40-primitive cognitive mesh', category: 'foundation', tier: 1, xp_required: 100, prerequisites: [], unlocks: ['memory_ops', 'intent_routing'], icon: '📚' },
  { skill_key: 'memory_ops', name: 'BRAIN Memory API', description: '4-tier persistent memory: store, recall, build context, and DREAM Engine consolidation', category: 'foundation', tier: 1, xp_required: 150, prerequisites: ['sdk_basics'], unlocks: ['nexus_routing'], icon: '🧠' },
  { skill_key: 'intent_routing', name: 'Intent Mesh', description: 'broadcastIntent(), resolver routing, receipt logging, and mesh telemetry', category: 'foundation', tier: 1, xp_required: 125, prerequisites: ['sdk_basics'], unlocks: ['resolver_patterns'], icon: '🔀' },

  // Tier 2 — Intermediate
  { skill_key: 'nexus_routing', name: 'NEXUS Routing', description: 'Multi-provider AI routing with failover, budget controls, and latency optimization', category: 'intermediate', tier: 2, xp_required: 200, prerequisites: ['memory_ops'], unlocks: ['defense_security'], icon: '🌐' },
  { skill_key: 'resolver_patterns', name: 'Resolver Patterns', description: 'Node.resolver naming, capability exposure, and cross-node communication', category: 'intermediate', tier: 2, xp_required: 200, prerequisites: ['intent_routing'], unlocks: ['memory_stream'], icon: '⚡' },
  { skill_key: 'memory_stream', name: 'Memory Stream', description: 'Crystallization, CJPI scoring, tiering, and vault management', category: 'intermediate', tier: 2, xp_required: 225, prerequisites: ['resolver_patterns'], unlocks: ['ascension_basics'], icon: '✨' },

  // Tier 3 — Advanced
  { skill_key: 'defense_security', name: 'DEFENSE & Security', description: 'Threat scoring, anomaly detection, rate limiting, and safety patterns', category: 'advanced', tier: 3, xp_required: 300, prerequisites: ['nexus_routing'], unlocks: ['cjpi_scoring'], icon: '🛡️' },
  { skill_key: 'ascension_basics', name: 'Ascension Lifecycle', description: 'Auxiliary Node ingestion, primitive extraction, quality gates, and delta measurement', category: 'advanced', tier: 3, xp_required: 350, prerequisites: ['memory_stream'], unlocks: ['production_hardening'], icon: '🚀' },
  { skill_key: 'cjpi_scoring', name: 'CJPI Scoring', description: 'Novelty, utility, complexity, composability — discovery evaluation framework', category: 'advanced', tier: 3, xp_required: 275, prerequisites: ['defense_security'], unlocks: ['production_hardening'], icon: '🎯' },

  // Tier 4 — Expert
  { skill_key: 'production_hardening', name: 'Production Patterns', description: 'Error handling, Forge protections, VOLVER handicapping, non-blocking telemetry', category: 'expert', tier: 4, xp_required: 400, prerequisites: ['ascension_basics', 'cjpi_scoring'], unlocks: ['substrate_architect'], icon: '🔧' },
  { skill_key: 'dream_cycles', name: 'DREAM Engineering', description: 'Memory consolidation cycles, heuristic sharing, and continuous learning patterns', category: 'expert', tier: 4, xp_required: 375, prerequisites: ['ascension_basics'], unlocks: ['substrate_architect'], icon: '🌙' },

  // Tier 5 — Mastery
  { skill_key: 'substrate_architect', name: 'Substrate Architect', description: 'Full system mastery: multi-node orchestration, governance, and capability export', category: 'mastery', tier: 5, xp_required: 500, prerequisites: ['production_hardening', 'dream_cycles'], unlocks: [], icon: '👑' },
];

export function SkillTreeProgress() {
  const [skillTree, setSkillTree] = useState<{ skills: Skill[] } | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [developerId] = useState(() => `dev_${crypto.randomUUID().slice(0, 8)}`);

  useEffect(() => { loadSkillTree(); }, []);

  const loadSkillTree = async () => {
    try {
      const { data } = await supabase.functions.invoke('developer-learning', { body: { action: 'get_skill_tree', developer_id: developerId } });
      if (data?.data?.skills) {
        setSkillTree(data.data);
        const xp = data.data.skills.reduce((sum: number, s: Skill) => sum + (s.progress?.xp_earned || 0), 0);
        setTotalXp(xp);
        setLevel(Math.floor(xp / 500) + 1);
      }
    } catch {
      // Use default skill definitions with zero progress when API is unavailable
      const defaultSkills = SKILL_DEFINITIONS.map(s => ({ ...s, is_unlocked: s.tier === 1 && s.prerequisites.length === 0, progress: null }));
      setSkillTree({ skills: defaultSkills });
      setTotalXp(0);
      setLevel(1);
    }
  };

  const groupedByTier = skillTree?.skills.reduce((acc, skill) => {
    if (!acc[skill.tier]) acc[skill.tier] = [];
    acc[skill.tier].push(skill);
    return acc;
  }, {} as Record<number, Skill[]>) || {};

  const completedCount = skillTree?.skills.filter(s => s.progress?.is_completed).length || 0;
  const totalSkills = skillTree?.skills.length || 0;

  return (
    <div className="space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">{level}</div>
            <div className="text-sm text-muted-foreground">Level</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold flex items-center justify-center gap-1 text-accent-foreground"><Star className="w-5 h-5" />{totalXp.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Total XP</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold text-primary">{completedCount}/{totalSkills}</div>
            <div className="text-sm text-muted-foreground">Skills Mastered</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-secondary/30 to-secondary/10 border-secondary">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold flex items-center justify-center gap-1"><Trophy className="w-5 h-5" />0</div>
            <div className="text-sm text-muted-foreground">Certifications</div>
          </CardContent>
        </Card>
      </div>

      {/* Level Progress */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Level {level}</span>
            <span className="text-sm text-muted-foreground">{totalXp % 500}/500 XP to Level {level + 1}</span>
          </div>
          <Progress value={(totalXp % 500) / 5} className="h-3" />
        </CardContent>
      </Card>

      {/* Skill Tree */}
      <div className="space-y-8">
        {Object.entries(groupedByTier).map(([tier, skills]) => {
          const tierNum = Number(tier);
          const style = TIER_STYLES[tierNum] || TIER_STYLES[1];
          return (
            <motion.div key={tier} className="space-y-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: tierNum * 0.1 }}>
              <div className="flex items-center gap-3">
                <Badge variant="outline" className={`bg-gradient-to-r ${style.gradient} ${style.border} px-4 py-1.5`}>Tier {tier}</Badge>
                <h3 className="font-semibold text-lg">{TIER_NAMES[tierNum]}</h3>
                <span className="text-xs text-muted-foreground">{skills.length} skills</span>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map((skill) => {
                  const progressPercent = skill.progress ? Math.min(100, (skill.progress.xp_earned / skill.xp_required) * 100) : 0;
                  return (
                    <Card
                      key={skill.skill_key}
                      className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${!skill.is_unlocked ? 'opacity-50' : ''} ${selectedSkill?.skill_key === skill.skill_key ? 'ring-2 ring-primary shadow-lg' : ''}`}
                      onClick={() => setSelectedSkill(skill)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-3xl">{skill.icon}</div>
                          {skill.progress?.is_completed ? <CheckCircle2 className="w-5 h-5 text-primary" /> : !skill.is_unlocked ? <Lock className="w-5 h-5 text-muted-foreground" /> : <Badge variant="secondary" className="text-xs">{progressPercent.toFixed(0)}%</Badge>}
                        </div>
                        <h4 className="font-semibold mb-1">{skill.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{skill.description}</p>
                        <Progress value={progressPercent} className="h-2 mb-2" />
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{skill.progress?.xp_earned || 0}/{skill.xp_required} XP</span>
                          {skill.prerequisites.length > 0 && <span>Req: {skill.prerequisites.length}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Skill Detail */}
      {selectedSkill && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-muted/50 to-muted/20 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <span className="text-3xl">{selectedSkill.icon}</span>
                {selectedSkill.name}
                <Badge variant="outline" className="ml-auto">Tier {selectedSkill.tier}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">{selectedSkill.description}</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h5 className="font-medium text-sm mb-2">Prerequisites</h5>
                  {selectedSkill.prerequisites.length > 0 ? (
                    <div className="flex flex-wrap gap-2">{selectedSkill.prerequisites.map(p => <Badge key={p} variant="secondary">{p.replace(/_/g, ' ')}</Badge>)}</div>
                  ) : <span className="text-sm text-muted-foreground">None — Start here!</span>}
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-2">Unlocks</h5>
                  {selectedSkill.unlocks.length > 0 ? (
                    <div className="flex flex-wrap gap-2">{selectedSkill.unlocks.map(u => <Badge key={u} variant="outline">{u.replace(/_/g, ' ')}</Badge>)}</div>
                  ) : <span className="text-sm text-muted-foreground">Master skill — Final achievement!</span>}
                </div>
              </div>
              <Button className="w-full" disabled={!selectedSkill.is_unlocked}>
                <Zap className="w-4 h-4 mr-2" />
                {selectedSkill.is_unlocked ? 'Start Learning' : 'Complete Prerequisites First'}
                {selectedSkill.is_unlocked && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default SkillTreeProgress;
