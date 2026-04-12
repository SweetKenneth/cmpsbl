/**
 * RadioSFX — Procedural sound effects for Clockless Radio
 * ALL audio routed through the shared AudioContext so it plays on paired Bluetooth devices.
 * Zero external dependencies. Pure Web Audio API synthesis.
 */

import type { DJContentType } from './dj';

// ═══════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════

export type SFXType =
  | 'station_jingle'     // 3-note ascending chime for station IDs
  | 'commercial_break'   // "We'll be right back" cha-ching
  | 'call_incoming'      // Retro phone ring
  | 'rex_intro'          // Bass drop + static burst for Rex rants
  | 'philosophical_pad'  // Ethereal drone pad
  | 'transition_swoosh'  // Track transition whoosh
  | 'vinyl_crackle'      // Ambient vinyl warmth (loopable)
  | 'blip'               // Random ear-candy chirp
  | 'tune_in'            // Radio dial tuning on first play
  | 'sign_off'           // Descending chime on stop;

// Map DJ content types → intro SFX
const DJ_SFX_MAP: Record<DJContentType, SFXType> = {
  station_id: 'station_jingle',
  system_shoutout: 'blip',
  dev_shoutout: 'blip',
  fake_sponsor: 'commercial_break',
  philosophical: 'philosophical_pad',
  call_in: 'call_incoming',
  rex_rant: 'rex_intro',
};

// ═══════════════════════════════════════════════════════════════════
// ENGINE
// ═══════════════════════════════════════════════════════════════════

export class RadioSFX {
  private ctx: AudioContext;
  private master: GainNode;
  private crackleNode: AudioBufferSourceNode | null = null;
  private crackleGain: GainNode | null = null;
  private _crackleActive = false;

  constructor(ctx: AudioContext, masterGain: GainNode) {
    this.ctx = ctx;
    this.master = masterGain;
  }

  /** Get the intro SFX type for a DJ content type */
  static sfxForDJ(type: DJContentType): SFXType {
    return DJ_SFX_MAP[type];
  }

  /** Play any SFX type and return a promise that resolves when done */
  async play(type: SFXType): Promise<void> {
    switch (type) {
      case 'station_jingle': return this.stationJingle();
      case 'commercial_break': return this.commercialBreak();
      case 'call_incoming': return this.callIncoming();
      case 'rex_intro': return this.rexIntro();
      case 'philosophical_pad': return this.philosophicalPad();
      case 'transition_swoosh': return this.transitionSwoosh();
      case 'blip': return this.blip();
      case 'tune_in': return this.tuneIn();
      case 'sign_off': return this.signOff();
      case 'vinyl_crackle': return this.startCrackle();
    }
  }

  // ─── Station ID Jingle — 3-note ascending chime ───────────────
  private stationJingle(): Promise<void> {
    return new Promise((resolve) => {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.18);
        gain.gain.linearRampToValueAtTime(0.25, now + i * 0.18 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.5);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now + i * 0.18);
        osc.stop(now + i * 0.18 + 0.55);
      });

      // Subtle shimmer overtone
      const shimmer = this.ctx.createOscillator();
      const shimGain = this.ctx.createGain();
      shimmer.type = 'triangle';
      shimmer.frequency.value = 1567.98; // G6
      shimGain.gain.setValueAtTime(0, now + 0.4);
      shimGain.gain.linearRampToValueAtTime(0.08, now + 0.5);
      shimGain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      shimmer.connect(shimGain);
      shimGain.connect(this.master);
      shimmer.start(now + 0.4);
      shimmer.stop(now + 1.3);

      setTimeout(resolve, 1300);
    });
  }

  // ─── Commercial Break — cha-ching cash register ───────────────
  private commercialBreak(): Promise<void> {
    return new Promise((resolve) => {
      const now = this.ctx.currentTime;

      // Two metallic clinks
      [0, 0.12].forEach((offset) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.value = 2400 + offset * 800;
        gain.gain.setValueAtTime(0.2, now + offset);
        gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.08);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now + offset);
        osc.stop(now + offset + 0.1);
      });

      // Register bell
      const bell = this.ctx.createOscillator();
      const bellGain = this.ctx.createGain();
      bell.type = 'sine';
      bell.frequency.value = 3135; // G7-ish
      bellGain.gain.setValueAtTime(0.15, now + 0.25);
      bellGain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      bell.connect(bellGain);
      bellGain.connect(this.master);
      bell.start(now + 0.25);
      bell.stop(now + 1.0);

      setTimeout(resolve, 1000);
    });
  }

  // ─── Call Incoming — retro phone ring ─────────────────────────
  private callIncoming(): Promise<void> {
    return new Promise((resolve) => {
      const now = this.ctx.currentTime;

      // Two-tone ring (classic 440+480 Hz dual tone)
      for (let ring = 0; ring < 2; ring++) {
        const offset = ring * 0.8;
        [440, 480].forEach((freq) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.value = freq;
          gain.gain.setValueAtTime(0.12, now + offset);
          gain.gain.setValueAtTime(0.12, now + offset + 0.3);
          gain.gain.linearRampToValueAtTime(0, now + offset + 0.35);
          osc.connect(gain);
          gain.connect(this.master);
          osc.start(now + offset);
          osc.stop(now + offset + 0.4);
        });
      }

      setTimeout(resolve, 1600);
    });
  }

  // ─── Rex Intro — low bass hit + static burst ──────────────────
  private rexIntro(): Promise<void> {
    return new Promise((resolve) => {
      const now = this.ctx.currentTime;

      // Sub bass impact
      const bass = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bass.type = 'sine';
      bass.frequency.setValueAtTime(80, now);
      bass.frequency.exponentialRampToValueAtTime(30, now + 0.4);
      bassGain.gain.setValueAtTime(0.4, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      bass.connect(bassGain);
      bassGain.connect(this.master);
      bass.start(now);
      bass.stop(now + 0.6);

      // Static burst (white noise)
      this.noiseHit(now + 0.05, 0.3, 0.18);

      // High freq sizzle
      const sizzle = this.ctx.createOscillator();
      const sizzGain = this.ctx.createGain();
      sizzle.type = 'sawtooth';
      sizzle.frequency.value = 6000;
      sizzGain.gain.setValueAtTime(0.06, now + 0.05);
      sizzGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      sizzle.connect(sizzGain);
      sizzGain.connect(this.master);
      sizzle.start(now + 0.05);
      sizzle.stop(now + 0.3);

      setTimeout(resolve, 600);
    });
  }

  // ─── Philosophical Pad — ethereal drone ───────────────────────
  private philosophicalPad(): Promise<void> {
    return new Promise((resolve) => {
      const now = this.ctx.currentTime;
      const duration = 2.5;

      // Two detuned sine waves for warmth
      [261.63, 265.0].forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.8);
        gain.gain.linearRampToValueAtTime(0.08, now + duration - 0.8);
        gain.gain.linearRampToValueAtTime(0, now + duration);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now);
        osc.stop(now + duration + 0.1);
      });

      // Fifth harmony above
      const fifth = this.ctx.createOscillator();
      const fGain = this.ctx.createGain();
      fifth.type = 'triangle';
      fifth.frequency.value = 392.0; // G4
      fGain.gain.setValueAtTime(0, now + 0.5);
      fGain.gain.linearRampToValueAtTime(0.04, now + 1.2);
      fGain.gain.linearRampToValueAtTime(0, now + duration);
      fifth.connect(fGain);
      fGain.connect(this.master);
      fifth.start(now + 0.5);
      fifth.stop(now + duration + 0.1);

      setTimeout(resolve, Math.round(duration * 1000));
    });
  }

  // ─── Transition Swoosh — frequency sweep ──────────────────────
  transitionSwoosh(): Promise<void> {
    return new Promise((resolve) => {
      const now = this.ctx.currentTime;

      // Upward sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(4000, now + 0.35);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now);
      osc.stop(now + 0.45);

      // Noise tail
      this.noiseHit(now + 0.1, 0.25, 0.06);

      setTimeout(resolve, 450);
    });
  }

  // ─── Random Blip — short chirp ear candy ──────────────────────
  blip(): Promise<void> {
    return new Promise((resolve) => {
      const now = this.ctx.currentTime;
      const freq = 800 + Math.random() * 2000;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = Math.random() > 0.5 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.06);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now);
      osc.stop(now + 0.12);

      setTimeout(resolve, 120);
    });
  }

  // ─── Tune In — radio dial tuning on first play ────────────────
  tuneIn(): Promise<void> {
    return new Promise((resolve) => {
      const now = this.ctx.currentTime;
      const duration = 1.8;

      // Sweeping static
      const bufferSize = Math.round(this.ctx.sampleRate * duration);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / this.ctx.sampleRate;
        const envelope = Math.sin((t / duration) * Math.PI); // bell curve
        data[i] = (Math.random() * 2 - 1) * envelope * 0.15;
      }

      const noise = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();
      noise.buffer = buffer;
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, now);
      filter.frequency.exponentialRampToValueAtTime(6000, now + duration * 0.7);
      filter.frequency.exponentialRampToValueAtTime(2000, now + duration);
      filter.Q.value = 2;
      gain.gain.value = 1;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.master);
      noise.start(now);
      noise.stop(now + duration);

      // "Lock on" tone at the end
      const lockOn = this.ctx.createOscillator();
      const lockGain = this.ctx.createGain();
      lockOn.type = 'sine';
      lockOn.frequency.value = 1000;
      lockGain.gain.setValueAtTime(0, now + duration - 0.3);
      lockGain.gain.linearRampToValueAtTime(0.2, now + duration - 0.1);
      lockGain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.2);
      lockOn.connect(lockGain);
      lockGain.connect(this.master);
      lockOn.start(now + duration - 0.3);
      lockOn.stop(now + duration + 0.3);

      setTimeout(resolve, Math.round(duration * 1000) + 200);
    });
  }

  // ─── Sign Off — descending chime ──────────────────────────────
  signOff(): Promise<void> {
    return new Promise((resolve) => {
      const now = this.ctx.currentTime;
      const notes = [783.99, 659.25, 523.25]; // G5, E5, C5 (descending)

      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.2);
        gain.gain.linearRampToValueAtTime(0.2, now + i * 0.2 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 0.6);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(now + i * 0.2);
        osc.stop(now + i * 0.2 + 0.65);
      });

      setTimeout(resolve, 900);
    });
  }

  // ─── Vinyl Crackle — continuous ambient warmth ────────────────
  startCrackle(): Promise<void> {
    if (this._crackleActive) return Promise.resolve();
    this._crackleActive = true;

    // Generate crackle noise buffer (2 seconds, looped)
    const duration = 2;
    const bufferSize = Math.round(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      // Sparse impulses for crackle character
      data[i] = Math.random() < 0.003 ? (Math.random() * 2 - 1) * 0.8 : (Math.random() * 2 - 1) * 0.01;
    }

    const source = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    source.buffer = buffer;
    source.loop = true;
    filter.type = 'highpass';
    filter.frequency.value = 800;
    gain.gain.value = 0.04; // Very subtle

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start();

    this.crackleNode = source;
    this.crackleGain = gain;
    return Promise.resolve();
  }

  stopCrackle(): void {
    if (!this._crackleActive) return;
    try { this.crackleNode?.stop(); } catch { /* already stopped */ }
    try { this.crackleGain?.disconnect(); } catch { /* ok */ }
    this.crackleNode = null;
    this.crackleGain = null;
    this._crackleActive = false;
  }

  get isCrackleActive(): boolean {
    return this._crackleActive;
  }

  // ─── Noise utility — white noise burst ────────────────────────
  private noiseHit(startTime: number, duration: number, volume: number): void {
    const bufferSize = Math.round(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    source.connect(gain);
    gain.connect(this.master);
    source.start(startTime);
    source.stop(startTime + duration + 0.01);
  }

  /** Play a random micro-blip — call periodically for ambient ear candy */
  randomEarCandy(): void {
    const roll = Math.random();
    if (roll < 0.3) {
      void this.blip();
    } else if (roll < 0.5) {
      // Tiny reverse reverb tail
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = 1200 + Math.random() * 800;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(gain);
      gain.connect(this.master);
      osc.start(now);
      osc.stop(now + 0.22);
    }
    // 50% of the time: nothing. Silence IS a sound effect.
  }

  destroy(): void {
    this.stopCrackle();
  }
}