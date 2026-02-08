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
  progress?: {
    xp_earned: number;
    is_completed: boolean;
  } | null;
  is_unlocked: boolean;
}

interface SkillTreeData {
  skills: Skill[];
}

const TIER_STYLES: Record<number, { gradient: string; border: string; text: string }> = {
  1: { gradient: 'from-primary/20 to-primary/5', border: 'border-primary/40', text: 'text-primary' },
  2: { gradient: 'from-accent/20 to-accent/5', border: 'border-accent/40', text: 'text-accent-foreground' },
  3: { gradient: 'from-secondary/30 to-secondary/10', border: 'border-secondary', text: 'text-secondary-foreground' },
  4: { gradient: 'from-muted to-muted/50', border: 'border-muted-foreground/40', text: 'text-muted-foreground' },
  5: { gradient: 'from-primary/30 to-accent/20', border: 'border-primary/50', text: 'text-primary' }
};

const TIER_NAMES: Record<number, string> = {
  1: 'Foundation',
  2: 'Intermediate',
  3: 'Advanced',
  4: 'Expert',
  5: 'Mastery'
};

export function SkillTreeProgress() {
  const [skillTree, setSkillTree] = useState<SkillTreeData | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [totalXp, setTotalXp] = useState(0);
  const [level, setLevel] = useState(1);
  const [developerId] = useState(() => `dev_${crypto.randomUUID().slice(0, 8)}`);

  useEffect(() => {
    loadSkillTree();
  }, []);

  const loadSkillTree = async () => {
    try {
      const { data } = await supabase.functions.invoke('developer-learning', {
        body: { action: 'get_skill_tree', developer_id: developerId }
      });
      
      if (data?.data?.skills) {
        setSkillTree(data.data);
        const xp = data.data.skills.reduce((sum: number, s: Skill) => 
          sum + (s.progress?.xp_earned || 0), 0);
        setTotalXp(xp);
        setLevel(Math.floor(xp / 500) + 1);
      }
    } catch {
      // Use mock data if backend unavailable
      setSkillTree({
        skills: [
          { skill_key: 'sdk_basics', name: 'SDK Fundamentals', description: 'Initialize and configure the SDK', category: 'foundation', tier: 1, xp_required: 100, prerequisites: [], unlocks: ['memory_ops', 'api_keys'], icon: '📚', is_unlocked: true, progress: { xp_earned: 45, is_completed: false } },
          { skill_key: 'memory_ops', name: 'Memory Operations', description: 'Store, recall, and manage memories', category: 'foundation', tier: 1, xp_required: 150, prerequisites: ['sdk_basics'], unlocks: ['context_windows'], icon: '🧠', is_unlocked: false, progress: null },
          { skill_key: 'api_keys', name: 'API Key Management', description: 'Secure key generation and rotation', category: 'foundation', tier: 1, xp_required: 75, prerequisites: ['sdk_basics'], unlocks: ['rate_limiting'], icon: '🔑', is_unlocked: false, progress: null },
          { skill_key: 'context_windows', name: 'Context Windows', description: 'Optimize context for LLMs', category: 'intermediate', tier: 2, xp_required: 200, prerequisites: ['memory_ops'], unlocks: ['semantic_search'], icon: '🪟', is_unlocked: false, progress: null },
          { skill_key: 'semantic_search', name: 'Semantic Search', description: 'Vector-based memory retrieval', category: 'advanced', tier: 3, xp_required: 300, prerequisites: ['context_windows'], unlocks: ['rag_patterns'], icon: '🔍', is_unlocked: false, progress: null },
          { skill_key: 'rag_patterns', name: 'RAG Integration', description: 'Retrieval-augmented generation', category: 'expert', tier: 4, xp_required: 400, prerequisites: ['semantic_search'], unlocks: ['production_patterns'], icon: '🔗', is_unlocked: false, progress: null },
          { skill_key: 'production_patterns', name: 'Production Patterns', description: 'Production-ready architectures', category: 'mastery', tier: 5, xp_required: 500, prerequisites: ['rag_patterns'], unlocks: [], icon: '🚀', is_unlocked: false, progress: null },
        ]
      });
      setTotalXp(45);
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
            <div className="text-3xl font-bold flex items-center justify-center gap-1 text-accent-foreground">
              <Star className="w-5 h-5" />
              {totalXp.toLocaleString()}
            </div>
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
            <div className="text-3xl font-bold flex items-center justify-center gap-1">
              <Trophy className="w-5 h-5" />0
            </div>
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
            <motion.div 
              key={tier} 
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: tierNum * 0.1 }}
            >
              <div className="flex items-center gap-3">
                <Badge 
                  variant="outline" 
                  className={`bg-gradient-to-r ${style.gradient} ${style.border} px-4 py-1.5`}
                >
                  Tier {tier}
                </Badge>
                <h3 className="font-semibold text-lg">{TIER_NAMES[tierNum]}</h3>
              </div>
              
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map((skill) => {
                  const progressPercent = skill.progress 
                    ? Math.min(100, (skill.progress.xp_earned / skill.xp_required) * 100)
                    : 0;
                  
                  return (
                    <Card
                      key={skill.skill_key}
                      className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                        !skill.is_unlocked ? 'opacity-50' : ''
                      } ${selectedSkill?.skill_key === skill.skill_key ? 'ring-2 ring-primary shadow-lg' : ''}`}
                      onClick={() => setSelectedSkill(skill)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-3">
                          <div className="text-3xl">{skill.icon}</div>
                          {skill.progress?.is_completed ? (
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          ) : !skill.is_unlocked ? (
                            <Lock className="w-5 h-5 text-muted-foreground" />
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              {progressPercent.toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                        
                        <h4 className="font-semibold mb-1">{skill.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{skill.description}</p>
                        
                        <Progress value={progressPercent} className="h-2 mb-2" />
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{skill.progress?.xp_earned || 0}/{skill.xp_required} XP</span>
                          {skill.prerequisites.length > 0 && (
                            <span>Requires: {skill.prerequisites.length} skill{skill.prerequisites.length > 1 ? 's' : ''}</span>
                          )}
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
                    <div className="flex flex-wrap gap-2">
                      {selectedSkill.prerequisites.map(p => (
                        <Badge key={p} variant="secondary">{p.replace(/_/g, ' ')}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">None - Start here!</span>
                  )}
                </div>
                <div>
                  <h5 className="font-medium text-sm mb-2">Unlocks</h5>
                  {selectedSkill.unlocks.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedSkill.unlocks.map(u => (
                        <Badge key={u} variant="outline">{u.replace(/_/g, ' ')}</Badge>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Master skill - Final achievement!</span>
                  )}
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