/**
 * User Behavior Section — Governor-only analytics
 * Shows: User Timeline, Feature Heatmap, Session Journeys, Conversion Funnel
 * Full identity mode (email/display_name from profiles)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Users, Clock, Flame, Route, Filter as FilterIcon, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface UserProfile {
  user_id: string;
  email: string | null;
  display_name: string | null;
}

interface RawEvent {
  id: string;
  event_type: string;
  category: string;
  page: string | null;
  label: string | null;
  session_id: string | null;
  user_id: string | null;
  value: number | null;
  created_at: string;
  metadata: any;
}

type SubView = 'timeline' | 'heatmap' | 'journeys' | 'funnel';

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export function UserBehaviorSection() {
  const [events, setEvents] = useState<RawEvent[]>([]);
  const [profiles, setProfiles] = useState<Map<string, UserProfile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [subView, setSubView] = useState<SubView>('timeline');
  const [dateRange, setDateRange] = useState<'24h' | '7d' | '30d'>('7d');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const hours = dateRange === '24h' ? 24 : dateRange === '7d' ? 168 : 720;
      const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const [eventsRes, profilesRes] = await Promise.all([
        supabase
          .from('analytics_events')
          .select('id, event_type, category, page, label, session_id, user_id, value, created_at, metadata')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(1000),
        supabase
          .from('profiles')
          .select('user_id, email, display_name'),
      ]);

      setEvents((eventsRes.data || []) as RawEvent[]);

      const pMap = new Map<string, UserProfile>();
      (profilesRes.data || []).forEach((p: any) => {
        if (p.user_id) pMap.set(p.user_id, p);
      });
      setProfiles(pMap);
    } catch (err) {
      console.error('User behavior fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const resolveUser = useCallback((userId: string | null, sessionId: string | null): string => {
    if (userId && profiles.has(userId)) {
      const p = profiles.get(userId)!;
      return p.display_name || p.email || userId.slice(0, 8);
    }
    if (userId) return userId.slice(0, 8);
    if (sessionId) return `anon-${sessionId.slice(0, 6)}`;
    return 'unknown';
  }, [profiles]);

  const subViews: { key: SubView; label: string; icon: typeof Users }[] = [
    { key: 'timeline', label: 'User Timeline', icon: Clock },
    { key: 'heatmap', label: 'Feature Heatmap', icon: Flame },
    { key: 'journeys', label: 'Session Journeys', icon: Route },
    { key: 'funnel', label: 'Conversion Funnel', icon: FilterIcon },
  ];

  return (
    <motion.div className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">User Behavior</h2>
            <p className="text-xs text-muted-foreground font-mono">REAL USERS • FULL IDENTITY • LIVE DATA</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex gap-1 p-1 rounded-lg bg-muted/30 border border-border/30">
            {(['24h', '7d', '30d'] as const).map(r => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  dateRange === r
                    ? "bg-violet-500/20 text-violet-400 border border-violet-500/40"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-1.5 h-8">
            <RefreshCw className={cn("w-3.5 h-3.5", loading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Sub-view tabs */}
      <div className="flex gap-2 p-1 rounded-xl bg-muted/20 border border-border/20 w-fit flex-wrap">
        {subViews.map(sv => {
          const Icon = sv.icon;
          return (
            <button
              key={sv.key}
              onClick={() => setSubView(sv.key)}
              className={cn(
                "px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                subView === sv.key
                  ? "bg-violet-500/20 text-violet-400 border border-violet-500/40"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {sv.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={subView} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {subView === 'timeline' && <UserTimeline events={events} resolveUser={resolveUser} />}
            {subView === 'heatmap' && <FeatureHeatmap events={events} />}
            {subView === 'journeys' && <SessionJourneys events={events} resolveUser={resolveUser} />}
            {subView === 'funnel' && <ConversionFunnel events={events} />}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-VIEW: USER TIMELINE
// ═══════════════════════════════════════════════════════════════

function UserTimeline({ events, resolveUser }: { events: RawEvent[]; resolveUser: (uid: string | null, sid: string | null) => string }) {
  // Group by user, show chronological actions
  const userGroups = useMemo(() => {
    const map = new Map<string, RawEvent[]>();
    events.forEach(e => {
      const key = e.user_id || e.session_id || 'unknown';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    // Sort by most recent activity
    return Array.from(map.entries())
      .sort((a, b) => {
        const aTime = new Date(a[1][0]?.created_at || 0).getTime();
        const bTime = new Date(b[1][0]?.created_at || 0).getTime();
        return bTime - aTime;
      })
      .slice(0, 20);
  }, [events]);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (key: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const categoryColor = (cat: string) => {
    switch (cat) {
      case 'navigation': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 'conversion': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'engagement': return 'text-violet-400 bg-violet-500/10 border-violet-500/30';
      case 'scan': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'auth': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'error': return 'text-red-400 bg-red-500/10 border-red-500/30';
      default: return 'text-muted-foreground bg-muted/10 border-border/30';
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">{userGroups.length} users with activity • {events.length} total events</p>
      {userGroups.map(([key, userEvents]) => {
        const isOpen = expanded.has(key);
        const userName = resolveUser(
          userEvents[0]?.user_id || null,
          userEvents[0]?.session_id || null
        );
        const lastSeen = userEvents[0]?.created_at;
        const uniquePages = new Set(userEvents.filter(e => e.page).map(e => e.page)).size;

        return (
          <div key={key} className="rounded-xl border border-border/30 bg-card/50 overflow-hidden">
            <button
              onClick={() => toggle(key)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isOpen ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                <span className="text-sm font-medium text-foreground">{userName}</span>
                <Badge variant="outline" className="text-[10px] font-mono">{userEvents.length} events</Badge>
                <Badge variant="outline" className="text-[10px] font-mono">{uniquePages} pages</Badge>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {lastSeen ? new Date(lastSeen).toLocaleString() : '—'}
              </span>
            </button>

            {isOpen && (
              <div className="px-4 pb-3 space-y-1 border-t border-border/20">
                {userEvents.slice(0, 50).map(e => (
                  <div key={e.id} className="flex items-center gap-3 py-1.5 text-xs">
                    <span className="text-[10px] text-muted-foreground font-mono w-16 shrink-0">
                      {new Date(e.created_at).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <Badge variant="outline" className={cn("text-[9px] font-mono px-1.5 py-0", categoryColor(e.category))}>
                      {e.category}
                    </Badge>
                    <span className="text-foreground font-medium">{e.event_type}</span>
                    {e.page && <span className="text-muted-foreground">{e.page}</span>}
                    {e.label && <span className="text-muted-foreground/70 truncate max-w-[200px]">{e.label}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-VIEW: FEATURE HEATMAP
// ═══════════════════════════════════════════════════════════════

function FeatureHeatmap({ events }: { events: RawEvent[] }) {
  const featureData = useMemo(() => {
    // Group by event_type to see which features are used most
    const counts = new Map<string, { count: number; category: string; uniqueUsers: Set<string> }>();
    events.forEach(e => {
      if (!counts.has(e.event_type)) {
        counts.set(e.event_type, { count: 0, category: e.category, uniqueUsers: new Set() });
      }
      const entry = counts.get(e.event_type)!;
      entry.count++;
      if (e.user_id) entry.uniqueUsers.add(e.user_id);
      else if (e.session_id) entry.uniqueUsers.add(e.session_id);
    });

    return Array.from(counts.entries())
      .map(([feature, data]) => ({
        feature,
        count: data.count,
        category: data.category,
        uniqueUsers: data.uniqueUsers.size,
      }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  const maxCount = featureData[0]?.count || 1;

  const categoryColors: Record<string, string> = {
    navigation: 'from-blue-500 to-blue-600',
    conversion: 'from-green-500 to-green-600',
    engagement: 'from-violet-500 to-violet-600',
    scan: 'from-cyan-500 to-cyan-600',
    auth: 'from-amber-500 to-amber-600',
    error: 'from-red-500 to-red-600',
    user_interaction: 'from-fuchsia-500 to-fuchsia-600',
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{featureData.length} distinct actions tracked</p>

      <div className="space-y-2">
        {featureData.slice(0, 20).map((f, idx) => {
          const pct = Math.round((f.count / maxCount) * 100);
          const gradient = categoryColors[f.category] || 'from-gray-500 to-gray-600';
          return (
            <motion.div
              key={f.feature}
              className="rounded-xl border border-border/30 bg-card/50 p-3"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground font-mono">{f.feature}</span>
                  <Badge variant="outline" className="text-[9px] font-mono">{f.category}</Badge>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted-foreground">{f.uniqueUsers} users</span>
                  <span className="text-sm font-bold font-mono text-foreground">{f.count}</span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-muted/30 overflow-hidden">
                <motion.div
                  className={cn("h-full rounded-full bg-gradient-to-r", gradient)}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.03 }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-VIEW: SESSION JOURNEYS
// ═══════════════════════════════════════════════════════════════

function SessionJourneys({ events, resolveUser }: { events: RawEvent[]; resolveUser: (uid: string | null, sid: string | null) => string }) {
  const sessions = useMemo(() => {
    const map = new Map<string, RawEvent[]>();
    events.forEach(e => {
      const sid = e.session_id || 'no-session';
      if (!map.has(sid)) map.set(sid, []);
      map.get(sid)!.push(e);
    });

    return Array.from(map.entries())
      .map(([sessionId, sessionEvents]) => {
        const sorted = [...sessionEvents].sort((a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        const pages = sorted.filter(e => e.page).map(e => e.page!);
        const uniquePages = [...new Set(pages)];
        const firstEvent = sorted[0];
        const lastEvent = sorted[sorted.length - 1];
        const durationMs = new Date(lastEvent.created_at).getTime() - new Date(firstEvent.created_at).getTime();

        return {
          sessionId,
          userName: resolveUser(firstEvent.user_id, sessionId),
          eventCount: sorted.length,
          uniquePages,
          pageFlow: pages,
          durationMs,
          startTime: firstEvent.created_at,
          categories: [...new Set(sorted.map(e => e.category))],
        };
      })
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, 30);
  }, [events, resolveUser]);

  const fmtDuration = (ms: number) => {
    if (ms < 60000) return `${Math.round(ms / 1000)}s`;
    if (ms < 3600000) return `${Math.round(ms / 60000)}m`;
    return `${(ms / 3600000).toFixed(1)}h`;
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">{sessions.length} sessions tracked</p>

      <div className="space-y-2">
        {sessions.map((s, idx) => (
          <motion.div
            key={s.sessionId}
            className="rounded-xl border border-border/30 bg-card/50 p-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{s.userName}</span>
                <Badge variant="outline" className="text-[10px] font-mono">{s.eventCount} events</Badge>
                <Badge variant="outline" className="text-[10px] font-mono">{fmtDuration(s.durationMs)}</Badge>
              </div>
              <span className="text-[10px] text-muted-foreground font-mono">
                {new Date(s.startTime).toLocaleString()}
              </span>
            </div>

            {/* Page flow visualization */}
            <div className="flex items-center gap-1 flex-wrap">
              {s.uniquePages.map((page, i) => (
                <div key={`${page}-${i}`} className="flex items-center gap-1">
                  {i > 0 && <span className="text-muted-foreground/40 text-xs">→</span>}
                  <span className="px-2 py-0.5 rounded-md bg-muted/30 border border-border/20 text-[10px] font-mono text-foreground">
                    {page}
                  </span>
                </div>
              ))}
            </div>

            {/* Category tags */}
            <div className="flex gap-1 mt-2">
              {s.categories.map(c => (
                <Badge key={c} variant="outline" className="text-[9px] font-mono">{c}</Badge>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SUB-VIEW: CONVERSION FUNNEL
// ═══════════════════════════════════════════════════════════════

const FUNNEL_STAGES = [
  { key: 'landing', label: 'Landing', paths: ['/', '/explore'], description: 'First visit — user hit the homepage or explore page' },
  { key: 'engagement', label: 'Engagement', paths: ['/scan', '/decode', '/lab'], description: 'Tried a tool — ran a scan, used DECODE, or opened the lab' },
  { key: 'onboarding', label: 'Onboarding', paths: ['/start-here'], description: 'Started guided setup — visited the Start Here flow' },
  { key: 'signup', label: 'Signup', paths: ['/auth', '/register'], description: 'Created an account — hit auth or registration page' },
  { key: 'conversion', label: 'Conversion', paths: ['/upgrade', '/packs', '/store'], description: 'Purchase intent — viewed upgrade, packs, or store pages' },
  { key: 'deep_engagement', label: 'Deep Engagement', paths: ['/substrate', '/persistent-memory', '/composable-cognitives'], description: 'Power usage — accessing substrate OS, MEMORY, or cognitives' },
];

function ConversionFunnel({ events }: { events: RawEvent[] }) {
  const funnelData = useMemo(() => {
    // Count unique sessions that reached each stage
    const stageUsers = new Map<string, Set<string>>();
    FUNNEL_STAGES.forEach(s => stageUsers.set(s.key, new Set()));

    events.forEach(e => {
      const userKey = e.user_id || e.session_id || 'unknown';
      if (!e.page) return;

      for (const stage of FUNNEL_STAGES) {
        if (stage.paths.some(p => e.page!.startsWith(p))) {
          stageUsers.get(stage.key)!.add(userKey);
        }
      }
    });

    const results = FUNNEL_STAGES.map(stage => ({
      ...stage,
      count: stageUsers.get(stage.key)!.size,
    }));

    const maxCount = Math.max(results[0]?.count || 1, 1);

    return results.map((r, i) => ({
      ...r,
      pct: Math.round((r.count / maxCount) * 100),
      dropOff: i > 0 ? results[i - 1].count - r.count : 0,
      dropOffPct: i > 0 && results[i - 1].count > 0
        ? Math.round(((results[i - 1].count - r.count) / results[i - 1].count) * 100)
        : 0,
    }));
  }, [events]);

  const stageColors = [
    'from-blue-500 to-blue-600',
    'from-violet-500 to-violet-600',
    'from-fuchsia-500 to-fuchsia-600',
    'from-amber-500 to-amber-600',
    'from-green-500 to-green-600',
    'from-cyan-500 to-cyan-600',
  ];

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">Funnel shows unique users/sessions reaching each stage</p>

      <div className="space-y-3">
        {funnelData.map((stage, idx) => (
          <motion.div
            key={stage.key}
            className="rounded-xl border border-border/30 bg-card/50 p-4"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">{stage.label}</span>
                <span className="text-[10px] text-muted-foreground font-mono">
                  {stage.paths.join(', ')}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {idx > 0 && stage.dropOff > 0 && (
                  <span className="text-[10px] text-red-400 font-mono">-{stage.dropOff} ({stage.dropOffPct}%)</span>
                )}
                <span className="text-lg font-bold font-mono text-foreground">{stage.count}</span>
              </div>
            </div>

            <div className="h-3 rounded-full bg-muted/30 overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full bg-gradient-to-r", stageColors[idx] || stageColors[0])}
                initial={{ width: 0 }}
                animate={{ width: `${stage.pct}%` }}
                transition={{ duration: 0.6, delay: idx * 0.08 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
