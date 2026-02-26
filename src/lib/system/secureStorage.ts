/**
 * Secure localStorage Wrapper
 * SPARTA Epoch — Obfuscates sensitive state stored in browser storage
 * 
 * Uses base64 + XOR obfuscation to prevent casual inspection.
 * NOT cryptographic security — defense in depth against devtools snooping.
 */

const OBFUSCATION_KEY = 'cmpsbl_substrate_2026';

function xorObfuscate(input: string, key: string): string {
  let result = '';
  for (let i = 0; i < input.length; i++) {
    result += String.fromCharCode(input.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

/**
 * Store a value with obfuscation
 */
export function secureSet(key: string, value: unknown): void {
  try {
    const serialized = JSON.stringify(value);
    const obfuscated = btoa(xorObfuscate(serialized, OBFUSCATION_KEY));
    localStorage.setItem(`_s_${key}`, obfuscated);
  } catch {
    // Fallback to plain storage if btoa fails (e.g., non-latin chars)
    localStorage.setItem(key, JSON.stringify(value));
  }
}

/**
 * Retrieve and de-obfuscate a value
 */
export function secureGet<T = unknown>(key: string): T | null {
  try {
    const obfuscated = localStorage.getItem(`_s_${key}`);
    if (!obfuscated) {
      // Try legacy plain key
      const plain = localStorage.getItem(key);
      return plain ? JSON.parse(plain) : null;
    }
    const deobfuscated = xorObfuscate(atob(obfuscated), OBFUSCATION_KEY);
    return JSON.parse(deobfuscated);
  } catch {
    return null;
  }
}

/**
 * Remove a secure key (cleans both obfuscated and legacy)
 */
export function secureRemove(key: string): void {
  localStorage.removeItem(`_s_${key}`);
  localStorage.removeItem(key);
}

/**
 * Migrate a legacy plaintext key to obfuscated storage
 */
export function migrateLegacyKey(key: string): void {
  const plain = localStorage.getItem(key);
  if (plain) {
    try {
      const value = JSON.parse(plain);
      secureSet(key, value);
      localStorage.removeItem(key);
    } catch {
      // Not valid JSON, store as string
      secureSet(key, plain);
      localStorage.removeItem(key);
    }
  }
}
