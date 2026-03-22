/**
 * CodeAgent v3 - Split Diff Viewer
 * Side-by-side view of before/after code changes
 */

import React, { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Minus, FileText, GitCompare } from 'lucide-react';

interface DiffLine {
  type: 'add' | 'remove' | 'context';
  content: string;
  oldLineNum?: number;
  newLineNum?: number;
}

interface FileDiff {
  path: string;
  status: 'added' | 'modified' | 'deleted';
  lines: DiffLine[];
  additions: number;
  deletions: number;
}

interface DiffViewerProps {
  diff: string;
  mode?: 'split' | 'unified';
  onModeChange?: (mode: 'split' | 'unified') => void;
}

export function DiffViewer({ diff, mode = 'split', onModeChange }: DiffViewerProps) {
  const files = useMemo(() => parseDiff(diff), [diff]);
  
  const totalAdditions = files.reduce((sum, f) => sum + f.additions, 0);
  const totalDeletions = files.reduce((sum, f) => sum + f.deletions, 0);
  
  return (
    <Card className="overflow-hidden border-border/50 bg-card/50">
      <div className="flex items-center justify-between p-3 border-b border-border/50">
        <div className="flex items-center gap-3">
          <GitCompare className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">
            {files.length} file{files.length !== 1 ? 's' : ''} changed
          </span>
          <Badge variant="outline" className="bg-neon-green/10 text-neon-green border-neon-green/30">
            <Plus className="h-3 w-3 mr-1" />
            {totalAdditions}
          </Badge>
          <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
            <Minus className="h-3 w-3 mr-1" />
            {totalDeletions}
          </Badge>
        </div>
        
        <Tabs value={mode} onValueChange={(v) => onModeChange?.(v as 'split' | 'unified')}>
          <TabsList className="h-8">
            <TabsTrigger value="split" className="text-xs px-2 py-1">Split</TabsTrigger>
            <TabsTrigger value="unified" className="text-xs px-2 py-1">Unified</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <ScrollArea className="h-[400px]">
        {files.map((file, fileIndex) => (
          <div key={fileIndex} className="border-b border-border/30 last:border-0">
            <div className="flex items-center gap-2 px-3 py-2 bg-muted/30">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-mono">{file.path}</span>
              <Badge 
                variant="outline" 
                className={
                  file.status === 'added' ? 'bg-neon-green/10 text-neon-green' :
                  file.status === 'deleted' ? 'bg-destructive/10 text-destructive' :
                  'bg-neon-amber/10 text-neon-amber'
                }
              >
                {file.status}
              </Badge>
            </div>
            
            {mode === 'split' ? (
              <SplitView lines={file.lines} />
            ) : (
              <UnifiedView lines={file.lines} />
            )}
          </div>
        ))}
      </ScrollArea>
    </Card>
  );
}

function SplitView({ lines }: { lines: DiffLine[] }) {
  const { leftLines, rightLines } = useMemo(() => {
    const left: (DiffLine | null)[] = [];
    const right: (DiffLine | null)[] = [];
    
    for (const line of lines) {
      if (line.type === 'remove') {
        left.push(line);
        right.push(null);
      } else if (line.type === 'add') {
        left.push(null);
        right.push(line);
      } else {
        left.push(line);
        right.push(line);
      }
    }
    
    return { leftLines: left, rightLines: right };
  }, [lines]);
  
  return (
    <div className="grid grid-cols-2 divide-x divide-border/30">
      <div className="font-mono text-xs">
        {leftLines.map((line, i) => (
          <div 
            key={i} 
            className={`flex ${
              line?.type === 'remove' ? 'bg-destructive/10' : ''
            }`}
          >
            <span className="w-10 px-2 text-right text-muted-foreground border-r border-border/30 select-none">
              {line?.oldLineNum || ''}
            </span>
            <pre className="flex-1 px-2 py-0.5 overflow-x-auto whitespace-pre">
              {line?.type === 'remove' && <span className="text-destructive">- </span>}
              {line?.content || ''}
            </pre>
          </div>
        ))}
      </div>
      
      <div className="font-mono text-xs">
        {rightLines.map((line, i) => (
          <div 
            key={i} 
            className={`flex ${
              line?.type === 'add' ? 'bg-neon-green/10' : ''
            }`}
          >
            <span className="w-10 px-2 text-right text-muted-foreground border-r border-border/30 select-none">
              {line?.newLineNum || ''}
            </span>
            <pre className="flex-1 px-2 py-0.5 overflow-x-auto whitespace-pre">
              {line?.type === 'add' && <span className="text-neon-green">+ </span>}
              {line?.content || ''}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
}

function UnifiedView({ lines }: { lines: DiffLine[] }) {
  return (
    <div className="font-mono text-xs">
      {lines.map((line, i) => (
        <div 
          key={i} 
          className={`flex ${
            line.type === 'add' ? 'bg-neon-green/10' :
            line.type === 'remove' ? 'bg-destructive/10' : ''
          }`}
        >
          <span className="w-10 px-2 text-right text-muted-foreground border-r border-border/30 select-none">
            {line.oldLineNum || ''}
          </span>
          <span className="w-10 px-2 text-right text-muted-foreground border-r border-border/30 select-none">
            {line.newLineNum || ''}
          </span>
          <pre className="flex-1 px-2 py-0.5 overflow-x-auto whitespace-pre">
            {line.type === 'add' && <span className="text-neon-green">+ </span>}
            {line.type === 'remove' && <span className="text-destructive">- </span>}
            {line.type === 'context' && <span className="text-muted-foreground">  </span>}
            {line.content}
          </pre>
        </div>
      ))}
    </div>
  );
}

function parseDiff(diff: string): FileDiff[] {
  const files: FileDiff[] = [];
  const blocks = diff.split(/(?=^--- )/m).filter(Boolean);
  
  for (const block of blocks) {
    const pathMatch = block.match(/^--- a\/(.+)\n\+\+\+ b\/(.+)/m);
    if (!pathMatch) continue;
    
    const path = pathMatch[2];
    const lines: DiffLine[] = [];
    let oldLine = 0;
    let newLine = 0;
    let additions = 0;
    let deletions = 0;
    
    const content = block.split('\n').slice(2);
    
    for (const line of content) {
      if (line.startsWith('@@')) {
        const match = line.match(/@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
        if (match) {
          oldLine = parseInt(match[1]) - 1;
          newLine = parseInt(match[2]) - 1;
        }
        continue;
      }
      
      if (line.startsWith('+') && !line.startsWith('+++')) {
        newLine++;
        additions++;
        lines.push({ type: 'add', content: line.slice(1), newLineNum: newLine });
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        oldLine++;
        deletions++;
        lines.push({ type: 'remove', content: line.slice(1), oldLineNum: oldLine });
      } else if (line.startsWith(' ') || line === '') {
        oldLine++;
        newLine++;
        lines.push({ type: 'context', content: line.slice(1) || '', oldLineNum: oldLine, newLineNum: newLine });
      }
    }
    
    const status = deletions === 0 && block.includes('new file') ? 'added' :
                   additions === 0 && block.includes('deleted file') ? 'deleted' : 'modified';
    
    files.push({ path, status, lines, additions, deletions });
  }
  
  return files;
}

export default DiffViewer;
