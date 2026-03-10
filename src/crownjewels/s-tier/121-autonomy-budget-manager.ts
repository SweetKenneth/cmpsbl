/**
 * S-Tier 121 — Autonomy Budget Manager
 * ID: S-CJ79 | CJPI: 87 | Module: GOVERNANCE
 * 
 * Budget allocation for autonomous operations with spending limits.
 */

export interface AutonomyBudget {
  id: string;
  domain: string;
  totalBudget: number;
  spent: number;
  reserved: number;
  periodStart: string;
  periodEnd: string;
  alerts: BudgetAlert[];
}

export interface BudgetAlert {
  threshold: number; // percentage
  triggered: boolean;
  triggeredAt?: string;
}

export interface SpendRequest {
  domain: string;
  amount: number;
  reason: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface SpendResult {
  approved: boolean;
  amount: number;
  remaining: number;
  reason: string;
}

export class AutonomyBudgetManager {
  private budgets: Map<string, AutonomyBudget> = new Map();

  allocate(domain: string, total: number, periodDays: number): AutonomyBudget {
    const now = new Date();
    const end = new Date(now.getTime() + periodDays * 86400000);
    const budget: AutonomyBudget = {
      id: crypto.randomUUID(),
      domain,
      totalBudget: total,
      spent: 0,
      reserved: 0,
      periodStart: now.toISOString(),
      periodEnd: end.toISOString(),
      alerts: [
        { threshold: 50, triggered: false },
        { threshold: 80, triggered: false },
        { threshold: 95, triggered: false },
      ],
    };
    this.budgets.set(domain, budget);
    return budget;
  }

  spend(request: SpendRequest): SpendResult {
    const budget = this.budgets.get(request.domain);
    if (!budget) return { approved: false, amount: 0, remaining: 0, reason: 'No budget allocated' };

    const available = budget.totalBudget - budget.spent - budget.reserved;
    if (request.amount > available && request.priority !== 'critical') {
      return { approved: false, amount: 0, remaining: available, reason: 'Insufficient budget' };
    }

    const amount = Math.min(request.amount, request.priority === 'critical' ? budget.totalBudget - budget.spent : available);
    budget.spent += amount;

    // Check alerts
    const pct = (budget.spent / budget.totalBudget) * 100;
    for (const alert of budget.alerts) {
      if (!alert.triggered && pct >= alert.threshold) {
        alert.triggered = true;
        alert.triggeredAt = new Date().toISOString();
      }
    }

    return { approved: true, amount, remaining: budget.totalBudget - budget.spent - budget.reserved, reason: 'Approved' };
  }

  reserve(domain: string, amount: number): boolean {
    const budget = this.budgets.get(domain);
    if (!budget) return false;
    const available = budget.totalBudget - budget.spent - budget.reserved;
    if (amount > available) return false;
    budget.reserved += amount;
    return true;
  }

  getUtilization(domain: string): number {
    const budget = this.budgets.get(domain);
    if (!budget || budget.totalBudget === 0) return 0;
    return budget.spent / budget.totalBudget;
  }

  getBudgets(): AutonomyBudget[] { return [...this.budgets.values()]; }
}
