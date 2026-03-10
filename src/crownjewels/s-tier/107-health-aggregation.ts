/**
 * S-Tier 107 — Health Aggregation Dashboard
 * ID: S-125 | CJPI: 89 | Module: SYSTEM
 * 
 * Aggregated health view across all system nodes with drill-down capability.
 */

export interface NodeHealthReport {
  nodeId: string;
  sector: string;
  status: 'healthy' | 'degraded' | 'critical' | 'offline';
  uptime: number; // percentage
  errorRate: number;
  latencyP50Ms: number;
  latencyP99Ms: number;
  activeCapabilities: number;
  lastChecked: string;
  alerts: string[];
}

export interface SectorHealth {
  sectorId: string;
  nodes: NodeHealthReport[];
  overallStatus: 'healthy' | 'degraded' | 'critical';
  avgUptime: number;
  avgErrorRate: number;
}

export interface SystemHealthSnapshot {
  timestamp: string;
  sectors: SectorHealth[];
  overallScore: number; // 0-100
  criticalAlerts: string[];
  degradedNodes: string[];
  offlineNodes: string[];
}

export class HealthAggregationDashboard {
  private nodeReports: Map<string, NodeHealthReport> = new Map();
  private history: SystemHealthSnapshot[] = [];

  updateNodeHealth(report: NodeHealthReport): void {
    this.nodeReports.set(report.nodeId, report);
  }

  getSectorHealth(sectorId: string): SectorHealth {
    const nodes = [...this.nodeReports.values()].filter(n => n.sector === sectorId);
    const avgUptime = nodes.length > 0 ? nodes.reduce((s, n) => s + n.uptime, 0) / nodes.length : 0;
    const avgErrorRate = nodes.length > 0 ? nodes.reduce((s, n) => s + n.errorRate, 0) / nodes.length : 0;

    const overallStatus: SectorHealth['overallStatus'] =
      nodes.some(n => n.status === 'critical') ? 'critical' :
      nodes.some(n => n.status === 'degraded') ? 'degraded' : 'healthy';

    return { sectorId, nodes, overallStatus, avgUptime, avgErrorRate };
  }

  getSnapshot(): SystemHealthSnapshot {
    const sectorIds = new Set([...this.nodeReports.values()].map(n => n.sector));
    const sectors = [...sectorIds].map(s => this.getSectorHealth(s));

    const allNodes = [...this.nodeReports.values()];
    const criticalAlerts = allNodes.flatMap(n => n.alerts);
    const degradedNodes = allNodes.filter(n => n.status === 'degraded').map(n => n.nodeId);
    const offlineNodes = allNodes.filter(n => n.status === 'offline').map(n => n.nodeId);

    const healthyCount = allNodes.filter(n => n.status === 'healthy').length;
    const overallScore = allNodes.length > 0 ? Math.round((healthyCount / allNodes.length) * 100) : 0;

    const snapshot: SystemHealthSnapshot = {
      timestamp: new Date().toISOString(),
      sectors,
      overallScore,
      criticalAlerts,
      degradedNodes,
      offlineNodes,
    };

    this.history.push(snapshot);
    if (this.history.length > 100) this.history.shift();

    return snapshot;
  }

  getHistory(limit = 10): SystemHealthSnapshot[] {
    return this.history.slice(-limit);
  }

  drillDown(nodeId: string): NodeHealthReport | null {
    return this.nodeReports.get(nodeId) || null;
  }
}
