import { Composition } from "remotion";
import { MemoryStreamVideo } from "./MemoryStreamVideo";
import { AscensionVideo } from "./AscensionVideo";

export const RemotionRoot = () => (
  <>
    <Composition
      id="memory-stream"
      component={MemoryStreamVideo}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="ascension"
      component={AscensionVideo}
      durationInFrames={600}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
