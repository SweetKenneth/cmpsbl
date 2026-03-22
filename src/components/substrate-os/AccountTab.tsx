/**
 * Account Tab — Enhanced profile hub with security, sessions, API keys & activity.
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
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  Camera, Save, User, Mail, Calendar, Sparkles, ExternalLink,
  Flame, BookOpen, Code2, FileText, Map, Crown, Shield, Compass,
  Loader2, Check, Pencil, Brain, TrendingUp, Pickaxe, Trophy, Zap,
  Key, Fingerprint, Clock, Activity, LogOut, Globe, Smartphone,
  Monitor, ChevronRight, Lock, Bell, Eye, Terminal, BarChart3,
  RefreshCw, AlertTriangle, CheckCircle2, XCircle, Plug,
} from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useEngineSubscription } from '@/hooks/useEngineSubscription';
import { formatDistanceToNow, format } from 'date-fns';
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

interface ApiKeyInfo {
  id: string;
  name: string | null;
  key_prefix: string;
  is_active: boolean | null;
  last_used_at: string | null;
  created_at: string | null;
}

interface RecentActivity {
  id: string;
  action: string;
  module: string;
  created_at: string | null;
  tokens_used: number | null;
}

const QUICK_LINKS = [
  { label: 'Memory Foundry', href: '/foundry', icon: Flame, description: 'Discover & crystallize software artifacts', color: 'from-orange-500/15 to-amber-500/10 border-orange-500/20' },
  { label: 'Developer Academy', href: '/academy', icon: BookOpen, description: 'Master the substrate with guided learning', color: 'from-blue-500/15 to-cyan-500/10 border-blue-500/20' },
  { label: 'CodeLab', href: '/codelab', icon: Code2, description: 'Interactive coding playground', color: 'from-emerald-500/15 to-green-500/10 border-emerald-500/20' },
  { label: 'SDK Playground', href: '/sdk-playground', icon: Terminal, description: 'Test live API methods interactively', color: 'from-violet-500/15 to-purple-500/10 border-violet-500/20' },
  { label: 'Documentation', href: '/documentation', icon: FileText, description: 'Full API & architecture reference', color: 'from-purple-500/15 to-violet-500/10 border-purple-500/20' },
  { label: 'Substrate Overview', href: '/substrate', icon: Map, description: 'System architecture & node map', color: 'from-cyan-500/15 to-teal-500/10 border-cyan-500/20' },
  { label: 'Cognitive Showcase', href: '/showcase', icon: Crown, description: 'Browse sealed cognitive runtimes', color: 'from-pink-500/15 to-rose-500/10 border-pink-500/20' },
  { label: 'System Integrity', href: '/system-integrity', icon: Shield, description: 'Health checks & safety switches', color: 'from-red-500/15 to-orange-500/10 border-red-500/20' },
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
  const [apiKeys, setApiKeys] = useState<ApiKeyInfo[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [sessionInfo, setSessionInfo] = useState<{ provider: string; lastSignIn: string | null; aal: string } | null>(null);

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

  // Fetch discovery stats
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

  // Fetch API keys, recent usage activity, and session info
  useEffect(() => {
    if (!user) return;
    (async () => {
      // API keys (via developer lookup)
      const { data: devData } = await supabase
        .from('access_developers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (devData?.id) {
        const { data: keys } = await supabase
          .from('access_api_keys')
          .select('id, name, key_prefix, is_active, last_used_at, created_at')
          .eq('developer_id', devData.id)
          .order('created_at', { ascending: false })
          .limit(5);
        setApiKeys((keys as ApiKeyInfo[]) ?? []);

        // Recent usage from this developer
        const { data: usage } = await supabase
          .from('access_usage')
          .select('id, action, module, created_at, tokens_used')
          .eq('developer_id', devData.id)
          .order('created_at', { ascending: false })
          .limit(8);
        setRecentActivity((usage as RecentActivity[]) ?? []);
      }

      // Session info from Supabase auth
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: mfa } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        setSessionInfo({
          provider: session.user?.app_metadata?.provider || 'email',
          lastSignIn: session.user?.last_sign_in_at || null,
          aal: mfa?.currentLevel || 'aal1',
        });
      }
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out');
  };

  const initials = (profile?.display_name || user?.email || '?')
    .split(/[\s@]/)
    .slice(0, 2)
    .map(s => s[0]?.toUpperCase())
    .join('');

  const memberSince = profile?.created_at
    ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })
    : '';

  const tierLabel = ((tier || role || 'free') === 'free' ? 'BUILDER' : (tier || role || 'free').toUpperCase());
  const roleLabel = ((role || 'free') === 'free' ? 'BUILDER' : (role || 'free').toUpperCase());

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
      </div>
    );
  }

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* ── Profile Hero Card ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Card className="relative overflow-hidden border-border/30 bg-gradient-to-br from-card via-card to-muted/30">
          <div className="absolute inset-x-0 top-0 h-24 sm:h-32 bg-gradient-to-br from-primary/8 via-primary/4 to-transparent" />
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5">
              {tierLabel}
            </Badge>
            {roleLabel === 'ADMIN' && (
              <Badge className="text-[10px] font-mono bg-destructive/10 text-destructive border border-destructive/20">
                GOVERNOR
              </Badge>
            )}
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

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant={editing ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => editing ? handleSave() : setEditing(true)}
                  disabled={saving}
                  className="min-h-[44px] gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : editing ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
                  {editing ? 'Save' : 'Edit'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="min-h-[44px] gap-2 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
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

            {/* Bio display */}
            {!editing && profile?.bio && (
              <p className="mt-4 text-sm text-muted-foreground/80 max-w-xl leading-relaxed italic">
                "{profile.bio}"
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Security & Session ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.06 }}>
        <Card className="border-border/30 overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-500" />
              Security & Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Auth method */}
              <div className="p-3 rounded-lg bg-muted/20 border border-border/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">Auth Method</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] font-mono capitalize">
                    {sessionInfo?.provider === 'email' ? 'Magic Link' : sessionInfo?.provider || 'email'}
                  </Badge>
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-mono",
                    sessionInfo?.aal === 'aal2' ? "border-emerald-500/30 text-emerald-600 bg-emerald-500/5" : "border-amber-500/30 text-amber-600 bg-amber-500/5"
                  )}>
                    {sessionInfo?.aal === 'aal2' ? 'MFA Active' : 'Standard'}
                  </Badge>
                </div>
              </div>

              {/* Last sign in */}
              <div className="p-3 rounded-lg bg-muted/20 border border-border/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">Last Sign In</span>
                </div>
                <p className="text-xs text-muted-foreground font-mono">
                  {sessionInfo?.lastSignIn
                    ? formatDistanceToNow(new Date(sessionInfo.lastSignIn), { addSuffix: true })
                    : 'Current session'}
                </p>
              </div>

              {/* Assurance level */}
              <div className="p-3 rounded-lg bg-muted/20 border border-border/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium text-foreground">Security Level</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map(level => (
                      <div
                        key={level}
                        className={cn(
                          "w-6 h-1.5 rounded-full",
                          level <= (sessionInfo?.aal === 'aal2' ? 3 : sessionInfo?.aal === 'aal1' ? 2 : 1)
                            ? "bg-emerald-500"
                            : "bg-muted"
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono ml-1">
                    {sessionInfo?.aal === 'aal2' ? 'Maximum' : 'Good'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ── API Keys ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
        <Card className="border-border/30 overflow-hidden relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Key className="w-4 h-4 text-violet-500" />
                API Keys
                {apiKeys.length > 0 && (
                  <Badge variant="outline" className="text-[10px] font-mono">{apiKeys.length}</Badge>
                )}
              </CardTitle>
              <Link to="/developers">
                <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-7 text-muted-foreground">
                  Manage <ChevronRight className="w-3 h-3" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {apiKeys.length === 0 ? (
              <div className="text-center py-6 space-y-3">
                <Key className="w-8 h-8 text-muted-foreground/30 mx-auto" />
                <div>
                  <p className="text-sm text-muted-foreground">No API keys yet</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Create your first key in the Developer portal</p>
                </div>
                <Link to="/developers">
                  <Button variant="outline" size="sm" className="text-xs gap-1.5 mt-1">
                    <Plug className="w-3.5 h-3.5" /> Get API Key
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {apiKeys.map(key => (
                  <div key={key.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 border border-border/20 hover:border-primary/15 transition-colors">
                    <div className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      key.is_active ? "bg-emerald-500" : "bg-muted-foreground/30"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {key.name || 'Unnamed key'}
                      </p>
                      <p className="text-[10px] text-muted-foreground font-mono">{key.key_prefix}••••••••</p>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge variant="outline" className={cn(
                        "text-[9px] font-mono",
                        key.is_active
                          ? "border-emerald-500/20 text-emerald-600 bg-emerald-500/5"
                          : "border-muted text-muted-foreground"
                      )}>
                        {key.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      {key.last_used_at && (
                        <p className="text-[9px] text-muted-foreground/50 mt-0.5">
                          Used {formatDistanceToNow(new Date(key.last_used_at), { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* ── Discovery Stats ── */}
      {discoveryStats && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.14 }}>
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
                  { label: 'Memories Formed', value: discoveryStats.totalDiscovered, icon: Zap, color: 'text-amber-400' },
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

      {/* ── Recent Activity Feed ── */}
      {recentActivity.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.18 }}>
          <Card className="border-border/30 overflow-hidden relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-500" />
                Recent API Activity
                <span className="text-[10px] text-muted-foreground/50 font-mono ml-auto">last {recentActivity.length} calls</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {recentActivity.map((event, i) => (
                  <div key={event.id} className="flex items-center gap-3 px-2.5 py-2 rounded-md hover:bg-muted/30 transition-colors group">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 shrink-0" />
                    <div className="flex-1 min-w-0 flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] font-mono shrink-0 uppercase">
                        {event.module}
                      </Badge>
                      <span className="text-xs text-foreground truncate">{event.action}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {event.tokens_used != null && event.tokens_used > 0 && (
                        <span className="text-[9px] text-muted-foreground/50 font-mono">{event.tokens_used} tok</span>
                      )}
                      <span className="text-[10px] text-muted-foreground/40 font-mono">
                        {event.created_at ? formatDistanceToNow(new Date(event.created_at), { addSuffix: true }) : '—'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ── Quick Links ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.22 }}>
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

      {/* ── Account Details ── */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.26 }}>
        <Card className="border-border/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Account Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Tier', value: tierLabel, icon: Crown, color: tierLabel === 'CREATOR' ? 'text-amber-500' : tierLabel === 'BUILDER' ? 'text-emerald-500' : 'text-primary' },
                { label: 'Role', value: roleLabel, icon: Shield, color: roleLabel === 'ADMIN' ? 'text-destructive' : 'text-primary' },
                { label: 'API Keys', value: `${apiKeys.filter(k => k.is_active).length} active`, icon: Key, color: 'text-violet-500' },
                { label: 'Member Since', value: profile?.created_at ? format(new Date(profile.created_at), 'MMM yyyy') : '—', icon: Calendar, color: 'text-muted-foreground' },
              ].map(stat => (
                <div key={stat.label} className="p-3 rounded-lg bg-muted/30 border border-border/20 space-y-1 transition-all duration-300 hover:border-primary/15 hover:bg-muted/40">
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-mono uppercase tracking-wider">
                    <stat.icon className={cn("w-3 h-3", stat.color)} />
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
