import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { subscribe, removeToast } from "./SmartToastStore";
import type { SmartToast } from "./SmartToastStore";
import { getLastInteractionPoint } from "@/lib/ui/lastInteraction";
import { clamp } from "@/lib/ui/viewport";

function getDecodeAnchorRect() {
  const el = document.getElementById("decode-float-anchor");
  if (!el) return null;
  return el.getBoundingClientRect();
}

function computePosition(toast: SmartToast) {
  const pad = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  if (toast.anchor === "center") {
    return { left: vw / 2, top: vh * 0.78, transform: "translate(-50%, 0)" };
  }

  if (toast.anchor === "interaction") {
    const p = getLastInteractionPoint();
    if (p) {
      return { left: clamp(p.x, pad, vw - 340), top: clamp(p.y - 60, pad, vh - 80), transform: "translate(0, 0)" };
    }
    return { left: vw / 2, top: vh * 0.78, transform: "translate(-50%, 0)" };
  }

  // default: decode anchor
  const r = getDecodeAnchorRect();
  if (r) {
    const left = clamp(r.left + r.width / 2 - 160, pad, vw - pad - 320);
    const top = clamp(r.top - 12, pad, vh - pad);
    return { left, top, transform: "translate(0, -100%)" };
  }

  return { left: vw / 2, top: vh * 0.78, transform: "translate(-50%, 0)" };
}

const variantColors: Record<string, string> = {
  info: "hsl(210 60% 45%)",
  success: "hsl(142 60% 45%)",
  warning: "hsl(38 90% 50%)",
  error: "hsl(0 70% 50%)",
};

export default function SmartToastRenderer() {
  const [toasts, setToasts] = useState<SmartToast[]>([]);

  useEffect(() => {
    return subscribe(setToasts);
  }, []);

  if (toasts.length === 0) return null;

  return createPortal(
    <div
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 10000 }}
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((t, i) => {
        const pos = computePosition(t);
        const accent = variantColors[t.variant || "info"];

        return (
          <div
            key={t.id}
            style={{
              position: "fixed",
              left: pos.left,
              top: pos.top - i * 68,
              transform: pos.transform,
              width: "min(320px, calc(100vw - 24px))",
              pointerEvents: "auto",
              animation: "smartToastIn 180ms ease-out",
            }}
          >
            <div
              style={{
                borderRadius: 14,
                padding: "12px 14px",
                border: "1px solid hsl(0 0% 100% / 0.14)",
                borderLeft: `3px solid ${accent}`,
                background: "hsl(0 0% 5% / 0.88)",
                backdropFilter: "blur(12px)",
                boxShadow: "0 10px 30px hsl(0 0% 0% / 0.35)",
                display: "flex",
                gap: 10,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ fontSize: 13, lineHeight: 1.3, color: "hsl(0 0% 100% / 0.92)", flex: 1 }}>
                {t.message}
              </div>
              {t.ctaLabel && t.onCtaClick && (
                <button
                  type="button"
                  onClick={() => { try { t.onCtaClick?.(); } finally { removeToast(t.id); } }}
                  style={{
                    border: "1px solid hsl(0 0% 100% / 0.18)",
                    background: "hsl(0 0% 100% / 0.10)",
                    color: "hsl(0 0% 100% / 0.92)",
                    borderRadius: 999,
                    padding: "6px 12px",
                    fontSize: 12,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {t.ctaLabel}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
