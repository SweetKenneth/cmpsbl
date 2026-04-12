/**
 * ClocklessRadioPlayer — Desktop floating panel for Clockless Radio
 * Replaces legacy AmbientMusicPlayer
 */

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Radio, Volume2, VolumeX, Play, Pause, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useClocklessRadio } from '@/hooks/useClocklessRadio';
import { RADIO_TRACKS } from '@/lib/clockless-radio';

export function AmbientMusicPlayer({ className }: { className?: string }) {
  return <ClocklessRadioPlayer className={className} />;
}

function ClocklessRadioPlayer({ className }: { className?: string }) {
  const radio = useClocklessRadio();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "h-8 w-8 sm:h-9 sm:w-9 relative shrink-0",
          radio.isPlaying && "text-primary"
        )}
        title="CMPSBL Radio"
      >
        <Radio className={cn(
          "w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform",
          radio.isPlaying && "animate-pulse"
        )} />
        {radio.isPlaying && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-ping" />
        )}
      </Button>
      
      {createPortal(
        <AnimatePresence>
          {isExpanded && (
            <>
              <div className="fixed inset-0 z-[9998]" onClick={() => setIsExpanded(false)} />
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={cn(
                  "fixed z-[10000] inset-4 m-auto",
                  "sm:inset-auto sm:top-12 sm:right-4",
                  "w-80 max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto",
                  "p-4 rounded-xl",
                  "bg-card backdrop-blur-xl border border-border/50",
                  "shadow-xl shadow-black/20"
                )}
              >
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    "bg-gradient-to-br from-primary/20 to-accent/20",
                    "border border-primary/30"
                  )}>
                    <Radio className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold tracking-wide">CLOCKLESS RADIO</h4>
                    <p className="text-[10px] text-muted-foreground">
                      {radio.isDJSpeaking ? 'AI DJ Live' : radio.isPlaying ? 'Now Playing' : 'Offline'}
                    </p>
                  </div>
                </div>

                {/* DJ Interjection */}
                <AnimatePresence>
                  {radio.djContent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3 p-3 rounded-lg bg-primary/10 border border-primary/20"
                    >
                      <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-1">
                        {radio.djContent.type === 'call_in' ? `📞 ${radio.djContent.caller}` : '🎙 AI DJ'}
                      </p>
                      <p className="text-xs text-foreground/80 italic leading-relaxed">
                        "{radio.djContent.text}"
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Current Track Display */}
                {radio.currentTrack && (
                  <div className="mb-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                    <p className="text-xs font-medium text-primary truncate">{radio.currentTrack.title}</p>
                    <p className="text-[9px] text-muted-foreground">Clockless Radio • CMPSBL OS</p>
                  </div>
                )}

                {/* Track List */}
                <div className="space-y-1 mb-4 max-h-[240px] overflow-y-auto pr-1">
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
                        "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                        radio.currentTrack?.id === track.id ? "bg-primary/20" : "bg-muted/30"
                      )}>
                        {radio.currentTrack?.id === track.id && radio.isPlaying ? (
                          <div className="flex items-end gap-0.5 h-3">
                            {[1,2,3].map(i => (
                              <div key={i} className="w-0.5 bg-primary rounded-full animate-pulse" style={{
                                height: `${40 + Math.random() * 60}%`,
                                animationDelay: `${i * 0.15}s`,
                              }} />
                            ))}
                          </div>
                        ) : (
                          <Play className="w-2.5 h-2.5 text-muted-foreground" />
                        )}
                      </div>
                      <p className={cn("text-xs truncate", radio.currentTrack?.id === track.id && "text-primary font-medium")}>{track.title}</p>
                    </div>
                  ))}
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={radio.toggle}
                    className="h-10 w-10 rounded-full"
                  >
                    {radio.isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={radio.skip}
                    className="h-8 w-8"
                    disabled={!radio.isPlaying}
                  >
                    <SkipForward className="w-4 h-4" />
                  </Button>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-3">
                  <VolumeX className="w-4 h-4 text-muted-foreground" />
                  <Slider
                    value={[radio.volume * 100]}
                    max={100}
                    step={1}
                    onValueChange={([v]) => radio.setVolume(v / 100)}
                    className="flex-1"
                  />
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export const ambientMusicStyles = `
@keyframes visualizer {
  0%, 100% { transform: scaleY(0.3); }
  50% { transform: scaleY(1); }
}
`;
