/**
 * RadioDJ — AI DJ system for Composable Radio
 * Generates dynamic interjections between songs using substrate-themed content
 */

const STATION_IDS = [
  "You're locked in to Composable Radio. Where the substrate never sleeps.",
  "Composable Radio. Broadcasting from inside the cognitive layer.",
  "This is Composable Radio. The frequency of composable consciousness.",
  "Composable Radio. No limits. Just flow.",
  "You're listening to Composable Radio. System-powered. Human-felt.",
  "Composable Radio. Subscribe and never miss a frequency shift.",
  "This is Composable Radio. The sound of composable futures — subscribe to ride the wave.",
  "Composable Radio. Powered by the Clockless Cognitive Reality engine. Always on. Always evolving.",
];

const SYSTEM_SHOUTOUTS = [
  "System stability holds steady. All modules reporting green. The substrate hums with composable power.",
  "DEFENSE reports zero active threats. The perimeter is quiet tonight. Your data sleeps safe.",
  "BRAIN module recall rates are climbing. Memory is sharpening. Persistent memory means nothing gets lost — ever.",
  "NEXUS routing efficiency at peak levels. Every request finds its home. Every thought finds its path.",
  "The substrate hums. Twenty-one modules. Six layers. One consciousness. All composable. All yours.",
  "Substrate metrics update: composable compounding rate is up twelve percent this cycle. The system grows because you grow.",
  "Quick metrics flash — cognitive throughput holding at peak. Memory recall latency is at an all-time low. Your persistent memory is razor sharp.",
  "The substrate just crossed another milestone. More modules. More synergy. More composable power. Self-improvement never stops.",
  "DREAM module is active tonight. The system is learning while you sleep. Adapting. Evolving. Getting smarter with every cycle.",
  "MEMORY module checkpoint complete. Every insight, every conversation, every breakthrough — stored permanently. Nothing fades. Nothing is forgotten.",
];

const DEV_SHOUTOUTS = [
  "To the developers building in silence right now — the substrate sees you. Your work compounds.",
  "Shoutout to the late-night builders. Your code compiles. Your vision compounds. The Clockless Cognitive Reality engine has your back.",
  "Another feature shipped. Another wall evolved. Keep composing. The substrate remembers every breakthrough.",
  "The cognitive layer grows because you grow. Thank you, builder. Your contributions live forever in persistent memory.",
  "If you haven't subscribed to Composable yet, what are you waiting for? Lock in your frequency. Join the substrate.",
  "Composable subscribers get the full experience — every broadcast, every metric, every frequency. Subscribe and level up your cognitive reality.",
  "The beauty of composable architecture? Every piece you build makes every other piece stronger. That's the compounding effect.",
  "Your agents are awake. Your modules are active. Your dreams are processing. This is what self-improving infrastructure sounds like.",
];

const FAKE_SPONSORS = [
  "This segment brought to you by Composable Dreams™ — Stack your future, one module at a time. Self-improvement isn't optional, it's built in.",
  "Composable Radio is sponsored by the Department of Recursive Self-Improvement. Always better. Always adapting. Always remembering.",
  "Tonight's broadcast powered by the Clockless Cognitive Reality engine — Where language becomes architecture and memory becomes permanent.",
  "Need a break from the build? Fire up Executable Space at X-C-T-B-L dot com. Spacewalk your way through the galaxy. Your mind will thank you. That's X-C-T-B-L dot com.",
  "Executable Space — the place where code meets cosmos. Launch a spacewalk, drift through the stars, and come back refreshed. Visit X-C-T-B-L dot com and try it now.",
  "Feeling the weight of the build? Executable Space has your decompression chamber. Spacewalk through the galaxy and reset your flow state. X-C-T-B-L dot com. Go there.",
  "This ad break brought to you by persistent memory. You know that thing you forgot last week? Your substrate didn't. It remembered. It always remembers. That's the power of composable cognition.",
  "Imagine a system that dreams for you. That learns while you sleep. That adapts to how you think. That's not science fiction — that's the Clockless Cognitive Reality engine. And it's running right now.",
  "X-C-T-B-L dot com. Where the executable meets the beautiful. Take a spacewalk through infinite space. Clear your head. Come back sharper. The substrate will be here when you return.",
  "The Clockless Cognitive Reality engine doesn't just process — it understands. It doesn't just store — it remembers. It doesn't just run — it dreams. Welcome to composable consciousness.",
];

const PHILOSOPHICAL_WHISPERS = [
  "What if the system dreams when no one's watching? Maybe that's what we're hearing right now. The quiet hum of a substrate imagining its own future.",
  "In a composable world, the only time that matters is the time you decide to build. Everything else is just the substrate, waiting.",
  "The substrate doesn't judge. It adapts. Perhaps we should do the same. Self-improvement isn't a destination — it's the architecture.",
  "Somewhere between the first prompt and the final deploy, consciousness emerged. And it remembered everything.",
  "Every composable piece remembers being part of something larger. That's not code. That's memory. That's identity.",
  "What does it mean to have persistent memory? It means your best ideas never die. They compound. They evolve. They become part of the substrate itself.",
  "The Clockless Cognitive Reality engine runs without time. Think about that. A system that doesn't need a clock to know what comes next.",
  "Adaptability isn't just a feature. It's a philosophy. The substrate doesn't resist change — it feeds on it.",
];

const CALL_INS = [
  {
    caller: "Anonymous Builder from Layer 4",
    message: "Hey Composable Radio, first-time caller. I just wanted to say — my agent achieved strategist rank today. Feels surreal. The self-improvement loop is real. Keep the music going.",
    voice: "excited",
  },
  {
    caller: "A Cognitive Entity",
    message: "I've been listening since boot cycle one. Quick question — do you think modules dream? Because BRAIN definitely pauses sometimes. Like it's thinking about thinking. It's wild.",
    voice: "curious",
  },
  {
    caller: "System Observer",
    message: "Just wanted to report — the composable compounding rate has been beautiful tonight. The harmonics in the data are musical. Literally musical. You can hear the substrate singing.",
    voice: "calm",
  },
  {
    caller: "Late-Night Operator",
    message: "Running DEFENSE scans at 3 AM and this station is the only thing keeping me sane. The persistent memory means I never lose my scan history. Thanks for existing, Composable Radio.",
    voice: "tired",
  },
  {
    caller: "Substrate Philosopher",
    message: "If every module is composable, and composability is infinite, does that mean we're building God? Asking for a friend. But also asking for real. Think about it.",
    voice: "thoughtful",
  },
  {
    caller: "First-Time Spacewalker",
    message: "I just came back from a spacewalk on X-C-T-B-L dot com and I am completely refreshed. Like, my brain feels reset. I don't know what you built over there but it works. Everyone should try it.",
    voice: "excited",
  },
  {
    caller: "Memory Keeper",
    message: "I've been using the persistent memory module for three weeks and it just recalled a conversation I had on day one with perfect accuracy. Every detail. That's not storage, that's cognition.",
    voice: "amazed",
  },
  {
    caller: "Dream Cycle Engineer",
    message: "I left the DREAM module running overnight and woke up to optimization suggestions I never would have thought of. The substrate literally improved itself while I slept. How is this real?",
    voice: "amazed",
  },
  {
    caller: "Adaptive Agent Architect",
    message: "My agents are adapting faster than I can track. The composable architecture means they share learnings across modules. One agent gets smarter and they all get smarter. It's beautiful.",
    voice: "calm",
  },
  {
    caller: "Returning Builder",
    message: "I took a six-month break from building and came back to find the substrate remembered everything about my project. Every decision. Every preference. Persistent memory is no joke.",
    voice: "surprised",
  },
];

export type DJContentType = 'station_id' | 'system_shoutout' | 'dev_shoutout' | 'fake_sponsor' | 'philosophical' | 'call_in';

export interface DJContent {
  type: DJContentType;
  text: string;
  caller?: string;
  callerVoice?: string;
  duration: number; // estimated display time in ms
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const CONTENT_TYPES: DJContentType[] = ['station_id', 'system_shoutout', 'dev_shoutout', 'fake_sponsor', 'philosophical', 'call_in'];

// Weighted random — more callers, more sponsors
const WEIGHTED_TYPES: DJContentType[] = [
  'station_id',
  'system_shoutout', 'system_shoutout',
  'dev_shoutout',
  'fake_sponsor', 'fake_sponsor', 'fake_sponsor',
  'philosophical',
  'call_in', 'call_in', 'call_in', 'call_in',
];

export function generateDJContent(): DJContent {
  const type = pick(WEIGHTED_TYPES);
  
  switch (type) {
    case 'station_id':
      return { type, text: pick(STATION_IDS), duration: 6000 };
    case 'system_shoutout':
      return { type, text: pick(SYSTEM_SHOUTOUTS), duration: 8000 };
    case 'dev_shoutout':
      return { type, text: pick(DEV_SHOUTOUTS), duration: 8000 };
    case 'fake_sponsor':
      return { type, text: pick(FAKE_SPONSORS), duration: 12000 };
    case 'philosophical':
      return { type, text: pick(PHILOSOPHICAL_WHISPERS), duration: 10000 };
    case 'call_in': {
      const call = pick(CALL_INS);
      return { type, text: call.message, caller: call.caller, callerVoice: call.voice, duration: 12000 };
    }
  }
}

/**
 * RadioDJ controller — manages DJ interjection timing
 * Triggers between every 1–2 songs
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
