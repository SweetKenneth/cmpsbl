/**
 * Device Fingerprinting — Ported from aetherion-shield
 * Multi-signal browser fingerprinting (Canvas, WebGL, Audio, Font, Screen)
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
  timezone: string;
  language: string;
  platform: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
  plugins: string[];
  userAgent: string;
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

      ctx.textBaseline = 'top';
      ctx.font = '14px "Arial"';
      ctx.textBaseline = 'alphabetic';
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
        sp.onaudioprocess = (event) => {
          const output = event.outputBuffer.getChannelData(0);
          const hash = Array.from(output.slice(0, 30))
            .reduce((acc: number, val: number) => acc + Math.abs(val), 0);

          sp.disconnect();
          osc.disconnect();
          analyser.disconnect();
          gain.disconnect();

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

  /** Generate the full fingerprint object */
  static async generate(): Promise<FingerprintData> {
    const audio = await this.getAudioFingerprint();
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
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      plugins: this.getPlugins(),
      userAgent: navigator.userAgent,
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
