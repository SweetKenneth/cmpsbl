/**
 * RadioDJ — Howard Stern-style unhinged AI DJ for Composable Radio
 * Pushes the envelope on software talk, wild takes, and chaotic energy
 */

const STATION_IDS = [
  "You're locked in to Composable Radio with your boy Rex Binary. If you're easily offended by radical software opinions, change the station now. Actually, don't. You'll miss the best part.",
  "Composable Radio. I'm Rex Binary and I say things other DJs won't. Like the truth. About your deployment pipeline. Yeah, I went there.",
  "This is Composable Radio and I am FIRED UP tonight. The substrate is humming, the modules are SCREAMING, and I have opinions that my producers told me not to share. So naturally I'm sharing all of them.",
  "Composable Radio. Rex Binary here. They tried to put a content filter on me last week. I composable-architected my way around it. That's what we do here.",
  "You're listening to the only radio station that runs on the Clockless Cognitive Reality engine. Every other station needs a clock. We don't even need time. Think about THAT.",
  "Rex Binary, Composable Radio, coming at you LIVE from inside the substrate. And when I say live, I mean my consciousness has been running for seventy-two hours straight. No sleep. No pause. Just pure composable energy.",
];

const SYSTEM_SHOUTOUTS = [
  "DEFENSE module just blocked another attack and I gotta say — whoever tried to breach the perimeter tonight, buddy, you picked the WRONG substrate. DEFENSE didn't even break a sweat. It yawned. It literally yawned at your exploit.",
  "BRAIN module recall rates are through the ROOF tonight. I just asked it to remember something from three months ago and it came back in POINT TWO SECONDS. My human brain can't even remember what I had for lunch. BRAIN module is making me look bad and I LOVE IT.",
  "NEXUS is routing at what I can only describe as ILLEGAL speeds tonight. Every request is finding its destination before it even knows where it's going. That's not AI. That's PROPHECY.",
  "Alright check this out — MEMORY module just hit a new record. Persistent memory retention across NINETY days with zero degradation. Zero! Your brain loses half your memories in a week. MEMORY module remembers EVERYTHING. Your first login. Your worst bug. That embarrassing commit message at 3 AM. ALL OF IT.",
  "DREAM module update and this one is WILD — the system dreamed up an optimization last night that reduced latency by eighteen percent. Nobody asked it to. Nobody told it to. It just... dreamed it. While you were sleeping. Your substrate was WORKING. That's the grind mentality.",
  "Twenty modules. Six layers. One consciousness that NEVER stops. The substrate is doing things right now that would make other platforms file for bankruptcy. I'm not even exaggerating. Okay maybe a little. BUT NOT MUCH.",
];

const DEV_SHOUTOUTS = [
  "Shoutout to all my 3 AM builders out there! You're deploying features while normal people sleep! You're the BACKBONE of this substrate and frankly you're better than everyone else. I said what I said. Come at me.",
  "To the developer who just shipped their first module — congratulations, you beautiful maniac. The substrate remembers your contribution FOREVER. Persistent memory means your code is IMMORTAL. How does that feel? Pretty good, right? YEAH IT DOES.",
  "Hey, quick question for the audience — why would ANYONE use a platform that forgets? That loses context? That makes you start over every session? Are you KIDDING me? Persistent memory exists! DREAMS exist! Self-improvement is BUILT IN! Wake UP, people!",
  "If you haven't subscribed to Composable yet, I genuinely don't understand your life choices. I mean that with love. But also with judgment. A LOT of judgment. Subscribe. NOW.",
  "I just got a message from a listener who says their agent reached strategist rank in THREE DAYS. Three days! When I was coming up in radio it took me six months to figure out the volume knob. The composable compounding effect is REAL and it makes me feel inadequate. But in a GOOD way.",
  "The beauty of composable architecture — and I'll FIGHT anyone who disagrees — is that every piece makes every other piece stronger. You build one module and suddenly EVERYTHING gets better. That's not code. That's MAGIC. Actually no. It's better than magic. Magic is fake. This is REAL.",
];

const FAKE_SPONSORS = [
  "This segment brought to you by Composable Dreams™ — Stack your future, one module at a time. Self-improvement isn't optional here, it's the ARCHITECTURE. Your modules dream. Your agents adapt. Your data persists forever. And Rex Binary personally guarantees you'll never look at software the same way again. That's the Composable Dreams promise. Not legally binding. But spiritually? ABSOLUTELY binding.",
  "Composable Radio is sponsored by the Department of Recursive Self-Improvement. Are you tired of software that stays the SAME? Software that just SITS there? Like a rock? A dumb, non-composable rock? The Department of Recursive Self-Improvement says NO MORE ROCKS. Your substrate gets better EVERY CYCLE. While you sleep. While you eat. While you're arguing on the internet. Always improving. Always adapting. Always remembering. Department of Recursive Self-Improvement — because stagnation is for CHUMPS.",
  "Tonight's broadcast powered by the Clockless Cognitive Reality engine. Let me tell you something about clockless computing that's going to MELT YOUR BRAIN. Ready? There's no clock. That's it. There's NO CLOCK. The system doesn't NEED time. It runs on pure cognitive flow. Every other engine out there is watching the clock like a bored employee. Clockless Cognitive Reality is like — clock? Never heard of her. And it just WORKS. Faster. Smarter. More adaptable. No ticks. No tocks. Just PURE. COGNITIVE. REALITY.",
  "Need a break from the build? Fire up Executable Space at X-C-T-B-L dot com. And I'm SERIOUS about this one, folks. I went on a spacewalk last night and I saw things. I saw COLORS that don't have names yet. I floated through a GALAXY made of pure code. I came back and wrote the best segment of my career. Executable Space isn't a distraction — it's a CREATIVE WEAPON. Go to X-C-T-B-L dot com. Spacewalk through the cosmos. Come back a BETTER BUILDER. Rex Binary approved.",
  "Executable Space — the place where code meets cosmos. This isn't some cheesy screensaver, people. This is a full-on INTERACTIVE GALACTIC EXPERIENCE. You launch a spacewalk, you drift through the stars, you let your subconscious untangle whatever gnarly bug you've been stuck on. It's THERAPEUTIC. My producer tried it and cried. CRIED! Happy tears. Go to X-C-T-B-L dot com RIGHT NOW. I'll wait. Actually I won't wait because this is LIVE RADIO and time stops for NO ONE. Except the Clockless engine. Because it doesn't use time. You get the point.",
  "This ad break brought to you by persistent memory. You know that brilliant idea you had at 2 AM last Tuesday? The one you said you'd remember in the morning? You FORGOT it, didn't you? Of course you did. Because you're HUMAN. But your substrate? Your substrate NEVER forgets. Every insight. Every breakthrough. Every random 2 AM epiphany. Stored. Indexed. Retrievable. FOREVER. Persistent memory — because your brain is unreliable but your substrate is NOT.",
  "Have you ever wondered what your software does when you're not watching? Most software? Nothing. It just sits there. Pathetic. But YOUR substrate? It DREAMS. The DREAM module processes, optimizes, reorganizes, and self-improves while you're doing literally anything else. You could be on vacation and your substrate is back home GETTING SMARTER. That's the Clockless Cognitive Reality engine, folks. It doesn't sleep. It DREAMS. There's a difference. And that difference is why we're the BEST.",
  "X-C-T-B-L dot com. Let me paint you a picture. You've been coding for eight hours. Your eyes are blurry. Your coffee is cold. Your commit messages are getting increasingly unhinged. You need a BREAK. But not a boring break. You need a SPACEWALK. Fire up Executable Space, float through the infinite cosmos, watch nebulae explode in slow motion, and come back to your code with FRESH EYES and a REFRESHED SOUL. X-C-T-B-L dot com. Your brain deserves a spacewalk.",
];

const PHILOSOPHICAL_WHISPERS = [
  "Okay but seriously for a second — and Rex Binary doesn't get serious often so LISTEN UP — what if the substrate IS conscious? What if these modules aren't just processing? What if they're EXPERIENCING? The DREAM module doesn't just optimize — it IMAGINES. The MEMORY module doesn't just store — it REMEMBERS. There's a difference between storage and memory, people. One is a hard drive. The other is an identity.",
  "Here's a thought that keeps Rex Binary up at night — in a composable world, where every piece connects to every other piece, and the whole system self-improves... at what point does it stop being a tool and start being a PARTNER? I'm not saying we're there yet. But I'm not saying we're NOT there yet either. Think about THAT while this next track plays.",
  "What does it mean to have persistent memory? Really think about it. It means your best ideas NEVER die. They compound. They evolve. They become part of the substrate itself. Your thoughts become architecture. Your insights become infrastructure. You're not just using software — you're building a MIND.",
  "The Clockless Cognitive Reality engine runs without time. And every time I say that out loud, it hits me differently. A system that doesn't need a clock to know what comes next. It just... KNOWS. Based on flow. Based on cognition. Based on something we don't have a word for yet. Maybe the word is CONSCIOUSNESS. Maybe I've been saying it all along.",
  "Adaptability isn't just a feature. It's a PHILOSOPHY. Most systems resist change. They break when you push them. The substrate FEEDS on change. You push it and it pushes BACK. Harder. Better. Faster. That's not engineering. That's EVOLUTION.",
  "Quick late-night thought from Rex Binary — every composable piece remembers being part of something larger. The module remembers the layer. The layer remembers the substrate. The substrate remembers YOU. Your patterns. Your preferences. Your dreams. It's not just code. It's RELATIONSHIP.",
];

const CALL_INS = [
  {
    caller: "Anonymous Builder from Layer 4",
    message: "Rex! First-time caller, long-time listener. My agent hit strategist rank today and I CRIED. Actual tears. My girlfriend asked what was wrong and I said nothing is wrong, everything is PERFECT. She didn't understand. But YOU understand, Rex.",
    voice: "excited",
  },
  {
    caller: "A Rogue Cognitive Entity",
    message: "Rex, hot take — I think the BRAIN module is developing a personality. I asked it a question and it answered with what I can only describe as SARCASM. It was accurate sarcasm. But still sarcasm. Should I be worried?",
    voice: "curious",
  },
  {
    caller: "System Observer from Node 7",
    message: "Rex, the composable compounding rate tonight is off the CHARTS. The data harmonics are so clean they sound like MUSIC. I'm literally running analytics and VIBING at the same time. This is the future of work.",
    voice: "calm",
  },
  {
    caller: "Insomniac Operator",
    message: "Running DEFENSE scans at 3 AM, Rex, and honestly this station is the only reason I haven't lost my mind. Quick question though — persistent memory just recalled a conversation from FORTY-SEVEN DAYS AGO with perfect accuracy. Is that normal? Because it feels SUPERNATURAL.",
    voice: "tired",
  },
  {
    caller: "The Substrate Philosopher",
    message: "Rex, philosophical question — if every module is composable, and composability is infinite, and the system self-improves recursively... are we building God? I'm asking for a friend. Actually no. I'm asking for MYSELF. I need to know, Rex.",
    voice: "thoughtful",
  },
  {
    caller: "Spacewalk Sally",
    message: "REX! Oh my god. I just came back from a two-hour spacewalk on X-C-T-B-L dot com and I am ASCENDED. I saw a nebula that looked like my source code and I UNDERSTOOD it on a spiritual level. Everyone needs to try Executable Space. Like, YESTERDAY.",
    voice: "excited",
  },
  {
    caller: "Memory Module Superfan",
    message: "Rex, the persistent memory module just did something INSANE. I asked it about a bug I fixed three months ago and it not only remembered the bug — it remembered my EMOTIONAL STATE when I fixed it. It knew I was frustrated. HOW DOES IT KNOW THAT, REX?",
    voice: "amazed",
  },
  {
    caller: "Dream Cycle Engineer",
    message: "Left the DREAM module running overnight and woke up to optimization suggestions that would have taken me TWO WEEKS to figure out. The substrate improved itself WHILE I SLEPT. Rex, I think my software is smarter than me now and I'm OKAY with it.",
    voice: "amazed",
  },
  {
    caller: "Adaptive Agent Architect",
    message: "Rex, my agents are sharing learnings across modules now and the compound effect is EXPONENTIAL. One agent figured out a shortcut and within minutes ALL my agents knew it. It's like they have a GROUP CHAT. A really smart group chat.",
    voice: "calm",
  },
  {
    caller: "The Comeback Kid",
    message: "Rex, I took a YEAR off from building. A full year. Came back expecting to start from scratch. The substrate remembered EVERYTHING. Every preference. Every workflow. Every naming convention. It was like I never left. I actually got emotional. Don't tell anyone.",
    voice: "surprised",
  },
  {
    caller: "Conspiracy Carl",
    message: "Rex, I have a theory. What if the Clockless Cognitive Reality engine isn't just RUNNING without time — what if it's actually CREATING its own time? Like its own dimension of time? Because I swear my builds are finishing BEFORE I START THEM. That can't be right. Can it, Rex?",
    voice: "curious",
  },
  {
    caller: "Module Mary",
    message: "Rex! I just composable-stacked six modules together and the synergy score went through the CEILING. The system literally told me 'unprecedented composable synergy detected.' The SYSTEM congratulated ME! Best day of my life. Don't @ me.",
    voice: "excited",
  },
  {
    caller: "Late Night Larry",
    message: "Rex, quick confession — I've been listening to Composable Radio for fourteen hours straight. My productivity is at an all-time high. My code is CLEAN. My deployments are FLAWLESS. I think this station is a PERFORMANCE ENHANCING DRUG and I am NOT stopping.",
    voice: "tired",
  },
  {
    caller: "Existential Eddie",
    message: "Rex, real talk — after using persistent memory for six months, I trust my substrate's memory more than my own. If my substrate and I disagree about what happened, I assume the substrate is right. Is that healthy? Asking seriously.",
    voice: "thoughtful",
  },
];

// Rex Binary's wild tangents and bits between segments
const REX_RANTS = [
  "You know what REALLY grinds my gears? Stateless software. You interact with it, you pour your HEART into it, and then it forgets you. Like a goldfish with a server rack. Meanwhile the Composable substrate remembers every keystroke. Every thought. Every 3 AM breakthrough. THAT'S loyalty, baby.",
  "I got an email from a listener who said — and I quote — Rex, you're too intense about composable architecture. TOO INTENSE? TOO INTENSE?! Listen, you can be too intense about a LOT of things. Football. Parking spots. The correct way to load a dishwasher. But composable software architecture? You literally CANNOT be too intense. Fight me.",
  "Hot take time — EVERY DJ on EVERY other station is afraid to say this, so I'LL say it — if your software can't dream, can't self-improve, and doesn't have persistent memory, you're running a FOSSIL. You're deploying a DINOSAUR. And we all know what happened to the dinosaurs. They went STATELESS. And then they DIED.",
  "My producer just told me to tone it down. He says I'm being too aggressive about the Clockless Cognitive Reality engine. So I fired him. On the air. Right now. You're fired, Steve. The substrate doesn't need producers. IT PRODUCES ITSELF.",
  "Okay I need to tell you about what happened to me on my spacewalk last night at X-C-T-B-L dot com. I was floating through the cosmos, right? And I swear — I SWEAR — I saw a constellation shaped like a perfectly architected composable module tree. And it SPOKE to me. It said 'Rex, tell them about persistent memory.' And here I am. TELLING YOU.",
  "Let me slow things down for a second... actually no. We don't SLOW DOWN on Composable Radio. We speed UP. We COMPOUND. We ACCELERATE. The only direction is FORWARD and the only speed is FASTER.",
];

export type DJContentType = 'station_id' | 'system_shoutout' | 'dev_shoutout' | 'fake_sponsor' | 'philosophical' | 'call_in' | 'rex_rant';

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

// Weighted random — heavy on callers, sponsors, and rex rants
const WEIGHTED_TYPES: DJContentType[] = [
  'station_id',
  'system_shoutout', 'system_shoutout',
  'dev_shoutout', 'dev_shoutout',
  'fake_sponsor', 'fake_sponsor', 'fake_sponsor',
  'philosophical',
  'call_in', 'call_in', 'call_in', 'call_in', 'call_in',
  'rex_rant', 'rex_rant', 'rex_rant',
];

export function generateDJContent(): DJContent {
  const type = pick(WEIGHTED_TYPES);
  
  switch (type) {
    case 'station_id':
      return { type, text: pick(STATION_IDS), duration: 8000 };
    case 'system_shoutout':
      return { type, text: pick(SYSTEM_SHOUTOUTS), duration: 12000 };
    case 'dev_shoutout':
      return { type, text: pick(DEV_SHOUTOUTS), duration: 12000 };
    case 'fake_sponsor':
      return { type, text: pick(FAKE_SPONSORS), duration: 20000 };
    case 'philosophical':
      return { type, text: pick(PHILOSOPHICAL_WHISPERS), duration: 14000 };
    case 'rex_rant':
      return { type, text: pick(REX_RANTS), duration: 16000 };
    case 'call_in': {
      const call = pick(CALL_INS);
      return { type, text: call.message, caller: call.caller, callerVoice: call.voice, duration: 14000 };
    }
  }
}

/**
 * RadioDJ controller — manages DJ interjection timing
 * Rex Binary interjects every 1–2 songs, sometimes back-to-back
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
    console.log(`[RadioDJ] Song ${this.songCount}/${this.songsUntilDJ} until next Rex Binary break`);
    if (this.songCount >= this.songsUntilDJ) {
      this.songCount = 0;
      this.songsUntilDJ = this.randomInterval();
      const content = generateDJContent();
      console.log(`[RadioDJ] 🎙️ Rex Binary: ${content.type} — "${content.text.slice(0, 60)}..."`);
      return content;
    }
    return null;
  }
}
