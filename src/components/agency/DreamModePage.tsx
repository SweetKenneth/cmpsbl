/**
 * Dream Mode Page
 * Shows local + global improvements, metrics, and controls
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import {
  Moon,
  Globe,
  Sparkles,
  TrendingUp,
  Shield,
  Download,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  Brain,
  Lightbulb,
  FileText,
  Workflow,
} from 'lucide-react';
import {
  useLocalImprovements,
  useGlobalImprovements,
  useDreamCycleLogs,
  useDreamLearningMetrics,
  useDreamConsent,
  useTriggerLocalDream,
  useTriggerGlobalDream,
  useApplyGlobalImprovement,
  useExportDreamMemory,
} from '@/lib/agency/hooks/useHybridDream';

interface DreamModePageProps {
  agencyId: string;
}

const IMPROVEMENT_ICONS: Record<string, React.ReactNode> = {
  template: <FileText className="h-4 w-4" />,
  heuristic: <Lightbulb className="h-4 w-4" />,
  scaffold: <Workflow className="h-4 w-4" />,
  strategy: <TrendingUp className="h-4 w-4" />,
  skill: <Sparkles className="h-4 w-4" />,
  workflow: <Workflow className="h-4 w-4" />,
  framework: <Brain className="h-4 w-4" />,
  pattern: <Sparkles className="h-4 w-4" />,
};

export function DreamModePage({ agencyId }: DreamModePageProps) {
  const [activeTab, setActiveTab] = useState('local');

  // Hooks
  const { data: localImprovements, isLoading: localLoading } = useLocalImprovements(agencyId);
  const { data: globalImprovements, isLoading: globalLoading } = useGlobalImprovements();
  const { data: cycleLogs } = useDreamCycleLogs(agencyId);
  const { data: metrics } = useDreamLearningMetrics(agencyId);
  const { consent, updateConsent, isUpdating } = useDreamConsent(agencyId);

  const triggerLocalDream = useTriggerLocalDream(agencyId);
  const triggerGlobalDream = useTriggerGlobalDream();
  const applyGlobalImprovement = useApplyGlobalImprovement(agencyId);
  const exportDreamMemory = useExportDreamMemory(agencyId);

  // Calculate summary stats
  const localCount = localImprovements?.length || 0;
  const globalCount = globalImprovements?.length || 0;
  const appliedCount = localImprovements?.filter(i => i.applied).length || 0;
  const latestMetrics = metrics?.[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Moon className="h-6 w-6 text-primary" />
            Hybrid Dream Learning
          </h2>
          <p className="text-muted-foreground">
            Local agency learning + global substrate improvements
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => exportDreamMemory.mutate()}
            disabled={exportDreamMemory.isPending}
          >
            <Download className="h-4 w-4 mr-2" />
            Export Memory
          </Button>
          <Button
            onClick={() => triggerLocalDream.mutate()}
            disabled={triggerLocalDream.isPending}
          >
            <Play className="h-4 w-4 mr-2" />
            Run Local Dream
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Local Improvements</p>
                <p className="text-2xl font-bold">{localCount}</p>
              </div>
              <Moon className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Global Available</p>
                <p className="text-2xl font-bold">{globalCount}</p>
              </div>
              <Globe className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applied</p>
                <p className="text-2xl font-bold">{appliedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate Δ</p>
                <p className="text-2xl font-bold">
                  {latestMetrics ? `${(latestMetrics.success_rate_delta * 100).toFixed(1)}%` : '--'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy & Consent
          </CardTitle>
          <CardDescription>
            Control what data is shared for global learning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Allow Global Pooling</p>
                <p className="text-sm text-muted-foreground">
                  Share anonymized patterns for cross-agency learning
                </p>
              </div>
              <Switch
                checked={consent?.allow_global_pooling ?? true}
                onCheckedChange={(checked) => updateConsent({ allow_global_pooling: checked })}
                disabled={isUpdating}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Share Templates</p>
                <p className="text-sm text-muted-foreground">
                  Contribute successful templates to global pool
                </p>
              </div>
              <Switch
                checked={consent?.allow_template_sharing ?? true}
                onCheckedChange={(checked) => updateConsent({ allow_template_sharing: checked })}
                disabled={isUpdating}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Share Heuristics</p>
                <p className="text-sm text-muted-foreground">
                  Contribute learned patterns to global pool
                </p>
              </div>
              <Switch
                checked={consent?.allow_heuristic_sharing ?? true}
                onCheckedChange={(checked) => updateConsent({ allow_heuristic_sharing: checked })}
                disabled={isUpdating}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Improvements Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="local" className="flex items-center gap-2">
            <Moon className="h-4 w-4" />
            Local Improvements
          </TabsTrigger>
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Global Improvements
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Cycle Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="local">
          <Card>
            <CardHeader>
              <CardTitle>Local Agency Improvements</CardTitle>
              <CardDescription>
                Learned from your agency's task patterns, errors, and discoveries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {localLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : localImprovements?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Moon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No local improvements yet</p>
                  <p className="text-sm">Run a local dream cycle to generate improvements</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {localImprovements?.map((improvement) => (
                      <div
                        key={improvement.id}
                        className="flex items-start justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 text-primary">
                            {IMPROVEMENT_ICONS[improvement.improvement_type] || <Sparkles className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium">{improvement.title}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{improvement.improvement_type}</Badge>
                              <Badge variant="secondary">{improvement.category}</Badge>
                              {improvement.applied && (
                                <Badge className="bg-green-500/10 text-green-500">Applied</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">Confidence:</span>
                            <Progress value={improvement.confidence * 100} className="w-16 h-2" />
                            <span className="text-sm font-medium">
                              {(improvement.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="global">
          <Card>
            <CardHeader>
              <CardTitle>Global Substrate Improvements</CardTitle>
              <CardDescription>
                Aggregated patterns from all participating agencies (anonymized)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {globalLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              ) : globalImprovements?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No global improvements available yet</p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {globalImprovements?.map((improvement) => (
                      <div
                        key={improvement.id}
                        className="flex items-start justify-between p-4 rounded-lg border bg-card"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                            {IMPROVEMENT_ICONS[improvement.improvement_type] || <Globe className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium">{improvement.title}</p>
                            <p className="text-sm text-muted-foreground">{improvement.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline">{improvement.improvement_type}</Badge>
                              <Badge variant="secondary">{improvement.category}</Badge>
                              <Badge variant="outline">v{improvement.version}</Badge>
                              <Badge className="bg-blue-500/10 text-blue-500">
                                {improvement.source_count} sources
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="flex items-center gap-1">
                            <span className="text-sm text-muted-foreground">Confidence:</span>
                            <span className="text-sm font-medium">
                              {(improvement.confidence * 100).toFixed(0)}%
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => applyGlobalImprovement.mutate(improvement.id)}
                            disabled={applyGlobalImprovement.isPending}
                          >
                            Apply to Agency
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Dream Cycle Logs</CardTitle>
              <CardDescription>
                History of local and global dream cycles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {cycleLogs?.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-4 rounded-lg border bg-card"
                    >
                      <div className="flex items-center gap-3">
                        {log.cycle_type === 'local' ? (
                          <Moon className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Globe className="h-5 w-5 text-green-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {log.cycle_type === 'local' ? 'Local' : 'Global'} Dream Cycle
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                log.status === 'completed' ? 'default' :
                                log.status === 'running' ? 'secondary' :
                                log.status === 'failed' ? 'destructive' : 'outline'
                              }
                            >
                              {log.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {log.status === 'running' && <Clock className="h-3 w-3 mr-1 animate-spin" />}
                              {log.status === 'failed' && <AlertCircle className="h-3 w-3 mr-1" />}
                              {log.status}
                            </Badge>
                            {log.improvements_generated > 0 && (
                              <span className="text-sm text-muted-foreground">
                                +{log.improvements_generated} improvements
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {log.started_at && new Date(log.started_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DreamModePage;
