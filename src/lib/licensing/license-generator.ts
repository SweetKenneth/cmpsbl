/**
 * License Key Generator & Validator
 * Single-install license system for the CMPSBL Substrate
 */

import { supabase } from '@/integrations/supabase/client';

// License key format: PF-XXXXX-XXXXX-XXXXX-XXXXX
function generateLicenseKey(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // No ambiguous chars
  const segments = 4;
  const segmentLength = 5;
  
  const parts: string[] = [];
  for (let s = 0; s < segments; s++) {
    let segment = '';
    for (let i = 0; i < segmentLength; i++) {
      segment += chars[Math.floor(Math.random() * chars.length)];
    }
    parts.push(segment);
  }
  
  return `PF-${parts.join('-')}`;
}

// Hash for storage
async function hashKey(key: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export interface LicenseData {
  id: string;
  license_key_hash: string;
  license_key_prefix: string;
  product_type: 'os' | 'template';
  product_id: string;
  purchaser_email: string;
  stripe_session_id: string;
  activated: boolean;
  activated_at: string | null;
  activated_domain: string | null;
  created_at: string;
}

export async function createLicense(
  productType: 'os' | 'template',
  productId: string,
  purchaserEmail: string,
  stripeSessionId: string
): Promise<{ license: LicenseData; plainKey: string }> {
  const plainKey = generateLicenseKey();
  const keyHash = await hashKey(plainKey);
  const keyPrefix = plainKey.substring(0, 8); // PF-XXXXX
  
  // Store in database (we'll create this table via migration)
  const { data, error } = await (supabase as any)
    .from('marketplace_licenses')
    .insert({
      license_key_hash: keyHash,
      license_key_prefix: keyPrefix,
      product_type: productType,
      product_id: productId,
      purchaser_email: purchaserEmail,
      stripe_session_id: stripeSessionId,
      activated: false,
    })
    .select()
    .single();
    
  if (error) throw error;
  
  return { license: data, plainKey };
}

export async function validateLicense(licenseKey: string): Promise<{
  valid: boolean;
  activated: boolean;
  error?: string;
  license?: LicenseData;
}> {
  if (!licenseKey.startsWith('PF-') || licenseKey.length !== 24) {
    return { valid: false, activated: false, error: 'Invalid license key format' };
  }
  
  const keyHash = await hashKey(licenseKey);
  
  const { data, error } = await (supabase as any)
    .from('marketplace_licenses')
    .select('*')
    .eq('license_key_hash', keyHash)
    .single();
    
  if (error || !data) {
    return { valid: false, activated: false, error: 'License key not found' };
  }
  
  return {
    valid: true,
    activated: data.activated,
    license: data,
  };
}

export async function activateLicense(licenseKey: string, domain?: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const validation = await validateLicense(licenseKey);
  
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  if (validation.activated) {
    return { success: false, error: 'License has already been activated. Each license is valid for one installation only.' };
  }
  
  const keyHash = await hashKey(licenseKey);
  
  const { error } = await (supabase as any)
    .from('marketplace_licenses')
    .update({
      activated: true,
      activated_at: new Date().toISOString(),
      activated_domain: domain || null,
    })
    .eq('license_key_hash', keyHash);
    
  if (error) {
    return { success: false, error: 'Failed to activate license' };
  }
  
  return { success: true };
}
