/**
 * TaskResultViewer — Display and download task results
 * Shows the actual work output from completed tasks
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, Download, Copy, Check, FileText, 
  Lightbulb, Globe, Clock, Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { AgencyTask } from '@/lib/agency/agencyTasks';

interface TaskResultViewerProps {
  task: AgencyTask;
  className?: string;
}

export function TaskResultViewer({ task, className }: TaskResultViewerProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const outputData = task.output_data as {
    result?: string;
    insights?: string[];
    sources?: string[];
    provider?: string;
    executionTimeMs?: number;
    artifactId?: string;
  } | null;

  if (!outputData?.result) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(outputData.result || '');
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([outputData.result || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${task.task_type}-${task.id.slice(0, 8)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn('gap-1.5', className)}
        >
          <Eye className="h-3.5 w-3.5" />
          View Results
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <span>{task.title}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Metadata */}
        <div className="flex flex-wrap gap-2 py-2 border-b border-border/50">
          {outputData.provider && (
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-3 w-3" />
              {outputData.provider}
            </Badge>
          )}
          {outputData.executionTimeMs && (
            <Badge variant="outline" className="gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(outputData.executionTimeMs)}
            </Badge>
          )}
          {outputData.sources && outputData.sources.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <Globe className="h-3 w-3" />
              {outputData.sources.length} sources
            </Badge>
          )}
        </div>

        <Tabs defaultValue="report" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start">
            <TabsTrigger value="report">Full Report</TabsTrigger>
            {outputData.insights && outputData.insights.length > 0 && (
              <TabsTrigger value="insights">
                Key Insights ({outputData.insights.length})
              </TabsTrigger>
            )}
            {outputData.sources && outputData.sources.length > 0 && (
              <TabsTrigger value="sources">
                Sources ({outputData.sources.length})
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="report" className="flex-1 overflow-hidden mt-4">
            <ScrollArea className="h-[50vh]">
              <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                {outputData.result}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="insights" className="mt-4">
            <ScrollArea className="h-[50vh]">
              <div className="space-y-3">
                {outputData.insights?.map((insight, i) => (
                  <Card key={i} className="border-primary/20">
                    <CardContent className="p-3 flex gap-3">
                      <Lightbulb className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-sm">{insight}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="sources" className="mt-4">
            <ScrollArea className="h-[50vh]">
              <div className="space-y-2">
                {outputData.sources?.map((source, i) => (
                  <a
                    key={i}
                    href={source}
                    target="_blank"rel="noopener noreferrer"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm"
                  >
                    <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="truncate text-primary underline-offset-2 hover:underline">
                      {source}
                    </span>
                  </a>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
