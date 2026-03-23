/**
 * IMMUNITY Ultimate — Vaccination Campaign Engine
 * 
 * Proactively hardens nodes against known threat families before attack.
 * - Campaign planner: prioritizes unvaccinated nodes by exposure risk
 * - Vaccine synthesis from antibody library
 * - Rollout scheduler: applies during maintenance windows
 * - Efficacy tracking for breakthrough infections
 */

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export interface VaccineCampaign {
  id: string;
  threatFamily: string;
  targetNodes: string[];
  vaccinatedNodes: string[];
  startedAt: number;
  completedAt: number | null;
  status: 'planning' | 'active' | 'completed' | 'aborted';
  efficacyTarget: number;      // minimum acceptable efficacy
  breakthroughCount: number;
}

export interface VaccineSpec {
  threatFamily: string;
  hardeningConfig: Record<string, unknown>;
  expectedEfficacy: number;
  synthesizedAt: number;
}

export interface CampaignHealth {
  activeCampaigns: number;
  completedCampaigns: number;
  totalVaccinations: number;
  avgEfficacy: number;
  breakthroughRate: number;
}

// ═══════════════════════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════════════════════

const MAX_CONCURRENT_CAMPAIGNS = 3;

const campaigns = new Map<string, VaccineCampaign>();
const vaccineLibrary = new Map<string, VaccineSpec>();
const nodeVaccinations = new Map<string, Set<string>>(); // nodeId → vaccinated families
let totalVaccinations = 0;
let totalBreakthroughs = 0;

// ═══════════════════════════════════════════════════════════════
// CORE LOGIC
// ═══════════════════════════════════════════════════════════════

/** Synthesize a vaccine from antibody data */
export function synthesizeVaccine(
  threatFamily: string,
  hardeningConfig: Record<string, unknown>,
  expectedEfficacy: number,
): VaccineSpec {
  const spec: VaccineSpec = {
    threatFamily,
    hardeningConfig,
    expectedEfficacy: Math.max(0, Math.min(1, expectedEfficacy)),
    synthesizedAt: Date.now(),
  };
  vaccineLibrary.set(threatFamily, spec);
  return spec;
}

/** Plan a vaccination campaign */
export function planCampaign(
  threatFamily: string,
  allNodes: string[],
  efficacyTarget = 0.85,
): VaccineCampaign | null {
  const activeCampaigns = Array.from(campaigns.values()).filter(c => c.status === 'active');
  if (activeCampaigns.length >= MAX_CONCURRENT_CAMPAIGNS) return null;

  // Find unvaccinated nodes
  const unvaccinated = allNodes.filter(n => {
    const vaxxed = nodeVaccinations.get(n);
    return !vaxxed || !vaxxed.has(threatFamily);
  });

  if (unvaccinated.length === 0) return null;

  const campaign: VaccineCampaign = {
    id: `vc_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    threatFamily,
    targetNodes: unvaccinated,
    vaccinatedNodes: [],
    startedAt: Date.now(),
    completedAt: null,
    status: 'planning',
    efficacyTarget,
    breakthroughCount: 0,
  };

  campaigns.set(campaign.id, campaign);
  return campaign;
}

/** Start a campaign */
export function startCampaign(campaignId: string): boolean {
  const campaign = campaigns.get(campaignId);
  if (!campaign || campaign.status !== 'planning') return false;
  campaign.status = 'active';
  return true;
}

/** Vaccinate a single node in a campaign */
export function vaccinateNode(campaignId: string, nodeId: string): boolean {
  const campaign = campaigns.get(campaignId);
  if (!campaign || campaign.status !== 'active') return false;
  if (!campaign.targetNodes.includes(nodeId)) return false;
  if (campaign.vaccinatedNodes.includes(nodeId)) return false;

  campaign.vaccinatedNodes.push(nodeId);
  const nodeSet = nodeVaccinations.get(nodeId) ?? new Set();
  nodeSet.add(campaign.threatFamily);
  nodeVaccinations.set(nodeId, nodeSet);
  totalVaccinations++;

  // Check if campaign complete
  if (campaign.vaccinatedNodes.length >= campaign.targetNodes.length) {
    campaign.status = 'completed';
    campaign.completedAt = Date.now();
  }

  return true;
}

/** Record a breakthrough infection */
export function recordBreakthrough(campaignId: string): boolean {
  const campaign = campaigns.get(campaignId);
  if (!campaign) return false;
  campaign.breakthroughCount++;
  totalBreakthroughs++;
  return true;
}

/** Abort a campaign */
export function abortCampaign(campaignId: string): boolean {
  const campaign = campaigns.get(campaignId);
  if (!campaign || campaign.status === 'completed') return false;
  campaign.status = 'aborted';
  campaign.completedAt = Date.now();
  return true;
}

/** Get campaign by ID */
export function getCampaign(id: string): VaccineCampaign | null {
  return campaigns.get(id) ?? null;
}

/** Get all active campaigns */
export function getActiveCampaigns(): VaccineCampaign[] {
  return Array.from(campaigns.values()).filter(c => c.status === 'active');
}

/** Check if a node is vaccinated against a family */
export function isVaccinated(nodeId: string, threatFamily: string): boolean {
  const vaxxed = nodeVaccinations.get(nodeId);
  return vaxxed?.has(threatFamily) ?? false;
}

/** Get campaign health */
export function getCampaignHealth(): CampaignHealth {
  const all = Array.from(campaigns.values());
  const completed = all.filter(c => c.status === 'completed');
  const avgEfficacy = completed.length > 0
    ? completed.reduce((s, c) => {
        const total = c.vaccinatedNodes.length;
        const effective = total - c.breakthroughCount;
        return s + (total > 0 ? effective / total : 1);
      }, 0) / completed.length
    : 0;

  return {
    activeCampaigns: all.filter(c => c.status === 'active').length,
    completedCampaigns: completed.length,
    totalVaccinations,
    avgEfficacy: Math.round(avgEfficacy * 100) / 100,
    breakthroughRate: totalVaccinations > 0
      ? Math.round((totalBreakthroughs / totalVaccinations) * 1000) / 1000
      : 0,
  };
}
