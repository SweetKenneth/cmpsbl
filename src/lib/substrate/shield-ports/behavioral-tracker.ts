/**
 * Behavioral Tracker — Ported from aetherion-shield
 * Ring-buffered interaction signal capture for bot vs. human classification
 * Target nodes: DEFENSE, SITE-GUARD, IMMUNITY
 */

import { boundArray } from '@/lib/system/hardening';

export interface BehavioralData {
  mouse_movements: Array<{ x: number; y: number; timestamp: number }>;
  keyboard_events: Array<{ key: string; timestamp: number; type: string }>;
  scroll_events: Array<{ scrollY: number; timestamp: number }>;
  click_events: Array<{ x: number; y: number; timestamp: number }>;
  page_focus_times: Array<{ focused: boolean; timestamp: number }>;
}

const MAX_EVENTS = 100;

export class BehavioralTracker {
  private data: BehavioralData = {
    mouse_movements: [],
    keyboard_events: [],
    scroll_events: [],
    click_events: [],
    page_focus_times: [],
  };

  private isTracking = false;
  private cleanupFns: Array<() => void> = [];

  /** Start capturing interaction signals */
  start(): void {
    if (this.isTracking) return;
    this.isTracking = true;

    let lastMouse = 0;
    const onMouse = (e: MouseEvent) => {
      const now = Date.now();
      if (now - lastMouse > 100) {
        this.data.mouse_movements = boundArray(
          [...this.data.mouse_movements, { x: Math.round(e.clientX), y: Math.round(e.clientY), timestamp: now }],
          MAX_EVENTS
        );
        lastMouse = now;
      }
    };

    const sensitiveKeys = new Set(['Tab', 'CapsLock', 'Shift', 'Control', 'Alt', 'Meta']);
    const onKey = (e: KeyboardEvent) => {
      if (sensitiveKeys.has(e.key)) return;
      this.data.keyboard_events = boundArray(
        [...this.data.keyboard_events, { key: e.key.length === 1 ? '*' : e.key, timestamp: Date.now(), type: e.type }],
        MAX_EVENTS
      );
    };

    let lastScroll = 0;
    const onScroll = () => {
      const now = Date.now();
      if (now - lastScroll > 200) {
        this.data.scroll_events = boundArray(
          [...this.data.scroll_events, { scrollY: Math.round(window.scrollY), timestamp: now }],
          MAX_EVENTS
        );
        lastScroll = now;
      }
    };

    const onClick = (e: MouseEvent) => {
      this.data.click_events = boundArray(
        [...this.data.click_events, { x: Math.round(e.clientX), y: Math.round(e.clientY), timestamp: Date.now() }],
        MAX_EVENTS
      );
    };

    const onFocus = (focused: boolean) => () => {
      this.data.page_focus_times = boundArray(
        [...this.data.page_focus_times, { focused, timestamp: Date.now() }],
        MAX_EVENTS
      );
    };

    document.addEventListener('mousemove', onMouse);
    document.addEventListener('keydown', onKey);
    document.addEventListener('keyup', onKey);
    document.addEventListener('scroll', onScroll);
    document.addEventListener('click', onClick);
    window.addEventListener('focus', onFocus(true));
    window.addEventListener('blur', onFocus(false));

    this.cleanupFns = [
      () => document.removeEventListener('mousemove', onMouse),
      () => document.removeEventListener('keydown', onKey),
      () => document.removeEventListener('keyup', onKey),
      () => document.removeEventListener('scroll', onScroll),
      () => document.removeEventListener('click', onClick),
      () => window.removeEventListener('focus', onFocus(true)),
      () => window.removeEventListener('blur', onFocus(false)),
    ];
  }

  /** Stop tracking and remove all listeners */
  stop(): void {
    this.isTracking = false;
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
  }

  /** Deep-clone current data snapshot */
  getData(): BehavioralData {
    return JSON.parse(JSON.stringify(this.data));
  }

  /** Reset all collected data */
  clear(): void {
    this.data = {
      mouse_movements: [],
      keyboard_events: [],
      scroll_events: [],
      click_events: [],
      page_focus_times: [],
    };
  }

  /** Compute a human-likelihood score (0 = bot, 1 = human) */
  computeHumanScore(): number {
    const { mouse_movements, keyboard_events, click_events } = this.data;
    let score = 0;

    // Mouse movement variance (bots tend to have perfectly straight lines)
    if (mouse_movements.length > 5) {
      const deltas = mouse_movements.slice(1).map((m, i) => ({
        dx: m.x - mouse_movements[i].x,
        dy: m.y - mouse_movements[i].y,
        dt: m.timestamp - mouse_movements[i].timestamp,
      }));
      const speeds = deltas.map(d => Math.sqrt(d.dx ** 2 + d.dy ** 2) / Math.max(d.dt, 1));
      const avgSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
      const variance = speeds.reduce((a, s) => a + (s - avgSpeed) ** 2, 0) / speeds.length;
      // Human mouse has high variance; bot mouse is uniform
      score += Math.min(variance / 10, 0.3);
    }

    // Keyboard timing variance
    if (keyboard_events.length > 3) {
      const intervals = keyboard_events.slice(1).map((k, i) => k.timestamp - keyboard_events[i].timestamp);
      const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((a, v) => a + (v - avg) ** 2, 0) / intervals.length;
      score += Math.min(variance / 50000, 0.3);
    }

    // Click presence
    if (click_events.length > 0) score += 0.2;

    // Focus changes indicate real user
    if (this.data.page_focus_times.length > 1) score += 0.2;

    return Math.min(score, 1);
  }
}
