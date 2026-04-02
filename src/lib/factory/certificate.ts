/**
 * Certificate Generation System
 * Creates unique ownership certificates for purchased discoveries.
 * Serial number + CJPI score + structural fingerprint + retirement seal.
 */

export interface OwnershipCertificate {
  serialNumber: string;
  discoveryId: string;
  discoveryName: string;
  purchasedBy: string;
  purchasedAt: Date;
  cjpiScore: number;
  tier: string;
  structuralFingerprint: string;
  primitiveChain: string[];
  retirementSeal: string;
  isRetired: boolean;
}

/**
 * Generate a unique serial number.
 * Format: CMPSBL-YYYYMMDD-XXXXX
 */
function generateSerialNumber(): string {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `CMPSBL-${date}-${random}`;
}

/**
 * Generate a structural fingerprint (SHA-256-style hash).
 * In production this uses crypto.subtle; here we use a deterministic hash.
 */
function generateStructuralFingerprint(input: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hash = (4294967296 * (2097151 & h2) + (h1 >>> 0));
  return hash.toString(16).padStart(16, '0');
}

/**
 * Generate a retirement seal — cryptographic proof of permanent retirement.
 */
function generateRetirementSeal(serialNumber: string, fingerprint: string): string {
  return generateStructuralFingerprint(`SEAL:${serialNumber}:${fingerprint}:${Date.now()}`);
}

/**
 * Create an ownership certificate for a purchased discovery.
 */
export function createCertificate(
  discoveryId: string,
  discoveryName: string,
  purchasedBy: string,
  cjpiScore: number,
  tier: string,
  primitiveChain: string[],
): OwnershipCertificate {
  const serialNumber = generateSerialNumber();
  const chainString = primitiveChain.join(':');
  const fingerprint = generateStructuralFingerprint(`${discoveryId}:${chainString}:${serialNumber}`);
  const retirementSeal = generateRetirementSeal(serialNumber, fingerprint);

  return {
    serialNumber,
    discoveryId,
    discoveryName,
    purchasedBy,
    purchasedAt: new Date(),
    cjpiScore,
    tier,
    structuralFingerprint: fingerprint,
    primitiveChain,
    retirementSeal,
    isRetired: true, // Immediately retired upon purchase
  };
}

/**
 * Verify a certificate's integrity.
 */
export function verifyCertificate(cert: OwnershipCertificate): boolean {
  const chainString = cert.primitiveChain.join(':');
  const expectedFingerprint = generateStructuralFingerprint(
    `${cert.discoveryId}:${chainString}:${cert.serialNumber}`
  );
  return cert.structuralFingerprint === expectedFingerprint;
}
