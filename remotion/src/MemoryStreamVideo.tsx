/**
 * Memory Stream — 20s looping motion piece
 * Visual concept: Data flowing through 4 memory tiers (Hot → Warm → Cold → Glacier)
 * then autonomously consolidating every 8 hours.
 * Zero LLM. Pure internal cording.
 */
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Sequence,
  AbsoluteFill,
} from "remotion";
import { loadFont } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadMono } from "@remotion/google-fonts/JetBrainsMono";

const { fontFamily: display } = loadFont("normal", { weights: ["700"], subsets: ["latin"] });
const { fontFamily: mono } = loadMono("normal", { weights: ["400"], subsets: ["latin"] });

const BG = "#0a0e17";
const PRIMARY = "#3B82F6";
const ACCENT = "#EAB308";
const WARM = "#F97316";
const COLD = "#06B6D4";
const GLACIER = "#8B5CF6";
const HOT = "#EF4444";
const MUTED = "#64748B";
const SUBTLE = "#1e293b";

/* ── Persistent animated grid background ── */
function SubstrateGrid({ frame }: { frame: number }) {
  const lines = [];
  for (let i = 0; i < 40; i++) {
    const x = (i / 40) * 1920;
    const opacity = interpolate(
      Math.sin(frame * 0.02 + i * 0.3),
      [-1, 1],
      [0.03, 0.08]
    );
    lines.push(
      <div
        key={`v${i}`}
        style={{
          position: "absolute",
          left: x,
          top: 0,
          width: 1,
          height: "100%",
          background: PRIMARY,
          opacity,
        }}
      />
    );
  }
  for (let j = 0; j < 22; j++) {
    const y = (j / 22) * 1080;
    const opacity = interpolate(
      Math.sin(frame * 0.015 + j * 0.4),
      [-1, 1],
      [0.02, 0.06]
    );
    lines.push(
      <div
        key={`h${j}`}
        style={{
          position: "absolute",
          left: 0,
          top: y,
          width: "100%",
          height: 1,
          background: PRIMARY,
          opacity,
        }}
      />
    );
  }
  return <AbsoluteFill>{lines}</AbsoluteFill>;
}

/* ── Flowing data particles ── */
function DataParticles({ frame, count = 60 }: { frame: number; count?: number }) {
  const particles = [];
  for (let i = 0; i < count; i++) {
    const seed = i * 137.508;
    const baseX = ((seed * 7.3) % 1920);
    const speed = 0.3 + (seed % 3) * 0.4;
    const y = ((frame * speed + seed * 13) % 1200) - 60;
    const x = baseX + Math.sin(frame * 0.02 + i) * 30;
    const size = 2 + (i % 4);
    const colors = [HOT, WARM, COLD, GLACIER, PRIMARY];
    const color = colors[i % colors.length];
    const opacity = interpolate(y, [0, 200, 900, 1080], [0, 0.7, 0.7, 0]);

    particles.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: "50%",
          background: color,
          opacity,
          boxShadow: `0 0 ${size * 3}px ${color}40`,
        }}
      />
    );
  }
  return <AbsoluteFill>{particles}</AbsoluteFill>;
}

/* ── Memory Tier Bar ── */
function TierBar({
  label,
  color,
  width,
  y,
  frame,
  delay,
}: {
  label: string;
  color: string;
  width: number;
  y: number;
  frame: number;
  delay: number;
}) {
  const progress = spring({ frame: frame - delay, fps: 30, config: { damping: 20, stiffness: 80 } });
  const barWidth = interpolate(progress, [0, 1], [0, width]);
  const labelOpacity = interpolate(progress, [0.5, 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ position: "absolute", left: 200, top: y }}>
      <div
        style={{
          width: barWidth,
          height: 40,
          background: `linear-gradient(90deg, ${color}, ${color}80)`,
          borderRadius: 6,
          boxShadow: `0 0 20px ${color}30`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: -180,
          top: 6,
          fontFamily: mono,
          fontSize: 18,
          color,
          opacity: labelOpacity,
          letterSpacing: 2,
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          position: "absolute",
          right: -80,
          top: 8,
          fontFamily: mono,
          fontSize: 16,
          color: MUTED,
          opacity: labelOpacity,
        }}
      >
        {Math.round(barWidth / width * 100)}%
      </div>
    </div>
  );
}

/* ── Consolidation pulse ring ── */
function PulseRing({ frame, delay }: { frame: number; delay: number }) {
  const f = frame - delay;
  if (f < 0) return null;
  const cycle = f % 90;
  const scale = interpolate(cycle, [0, 90], [0.3, 2.5]);
  const opacity = interpolate(cycle, [0, 60, 90], [0.6, 0.2, 0]);

  return (
    <div
      style={{
        position: "absolute",
        left: 960,
        top: 540,
        width: 200,
        height: 200,
        borderRadius: "50%",
        border: `2px solid ${ACCENT}`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        opacity,
      }}
    />
  );
}

/* ── Scene 1: Title reveal ── */
function TitleScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleY = interpolate(
    spring({ frame, fps, config: { damping: 20 } }),
    [0, 1],
    [60, 0]
  );
  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const subtitleOpacity = interpolate(frame, [20, 45], [0, 1], { extrapolateRight: "clamp" });
  const badgeScale = spring({ frame: frame - 50, fps, config: { damping: 12 } });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            fontFamily: mono,
            fontSize: 16,
            color: ACCENT,
            letterSpacing: 6,
            opacity: subtitleOpacity,
            marginBottom: 20,
          }}
        >
          CMPSBL® SUBSTRATE
        </div>
        <div
          style={{
            fontFamily: display,
            fontSize: 90,
            color: "#fff",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            lineHeight: 1.1,
          }}
        >
          Memory Stream
        </div>
        <div
          style={{
            fontFamily: display,
            fontSize: 32,
            color: MUTED,
            marginTop: 20,
            opacity: subtitleOpacity,
          }}
        >
          Autonomous 4-Tier Cognitive Recall
        </div>
        <div
          style={{
            marginTop: 40,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            background: `${ACCENT}15`,
            border: `1px solid ${ACCENT}40`,
            borderRadius: 30,
            padding: "10px 24px",
            fontFamily: mono,
            fontSize: 14,
            color: ACCENT,
            letterSpacing: 2,
            transform: `scale(${badgeScale})`,
          }}
        >
          ● ZERO LLM — PURE INTERNAL CORDING
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ── Scene 2: 4-tier visualization ── */
function TiersScene() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 80,
          fontFamily: display,
          fontSize: 48,
          color: "#fff",
          opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Four Memory Tiers
      </div>
      <div
        style={{
          position: "absolute",
          right: 100,
          top: 90,
          fontFamily: mono,
          fontSize: 14,
          color: MUTED,
          opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        AUTOMATIC PROMOTION & DECAY
      </div>

      <TierBar label="HOT" color={HOT} width={900} y={220} frame={frame} delay={15} />
      <TierBar label="WARM" color={WARM} width={700} y={310} frame={frame} delay={25} />
      <TierBar label="COLD" color={COLD} width={500} y={400} frame={frame} delay={35} />
      <TierBar label="GLACIER" color={GLACIER} width={350} y={490} frame={frame} delay={45} />

      {/* Flow arrows */}
      {[280, 370, 460].map((y, i) => {
        const arrowOpacity = interpolate(frame - 60 - i * 10, [0, 15], [0, 0.5], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });
        return (
          <div
            key={y}
            style={{
              position: "absolute",
              left: 340,
              top: y,
              fontFamily: mono,
              fontSize: 20,
              color: MUTED,
              opacity: arrowOpacity,
            }}
          >
            ↓
          </div>
        );
      })}

      {/* 8hr autonomous label */}
      <div
        style={{
          position: "absolute",
          left: 200,
          top: 620,
          display: "flex",
          alignItems: "center",
          gap: 16,
          opacity: interpolate(frame, [70, 90], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        <div
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            background: ACCENT,
            boxShadow: `0 0 20px ${ACCENT}60`,
            animation: undefined,
            opacity: interpolate(Math.sin(frame * 0.1), [-1, 1], [0.5, 1]),
          }}
        />
        <span style={{ fontFamily: mono, fontSize: 16, color: ACCENT, letterSpacing: 2 }}>
          RUNS AUTONOMOUSLY EVERY 8 HOURS
        </span>
      </div>

      {/* Code snippet */}
      <div
        style={{
          position: "absolute",
          right: 100,
          top: 220,
          background: `${SUBTLE}`,
          border: `1px solid ${MUTED}30`,
          borderRadius: 12,
          padding: "24px 28px",
          fontFamily: mono,
          fontSize: 14,
          color: MUTED,
          lineHeight: 1.8,
          opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" }),
          maxWidth: 500,
        }}
      >
        <span style={{ color: COLD }}>memory</span>
        <span style={{ color: "#fff" }}>.store(</span>
        <span style={{ color: ACCENT }}>context</span>
        <span style={{ color: "#fff" }}>)</span>
        <br />
        <span style={{ color: COLD }}>memory</span>
        <span style={{ color: "#fff" }}>.recall(</span>
        <span style={{ color: ACCENT }}>query</span>
        <span style={{ color: "#fff" }}>)</span>
        <br />
        <span style={{ color: MUTED }}>{"// consolidation is automatic"}</span>
        <br />
        <span style={{ color: MUTED }}>{"// no triggers, no cron jobs"}</span>
      </div>
    </AbsoluteFill>
  );
}

/* ── Scene 3: Consolidation cycle visualization ── */
function ConsolidationScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const nodes = [
    { label: "EXTRACT", angle: 0, color: HOT },
    { label: "PROMOTE", angle: 72, color: WARM },
    { label: "COMPRESS", angle: 144, color: COLD },
    { label: "SYNTHESIZE", angle: 216, color: GLACIER },
    { label: "ARCHIVE", angle: 288, color: PRIMARY },
  ];

  const titleOpacity = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const rotation = frame * 0.3;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 80,
          fontFamily: display,
          fontSize: 48,
          color: "#fff",
          opacity: titleOpacity,
          textAlign: "center",
        }}
      >
        Autonomous Consolidation
      </div>

      {/* Orbital ring */}
      <div
        style={{
          position: "relative",
          width: 500,
          height: 500,
          transform: `rotate(${rotation}deg)`,
        }}
      >
        {/* Center glow */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${ACCENT}40, transparent)`,
            transform: "translate(-50%, -50%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 440,
            height: 440,
            borderRadius: "50%",
            border: `1px solid ${MUTED}20`,
            transform: "translate(-50%, -50%)",
          }}
        />

        {nodes.map((node, i) => {
          const delay = i * 15;
          const nodeSpring = spring({
            frame: frame - delay,
            fps,
            config: { damping: 15 },
          });
          const rad = ((node.angle + rotation) * Math.PI) / 180;
          const radius = 200;
          const x = 250 + Math.cos(rad) * radius - 45;
          const y = 250 + Math.sin(rad) * radius - 20;

          return (
            <div
              key={node.label}
              style={{
                position: "absolute",
                left: x,
                top: y,
                transform: `scale(${nodeSpring}) rotate(-${rotation}deg)`,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: node.color,
                  boxShadow: `0 0 15px ${node.color}50`,
                }}
              />
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  color: node.color,
                  letterSpacing: 2,
                  whiteSpace: "nowrap",
                }}
              >
                {node.label}
              </div>
            </div>
          );
        })}
      </div>

      <PulseRing frame={frame} delay={30} />
      <PulseRing frame={frame} delay={60} />

      <div
        style={{
          position: "absolute",
          bottom: 120,
          fontFamily: mono,
          fontSize: 14,
          color: MUTED,
          letterSpacing: 3,
          opacity: interpolate(frame, [40, 60], [0, 0.7], { extrapolateRight: "clamp" }),
        }}
      >
        NO EXTERNAL AI · NO LLM · PURE ALGORITHMIC SUBSTRATE
      </div>
    </AbsoluteFill>
  );
}

/* ── Scene 4: Closing ── */
function ClosingScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame: frame - 10, fps, config: { damping: 15 } });
  const taglineOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center", transform: `scale(${scale})` }}>
        <div
          style={{
            fontFamily: display,
            fontSize: 72,
            color: "#fff",
            marginBottom: 20,
          }}
        >
          Your agent{" "}
          <span style={{ color: PRIMARY }}>remembers</span>.
        </div>
        <div
          style={{
            fontFamily: display,
            fontSize: 28,
            color: MUTED,
            opacity: taglineOpacity,
          }}
        >
          Memory Stream — part of the CMPSBL® substrate
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 60,
          fontFamily: mono,
          fontSize: 13,
          color: `${MUTED}80`,
          letterSpacing: 4,
          opacity: taglineOpacity,
        }}
      >
        CMPSBL.COM
      </div>
    </AbsoluteFill>
  );
}

/* ── Main composition ── */
export const MemoryStreamVideo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: BG }}>
      <SubstrateGrid frame={frame} />
      <DataParticles frame={frame} count={50} />

      <Sequence from={0} durationInFrames={150}>
        <TitleScene />
      </Sequence>

      <Sequence from={140} durationInFrames={200}>
        <TiersScene />
      </Sequence>

      <Sequence from={330} durationInFrames={180}>
        <ConsolidationScene />
      </Sequence>

      <Sequence from={500} durationInFrames={100}>
        <ClosingScene />
      </Sequence>
    </AbsoluteFill>
  );
};
