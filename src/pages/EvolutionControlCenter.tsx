/**
 * Evolution Control Center — Dedicated mission control for system evolution
 * Tabs: Dry-Run Preview | Rollback | Trends | Feedback
 */

import { Helmet } from 'react-helmet-async';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FlaskConical, RotateCcw, TrendingUp, MessageSquareWarning, ArrowLeft, Plug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { DryRunPreview } from '@/components/evolution/DryRunPreview';
import { RollbackPanel } from '@/components/evolution/RollbackPanel';
import { ScanTrendDashboard } from '@/components/evolution/ScanTrendDashboard';
import { FalsePositiveFeedback } from '@/components/evolution/FalsePositiveFeedback';
import { AgentConnectGuide } from '@/components/evolution/AgentConnectGuide';

export default function EvolutionControlCenter() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Evolution Control Center — CMPSBL Substrate</title>
        <meta name="description" content="Mission control for system evolution. Preview impacts, manage rollbacks, track trends, and calibrate scanner accuracy." />
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
          </Tabs>
        </div>
      </div>
    </>
  );
}
