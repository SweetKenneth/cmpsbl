/**
 * PatchPlan Schema — Shared structure for DECODE → ENCODE orchestration
 * Ensures execution never occurs without an approved plan.
 */

export type PlanStatus = 'draft' | 'review' | 'approved' | 'rejected' | 'executed';

export interface PatchChange {
  type: 'create' | 'update' | 'delete' | 'move';
  path: string;
  description: string;
}

export interface PatchPlan {
  plan_id: string;
  created_at: string;
  title: string;
  intent: string;
  modules: string[];
  changes: PatchChange[];
  risks: string[];
  questions: string[];
  status: PlanStatus;
  approved_at?: string;
  approved_by?: string;
  rejected_reason?: string;
  executed_at?: string;
}
