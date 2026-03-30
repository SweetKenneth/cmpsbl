/**
 * FoundryDemoVideo — Full-bleed video player for the Memory Stream demo
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
    <div className="relative w-full">
      <video
        ref={videoRef}
        src="/videos/memory-stream-demo.mp4"
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto block"
      />
      <button
        onClick={toggleMute}
        className="absolute bottom-4 right-4 z-10 flex items-center justify-center w-14 h-14 rounded-full bg-background/80 backdrop-blur-md border border-border/40 text-foreground/90 hover:text-foreground hover:bg-background transition-all duration-200 shadow-xl"
        aria-label={muted ? 'Unmute video' : 'Mute video'}
      >
        {muted ? <VolumeX className="w-7 h-7" /> : <Volume2 className="w-7 h-7" />}
      </button>
    </div>
  );
}
