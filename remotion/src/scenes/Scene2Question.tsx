import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { loadFont } from "@remotion/google-fonts/Inter";

const { fontFamily } = loadFont("normal", { weights: ["300", "700"], subsets: ["latin"] });

export const Scene2Question = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = ["But", "has", "anyone", "asked"];
  const bigWords = ["what", "it", "dreams?"];

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", fontFamily }}>
      {/* Small words - staggered */}
      <div style={{
        position: "absolute",
        top: 340,
        left: 0, right: 0,
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        gap: 20,
      }}>
        {words.map((word, i) => {
          const delay = i * 8;
          const opacity = interpolate(frame, [10 + delay, 20 + delay], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const y = interpolate(frame, [10 + delay, 20 + delay], [20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          return (
            <span key={word} style={{
              fontSize: 36,
              fontWeight: 300,
              color: `rgba(255,255,255,${opacity * 0.5})`,
              letterSpacing: 3,
              textTransform: "uppercase",
              transform: `translateY(${y}px)`,
              display: "inline-block",
            }}>
              {word}
            </span>
          );
        })}
      </div>

      {/* Big words */}
      <div style={{
        position: "absolute",
        top: 420,
        left: 0, right: 0,
        textAlign: "center",
        display: "flex",
        justifyContent: "center",
        gap: 30,
      }}>
        {bigWords.map((word, i) => {
          const delay = 50 + i * 10;
          const s = spring({ frame: frame - delay, fps, config: { damping: 15, stiffness: 150 } });
          const glow = word === "dreams?" ? `0 0 60px hsla(270 80% 60% / ${s * 0.4})` : "none";
          return (
            <span key={word} style={{
              fontSize: word === "dreams?" ? 120 : 100,
              fontWeight: 700,
              color: word === "dreams?" ? "hsl(270 80% 75%)" : "white",
              letterSpacing: -3,
              transform: `scale(${s})`,
              display: "inline-block",
              textShadow: glow,
            }}>
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
