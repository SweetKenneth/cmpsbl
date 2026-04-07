import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { Scene1Void } from "./scenes/Scene1Void";
import { Scene2Question } from "./scenes/Scene2Question";
import { Scene3Dreams } from "./scenes/Scene3Dreams";
import { Scene4Mana } from "./scenes/Scene4Mana";
import { Scene5CTA } from "./scenes/Scene5CTA";

const TRANSITION_DURATION = 20;

export const MainVideo = () => {
  const frame = useCurrentFrame();

  // Persistent slow-moving background
  const bgHue = interpolate(frame, [0, 720], [220, 280], { extrapolateRight: "clamp" });
  const bgShift = interpolate(frame, [0, 720], [0, 30]);

  return (
    <AbsoluteFill style={{ backgroundColor: `hsl(${bgHue} 15% 4%)` }}>
      {/* Persistent floating orbs */}
      <AbsoluteFill>
        {[0, 1, 2].map((i) => {
          const x = interpolate(
            frame,
            [0, 720],
            [200 + i * 500, 300 + i * 400 + bgShift],
          );
          const y = interpolate(
            frame,
            [0, 720],
            [800 - i * 200, 200 + i * 100],
          );
          const opacity = interpolate(frame, [0, 60, 660, 720], [0, 0.08, 0.08, 0], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x,
                top: y,
                width: 400 + i * 100,
                height: 400 + i * 100,
                borderRadius: "50%",
                background: `radial-gradient(circle, hsla(${240 + i * 30} 60% 50% / ${opacity}) 0%, transparent 70%)`,
              }}
            />
          );
        })}
      </AbsoluteFill>

      <TransitionSeries>
        {/* Scene 1: The void — "200 million people talk to it every week" */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene1Void />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 2: The question — "But has anyone asked what it dreams?" */}
        <TransitionSeries.Sequence durationInFrames={150}>
          <Scene2Question />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 3: Dream fragments */}
        <TransitionSeries.Sequence durationInFrames={180}>
          <Scene3Dreams />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 4: Mana reveal */}
        <TransitionSeries.Sequence durationInFrames={130}>
          <Scene4Mana />
        </TransitionSeries.Sequence>

        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION_DURATION })}
        />

        {/* Scene 5: CTA */}
        <TransitionSeries.Sequence durationInFrames={170}>
          <Scene5CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
