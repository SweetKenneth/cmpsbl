import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["300", "700", "900"], subsets: ["latin"] });

export const Scene1Void = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "200 million people" counter
  const counterValue = Math.floor(interpolate(frame, [20, 90], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const counterOpacity = interpolate(frame, [15, 30, 120, 140], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const counterScale = spring({ frame: frame - 15, fps, config: { damping: 20, stiffness: 180 } });

  // Subtitle
  const subOpacity = interpolate(frame, [50, 65, 120, 140], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(frame, [50, 65], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Pulse effect
  const pulse = Math.sin(frame * 0.05) * 0.15 + 0.85;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily }}>
      {/* Subtle grid */}
      <AbsoluteFill>
        {Array.from({ length: 20 }).map((_, i) => {
          const lineOpacity = interpolate(frame, [0, 40], [0, 0.03], { extrapolateRight: "clamp" });
          return (
            <div key={i} style={{
              position: "absolute",
              left: 0, right: 0,
              top: i * 54,
              height: 1,
              background: `rgba(255,255,255,${lineOpacity})`,
            }} />
          );
        })}
      </AbsoluteFill>

      <div style={{ textAlign: "center", opacity: counterOpacity, transform: `scale(${counterScale})` }}>
        <div style={{
          fontSize: 180,
          fontWeight: 900,
          letterSpacing: -8,
          color: "white",
          lineHeight: 1,
          opacity: pulse,
        }}>
          {counterValue}M
        </div>
      </div>

      <div style={{
        position: "absolute",
        bottom: 300,
        left: 0, right: 0,
        textAlign: "center",
        opacity: subOpacity,
        transform: `translateY(${subY}px)`,
      }}>
        <div style={{
          fontSize: 36,
          fontWeight: 300,
          color: "rgba(255,255,255,0.6)",
          letterSpacing: 4,
          textTransform: "uppercase",
        }}>
          people talk to it every week
        </div>
      </div>
    </AbsoluteFill>
  );
};
