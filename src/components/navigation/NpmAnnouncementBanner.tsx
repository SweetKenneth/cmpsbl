/**
 * Top Marquee — Cycles the Top 20 Launch Layers in random order.
 *
 * Each tick shows: layer name · CJPI score · short description (no truncation).
 * Order is shuffled once per mount (Fisher–Yates) so each session sees a
 * different ordering, while the marquee itself loops seamlessly via duplication.
 *
 * Deferred render: delays mount so hero content remains the LCP element
 * instead of this small decorative banner text.
 *
 * Speed: 2× faster than the prior quote marquee. The duration is computed
 * from the rendered character count so longer/shorter copy maintains a
 * consistent reading pace.
 */

import { useMemo, useState, useEffect } from "react";
import { LAYERS, type LaunchLayer } from "@/components/ascension-v2/V2LaunchLayers";

function shuffle<T>(arr: ReadonlyArray<T>): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function NpmAnnouncementBanner() {
  const [ready, setReady] = useState(false);

  // Defer render until after hero has painted — prevents this banner
  // from being identified as the LCP element by Lighthouse.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setReady(true));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  // Shuffle once per mount so each visit shows a fresh ordering.
  const shuffled = useMemo<LaunchLayer[]>(() => shuffle(LAYERS), []);
  const items = useMemo(() => [...shuffled, ...shuffled], [shuffled]);

  // Duration tuned for 2× the previous reading pace.
  // Prior banner: ~30s for ~10 short quotes (~30 chars each ≈ 300 chars).
  // New content: 20 layers × ~180 chars ≈ 3,600 chars → would be ~360s at the
  // old per-char rate. Halved (2× faster) and capped for legibility:
  const totalChars = useMemo(
    () => shuffled.reduce((sum, l) => sum + l.name.length + l.description.length + 14, 0),
    [shuffled],
  );
  const durationSec = Math.max(60, Math.min(180, Math.round((totalChars / 300) * 30 * 0.5)));

  if (!ready) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[10001] overflow-hidden select-none"
      style={{
        background:
          "linear-gradient(135deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)), hsl(var(--neon-magenta)))",
      }}
    >
      <div
        className="flex whitespace-nowrap py-1.5 will-change-transform"
        style={{ animation: `marquee ${durationSec}s linear infinite` }}
      >
        {items.map((layer, i) => (
          <span
            key={`${layer.rank}-${i}`}
            className="inline-flex items-baseline gap-2 mx-8 sm:mx-12 text-xs sm:text-sm text-white shrink-0"
          >
            <span className="font-bold tracking-tight">{layer.name}</span>
            <span className="font-mono font-semibold text-white/95 tabular-nums px-1.5 py-0.5 rounded bg-white/15 text-[10px] sm:text-xs">
              CJPI {layer.cjpi}
            </span>
            <span className="text-white/85 font-medium">— {layer.description}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
