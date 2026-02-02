/**
 * Capabilities Depot — Licensing & Download Enforcement
 * Validates entitlement at download time only
 * No runtime checks after download
 * v1.0.0
 */

import type { CapabilityLicense, DownloadRequest, DownloadResponse } from './types';

// === License Validation Result ===
export interface LicenseValidationResult {
  valid: boolean;
  license?: CapabilityLicense;
  error?: string;
  errorCode?: 'NO_LICENSE' | 'LICENSE_REVOKED' | 'LICENSE_EXPIRED';
}

// === Check if user has valid license for capability ===
export function validateLicense(
  licenses: CapabilityLicense[],
  capabilityId: string,
  userId: string
): LicenseValidationResult {
  // Find license for this capability and user
  const license = licenses.find(
    (l) => l.capabilityId === capabilityId && l.userId === userId
  );

  if (!license) {
    return {
      valid: false,
      error: 'No license found for this capability',
      errorCode: 'NO_LICENSE',
    };
  }

  if (license.status === 'revoked') {
    return {
      valid: false,
      license,
      error: 'License has been revoked',
      errorCode: 'LICENSE_REVOKED',
    };
  }

  if (license.status === 'expired') {
    return {
      valid: false,
      license,
      error: 'License has expired',
      errorCode: 'LICENSE_EXPIRED',
    };
  }

  return {
    valid: true,
    license,
  };
}

// === Process Download Request ===
export function processDownloadRequest(
  request: DownloadRequest,
  licenses: CapabilityLicense[],
  generateSignedUrl: (capabilityId: string, version: string) => string | null
): DownloadResponse {
  // Validate license
  const validation = validateLicense(licenses, request.capabilityId, request.userId);

  if (!validation.valid) {
    return {
      success: false,
      error: validation.error,
      errorCode: validation.errorCode,
    };
  }

  // Generate signed download URL (expires in 1 hour)
  const version = request.version || 'latest';
  const downloadUrl = generateSignedUrl(request.capabilityId, version);

  if (!downloadUrl) {
    return {
      success: false,
      error: 'Version not found',
      errorCode: 'VERSION_NOT_FOUND',
    };
  }

  // Calculate expiry (1 hour from now)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  return {
    success: true,
    downloadUrl,
    expiresAt,
  };
}

// === Compare Versions (semver) ===
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

// === Check if Update Available ===
export function isUpdateAvailable(
  license: CapabilityLicense,
  latestVersion: string
): boolean {
  if (!license.lastDownloadedVersion) return true;
  return compareVersions(latestVersion, license.lastDownloadedVersion) > 0;
}

// === Format License Status ===
export function formatLicenseStatus(license: CapabilityLicense): {
  label: string;
  color: string;
  icon: string;
} {
  switch (license.status) {
    case 'active':
      return { label: 'Active', color: 'emerald', icon: 'CheckCircle' };
    case 'revoked':
      return { label: 'Revoked', color: 'rose', icon: 'XCircle' };
    case 'expired':
      return { label: 'Expired', color: 'amber', icon: 'Clock' };
    default:
      return { label: 'Unknown', color: 'gray', icon: 'HelpCircle' };
  }
}

// === Generate License Key (for display) ===
export function generateDisplayKey(licenseId: string): string {
  const hash = licenseId.substring(0, 8).toUpperCase();
  return `CAP-${hash}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}
