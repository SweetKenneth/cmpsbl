// CMPSBL Defense System Initialization
// Performance: Lazy-loads defenseTracking module
// Uses secure storage for all state

import { secureSet, secureGet, secureRemove, migrateLegacyKey } from '@/lib/system/secureStorage';

let defenseTrackingModule: typeof import('./defenseTracking') | null = null;

// Lazy load defense tracking only when needed
async function getDefenseTracking() {
  if (!defenseTrackingModule) {
    defenseTrackingModule = await import('./defenseTracking');
  }
  return defenseTrackingModule;
}

export const installDefenseSystem = (): void => {
  // Migrate legacy plaintext keys
  migrateLegacyKey('pf_defense_initialized');
  migrateLegacyKey('pf_defense_installed_at');
  migrateLegacyKey('pf_defense_version');
  
  const isInitialized = secureGet<boolean>('pf_defense_initialized');
  
  if (!isInitialized) {
    secureSet('pf_defense_initialized', true);
    secureSet('pf_defense_installed_at', new Date().toISOString());
    secureSet('pf_defense_version', '1.0.0');
  }
};

export const getDefenseSystemInfo = async () => {
  const isInitialized = secureGet<boolean>('pf_defense_initialized') === true;
  const installedAt = secureGet<string>('pf_defense_installed_at');
  const version = secureGet<string>('pf_defense_version');
  
  const tracking = await getDefenseTracking();
  const stats = {
    botDetections: tracking.getBotDetections().length,
  };
  
  return {
    isInstalled: isInitialized,
    version: version || '0.0.0',
    installedAt: installedAt || null,
    stats,
    edgeFunctions: 18,
    apiFunctions: 11,
    totalFunctions: 29,
    modules: [
      'Bot Detection',
      'Behavioral Analysis', 
      'CAPTCHA',
      'Device Fingerprint',
      'Threat Intelligence',
      'Red Team Testing',
      'Remote Diagnostics',
      'Auto Repair',
      'Update Management',
      'Brain',
      'API Key Generation',
      'Remote Heal',
      'Self-Heal',
      'Emergency Shutdown',
      'Bot Alerts',
      'AI Chat'
    ]
  };
};

// Reset entire defense system (use with caution)
export const resetDefenseSystem = async (): Promise<void> => {
  const tracking = await getDefenseTracking();
  tracking.clearAllDefenseData();
  secureRemove('pf_defense_initialized');
  secureRemove('pf_defense_installed_at');
  secureRemove('pf_defense_version');
};