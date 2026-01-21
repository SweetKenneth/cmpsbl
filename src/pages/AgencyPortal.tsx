/**
 * Agency Portal 2026
 * Redesigned command center interface for deployed agencies
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Loader2, Lock, ArrowLeft, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { SEO } from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { SPECIALIZATIONS, DREAM_POOL_MODES } from '@/lib/agency/agencyTypes';
import { useAgencyTasks } from '@/hooks/useAgencyTasks';
import { useAgencySettings } from '@/hooks/useAgencySettings';
import { startIdleLearning } from '@/lib/agency/taskExecutor';
import type { Agency } from '@/lib/agency/agencyTypes';
import type { TaskTypeId } from '@/lib/agency/agencyTasks';

// Portal Components
import { AgencyPortalLayout } from '@/components/agency/portal/AgencyPortalLayout';
import { PortalHeader } from '@/components/agency/portal/PortalHeader';
import { PortalSidebar } from '@/components/agency/portal/PortalSidebar';
import { PortalChatPanel } from '@/components/agency/portal/PortalChatPanel';
import { PortalTaskPanel } from '@/components/agency/portal/PortalTaskPanel';
import { MobileNavBar } from '@/components/agency/portal/MobileNavBar';

// Existing components for settings/team
import { AgencyTeamPanel } from '@/components/agency/AgencyTeamPanel';
import { AgencySettingsPanel } from '@/components/agency/AgencySettingsPanel';
import { AgencyTelemetryPanel } from '@/components/agency/AgencyTelemetryPanel';
import { DreamModePage } from '@/components/agency/DreamModePage';

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
    retryAllFailed,
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

  const handleLaunchTask = useCallback(async (taskType: TaskTypeId, input: string) => {
    if (!isAuthenticated || !agencyId) return;

    const task = await createTask({
      task_type: taskType as any,
      title: `${taskType}: ${input.slice(0, 40)}${input.length > 40 ? '...' : ''}`,
      description: input,
      input_data: { rawInput: input },
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

  // Dream mode view
  if (showDream && isOwner) {
    return (
      <>
        <SEO title={`Dream Learning — ${agency.name}`} />
        <div className="min-h-screen bg-background">
          <div className="p-4">
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

  const feedMembers = members.map(m => ({
    id: m.id,
    specialization: m.specialization,
    is_leader: m.is_leader,
  }));

  return (
    <>
      <SEO
        title={`${agency.name} — promptfluid®`}
        description={`${agency.name} cognitive agency powered by promptfluid®`}
      />

      <AgencyPortalLayout
        header={
          <PortalHeader
            agencyName={agency.name}
            leaderName={settings?.leader_name}
            isOwner={isOwner}
            isAuthenticated={isAuthenticated}
            activeTaskCount={activeTasks.length}
            onBack={handleBack}
            onOpenSettings={isOwner ? () => setActiveTab('settings') : undefined}
            onOpenDream={isOwner ? () => setShowDream(true) : undefined}
          />
        }
        sidebar={
          <PortalSidebar
            members={members}
            tasks={tasks}
            agencyId={agency.id}
            dreamPoolMode={agency.dream_pool_mode}
            cohesionRating={agency.cohesion_rating}
            isOwner={isOwner}
            onStartTeamLearning={isOwner ? handleStartTeamLearning : undefined}
            onViewTelemetry={isOwner ? () => setActiveTab('telemetry') : undefined}
            onViewDream={isOwner ? () => setShowDream(true) : undefined}
          />
        }
        main={
          <div className="flex flex-col h-full pb-16 lg:pb-0">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              {/* Desktop tab bar (hidden on mobile, uses MobileNavBar instead) */}
              <div className="hidden lg:flex items-center gap-1 px-4 py-2 border-b border-border/30 bg-card/30">
                {['chat', 'tasks', 'team', ...(isOwner ? ['telemetry', 'settings'] : [])].map(tab => (
                  <Button
                    key={tab}
                    variant={activeTab === tab ? 'secondary' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "capitalize text-xs",
                      activeTab === tab && "bg-primary/10 text-primary"
                    )}
                  >
                    {tab}
                    {tab === 'tasks' && activeTasks.length > 0 && (
                      <Badge className="ml-1.5 h-4 px-1 text-[10px] bg-amber-500 text-black">
                        {activeTasks.length}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="chat" className="h-full m-0 data-[state=inactive]:hidden">
                  <PortalChatPanel agency={agencyForComponents} />
                </TabsContent>

                <TabsContent value="tasks" className="h-full m-0 data-[state=inactive]:hidden">
                  <PortalTaskPanel
                    tasks={tasks}
                    logs={taskLogs}
                    members={feedMembers}
                    isOwner={isAuthenticated && isOwner}
                    onCancelTask={cancelTask}
                    onRetryTask={retryTask}
                    onCancelAll={async () => { await cancelAllTasks(); }}
                    onClearCompleted={async () => { await clearCompletedTasks(); }}
                  />
                </TabsContent>

                <TabsContent value="team" className="h-full m-0 data-[state=inactive]:hidden overflow-auto">
                  <AgencyTeamPanel
                    members={members}
                    tasks={tasks}
                    agencyId={agency.id}
                    leaderName={settings?.leader_name}
                    onDispatchTask={isAuthenticated ? handleDispatchToMember : undefined}
                    onLaunchTeamTask={isAuthenticated ? handleLaunchTask : undefined}
                    idleLearningEnabled={isAuthenticated && isOwner}
                  />
                </TabsContent>

                {isOwner && (
                  <>
                    <TabsContent value="telemetry" className="h-full m-0 data-[state=inactive]:hidden overflow-auto">
                      <div className="p-4">
                        <AgencyTelemetryPanel agencyId={agency.id} />
                      </div>
                    </TabsContent>

                    <TabsContent value="settings" className="h-full m-0 data-[state=inactive]:hidden overflow-auto">
                      <div className="p-4">
                        <AgencySettingsPanel
                          settings={settings}
                          isLoading={settingsLoading}
                          onUpdateSettings={updateSettings}
                          onUpdateLeaderName={updateLeaderName}
                          onAddPreset={addPresetCommand}
                          onRemovePreset={removePresetCommand}
                        />
                      </div>
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>
          </div>
        }
      />

      {/* Mobile Navigation */}
      <MobileNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activeTaskCount={activeTasks.length}
        isOwner={isOwner}
      />
    </>
  );
}
