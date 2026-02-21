/**
 * ClocklessRadioEngine — Web Audio API crossfade engine
 * Continuous streaming with dual-buffer crossfade, exponential ramps, preloading
 */

import { RADIO_TRACKS, shuffleTracks, type RadioTrack } from './tracks';

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
  private hiddenAudio: HTMLAudioElement | null = null; // keeps Media Session alive

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

  private ensureContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
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
    return { source, gain };
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
    
    this.setState('crossfading');
    
    // Advance playlist
    this.playlistIndex = (this.playlistIndex + 1) % this.playlist.length;
    if (this.playlistIndex === 0) {
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
      artist: 'Clockless Radio',
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
    } catch (e) {
      console.error('[ClocklessRadio] Play failed:', e);
    }
  }

  stop(): void {
    if (this.preloadTimer) clearTimeout(this.preloadTimer);
    
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

  destroy(): void {
    this.stop();
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
