/**
 * Canary Deployment Manager
 * Gradual traffic shifting for capability rollouts
 * 
 * Routes a percentage of requests to new capability versions
 * while monitoring health metrics for safe promotion or rollback.
 */

export interface CanaryDeployment {
  id: string;
  capabilityId: string;
  baselineVersion: string;
  canaryVersion: string;
  trafficPercent: number;
  status: 'active' | 'promoted' | 'rolled_back' | 'paused';
  healthChecks: { baseline: number; canary: number };
  requestCounts: { baseline: number; canary: number };
  createdAt: number;
}

const deployments = new Map<string, CanaryDeployment>();

export function createCanary(capabilityId: string, baselineVersion: string, canaryVersion: string, initialPercent: number = 5): CanaryDeployment {
  const d: CanaryDeployment = {
    id: `canary-${Date.now()}`,
    capabilityId, baselineVersion, canaryVersion,
    trafficPercent: Math.min(100, Math.max(0, initialPercent)),
    status: 'active',
    healthChecks: { baseline: 100, canary: 100 },
    requestCounts: { baseline: 0, canary: 0 },
    createdAt: Date.now(),
  };
  deployments.set(d.id, d);
  return d;
}

export function routeRequest(canaryId: string): 'baseline' | 'canary' {
  const d = deployments.get(canaryId);
  if (!d || d.status !== 'active') return 'baseline';
  const route = Math.random() * 100 < d.trafficPercent ? 'canary' : 'baseline';
  d.requestCounts[route]++;
  return route;
}

export function adjustTraffic(canaryId: string, percent: number): boolean {
  const d = deployments.get(canaryId);
  if (!d || d.status !== 'active') return false;
  d.trafficPercent = Math.min(100, Math.max(0, percent));
  return true;
}

export function promoteCanary(canaryId: string): boolean {
  const d = deployments.get(canaryId);
  if (!d || d.status !== 'active') return false;
  d.status = 'promoted';
  d.trafficPercent = 100;
  return true;
}

export function rollbackCanary(canaryId: string): boolean {
  const d = deployments.get(canaryId);
  if (!d || d.status !== 'active') return false;
  d.status = 'rolled_back';
  d.trafficPercent = 0;
  return true;
}

export function updateHealth(canaryId: string, baseline: number, canary: number): void {
  const d = deployments.get(canaryId);
  if (d) d.healthChecks = { baseline, canary };
}

export function getDeployments(): CanaryDeployment[] { return Array.from(deployments.values()); }
export function getDeployment(id: string): CanaryDeployment | undefined { return deployments.get(id); }
