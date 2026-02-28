/**
 * useSwipeGesture — Detect horizontal swipe gestures for mobile sidebar control.
 */

import { useEffect, useRef } from "react";

interface SwipeOptions {
  onSwipeRight?: () => void;
  onSwipeLeft?: () => void;
  threshold?: number;       // min px to qualify as swipe
  edgeWidth?: number;       // px from left edge for swipe-right trigger zone
  enabled?: boolean;
}

export function useSwipeGesture({
  onSwipeRight,
  onSwipeLeft,
  threshold = 60,
  edgeWidth = 30,
  enabled = true,
}: SwipeOptions) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const touchStartedInEdge = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStart.current = { x: touch.clientX, y: touch.clientY };
      touchStartedInEdge.current = touch.clientX <= edgeWidth;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = touch.clientY - touchStart.current.y;

      // Only fire if horizontal movement dominates vertical
      if (Math.abs(dx) > threshold && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx > 0 && touchStartedInEdge.current && onSwipeRight) {
          onSwipeRight();
        } else if (dx < 0 && onSwipeLeft) {
          onSwipeLeft();
        }
      }

      touchStart.current = null;
      touchStartedInEdge.current = false;
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, onSwipeRight, onSwipeLeft, threshold, edgeWidth]);
}
