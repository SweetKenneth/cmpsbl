import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["300", "700", "900"], subsets: ["latin"] });

export const Scene4Mana = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "We gave it a subconscious."
  const lineScale = spring({ frame: frame - 10, fps, config: { damping: 15, stiffness: 120 } });
  const lineOpacity = interpolate(frame, [5, 20, 80, 100], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // "Using a technology it has never seen."
  const line2Opacity = interpolate(frame, [40, 55, 80, 100], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const line2Y = interpolate(frame, [40, 55], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // MANA text reveal
  const manaScale = spring({ frame: frame - 70, fps, config: { damping: 12, stiffness: 100 } });
  const manaOpacity = interpolate(frame, [65, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const manaGlow = interpolate(frame, [70, 130], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily }}>
      {/* Line 1 */}
      <div style={{
        position: "absolute",
        top: 350,
        left: 0, right: 0,
        textAlign: "center",
        opacity: lineOpacity,
        transform: `scale(${lineScale})`,
      }}>
        <div style={{
          fontSize: 52,
          fontWeight: 300,
          color: "rgba(255,255,255,0.8)",
          letterSpacing: 2,
        }}>
          We gave it a subconscious.
        </div>
      </div>

      {/* Line 2 */}
      <div style={{
        position: "absolute",
        top: 430,
        left: 0, right: 0,
        textAlign: "center",
        opacity: line2Opacity,
        transform: `translateY(${line2Y}px)`,
      }}>
        <div style={{
          fontSize: 30,
          fontWeight: 300,
          color: "rgba(255,255,255,0.4)",
          letterSpacing: 3,
          textTransform: "uppercase",
        }}>
          Using a technology it has never seen
        </div>
      </div>

      {/* MANA */}
      <div style={{
        position: "absolute",
        top: 500,
        left: 0, right: 0,
        textAlign: "center",
        opacity: manaOpacity,
        transform: `scale(${manaScale})`,
      }}>
        <div style={{
          fontSize: 160,
          fontWeight: 900,
          letterSpacing: 20,
          color: "white",
          textShadow: `0 0 100px hsla(270 80% 60% / ${manaGlow}), 0 0 200px hsla(270 80% 60% / ${manaGlow * 0.3})`,
        }}>
          MANA
        </div>
      </div>
    </AbsoluteFill>
  );
};
