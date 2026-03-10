/**
 * S-Tier 166 — Graduated Autonomy
 * ID: S-CJ124 | CJPI: 85 | Module: ENCODE
 * Progressive autonomy granting based on demonstrated competence.
 */

export interface AutonomyLevel {
  level: number;
  name: string;
  permissions: string[];
  requiredScore: number;
  requiredHistory: number; // minimum decisions
}

export interface Agent {
  id: string;
  name: string;
  currentLevel: number;
  competenceScore: number;
  decisionHistory: { timestamp: number; outcome: 'success' | 'failure' }[];
}

export class GraduatedAutonomy {
  private levels: AutonomyLevel[] = [];
  private agents: Map<string, Agent> = new Map();

  defineLevels(levels: AutonomyLevel[]): void {
    this.levels = levels.sort((a, b) => a.level - b.level);
  }

  registerAgent(id: string, name: string): Agent {
    const agent: Agent = { id, name, currentLevel: 0, competenceScore: 0.5, decisionHistory: [] };
    this.agents.set(id, agent);
    return agent;
  }

  recordDecision(agentId: string, outcome: 'success' | 'failure'): void {
    const agent = this.agents.get(agentId);
    if (!agent) return;
    agent.decisionHistory.push({ timestamp: Date.now(), outcome });
    const recent = agent.decisionHistory.slice(-50);
    agent.competenceScore = recent.filter(d => d.outcome === 'success').length / recent.length;
    this.evaluatePromotion(agent);
  }

  private evaluatePromotion(agent: Agent): void {
    for (const level of this.levels) {
      if (level.level > agent.currentLevel &&
          agent.competenceScore >= level.requiredScore &&
          agent.decisionHistory.length >= level.requiredHistory) {
        agent.currentLevel = level.level;
      }
    }
  }

  getPermissions(agentId: string): string[] {
    const agent = this.agents.get(agentId);
    if (!agent) return [];
    return this.levels.filter(l => l.level <= agent.currentLevel).flatMap(l => l.permissions);
  }
}
