/**
 * XCTBL Video Modal
 * Drawer/Dialog video player — after video ends, shows "Enter Space" button.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { X, RefreshCcw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import xctblVideo from '@/assets/xctbl-preview.mp4';

interface XctblModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function XctblModal({ isOpen, onClose }: XctblModalProps) {
  const [phase, setPhase] = useState<'playing' | 'ended'>('playing');
  const videoRef = useRef<HTMLVideoElement>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen) {
      setPhase('playing');
    }
  }, [isOpen]);

  useEffect(() => {
    if (phase === 'playing' && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [phase]);

  const handleVideoEnd = useCallback(() => {
    setPhase('ended');
  }, []);

  const handleReplay = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setPhase('playing');
    }
  }, []);

  const handleEnterSpace = useCallback(() => {
    window.open('https://XCTBL.com', '_blank', 'noopener,noreferrer');
  }, []);

  if (!isOpen) return null;

  const content = (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 text-white/60 hover:text-white hover:bg-muted/70 transition-colors"
      >
        <X className="w-6 h-6" />
      </Button>

      <div className={cn("relative w-full", isMobile ? "max-h-[85dvh] overflow-y-auto" : "max-h-[90dvh] overflow-y-auto")}>
        <div className={cn("w-full p-4 sm:p-8", isMobile && "pb-[calc(1rem+env(safe-area-inset-bottom))]")}>
          <div className="relative w-full max-w-5xl mx-auto">
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-xl sm:text-2xl md:text-4xl font-light tracking-wider text-white">
                XCTBL
              </h2>
            </div>

            <div className={cn("relative", isMobile ? "mx-auto w-full max-w-[min(520px,100%)]" : "w-full")}>
              <div className="relative aspect-video">
                <video
                  ref={videoRef}
                  src={xctblVideo}
                  className="w-full h-full object-contain rounded-lg"
                  playsInline
                  onEnded={handleVideoEnd}
                  controls={phase === 'playing'}
                />

                {phase === 'ended' && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 sm:gap-6 bg-black/60 backdrop-blur-sm rounded-lg p-4">
                    <h3 className="text-lg sm:text-2xl md:text-3xl font-light tracking-wider text-white text-center">
                      Ready to explore?
                    </h3>
                    <div className="flex flex-wrap gap-3 justify-center">
                      <Button
                        onClick={handleReplay}
                        variant="outline"
                        className="gap-2 border-border/40 bg-muted/50 text-white hover:bg-muted/70 hover:text-white"
                      >
                        <RefreshCcw className="w-4 h-4" />
                        Replay
                      </Button>
                      <Button
                        onClick={handleEnterSpace}
                        className="gap-2 bg-gradient-to-r from-neon-magenta to-neon-purple text-white hover:from-neon-magenta hover:to-neon-purple"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Enter Space
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={handleOpenChange}>
        <DrawerContent className="z-[100000] bg-black/95 border-border/30">
          <div className="relative px-2">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="z-[100000] bg-black/95 border-border/30 p-0 overflow-hidden max-w-5xl">
        <div className="relative">{content}</div>
      </DialogContent>
    </Dialog>
  );
}
