/**
 * RadioTTS — Free browser-native speech synthesis for Clockless Radio
 * Uses Web Speech API (SpeechSynthesis) — zero cost, no API keys
 */

import type { DJContent } from './dj';

/** Voice configuration per content type */
const VOICE_CONFIG: Record<string, { rate: number; pitch: number }> = {
  station_id:      { rate: 1.05, pitch: 0.9 },
  system_shoutout: { rate: 1.0,  pitch: 1.0 },
  dev_shoutout:    { rate: 1.0,  pitch: 1.05 },
  fake_sponsor:    { rate: 0.95, pitch: 0.85 },
  philosophical:   { rate: 0.85, pitch: 0.8 },
  call_in:         { rate: 1.1,  pitch: 1.15 },
  rex_rant:        { rate: 1.15, pitch: 0.95 },
};

/** Caller voice modifiers — shift pitch/rate to differentiate callers */
const CALLER_VOICE_MAP: Record<string, { rate: number; pitch: number }> = {
  excited:    { rate: 1.2, pitch: 1.3 },
  curious:    { rate: 1.0, pitch: 1.1 },
  calm:       { rate: 0.9, pitch: 0.95 },
  tired:      { rate: 0.85, pitch: 0.8 },
  thoughtful: { rate: 0.85, pitch: 0.9 },
  amazed:     { rate: 1.15, pitch: 1.2 },
  surprised:  { rate: 1.1, pitch: 1.25 },
};

let selectedVoice: SpeechSynthesisVoice | null = null;

function getVoice(): SpeechSynthesisVoice | null {
  if (selectedVoice) return selectedVoice;
  if (!('speechSynthesis' in window)) return null;

  const voices = speechSynthesis.getVoices();
  // Prefer English male-sounding voices for Rex Binary
  const preferred = [
    'Google UK English Male',
    'Daniel',
    'Alex',
    'Google US English',
    'Microsoft David',
    'Microsoft Mark',
  ];

  for (const name of preferred) {
    const match = voices.find(v => v.name.includes(name));
    if (match) { selectedVoice = match; return match; }
  }

  // Fallback: any English voice
  const english = voices.find(v => v.lang.startsWith('en'));
  if (english) { selectedVoice = english; return english; }

  return voices[0] || null;
}

// Ensure voices are loaded (they load async in some browsers)
if ('speechSynthesis' in window) {
  speechSynthesis.onvoiceschanged = () => {
    selectedVoice = null;
    getVoice();
  };
}

/**
 * Speak DJ content using Web Speech API.
 * Returns a Promise that resolves when speech ends.
 */
export function speakDJContent(content: DJContent): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      resolve(); // Silently skip if not supported
      return;
    }

    // Cancel any in-progress speech
    speechSynthesis.cancel();

    const config = VOICE_CONFIG[content.type] || { rate: 1.0, pitch: 1.0 };

    // For call-ins: speak the caller intro first, then the message
    if (content.type === 'call_in' && content.caller) {
      const callerMod = CALLER_VOICE_MAP[content.callerVoice || 'excited'] || { rate: 1.1, pitch: 1.15 };

      // Rex intro
      const intro = new SpeechSynthesisUtterance(
        `We've got a caller! ${content.caller}, you're on Composable Radio.`
      );
      intro.voice = getVoice();
      intro.rate = config.rate;
      intro.pitch = config.pitch;
      intro.volume = 1.0;

      // Caller message
      const callerMsg = new SpeechSynthesisUtterance(content.text);
      callerMsg.voice = getVoice();
      callerMsg.rate = callerMod.rate;
      callerMsg.pitch = callerMod.pitch;
      callerMsg.volume = 1.0;

      callerMsg.onend = () => resolve();
      callerMsg.onerror = (e) => {
        if (e.error === 'canceled' || e.error === 'interrupted') resolve();
        else reject(e);
      };

      speechSynthesis.speak(intro);
      speechSynthesis.speak(callerMsg);
      return;
    }

    // Standard DJ content
    const utterance = new SpeechSynthesisUtterance(content.text);
    utterance.voice = getVoice();
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = 1.0;

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') resolve();
      else reject(e);
    };

    speechSynthesis.speak(utterance);
  });
}

/** Cancel any in-progress TTS */
export function cancelTTS(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

/** Check if Web Speech API is available */
export function isTTSAvailable(): boolean {
  return 'speechSynthesis' in window;
}
