/**
 * DashboardAudio - Central audio control panel for the Clockless Cognitive Reality dashboard
 * On mobile: opens a centered modal with tabs for music and settings
 * On desktop: shows individual dropdown panels
 */

import { useState } from 'react';
import { Volume2, VolumeX, Settings2, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSoundSettings } from '@/components/agency/features/SoundEffects';
import { AudioControlModal } from './AudioControlModal';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardAudioProps {
  className?: string;
}

export function DashboardAudio({ className }: DashboardAudioProps) {
  const { settings, toggleEnabled } = useSoundSettings();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // On mobile, show a single button that opens the combined modal
  if (isMobile) {
    return (
      <div className={cn("flex items-center gap-1.5", className)}>
        {/* Quick Sound Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleEnabled}
          className={cn(
            "h-8 w-8 relative shrink-0",
            settings.enabled && "text-neon-green"
          )}
          aria-label={settings.enabled ? 'Mute sounds' : 'Enable sounds'}
          title={settings.enabled ? 'Mute sounds' : 'Enable sounds'}
        >
          {settings.enabled ? (
            <Volume2 className="w-3.5 h-3.5" />
          ) : (
            <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </Button>
        
        {/* Music Button - opens modal */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsModalOpen(true)}
          className="h-8 w-8 relative shrink-0"
          aria-label="Audio Controls"
          title="Audio Controls"
        >
          <Music className="w-3.5 h-3.5" />
        </Button>
        
        {/* Settings Button - opens modal */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsModalOpen(true)}
          className="h-8 w-8 shrink-0"
          aria-label="Audio Settings"
          title="Audio Settings"
        >
          <Settings2 className="w-3.5 h-3.5" />
        </Button>
        
        {/* Combined Modal */}
        <AudioControlModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
    );
  }
  
  // Desktop: Import and render the desktop components
  return <DesktopAudioControls className={className} />;
}

// Desktop version with dropdown panels
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { AmbientMusicPlayer } from './AmbientMusicPlayer';
import { RadioPlayer } from '@/components/RadioPlayer';

function DesktopAudioControls({ className }: { className?: string }) {
  const { settings, toggleEnabled, updateSettings } = useSoundSettings();
  const [showSettings, setShowSettings] = useState(false);
  
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Quick Sound Toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleEnabled}
        className={cn(
          "h-9 w-9 relative shrink-0",
          settings.enabled && "text-neon-green"
        )}
        aria-label={settings.enabled ? 'Mute sounds' : 'Enable sounds'}
        title={settings.enabled ? 'Mute sounds' : 'Enable sounds'}
      >
        {settings.enabled ? (
          <Volume2 className="w-4 h-4" />
        ) : (
          <VolumeX className="w-4 h-4 text-muted-foreground" />
        )}
        {settings.enabled && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-neon-green rounded-full" />
        )}
      </Button>
      
      {/* Ambient Music */}
      <AmbientMusicPlayer />
      
      {/* CMPSBL Radio Broadcast */}
      <RadioPlayer />
      
      {/* Audio Settings */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowSettings(!showSettings)}
          className="h-9 w-9 shrink-0"
          aria-label="Audio Settings"
          title="Audio Settings"
        >
          <Settings2 className="w-4 h-4" />
        </Button>
        
        {createPortal(
          <AnimatePresence>
            {showSettings && (
              <>
                {/* Click-away backdrop */}
                <div className="fixed inset-0 z-[9998]" onClick={() => setShowSettings(false)} />
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className={cn(
                    "fixed z-[10000] top-12 right-4",
                    "w-64 p-4 rounded-xl",
                    "bg-card backdrop-blur-xl border border-border/50",
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
                            ? "border-neon-green/50 text-neon-green"
                            : "border-muted-foreground/30 text-muted-foreground"
                        )}
                      >
                        {settings.enabled ? 'AUDIO ACTIVE' : 'AUDIO MUTED'}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </div>
  );
}
