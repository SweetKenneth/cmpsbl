/**
 * Agency Settings Panel — Configure agency preferences
 */

import { useState, useEffect } from 'react';
import { Settings, User, Zap, Brain, Bookmark, Plus, X, Save } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { AgencySettings, PresetCommand } from '@/lib/agency/agencyTasks';
import { DEFAULT_PRESET_COMMANDS } from '@/lib/agency/agencyTasks';

interface AgencySettingsPanelProps {
  settings: AgencySettings | null;
  isLoading: boolean;
  onUpdateSettings: (updates: Partial<AgencySettings>) => Promise<boolean>;
  onUpdateLeaderName: (name: string) => Promise<boolean>;
  onAddPreset: (preset: PresetCommand) => Promise<boolean>;
  onRemovePreset: (presetId: string) => Promise<boolean>;
  className?: string;
}

export function AgencySettingsPanel({
  settings,
  isLoading,
  onUpdateSettings,
  onUpdateLeaderName,
  onAddPreset,
  onRemovePreset,
  className,
}: AgencySettingsPanelProps) {
  const [leaderName, setLeaderName] = useState('');
  const [newPresetName, setNewPresetName] = useState('');
  const [newPresetCommand, setNewPresetCommand] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Sync leaderName with settings when loaded
  useEffect(() => {
    if (settings?.leader_name && !isSaving) {
      setLeaderName(settings.leader_name);
    }
  }, [settings?.leader_name]);

  const handleSaveLeaderName = async () => {
    setIsSaving(true);
    await onUpdateLeaderName(leaderName);
    setIsSaving(false);
  };

  const handleToggleSetting = async (key: 'auto_research_enabled' | 'shared_learning_enabled', value: boolean) => {
    await onUpdateSettings({ [key]: value });
  };

  const handleAddPreset = async () => {
    if (!newPresetName.trim() || !newPresetCommand.trim()) {
      toast.error('Please enter both name and command');
      return;
    }

    const preset: PresetCommand = {
      id: `custom_${Date.now()}`,
      name: newPresetName.trim(),
      command: newPresetCommand.startsWith('/') ? newPresetCommand : `/${newPresetCommand}`,
      description: 'Custom preset command',
      icon: '⚡',
    };

    const success = await onAddPreset(preset);
    if (success) {
      setNewPresetName('');
      setNewPresetCommand('');
    }
  };

  if (isLoading || !settings) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <div className="text-center">
          <Settings className="w-8 h-8 mx-auto animate-spin text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  const presets = Array.isArray(settings.preset_commands) ? settings.preset_commands : DEFAULT_PRESET_COMMANDS;

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="p-4 space-y-6">
        {/* Leader Name */}
        <Card className="border-border/30 bg-black/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-neon-magenta" />
              Leader Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="leader-name" className="text-xs">Leader Display Name</Label>
              <div className="flex gap-2">
                <Input
                  id="leader-name"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="Enter leader name"
                  className="bg-black/30"
                />
                <Button 
                  size="sm" 
                  onClick={handleSaveLeaderName}
                  disabled={isSaving || leaderName === settings.leader_name}
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                This name will be used when the leader speaks to users
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Learning Settings */}
        <Card className="border-border/30 bg-black/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="w-4 h-4 text-neon-purple" />
              Learning & Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Auto Research</Label>
                <p className="text-[10px] text-muted-foreground">
                  Agents research their domains when idle
                </p>
              </div>
              <Switch
                checked={settings.auto_research_enabled}
                onCheckedChange={(v) => handleToggleSetting('auto_research_enabled', v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm">Shared Learning</Label>
                <p className="text-[10px] text-muted-foreground">
                  Agents learn from each other's completed tasks
                </p>
              </div>
              <Switch
                checked={settings.shared_learning_enabled}
                onCheckedChange={(v) => handleToggleSetting('shared_learning_enabled', v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preset Commands */}
        <Card className="border-border/30 bg-black/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-amber" />
              Quick Action Presets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Presets */}
            <div className="space-y-2">
              {presets.map(preset => (
                <div 
                  key={preset.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/20 border border-border/20"
                >
                  <div className="flex items-center gap-2">
                    <span>{preset.icon || '⚡'}</span>
                    <div>
                      <p className="text-sm font-medium">{preset.name}</p>
                      <code className="text-[10px] text-muted-foreground">{preset.command}</code>
                    </div>
                  </div>
                  {preset.id.startsWith('custom_') && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => onRemovePreset(preset.id)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Preset */}
            <div className="pt-3 border-t border-border/20 space-y-2">
              <Label className="text-xs">Add Custom Preset</Label>
              <div className="flex gap-2">
                <Input
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  placeholder="Name"
                  className="bg-black/30 flex-1"
                />
                <Input
                  value={newPresetCommand}
                  onChange={(e) => setNewPresetCommand(e.target.value)}
                  placeholder="/command"
                  className="bg-black/30 w-32"
                />
                <Button size="sm" onClick={handleAddPreset}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Research Domains */}
        <Card className="border-border/30 bg-black/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-neon-cyan" />
              Default Research Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {settings.default_research_domains.map((domain, i) => (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className="text-xs border-neon-cyan/30 text-neon-cyan"
                >
                  {domain}
                </Badge>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Agents will use these domains for idle learning
            </p>
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
}
