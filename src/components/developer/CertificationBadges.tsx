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
  badge_level: 'bronze' | 'silver' | 'gold' | 'platinum';
  required_skills: string[];
  min_xp_total: number;
  is_earned?: boolean;
  earned_at?: string;
  verification_hash?: string;
  progress_percent?: number;
}

const MOCK_CERTIFICATIONS: Certification[] = [
  {
    certification_key: 'substrate_fundamentals',
    name: 'Substrate Fundamentals',
    description: 'Completed core SDK training including initialization, memory operations, and API key management.',
    badge_icon: '🎓',
    badge_level: 'bronze',
    required_skills: ['sdk_basics', 'memory_ops', 'api_keys'],
    min_xp_total: 300,
    is_earned: true,
    earned_at: '2024-01-15',
    verification_hash: 'a1b2c3d4e5f6',
    progress_percent: 100
  },
  {
    certification_key: 'memory_specialist',
    name: 'Memory Specialist',
    description: 'Mastered advanced memory operations including context windows, importance scoring, and tier management.',
    badge_icon: '🧠',
    badge_level: 'silver',
    required_skills: ['context_windows', 'importance_scoring', 'memory_tiers'],
    min_xp_total: 600,
    is_earned: false,
    progress_percent: 45
  },
  {
    certification_key: 'integration_expert',
    name: 'Integration Expert',
    description: 'Expert-level proficiency in API management, rate limiting, and cost optimization strategies.',
    badge_icon: '⚡',
    badge_level: 'gold',
    required_skills: ['rate_limiting', 'quota_management', 'cost_optimization'],
    min_xp_total: 500,
    is_earned: false,
    progress_percent: 20
  },
  {
    certification_key: 'substrate_architect',
    name: 'Substrate Architect',
    description: 'Full mastery of production patterns, RAG integration, and enterprise-grade implementations.',
    badge_icon: '👑',
    badge_level: 'platinum',
    required_skills: ['production_patterns'],
    min_xp_total: 2000,
    is_earned: false,
    progress_percent: 5
  }
];

// Use design tokens for badge styling
const BADGE_STYLES: Record<string, { bg: string; border: string; label: string }> = {
  bronze: { bg: 'bg-secondary', border: 'border-secondary', label: 'Bronze' },
  silver: { bg: 'bg-muted', border: 'border-muted-foreground/50', label: 'Silver' },
  gold: { bg: 'bg-accent', border: 'border-accent', label: 'Gold' },
  platinum: { bg: 'bg-primary/20', border: 'border-primary', label: 'Platinum' }
};

export function CertificationBadges() {
  const [certifications] = useState<Certification[]>(MOCK_CERTIFICATIONS);
  const [selectedCert, setSelectedCert] = useState<Certification | null>(null);

  const earnedCount = certifications.filter(c => c.is_earned).length;
  const totalCount = certifications.length;

  const shareBadge = (cert: Certification) => {
    const url = `https://cmpsbl.dev/verify/${cert.verification_hash}`;
    navigator.clipboard.writeText(url);
    toast.success('Verification link copied to clipboard!');
  };

  const downloadBadge = (cert: Certification) => {
    toast.success('Badge image downloading...', {
      description: `${cert.name} badge`
    });
    // In production, this would generate an actual badge image
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
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

      {/* Certification Cards */}
      <div className="grid sm:grid-cols-2 gap-6">
        {certifications.map((cert, index) => {
          const style = BADGE_STYLES[cert.badge_level];
          
          return (
            <motion.div
              key={cert.certification_key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className={`cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${
                  cert.is_earned ? 'ring-2 ring-primary/50' : ''
                } ${selectedCert?.certification_key === cert.certification_key ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedCert(cert)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Badge Icon */}
                    <div className={`w-20 h-20 rounded-xl ${style.bg} border-2 ${style.border}
                      flex items-center justify-center text-4xl shadow-lg relative
                      ${!cert.is_earned ? 'opacity-40 grayscale' : ''}`}
                    >
                      {cert.badge_icon}
                      {!cert.is_earned && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-xl">
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{cert.name}</h3>
                        {cert.is_earned && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <Badge variant="outline" className="mb-2 capitalize">{style.label}</Badge>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{cert.description}</p>
                      
                      {/* Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span>Progress</span>
                          <span className={cert.is_earned ? 'text-primary font-medium' : ''}>{cert.progress_percent}%</span>
                        </div>
                        <Progress value={cert.progress_percent} className="h-2" />
                      </div>

                      {/* Requirements */}
                      <div className="mt-3">
                        <div className="text-xs text-muted-foreground mb-1">Required Skills:</div>
                        <div className="flex flex-wrap gap-1">
                          {cert.required_skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill.replace(/_/g, ' ')}
                            </Badge>
                          ))}
                          {cert.required_skills.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{cert.required_skills.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions for earned badges */}
                      {cert.is_earned && (
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); shareBadge(cert); }}>
                            <Share2 className="w-3 h-3 mr-1" />
                            Share
                          </Button>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); downloadBadge(cert); }}>
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
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

      {/* Verification Info */}
      {selectedCert?.is_earned && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-gradient-to-br from-muted/50 to-muted/20 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                Verified Certification
              </CardTitle>
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
                <Button className="flex-1" variant="outline">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public Profile
                </Button>
                <Button className="flex-1">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Add to LinkedIn
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

export default CertificationBadges;