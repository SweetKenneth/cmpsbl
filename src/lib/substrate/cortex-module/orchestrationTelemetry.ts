/**
 * CORTEX — Orchestration Telemetry Emitter
 * Real-time mesh communication of state transitions.
 */

export type OrchestrationEventType =
  | 'pipeline_created'
  | 'pipeline_started'
  | 'pipeline_completed'
  | 'pipeline_failed'
  | 'stage_started'
  | 'stage_completed'
  | 'stage_failed'
  | 'cascade_risk_detected'
  | 'load_shed_triggered'
  | 'backpressure_applied'
  | 'bottleneck_identified'
  | 'critical_path_shift'
  | 'reroute_executed';

export interface OrchestrationTelemetryEvent {
  id: string;
  type: OrchestrationEventType;
  pipelineId: string;
  stageId?: string;
  timestamp: string;
  durationMs?: number;
  metadata: Record<string, unknown>;
  severity: 'info' | 'warning' | 'critical';
}

type TelemetryListener = (event: OrchestrationTelemetryEvent) => void;

const listeners: TelemetryListener[] = [];
const eventBuffer: OrchestrationTelemetryEvent[] = [];
const MAX_BUFFER = 500;
let eventCounter = 0;

function generateEventId(): string {
  return `cortex-evt-${Date.now()}-${++eventCounter}`;
}

export function emitOrchestrationEvent(
  type: OrchestrationEventType,
  pipelineId: string,
  metadata: Record<string, unknown> = {},
  options?: { stageId?: string; durationMs?: number; severity?: 'info' | 'warning' | 'critical' }
): void {
  const event: OrchestrationTelemetryEvent = {
    id: generateEventId(),
    type,
    pipelineId,
    stageId: options?.stageId,
    timestamp: new Date().toISOString(),
    durationMs: options?.durationMs,
    metadata,
    severity: options?.severity ?? inferSeverity(type),
  };

  // Buffer
  eventBuffer.push(event);
  if (eventBuffer.length > MAX_BUFFER) {
    eventBuffer.splice(0, eventBuffer.length - MAX_BUFFER);
  }

  // Notify listeners (non-blocking)
  for (const listener of listeners) {
    try {
      listener(event);
    } catch {
      // Never let listener errors propagate
    }
  }
}

function inferSeverity(type: OrchestrationEventType): 'info' | 'warning' | 'critical' {
  switch (type) {
    case 'pipeline_failed':
    case 'cascade_risk_detected':
      return 'critical';
    case 'load_shed_triggered':
    case 'backpressure_applied':
    case 'bottleneck_identified':
    case 'stage_failed':
      return 'warning';
    default:
      return 'info';
  }
}

export function onOrchestrationEvent(listener: TelemetryListener): () => void {
  listeners.push(listener);
  return () => {
    const idx = listeners.indexOf(listener);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function getRecentEvents(count = 50): OrchestrationTelemetryEvent[] {
  return eventBuffer.slice(-count);
}

export function getEventsByPipeline(pipelineId: string, count = 20): OrchestrationTelemetryEvent[] {
  return eventBuffer
    .filter(e => e.pipelineId === pipelineId)
    .slice(-count);
}

export function getEventsBySeverity(severity: 'info' | 'warning' | 'critical'): OrchestrationTelemetryEvent[] {
  return eventBuffer.filter(e => e.severity === severity);
}

export function clearTelemetryBuffer(): void {
  eventBuffer.length = 0;
}
