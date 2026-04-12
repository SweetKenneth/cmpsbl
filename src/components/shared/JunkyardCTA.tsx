/**
 * JunkyardCTA — Reusable inline CTA banner for the Junkyard
 * Used in Store, Showroom, and Marketplace to surface free items.
 */
import { Link } from 'react-router-dom';
import { Archive, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function JunkyardCTA() {
  return (
    <section className="border-t border-border/50">
      <div className="container mx-auto px-3 sm:px-4 py-8 sm:py-10">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-4 sm:gap-6 rounded-xl border border-neon-amber/15 bg-gradient-to-r from-neon-amber/5 via-transparent to-neon-amber/5 p-5 sm:p-6">
          <div className="w-12 h-12 rounded-xl border border-neon-amber/20 bg-neon-amber/10 flex items-center justify-center shrink-0">
            <Archive className="w-6 h-6 text-neon-amber" />
          </div>
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-bold text-sm sm:text-base mb-1">Search through discarded software — gems sometimes surface.</h3>
            <p className="text-xs sm:text-sm text-muted-foreground/70">
              Raw discoveries, broken tech, and salvageable parts. Everything in the Junkyard is free to take.
            </p>
          </div>
          <Button asChild variant="outline" className="gap-2 border-neon-amber/30 text-neon-amber hover:bg-neon-amber/10 shrink-0">
            <Link to="/junkyard">
              Browse Junkyard
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
