/**
 * CLM Tier Command
 * v10.5.4 — ARCHITECT Epoch First-class tier command for CLM governance
 * 
 * Provides:
 * - tier.get → current tier + limits + budget settings
 * - tier.set → update runtime tier (admin-only)
 * - tier.limits → Nexus daily remaining + CLM budget remaining
 */

import { budgetGovernor } from './budget-governor';
import type { CLMConfig, BudgetState } from './config';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface TierInfo {
  name: string;
  level: number;
  dailyNexusLimit: number;
  clmBudgetPct: number;
  spacingMultiplier: number;
  maxTokensPerJob: number;
}

export interface TierLimits {
  tier: TierInfo;
  nexus: {
    dailyLimit: number;
    usedToday: number;
    remainingToday: number;
    remainingPct: number;
  };
  clm: {
    budgetUnits: number;
    usedToday: number;
    remainingToday: number;
    remainingPct: number;
    nextAllowedAt: string | null;
    isPaused: boolean;
    isKillSwitchActive: boolean;
  };
}

export interface TierCommandResult {
  success: boolean;
  command: 'get' | 'set' | 'limits';
  data: TierInfo | TierLimits | null;
  error?: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// TIER DEFINITIONS
// ═══════════════════════════════════════════════════════════════════════════════

const TIERS: Record<string, TierInfo> = {
  free: {
    name: 'free',
    level: 0,
    dailyNexusLimit: 1000,
    clmBudgetPct: 0.30,
    spacingMultiplier: 2.0,
    maxTokensPerJob: 500,
  },
  standard: {
    name: 'standard',
    level: 1,
    dailyNexusLimit: 236164,
    clmBudgetPct: 0.70,
    spacingMultiplier: 1.0,
    maxTokensPerJob: 1200,
  },
  pro: {
    name: 'pro',
    level: 2,
    dailyNexusLimit: 25000,
    clmBudgetPct: 0.80,
    spacingMultiplier: 0.75,
    maxTokensPerJob: 2000,
  },
  enterprise: {
    name: 'enterprise',
    level: 3,
    dailyNexusLimit: 100000,
    clmBudgetPct: 0.90,
    spacingMultiplier: 0.5,
    maxTokensPerJob: 4000,
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// TIER COMMAND HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

class TierCommandClient {
  private static instance: TierCommandClient;
  private currentTier: TierInfo = TIERS.standard;

  private constructor() {
    this.loadTier();
  }

  static getInstance(): TierCommandClient {
    if (!TierCommandClient.instance) {
      TierCommandClient.instance = new TierCommandClient();
    }
    return TierCommandClient.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMAND HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * tier.get - Get current tier info
   */
  get(): TierCommandResult {
    return {
      success: true,
      command: 'get',
      data: { ...this.currentTier },
    };
  }

  /**
   * tier.set - Set runtime tier (admin-only)
   */
  set(tierName: string): TierCommandResult {
    const tier = TIERS[tierName.toLowerCase()];
    
    if (!tier) {
      return {
        success: false,
        command: 'set',
        data: null,
        error: `Unknown tier: ${tierName}. Valid tiers: ${Object.keys(TIERS).join(', ')}`,
      };
    }

    this.currentTier = tier;
    this.persistTier();

    // Update budget governor with new tier settings
    budgetGovernor.setConfig({
      minSpacingMinutes: Math.round(15 * tier.spacingMultiplier),
    });

    return {
      success: true,
      command: 'set',
      data: { ...this.currentTier },
    };
  }

  /**
   * tier.limits - Get detailed limit information
   */
  limits(): TierCommandResult {
    const budgetState = budgetGovernor.getState();
    const tierLimits = budgetGovernor.getTierLimits();
    const config = budgetGovernor.getConfig();

    const limits: TierLimits = {
      tier: { ...this.currentTier },
      nexus: {
        dailyLimit: tierLimits.clmBudgetUnits || tierLimits.dailyNexusLimit,
        usedToday: tierLimits.usedToday,
        remainingToday: tierLimits.remainingToday,
        remainingPct: tierLimits.remainingPct,
      },
      clm: {
        budgetUnits: tierLimits.clmBudgetUnits,
        usedToday: tierLimits.usedToday,
        remainingToday: tierLimits.remainingToday,
        remainingPct: tierLimits.remainingPct,
        nextAllowedAt: budgetState.nextAllowedAt?.toISOString() || null,
        isPaused: budgetState.pausedDueToErrors,
        isKillSwitchActive: config.killSwitch,
      },
    };

    return {
      success: true,
      command: 'limits',
      data: limits,
    };
  }

  /**
   * Execute tier command by name
   */
  execute(command: string, args?: Record<string, unknown>): TierCommandResult {
    switch (command) {
      case 'get':
      case 'tier.get':
        return this.get();
      
      case 'set':
      case 'tier.set':
        if (!args?.tierName) {
          return {
            success: false,
            command: 'set',
            data: null,
            error: 'Missing tierName argument',
          };
        }
        return this.set(args.tierName as string);
      
      case 'limits':
      case 'tier.limits':
        return this.limits();
      
      default:
        return {
          success: false,
          command: 'get',
          data: null,
          error: `Unknown tier command: ${command}. Valid commands: get, set, limits`,
        };
    }
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Get all available tiers
   */
  getAvailableTiers(): TierInfo[] {
    return Object.values(TIERS);
  }

  /**
   * Get current tier
   */
  getCurrentTier(): TierInfo {
    return { ...this.currentTier };
  }

  /**
   * Check if current tier allows a feature
   */
  canAccess(requiredLevel: number): boolean {
    return this.currentTier.level >= requiredLevel;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PERSISTENCE
  // ═══════════════════════════════════════════════════════════════════════════

  private loadTier(): void {
    try {
      const { secureGet } = require('@/lib/system/secureStorage');
      const stored = secureGet<string>('clm_current_tier');
      if (stored && TIERS[stored]) {
        this.currentTier = TIERS[stored];
      }
    } catch {
      // Use default tier
    }
  }

  private persistTier(): void {
    try {
      const { secureSet } = require('@/lib/system/secureStorage');
      secureSet('clm_current_tier', this.currentTier.name);
      }
    } catch {
      // Non-critical
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const tierCommand = TierCommandClient.getInstance();
export { TierCommandClient, TIERS };
