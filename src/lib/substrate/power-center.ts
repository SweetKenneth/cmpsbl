/**
 * CMPSBL® Master Power Center
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Single unified control surface that activates all autonomous
 * substrate cycles: Discovery, CLM, Memory Stream, Intent Mesh,
 * Auto-Activation, and all Engines/Agents.
 *
 * Meta Circuit Breaker: one flip activates every subsystem.
 * Designed to be duplicated across vertical substrates.
 *
 * © CMPSBL® — All rights reserved.
 */

import { supabase } from '@/integrations/supabase/client';
import { meshScheduler } from './intent-mesh/auto-scheduler';
import { enableMesh } from './intent-mesh/toggle';
import { setEnabled as setAutoActivationEnabled } from '@/lib/nerve/auto-activation/activationEngine';
import { enableControlPlane } from '@/lib/control-plane/config';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface PowerCenterConfig {
  /** Discovery reactor interval in ms (default: 2 hours) */
  discoveryIntervalMs: number;
  /** Max discovery runs per activation (default: 3) */
  discoveryRunsPerCycle: number;
  /** CLM cycle interval in ms (default: 30 min) */
  clmIntervalMs: number;
  /** Memory Stream pulls from S-Tier vault */
  memoryStreamSTierPull: boolean;
  /** Intent Mesh active */
  intentMeshEnabled: boolean;
  /** Auto-Activation engine active */
  autoActivationEnabled: boolean;
  /** All engines active */
  enginesActive: boolean;
  /** All agents active */
  agentsActive: boolean;
  /** Control Plane active */
  controlPlaneActive: boolean;
}

export interface SubsystemStatus {
  name: string;
  active: boolean;
  lastCycleAt: string | null;
  cyclesCompleted: number;
  health: number; // 0-100
  error: string | null;
}

export interface PowerCenterState {
  metaBreakerActive: boolean;
  activatedAt: string | null;
  config: PowerCenterConfig;
  subsystems: SubsystemStatus[];
  totalCyclesRun: number;
  lastFullAuditAt: string | null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEFAULTS
// ═══════════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: PowerCenterConfig = {
  discoveryIntervalMs: 2 * 60 * 60 * 1000, // 2 hours
  discoveryRunsPerCycle: 3,
  clmIntervalMs: 30 * 60 * 1000, // 30 min
  memoryStreamSTierPull: true,
  intentMeshEnabled: true,
  autoActivationEnabled: true,
  enginesActive: true,
  agentsActive: true,
  controlPlaneActive: true,
};

const SUBSYSTEM_NAMES = [
  'Discovery Reactor (CDM)',
  'Memory Stream (S-Tier Pull)',
  'CLM Orchestrator',
  'Intent Mesh + Resolver',
  'Auto-Activation Engine (NERVE)',
  'Control Plane (INTEL/ENGINEER)',
  'SENTINEL Engine',
  'CORTEX Engine',
  'NEXUS Router',
  'BEACON Health',
  'FAILSAFE Recovery',
  'AUTOMATON Engine',
  'ARCHITECT Engine',
  'DREAM Engine',
  'PRIMITIVE Agent',
  'WRAITH Agent',
  'OBSIDIAN Agent',
  'MONOLITH Agent',
  'RAPTOR Agent',
  'DECODE Agent',
  'ENCODE Agent',
  'GOVERNANCE Guard',
] as const;

// ═══════════════════════════════════════════════════════════════════════════════
// POWER CENTER SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

class MasterPowerCenter {
  private static instance: MasterPowerCenter;
  private config: PowerCenterConfig;
  private state: PowerCenterState;
  private discoveryTimer: ReturnType<typeof setInterval> | null = null;
  private clmTimer: ReturnType<typeof setInterval> | null = null;
  private sTierPullTimer: ReturnType<typeof setInterval> | null = null;

  private constructor() {
    this.config = { ...DEFAULT_CONFIG };
    this.state = {
      metaBreakerActive: false,
      activatedAt: null,
      config: this.config,
      subsystems: SUBSYSTEM_NAMES.map(name => ({
        name,
        active: false,
        lastCycleAt: null,
        cyclesCompleted: 0,
        health: 0,
        error: null,
      })),
      totalCyclesRun: 0,
      lastFullAuditAt: null,
    };
  }

  static getInstance(): MasterPowerCenter {
    if (!MasterPowerCenter.instance) {
      MasterPowerCenter.instance = new MasterPowerCenter();
    }
    return MasterPowerCenter.instance;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // META CIRCUIT BREAKER — ONE FLIP ACTIVATES ALL
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Flip the meta breaker ON — activates every subsystem.
   */
  async activateAll(overrides?: Partial<PowerCenterConfig>): Promise<PowerCenterState> {
    if (overrides) {
      this.config = { ...this.config, ...overrides };
    }

    this.state.metaBreakerActive = true;
    this.state.activatedAt = new Date().toISOString();

    // 1. Intent Mesh — enable and start scheduler
    if (this.config.intentMeshEnabled) {
      enableMesh();
      meshScheduler.updateConfig({
        cdmReactorIntervalMs: this.config.discoveryIntervalMs,
        enabled: true,
      });
      meshScheduler.start();
      this.markSubsystemActive('Intent Mesh + Resolver');
    }

    // 2. Auto-Activation Engine (NERVE)
    if (this.config.autoActivationEnabled) {
      setAutoActivationEnabled(true);
      this.markSubsystemActive('Auto-Activation Engine (NERVE)');
    }

    // 3. Control Plane
    if (this.config.controlPlaneActive) {
      enableControlPlane();
      this.markSubsystemActive('Control Plane (INTEL/ENGINEER)');
    }

    // 4. Discovery Reactor — 2hr interval, 3 runs per cycle
    this.startDiscoveryReactor();
    this.markSubsystemActive('Discovery Reactor (CDM)');

    // 5. CLM — continuous learning for all primitives
    this.startCLMOrchestrator();
    this.markSubsystemActive('CLM Orchestrator');

    // 6. Memory Stream S-Tier pull
    if (this.config.memoryStreamSTierPull) {
      this.startSTierPull();
      this.markSubsystemActive('Memory Stream (S-Tier Pull)');
    }

    // 7. Mark all engines active
    if (this.config.enginesActive) {
      for (const name of SUBSYSTEM_NAMES) {
        if (name.includes('Engine') || name === 'NEXUS Router' || name === 'BEACON Health' || name === 'FAILSAFE Recovery') {
          this.markSubsystemActive(name);
        }
      }
    }

    // 8. Mark all agents active
    if (this.config.agentsActive) {
      for (const name of SUBSYSTEM_NAMES) {
        if (name.includes('Agent') || name === 'GOVERNANCE Guard') {
          this.markSubsystemActive(name);
        }
      }
    }

    this.state.config = { ...this.config };
    return this.getState();
  }

  /**
   * Flip the meta breaker OFF — deactivates everything.
   */
  deactivateAll(): PowerCenterState {
    this.state.metaBreakerActive = false;

    // Stop all timers
    if (this.discoveryTimer) { clearInterval(this.discoveryTimer); this.discoveryTimer = null; }
    if (this.clmTimer) { clearInterval(this.clmTimer); this.clmTimer = null; }
    if (this.sTierPullTimer) { clearInterval(this.sTierPullTimer); this.sTierPullTimer = null; }

    // Stop mesh scheduler
    meshScheduler.stop();

    // Mark all subsystems inactive
    for (const sub of this.state.subsystems) {
      sub.active = false;
    }

    return this.getState();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DISCOVERY REACTOR — 2hr, 3 runs per cycle
  // ═══════════════════════════════════════════════════════════════════════════

  private startDiscoveryReactor(): void {
    if (this.discoveryTimer) clearInterval(this.discoveryTimer);

    const runDiscoveryCycles = async () => {
      const sub = this.getSubsystem('Discovery Reactor (CDM)');
      try {
        for (let i = 0; i < this.config.discoveryRunsPerCycle; i++) {
          await meshScheduler.runCdmReactorCycle();
          if (sub) sub.cyclesCompleted++;
          this.state.totalCyclesRun++;
        }
        if (sub) {
          sub.lastCycleAt = new Date().toISOString();
          sub.health = 100;
          sub.error = null;
        }
      } catch (err) {
        if (sub) {
          sub.health = 30;
          sub.error = err instanceof Error ? err.message : 'Unknown';
        }
      }
    };

    // Run immediately, then on interval
    runDiscoveryCycles();
    this.discoveryTimer = setInterval(runDiscoveryCycles, this.config.discoveryIntervalMs);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // CLM ORCHESTRATOR — All primitives learning
  // ═══════════════════════════════════════════════════════════════════════════

  private startCLMOrchestrator(): void {
    if (this.clmTimer) clearInterval(this.clmTimer);

    const runCLM = async () => {
      const sub = this.getSubsystem('CLM Orchestrator');
      try {
        // Import dynamically to avoid circular deps
        const { LearningOrchestratorClient } = await import('./clm/orchestrator');
        const orchestrator = LearningOrchestratorClient?.getInstance?.();
        if (orchestrator) {
          await orchestrator.runCycle();
        } else {
          // Fallback: invoke the server-side CLM engine
          await supabase.functions.invoke('pf-clm-engine', {
            body: { source: 'power-center', allPrimitives: true },
          });
        }
        if (sub) {
          sub.cyclesCompleted++;
          sub.lastCycleAt = new Date().toISOString();
          sub.health = 100;
          sub.error = null;
        }
        this.state.totalCyclesRun++;
      } catch (err) {
        if (sub) {
          sub.health = 30;
          sub.error = err instanceof Error ? err.message : 'Unknown';
        }
      }
    };

    runCLM();
    this.clmTimer = setInterval(runCLM, this.config.clmIntervalMs);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // MEMORY STREAM — S-Tier Vault Pull
  // ═══════════════════════════════════════════════════════════════════════════

  private startSTierPull(): void {
    if (this.sTierPullTimer) clearInterval(this.sTierPullTimer);

    const pullSTier = async () => {
      const sub = this.getSubsystem('Memory Stream (S-Tier Pull)');
      try {
        // Query S-Tier discoveries (CJPI >= 95)
        const { data: sTierDiscoveries, error } = await supabase
          .from('discoveries')
          .select('id, name, cjpi, module_chain, category')
          .gte('cjpi', 95)
          .order('cjpi', { ascending: false })
          .limit(50);

        if (error) throw error;

        if (sTierDiscoveries && sTierDiscoveries.length > 0) {
          // Feed into memory stream via brain_memories for persistent recall
          const inserts = sTierDiscoveries.slice(0, 10).map(discovery => ({
            content: `[S-Tier Discovery] ${discovery.name}: CJPI ${discovery.cjpi} — ${JSON.stringify(discovery.module_chain)}`,
            memory_type: 'discovery_stier',
            source: 'memory_stream_stier_pull',
            confidence: Math.min(discovery.cjpi / 100, 0.99),
            metadata: {
              discovery_id: discovery.id,
              cjpi: discovery.cjpi,
              category: discovery.category,
            } as Record<string, unknown>,
          }));

          if (inserts.length > 0) {
            await supabase.from('brain_memories').insert(inserts);
          }
        }

        if (sub) {
          sub.cyclesCompleted++;
          sub.lastCycleAt = new Date().toISOString();
          sub.health = 100;
          sub.error = null;
        }
      } catch (err) {
        if (sub) {
          sub.health = 50;
          sub.error = err instanceof Error ? err.message : 'Unknown';
        }
      }
    };

    pullSTier();
    // Pull S-Tier every 4 hours (aligns with discovery cadence)
    this.sTierPullTimer = setInterval(pullSTier, 4 * 60 * 60 * 1000);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FULL AUDIT
  // ═══════════════════════════════════════════════════════════════════════════

  async runFullAudit(): Promise<{
    subsystems: SubsystemStatus[];
    overallHealth: number;
    issues: string[];
  }> {
    const issues: string[] = [];

    // Check each subsystem
    for (const sub of this.state.subsystems) {
      if (!sub.active) {
        issues.push(`${sub.name}: INACTIVE`);
        sub.health = 0;
      } else if (sub.error) {
        issues.push(`${sub.name}: ERROR — ${sub.error}`);
      } else {
        sub.health = 100;
      }
    }

    // Check mesh status
    const meshState = meshScheduler.getState();
    if (!meshState.isRunning) {
      issues.push('Mesh scheduler not running');
    }

    // Calculate overall health
    const activeSubsystems = this.state.subsystems.filter(s => s.active);
    const overallHealth = activeSubsystems.length > 0
      ? Math.round(activeSubsystems.reduce((sum, s) => sum + s.health, 0) / activeSubsystems.length)
      : 0;

    this.state.lastFullAuditAt = new Date().toISOString();

    return {
      subsystems: [...this.state.subsystems],
      overallHealth,
      issues,
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HELPERS
  // ═══════════════════════════════════════════════════════════════════════════

  private markSubsystemActive(name: string): void {
    const sub = this.state.subsystems.find(s => s.name === name);
    if (sub) {
      sub.active = true;
      sub.health = 100;
      sub.error = null;
    }
  }

  private getSubsystem(name: string): SubsystemStatus | undefined {
    return this.state.subsystems.find(s => s.name === name);
  }

  getState(): PowerCenterState {
    return {
      ...this.state,
      config: { ...this.config },
      subsystems: this.state.subsystems.map(s => ({ ...s })),
    };
  }

  isActive(): boolean {
    return this.state.metaBreakerActive;
  }
}

export const powerCenter = MasterPowerCenter.getInstance();
