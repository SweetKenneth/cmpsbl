/**
 * Agent Forge Name Validation
 * CLI-friendly naming: 3-8 chars, alphanumeric + hyphens, globally unique
 */

/** Validate an agent name (3-8 chars, A-Z0-9 and hyphens) */
export function validateAgentName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length < 3) {
    return { valid: false, error: 'Name must be at least 3 characters' };
  }
  if (name.length > 8) {
    return { valid: false, error: 'Name must be 8 characters or less' };
  }
  if (!/^[A-Za-z0-9\-]{3,8}$/.test(name)) {
    return { valid: false, error: 'Only letters, numbers, and hyphens allowed' };
  }
  if (name.startsWith('-') || name.endsWith('-')) {
    return { valid: false, error: 'Cannot start or end with a hyphen' };
  }
  return { valid: true };
}

/** Validate an agency name (3-16 chars, A-Z0-9, spaces, and hyphens) */
export function validateAgencyName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length < 3) {
    return { valid: false, error: 'Agency name must be at least 3 characters' };
  }
  if (name.length > 16) {
    return { valid: false, error: 'Agency name must be 16 characters or less' };
  }
  if (!/^[A-Za-z0-9 \-]{3,16}$/.test(name)) {
    return { valid: false, error: 'Only letters, numbers, spaces, and hyphens allowed' };
  }
  return { valid: true };
}

/** Format agent name for display (uppercase) */
export function formatAgentName(name: string): string {
  return name.toUpperCase();
}

/** Format agent name for CLI usage (uppercase, no spaces) */
export function formatForCLI(name: string): string {
  return name.toUpperCase().replace(/\s+/g, '-');
}
