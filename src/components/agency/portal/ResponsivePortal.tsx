/**
 * Responsive Portal 2026
 * Mobile-first responsive wrapper that switches between mobile and desktop layouts
 */

import { useIsMobile } from '@/hooks/use-mobile';
import { MobileCommandCenter } from './MobileCommandCenter';
import { DesktopCommandCenter } from './DesktopCommandCenter';

import type { Agency } from '@/lib/agency/agencyTypes';
import type { AgencyTask, TaskTypeId, AgencyTaskLog } from '@/lib/agency/agencyTasks';

interface ResponsivePortalProps {
  agency: Agency;
  tasks: AgencyTask[];
  taskLogs: AgencyTaskLog[];
  members: Array<{
    id: string;
    specialization: string;
    is_leader: boolean;
    skill_weights: Record<string, number>;
  }>;
  isOwner: boolean;
  isAuthenticated: boolean;
  leaderName?: string;
  onLaunchTask: (type: TaskTypeId, input?: string) => Promise<void>;
  onCancelTask: (taskId: string) => Promise<boolean | void>;
  onRetryTask: (taskId: string) => Promise<boolean | void>;
  onCancelAll: () => Promise<void>;
  onClearCompleted: () => Promise<void>;
  onNavigateTab: (tab: string) => void;
  onOpenSettings: () => void;
  onOpenDream: () => void;
  onStartTeamLearning: () => Promise<void>;
  activeTab: string;
  className?: string;
}

export function ResponsivePortal(props: ResponsivePortalProps) {
  const isMobile = useIsMobile();

  // Show mobile layout for mobile devices, desktop for larger screens
  if (isMobile) {
    return <MobileCommandCenter {...props} />;
  }

  return <DesktopCommandCenter {...props} />;
}
