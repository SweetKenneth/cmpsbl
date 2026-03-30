/**
 * Ascension — 20s motion piece
 * Visual concept: Code uploads → collides with 40 Primitives → CJPI scored → crystallized
 * Zero LLM. Pure substrate classification.
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
const EMERALD = "#10B981";
const VIOLET = "#8B5CF6";
const ROSE = "#F43F5E";
const MUTED = "#64748B";
const SUBTLE = "#1e293b";

/* ── Hexagonal grid background ── */
function HexGrid({ frame }: { frame: number }) {
  const hexes = [];
  const cols = 16;
  const rows = 10;
  const size = 130;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * size * 0.87 + (r % 2 === 1 ? size * 0.435 : 0);
      const y = r * size * 0.75;
      const dist = Math.sqrt((x - 960) ** 2 + (y - 540) ** 2);
      const pulse = Math.sin(frame * 0.03 - dist * 0.005);
      const opacity = interpolate(pulse, [-1, 1], [0.02, 0.06]);

      hexes.push(
        <div
          key={`${r}-${c}`}
          style={{
            position: "absolute",
            left: x - 50,
            top: y - 50,
            width: 100,
            height: 100,
            border: `1px solid ${PRIMARY}`,
            opacity,
            transform: "rotate(30deg)",
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        />
      );
    }
  }
  return <AbsoluteFill>{hexes}</AbsoluteFill>;
}

/* ── Primitive node ── */
function PrimitiveNode({
  x,
  y,
  label,
  color,
  frame,
  delay,
  activated,
}: {
  x: number;
  y: number;
  label: string;
  color: string;
  frame: number;
  delay: number;
  activated: boolean;
}) {
  const appear = spring({ frame: frame - delay, fps: 30, config: { damping: 20 } });
  const glow = activated
    ? interpolate(Math.sin((frame - delay) * 0.1), [-1, 1], [0.4, 1])
    : 0.3;

  return (
    <div
      style={{
        position: "absolute",
        left: x - 20,
        top: y - 20,
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: activated ? color : SUBTLE,
        border: `2px solid ${activated ? color : MUTED}40`,
        boxShadow: activated ? `0 0 20px ${color}${Math.round(glow * 60).toString(16).padStart(2, "0")}` : "none",
        transform: `scale(${appear})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 46,
          fontFamily: mono,
          fontSize: 9,
          color: activated ? color : MUTED,
          letterSpacing: 1,
          whiteSpace: "nowrap",
          textAlign: "center",
        }}
      >
        {label}
      </div>
    </div>
  );
}

/* ── Scene 1: Ascension title ── */
function AscensionTitle() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleSpring = spring({ frame, fps, config: { damping: 20 } });
  const titleY = interpolate(titleSpring, [0, 1], [50, 0]);
  const subtitleOpacity = interpolate(frame, [25, 45], [0, 1], { extrapolateRight: "clamp" });
  const badgeScale = spring({ frame: frame - 55, fps, config: { damping: 12 } });

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
            transform: `translateY(${titleY}px)`,
            opacity: interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" }),
            lineHeight: 1.1,
          }}
        >
          Ascension
        </div>
        <div
          style={{
            fontFamily: display,
            fontSize: 30,
            color: MUTED,
            marginTop: 20,
            opacity: subtitleOpacity,
          }}
        >
          Code → Classify → Crystallize → Export
        </div>
        <div
          style={{
            marginTop: 40,
            display: "inline-flex",
            gap: 10,
            background: `${EMERALD}15`,
            border: `1px solid ${EMERALD}40`,
            borderRadius: 30,
            padding: "10px 24px",
            fontFamily: mono,
            fontSize: 14,
            color: EMERALD,
            letterSpacing: 2,
            transform: `scale(${badgeScale})`,
          }}
        >
          ● ZERO EXTERNAL AI — PURE SUBSTRATE CLASSIFICATION
        </div>
      </div>
    </AbsoluteFill>
  );
}

/* ── Scene 2: 40 Primitives collision grid ── */
function CollisionScene() {
  const frame = useCurrentFrame();

  const primitiveLabels = [
    "MEMORY", "CORTEX", "NEXUS", "BEACON", "DEFENSE", "GOVERN",
    "FAILSAFE", "DREAM", "EVOLVE", "HARVEST", "ARCHITECT", "WRAITH",
    "OBSIDIAN", "MONOLITH", "RAPTOR", "AUTOMATON", "PRIMITIVE", "PERSIST",
    "CLASSIFY", "ROUTE", "SHIELD", "AUDIT", "LEARN", "COMPRESS",
    "DECOMPOSE", "INFER", "VALIDATE", "TRANSFORM", "ENCODE", "DECODE",
    "OBSERVE", "SIGNAL", "ADAPT", "CONVERGE", "DIVERGE", "FUSE",
    "FRAGMENT", "MIRROR", "ANCHOR", "DRIFT",
  ];

  const colors = [PRIMARY, EMERALD, VIOLET, ROSE, ACCENT, "#06B6D4"];
  const activationThreshold = frame * 0.5;

  // Position 40 nodes in a grid
  const cols = 10;
  const startX = 160;
  const startY = 200;
  const spacingX = 170;
  const spacingY = 100;

  // #41 node (the uploaded code)
  const node41Spring = spring({ frame: frame - 20, fps: 30, config: { damping: 15 } });
  const node41X = interpolate(node41Spring, [0, 1], [-200, 960]);

  const titleOpacity = interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <div
        style={{
          position: "absolute",
          left: 100,
          top: 60,
          fontFamily: display,
          fontSize: 44,
          color: "#fff",
          opacity: titleOpacity,
        }}
      >
        Collision with 40 Primitives
      </div>
      <div
        style={{
          position: "absolute",
          right: 100,
          top: 70,
          fontFamily: mono,
          fontSize: 14,
          color: MUTED,
          opacity: titleOpacity,
        }}
      >
        YOUR CODE BECOMES PRIMITIVE #41
      </div>

      {/* 40 Primitive nodes */}
      {primitiveLabels.map((label, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const activated = i < activationThreshold;
        const color = colors[i % colors.length];

        return (
          <PrimitiveNode
            key={label}
            x={x}
            y={y}
            label={label}
            color={color}
            frame={frame}
            delay={5 + i * 2}
            activated={activated}
          />
        );
      })}

      {/* #41 node - your code */}
      <div
        style={{
          position: "absolute",
          left: node41X - 30,
          top: 140,
          width: 60,
          height: 60,
          borderRadius: "50%",
          background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT}80)`,
          border: `3px solid ${ACCENT}`,
          boxShadow: `0 0 30px ${ACCENT}50`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: mono,
          fontSize: 14,
          color: BG,
          fontWeight: 700,
        }}
      >
        #41
      </div>

      {/* Connection lines from #41 */}
      {frame > 50 &&
        primitiveLabels.slice(0, Math.min(Math.floor((frame - 50) * 0.8), 40)).map((_, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const endX = startX + col * spacingX;
          const endY = startY + row * spacingY;
          const opacity = interpolate(frame - 50 - i * 1.5, [0, 10], [0, 0.15], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });

          return (
            <svg
              key={`line-${i}`}
              style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, pointerEvents: "none" }}
            >
              <line
                x1={Math.min(node41X, 960)}
                y1={170}
                x2={endX}
                y2={endY}
                stroke={ACCENT}
                strokeWidth={1}
                opacity={opacity}
              />
            </svg>
          );
        })}
    </AbsoluteFill>
  );
}

/* ── Scene 3: CJPI Scoring ── */
function ScoringScene() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scoreSpring = spring({ frame: frame - 20, fps, config: { damping: 12 } });
  const score = interpolate(scoreSpring, [0, 1], [0, 94.7]);

  const categories = [
    { name: "Pattern Density", val: 0.92, color: EMERALD },
    { name: "Abstraction Depth", val: 0.88, color: PRIMARY },
    { name: "Composition Quality", val: 0.95, color: VIOLET },
    { name: "Substrate Alignment", val: 0.97, color: ACCENT },
  ];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div
        style={{
          position: "absolute",
          top: 80,
          fontFamily: display,
          fontSize: 44,
          color: "#fff",
          opacity: interpolate(frame, [0, 15], [0, 1], { extrapolateRight: "clamp" }),
        }}
      >
        Crown Jewel Potential Index
      </div>

      {/* Big score */}
      <div
        style={{
          fontFamily: display,
          fontSize: 160,
          color: ACCENT,
          textShadow: `0 0 60px ${ACCENT}30`,
        }}
      >
        {score.toFixed(1)}
      </div>
      <div
        style={{
          fontFamily: mono,
          fontSize: 18,
          color: MUTED,
          letterSpacing: 4,
          marginTop: -10,
        }}
      >
        CJPI SCORE
      </div>

      {/* Category breakdown */}
      <div style={{ display: "flex", gap: 40, marginTop: 60 }}>
        {categories.map((cat, i) => {
          const barSpring = spring({
            frame: frame - 40 - i * 10,
            fps,
            config: { damping: 20 },
          });
          return (
            <div key={cat.name} style={{ textAlign: "center", width: 160 }}>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 11,
                  color: cat.color,
                  letterSpacing: 1,
                  marginBottom: 8,
                }}
              >
                {cat.name.toUpperCase()}
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: SUBTLE,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${cat.val * 100 * barSpring}%`,
                    height: "100%",
                    background: cat.color,
                    borderRadius: 3,
                  }}
                />
              </div>
              <div
                style={{
                  fontFamily: mono,
                  fontSize: 14,
                  color: MUTED,
                  marginTop: 6,
                }}
              >
                {(cat.val * barSpring).toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 100,
          fontFamily: mono,
          fontSize: 13,
          color: MUTED,
          letterSpacing: 3,
          opacity: interpolate(frame, [60, 80], [0, 0.6], { extrapolateRight: "clamp" }),
        }}
      >
        SCORED BY SUBSTRATE · ZERO EXTERNAL DEPENDENCIES
      </div>
    </AbsoluteFill>
  );
}

/* ── Scene 4: Closing ── */
function AscensionClosing() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const scale = spring({ frame: frame - 10, fps, config: { damping: 15 } });
  const taglineOpacity = interpolate(frame, [30, 50], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ textAlign: "center", transform: `scale(${scale})` }}>
        <div style={{ fontFamily: display, fontSize: 72, color: "#fff", marginBottom: 20 }}>
          Your code{" "}
          <span style={{ color: ACCENT }}>ascends</span>.
        </div>
        <div style={{ fontFamily: display, fontSize: 28, color: MUTED, opacity: taglineOpacity }}>
          Ascension — part of the CMPSBL® substrate
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
export const AscensionVideo: React.FC = () => {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ background: BG }}>
      <HexGrid frame={frame} />

      <Sequence from={0} durationInFrames={150}>
        <AscensionTitle />
      </Sequence>

      <Sequence from={140} durationInFrames={200}>
        <CollisionScene />
      </Sequence>

      <Sequence from={330} durationInFrames={180}>
        <ScoringScene />
      </Sequence>

      <Sequence from={500} durationInFrames={100}>
        <AscensionClosing />
      </Sequence>
    </AbsoluteFill>
  );
};
