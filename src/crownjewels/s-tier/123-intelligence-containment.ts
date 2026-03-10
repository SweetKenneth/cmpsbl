/**
 * S-Tier 123 — Intelligence Containment Engine
 * ID: S-CJ81 | CJPI: 87 | Module: DEFENSE
 * 
 * Containment protocols for runaway intelligence processes.
 */

export interface ContainmentZone {
  id: string;
  name: string;
  processes: string[];
  maxCpu: number;
  maxMemoryMb: number;
  maxDurationMs: number;
  status: 'active' | 'breached' | 'contained' | 'released';
}

export interface ContainmentEvent {
  id: string;
  zoneId: string;
  processId: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'throttle' | 'isolate' | 'terminate' | 'quarantine';
  timestamp: string;
}

export class IntelligenceContainmentEngine {
  private zones: Map<string, ContainmentZone> = new Map();
  private events: ContainmentEvent[] = [];

  createZone(name: string, limits: { maxCpu: number; maxMemoryMb: number; maxDurationMs: number }): ContainmentZone {
    const zone: ContainmentZone = {
      id: crypto.randomUUID(),
      name,
      processes: [],
      ...limits,
      status: 'active',
    };
    this.zones.set(zone.id, zone);
    return zone;
  }

  assignProcess(zoneId: string, processId: string): boolean {
    const zone = this.zones.get(zoneId);
    if (!zone || zone.status === 'breached') return false;
    zone.processes.push(processId);
    return true;
  }

  checkViolation(zoneId: string, metrics: { cpu: number; memoryMb: number; durationMs: number }): ContainmentEvent | null {
    const zone = this.zones.get(zoneId);
    if (!zone) return null;

    let reason = '';
    let severity: ContainmentEvent['severity'] = 'low';
    let action: ContainmentEvent['action'] = 'throttle';

    if (metrics.cpu > zone.maxCpu * 1.5) {
      reason = `CPU ${metrics.cpu}% exceeds 150% of limit`;
      severity = 'critical'; action = 'terminate';
    } else if (metrics.cpu > zone.maxCpu) {
      reason = `CPU ${metrics.cpu}% exceeds limit`;
      severity = 'high'; action = 'isolate';
    } else if (metrics.memoryMb > zone.maxMemoryMb * 1.2) {
      reason = `Memory ${metrics.memoryMb}MB exceeds 120% of limit`;
      severity = 'critical'; action = 'terminate';
    } else if (metrics.memoryMb > zone.maxMemoryMb) {
      reason = `Memory ${metrics.memoryMb}MB exceeds limit`;
      severity = 'high'; action = 'quarantine';
    } else if (metrics.durationMs > zone.maxDurationMs) {
      reason = `Duration ${metrics.durationMs}ms exceeds limit`;
      severity = 'medium'; action = 'throttle';
    } else {
      return null;
    }

    zone.status = severity === 'critical' ? 'breached' : 'contained';
    const event: ContainmentEvent = {
      id: crypto.randomUUID(), zoneId, processId: zone.processes[0] || 'unknown',
      reason, severity, action, timestamp: new Date().toISOString(),
    };
    this.events.push(event);
    return event;
  }

  getEvents(): ContainmentEvent[] { return [...this.events]; }
  getZones(): ContainmentZone[] { return [...this.zones.values()]; }
}
