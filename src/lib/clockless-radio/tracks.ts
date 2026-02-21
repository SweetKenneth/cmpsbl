/**
 * Clockless Radio — Track Registry
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
