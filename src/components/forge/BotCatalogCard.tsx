/**
 * Bot Catalog Card Component
 * Displays bot in catalog view with version and actions
 */

import { formatDistanceToNow } from 'date-fns';
import { Bot, Download, GitBranch, Play, Cpu, Database, Zap, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BotVersionBadge } from './BotVersionBadge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface BotCatalogCardProps {
  id: string;
  name: string;
  slug: string;
  type: string;
  version: string;
  memoryMode: string;
  providers: string[];
  capabilities: string[];
  createdAt: string;
  hasUpdate?: boolean;
  latestVersion?: string;
  isOperator?: boolean;
  onExport: () => void;
  onBumpVersion: () => void;
  onRun: () => void;
  exporting?: boolean;
}

export function BotCatalogCard({
  id,
  name,
  slug,
  type,
  version,
  memoryMode,
  providers,
  capabilities,
  createdAt,
  hasUpdate,
  latestVersion,
  isOperator,
  onExport,
  onBumpVersion,
  onRun,
  exporting,
}: BotCatalogCardProps) {
  const getTypeColor = (t: string) => {
    switch (t) {
      case 'Research': return 'bg-neon-blue/10 text-neon-blue border-neon-blue/30';
      case 'Analyst': return 'bg-neon-purple/10 text-neon-purple border-neon-purple/30';
      case 'Planner': return 'bg-neon-green/10 text-neon-green border-neon-green/30';
      case 'Strategist': return 'bg-neon-amber/10 text-neon-amber border-neon-amber/30';
      case 'Hybrid': return 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30';
      default: return 'bg-muted';
    }
  };

  const getMemoryIcon = (mode: string) => {
    switch (mode) {
      case 'Stateless': return <Zap className="w-3 h-3" />;
      case 'Episodic': return <Cpu className="w-3 h-3" />;
      case 'Persistent': return <Database className="w-3 h-3" />;
      default: return null;
    }
  };

  return (
    <Card className="hover:border-primary/30 transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold leading-none mb-1">{name}</h3>
              <code className="text-xs text-muted-foreground">{slug}</code>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <BotVersionBadge 
              version={version} 
              hasUpdate={hasUpdate}
              latestVersion={latestVersion}
            />
            {isOperator && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onBumpVersion}>
                    <GitBranch className="w-4 h-4 mr-2" />
                    Bump Version
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Export Bundle
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onRun}>
                    <Play className="w-4 h-4 mr-2" />
                    Test Run
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Type & Memory */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getTypeColor(type)}>{type}</Badge>
          <Badge variant="outline" className="gap-1">
            {getMemoryIcon(memoryMode)}
            {memoryMode}
          </Badge>
        </div>

        {/* Providers */}
        <div className="flex flex-wrap gap-1.5">
          {providers.slice(0, 4).map((p, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {String(p)}
            </Badge>
          ))}
          {providers.length > 4 && (
            <Badge variant="secondary" className="text-xs">
              +{providers.length - 4}
            </Badge>
          )}
        </div>

        {/* Capabilities Preview */}
        <div className="text-xs text-muted-foreground">
          {capabilities.slice(0, 3).join(' • ')}
          {capabilities.length > 3 && ` +${capabilities.length - 3} more`}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
          
          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRun}
              className="h-7 text-xs"
            >
              <Play className="w-3 h-3 mr-1" />
              Run
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExport}
              disabled={exporting}
              className="h-7 text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
