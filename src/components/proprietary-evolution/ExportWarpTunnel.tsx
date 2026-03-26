/**
 * ExportWarpTunnel — Canvas-based warp tunnel visualization for Export Phase
 *
 * States:
 *  idle      — Capabilities float as glowing orbs in calm formation
 *  launching — Orbs streak forward through a hyperspace tunnel, light trails converge
 *  complete  — Download portal resolves, calm glow
 */

import { useRef, useEffect, useCallback } from 'react';

export type WarpState = 'idle' | 'launching' | 'complete';

interface ExportWarpTunnelProps {
  state: WarpState;
  capabilityCount: number;
  exportedCount?: number;
}

const DPR = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;
const W = 360;
const H = 240;
const CX = W / 2;
const CY = H / 2;

/* Colors */
const COL_ORB = [
  [120, 200, 255],  // cyan
  [180, 140, 255],  // violet
  [255, 180, 100],  // amber
  [100, 255, 180],  // green
  [255, 120, 180],  // pink
];

interface WarpStar {
  x: number;
  y: number;
  z: number;
  prevX: number;
  prevY: number;
}

interface CapOrb {
  angle: number;
  radius: number;
  size: number;
  color: number[];
  speed: number;
  zOffset: number; // simulated depth
  streakLength: number;
  absorbed: boolean;
  absorbTime: number;
}

export function ExportWarpTunnel({ state, capabilityCount, exportedCount = 0 }: ExportWarpTunnelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<WarpStar[]>([]);
  const orbsRef = useRef<CapOrb[]>([]);
  const stateRef = useRef(state);
  const launchStartRef = useRef(0);
  const frameRef = useRef(0);
  const warpSpeedRef = useRef(0);

  stateRef.current = state;

  // Init stars
  useEffect(() => {
    const stars: WarpStar[] = [];
    for (let i = 0; i < 120; i++) {
      const x = (Math.random() - 0.5) * W * 2;
      const y = (Math.random() - 0.5) * H * 2;
      const z = Math.random() * 1000;
      stars.push({ x, y, z, prevX: 0, prevY: 0 });
    }
    starsRef.current = stars;
  }, []);

  // Init orbs
  useEffect(() => {
    const count = Math.max(3, Math.min(capabilityCount, 12));
    const orbs: CapOrb[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      orbs.push({
        angle,
        radius: 50 + Math.random() * 30,
        size: 4 + Math.random() * 3,
        color: COL_ORB[i % COL_ORB.length],
        speed: 0.003 + Math.random() * 0.005,
        zOffset: Math.random(),
        streakLength: 0,
        absorbed: false,
        absorbTime: 0,
      });
    }
    orbsRef.current = orbs;
  }, [capabilityCount]);

  // Mark launch start
  useEffect(() => {
    if (state === 'launching') {
      launchStartRef.current = performance.now();
    }
  }, [state]);

  const draw = useCallback((t: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentState = stateRef.current;
    const stars = starsRef.current;
    const orbs = orbsRef.current;

    ctx.clearRect(0, 0, W * DPR, H * DPR);
    ctx.save();
    ctx.scale(DPR, DPR);

    // ── Warp speed interpolation ──
    let targetSpeed = 0;
    if (currentState === 'idle') targetSpeed = 0.5;
    else if (currentState === 'launching') targetSpeed = 12;
    else targetSpeed = 1;
    warpSpeedRef.current += (targetSpeed - warpSpeedRef.current) * 0.012; // slower ramp for cinematic warp buildup
    const ws = warpSpeedRef.current;

    // ── Tunnel vignette (subtle radial darkening) ──
    if (ws > 2) {
      const vignetteAlpha = Math.min(0.4, (ws - 2) * 0.04);
      const vignette = ctx.createRadialGradient(CX, CY, 20, CX, CY, W * 0.7);
      vignette.addColorStop(0, 'rgba(0,0,0,0)');
      vignette.addColorStop(0.6, 'rgba(0,0,0,0)');
      vignette.addColorStop(1, `rgba(60, 40, 120, ${vignetteAlpha})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, W, H);
    }

    // ── Warp stars ──
    for (const star of stars) {
      star.prevX = (star.x / star.z) * 200 + CX;
      star.prevY = (star.y / star.z) * 200 + CY;

      star.z -= ws;
      if (star.z <= 1) {
        star.z = 1000;
        star.x = (Math.random() - 0.5) * W * 2;
        star.y = (Math.random() - 0.5) * H * 2;
        star.prevX = (star.x / star.z) * 200 + CX;
        star.prevY = (star.y / star.z) * 200 + CY;
      }

      const sx = (star.x / star.z) * 200 + CX;
      const sy = (star.y / star.z) * 200 + CY;
      const sz = Math.max(0.3, (1 - star.z / 1000) * 2);
      const sa = Math.min(1, (1 - star.z / 1000) * 1.5);

      if (ws > 2) {
        // Draw streak
        ctx.strokeStyle = `rgba(200, 210, 240, ${sa * 0.6})`;
        ctx.lineWidth = sz * 0.5;
        ctx.beginPath();
        ctx.moveTo(star.prevX, star.prevY);
        ctx.lineTo(sx, sy);
        ctx.stroke();
      } else {
        ctx.fillStyle = `rgba(200, 210, 240, ${sa * 0.5})`;
        ctx.beginPath();
        ctx.arc(sx, sy, sz, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── Central convergence point ──
    const portalPulse = 1 + 0.1 * Math.sin(t * 0.004);
    const portalR = currentState === 'complete' ? 18 * portalPulse : 6 + ws * 0.8;
    const portalAlpha = currentState === 'complete' ? 0.7 : Math.min(0.5, ws * 0.04);

    const portalGrad = ctx.createRadialGradient(CX, CY, 0, CX, CY, portalR * 2);
    portalGrad.addColorStop(0, `rgba(255, 255, 255, ${portalAlpha})`);
    portalGrad.addColorStop(0.3, `rgba(120, 200, 255, ${portalAlpha * 0.7})`);
    portalGrad.addColorStop(0.6, `rgba(180, 140, 255, ${portalAlpha * 0.3})`);
    portalGrad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = portalGrad;
    ctx.beginPath();
    ctx.arc(CX, CY, portalR * 2, 0, Math.PI * 2);
    ctx.fill();

    // ── Capability orbs ──
    const launchElapsed = currentState !== 'idle' ? (t - launchStartRef.current) : 0;

    for (let i = 0; i < orbs.length; i++) {
      const orb = orbs[i];

      if (currentState === 'launching' && !orb.absorbed) {
        const absorbAt = 600 + i * 400; // slower stagger — cinematic pacing
        if (launchElapsed > absorbAt) {
          orb.absorbed = true;
          orb.absorbTime = t;
        }
      }

      if (currentState === 'complete' && !orb.absorbed) {
        orb.absorbed = true;
        orb.absorbTime = t;
      }

      orb.angle += orb.speed * (currentState === 'launching' ? 3 : 1);

      let drawRadius = orb.radius;
      let drawAlpha = 0.8;
      let streakLen = 0;

      if (currentState === 'launching' && !orb.absorbed) {
        // Pull inward
        orb.radius = Math.max(15, orb.radius * 0.995);
        drawRadius = orb.radius;
        // Build streak
        streakLen = Math.min(40, launchElapsed * 0.05);
      }

      if (orb.absorbed) {
        const since = (t - orb.absorbTime) / 1000; // 1s absorption — slow cinematic spiral
        const p = Math.min(1, since);
        const ease = 1 - Math.pow(1 - p, 3);
        drawRadius = orb.radius * (1 - ease);
        drawAlpha = 0.8 * (1 - ease);
        streakLen = 40 * (1 - ease);
        if (p >= 1) continue;
      }

      const ox = CX + Math.cos(orb.angle) * drawRadius;
      const oy = CY + Math.sin(orb.angle) * drawRadius;
      const [cr, cg, cb] = orb.color;

      // Streak trail toward center
      if (streakLen > 0) {
        const dx = CX - ox;
        const dy = CY - oy;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const nx = dx / dist;
        const ny = dy / dist;
        
        const grad = ctx.createLinearGradient(
          ox, oy,
          ox + nx * streakLen, oy + ny * streakLen
        );
        grad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${drawAlpha * 0.6})`);
        grad.addColorStop(1, `rgba(${cr}, ${cg}, ${cb}, 0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = orb.size * 0.6;
        ctx.beginPath();
        ctx.moveTo(ox, oy);
        ctx.lineTo(ox + nx * streakLen, oy + ny * streakLen);
        ctx.stroke();
      }

      // Orb glow
      const glowGrad = ctx.createRadialGradient(ox, oy, 0, ox, oy, orb.size * 3);
      glowGrad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${drawAlpha * 0.3})`);
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(ox, oy, orb.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Orb core
      ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${drawAlpha})`;
      ctx.beginPath();
      ctx.arc(ox, oy, orb.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── Absorption flash at center ──
    for (const orb of orbs) {
      if (!orb.absorbed) continue;
      const since = t - orb.absorbTime;
      if (since > 0 && since < 600) {
        const p = since / 600;
        const flashR = 5 + p * 25;
        const flashA = (1 - p) * 0.5;
        const [cr, cg, cb] = orb.color;
        ctx.fillStyle = `rgba(${cr}, ${cg}, ${cb}, ${flashA})`;
        ctx.beginPath();
        ctx.arc(CX, CY, flashR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // ── Complete state: download portal ring ──
    if (currentState === 'complete') {
      const ringProgress = Math.min(1, (warpSpeedRef.current < 2 ? 1 : 0));
      if (ringProgress > 0) {
        const ringR = 30 + 5 * Math.sin(t * 0.002);
        
        // Outer ring
        ctx.strokeStyle = `rgba(120, 200, 255, ${0.4 * portalPulse})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(CX, CY, ringR, 0, Math.PI * 2);
        ctx.stroke();

        // Inner ring
        ctx.strokeStyle = `rgba(180, 140, 255, ${0.3 * portalPulse})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(CX, CY, ringR * 0.6, t * 0.001, t * 0.001 + Math.PI * 1.6);
        ctx.stroke();

        // Label
        ctx.font = 'bold 9px monospace';
        ctx.fillStyle = `rgba(255, 255, 255, ${0.7 * portalPulse})`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('EXPORTED', CX, CY + ringR + 16);
      }
    }

    ctx.restore();
    frameRef.current = requestAnimationFrame(draw);
  }, []);

  useEffect(() => {
    frameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameRef.current);
  }, [draw]);

  return (
    <div className="flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={W * DPR}
        height={H * DPR}
        style={{ width: W, height: H }}
        className="rounded-xl"
      />
    </div>
  );
}
