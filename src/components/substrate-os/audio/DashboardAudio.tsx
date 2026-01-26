/**
 * DashboardAudio - Central audio control panel for the Substrate OS dashboard
 * Combines sound effects toggle, ambient music, and volume controls
 */

import { useState } from 'react';
import { Volume2, VolumeX, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundSettings } from '@/components/agency/features/SoundEffects';
import { AmbientMusicPlayer } from './AmbientMusicPlayer';

interface DashboardAudioProps {
  className?: string;
}

export function DashboardAudio({ className }: DashboardAudioProps) {
  const { settings, toggleEnabled, updateSettings } = useSoundSettings();
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <div className={cn("flex items-center gap-1.5 sm:gap-2", className)}>
      {/* Quick Sound Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleEnabled}
        className={cn(
          "h-8 w-8 sm:h-9 sm:w-9 relative shrink-0",
          settings.enabled && "text-emerald-400"
        )}
        title={settings.enabled ? 'Mute sounds' : 'Enable sounds'}
      >
        {settings.enabled ? (
          <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        ) : (
          <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
        )}
        {settings.enabled && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
        )}
      </Button>
      
      {/* Ambient Music */}
      <AmbientMusicPlayer />
      
      {/* Audio Settings */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
          className="h-8 w-8 sm:h-9 sm:w-9 shrink-0"
          title="Audio Settings"
        >
          <Settings2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </Button>
        
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "absolute right-0 top-full mt-2 z-50",
                "w-64 p-4 rounded-xl",
                "bg-card/95 backdrop-blur-xl border border-border/50",
                "shadow-xl shadow-black/20"
              )}
            >
              <h4 className="text-sm font-semibold mb-3">Audio Settings</h4>
              
              <div className="space-y-3">
                {/* Master Toggle */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                  <span className="text-xs">Sound Effects</span>
                  <Button
                    variant={settings.enabled ? "default" : "outline"}
                    size="sm"
                    onClick={toggleEnabled}
                    className="h-6 text-xs"
                  >
                    {settings.enabled ? 'ON' : 'OFF'}
                  </Button>
                </div>
                
                {/* Category Toggles */}
                <div className="space-y-2">
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 cursor-pointer">
                    <span className="text-xs">Task Sounds</span>
                    <input
                      type="checkbox"
                      checked={settings.taskSounds}
                      onChange={(e) => updateSettings({ taskSounds: e.target.checked })}
                      className="rounded border-border"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 cursor-pointer">
                    <span className="text-xs">Message Sounds</span>
                    <input
                      type="checkbox"
                      checked={settings.messageSounds}
                      onChange={(e) => updateSettings({ messageSounds: e.target.checked })}
                      className="rounded border-border"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/20 cursor-pointer">
                    <span className="text-xs">Achievement Sounds</span>
                    <input
                      type="checkbox"
                      checked={settings.achievementSounds}
                      onChange={(e) => updateSettings({ achievementSounds: e.target.checked })}
                      className="rounded border-border"
                    />
                  </label>
                </div>
                
                {/* Status */}
                <div className="pt-2 border-t border-border/30">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-[9px]",
                      settings.enabled 
                        ? "border-emerald-500/50 text-emerald-400"
                        : "border-muted-foreground/30 text-muted-foreground"
                    )}
                  >
                    {settings.enabled ? 'AUDIO ACTIVE' : 'AUDIO MUTED'}
                  </Badge>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
