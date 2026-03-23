/**
 * CMPSBL® VISION — Clockless Session Fingerprinting
 * SHA-256 browser characteristic hashing for anonymous → authenticated linking.
 * No PII stored. Fingerprint = structural hash of browser environment.
 */

export interface FingerprintComponents {
  userAgent: string;
  language: string;
  platform: string;
  screenResolution: string;
  timezone: string;
  colorDepth: number;
  hardwareConcurrency: number;
  touchSupport: boolean;
  canvasHash?: string;
}

export interface FingerprintResult {
  fingerprint: string;
  components: FingerprintComponents;
  entropy: number; // bits of entropy
  generatedAt: string;
}

/**
 * Collect browser characteristics (browser-safe)
 */
export function collectComponents(): FingerprintComponents {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      userAgent: 'server',
      language: 'en',
      platform: 'server',
      screenResolution: '0x0',
      timezone: 'UTC',
      colorDepth: 0,
      hardwareConcurrency: 0,
      touchSupport: false,
    };
  }

  return {
    userAgent: navigator.userAgent || '',
    language: navigator.language || 'en',
    platform: navigator.platform || '',
    screenResolution: `${screen.width}x${screen.height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    colorDepth: screen.colorDepth || 0,
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    touchSupport: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
  };
}

/**
 * Generate SHA-256 fingerprint from components
 */
export async function generateFingerprint(components?: FingerprintComponents): Promise<FingerprintResult> {
  const c = components || collectComponents();
  const raw = [
    c.userAgent,
    c.language,
    c.platform,
    c.screenResolution,
    c.timezone,
    String(c.colorDepth),
    String(c.hardwareConcurrency),
    String(c.touchSupport),
    c.canvasHash || '',
  ].join('|');

  let fingerprint: string;

  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoded = new TextEncoder().encode(raw);
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    fingerprint = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  } else {
    // Fallback: FNV-1a
    let hash = 0x811c9dc5;
    for (let i = 0; i < raw.length; i++) {
      hash ^= raw.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    fingerprint = `fnv-${hash.toString(16)}`;
  }

  // Entropy estimation: count unique component values
  const uniqueValues = new Set(Object.values(c).map(String)).size;
  const entropy = Math.round(Math.log2(Math.pow(uniqueValues, Object.keys(c).length)));

  return {
    fingerprint,
    components: c,
    entropy,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate a canvas-based sub-fingerprint for additional entropy
 */
export function generateCanvasHash(): string | null {
  if (typeof document === 'undefined') return null;

  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('CMPSBL fp', 2, 15);
    ctx.fillStyle = 'rgba(102,204,0,0.7)';
    ctx.fillText('CMPSBL fp', 4, 17);

    const dataUrl = canvas.toDataURL();
    // FNV-1a of canvas data
    let hash = 0x811c9dc5;
    for (let i = 0; i < dataUrl.length; i++) {
      hash ^= dataUrl.charCodeAt(i);
      hash = (hash * 0x01000193) >>> 0;
    }
    return hash.toString(16);
  } catch {
    return null;
  }
}
