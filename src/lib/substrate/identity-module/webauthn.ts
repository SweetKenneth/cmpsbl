/**
 * WebAuthn / Passkey — Cryptographic Device-Bound Authentication
 * v9.1.0 ARCHITECT Epoch
 * 
 * Replaces passwords with phishing-resistant, hardware-bound credentials.
 * Supports Face ID, Touch ID, Windows Hello, and FIDO2 security keys.
 */

import { emit } from '../events';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PasskeyCredential {
  credentialId: string;
  publicKey: string;
  deviceType: 'platform' | 'cross-platform';
  transports: AuthenticatorTransport[];
  createdAt: number;
  lastUsedAt: number;
  userAgent: string;
  aaguid: string;
}

export interface WebAuthnRegistrationOptions {
  challenge: string;
  rp: { name: string; id: string };
  user: { id: string; name: string; displayName: string };
  pubKeyCredParams: PublicKeyCredentialParameters[];
  authenticatorSelection: AuthenticatorSelectionCriteria;
  timeout: number;
  attestation: AttestationConveyancePreference;
}

export interface WebAuthnAuthenticationOptions {
  challenge: string;
  rpId: string;
  allowCredentials: { id: string; type: 'public-key'; transports?: AuthenticatorTransport[] }[];
  userVerification: UserVerificationRequirement;
  timeout: number;
}

export interface PasskeyRegistrationResult {
  success: boolean;
  credential: PasskeyCredential | null;
  error?: string;
}

export interface PasskeyAuthenticationResult {
  success: boolean;
  credentialId: string | null;
  signature: string | null;
  userHandle: string | null;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREDENTIAL STORE (in-memory, synced to IDENTITY module)
// ═══════════════════════════════════════════════════════════════════════════════

const credentialStore = new Map<string, PasskeyCredential[]>();

// ═══════════════════════════════════════════════════════════════════════════════
// CAPABILITY DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

export function isWebAuthnSupported(): boolean {
  return typeof window !== 'undefined' &&
    !!window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === 'function';
}

export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export async function isConditionalMediationAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;
  try {
    // @ts-ignore — conditional mediation API
    return typeof PublicKeyCredential.isConditionalMediationAvailable === 'function'
      // @ts-ignore
      ? await PublicKeyCredential.isConditionalMediationAvailable()
      : false;
  } catch {
    return false;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = '';
  for (const byte of bytes) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
  const binary = atob(base64 + pad);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function generateChallenge(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return bufferToBase64url(array.buffer);
}

// ═══════════════════════════════════════════════════════════════════════════════
// REGISTRATION (First-Time Passkey Setup)
// ═══════════════════════════════════════════════════════════════════════════════

export function generateRegistrationOptions(
  userId: string,
  displayName: string,
  existingCredentialIds: string[] = []
): WebAuthnRegistrationOptions {
  return {
    challenge: generateChallenge(),
    rp: {
      name: 'CMPSBL',
      id: window.location.hostname,
    },
    user: {
      id: userId,
      name: displayName,
      displayName,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' },   // ES256 (ECDSA w/ SHA-256)
      { alg: -257, type: 'public-key' },  // RS256 (RSASSA-PKCS1-v1_5 w/ SHA-256)
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform',
      residentKey: 'required',
      userVerification: 'required',
    },
    timeout: 60000,
    attestation: 'none', // Privacy-preserving: no attestation needed
  };
}

export async function registerPasskey(
  userId: string,
  displayName: string,
  existingCredentialIds: string[] = []
): Promise<PasskeyRegistrationResult> {
  if (!isWebAuthnSupported()) {
    return { success: false, credential: null, error: 'WebAuthn not supported on this device' };
  }

  try {
    const options = generateRegistrationOptions(userId, displayName, existingCredentialIds);

    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge: base64urlToBuffer(options.challenge),
      rp: options.rp,
      user: {
        id: new TextEncoder().encode(options.user.id),
        name: options.user.name,
        displayName: options.user.displayName,
      },
      pubKeyCredParams: options.pubKeyCredParams,
      authenticatorSelection: options.authenticatorSelection,
      timeout: options.timeout,
      attestation: options.attestation,
      excludeCredentials: existingCredentialIds.map(id => ({
        id: base64urlToBuffer(id),
        type: 'public-key' as const,
      })),
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential;

    if (!credential) {
      return { success: false, credential: null, error: 'Credential creation cancelled' };
    }

    const response = credential.response as AuthenticatorAttestationResponse;
    const publicKeyBytes = response.getPublicKey?.();

    const passkey: PasskeyCredential = {
      credentialId: bufferToBase64url(credential.rawId),
      publicKey: publicKeyBytes ? bufferToBase64url(publicKeyBytes) : '',
      deviceType: options.authenticatorSelection.authenticatorAttachment === 'platform' ? 'platform' : 'cross-platform',
      transports: (response.getTransports?.() as AuthenticatorTransport[]) || [],
      createdAt: Date.now(),
      lastUsedAt: Date.now(),
      userAgent: navigator.userAgent,
      aaguid: '', // Extracted from attestation if needed
    };

    // Store locally
    const userCreds = credentialStore.get(userId) || [];
    userCreds.push(passkey);
    credentialStore.set(userId, userCreds);

    emit({
      module: 'identity',
      event_type: 'passkey_registered',
      outcome: 'succeeded',
      data: { userId, credentialId: passkey.credentialId, deviceType: passkey.deviceType },
    });

    return { success: true, credential: passkey };
  } catch (err: any) {
    const error = err?.name === 'NotAllowedError'
      ? 'Authentication was cancelled or timed out'
      : err?.message || 'Passkey registration failed';

    emit({
      module: 'identity',
      event_type: 'passkey_registered',
      outcome: 'failed',
      data: { userId, error },
    });

    return { success: false, credential: null, error };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION (Returning User)
// ═══════════════════════════════════════════════════════════════════════════════

export function generateAuthenticationOptions(
  rpId?: string,
  allowCredentials: { id: string; transports?: AuthenticatorTransport[] }[] = []
): WebAuthnAuthenticationOptions {
  return {
    challenge: generateChallenge(),
    rpId: rpId || window.location.hostname,
    allowCredentials: allowCredentials.map(c => ({
      id: c.id,
      type: 'public-key' as const,
      transports: c.transports,
    })),
    userVerification: 'required',
    timeout: 60000,
  };
}

export async function authenticateWithPasskey(
  allowCredentials: { id: string; transports?: AuthenticatorTransport[] }[] = []
): Promise<PasskeyAuthenticationResult> {
  if (!isWebAuthnSupported()) {
    return { success: false, credentialId: null, signature: null, userHandle: null, error: 'WebAuthn not supported' };
  }

  try {
    const options = generateAuthenticationOptions(undefined, allowCredentials);

    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge: base64urlToBuffer(options.challenge),
      rpId: options.rpId,
      allowCredentials: options.allowCredentials.map(c => ({
        id: base64urlToBuffer(c.id),
        type: c.type,
        transports: c.transports,
      })),
      userVerification: options.userVerification,
      timeout: options.timeout,
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential;

    if (!assertion) {
      return { success: false, credentialId: null, signature: null, userHandle: null, error: 'Authentication cancelled' };
    }

    const response = assertion.response as AuthenticatorAssertionResponse;

    const result: PasskeyAuthenticationResult = {
      success: true,
      credentialId: bufferToBase64url(assertion.rawId),
      signature: bufferToBase64url(response.signature),
      userHandle: response.userHandle ? bufferToBase64url(response.userHandle) : null,
    };

    // Update last used timestamp in store
    for (const [uid, creds] of credentialStore) {
      const cred = creds.find(c => c.credentialId === result.credentialId);
      if (cred) {
        cred.lastUsedAt = Date.now();
        break;
      }
    }

    emit({
      module: 'identity',
      event_type: 'passkey_authenticated',
      outcome: 'succeeded',
      data: { credentialId: result.credentialId },
    });

    return result;
  } catch (err: any) {
    const error = err?.name === 'NotAllowedError'
      ? 'Authentication was cancelled or timed out'
      : err?.message || 'Passkey authentication failed';

    emit({
      module: 'identity',
      event_type: 'passkey_authenticated',
      outcome: 'failed',
      data: { error },
    });

    return { success: false, credentialId: null, signature: null, userHandle: null, error };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CREDENTIAL MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

export function getUserPasskeys(userId: string): PasskeyCredential[] {
  return credentialStore.get(userId) || [];
}

export function revokePasskey(userId: string, credentialId: string): boolean {
  const creds = credentialStore.get(userId);
  if (!creds) return false;
  const filtered = creds.filter(c => c.credentialId !== credentialId);
  if (filtered.length === creds.length) return false;
  credentialStore.set(userId, filtered);

  emit({
    module: 'identity',
    event_type: 'passkey_revoked',
    outcome: 'succeeded',
    data: { userId, credentialId },
  });

  return true;
}

export function getPasskeyCount(): number {
  let count = 0;
  for (const creds of credentialStore.values()) count += creds.length;
  return count;
}
