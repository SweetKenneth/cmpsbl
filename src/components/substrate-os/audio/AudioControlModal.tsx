/**
 * AudioControlModal — Mobile audio controls for Clockless Radio
 * Replaces legacy modal with new radio system
 */

import { createPortal } from 'react-dom';
import { Radio, Volume2, VolumeX, Play, Pause, SkipForward, Settings2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundSettings } from '@/components/agency/features/SoundEffects';
import { useClocklessRadio } from '@/hooks/useClocklessRadio';
import { RADIO_TRACKS } from '@/lib/clockless-radio';

interface AudioControlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AudioControlModal({ isOpen, onClose }: AudioControlModalProps) {
  const { settings: soundSettings, toggleEnabled, updateSettings: updateSoundSettings } = useSoundSettings();
  const radio = useClocklessRadio();

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/40 backdrop-blur-sm z-[9998]"
            onClick={onClose}
          />
          
          <div className={cn(
            "fixed inset-0 z-[9999]",
            "flex items-center justify-center",
            "p-4",
            "[padding-top:calc(1rem+env(safe-area-inset-top))]",
            "[padding-bottom:calc(1rem+env(safe-area-inset-bottom))]",
          )}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className="w-full max-w-sm">
                <div className={cn(
                  "w-full max-h-[calc(100dvh-2rem)] rounded-2xl overflow-hidden",
                  "bg-card border border-border/50 shadow-2xl shadow-foreground/20"
                )}>
                  <div className="flex max-h-full flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-border/30 shrink-0">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-primary" />
                        <h3 className="text-base font-bold tracking-wide">CMPSBL RADIO</h3>
                      </div>
                      <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    <div className="min-h-0 flex-1 overflow-auto">
                      <Tabs defaultValue="music" className="w-full">
                        <TabsList className="w-full grid grid-cols-2 p-1 mx-4 my-3" style={{ width: 'calc(100% - 2rem)' }}>
                          <TabsTrigger value="music" className="gap-1.5">
                            <Radio className="w-3.5 h-3.5" />
                            Radio
                          </TabsTrigger>
                          <TabsTrigger value="settings" className="gap-1.5">
                            <Settings2 className="w-3.5 h-3.5" />
                            Settings
                          </TabsTrigger>
                        </TabsList>
                        
                        {/* Radio Tab */}
                        <TabsContent value="music" className="p-4 pt-0 space-y-4">
                          {/* DJ Interjection */}
                          <AnimatePresence>
                            {radio.djContent && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="p-3 rounded-lg bg-primary/10 border border-primary/20"
                              >
                                <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">
                                  {radio.djContent.type === 'call_in' ? `📞 ${radio.djContent.caller}` : radio.djContent.type === 'rex_rant' ? '🔥 REX BINARY' : '🎙 Rex Binary'}
                                </p>
                                <p className="text-xs text-foreground/80 italic leading-relaxed">
                                  "{radio.djContent.text}"
                                </p>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Current Track */}
                          <div className="p-3 rounded-lg bg-muted/30 border border-border/30">
                            <div className="flex items-center gap-3 mb-3">
                              <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                                "bg-gradient-to-br from-primary/20 to-accent/20",
                                "border border-primary/30"
                              )}>
                                <Radio className="w-5 h-5 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">
                                  {radio.currentTrack?.title || 'CMPSBL Radio'}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                  {radio.isDJSpeaking ? 'Rex Binary Live' : radio.isPlaying ? 'Now Playing' : 'Press play to tune in'}
                                </p>
                                {radio.totalMinutes > 0 && (
                                  <p className="text-[9px] text-muted-foreground/70">
                                    {radio.minutesRemaining}min remaining today
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            {/* Visualizer */}
                            <div className="flex items-end justify-center gap-0.5 h-8">
                              {Array.from({ length: 24 }).map((_, i) => (
                                <div
                                  key={i}
                                  className={cn(
                                    "w-1 bg-gradient-to-t from-primary to-accent rounded-full transition-all",
                                    radio.isPlaying ? "opacity-100" : "opacity-30"
                                  )}
                                  style={{
                                    height: radio.isPlaying ? `${Math.random() * 100}%` : '20%',
                                    animation: radio.isPlaying ? `visualizer 0.3s ease infinite` : 'none',
                                    animationDelay: `${i * 0.05}s`,
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                          
                          {/* Controls */}
                          <div className="flex items-center justify-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={radio.toggle}
                              className="h-12 w-12 rounded-full"
                            >
                              {radio.isPlaying ? (
                                <Pause className="w-5 h-5" />
                              ) : (
                                <Play className="w-5 h-5" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={radio.skip}
                              className="h-10 w-10"
                              disabled={!radio.isPlaying}
                            >
                              <SkipForward className="w-5 h-5" />
                            </Button>
                          </div>

                          {/* Track List */}
                          <div className="space-y-1 max-h-[200px] overflow-y-auto">
                            {RADIO_TRACKS.map((track) => (
                              <div
                                key={track.id}
                                className={cn(
                                  "flex items-center gap-2.5 p-2 rounded-lg transition-all",
                                  radio.currentTrack?.id === track.id
                                    ? "bg-primary/15 border border-primary/30"
                                    : "border border-transparent opacity-60"
                                )}
                              >
                                <div className={cn(
                                  "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                                  radio.currentTrack?.id === track.id ? "bg-primary/20" : "bg-muted/30"
                                )}>
                                  {radio.currentTrack?.id === track.id && radio.isPlaying ? (
                                    <Pause className="w-3 h-3 text-primary" />
                                  ) : (
                                    <Play className="w-3 h-3 text-muted-foreground" />
                                  )}
                                </div>
                                <p className={cn("text-xs font-medium truncate", radio.currentTrack?.id === track.id && "text-primary")}>{track.title}</p>
                              </div>
                            ))}
                          </div>
                          
                          {/* Volume */}
                          <div className="flex items-center gap-3">
                            <VolumeX className="w-4 h-4 text-muted-foreground shrink-0" />
                            <Slider
                              value={[radio.volume * 100]}
                              max={100}
                              step={1}
                              onValueChange={([v]) => radio.setVolume(v / 100)}
                              className="flex-1"
                            />
                            <Volume2 className="w-4 h-4 text-muted-foreground shrink-0" />
                          </div>
                        </TabsContent>
                        
                        {/* Settings Tab */}
                        <TabsContent value="settings" className="p-4 pt-0 space-y-3">
                          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                            <span className="text-sm font-medium">Sound Effects</span>
                            <Button
                              variant={soundSettings.enabled ? "default" : "outline"}
                              size="sm"
                              onClick={toggleEnabled}
                              className="h-7 text-xs px-3"
                            >
                              {soundSettings.enabled ? 'ON' : 'OFF'}
                            </Button>
                          </div>
                          
                          <div className="space-y-1">
                            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 cursor-pointer">
                              <span className="text-sm">Task Sounds</span>
                              <input
                                type="checkbox"
                                checked={soundSettings.taskSounds}
                                onChange={(e) => updateSoundSettings({ taskSounds: e.target.checked })}
                                className="w-4 h-4 rounded border-border accent-primary"
                              />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 cursor-pointer">
                              <span className="text-sm">Message Sounds</span>
                              <input
                                type="checkbox"
                                checked={soundSettings.messageSounds}
                                onChange={(e) => updateSoundSettings({ messageSounds: e.target.checked })}
                                className="w-4 h-4 rounded border-border accent-primary"
                              />
                            </label>
                            <label className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/20 cursor-pointer">
                              <span className="text-sm">Achievement Sounds</span>
                              <input
                                type="checkbox"
                                checked={soundSettings.achievementSounds}
                                onChange={(e) => updateSoundSettings({ achievementSounds: e.target.checked })}
                                className="w-4 h-4 rounded border-border accent-primary"
                              />
                            </label>
                          </div>
                          
                          <div className="pt-2 border-t border-border/30">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[9px]",
                                soundSettings.enabled 
                                  ? "border-neon-green/50 text-neon-green"
                                  : "border-muted-foreground/30 text-muted-foreground"
                              )}
                            >
                              {soundSettings.enabled ? 'AUDIO ACTIVE' : 'AUDIO MUTED'}
                            </Badge>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
