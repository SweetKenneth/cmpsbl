/**
 * S-Tier 146 — Self-Documentation Engine
 * ID: S-CJ104 | CJPI: 86 | Module: SYSTEM
 * 
 * Automated system documentation generation from runtime behavior.
 */

export interface DocumentedComponent {
  id: string;
  name: string;
  type: string;
  description: string;
  inputs: { name: string; type: string }[];
  outputs: { name: string; type: string }[];
  dependencies: string[];
  lastObserved: string;
}

export interface DocumentationSnapshot {
  id: string;
  components: DocumentedComponent[];
  topology: { from: string; to: string; via: string }[];
  generatedAt: string;
  version: number;
}

export class SelfDocumentationEngine {
  private components: Map<string, DocumentedComponent> = new Map();
  private edges: { from: string; to: string; via: string }[] = [];
  private version = 0;

  observe(component: DocumentedComponent): void {
    this.components.set(component.id, component);
  }

  recordInteraction(fromId: string, toId: string, via: string): void {
    const exists = this.edges.some(e => e.from === fromId && e.to === toId && e.via === via);
    if (!exists) this.edges.push({ from: fromId, to: toId, via });
  }

  generate(): DocumentationSnapshot {
    this.version++;
    return {
      id: crypto.randomUUID(),
      components: [...this.components.values()],
      topology: [...this.edges],
      generatedAt: new Date().toISOString(),
      version: this.version,
    };
  }

  toMarkdown(): string {
    const lines: string[] = ['# System Documentation', '', `Generated: ${new Date().toISOString()}`, ''];
    
    lines.push('## Components', '');
    for (const c of this.components.values()) {
      lines.push(`### ${c.name}`, `- Type: ${c.type}`, `- ${c.description}`);
      if (c.inputs.length) lines.push(`- Inputs: ${c.inputs.map(i => `${i.name}:${i.type}`).join(', ')}`);
      if (c.outputs.length) lines.push(`- Outputs: ${c.outputs.map(o => `${o.name}:${o.type}`).join(', ')}`);
      lines.push('');
    }

    lines.push('## Topology', '');
    for (const e of this.edges) lines.push(`- ${e.from} → ${e.to} (via ${e.via})`);

    return lines.join('\n');
  }
}
