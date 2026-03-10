/**
 * S-Tier 213 — Domain Terminology Forge
 * ID: S-LNG03 | CJPI: 91 | Module: LINGUA
 */
export class DomainTerminologyForge {
  private terms: Map<string, { domain: string; definition: string; translations: Record<string, string>; usageCount: number }> = new Map();

  register(term: string, domain: string, definition: string, translations: Record<string, string> = {}): void {
    this.terms.set(term, { domain, definition, translations, usageCount: 0 });
  }

  lookup(term: string, targetLang?: string): { definition: string; translation?: string } | null {
    const t = this.terms.get(term);
    if (!t) return null;
    t.usageCount++;
    return { definition: t.definition, translation: targetLang ? t.translations[targetLang] : undefined };
  }

  getTermsByDomain(domain: string): string[] {
    return [...this.terms.entries()].filter(([, t]) => t.domain === domain).map(([k]) => k);
  }
}
