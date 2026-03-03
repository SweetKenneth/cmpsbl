/**
 * Security Panel — DEFENSE · Immunity · Audit · Patches · Backups
 * Merged security surface with sub-tabs.
 */

import { useState, lazy, Suspense } from 'react';
import {
  Shield, Network, FileText, HardDrive, Loader2,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModuleErrorBoundary } from '@/components/system/ModuleErrorBoundary';

const DefenseAnalytics = lazy(() => import('@/components/substrate-os/DefenseAnalytics').then(m => ({ default: m.DefenseAnalytics })));
const ShadowMeshToggle = lazy(() => import('@/components/admin/ShadowMeshToggle').then(m => ({ default: m.ShadowMeshToggle })));
const ShadowMeshAnalytics = lazy(() => import('@/components/admin/ShadowMeshAnalytics').then(m => ({ default: m.ShadowMeshAnalytics })));
const AuditTab = lazy(() => import('@/components/substrate-os/AuditTab').then(m => ({ default: m.AuditTab })));
const PatchAuthoringTab = lazy(() => import('@/components/substrate-os/PatchAuthoringTab').then(m => ({ default: m.PatchAuthoringTab })));
const BackupRestorePanel = lazy(() => import('@/components/substrate-os/BackupRestorePanel').then(m => ({ default: m.BackupRestorePanel })));

function Loader() {
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className="w-5 h-5 text-muted-foreground/40 animate-spin" />
    </div>
  );
}

interface SecurityPanelProps {
  isGovernor: boolean;
  isOperator: boolean;
}

export default function SecurityPanel({ isGovernor, isOperator }: SecurityPanelProps) {
  const [activeTab, setActiveTab] = useState('defense');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/15 to-red-500/10 border border-amber-500/25 flex items-center justify-center">
          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Security Center</h2>
          <p className="text-[10px] text-muted-foreground/60 font-mono tracking-wider">DEFENSE · IMMUNITY · AUDIT · PATCHES · BACKUPS</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/15 border border-border/15 gap-0.5 flex-wrap">
          <TabsTrigger value="defense" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 text-xs gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Defense
          </TabsTrigger>
          <TabsTrigger value="immunity" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 text-xs gap-1.5">
            <Network className="w-3.5 h-3.5" /> Immunity
          </TabsTrigger>
          <TabsTrigger value="audit" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 text-xs gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Audit
          </TabsTrigger>
          <TabsTrigger value="patches" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 text-xs gap-1.5">
            <Shield className="w-3.5 h-3.5" /> Patches
          </TabsTrigger>
          <TabsTrigger value="backups" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 text-xs gap-1.5">
            <HardDrive className="w-3.5 h-3.5" /> Backups
          </TabsTrigger>
        </TabsList>

        <TabsContent value="defense" className="mt-4">
          <ModuleErrorBoundary moduleName="Defense">
            <Suspense fallback={<Loader />}><DefenseAnalytics /></Suspense>
          </ModuleErrorBoundary>
        </TabsContent>

        <TabsContent value="immunity" className="mt-4">
          <ModuleErrorBoundary moduleName="Immunity">
            <Suspense fallback={<Loader />}>
              <div className="space-y-6">
                <ShadowMeshToggle />
                <ShadowMeshAnalytics />
              </div>
            </Suspense>
          </ModuleErrorBoundary>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <ModuleErrorBoundary moduleName="Audit">
            <Suspense fallback={<Loader />}><AuditTab /></Suspense>
          </ModuleErrorBoundary>
        </TabsContent>

        <TabsContent value="patches" className="mt-4">
          <ModuleErrorBoundary moduleName="Patches">
            <Suspense fallback={<Loader />}><PatchAuthoringTab /></Suspense>
          </ModuleErrorBoundary>
        </TabsContent>

        <TabsContent value="backups" className="mt-4">
          <ModuleErrorBoundary moduleName="Backups">
            <Suspense fallback={<Loader />}><BackupRestorePanel enabled={isOperator} /></Suspense>
          </ModuleErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}
