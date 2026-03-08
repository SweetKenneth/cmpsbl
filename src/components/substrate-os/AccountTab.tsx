/**
 * Account Tab — Personalized profile hub with discovery stats & quick links.
 */

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Camera, Save, User, Mail, Calendar, Sparkles, ExternalLink,
  Flame, BookOpen, Code2, FileText, Map, Crown, Shield, Compass,
  Loader2, Check, Pencil, Brain, TrendingUp, Pickaxe, Trophy, Zap,
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { formatDistanceToNow } from 'date-fns';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface ProfileData {
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  email: string | null;
  created_at: string;
}

interface DiscoveryStats {
  totalDiscovered: number;
  highestScore: number;
  highestName: string;
  totalMines: number;
  streakDays: number;
  avgScore: number;
  categoryCounts: Record<string, number>;
}

const QUICK_LINKS = [
  { label: 'Memory Foundry', href: '/foundry', icon: Flame, description: 'Discover & crystallize software artifacts', color: 'from-orange-500/15 to-amber-500/10 border-orange-500/20' },
  { label: 'Developer Academy', href: '/academy', icon: BookOpen, description: 'Master the substrate with guided learning', color: 'from-blue-500/15 to-cyan-500/10 border-blue-500/20' },
  { label: 'CodeLab', href: '/codelab', icon: Code2, description: 'Interactive coding playground', color: 'from-emerald-500/15 to-green-500/10 border-emerald-500/20' },
  { label: 'Documentation', href: '/docs', icon: FileText, description: 'Full API & architecture reference', color: 'from-purple-500/15 to-violet-500/10 border-purple-500/20' },
  { label: 'Substrate Overview', href: '/substrate', icon: Map, description: 'System architecture & node map', color: 'from-cyan-500/15 to-teal-500/10 border-cyan-500/20' },
  { label: 'Cognitive Showcase', href: '/showcase', icon: Crown, description: 'Browse sealed cognitive runtimes', color: 'from-pink-500/15 to-rose-500/10 border-pink-500/20' },
  { label: 'System Integrity', href: '/integrity', icon: Shield, description: 'Health checks & circuit breakers', color: 'from-red-500/15 to-orange-500/10 border-red-500/20' },
  { label: 'Memories', href: '/blog/the-first-line-of-code', icon: Brain, description: 'Read the origin story & build log', color: 'from-indigo-500/15 to-blue-500/10 border-indigo-500/20' },
];

export function AccountTab() {
  const { user } = useAuth();
  const { role } = useUserRole();
  const { tier } = useEngineSubscription();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');

  const [discoveryStats, setDiscoveryStats] = useState<DiscoveryStats | null>(null);

  // Fetch profile
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, bio, avatar_url, email, created_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error);
        setProfile({
          display_name: null,
          bio: null,
          avatar_url: null,
          email: user.email ?? null,
          created_at: user.created_at ?? new Date().toISOString(),
        });
      } else if (data) {
        setProfile(data as ProfileData);
        setDisplayName(data.display_name ?? '');
        setBio((data as any).bio ?? '');
      } else {
        const { data: created } = await supabase
          .from('profiles')
          .insert({ user_id: user.id, email: user.email })
          .select('display_name, bio, avatar_url, email, created_at')
          .single();
        if (created) {
          setProfile(created as ProfileData);
          setDisplayName(created.display_name ?? '');
          setBio((created as any).bio ?? '');
        }
      }
      setLoading(false);
    })();
  }, [user]);

  // Fetch discovery stats from foundry_inventory + foundry_user_state
  useEffect(() => {
    if (!user) return;
    (async () => {
      const [invRes, stateRes] = await Promise.allSettled([
        supabase.from('foundry_inventory').select('artifact_name, score, category, obtained_at').eq('user_id', user.id),
        supabase.from('foundry_user_state').select('total_mines, streak_days').eq('user_id', user.id).maybeSingle(),
      ]);

      const items = invRes.status === 'fulfilled' ? (invRes.value.data ?? []) : [];
      const state = stateRes.status === 'fulfilled' ? stateRes.value.data : null;

      const scores = items.map((i: any) => i.score ?? 0);
      const highestIdx = scores.length > 0 ? scores.indexOf(Math.max(...scores)) : -1;
      const categoryCounts: Record<string, number> = {};
      items.forEach((i: any) => {
        const cat = i.category || 'uncategorized';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      setDiscoveryStats({
        totalDiscovered: items.length,
        highestScore: highestIdx >= 0 ? scores[highestIdx] : 0,
        highestName: highestIdx >= 0 ? (items[highestIdx] as any).artifact_name : '—',
        totalMines: (state as any)?.total_mines ?? 0,
        streakDays: (state as any)?.streak_days ?? 0,
        avgScore: scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0,
        categoryCounts,
      });
    })();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
        updated_at: new Date().toISOString(),
      } as any)
      .eq('user_id', user.id);

    if (error) {
      toast.error('Failed to save profile');
    } else {
      toast.success('Profile updated');
      setProfile(prev => prev ? { ...prev, display_name: displayName.trim() || null, bio: bio.trim() || null } : prev);
      setEditing(false);
    }
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB');
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${user.id}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast.error('Upload failed');
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
    const avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;

    await supabase
      .from('profiles')
      .update({ avatar_url, updated_at: new Date().toISOString() })
      .eq('user_id', user.id);

    setProfile(prev => prev ? { ...prev, avatar_url } : prev);
    toast.success('Avatar updated');
    setUploading(false);
  };

  const initials = (profile?.display_name || user?.email || '?')
    .split(/[\s@]/)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('');

  const memberSince = profile?.created_at
    ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })
    : '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Profile Hero Card */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="relative overflow-hidden border-border/30 bg-gradient-to-br from-card via-card to-muted/30">
          {/* Decorative top bar */}
          <div className="absolute inset-x-0 top-0 h-24 sm:h-32 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent" />
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5">
              {role?.toUpperCase() || 'FREE'}
            </Badge>
          </div>

          <CardContent className="relative pt-12 sm:pt-16 pb-6 sm:pb-8 px-5 sm:px-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6">
              {/* Avatar */}
              <div className="relative group">
                <Avatar className="w-20 h-20 sm:w-24 sm:h-24 ring-4 ring-background shadow-xl">
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt="Profile" />
                  ) : null}
                  <AvatarFallback className="text-xl sm:text-2xl font-bold bg-gradient-to-br from-primary/20 to-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 rounded-full bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Camera className="w-5 h-5 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </div>

              {/* Name & Meta */}
              <div className="flex-1 text-center sm:text-left space-y-1 min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-foreground truncate">
                  {profile?.display_name || user?.email?.split('@')[0] || 'Operator'}
                </h2>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    {user?.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Joined {memberSince}
                  </span>
                </div>
              </div>

              {/* Edit toggle */}
              <Button
                variant={editing ? 'default' : 'outline'}
                size="sm"
                onClick={() => editing ? handleSave() : setEditing(true)}
                disabled={saving}
                className="min-h-[44px] gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                {editing ? 'Save' : 'Edit Profile'}
              </Button>
            </div>

            {/* Editable fields */}
            {editing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-6 space-y-4 max-w-xl"
              >
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Display Name
                  </label>
                  <Input
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="How should we address you?"
                    maxLength={50}
                    className="bg-muted/30"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Bio
                  </label>
                  <Textarea
                    value={bio}
                    onChange={e => setBio(e.target.value)}
                    placeholder="Tell us about yourself — what are you building?"
                    maxLength={300}
                    rows={3}
                    className="bg-muted/30 resize-none"
                  />
                  <p className="text-[10px] text-muted-foreground/50 text-right">{bio.length}/300</p>
                </div>
              </motion.div>
            )}

            {/* Bio display (non-editing) */}
            {!editing && profile?.bio && (
              <p className="mt-4 text-sm text-muted-foreground/80 max-w-xl leading-relaxed italic">
                "{profile.bio}"
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Discovery Stats */}
      {discoveryStats && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.08 }}>
          <Card className="border-border/30 bg-gradient-to-br from-card via-card to-primary/[0.03] overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Pickaxe className="w-4 h-4 text-primary" />
                Discovery Activity
                <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">live from your foundry</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {[
                  { label: 'Pipelines Found', value: discoveryStats.totalDiscovered, icon: Zap, color: 'text-amber-400' },
                  { label: 'Total Mines', value: discoveryStats.totalMines, icon: Pickaxe, color: 'text-blue-400' },
                  { label: 'Avg Score', value: discoveryStats.avgScore, icon: TrendingUp, color: 'text-emerald-400' },
                  { label: 'Highest Score', value: discoveryStats.highestScore, icon: Trophy, color: 'text-yellow-400' },
                  { label: 'Streak Days', value: discoveryStats.streakDays, icon: Flame, color: 'text-orange-400' },
                  { label: 'Categories', value: Object.keys(discoveryStats.categoryCounts).length, icon: Map, color: 'text-cyan-400' },
                ].map(stat => (
                  <div key={stat.label} className="p-3 rounded-lg bg-muted/20 border border-border/20 space-y-1.5 text-center transition-all duration-300 hover:border-primary/15 hover:-translate-y-0.5 hover:shadow-sm">
                    <stat.icon className={cn("w-4 h-4 mx-auto", stat.color)} />
                    <p className="text-lg font-bold text-foreground">
                      <AnimatedCounter value={stat.value} duration={800} />
                    </p>
                    <p className="text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider leading-tight">{stat.label}</p>
                  </div>
                ))}
              </div>
              {discoveryStats.highestName !== '—' && (
                <div className="mt-3 p-2.5 rounded-md bg-primary/5 border border-primary/10 flex items-center gap-2">
                  <Trophy className="w-3.5 h-3.5 text-primary shrink-0" />
                  <span className="text-xs text-muted-foreground">Top discovery:</span>
                  <span className="text-xs font-semibold text-foreground truncate">{discoveryStats.highestName}</span>
                  <Badge variant="outline" className="text-[9px] font-mono border-primary/20 text-primary ml-auto shrink-0">
                    CJPI {discoveryStats.highestScore}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Quick Links */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}>
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Compass className="w-4 h-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
            <span className="text-[10px] text-muted-foreground/50 font-mono">navigate the substrate</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {QUICK_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * i }}
              >
                <Link to={link.href} className="block group">
                  <Card className={cn(
                    "h-full border transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/20",
                    "bg-gradient-to-br",
                    link.color
                  )}>
                    <CardContent className="p-4 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-background/60 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                        <link.icon className="w-4.5 h-4.5 text-foreground/70" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-foreground truncate">{link.label}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>
                        <p className="text-[11px] sm:text-xs text-muted-foreground/70 mt-0.5 line-clamp-2 leading-relaxed">
                          {link.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Account Stats */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }}>
        <Card className="border-border/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Account Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Tier', value: (tier || role || 'free').toUpperCase(), icon: Crown },
                { label: 'Role', value: (role || 'free').toUpperCase(), icon: Shield },
                { label: 'Email', value: user?.email?.split('@')[0] ?? '—', icon: Mail },
                { label: 'Member Since', value: profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '—', icon: Calendar },
              ].map(stat => (
                <div key={stat.label} className="p-3 rounded-lg bg-muted/30 border border-border/20 space-y-1 transition-all duration-300 hover:border-primary/15 hover:bg-muted/40">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider">
                    <stat.icon className="w-3 h-3" />
                    {stat.label}
                  </div>
                  <p className="text-sm font-semibold font-mono text-foreground truncate">{stat.value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
