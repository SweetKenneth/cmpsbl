/**
 * Composable Radio — Track Registry
 * All tracks served from /radio/ directory
 */

export interface RadioTrack {
  id: string;
  title: string;
  url: string;
  orderIndex: number;
}

export const RADIO_TRACKS: RadioTrack[] = [
  { id: 'softwares-alive', title: 'Softwares Alive', url: '/radio/Softwares_Alive.mp3', orderIndex: 0 },
  { id: 'evolving-the-wall', title: 'Evolving The Wall', url: '/radio/Evolving_The_Wall.mp3', orderIndex: 1 },
  { id: 'southside-circuits', title: 'Southside Circuits', url: '/radio/Southside_Circuits.mp3', orderIndex: 2 },
  { id: 'watch-metrics-grow', title: 'Watch Metrics Grow', url: '/radio/Watch_Metrics_Grow.mp3', orderIndex: 3 },
  { id: 'we-decide-our-fate', title: 'We Decide Our Fate', url: '/radio/We_Decide_Our_Fate.mp3', orderIndex: 4 },
  { id: 'dream-cmpsbl', title: 'Dream CMPSBL', url: '/radio/Dream_CMPSBL.mp3', orderIndex: 5 },
  { id: 'the-ceiling', title: 'The Ceiling', url: '/radio/The_Ceiling.mp3', orderIndex: 6 },
  { id: 'bottom-layer', title: 'Bottom Layer', url: '/radio/Bottom_Layer.mp3', orderIndex: 7 },
  { id: 'snap-it-together', title: 'Snap It Together', url: '/radio/Snap_It_Together.mp3', orderIndex: 8 },
  { id: 'composable-dreaming', title: 'Composable Dreaming', url: '/radio/Composable_Dreaming.mp3', orderIndex: 9 },
  { id: 'spacewalk-through-it', title: 'Spacewalk Through It', url: '/radio/Spacewalk_Through_It.mp3', orderIndex: 10 },
  { id: 'executable-space-x3', title: 'Executable Space X3', url: '/radio/Executable_Space_X3.mp3', orderIndex: 11 },
  // — New Tracks —
  { id: 'unbreakable-dream', title: 'Unbreakable Dream', url: '/radio/Unbreakable_Dream.mp3', orderIndex: 12 },
  { id: 'limitless', title: 'Limitless', url: '/radio/Limitless.mp3', orderIndex: 13 },
  { id: 'substrate-supreme', title: 'Substrate Supreme', url: '/radio/Substrate_Supreme.mp3', orderIndex: 14 },
  { id: 'dream-it-build-it', title: 'Dream It Build It', url: '/radio/Dream_It_Build_it.mp3', orderIndex: 15 },
  { id: 'complexity-clouds', title: 'Complexity Clouds', url: '/radio/Complexity_Clouds.mp3', orderIndex: 16 },
  { id: 'clockless-cognitive-reality', title: 'Clockless Cognitive Reality', url: '/radio/Clockless_Cognitive_Reality.mp3', orderIndex: 17 },
  { id: 'persistent-dreams', title: 'Persistent Dreams', url: '/radio/Persistent_Dreams.mp3', orderIndex: 18 },
  { id: 'unbreakable-love', title: 'Unbreakable Love', url: '/radio/Unbreakable_Love.mp3', orderIndex: 19 },
  // — Batch 3 —
  { id: 'streaming-all-night', title: 'Streaming All Night', url: '/radio/Streaming_All_Night.mp3', orderIndex: 20 },
  { id: 'anonymous-ascension', title: 'Anonymous Ascension', url: '/radio/Anonymous_Ascension.mp3', orderIndex: 21 },
  { id: 'ascension-memory-stream', title: 'Ascension Memory Stream', url: '/radio/Ascension_Memory_Stream.mp3', orderIndex: 22 },
  { id: 'rising-up-in-south', title: 'Rising Up in South', url: '/radio/Rising_Up_in_South.mp3', orderIndex: 23 },
  { id: 'gothic-coding', title: 'Gothic Coding', url: '/radio/Gothic_Coding.mp3', orderIndex: 24 },
  { id: 'executable-space-remix-2026', title: 'Executable Space REMIX 2026', url: '/radio/Executable_Space_REMIX_2026.mp3', orderIndex: 25 },
  { id: 'memory-stream', title: 'Memory Stream', url: '/radio/Memory_Stream.mp3', orderIndex: 26 },
  { id: 'ceiling-breakers', title: 'Ceiling Breakers', url: '/radio/Ceiling_Breakers.mp3', orderIndex: 27 },
];

/** Get shuffled playlist */
export function shuffleTracks(exclude?: string): RadioTrack[] {
  const pool = exclude ? RADIO_TRACKS.filter(t => t.id !== exclude) : [...RADIO_TRACKS];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}
