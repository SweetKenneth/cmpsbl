/**
 * Device Fingerprinting — Ported from aetherion-shield (Enterprise Edition)
 * Multi-signal browser fingerprinting (Canvas, WebGL, Audio, Font, Screen)
 * + Enterprise signals: Webdriver, CDP, WebRTC Leak, Performance API,
 *   Browser Inconsistencies, HTTP/2, Request Timing, Session State
 * Target nodes: DEFENSE, SITE-GUARD, IMMUNITY
 */

import { fnv1aHash } from '@/lib/system/hardening';

export interface FingerprintData {
  canvas: string;
  webgl: string;
  audio: string;
  fonts: string[];
  screen: {
    width: number;
    height: number;
    colorDepth: number;
    pixelRatio: number;
  };
  viewport: {
    width: number;
    height: number;
  };
  timezone: string;
  language: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
  plugins: string[];
  userAgent: string;
  // Enterprise-level detection signals
  webdriver: boolean;
  cdpDetected: boolean;
  webrtcLeak: string | null;
  performanceAPITampered: boolean;
  browserInconsistencies: string[];
  // Advanced signals
  http2Fingerprint?: Record<string, unknown>;
  requestTiming?: Record<string, number>;
  sessionState?: Record<string, unknown>;
}

export class DeviceFingerprint {
  /** Canvas fingerprint — draws styled text & shapes, reads back pixel data */
  private static getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return '';

      canvas.width = 200;
      canvas.height = 50;

      ctx.textBaseline = 'alphabetic';
      ctx.font = '14px "Arial"';
      ctx.fillStyle = '#f60';
      ctx.fillRect(125, 1, 62, 20);
      ctx.fillStyle = '#069';
      ctx.fillText('SubstrateFP 🛡️', 2, 15);
      ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
      ctx.fillText('SubstrateFP 🛡️', 4, 17);

      return canvas.toDataURL();
    } catch {
      return '';
    }
  }

  /** WebGL fingerprint — vendor + renderer string */
  private static getWebGLFingerprint(): string {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl || !('getParameter' in gl)) return '';

      const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
      if (!debugInfo) return '';

      const glContext = gl as WebGLRenderingContext;
      const vendor = glContext.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
      const renderer = glContext.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

      return `${vendor}~${renderer}`;
    } catch {
      return '';
    }
  }

  /** Audio fingerprint — oscillator → analyser output hash */
  private static async getAudioFingerprint(): Promise<string> {
    try {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      if (!AC) return '';

      const context = new AC();
      const osc = context.createOscillator();
      const analyser = context.createAnalyser();
      const gain = context.createGain();
      const sp = context.createScriptProcessor(4096, 1, 1);

      gain.gain.value = 0;
      osc.connect(analyser);
      analyser.connect(sp);
      sp.connect(gain);
      gain.connect(context.destination);
      osc.start(0);

      return new Promise((resolve) => {
        const cleanup = () => {
          sp.disconnect();
          osc.disconnect();
          analyser.disconnect();
          gain.disconnect();
          context.close().catch(() => {});
        };

        // Safety timeout — don't hang if onaudioprocess never fires
        const timeout = setTimeout(() => {
          cleanup();
          resolve('');
        }, 2000);

        sp.onaudioprocess = (event) => {
          clearTimeout(timeout);
          const output = event.outputBuffer.getChannelData(0);
          const hash = Array.from(output.slice(0, 30))
            .reduce((acc: number, val: number) => acc + Math.abs(val), 0);
          cleanup();
          resolve(hash.toString());
        };
      });
    } catch {
      return '';
    }
  }

  /** Font detection via canvas metric comparison */
  private static getFonts(): string[] {
    const baseFonts = ['monospace', 'sans-serif', 'serif'];
    const testFonts = [
      'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
      'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS',
      'Impact', 'Lucida Console',
    ];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    const testString = 'mmmmmmmmmmlli';
    const defaultWidths: Record<string, number> = {};
    const defaultHeights: Record<string, number> = {};

    for (const baseFont of baseFonts) {
      ctx.font = `72px ${baseFont}`;
      const m = ctx.measureText(testString);
      defaultWidths[baseFont] = m.width;
      defaultHeights[baseFont] = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent;
    }

    const detected: string[] = [];
    for (const testFont of testFonts) {
      for (const baseFont of baseFonts) {
        ctx.font = `72px '${testFont}', ${baseFont}`;
        const m = ctx.measureText(testString);
        if (
          m.width !== defaultWidths[baseFont] ||
          m.actualBoundingBoxAscent + m.actualBoundingBoxDescent !== defaultHeights[baseFont]
        ) {
          detected.push(testFont);
          break;
        }
      }
    }
    return detected;
  }

  /** Browser plugins list */
  private static getPlugins(): string[] {
    const plugins: string[] = [];
    for (let i = 0; i < navigator.plugins.length; i++) {
      plugins.push(navigator.plugins[i].name);
    }
    return plugins;
  }

  // ═══════════════════════════════════════════════════════════════
  // ENTERPRISE DETECTION SIGNALS
  // ═══════════════════════════════════════════════════════════════

  /** Detect navigator.webdriver flag (Selenium, Puppeteer, Playwright) */
  private static detectWebdriver(): boolean {
    return !!(navigator as any).webdriver;
  }

  /**
   * Detect CDP (Chrome DevTools Protocol) leak.
   * Used by Puppeteer, Playwright, and other CDP-based automation.
   */
  private static detectCDP(): boolean {
    try {
      let detected = false;
      const e = new Error();
      Object.defineProperty(e, 'stack', {
        get() {
          detected = true;
          return '';
        },
      });
      // Trigger serialization (CDP behavior)
      console.debug(e);
      return detected;
    } catch {
      return false;
    }
  }

  /**
   * Detect WebRTC IP leak — exposes real IP behind VPN/proxy.
   * Returns a HASHED representation, never the raw IP.
   */
  private static async detectWebRTCLeak(): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        let pc: RTCPeerConnection;
        const timeout = setTimeout(() => {
          try { pc?.close(); } catch {}
          resolve(null);
        }, 1000);

        pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');

        pc.createOffer()
          .then((offer) => pc.setLocalDescription(offer))
          .catch(() => {});

        pc.onicecandidate = (ice) => {
          if (!ice || !ice.candidate) return;

          const candidate = ice.candidate.candidate;
          const ipRegex = /([0-9]{1,3}\.){3}[0-9]{1,3}/;
          const match = candidate.match(ipRegex);

          if (match && match[0]) {
            clearTimeout(timeout);
            pc.close();
            // Hash the IP — never expose raw IP in fingerprint data
            resolve(fnv1aHash(match[0]).toString(16));
          }
        };
      } catch {
        resolve(null);
      }
    });
  }

  /** Check if Performance API timing is tampered (automation fingerprint) */
  private static checkPerformanceAPITampered(): boolean {
    try {
      if (!window.performance || !window.performance.now) return false;

      const t1 = performance.now();
      const t2 = performance.now();

      // performance.now should always increase
      if (t2 <= t1) return true;

      // Suspiciously perfect timing resolution = automation
      const diff = t2 - t1;
      return diff > 0 && diff < 0.001;
    } catch {
      return false;
    }
  }

  /**
   * Detect browser inconsistencies — cross-signal validation.
   * Correlates multiple signals to detect spoofing.
   */
  private static detectInconsistencies(): string[] {
    const inconsistencies: string[] = [];

    try {
      const ua = navigator.userAgent;
      const platform = navigator.platform;

      // UA vs platform mismatch
      if (ua.includes('Windows') && !platform.includes('Win')) {
        inconsistencies.push('ua_platform_mismatch');
      }
      if (ua.includes('Mac') && !platform.includes('Mac')) {
        inconsistencies.push('ua_platform_mismatch');
      }
      if (ua.includes('Linux') && !platform.includes('Linux')) {
        inconsistencies.push('ua_platform_mismatch');
      }

      // Mobile UA but desktop screen
      const isMobileUA = /mobile|android|iphone|ipad/i.test(ua);
      const isDesktopScreen = window.screen.width >= 1024;
      if (isMobileUA && isDesktopScreen) {
        inconsistencies.push('mobile_ua_desktop_screen');
      }

      // Touch capability vs device type
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (!hasTouch && isMobileUA) {
        inconsistencies.push('mobile_no_touch');
      }

      // Language consistency
      const languages = navigator.languages;
      const language = navigator.language;
      if (languages && languages.length > 0 && languages[0] !== language) {
        inconsistencies.push('language_mismatch');
      }

      // deviceMemory vs hardwareConcurrency correlation
      const memory = (navigator as any).deviceMemory;
      const cores = navigator.hardwareConcurrency;
      if (memory && cores) {
        if (memory === 2 && cores >= 12) inconsistencies.push('unrealistic_memory_cores');
        if (memory >= 16 && cores <= 2) inconsistencies.push('unrealistic_memory_cores');
      }

      // Viewport exceeds screen
      if (window.innerWidth > window.screen.width || window.innerHeight > window.screen.height) {
        inconsistencies.push('viewport_exceeds_screen');
      }

      // No plugins (headless browsers)
      if (navigator.plugins.length === 0) {
        inconsistencies.push('no_plugins');
      }

      // WebGL SwiftShader detection (headless Chrome)
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl');
        if (gl) {
          const debugInfo = (gl as any).getExtension('WEBGL_debug_renderer_info');
          if (debugInfo) {
            const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) as string;
            if (renderer.toLowerCase().includes('swiftshader')) {
              inconsistencies.push('swiftshader_detected');
            }
          }
        }
      } catch {
        // ignore
      }
    } catch (error) {
      console.error('[DEFENSE] Cross-signal validation error:', error);
    }

    return inconsistencies;
  }

  /** Detect HTTP/2 and connection characteristics */
  private static detectHTTP2Fingerprint(): Record<string, unknown> {
    try {
      const connectionInfo: Record<string, unknown> = {
        protocol: 'unknown',
        rtt: null,
        downlink: null,
        effectiveType: null,
        saveData: false,
      };

      if ((navigator as any).connection) {
        const conn = (navigator as any).connection;
        connectionInfo.rtt = conn.rtt || null;
        connectionInfo.downlink = conn.downlink || null;
        connectionInfo.effectiveType = conn.effectiveType || null;
        connectionInfo.saveData = conn.saveData || false;
      }

      // Protocol detection via PerformanceResourceTiming
      try {
        if (window.performance && window.performance.getEntriesByType) {
          const resources = window.performance.getEntriesByType('navigation');
          if (resources.length > 0) {
            const nav = resources[0] as any;
            connectionInfo.protocol = nav.nextHopProtocol || 'unknown';
          }
        }
      } catch {
        // ignore
      }

      return connectionInfo;
    } catch {
      return { protocol: 'unknown' };
    }
  }

  /** Analyze request timing patterns — detects automation via performance API */
  private static analyzeRequestTiming(): Record<string, number> {
    try {
      const timing: Record<string, number> = {};

      if (window.performance && window.performance.timing) {
        const t = window.performance.timing;
        timing.requestStart = t.requestStart - t.navigationStart;
        timing.responseStart = t.responseStart - t.navigationStart;
        timing.domComplete = t.domComplete - t.navigationStart;
        timing.loadEventEnd = t.loadEventEnd - t.navigationStart;
        timing.connectTime = t.connectEnd - t.connectStart;
        timing.renderTime = t.domComplete - t.domLoading;
      }

      return timing;
    } catch {
      return {};
    }
  }

  /** Check session and cookie state — bots often have empty session state */
  private static analyzeSessionState(): Record<string, unknown> {
    try {
      return {
        hasLocalStorage: typeof localStorage !== 'undefined',
        hasSessionStorage: typeof sessionStorage !== 'undefined',
        hasCookies: navigator.cookieEnabled,
        localStorageSize: this.getStorageSize('localStorage'),
        sessionStorageSize: this.getStorageSize('sessionStorage'),
        cookieCount: document.cookie ? document.cookie.split(';').length : 0,
        hasServiceWorker: 'serviceWorker' in navigator,
        hasIndexedDB: 'indexedDB' in window,
      };
    } catch {
      return { hasCookies: false };
    }
  }

  private static getStorageSize(storageType: 'localStorage' | 'sessionStorage'): number {
    try {
      const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
      return Object.keys(storage).length;
    } catch {
      return 0;
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════

  /** Generate the full fingerprint object with enterprise signals */
  static async generate(): Promise<FingerprintData> {
    const [audio, webrtcLeak] = await Promise.all([
      this.getAudioFingerprint(),
      this.detectWebRTCLeak(),
    ]);

    return {
      canvas: this.getCanvasFingerprint(),
      webgl: this.getWebGLFingerprint(),
      audio,
      fonts: this.getFonts(),
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
        pixelRatio: window.devicePixelRatio,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      plugins: this.getPlugins(),
      userAgent: navigator.userAgent,
      // Enterprise signals
      webdriver: this.detectWebdriver(),
      cdpDetected: this.detectCDP(),
      webrtcLeak,
      performanceAPITampered: this.checkPerformanceAPITampered(),
      browserInconsistencies: this.detectInconsistencies(),
      // Advanced signals
      http2Fingerprint: this.detectHTTP2Fingerprint(),
      requestTiming: this.analyzeRequestTiming(),
      sessionState: this.analyzeSessionState(),
    };
  }

  /** SHA-256 hash of the entire fingerprint */
  static async hash(data: FingerprintData): Promise<string> {
    const str = JSON.stringify(data);
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /** Fast FNV-1a hash for deduplication (non-cryptographic) */
  static quickHash(data: FingerprintData): number {
    return fnv1aHash(JSON.stringify(data));
  }
}
