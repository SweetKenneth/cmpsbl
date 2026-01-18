/**
 * Example: Real-time Monitoring Dashboard
 * 
 * Monitor your substrate with health checks, metrics, and alerts.
 * 
 * BYOK ARCHITECTURE:
 * - You deploy and own your substrate infrastructure
 * - All metrics stay within your project
 * - Full control over monitoring and alerting
 * - No external telemetry or data collection
 */

import { SubstrateClient } from '../substrate-client';

const substrate = new SubstrateClient({
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!,
  developerId: process.env.DEVELOPER_ID!, // Required for BYOK
  appId: process.env.APP_ID! // Required for BYOK
});

interface HealthStatus {
  overall: 'healthy' | 'degraded' | 'down';
  score: number;
  modules: Record<string, {
    status: string;
    latency?: number;
    errors?: number;
  }>;
  lastUpdated: Date;
}

interface QuotaStatus {
  dailyCalls: number;
  dailyLimit: number;
  tokensUsed: number;
  estimatedCost: number;
  pressure: number; // 0-1, how close to limit
}

interface SecurityPosture {
  threats24h: number;
  blockedRequests: number;
  anomaliesDetected: number;
  rateLimitPressure: number;
}

class SubstrateMonitor {
  private pollInterval: number;
  private timer: NodeJS.Timer | null = null;
  private onUpdate: (data: DashboardData) => void;

  constructor(
    pollIntervalMs = 30000,
    onUpdate: (data: DashboardData) => void
  ) {
    this.pollInterval = pollIntervalMs;
    this.onUpdate = onUpdate;
  }

  async start(): Promise<void> {
    console.log('Starting substrate monitor...');
    await this.poll();
    this.timer = setInterval(() => this.poll(), this.pollInterval);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    console.log('Monitor stopped');
  }

  private async poll(): Promise<void> {
    const data = await this.collectMetrics();
    this.onUpdate(data);
  }

  private async collectMetrics(): Promise<DashboardData> {
    // Parallel fetch for efficiency
    const [health, quota, posture, routeStats, introspection] = await Promise.all([
      substrate.vision.healthSnapshot(),
      substrate.vision.quota(),
      substrate.defense.posture(),
      substrate.nexus.routeStats(),
      substrate.vision.introspection()
    ]);

    return {
      health: this.parseHealth(health.data),
      quota: this.parseQuota(quota.data),
      security: this.parseSecurity(posture.data),
      routing: routeStats.data,
      introspection: introspection.data,
      timestamp: new Date()
    };
  }

  private parseHealth(data: any): HealthStatus {
    return {
      overall: data?.status || 'unknown',
      score: data?.health_score || 0,
      modules: data?.modules || {},
      lastUpdated: new Date()
    };
  }

  private parseQuota(data: any): QuotaStatus {
    return {
      dailyCalls: data?.calls_today || 0,
      dailyLimit: data?.daily_limit || 1000,
      tokensUsed: data?.tokens_today || 0,
      estimatedCost: data?.cost_today || 0,
      pressure: data?.pressure || 0
    };
  }

  private parseSecurity(data: any): SecurityPosture {
    return {
      threats24h: data?.threats_24h || 0,
      blockedRequests: data?.blocked_count || 0,
      anomaliesDetected: data?.anomalies || 0,
      rateLimitPressure: data?.rate_limit_pressure || 0
    };
  }
}

interface DashboardData {
  health: HealthStatus;
  quota: QuotaStatus;
  security: SecurityPosture;
  routing: any;
  introspection: any;
  timestamp: Date;
}

// Alert thresholds
const THRESHOLDS = {
  healthScore: 0.8,
  quotaPressure: 0.8,
  securityThreats: 10,
  rateLimitPressure: 0.7
};

function checkAlerts(data: DashboardData): string[] {
  const alerts: string[] = [];

  if (data.health.score < THRESHOLDS.healthScore) {
    alerts.push(`⚠️ Health score below threshold: ${(data.health.score * 100).toFixed(0)}%`);
  }

  if (data.quota.pressure > THRESHOLDS.quotaPressure) {
    alerts.push(`⚠️ Quota pressure high: ${(data.quota.pressure * 100).toFixed(0)}%`);
  }

  if (data.security.threats24h > THRESHOLDS.securityThreats) {
    alerts.push(`🚨 High threat activity: ${data.security.threats24h} threats in 24h`);
  }

  if (data.security.rateLimitPressure > THRESHOLDS.rateLimitPressure) {
    alerts.push(`⚠️ Rate limit pressure: ${(data.security.rateLimitPressure * 100).toFixed(0)}%`);
  }

  return alerts;
}

// Console dashboard renderer
function renderDashboard(data: DashboardData): void {
  console.clear();
  console.log('═══════════════════════════════════════════════════════════');
  console.log('                  SUBSTRATE MONITOR v2026.01               ');
  console.log('═══════════════════════════════════════════════════════════');
  console.log();

  // Health
  const healthIcon = data.health.overall === 'healthy' ? '🟢' : 
                     data.health.overall === 'degraded' ? '🟡' : '🔴';
  console.log(`${healthIcon} Health: ${data.health.overall.toUpperCase()} (${(data.health.score * 100).toFixed(0)}%)`);
  
  // Quota
  const quotaBar = '█'.repeat(Math.floor(data.quota.pressure * 20)) + 
                   '░'.repeat(20 - Math.floor(data.quota.pressure * 20));
  console.log(`📊 Quota: [${quotaBar}] ${(data.quota.pressure * 100).toFixed(0)}%`);
  console.log(`   Calls: ${data.quota.dailyCalls}/${data.quota.dailyLimit}`);
  console.log(`   Cost: $${data.quota.estimatedCost.toFixed(4)}`);
  
  // Security
  console.log(`🛡️ Security: ${data.security.threats24h} threats | ${data.security.blockedRequests} blocked`);
  
  // Alerts
  const alerts = checkAlerts(data);
  if (alerts.length > 0) {
    console.log('\n⚠️ ALERTS:');
    alerts.forEach(a => console.log(`  ${a}`));
  }

  console.log('\n───────────────────────────────────────────────────────────');
  console.log(`Last updated: ${data.timestamp.toLocaleTimeString()}`);
}

// Usage
async function main() {
  const monitor = new SubstrateMonitor(10000, (data) => {
    renderDashboard(data);
  });

  await monitor.start();

  // Stop after 5 minutes
  setTimeout(() => {
    monitor.stop();
    console.log('\nMonitoring session complete.');
  }, 5 * 60 * 1000);
}

main().catch(console.error);

export { SubstrateMonitor, DashboardData, checkAlerts };
