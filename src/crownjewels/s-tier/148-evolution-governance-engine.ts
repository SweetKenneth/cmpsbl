/**
 * S-Tier 148 — Evolution Governance Engine
 * ID: S-CJ106 | CJPI: 86 | Module: GOVERNANCE
 * 
 * Governs evolution operations with safety constraints and approval workflows.
 */

export interface EvolutionRequest {
  id: string;
  type: 'mutation' | 'migration' | 'upgrade' | 'rollback';
  target: string;
  description: string;
  riskLevel: number; // 0-1
  requestedBy: string;
  requestedAt: string;
}

export interface ApprovalWorkflow {
  requestId: string;
  requiredApprovals: number;
  currentApprovals: string[];
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  deadline: string;
}

export interface EvolutionGuardrail {
  name: string;
  check: (request: EvolutionRequest) => boolean;
  failMessage: string;
}

export class EvolutionGovernanceEngine {
  private workflows: Map<string, ApprovalWorkflow> = new Map();
  private guardrails: EvolutionGuardrail[] = [];
  private history: { request: EvolutionRequest; outcome: string; timestamp: string }[] = [];

  addGuardrail(guardrail: EvolutionGuardrail): void {
    this.guardrails.push(guardrail);
  }

  submit(request: EvolutionRequest): { accepted: boolean; failedGuardrails: string[]; workflowId?: string } {
    const failures = this.guardrails
      .filter(g => !g.check(request))
      .map(g => g.failMessage);

    if (failures.length > 0) {
      this.history.push({ request, outcome: 'blocked', timestamp: new Date().toISOString() });
      return { accepted: false, failedGuardrails: failures };
    }

    const requiredApprovals = request.riskLevel > 0.7 ? 3 : request.riskLevel > 0.4 ? 2 : 1;
    const workflow: ApprovalWorkflow = {
      requestId: request.id,
      requiredApprovals,
      currentApprovals: [],
      status: 'pending',
      deadline: new Date(Date.now() + 86400000).toISOString(),
    };
    this.workflows.set(request.id, workflow);
    return { accepted: true, failedGuardrails: [], workflowId: request.id };
  }

  approve(requestId: string, approverId: string): ApprovalWorkflow | null {
    const workflow = this.workflows.get(requestId);
    if (!workflow || workflow.status !== 'pending') return null;
    if (workflow.currentApprovals.includes(approverId)) return workflow;

    workflow.currentApprovals.push(approverId);
    if (workflow.currentApprovals.length >= workflow.requiredApprovals) {
      workflow.status = 'approved';
    }
    return workflow;
  }

  reject(requestId: string): boolean {
    const workflow = this.workflows.get(requestId);
    if (!workflow) return false;
    workflow.status = 'rejected';
    return true;
  }

  getWorkflow(requestId: string): ApprovalWorkflow | null {
    return this.workflows.get(requestId) || null;
  }
}
