/**
 * CMPSBL® Time Capsule (Model 6)
 * 
 * Software that appreciates. Memory Stream discovers enhancements.
 * Optional upgrades. Notifications included in membership.
 * 
 * "Your software gets better while you sleep."
 */

export type CapsuleNotificationType = 'enhancement_found' | 'vulnerability_patched' | 'capability_upgrade' | 'tier_promotion';

export interface TimeCapsule {
  id: string;
  ownerId: string;
  discoveryId: string;
  originalCjpiScore: number;
  currentCjpiScore: number;
  originalTier: string;
  currentTier: string;
  enhancementsAvailable: CapsuleEnhancement[];
  createdAt: string;
  lastCheckedAt: string;
}

export interface CapsuleEnhancement {
  id: string;
  capsuleId: string;
  type: CapsuleNotificationType;
  title: string;
  description: string;
  projectedScoreIncrease: number;
  applied: boolean;
  discoveredAt: string;
}

export interface CapsuleNotification {
  id: string;
  capsuleId: string;
  type: CapsuleNotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

/**
 * Check if a capsule has appreciated in value
 */
export function hasAppreciated(capsule: TimeCapsule): boolean {
  return capsule.currentCjpiScore > capsule.originalCjpiScore;
}

/**
 * Calculate appreciation percentage
 */
export function getAppreciationRate(capsule: TimeCapsule): number {
  if (capsule.originalCjpiScore === 0) return 0;
  return Math.round(
    ((capsule.currentCjpiScore - capsule.originalCjpiScore) / capsule.originalCjpiScore) * 100
  );
}

/**
 * Get pending (unapplied) enhancements
 */
export function getPendingEnhancements(capsule: TimeCapsule): CapsuleEnhancement[] {
  return capsule.enhancementsAvailable.filter(e => !e.applied);
}

/**
 * Generate notification message for an enhancement type
 */
export function getNotificationMessage(type: CapsuleNotificationType, title: string): string {
  const templates: Record<CapsuleNotificationType, string> = {
    enhancement_found: `New enhancement discovered for your software: ${title}`,
    vulnerability_patched: `A vulnerability in your software has been addressed: ${title}`,
    capability_upgrade: `New capability available for your software: ${title}`,
    tier_promotion: `Your software has been promoted to a higher tier: ${title}`,
  };
  return templates[type];
}
