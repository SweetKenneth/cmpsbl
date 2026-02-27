/**
 * PackDomainRow — Horizontal snap-scroll row of packs within a strategic domain.
 * Desktop scroll arrows, mobile swipe. Polished mobile-first.
 */
import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PackActivationCard } from './PackActivationCard';
import type { ArtifactPack } from '@/lib/quarry/types';
import type { SlotState } from '@/hooks/useArtifactSlots';
import { motion } from 'framer-motion';

interface PackDomainRowProps {
  domainName: string;
  thesis: string;
  packs: ArtifactPack[];
  slotState: SlotState;
  onActivate: (packId: string) => Promise<void>;
  onDeactivate: (packId: string) => Promise<void>;
  onSlotPressure: (packName: string) => void;
  onViewDetails: (pack: ArtifactPack) => void;
  index: number;
}

export function PackDomainRow({
  domainName,
  thesis,
  packs,
  slotState,
  onActivate,
  onDeactivate,
  onSlotPressure,
  onViewDetails,
  index,
}: PackDomainRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      ro.disconnect();
    };
  }, [packs]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.75;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  const activeCount = packs.filter(p => slotState.isPackActive(p.id)).length;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.05 }}
      className="space-y-3"
    >
      {/* Domain header */}
      <div className="px-4 sm:px-0">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-base sm:text-lg font-bold tracking-tight">{domainName}</h2>
          {activeCount > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {activeCount} active
            </span>
          )}
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
          {thesis}
        </p>
      </div>

      {/* Scroll container */}
      <div className="relative group">
        {/* Left arrow */}
        {canScrollLeft && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border-border/60 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}

        {/* Right arrow */}
        {canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/90 backdrop-blur-sm border-border/60 shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}

        {/* Scroll track */}
        <div
          ref={scrollRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2 px-4 sm:px-0"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {packs.map(pack => (
            <div key={pack.id} className="snap-start shrink-0 w-[280px] sm:w-[300px] md:w-[320px]">
              <PackActivationCard
                pack={pack}
                slotState={slotState}
                onActivate={onActivate}
                onDeactivate={onDeactivate}
                onSlotPressure={onSlotPressure}
                onViewDetails={onViewDetails}
              />
            </div>
          ))}
        </div>

        {/* Fade edges */}
        {canScrollLeft && (
          <div className="absolute left-0 top-0 bottom-2 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none hidden sm:block" />
        )}
        {canScrollRight && (
          <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none hidden sm:block" />
        )}
      </div>
    </motion.section>
  );
}
