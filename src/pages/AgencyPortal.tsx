/**
 * Agency Portal 2026
 * Mobile-first responsive command center for deployed agencies
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, Lock, ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useAgencyTasks } from '@/hooks/useAgencyTasks';
import { useAgencySettings } from '@/hooks/useAgencySettings';
import { useUserAgencies } from '@/hooks/useUserAgency';
import { startIdleLearning } from '@/lib/agency/taskExecutor';
import type { Agency } from '@/lib/agency/agencyTypes';
import type { TaskTypeId } from '@/lib/agency/agencyTasks';

// Portal Components
import { ResponsivePortal } from '@/components/agency/portal/ResponsivePortal';
import { PortalHeader } from '@/components/agency/portal/PortalHeader';
import { DreamModePage } from '@/components/agency/DreamModePage';
import { AgencySettingsPanel } from '@/components/agency/AgencySettingsPanel';
import { AgencyTelemetryPanel } from '@/components/agency/AgencyTelemetryPanel';
import { AgencyTeamPanel } from '@/components/agency/AgencyTeamPanel';

interface AgencyData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  dream_pool_mode: string;
  cohesion_rating: number;
  owner_id: string;
  business_profile: {
    companyName?: string;
    domain?: string;
  } | null;
}

interface AgencyMemberData {
  id: string;
  role: string;
  specialization: string;
  is_leader: boolean;
  skill_weights: Record<string, number>;
}

export default function AgencyPortal() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [agency, setAgency] = useState<AgencyData | null>(null);
  const [members, setMembers] = useState<AgencyMemberData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('chat');
  const [showDream, setShowDream] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showTelemetry, setShowTelemetry] = useState(false);
  const [showTeam, setShowTeam] = useState(false);

  // Load agency data
  useEffect(() => {
    async function loadAgency() {
      if (!slug) {
        setError('Agency not found');
        setLoading(false);
        return;
      }

      try {
        const { data: agencyData, error: agencyError } = await supabase
          .from('agencies')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'deployed')
          .single();

        if (agencyError || !agencyData) {
          setError('Agency not found or not deployed');
          setLoading(false);
          return;
        }

        setAgency(agencyData as AgencyData);

        const { data: membersData } = await supabase
          .from('agency_members')
          .select('*')
          .eq('agency_id', agencyData.id)
          .order('sort_order');

        setMembers((membersData || []) as AgencyMemberData[]);
      } catch (err) {
        console.error('Error loading agency:', err);
        setError('Failed to load agency');
      } finally {
        setLoading(false);
      }
    }

    loadAgency();
  }, [slug]);

  // Hooks after agency loads
  const agencyId = agency?.id || '';
  
  const {
    tasks,
    taskLogs,
    createTask,
    startTask,
    addTaskLog,
    getTasksByStatus,
    cancelTask,
    cancelAllTasks,
    retryTask,
    clearCompletedTasks,
  } = useAgencyTasks({ agencyId });

  const {
    settings,
    isLoading: settingsLoading,
    updateSettings,
    updateLeaderName,
    addPresetCommand,
    removePresetCommand,
  } = useAgencySettings(agencyId);

  // Fetch user's agencies for the switcher
  const { data: userAgencies = [] } = useUserAgencies();

  const isOwner = user?.id === agency?.owner_id;
  const isAuthenticated = !!user;
  const activeTasks = getTasksByStatus('in_progress');
  const leader = members.find(m => m.is_leader);

  // Convert to Agency type for components
  const agencyForComponents: Agency | null = agency ? {
    id: agency.id,
    name: agency.name,
    description: agency.description || '',
    status: agency.status as 'deployed',
    dreamPoolMode: agency.dream_pool_mode as any,
    cohesionRating: agency.cohesion_rating,
    ownerId: agency.owner_id,
    deploymentType: 'hosted',
    businessProfile: agency.business_profile || {},
    members: members.map(m => ({
      id: m.id,
      role: m.role as 'leader' | 'specialist',
      specialization: m.specialization as any,
      skillWeights: m.skill_weights as any,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } : null;

  // Handlers
  const handleBack = () => navigate('/');

  const handleLaunchTask = useCallback(async (taskType: TaskTypeId, input?: string) => {
    if (!isAuthenticated || !agencyId) return;

    const task = await createTask({
      task_type: taskType as any,
      title: input ? `${taskType}: ${input.slice(0, 40)}${input.length > 40 ? '...' : ''}` : `${taskType} task`,
      description: input || `${taskType} task`,
      input_data: { rawInput: input || '' },
      assigned_member_id: leader?.id || null,
    });

    if (task) {
      await startTask(task.id);
      await addTaskLog(task.id, `${settings?.leader_name || 'Team Lead'} dispatched this task`);
      setActiveTab('tasks');
    }
  }, [createTask, startTask, addTaskLog, leader, settings?.leader_name, isAuthenticated, agencyId]);

  const handleDispatchToMember = useCallback(async (memberId: string, taskType: TaskTypeId, description?: string) => {
    if (!isAuthenticated || !agencyId) return;

    const task = await createTask({
      task_type: taskType as any,
      title: description || `${taskType} task`,
      description: description || `Task assigned to agent`,
      input_data: { rawInput: description || '' },
      assigned_member_id: memberId,
    });

    if (task) {
      await startTask(task.id);
      await addTaskLog(task.id, `Agent assigned to ${taskType} task`);
    }
  }, [createTask, startTask, addTaskLog, isAuthenticated, agencyId]);

  const handleStartTeamLearning = useCallback(async () => {
    if (!isAuthenticated || !isOwner || !agencyId) return;
    for (const member of members) {
      await startIdleLearning(agencyId, member.id, member.specialization);
    }
  }, [agencyId, members, isAuthenticated, isOwner]);

  const handleNavigateTab = useCallback((tab: string) => {
    // Handle special tabs that open overlays
    if (tab === 'settings' && isOwner) {
      setShowSettings(true);
      return;
    }
    if (tab === 'telemetry' && isOwner) {
      setShowTelemetry(true);
      return;
    }
    if (tab === 'team') {
      setShowTeam(true);
      return;
    }
    setActiveTab(tab);
  }, [isOwner]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
          <p className="text-sm text-muted-foreground font-mono">loading agency...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !agency || !agencyForComponents) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-destructive/30 bg-card/80 backdrop-blur-xl">
          <CardContent className="py-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <Lock className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Agency Not Found</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {error || 'This agency does not exist or is not publicly available.'}
            </p>
            <Button asChild variant="outline">
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Dream mode view (full screen overlay)
  if (showDream && isOwner) {
    return (
      <>
        <SEO title={`Dream Learning — ${agency.name}`} />
        <div className="min-h-screen bg-background">
          <div className="p-4 safe-area-pt">
            <Button variant="ghost" onClick={() => setShowDream(false)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <DreamModePage agencyId={agency.id} />
          </div>
        </div>
      </>
    );
  }

  // Settings overlay
  if (showSettings && isOwner) {
    return (
      <>
        <SEO title={`Settings — ${agency.name}`} />
        <div className="min-h-screen bg-background">
          <div className="p-4 safe-area-pt">
            <Button variant="ghost" onClick={() => setShowSettings(false)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <AgencySettingsPanel
              settings={settings}
              isLoading={settingsLoading}
              onUpdateSettings={updateSettings}
              onUpdateLeaderName={updateLeaderName}
              onAddPreset={addPresetCommand}
              onRemovePreset={removePresetCommand}
            />
          </div>
        </div>
      </>
    );
  }

  // Telemetry overlay
  if (showTelemetry && isOwner) {
    return (
      <>
        <SEO title={`Telemetry — ${agency.name}`} />
        <div className="min-h-screen bg-background">
          <div className="p-4 safe-area-pt">
            <Button variant="ghost" onClick={() => setShowTelemetry(false)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <AgencyTelemetryPanel agencyId={agency.id} />
          </div>
        </div>
      </>
    );
  }

  // Team overlay
  if (showTeam) {
    return (
      <>
        <SEO title={`Team — ${agency.name}`} />
        <div className="min-h-screen bg-background">
          <div className="p-4 safe-area-pt">
            <Button variant="ghost" onClick={() => setShowTeam(false)} className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <AgencyTeamPanel
              members={members}
              tasks={tasks}
              agencyId={agency.id}
              leaderName={settings?.leader_name}
              onDispatchTask={isAuthenticated ? handleDispatchToMember : undefined}
              onLaunchTeamTask={isAuthenticated ? handleLaunchTask : undefined}
              idleLearningEnabled={isAuthenticated && isOwner}
            />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${agency.name} — CMPSBL®`}
        description={`${agency.name} cognitive agency powered by CMPSBL® substrate`}
      />

      <div className="min-h-screen bg-background">
        {/* Ambient background effects - hidden on mobile for performance */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden hidden md:block">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] animate-ambient-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-neon-magenta/5 rounded-full blur-[100px] animate-ambient-pulse" style={{ animationDelay: '2s' }} />
        </div>

        {/* Main Portal */}
        <div className="relative z-10 h-screen">
          <ResponsivePortal
            agency={agencyForComponents}
            tasks={tasks}
            taskLogs={taskLogs}
            members={members}
            isOwner={isOwner}
            isAuthenticated={isAuthenticated}
            leaderName={settings?.leader_name}
            userAgencies={userAgencies}
            onLaunchTask={handleLaunchTask}
            onCancelTask={cancelTask}
            onRetryTask={retryTask}
            onCancelAll={async () => { await cancelAllTasks(); }}
            onClearCompleted={async () => { await clearCompletedTasks(); }}
            onNavigateTab={handleNavigateTab}
            onOpenSettings={() => setShowSettings(true)}
            onOpenDream={() => setShowDream(true)}
            onStartTeamLearning={handleStartTeamLearning}
            activeTab={activeTab}
          />
        </div>
      </div>
    </>
  );
}
