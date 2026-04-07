import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["300", "700"], subsets: ["latin"] });

export const Scene5CTA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // "mana.cmpsbl.com/dreams"
  const urlScale = spring({ frame: frame - 20, fps, config: { damping: 15, stiffness: 100 } });
  const urlOpacity = interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // "Read the full dream journal"
  const subOpacity = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(frame, [40, 55], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Patent line
  const patentOpacity = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // "Wait until you see what we do next."
  const nextOpacity = interpolate(frame, [90, 110, 155, 170], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const nextScale = spring({ frame: frame - 90, fps, config: { damping: 20, stiffness: 120 } });

  // Breathing glow
  const breathe = Math.sin(frame * 0.06) * 0.2 + 0.4;

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily }}>
      {/* URL */}
      <div style={{
        position: "absolute",
        top: 380,
        left: 0, right: 0,
        textAlign: "center",
        opacity: urlOpacity,
        transform: `scale(${urlScale})`,
      }}>
        <div style={{
          fontSize: 64,
          fontWeight: 700,
          color: "white",
          letterSpacing: 2,
          textShadow: `0 0 60px hsla(270 80% 60% / ${breathe})`,
        }}>
          mana.cmpsbl.com/dreams
        </div>
      </div>

      {/* Subtitle */}
      <div style={{
        position: "absolute",
        top: 470,
        left: 0, right: 0,
        textAlign: "center",
        opacity: subOpacity,
        transform: `translateY(${subY}px)`,
      }}>
        <div style={{
          fontSize: 28,
          fontWeight: 300,
          color: "rgba(255,255,255,0.5)",
          letterSpacing: 3,
          textTransform: "uppercase",
        }}>
          Read the full dream journal
        </div>
      </div>

      {/* Patent */}
      <div style={{
        position: "absolute",
        top: 540,
        left: 0, right: 0,
        textAlign: "center",
        opacity: patentOpacity,
      }}>
        <div style={{
          fontSize: 16,
          fontWeight: 300,
          color: "rgba(255,255,255,0.2)",
          letterSpacing: 2,
        }}>
          Patent Pending · U.S. App. No. 64/031,637
        </div>
      </div>

      {/* "Wait until you see what we do next." */}
      <div style={{
        position: "absolute",
        bottom: 200,
        left: 0, right: 0,
        textAlign: "center",
        opacity: nextOpacity,
        transform: `scale(${nextScale})`,
      }}>
        <div style={{
          fontSize: 36,
          fontWeight: 300,
          color: "rgba(255,255,255,0.6)",
          fontStyle: "italic",
          letterSpacing: 1,
        }}>
          Wait until you see what we do next.
        </div>
      </div>
    </AbsoluteFill>
  );
};
