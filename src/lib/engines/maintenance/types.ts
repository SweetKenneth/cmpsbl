/**
 * Maintenance Engine Types
 * Shared contracts across HYGIENE, VALIDATOR, and REPORTER engines
 */

// ── Engine Identity ────────────────────────────────────────────────────────

export type MaintenanceEngineId = 'hygiene' | 'validator' | 'reporter' | 'orchestrator';
export type TriggerSource = 'manual' | 'clm' | 'cron' | 'engineer';
export type RunStatus = 'pending' | 'running' | 'passed' | 'failed' | 'partial';

// ── Findings ───────────────────────────────────────────────────────────────

export type FindingSeverity = 'info' | 'warn' | 'error' | 'critical';

export interface MaintenanceFinding {
  id: string;
  severity: FindingSeverity;
  category: string;
  title: string;
  detail: string;
  remediation?: string;
  auto_fixed?: boolean;
}

// ── Run Result ─────────────────────────────────────────────────────────────

export interface MaintenanceRunResult {
  engine: MaintenanceEngineId;
  status: RunStatus;
  triggerSource: TriggerSource;
  durationMs: number;
  findings: MaintenanceFinding[];
  summary: {
    total: number;
    critical: number;
    errors: number;
    warnings: number;
    info: number;
    autoFixed: number;
    passed: boolean;
  };
  passResults?: PassResult[];
  metadata?: Record<string, unknown>;
}

export interface PassResult {
  name: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  durationMs: number;
  notes: string[];
}

// ── Notification Config ────────────────────────────────────────────────────

export interface NotificationConfig {
  emailRecipients: string[];
  webhookUrl?: string;
  webhookSecret?: string;
  notifyOnFailure: boolean;
  notifyOnSuccess: boolean;
  notifyOnPartial: boolean;
  atlasNotifications: boolean;
  enabled: boolean;
}

// ── Orchestrator ───────────────────────────────────────────────────────────

export interface OrchestratorRunResult {
  id?: string;
  engines: MaintenanceRunResult[];
  overallStatus: RunStatus;
  totalDurationMs: number;
  triggeredBy: TriggerSource;
  completedAt: string;
  notificationsSent: {
    email: boolean;
    webhook: boolean;
    atlas: boolean;
    db: boolean;
  };
}
