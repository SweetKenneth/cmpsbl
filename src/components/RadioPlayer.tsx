/**
 * CMPSBL Radio Player — Loads daily broadcast from storage
 * No live API calls, no regeneration on play
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Radio, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

interface BroadcastInfo {
  broadcast_date: string;
  audio_url: string;
  status: string;
}

export function RadioPlayer({ className }: { className?: string }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [broadcast, setBroadcast] = useState<BroadcastInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch latest broadcast info
  useEffect(() => {
    async function fetchBroadcast() {
      const { data } = await (supabase as any)
        .from('radio_broadcasts')
        .select('broadcast_date, audio_url, status')
        .eq('status', 'complete')
        .order('broadcast_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (data?.audio_url) {
        setBroadcast(data as BroadcastInfo);
      }
      setIsLoading(false);
    }
    fetchBroadcast();
  }, []);

  // Wire up Media Session action handlers so lock screen / Control Center controls work.
  // This also tells iOS Safari to keep the audio session alive in background.
  const setupMediaSession = useCallback(() => {
    if (!('mediaSession' in navigator) || !audioRef.current) return;
    const audio = audioRef.current;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'CMPSBL Radio — Daily Broadcast',
      artist: 'CMPSBL Substrate',
      album: broadcast ? `Broadcast ${broadcast.broadcast_date}` : 'CMPSBL Radio',
      artwork: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      ],
    });

    navigator.mediaSession.setActionHandler('play', () => {
      audio.play();
      setIsPlaying(true);
      navigator.mediaSession.playbackState = 'playing';
    });
    navigator.mediaSession.setActionHandler('pause', () => {
      audio.pause();
      setIsPlaying(false);
      navigator.mediaSession.playbackState = 'paused';
    });
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime != null) {
        audio.currentTime = details.seekTime;
        setProgress(details.seekTime);
      }
    });
    navigator.mediaSession.setActionHandler('seekbackward', () => {
      audio.currentTime = Math.max(audio.currentTime - 10, 0);
    });
    navigator.mediaSession.setActionHandler('seekforward', () => {
      audio.currentTime = Math.min(audio.currentTime + 10, audio.duration || 0);
    });
    navigator.mediaSession.setActionHandler('stop', () => {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
      navigator.mediaSession.playbackState = 'none';
    });
  }, [broadcast]);

  // Keep Media Session position state in sync so the lock screen progress bar is accurate
  useEffect(() => {
    if (!('mediaSession' in navigator) || !audioRef.current || !isPlaying) return;
    const audio = audioRef.current;
    const sync = () => {
      if (!isNaN(audio.duration)) {
        navigator.mediaSession.setPositionState({
          duration: audio.duration,
          playbackRate: audio.playbackRate,
          position: audio.currentTime,
        });
      }
    };
    const id = setInterval(sync, 1000);
    sync();
    return () => clearInterval(id);
  }, [isPlaying]);

  const togglePlay = useCallback(() => {
    if (!broadcast?.audio_url) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(broadcast.audio_url);
      audioRef.current.volume = volume;
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration ?? 0);
      });
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setProgress(0);
        if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
      });
      setupMediaSession();
    }

    if (isPlaying) {
      audioRef.current.pause();
      if (progressInterval.current) clearInterval(progressInterval.current);
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'paused';
    } else {
      audioRef.current.play();
      progressInterval.current = setInterval(() => {
        if (audioRef.current) setProgress(audioRef.current.currentTime);
      }, 500);
      if ('mediaSession' in navigator) navigator.mediaSession.playbackState = 'playing';
    }
    setIsPlaying(!isPlaying);
  }, [broadcast, isPlaying, volume, setupMediaSession]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const today = new Date().toLocaleDateString('en-US', { 
    month: 'short', day: 'numeric', year: 'numeric' 
  });

  return (
    <div className={cn("relative", className)}>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "h-8 w-8 sm:h-9 sm:w-9 relative shrink-0",
          isPlaying && "text-primary"
        )}
        aria-label="CMPSBL Radio"
      >
        <Radio className={cn(
          "w-3.5 h-3.5 sm:w-4 sm:h-4",
          isPlaying && "animate-pulse"
        )} />
        {isPlaying && (
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-primary rounded-full animate-ping" />
        )}
      </Button>

      <AnimatePresence>
        {isExpanded && (
          <>
            <div className="fixed inset-0 z-[9998]" onClick={() => setIsExpanded(false)} />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className={cn(
                "fixed z-[10000]",
                "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
                "sm:left-auto sm:top-12 sm:right-4 sm:translate-x-0 sm:translate-y-0",
                "w-72 p-4 rounded-xl",
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
                  <h4 className="text-sm font-bold tracking-wide">CMPSBL RADIO</h4>
                  <p className="text-[10px] text-muted-foreground">
                    {isPlaying ? 'Broadcasting' : 'Daily Broadcast'}
                  </p>
                </div>
              </div>

              {/* Broadcast date */}
              <div className="mb-3 p-2 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {broadcast ? `Broadcast: ${broadcast.broadcast_date}` : today}
                </p>
                <p className="text-xs font-medium text-foreground/80">
                  {isLoading ? 'Loading...' : broadcast ? '8-Segment Analyst Report' : 'No broadcast available'}
                </p>
              </div>

              {/* Progress bar */}
              {duration > 0 && (
                <div className="mb-3">
                  <div className="w-full h-1 rounded-full bg-muted/50 overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${(progress / duration) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-[9px] text-muted-foreground">{formatTime(progress)}</span>
                    <span className="text-[9px] text-muted-foreground">{formatTime(duration)}</span>
                  </div>
                </div>
              )}

              {/* Play button */}
              <div className="flex items-center justify-center mb-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={togglePlay}
                  disabled={!broadcast || isLoading}
                  className="h-10 w-10 rounded-full"
                  aria-label={isPlaying ? "Pause radio" : "Play radio"}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                <VolumeX className="w-3.5 h-3.5 text-muted-foreground" />
                <Slider
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={([v]) => setVolume(v / 100)}
                  className="flex-1"
                />
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
