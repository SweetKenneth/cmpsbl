/**
 * CMPSBL® $300 Campaign Tracking
 * 
 * Tracks the five acquisition channels:
 *   1. Agent Power-Up landing page (free)
 *   2. Reddit r/software stress test (free)
 *   3. GitHub outreach to 20 agent builders (free)
 *   4. Carbon Ads ($200)
 *   5. Slack/Discord community sponsorship ($100)
 * 
 * Goal: 10 paying customers at $29/mo = $290 MRR
 */

export type CampaignChannel =
  | 'agent_power_up'
  | 'reddit_stress_test'
  | 'github_outreach'
  | 'carbon_ads'
  | 'slack_discord';

export interface CampaignEvent {
  channel: CampaignChannel;
  action: 'visit' | 'email_capture' | 'diagnostic_upload' | 'signup' | 'subscription';
  metadata?: Record<string, string>;
  timestamp: string;
}

export interface ChannelMetrics {
  channel: CampaignChannel;
  budgetCents: number;
  visits: number;
  emailCaptures: number;
  diagnosticUploads: number;
  signups: number;
  subscriptions: number;
  costPerAcquisitionCents: number | null;
}

const CHANNEL_BUDGETS: Record<CampaignChannel, number> = {
  agent_power_up: 0,
  reddit_stress_test: 0,
  github_outreach: 0,
  carbon_ads: 20000,
  slack_discord: 10000,
};

const CHANNEL_LABELS: Record<CampaignChannel, string> = {
  agent_power_up: 'Agent Power-Up',
  reddit_stress_test: 'Reddit Stress Test',
  github_outreach: 'GitHub Outreach',
  carbon_ads: 'Carbon Ads',
  slack_discord: 'Slack/Discord',
};

/**
 * Parse UTM parameters into a campaign channel
 */
export function parseChannelFromUTM(utmSource?: string, utmMedium?: string): CampaignChannel | null {
  if (!utmSource) return null;

  const source = utmSource.toLowerCase();
  if (source === 'carbon' || source === 'carbonads') return 'carbon_ads';
  if (source === 'reddit') return 'reddit_stress_test';
  if (source === 'github') return 'github_outreach';
  if (source === 'slack' || source === 'discord') return 'slack_discord';
  if (source === 'agent-power-up' || source === 'powerup') return 'agent_power_up';

  return null;
}

/**
 * Get display label for a campaign channel
 */
export function getChannelLabel(channel: CampaignChannel): string {
  return CHANNEL_LABELS[channel];
}

/**
 * Get budget for a campaign channel in cents
 */
export function getChannelBudget(channel: CampaignChannel): number {
  return CHANNEL_BUDGETS[channel];
}

/**
 * Calculate cost per acquisition for a channel
 */
export function calculateCPA(budgetCents: number, subscriptions: number): number | null {
  if (subscriptions === 0) return null;
  return Math.round(budgetCents / subscriptions);
}

/**
 * Check if campaign has met its target
 * Target: 10 paying customers, $290 MRR
 */
export function isCampaignSuccessful(totalSubscriptions: number, mrrCents: number): boolean {
  return totalSubscriptions >= 10 && mrrCents >= 29000;
}

/**
 * Total campaign budget in cents
 */
export const TOTAL_CAMPAIGN_BUDGET_CENTS = Object.values(CHANNEL_BUDGETS).reduce((a, b) => a + b, 0);
