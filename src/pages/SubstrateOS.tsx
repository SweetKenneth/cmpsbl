/**
 * promptfluid® substrate — OS Surface
 * v2026.01 — Role-aware dashboard for Observer/Operator/Governor
 * 
 * This is the unified control surface for the cognitive orchestration substrate.
 * Real telemetry, no mock data. Mobile-first, 2026 design patterns.
 */

import { Navigate } from 'react-router-dom';
import { Activity, Eye, Play, ShieldAlert, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { useSystemVersion } from '@/hooks/useSubstrateOS';
import { ObserverSection } from '@/components/substrate-os/ObserverSection';
import { OperatorSection } from '@/components/substrate-os/OperatorSection';
import { GovernorSection } from '@/components/substrate-os/GovernorSection';
import { cn } from '@/lib/utils';

type RoleTab = 'observer' | 'operator' | 'governor';

function RolePill({ 
  role, 
  active, 
  enabled, 
  icon: Icon,
  onClick 
}: { 
  role: RoleTab; 
  active: boolean; 
  enabled: boolean;
  icon: React.ElementType;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={!enabled}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all",
        active 
          ? "bg-primary text-primary-foreground shadow-md" 
          : enabled 
            ? "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            : "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
      )}
    >
      <Icon className="w-4 h-4" />
      <span className="capitalize">{role}</span>
    </button>
  );
}

export default function SubstrateOS() {
  const { user, loading: authLoading } = useAuth();
  const { role, isOperator, isGovernor, loading: roleLoading } = useUserRole();
  const systemVersion = useSystemVersion();

  const versionData = systemVersion.data?.data as { version?: string } | undefined;

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Loading state
  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Initializing substrate OS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Substrate OS — promptfluid®"
        description="Cognitive orchestration substrate control surface. Observer, Operator, and Governor access levels for real-time telemetry and system control."
        canonical="https://promptfluid.com/os"
        keywords={["substrate os", "cognitive orchestration", "ai dashboard", "promptfluid"]}
      />

      <PublicNav />

      <main className="flex-1 container mx-auto px-4 py-6 md:py-10 max-w-6xl">
        {/* Header */}
        <header className="mb-6 md:mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Title */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  promptfluid<span className="text-primary">®</span> substrate
                </h1>
                <p className="text-sm text-muted-foreground">
                  OS Surface · {versionData?.version || 'v2026.01'}
                </p>
              </div>
            </div>

            {/* Role Indicator */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground mr-2">Access Level:</span>
              <RolePill 
                role="observer" 
                active={role === 'observer'} 
                enabled={true}
                icon={Eye}
                onClick={() => {}}
              />
              <RolePill 
                role="operator" 
                active={role === 'operator'} 
                enabled={isOperator}
                icon={Play}
                onClick={() => {}}
              />
              <RolePill 
                role="governor" 
                active={role === 'governor'} 
                enabled={isGovernor}
                icon={ShieldAlert}
                onClick={() => {}}
              />
            </div>
          </div>

          {/* User info */}
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="outline" className="font-normal">
              {user?.email}
            </Badge>
            <span>·</span>
            <span className="capitalize">{role} access</span>
          </div>
        </header>

        {/* Main Content - All sections visible, gated by role */}
        <div className="space-y-8 md:space-y-12">
          {/* Observer Section - Always visible */}
          <ObserverSection />

          <Separator className="my-6" />

          {/* Operator Section - Visible to operators and governors */}
          <OperatorSection enabled={isOperator} />

          <Separator className="my-6" />

          {/* Governor Section - Visible only to governors */}
          <GovernorSection enabled={isGovernor} />
        </div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
