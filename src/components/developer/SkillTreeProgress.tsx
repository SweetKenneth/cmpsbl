import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Lock, CheckCircle2, Star, Trophy, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

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

const TIER_COLORS: Record<number, string> = {
  1: 'from-emerald-500/20 to-emerald-600/20 border-emerald-500/40',
  2: 'from-blue-500/20 to-blue-600/20 border-blue-500/40',
  3: 'from-purple-500/20 to-purple-600/20 border-purple-500/40',
  4: 'from-amber-500/20 to-amber-600/20 border-amber-500/40',
  5: 'from-rose-500/20 to-rose-600/20 border-rose-500/40'
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
    } catch (e) {
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
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{level}</div>
            <div className="text-sm text-muted-foreground">Level</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold flex items-center justify-center gap-1">
              <Star className="w-5 h-5 text-amber-500" />
              {totalXp.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total XP</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold">{completedCount}/{totalSkills}</div>
            <div className="text-sm text-muted-foreground">Skills Mastered</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="pt-6 text-center">
            <div className="text-3xl font-bold flex items-center justify-center gap-1">
              <Trophy className="w-5 h-5 text-purple-500" />0
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
        {Object.entries(groupedByTier).map(([tier, skills]) => (
          <div key={tier} className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`bg-gradient-to-r ${TIER_COLORS[Number(tier)]} px-4 py-1`}>
                Tier {tier}
              </Badge>
              <h3 className="font-semibold text-lg">{TIER_NAMES[Number(tier)]}</h3>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {skills.map((skill) => {
                const progressPercent = skill.progress 
                  ? Math.min(100, (skill.progress.xp_earned / skill.xp_required) * 100)
                  : 0;
                
                return (
                  <Card
                    key={skill.skill_key}
                    className={`cursor-pointer transition-all hover:scale-105 ${
                      !skill.is_unlocked ? 'opacity-50' : ''
                    } ${selectedSkill?.skill_key === skill.skill_key ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedSkill(skill)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-2xl">{skill.icon}</div>
                        {skill.progress?.is_completed ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : !skill.is_unlocked ? (
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            {progressPercent.toFixed(0)}%
                          </Badge>
                        )}
                      </div>
                      
                      <h4 className="font-semibold mb-1">{skill.name}</h4>
                      <p className="text-sm text-muted-foreground mb-3">{skill.description}</p>
                      
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
          </div>
        ))}
      </div>

      {/* Selected Skill Detail */}
      {selectedSkill && (
        <Card className="bg-gradient-to-br from-muted/50 to-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="text-3xl">{selectedSkill.icon}</span>
              {selectedSkill.name}
              <Badge variant="outline">Tier {selectedSkill.tier}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{selectedSkill.description}</p>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-sm mb-2">Prerequisites</h5>
                {selectedSkill.prerequisites.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedSkill.prerequisites.map(p => (
                      <Badge key={p} variant="secondary">{p}</Badge>
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
                      <Badge key={u} variant="outline">{u}</Badge>
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
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default SkillTreeProgress;
