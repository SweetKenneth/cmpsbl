/**
 * S-Tier 133 — Capability Impact Forecaster
 * ID: S-CJ91 | CJPI: 87 | Module: ATLAS
 * 
 * Forecasts the impact of enabling or disabling capabilities.
 */

export interface CapabilityProfile {
  id: string;
  name: string;
  dependencies: string[];
  dependents: string[];
  healthContribution: number; // 0-1
  costPerHour: number;
}

export interface ImpactForecast {
  capabilityId: string;
  action: 'enable' | 'disable';
  affectedCapabilities: string[];
  healthDelta: number;
  costDelta: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  cascadeDepth: number;
  recommendation: string;
}

export class CapabilityImpactForecaster {
  private capabilities: Map<string, CapabilityProfile> = new Map();

  register(profile: CapabilityProfile): void {
    this.capabilities.set(profile.id, profile);
  }

  forecast(capabilityId: string, action: 'enable' | 'disable'): ImpactForecast {
    const capability = this.capabilities.get(capabilityId);
    if (!capability) {
      return {
        capabilityId, action, affectedCapabilities: [], healthDelta: 0,
        costDelta: 0, riskLevel: 'low', cascadeDepth: 0, recommendation: 'Unknown capability',
      };
    }

    // BFS to find cascade
    const affected = new Set<string>();
    const queue = action === 'disable' ? [...capability.dependents] : [...capability.dependencies];
    let depth = 0;

    while (queue.length > 0 && depth < 10) {
      const batch = queue.splice(0, queue.length);
      depth++;
      for (const id of batch) {
        if (affected.has(id)) continue;
        affected.add(id);
        const dep = this.capabilities.get(id);
        if (dep) {
          queue.push(...(action === 'disable' ? dep.dependents : dep.dependencies));
        }
      }
    }

    const healthDelta = action === 'disable'
      ? -(capability.healthContribution + [...affected].reduce((s, id) => {
          const c = this.capabilities.get(id);
          return s + (c?.healthContribution || 0) * 0.5;
        }, 0))
      : capability.healthContribution;

    const costDelta = action === 'disable' ? -capability.costPerHour : capability.costPerHour;

    const riskLevel: ImpactForecast['riskLevel'] = 
      affected.size > 10 ? 'critical' : affected.size > 5 ? 'high' : affected.size > 2 ? 'medium' : 'low';

    return {
      capabilityId, action,
      affectedCapabilities: [...affected],
      healthDelta, costDelta, riskLevel, cascadeDepth: depth,
      recommendation: riskLevel === 'critical'
        ? `DO NOT ${action}: ${affected.size} capabilities in cascade`
        : `${action} with monitoring: ${affected.size} downstream effects`,
    };
  }
}
