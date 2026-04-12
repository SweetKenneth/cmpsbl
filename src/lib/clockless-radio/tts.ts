/**
 * RadioTTS — Free browser-native speech synthesis for Clockless Radio
 * Uses Web Speech API (SpeechSynthesis) — zero cost, no API keys
 */

import type { DJContent } from './dj';

const VOICE_CONFIG: Record<string, { rate: number; pitch: number }> = {
  station_id: { rate: 1.05, pitch: 0.9 },
  system_shoutout: { rate: 1.0, pitch: 1.0 },
  dev_shoutout: { rate: 1.0, pitch: 1.05 },
  fake_sponsor: { rate: 0.95, pitch: 0.85 },
  philosophical: { rate: 0.85, pitch: 0.8 },
  call_in: { rate: 1.1, pitch: 1.15 },
  rex_rant: { rate: 1.15, pitch: 0.95 },
};

const CALLER_VOICE_MAP: Record<string, { rate: number; pitch: number }> = {
  excited: { rate: 1.2, pitch: 1.3 },
  curious: { rate: 1.0, pitch: 1.1 },
  calm: { rate: 0.9, pitch: 0.95 },
  tired: { rate: 0.85, pitch: 0.8 },
  thoughtful: { rate: 0.85, pitch: 0.9 },
  amazed: { rate: 1.15, pitch: 1.2 },
  surprised: { rate: 1.1, pitch: 1.25 },
};

let selectedVoice: SpeechSynthesisVoice | null = null;
let isPrimed = false;

function getVoice(): SpeechSynthesisVoice | null {
  if (selectedVoice) return selectedVoice;
  if (!('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  const preferred = [
    'Google UK English Male',
    'Daniel',
    'Alex',
    'Google US English',
    'Microsoft David',
    'Microsoft Mark',
  ];

  for (const name of preferred) {
    const match = voices.find((voice) => voice.name.includes(name));
    if (match) {
      selectedVoice = match;
      return match;
    }
  }

  const englishVoice = voices.find((voice) => voice.lang.startsWith('en'));
  if (englishVoice) {
    selectedVoice = englishVoice;
    return englishVoice;
  }

  return voices[0] || null;
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {
    selectedVoice = null;
    getVoice();
  };
}

export async function primeTTS(): Promise<void> {
  if (!('speechSynthesis' in window) || isPrimed) return;

  getVoice();

  await new Promise<void>((resolve) => {
    try {
      const utterance = new SpeechSynthesisUtterance(' ');
      utterance.voice = getVoice();
      utterance.lang = 'en-US';
      utterance.volume = 0;
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    } catch {
      resolve();
    }
  });

  isPrimed = true;
}

export function speakDJContent(content: DJContent): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const config = VOICE_CONFIG[content.type] || { rate: 1.0, pitch: 1.0 };

    if (content.type === 'call_in' && content.caller) {
      const callerConfig = CALLER_VOICE_MAP[content.callerVoice || 'excited'] || {
        rate: 1.1,
        pitch: 1.15,
      };

      const intro = new SpeechSynthesisUtterance(
        `We've got a caller. ${content.caller}, you're on Clockless Radio.`
      );
      intro.voice = getVoice();
      intro.lang = 'en-US';
      intro.rate = config.rate;
      intro.pitch = config.pitch;
      intro.volume = 1;

      const callerMessage = new SpeechSynthesisUtterance(content.text);
      callerMessage.voice = getVoice();
      callerMessage.lang = 'en-US';
      callerMessage.rate = callerConfig.rate;
      callerMessage.pitch = callerConfig.pitch;
      callerMessage.volume = 1;

      callerMessage.onend = () => resolve();
      callerMessage.onerror = (event) => {
        if (event.error === 'canceled' || event.error === 'interrupted') {
          resolve();
          return;
        }
        reject(event);
      };

      window.speechSynthesis.speak(intro);
      window.speechSynthesis.speak(callerMessage);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(content.text);
    utterance.voice = getVoice();
    utterance.lang = 'en-US';
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = 1;

    utterance.onend = () => resolve();
    utterance.onerror = (event) => {
      if (event.error === 'canceled' || event.error === 'interrupted') {
        resolve();
        return;
      }
      reject(event);
    };

    window.speechSynthesis.speak(utterance);
  });
}

export function cancelTTS(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function isTTSAvailable(): boolean {
  return 'speechSynthesis' in window;
}
