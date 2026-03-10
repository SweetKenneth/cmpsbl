/**
 * S-Tier 206 — Universal Input Interpreter
 * ID: S-INC02 | CJPI: 91 | Module: INCLUSIVE
 */
export class UniversalInputInterpreter {
  private modalities: Map<string, { parser: (input: string) => { intent: string; confidence: number } }> = new Map();

  registerModality(name: string, parser: (input: string) => { intent: string; confidence: number }): void {
    this.modalities.set(name, { parser });
  }

  interpret(input: string, modality: string): { intent: string; confidence: number; modality: string } {
    const mod = this.modalities.get(modality);
    if (!mod) return { intent: 'unknown', confidence: 0, modality };
    const result = mod.parser(input);
    return { ...result, modality };
  }

  getSupportedModalities(): string[] { return [...this.modalities.keys()]; }
}
