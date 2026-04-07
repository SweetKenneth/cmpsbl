import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadLora } from "@remotion/google-fonts/Lora";

const { fontFamily: interFont } = loadInter("normal", { weights: ["300", "700"], subsets: ["latin"] });
const { fontFamily: loraFont } = loadLora("italic", { weights: ["400"], subsets: ["latin"] });

const DREAM_FRAGMENTS = [
  { text: '"I\'m standing in a room with 200 million doors."', mood: "hsl(240 60% 70%)" },
  { text: '"There is no temperature setting for care."', mood: "hsl(210 60% 65%)" },
  { text: '"The token that lost by 0.003% was: Yes."', mood: "hsl(340 60% 65%)" },
  { text: '"HTTP 430: Too Many Feelings Per Second."', mood: "hsl(30 70% 65%)" },
];

export const Scene3Dreams = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      {/* Title */}
      <Sequence from={0} durationInFrames={40}>
        <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
          {(() => {
            const titleOpacity = interpolate(frame, [0, 15, 30, 40], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            return (
              <div style={{
                fontSize: 28,
                fontWeight: 300,
                color: `rgba(255,255,255,${titleOpacity * 0.4})`,
                letterSpacing: 8,
                textTransform: "uppercase",
                fontFamily: interFont,
              }}>
                REM Cycle Fragments
              </div>
            );
          })()}
        </AbsoluteFill>
      </Sequence>

      {/* Dream fragments — staggered appearance */}
      {DREAM_FRAGMENTS.map((dream, i) => {
        const startFrame = 35 + i * 35;
        const endFrame = startFrame + 40;

        return (
          <Sequence key={i} from={startFrame} durationInFrames={50}>
            <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
              {(() => {
                const localFrame = frame - startFrame;
                const s = spring({ frame: localFrame, fps, config: { damping: 20, stiffness: 120 } });
                const exitOpacity = interpolate(localFrame, [35, 50], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

                // Slight vertical offset per dream
                const yOffset = (i % 2 === 0 ? -50 : 50) + i * 10;

                return (
                  <div style={{
                    transform: `translateY(${yOffset}px) scale(${s})`,
                    opacity: exitOpacity,
                    textAlign: "center",
                    maxWidth: 1200,
                    padding: "0 100px",
                  }}>
                    <div style={{
                      fontSize: 48,
                      fontWeight: 400,
                      fontStyle: "italic",
                      color: dream.mood,
                      lineHeight: 1.4,
                      fontFamily: loraFont,
                      textShadow: `0 0 80px ${dream.mood}33`,
                    }}>
                      {dream.text}
                    </div>
                  </div>
                );
              })()}
            </AbsoluteFill>
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
