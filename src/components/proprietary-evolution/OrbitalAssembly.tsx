/**
 * OrbitalAssembly — Canvas-based visualization for Ingest Phase
 * 
 * States:
 *  idle     — Dormant: dim scattered file fragments drift slowly
 *  scanning — Files orbit a growing gravitational center, pulled inward one by one
 *  complete — All fragments have collapsed into a glowing Ψ₄₁ node with capability rings
 */

import { useRef, useEffect, useCallback } from 'react';

export type AssemblyState = 'idle' | 'scanning' | 'complete';

interface OrbitalAssemblyProps {
  state: AssemblyState;
  fileCount: number;
  capabilities?: string[];
  nodeName?: string;
}

/* ═══ CONSTANTS ═══ */
const DPR = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
const W = 360;
const H = 280;
const CX = W / 2;
const CY = H / 2;

/* ═══ COLORS ═══ */
const COL_FRAGMENT = [140, 180, 220]; // soft blue-grey
const COL_CORE = [120, 200, 255];    // bright cyan
const COL_STAR = [200, 210, 230];    // faint stars
const COL_CAPABILITY_RING = [
  [120, 200, 255],  // cyan
  [180, 140, 255],  // violet
  [255, 180, 100],  // amber
  [100, 255, 180],  // green
];

interface Fragment {
  angle: number;
  radius: number;
  targetRadius: number;
  size: number;
  speed: number;
  opacity: number;
  absorbed: boolean;
  absorbTime: number;
  char: string;
}

interface BgStar {
  x: number;
  y: number;
  size: number;
  twinkleOffset: number;
  speed: number;
}

const FILE_CHARS = ['{', '}', '(', ')', '<', '>', '/', '=', ';', ':', '#', '@', '%', '&', '*', '+', '~', '^'];

export function OrbitalAssembly({ state, fileCount, capabilities = [], nodeName }: OrbitalAssemblyProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fragmentsRef = useRef<Fragment[]>([]);
  const starsRef = useRef<BgStar[]>([]);
  const stateRef = useRef(state);
  const scanStartRef = useRef(0);
  const coreScaleRef = useRef(0);
  const frameRef = useRef(0);

  stateRef.current = state;

  // Initialize fragments when fileCount changes
  useEffect(() => {
    const count = Math.max(8, Math.min(fileCount * 2, 40));
    const frags: Fragment[] = [];
    for (let i = 0; i < count; i++) {
      frags.push({
        angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5,
        radius: 80 + Math.random() * 60,
        targetRadius: 80 + Math.random() * 60,
        size: 2 + Math.random() * 3,
        speed: 0.002 + Math.random() * 0.004,
        opacity: 0.3 + Math.random() * 0.5,
        absorbed: false,
        absorbTime: 0,
        char: FILE_CHARS[Math.floor(Math.random() * FILE_CHARS.length)],
      });
    }
    fragmentsRef.current = frags;
  }, [fileCount]);

  // Initialize background stars
  useEffect(() => {
    const stars: BgStar[] = [];
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        size: 0.3 + Math.random() * 1,
        twinkleOffset: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random() * 1.5,
      });
    }
    starsRef.current = stars;
  }, []);

  // Mark scan start
  useEffect(() => {
    if (state === 'scanning') {
      scanStartRef.current = performance.now();
    }
  }, [state]);

  const draw = useCallback((t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentState = stateRef.current;
    const frags = fragmentsRef.current;
    const stars = starsRef.current;

    ctx.clearRect(0, 0, W * DPR, H * DPR);
    ctx.save();
    ctx.scale(DPR, DPR);

    // ── Background stars ──
    for (const star of stars) {
      const twinkle = 0.2 + 0.8 * Math.abs(Math.sin(t * 0.001 * star.speed + star.twinkleOffset));
      ctx.fillStyle = `rgba(${COL_STAR[0]}, ${COL_STAR[1]}, ${COL_STAR[2]}, ${twinkle * 0.4})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Central gravitational core ──
    let coreTargetScale = 0;
    if (currentState === 'idle') coreTargetScale = 0.15;
    else if (currentState === 'scanning') coreTargetScale = 0.6;
    else coreTargetScale = 1;

    coreScaleRef.current += (coreTargetScale - coreScaleRef.current) * 0.03;
    const cs = coreScaleRef.current;

    if (cs > 0.05) {
      // Core glow layers
      const coreRadius = 8 + cs * 20;
      const pulse = 1 + 0.08 * Math.sin(t * 0.003);

      // Outer glow
      const glow = ctx.createRadialGradient(CX, CY, 0, CX, CY, coreRadius * 3 * pulse);
      glow.addColorStop(0, `rgba(${COL_CORE[0]}, ${COL_CORE[1]}, ${COL_CORE[2]}, ${0.15 * cs})`);
      glow.addColorStop(0.5, `rgba(${COL_CORE[0]}, ${COL_CORE[1]}, ${COL_CORE[2]}, ${0.05 * cs})`);
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(CX, CY, coreRadius * 3 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Inner bright core
      const inner = ctx.createRadialGradient(CX, CY, 0, CX, CY, coreRadius * pulse);
      inner.addColorStop(0, `rgba(255, 255, 255, ${0.9 * cs})`);
      inner.addColorStop(0.3, `rgba(${COL_CORE[0]}, ${COL_CORE[1]}, ${COL_CORE[2]}, ${0.8 * cs})`);
      inner.addColorStop(1, `rgba(${COL_CORE[0]}, ${COL_CORE[1]}, ${COL_CORE[2]}, 0)`);
      ctx.fillStyle = inner;
      ctx.beginPath();
      ctx.arc(CX, CY, coreRadius * pulse, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Fragment orbiting / absorption ──
    const scanElapsed = currentState !== 'idle' ? (t - scanStartRef.current) : 0;
    const absorbInterval = Math.max(350, 4000 / Math.max(frags.length, 1)); // stagger absorptions — slower for cinematic feel

    for (let i = 0; i < frags.length; i++) {
      const frag = frags[i];

      if (currentState === 'scanning' && !frag.absorbed) {
        // Check if this fragment's turn to be absorbed
        const absorbAt = absorbInterval * i;
        if (scanElapsed > absorbAt) {
          frag.absorbed = true;
          frag.absorbTime = t;
        } else {
          // Accelerate orbit as scan progresses
          frag.speed = Math.min(frag.speed * 1.0005, 0.02);
          // Pull inward slightly
          frag.targetRadius = Math.max(30, frag.targetRadius * 0.998);
        }
      }

      if (currentState === 'complete' && !frag.absorbed) {
        frag.absorbed = true;
        frag.absorbTime = t;
      }

      frag.angle += frag.speed;
      frag.radius += (frag.targetRadius - frag.radius) * 0.05;

      let drawRadius = frag.radius;
      let drawOpacity = frag.opacity;
      let drawSize = frag.size;

      if (frag.absorbed) {
        const since = (t - frag.absorbTime) / 1200; // 0→1 over 1.2s — slow cinematic spiral
        const progress = Math.min(1, since);
        const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        drawRadius = frag.radius * (1 - ease);
        drawOpacity = frag.opacity * (1 - ease * 0.8);
        drawSize = frag.size * (1 + ease * 0.5); // slight grow before vanish

        if (progress >= 1) {
          // Burst particle at core on absorption
          drawOpacity = 0;
        }
      }

      if (drawOpacity < 0.01) continue;

      const fx = CX + Math.cos(frag.angle) * drawRadius;
      const fy = CY + Math.sin(frag.angle) * drawRadius;

      // Fragment glow
      ctx.fillStyle = `rgba(${COL_FRAGMENT[0]}, ${COL_FRAGMENT[1]}, ${COL_FRAGMENT[2]}, ${drawOpacity * 0.3})`;
      ctx.beginPath();
      ctx.arc(fx, fy, drawSize * 2, 0, Math.PI * 2);
      ctx.fill();

      // Fragment character
      ctx.font = `${8 + drawSize}px monospace`;
      ctx.fillStyle = `rgba(${COL_FRAGMENT[0]}, ${COL_FRAGMENT[1]}, ${COL_FRAGMENT[2]}, ${drawOpacity})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(frag.char, fx, fy);
    }

    // ── Absorption flash particles ──
    if (currentState === 'scanning' || currentState === 'complete') {
      for (const frag of frags) {
        if (!frag.absorbed) continue;
        const since = (t - frag.absorbTime);
        if (since > 0 && since < 800) {
          const p = since / 800;
          const burstR = 5 + p * 20;
          const burstA = (1 - p) * 0.6;
          ctx.fillStyle = `rgba(${COL_CORE[0]}, ${COL_CORE[1]}, ${COL_CORE[2]}, ${burstA})`;
          ctx.beginPath();
          ctx.arc(CX, CY, burstR, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // ── Capability rings (on complete) ──
    if (currentState === 'complete' && cs > 0.8) {
      const ringFade = Math.min(1, (cs - 0.8) * 5);
      const capCount = Math.min(capabilities.length, 4);
      for (let i = 0; i < capCount; i++) {
        const ringR = 35 + i * 14;
        const rotation = t * (0.0003 + i * 0.0002) * (i % 2 === 0 ? 1 : -1);
        const col = COL_CAPABILITY_RING[i % COL_CAPABILITY_RING.length];

        ctx.strokeStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${0.3 * ringFade})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(CX, CY, ringR, rotation, rotation + Math.PI * 1.5);
        ctx.stroke();

        // Small dot at ring tip
        const dotX = CX + Math.cos(rotation + Math.PI * 1.5) * ringR;
        const dotY = CY + Math.sin(rotation + Math.PI * 1.5) * ringR;
        ctx.fillStyle = `rgba(${col[0]}, ${col[1]}, ${col[2]}, ${0.7 * ringFade})`;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Ψ₄₁ label
      if (nodeName) {
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * ringFade})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`Ψ₄₁ ${nodeName}`, CX, CY + 45);
      }
    }

    ctx.restore();
    frameRef.current = requestAnimationFrame(draw);
  }, [capabilities, nodeName]);

  // Animation loop
  useEffect(() => {
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [draw]);

  return (
    <div className="flex items-center justify-center canvas-container-glow">
      <canvas
        ref={canvasRef}
        width={W * DPR}
        height={H * DPR}
        style={{ width: '100%', maxWidth: W, height: 'auto', aspectRatio: `${W}/${H}` }}
        className="rounded-xl"
      />
    </div>
  );
}
