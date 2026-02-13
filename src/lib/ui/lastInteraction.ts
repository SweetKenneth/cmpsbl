import type { Point } from "./viewport";
import { normalizePoint } from "./viewport";

let lastPoint: Point = { x: 0, y: 0 };
let hasPoint = false;

export function setLastInteractionPoint(p: Point) {
  lastPoint = normalizePoint(p);
  hasPoint = true;
}

export function getLastInteractionPoint(): Point | null {
  if (!hasPoint) return null;
  return lastPoint;
}

export function installLastInteractionTracking() {
  if (typeof window === "undefined") return;

  const onPointerDown = (e: PointerEvent) => {
    setLastInteractionPoint({ x: e.clientX, y: e.clientY });
  };

  const onKeyDown = () => {
    setLastInteractionPoint({ x: window.innerWidth / 2, y: window.innerHeight * 0.82 });
  };

  window.addEventListener("pointerdown", onPointerDown, { passive: true });
  window.addEventListener("keydown", onKeyDown);

  return () => {
    window.removeEventListener("pointerdown", onPointerDown);
    window.removeEventListener("keydown", onKeyDown);
  };
}
