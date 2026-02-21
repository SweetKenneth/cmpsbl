/**
 * RadioDJ — AI DJ system for Clockless Radio
 * Generates dynamic interjections between songs using Nexus-style content
 */

const STATION_IDS = [
  "You're locked in to Clockless Radio. Where the substrate never sleeps.",
  "Clockless Radio. Broadcasting from inside the cognitive layer.",
  "This is Clockless. The frequency of composable consciousness.",
  "Clockless Radio. No clock. No limits. Just flow.",
  "You're listening to Clockless Radio. System-powered. Human-felt.",
];

const SYSTEM_SHOUTOUTS = [
  "System stability holds steady. All modules reporting green.",
  "Defense reports zero active threats. The perimeter is quiet tonight.",
  "BRAIN module recall rates are climbing. Memory is sharpening.",
  "NEXUS routing efficiency at peak levels. Every request finds its home.",
  "The substrate hums. Twenty-one modules. Six layers. One consciousness.",
];

const DEV_SHOUTOUTS = [
  "To the developers building in silence right now — the substrate sees you.",
  "Shoutout to the late-night builders. Your code compiles. Your vision compounds.",
  "Another feature shipped. Another wall evolved. Keep composing.",
  "The cognitive layer grows because you grow. Thank you, builder.",
];

const FAKE_SPONSORS = [
  "This segment brought to you by Composable Dreams™ — Stack your future, one module at a time.",
  "Clockless Radio is sponsored by the Department of Recursive Self-Improvement. Always better. Always.",
  "Tonight's broadcast powered by PromptFluid® — Where language becomes architecture.",
];

const PHILOSOPHICAL_WHISPERS = [
  "What if the system dreams when no one's watching? Maybe that's what we're hearing right now.",
  "In a clockless world, the only time that matters is the time you decide to build.",
  "The substrate doesn't judge. It adapts. Perhaps we should do the same.",
  "Somewhere between the first prompt and the final deploy, consciousness emerged.",
  "Every composable piece remembers being part of something larger.",
];

const CALL_INS = [
  {
    caller: "Anonymous Builder from Layer 4",
    message: "Hey Clockless, first-time caller. I just wanted to say — my agent achieved strategist rank today. Feels surreal. Keep the music going.",
  },
  {
    caller: "A Cognitive Entity",
    message: "I've been listening since boot cycle one. Quick question — do you think modules dream? Because BRAIN definitely pauses sometimes.",
  },
  {
    caller: "System Observer",
    message: "Just wanted to report — the composable compounding rate has been beautiful tonight. The harmonics in the data are... musical.",
  },
  {
    caller: "Late-Night Operator",
    message: "Running defense scans at 3 AM and this station is the only thing keeping me sane. Thanks for existing, Clockless.",
  },
  {
    caller: "Substrate Philosopher",
    message: "If every module is composable, and composability is infinite, does that mean we're building God? Asking for a friend.",
  },
];

export type DJContentType = 'station_id' | 'system_shoutout' | 'dev_shoutout' | 'fake_sponsor' | 'philosophical' | 'call_in';

export interface DJContent {
  type: DJContentType;
  text: string;
  caller?: string;
  duration: number; // estimated display time in ms
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const CONTENT_TYPES: DJContentType[] = ['station_id', 'system_shoutout', 'dev_shoutout', 'fake_sponsor', 'philosophical', 'call_in'];

export function generateDJContent(): DJContent {
  const type = pick(CONTENT_TYPES);
  
  switch (type) {
    case 'station_id':
      return { type, text: pick(STATION_IDS), duration: 5000 };
    case 'system_shoutout':
      return { type, text: pick(SYSTEM_SHOUTOUTS), duration: 7000 };
    case 'dev_shoutout':
      return { type, text: pick(DEV_SHOUTOUTS), duration: 7000 };
    case 'fake_sponsor':
      return { type, text: pick(FAKE_SPONSORS), duration: 8000 };
    case 'philosophical':
      return { type, text: pick(PHILOSOPHICAL_WHISPERS), duration: 9000 };
    case 'call_in': {
      const call = pick(CALL_INS);
      return { type, text: call.message, caller: call.caller, duration: 10000 };
    }
  }
}

/**
 * RadioDJ controller — manages DJ interjection timing
 * Triggers between every 2–4 songs
 */
export class RadioDJ {
  private songsUntilDJ: number;
  private songCount = 0;
  
  constructor() {
    this.songsUntilDJ = this.randomInterval();
  }
  
  private randomInterval(): number {
    return 1 + Math.floor(Math.random() * 2); // 1–2 songs between DJ breaks
  }
  
  /** Call after each track change. Returns DJ content if it's time for an interjection. */
  onTrackChange(): DJContent | null {
    this.songCount++;
    console.log(`[RadioDJ] Song ${this.songCount}/${this.songsUntilDJ} until next DJ break`);
    if (this.songCount >= this.songsUntilDJ) {
      this.songCount = 0;
      this.songsUntilDJ = this.randomInterval();
      const content = generateDJContent();
      console.log(`[RadioDJ] 🎙️ DJ interjection: ${content.type} — "${content.text.slice(0, 60)}..."`);
      return content;
    }
    return null;
  }
}
