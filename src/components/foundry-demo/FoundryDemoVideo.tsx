/**
 * FoundryDemoVideo — Standalone video player for the Memory Stream demo
 * Positioned at the top of the foundry page, above the hero.
 */
import { useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export function FoundryDemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  }, []);

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 sm:px-6 pt-20 sm:pt-24 pb-4">
      <div className="relative rounded-2xl overflow-hidden border border-border/20 shadow-2xl shadow-primary/5">
        <video
          ref={videoRef}
          src="/videos/memory-stream-demo.mov"
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-auto block"
        />
        <button
          onClick={toggleMute}
          className="absolute bottom-3 right-3 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-background/70 backdrop-blur-sm border border-border/30 text-foreground/80 hover:text-foreground hover:bg-background/90 transition-all duration-200 shadow-lg"
          aria-label={muted ? 'Unmute video' : 'Mute video'}
        >
          {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
        <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-foreground/5 pointer-events-none" />
      </div>
    </div>
  );
}
