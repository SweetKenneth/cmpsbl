/**
 * Evolution Control Center — Auth-gated mission control for system evolution
 * Tabs: Dry-Run Preview | Rollback | Trends | Feedback | Agent Connect
 */

import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical, RotateCcw, TrendingUp, MessageSquareWarning, ArrowLeft, Plug, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DryRunPreview } from '@/components/evolution/DryRunPreview';
import { RollbackPanel } from '@/components/evolution/RollbackPanel';
import { ScanTrendDashboard } from '@/components/evolution/ScanTrendDashboard';
import { FalsePositiveFeedback } from '@/components/evolution/FalsePositiveFeedback';
import { AgentConnectGuide } from '@/components/evolution/AgentConnectGuide';

export default function EvolutionControlCenter() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Auth gate — require login
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading…</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md mx-auto px-4">
          <Lock className="w-12 h-12 text-muted-foreground mx-auto" />
          <h1 className="text-2xl font-bold text-foreground">Authentication Required</h1>
          <p className="text-sm text-muted-foreground">
            The EVOLUTION Control Center requires an authenticated session. Sign in to access your evolution tools and API credentials.
          </p>
          <Button onClick={() => navigate('/auth')} className="mt-4">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>EVOLUTION Control Center — CMPSBL Substrate</title>
        <meta name="description" content="Mission control for system evolution. Preview impacts, manage rollbacks, track trends, and connect AI agents." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="h-8 w-8">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  EVOLUTION Control Center
                </h1>
              </div>
              <p className="text-sm text-muted-foreground ml-11">
                Preview impacts before they happen. Roll back when needed. Track your system's improvement trajectory.
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="dry-run" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5 h-auto">
              <TabsTrigger value="dry-run" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
                <FlaskConical className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dry-Run</span> Preview
              </TabsTrigger>
              <TabsTrigger value="rollback" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
                <RotateCcw className="w-3.5 h-3.5" />
                Rollback
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
                <MessageSquareWarning className="w-3.5 h-3.5" />
                Feedback
              </TabsTrigger>
              <TabsTrigger value="connect" className="flex items-center gap-1.5 text-xs sm:text-sm py-2">
                <Plug className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Agent</span> Connect
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dry-run">
              <DryRunPreview />
            </TabsContent>

            <TabsContent value="rollback">
              <RollbackPanel />
            </TabsContent>

            <TabsContent value="trends">
              <ScanTrendDashboard />
            </TabsContent>

            <TabsContent value="feedback">
              <FalsePositiveFeedback />
            </TabsContent>

            <TabsContent value="connect">
              <AgentConnectGuide />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}
