/**
 * ClocklessRadioEngine — Web Audio API crossfade engine
 * Continuous streaming with dual-buffer crossfade, exponential ramps, preloading
 * ALL audio (music, SFX, transitions) routes through one AudioContext
 * so Bluetooth/Airplay devices receive everything on the same stream.
 */

import { RADIO_TRACKS, shuffleTracks, type RadioTrack } from './tracks';
import { RadioSFX } from './sfx';

export type RadioState = 'stopped' | 'playing' | 'crossfading' | 'dj_speaking';

export interface RadioEngineCallbacks {
  onTrackChange: (track: RadioTrack) => void;
  onStateChange: (state: RadioState) => void;
  onDJStart: () => void;
  onDJEnd: () => void;
}

const CROSSFADE_DURATION = 8; // seconds
const PRELOAD_AHEAD = 20; // seconds before end to preload
const DJ_DUCK_VOLUME = 0.3;
const DJ_DUCK_RAMP = 1.5; // seconds

// Audio effect probabilities and settings
const EFFECT_CHANCE = 0.15; // 15% chance of an effect on any track
const SLOWDOWN_RATE = 0.85;
const SPEEDUP_RATE = 1.15;
const EFFECT_DURATION = 8; // seconds the effect lasts before returning to normal

export class ClocklessRadioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private currentGain: GainNode | null = null;
  private nextSource: AudioBufferSourceNode | null = null;
  private nextGain: GainNode | null = null;
  private preloadedBuffer: AudioBuffer | null = null;
  private playlist: RadioTrack[] = [];
  private playlistIndex = 0;
  private state: RadioState = 'stopped';
  private volume = 0.7;
  private callbacks: RadioEngineCallbacks;
  private preloadTimer: ReturnType<typeof setTimeout> | null = null;
  private currentTrackDuration = 0;
  private currentStartTime = 0;
  private _isDJDucked = false;
  private hiddenAudio: HTMLAudioElement | null = null;
  private effectTimer: ReturnType<typeof setTimeout> | null = null;
  private _sfx: RadioSFX | null = null;
  private earCandyInterval: ReturnType<typeof setInterval> | null = null;
  private _sfxOnly = false; // When true, skip TTS and use only SFX for DJ breaks

  constructor(callbacks: RadioEngineCallbacks) {
    this.callbacks = callbacks;
    this.playlist = shuffleTracks();
  }

  get currentTrack(): RadioTrack | null {
    return this.playlist[this.playlistIndex] || null;
  }

  get isPlaying(): boolean {
    return this.state !== 'stopped';
  }

  get currentVolume(): number {
    return this.volume;
  }

  /** Expose SFX engine for external use (e.g., hook layer) */
  get sfx(): RadioSFX | null {
    return this._sfx;
  }

  /** Toggle SFX-only mode (no TTS voice — for Bluetooth pairing) */
  set sfxOnly(value: boolean) {
    this._sfxOnly = value;
  }

  get isSFXOnly(): boolean {
    return this._sfxOnly;
  }

  private ensureContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
      // Initialize SFX engine on same AudioContext
      this._sfx = new RadioSFX(this.ctx, this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private async loadBuffer(url: string): Promise<AudioBuffer> {
    const ctx = this.ensureContext();
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    return ctx.decodeAudioData(arrayBuffer);
  }

  private playBuffer(buffer: AudioBuffer, fadeIn: boolean): { source: AudioBufferSourceNode; gain: GainNode } {
    const ctx = this.ensureContext();
    const source = ctx.createBufferSource();
    const gain = ctx.createGain();
    
    source.buffer = buffer;
    source.connect(gain);
    gain.connect(this.masterGain!);
    
    if (fadeIn) {
      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(1, ctx.currentTime + CROSSFADE_DURATION);
    } else {
      gain.gain.value = 1;
    }
    
    source.start(0);

    // Random audio effect — slowdown, speedup, or pitch wobble
    this.maybeApplyEffect(source);

    return { source, gain };
  }

  /** Randomly apply a DJ-style audio effect (slowdown, speedup) to a track */
  private maybeApplyEffect(source: AudioBufferSourceNode): void {
    if (Math.random() > EFFECT_CHANCE) return;
    const ctx = this.ctx;
    if (!ctx) return;

    // Pick a random delay (10-40s into the track) to trigger the effect
    const delay = (10 + Math.random() * 30) * 1000;
    const effectType = Math.random() > 0.5 ? 'slowdown' : 'speedup';
    const targetRate = effectType === 'slowdown' ? SLOWDOWN_RATE : SPEEDUP_RATE;

    this.effectTimer = setTimeout(() => {
      if (this.state === 'stopped') return;
      console.log(`[ComposableRadio] 🎛️ DJ effect: ${effectType}`);
      // Ramp playback rate
      source.playbackRate.setValueAtTime(source.playbackRate.value, ctx.currentTime);
      source.playbackRate.linearRampToValueAtTime(targetRate, ctx.currentTime + 2);
      // Return to normal after EFFECT_DURATION
      setTimeout(() => {
        try {
          source.playbackRate.setValueAtTime(source.playbackRate.value, ctx.currentTime);
          source.playbackRate.linearRampToValueAtTime(1.0, ctx.currentTime + 2);
        } catch { /* source may have ended */ }
      }, EFFECT_DURATION * 1000);
    }, delay);
  }

  private fadeOut(gain: GainNode, duration: number): void {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  }

  private schedulePreload(): void {
    if (this.preloadTimer) clearTimeout(this.preloadTimer);
    
    const preloadDelay = Math.max(0, (this.currentTrackDuration - PRELOAD_AHEAD) * 1000);
    
    this.preloadTimer = setTimeout(async () => {
      const nextTrack = this.playlist[(this.playlistIndex + 1) % this.playlist.length];
      try {
        this.preloadedBuffer = await this.loadBuffer(nextTrack.url);
      } catch (e) {
        console.warn('[ClocklessRadio] Preload failed:', e);
      }
    }, preloadDelay);
  }

  private scheduleCrossfade(): void {
    const crossfadeDelay = Math.max(0, (this.currentTrackDuration - CROSSFADE_DURATION) * 1000);
    
    setTimeout(() => {
      if (this.state === 'stopped') return;
      this.crossfadeToNext();
    }, crossfadeDelay);
  }

  private async crossfadeToNext(): Promise<void> {
    if (this.state === 'stopped') return;
    
    // Play transition swoosh through AudioContext (goes to Bluetooth)
    void this._sfx?.transitionSwoosh();
    
    this.setState('crossfading');
    
    // Advance playlist — reshuffle when exhausted for infinite random looping
    this.playlistIndex++;
    if (this.playlistIndex >= this.playlist.length) {
      this.playlistIndex = 0;
      this.playlist = shuffleTracks(this.currentTrack?.id);
    }
    
    const track = this.playlist[this.playlistIndex];
    this.callbacks.onTrackChange(track);
    this.updateMediaSession(track);
    
    // Load buffer (use preloaded if available)
    let buffer: AudioBuffer;
    if (this.preloadedBuffer) {
      buffer = this.preloadedBuffer;
      this.preloadedBuffer = null;
    } else {
      try {
        buffer = await this.loadBuffer(track.url);
      } catch {
        // Skip broken track
        this.crossfadeToNext();
        return;
      }
    }
    
    // Fade out current
    if (this.currentGain) {
      this.fadeOut(this.currentGain, CROSSFADE_DURATION);
      // Clean up old source after fade
      const oldSource = this.currentSource;
      const oldGain = this.currentGain;
      setTimeout(() => {
        try { oldSource?.stop(); } catch { }
        try { oldGain?.disconnect(); } catch { }
      }, CROSSFADE_DURATION * 1000 + 500);
    }
    
    // Fade in next
    const { source, gain } = this.playBuffer(buffer, true);
    this.currentSource = source;
    this.currentGain = gain;
    this.currentTrackDuration = buffer.duration;
    this.currentStartTime = this.ctx!.currentTime;
    
    source.onended = () => {
      if (this.state !== 'stopped') {
        this.crossfadeToNext();
      }
    };
    
    this.setState('playing');
    this.schedulePreload();
    this.scheduleCrossfade();
  }

  private setState(state: RadioState): void {
    this.state = state;
    this.callbacks.onStateChange(state);
  }

  private updateMediaSession(track: RadioTrack): void {
    if (!('mediaSession' in navigator)) return;
    
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title,
      artist: 'Composable Radio — Rex Binary',
      album: 'CMPSBL OS',
    });
    
    navigator.mediaSession.setActionHandler('play', () => this.play());
    navigator.mediaSession.setActionHandler('pause', () => this.stop());
    navigator.mediaSession.setActionHandler('nexttrack', () => this.skip());
  }

  // Keep a hidden <audio> element playing silence to maintain Media Session on mobile
  private ensureMediaSessionAlive(): void {
    if (this.hiddenAudio) return;
    // Create a tiny silent audio context to keep media session active
    this.hiddenAudio = new Audio();
    this.hiddenAudio.volume = 0.01;
  }

  async play(): Promise<void> {
    if (this.state !== 'stopped') return;
    
    this.ensureMediaSessionAlive();
    
    const track = this.playlist[this.playlistIndex];
    this.callbacks.onTrackChange(track);
    this.updateMediaSession(track);
    
    try {
      // Tune-in radio dial effect on first play (through AudioContext → Bluetooth)
      if (this._sfx) {
        await this._sfx.play('tune_in');
        // Start ambient vinyl crackle warmth
        void this._sfx.startCrackle();
      }

      const buffer = await this.loadBuffer(track.url);
      const { source, gain } = this.playBuffer(buffer, false);
      
      this.currentSource = source;
      this.currentGain = gain;
      this.currentTrackDuration = buffer.duration;
      this.currentStartTime = this.ctx!.currentTime;
      
      source.onended = () => {
        if (this.state !== 'stopped') {
          this.crossfadeToNext();
        }
      };
      
      this.setState('playing');
      this.schedulePreload();
      this.scheduleCrossfade();

      // Start random ear candy interval (subtle blips every 45-90s)
      this.startEarCandy();
    } catch (e) {
      console.error('[ClocklessRadio] Play failed:', e);
    }
  }

  stop(): void {
    if (this.preloadTimer) clearTimeout(this.preloadTimer);
    if (this.effectTimer) clearTimeout(this.effectTimer);
    this.stopEarCandy();
    
    // Sign-off chime (through AudioContext → Bluetooth)
    if (this._sfx && this.state !== 'stopped') {
      void this._sfx.play('sign_off');
      this._sfx.stopCrackle();
    }

    try { this.currentSource?.stop(); } catch { }
    try { this.nextSource?.stop(); } catch { }
    try { this.currentGain?.disconnect(); } catch { }
    try { this.nextGain?.disconnect(); } catch { }
    
    this.currentSource = null;
    this.currentGain = null;
    this.nextSource = null;
    this.nextGain = null;
    this.preloadedBuffer = null;
    
    this.setState('stopped');
  }

  skip(): void {
    if (this.state === 'stopped') return;
    this.crossfadeToNext();
  }

  setVolume(v: number): void {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.masterGain) {
      this.masterGain.gain.value = this._isDJDucked ? this.volume * DJ_DUCK_VOLUME : this.volume;
    }
  }

  /** Duck music volume for DJ interjection */
  duckForDJ(): void {
    if (!this.masterGain || !this.ctx) return;
    this._isDJDucked = true;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, this.volume * DJ_DUCK_VOLUME),
      now + DJ_DUCK_RAMP
    );
    this.callbacks.onDJStart();
    this.setState('dj_speaking');
  }

  /** Restore music volume after DJ */
  unduckFromDJ(): void {
    if (!this.masterGain || !this.ctx) return;
    this._isDJDucked = false;
    const now = this.ctx.currentTime;
    this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
    this.masterGain.gain.exponentialRampToValueAtTime(
      Math.max(0.001, this.volume),
      now + DJ_DUCK_RAMP
    );
    this.callbacks.onDJEnd();
    this.setState('playing');
  }

  // ─── Ear Candy — periodic random micro-sounds ─────────────────
  private startEarCandy(): void {
    this.stopEarCandy();
    // Random blip every 45-90 seconds
    const scheduleNext = () => {
      const delay = (45 + Math.random() * 45) * 1000;
      this.earCandyInterval = setTimeout(() => {
        if (this.state === 'stopped' || this.state === 'dj_speaking') {
          scheduleNext();
          return;
        }
        this._sfx?.randomEarCandy();
        scheduleNext();
      }, delay);
    };
    scheduleNext();
  }

  private stopEarCandy(): void {
    if (this.earCandyInterval) {
      clearTimeout(this.earCandyInterval);
      this.earCandyInterval = null;
    }
  }

  destroy(): void {
    this.stop();
    this._sfx?.destroy();
    this._sfx = null;
    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close();
    }
    this.ctx = null;
    this.masterGain = null;
    if (this.hiddenAudio) {
      this.hiddenAudio.pause();
      this.hiddenAudio = null;
    }
  }
}
