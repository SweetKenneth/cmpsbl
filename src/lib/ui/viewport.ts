export type Point = { x: number; y: number };

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function getViewport() {
  return {
    w: window.innerWidth,
    h: window.innerHeight,
    scrollX: window.scrollX || 0,
    scrollY: window.scrollY || 0,
  };
}

export function normalizePoint(p: Point) {
  const { w, h } = getViewport();
  const pad = 12;
  return {
    x: clamp(p.x, pad, w - pad),
    y: clamp(p.y, pad, h - pad),
  };
}
