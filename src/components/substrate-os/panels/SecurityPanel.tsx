/**
 * Security Panel — DEFENSE · Immunity · Audit · Patches · Backups
 * Mobile-first with scrollable tabs and proper spacing.
 */

import { useState, lazy, Suspense } from 'react';
import {
  Shield, Network, FileText, HardDrive, Loader2, Download,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ModuleErrorBoundary } from '@/components/system/ModuleErrorBoundary';
import { FullBackupButton } from '@/components/admin/FullBackupButton';

const DefenseAnalytics = lazy(() => import('@/components/substrate-os/DefenseAnalytics').then(m => ({ default: m.DefenseAnalytics })));
const ShadowMeshToggle = lazy(() => import('@/components/admin/ShadowMeshToggle').then(m => ({ default: m.ShadowMeshToggle })));
const ShadowMeshAnalytics = lazy(() => import('@/components/admin/ShadowMeshAnalytics').then(m => ({ default: m.ShadowMeshAnalytics })));
const AuditTab = lazy(() => import('@/components/substrate-os/AuditTab').then(m => ({ default: m.AuditTab })));
const PatchAuthoringTab = lazy(() => import('@/components/substrate-os/PatchAuthoringTab').then(m => ({ default: m.PatchAuthoringTab })));
const BackupRestorePanel = lazy(() => import('@/components/substrate-os/BackupRestorePanel').then(m => ({ default: m.BackupRestorePanel })));

function Loader() {
  return (
    <div className="flex items-center justify-center py-20 sm:py-24">
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
    <div className="space-y-5 sm:space-y-6">
      <div className="flex items-center gap-3">
         <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-amber-500/15 to-red-500/10 border border-amber-500/25 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="min-w-0">
          <h2 className="text-base sm:text-lg font-bold tracking-tight">Stream Security</h2>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground/60 font-mono tracking-wider truncate">DEFENSE · IMMUNITY · AUDIT · STREAM INTEGRITY</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <TabsList className="bg-muted/15 border border-border/15 gap-0.5 w-max sm:w-auto">
            <TabsTrigger value="defense" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <Shield className="w-3.5 h-3.5 hidden sm:block" /> Defense
            </TabsTrigger>
            <TabsTrigger value="immunity" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <Network className="w-3.5 h-3.5 hidden sm:block" /> Immunity
            </TabsTrigger>
            <TabsTrigger value="audit" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <FileText className="w-3.5 h-3.5 hidden sm:block" /> Audit
            </TabsTrigger>
            <TabsTrigger value="patches" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <Shield className="w-3.5 h-3.5 hidden sm:block" /> Patches
            </TabsTrigger>
            <TabsTrigger value="backups" className="data-[state=active]:bg-amber-500/10 data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 text-xs gap-1 sm:gap-1.5 px-2.5 sm:px-3">
              <HardDrive className="w-3.5 h-3.5 hidden sm:block" /> Backups
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="defense" className="mt-4">
          <ModuleErrorBoundary moduleName="Defense">
            <Suspense fallback={<Loader />}><DefenseAnalytics /></Suspense>
          </ModuleErrorBoundary>
        </TabsContent>

        <TabsContent value="immunity" className="mt-4">
          <ModuleErrorBoundary moduleName="Immunity">
            <Suspense fallback={<Loader />}>
              <div className="space-y-5 sm:space-y-6">
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

        <TabsContent value="backups" className="mt-4 space-y-4">
          {/* Full System Backup — disaster recovery ZIP */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-lg border border-blue-500/20 bg-blue-500/5">
            <div className="min-w-0">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <Download className="w-4 h-4 text-blue-400 shrink-0" />
                Full System Backup
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                One-click disaster recovery — downloads all tables, schema & restoration guide as ZIP
              </p>
            </div>
            <FullBackupButton />
          </div>

          <ModuleErrorBoundary moduleName="Backups">
            <Suspense fallback={<Loader />}><BackupRestorePanel enabled={isOperator} /></Suspense>
          </ModuleErrorBoundary>
        </TabsContent>
      </Tabs>
    </div>
  );
}
