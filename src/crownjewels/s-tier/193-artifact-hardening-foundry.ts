/**
 * S-Tier 193 — Artifact Hardening Foundry
 * ID: S-FRG03 | CJPI: 92 | Module: FORGE
 *
 * Multi-stage artifact hardening pipeline: test → scan → profile → harden.
 * Enforces minimum scores per stage, tracks hardening velocity, and
 * generates production-readiness attestations.
 */

export type HardeningStage = 'raw' | 'tested' | 'scanned' | 'profiled' | 'hardened';

export interface Artifact {
  id: string;
  stage: HardeningStage;
  scores: Record<string, number>;
  submittedAt: number;
  hardenedAt: number | null;
  attempts: number;
  metadata: Record<string, unknown>;
}

export interface HardeningAttestation {
  artifactId: string;
  stage: HardeningStage;
  allScoresPass: boolean;
  minScore: number;
  avgScore: number;
  hardeningDurationMs: number | null;
  issuedAt: string;
}

const STAGE_ORDER: HardeningStage[] = ['raw', 'tested', 'scanned', 'profiled', 'hardened'];

export class ArtifactHardeningFoundry {
  private artifacts: Map<string, Artifact> = new Map();
  private minScoreThreshold: number;

  constructor(minScoreThreshold: number = 0.8) {
    this.minScoreThreshold = minScoreThreshold;
  }

  submit(artifactId: string, metadata: Record<string, unknown> = {}): void {
    this.artifacts.set(artifactId, {
      id: artifactId,
      stage: 'raw',
      scores: {},
      submittedAt: Date.now(),
      hardenedAt: null,
      attempts: 0,
      metadata,
    });
  }

  harden(artifactId: string, stage: 'tested' | 'scanned' | 'profiled' | 'hardened', score: number): boolean {
    const a = this.artifacts.get(artifactId);
    if (!a) return false;

    // Enforce stage ordering
    const currentIdx = STAGE_ORDER.indexOf(a.stage);
    const targetIdx = STAGE_ORDER.indexOf(stage);
    if (targetIdx <= currentIdx) return false; // Cannot regress or repeat
    if (targetIdx > currentIdx + 1) return false; // Cannot skip stages

    a.scores[stage] = Math.min(1, Math.max(0, score));
    a.stage = stage;
    a.attempts++;

    if (stage === 'hardened') {
      a.hardenedAt = Date.now();
    }

    return true;
  }

  rejectToStage(artifactId: string, stage: HardeningStage): boolean {
    const a = this.artifacts.get(artifactId);
    if (!a) return false;
    const targetIdx = STAGE_ORDER.indexOf(stage);
    const currentIdx = STAGE_ORDER.indexOf(a.stage);
    if (targetIdx >= currentIdx) return false; // Can only reject backward
    a.stage = stage;
    a.attempts++;
    return true;
  }

  isProductionReady(artifactId: string): boolean {
    const a = this.artifacts.get(artifactId);
    if (!a) return false;
    return a.stage === 'hardened' && Object.values(a.scores).every(s => s >= this.minScoreThreshold);
  }

  attest(artifactId: string): Attestation | null {
    const a = this.artifacts.get(artifactId);
    if (!a) return null;

    const scoreValues = Object.values(a.scores);
    const minScore = scoreValues.length > 0 ? Math.min(...scoreValues) : 0;
    const avgScore = scoreValues.length > 0 ? scoreValues.reduce((s, v) => s + v, 0) / scoreValues.length : 0;

    return {
      artifactId,
      stage: a.stage,
      allScoresPass: scoreValues.every(s => s >= this.minScoreThreshold),
      minScore,
      avgScore,
      hardeningDurationMs: a.hardenedAt ? a.hardenedAt - a.submittedAt : null,
      issuedAt: new Date().toISOString(),
    };
  }

  getArtifacts(): Artifact[] {
    return [...this.artifacts.values()];
  }

  getArtifactsByStage(stage: HardeningStage): Artifact[] {
    return [...this.artifacts.values()].filter(a => a.stage === stage);
  }

  getStats(): { total: number; productionReady: number; avgHardeningMs: number; stageDistribution: Record<string, number> } {
    const all = [...this.artifacts.values()];
    const ready = all.filter(a => this.isProductionReady(a.id));
    const hardened = all.filter(a => a.hardenedAt !== null);
    const avgMs = hardened.length > 0 ? hardened.reduce((s, a) => s + (a.hardenedAt! - a.submittedAt), 0) / hardened.length : 0;

    const dist: Record<string, number> = {};
    for (const stage of STAGE_ORDER) dist[stage] = 0;
    for (const a of all) dist[a.stage]++;

    return { total: all.length, productionReady: ready.length, avgHardeningMs: avgMs, stageDistribution: dist };
  }

  reset(): void {
    this.artifacts.clear();
  }
}
