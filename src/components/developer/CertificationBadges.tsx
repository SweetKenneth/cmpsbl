import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Lock, CheckCircle2, Share2, Download, ExternalLink, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Certification {
  certification_key: string;
  name: string;
  description: string;
  badge_icon: string;
  badge_level: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'apex';
  required_skills: string[];
  min_xp_total: number;
  is_earned?: boolean;
  earned_at?: string;
  verification_hash?: string;
  progress_percent?: number;
}

const CERTIFICATIONS: Certification[] = [
  {
    certification_key: 'substrate_fundamentals',
    name: 'Substrate Fundamentals',
    description: 'Completed core SDK training: initialization, BRAIN memory API, intent routing, and mesh telemetry basics.',
    badge_icon: '🎓', badge_level: 'bronze',
    required_skills: ['sdk_basics', 'memory_ops', 'intent_routing'],
    min_xp_total: 300, is_earned: true, earned_at: '2026-01-15', verification_hash: 'a1b2c3d4e5f6', progress_percent: 100,
  },
  {
    certification_key: 'memory_specialist',
    name: 'Memory Specialist',
    description: 'Mastered 4-tier persistent memory: context windows, DREAM consolidation, semantic recall, and importance scoring.',
    badge_icon: '🧠', badge_level: 'silver',
    required_skills: ['memory_ops', 'nexus_routing', 'memory_stream'],
    min_xp_total: 600, is_earned: false, progress_percent: 45,
  },
  {
    certification_key: 'mesh_engineer',
    name: 'Mesh Engineer',
    description: 'Expert in resolver patterns, intent routing, NEXUS multi-provider routing, and cross-node orchestration.',
    badge_icon: '⚡', badge_level: 'gold',
    required_skills: ['resolver_patterns', 'nexus_routing', 'defense_security'],
    min_xp_total: 800, is_earned: false, progress_percent: 20,
  },
  {
    certification_key: 'ascension_specialist',
    name: 'Ascension Specialist',
    description: 'Auxiliary Node lifecycle mastery: primitive extraction, quality gates, delta measurement, and CJPI scoring.',
    badge_icon: '🚀', badge_level: 'platinum',
    required_skills: ['ascension_basics', 'cjpi_scoring', 'memory_stream'],
    min_xp_total: 1200, is_earned: false, progress_percent: 10,
  },
  {
    certification_key: 'production_engineer',
    name: 'Production Engineer',
    description: 'Production hardening: Forge protections, VOLVER handicapping, non-blocking telemetry, and DREAM engineering.',
    badge_icon: '🔧', badge_level: 'diamond',
    required_skills: ['production_hardening', 'dream_cycles'],
    min_xp_total: 1500, is_earned: false, progress_percent: 5,
  },
  {
    certification_key: 'substrate_architect',
    name: 'Substrate Architect',
    description: 'Full v14.4.0 mastery: multi-node orchestration, governance, capability export, and system-level architecture.',
    badge_icon: '👑', badge_level: 'apex',
    required_skills: ['substrate_architect'],
    min_xp_total: 2500, is_earned: false, progress_percent: 2,
  },
];

const BADGE_STYLES: Record<string, { bg: string; border: string; label: string }> = {
  bronze: { bg: 'bg-secondary', border: 'border-secondary', label: 'Bronze' },
  silver: { bg: 'bg-muted', border: 'border-muted-foreground/50', label: 'Silver' },
  gold: { bg: 'bg-accent', border: 'border-accent', label: 'Gold' },
  platinum: { bg: 'bg-primary/20', border: 'border-primary', label: 'Platinum' },
  diamond: { bg: 'bg-primary/30', border: 'border-primary/60', label: 'Diamond' },
  apex: { bg: 'bg-primary/40', border: 'border-primary', label: 'Apex' },
};

export function CertificationBadges() {
  const [certifications] = useState<Certification[]>(CERTIFICATIONS);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

  const earnedCount = certifications.filter(c => c.is_earned).length;
  const totalCount = certifications.length;

  const shareBadge = (cert: Certification) => {
    const url = `https://cmpsbl.com/verify/${cert.verification_hash}`;
    navigator.clipboard.writeText(url);
    toast.success('Verification link copied!');
  };

  const downloadBadge = (cert: Certification) => {
    toast.success('Badge image downloading...', { description: `${cert.name} badge` });
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-3xl font-bold text-primary">{earnedCount}</div>
            <div className="text-sm text-muted-foreground">Certifications Earned</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="pt-6 text-center">
            <Award className="w-8 h-8 mx-auto mb-2 text-accent-foreground" />
            <div className="text-3xl font-bold">{totalCount - earnedCount}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-6 text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-primary" />
            <div className="text-3xl font-bold text-primary">{Math.round((earnedCount / totalCount) * 100)}%</div>
            <div className="text-sm text-muted-foreground">Completion Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {certifications.map((cert, index) => {
          const style = BADGE_STYLES[cert.badge_level] || BADGE_STYLES.bronze;
          return (
            <motion.div key={cert.certification_key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
              <Card
                className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${cert.is_earned ? 'ring-2 ring-primary/50' : ''} ${selectedCert?.certification_key === cert.certification_key ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedCert(cert)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-16 h-16 rounded-xl ${style.bg} border-2 ${style.border} flex items-center justify-center text-3xl shadow-lg relative ${!cert.is_earned ? 'opacity-40 grayscale' : ''}`}>
                      {cert.badge_icon}
                      {!cert.is_earned && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl"><Lock className="w-5 h-5 text-muted-foreground" /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm">{cert.name}</h3>
                        {cert.is_earned && <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />}
                      </div>
                      <Badge variant="outline" className="mb-2 capitalize text-[10px]">{style.label}</Badge>
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{cert.description}</p>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span>Progress</span>
                          <span className={cert.is_earned ? 'text-primary font-medium' : ''}>{cert.progress_percent}%</span>
                        </div>
                        <Progress value={cert.progress_percent} className="h-1.5" />
                      </div>
                      {cert.is_earned && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" className="text-xs h-7" onClick={(e) => { e.stopPropagation(); shareBadge(cert); }}><Share2 className="w-3 h-3 mr-1" />Share</Button>
                          <Button size="sm" variant="outline" className="text-xs h-7" onClick={(e) => { e.stopPropagation(); downloadBadge(cert); }}><Download className="w-3 h-3 mr-1" />Download</Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Verification Detail */}
      {selectedCert?.is_earned && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-muted/50 to-muted/20 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-primary" />Verified Certification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Earned On</div>
                  <div className="font-medium">{new Date(selectedCert.earned_at!).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Verification Hash</div>
                  <code className="text-sm bg-muted px-2 py-1 rounded font-mono">{selectedCert.verification_hash}</code>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" variant="outline"><ExternalLink className="w-4 h-4 mr-2" />View Public Profile</Button>
                <Button className="flex-1"><Sparkles className="w-4 h-4 mr-2" />Add to LinkedIn</Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default CertificationBadges;
