/**
 * S-Tier 213 — Domain Terminology Forge
 * ID: S-LNG03 | CJPI: 91 | Module: LINGUA
 *
 * Domain-specific terminology management with multilingual translations,
 * fuzzy matching, synonym chains, and usage analytics.
 */

export interface TermEntry {
  term: string;
  domain: string;
  definition: string;
  translations: Record<string, string>;
  synonyms: string[];
  usageCount: number;
  createdAt: number;
  lastUsed: number;
}

export class DomainTerminologyForge {
  private terms: Map<string, TermEntry> = new Map();
  private domainIndex: Map<string, Set<string>> = new Map();

  register(term: string, domain: string, definition: string, translations: Record<string, string> = {}, synonyms: string[] = []): void {
    this.terms.set(term.toLowerCase(), {
      term, domain, definition, translations, synonyms,
      usageCount: 0, createdAt: Date.now(), lastUsed: 0,
    });

    // Index by domain
    if (!this.domainIndex.has(domain)) this.domainIndex.set(domain, new Set());
    this.domainIndex.get(domain)!.add(term.toLowerCase());

    // Register synonyms as cross-references
    for (const syn of synonyms) {
      const synKey = syn.toLowerCase();
      if (!this.terms.has(synKey)) {
        this.terms.set(synKey, {
          term: syn, domain, definition: `See: ${term}`, translations: {},
          synonyms: [term], usageCount: 0, createdAt: Date.now(), lastUsed: 0,
        });
        this.domainIndex.get(domain)!.add(synKey);
      }
    }
  }

  lookup(term: string, targetLang?: string): { definition: string; translation?: string; synonyms: string[] } | null {
    const key = term.toLowerCase();
    let t = this.terms.get(key);

    // Try fuzzy match if exact not found
    if (!t) {
      t = this.fuzzyMatch(key);
      if (!t) return null;
    }

    t.usageCount++;
    t.lastUsed = Date.now();

    return {
      definition: t.definition,
      translation: targetLang ? t.translations[targetLang] : undefined,
      synonyms: t.synonyms,
    };
  }

  private fuzzyMatch(query: string): TermEntry | null {
    let bestMatch: TermEntry | null = null;
    let bestScore = 0;
    const threshold = 0.7;

    for (const [key, entry] of this.terms) {
      const score = this.similarity(query, key);
      if (score > bestScore && score >= threshold) {
        bestScore = score;
        bestMatch = entry;
      }
    }

    return bestMatch;
  }

  private similarity(a: string, b: string): number {
    if (a === b) return 1;
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    if (longer.length === 0) return 1;

    // Levenshtein-based similarity
    const costs: number[] = [];
    for (let i = 0; i <= shorter.length; i++) {
      let lastValue = i;
      for (let j = 0; j <= longer.length; j++) {
        if (i === 0) { costs[j] = j; continue; }
        if (j > 0) {
          let newValue = costs[j - 1];
          if (shorter[i - 1] !== longer[j - 1]) newValue = Math.min(newValue, lastValue, costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
      if (i > 0) costs[longer.length] = lastValue;
    }

    return 1 - costs[longer.length] / longer.length;
  }

  addTranslation(term: string, lang: string, translation: string): boolean {
    const t = this.terms.get(term.toLowerCase());
    if (!t) return false;
    t.translations[lang] = translation;
    return true;
  }

  getTermsByDomain(domain: string): string[] {
    return [...(this.domainIndex.get(domain) ?? [])].map(key => this.terms.get(key)?.term ?? key);
  }

  getDomains(): string[] {
    return [...this.domainIndex.keys()];
  }

  getMostUsed(limit: number = 10): { term: string; usageCount: number; domain: string }[] {
    return [...this.terms.values()]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)
      .map(t => ({ term: t.term, usageCount: t.usageCount, domain: t.domain }));
  }

  getStats(): { totalTerms: number; domains: number; languages: number; totalUsage: number } {
    const allLangs = new Set<string>();
    let totalUsage = 0;
    for (const t of this.terms.values()) {
      for (const lang of Object.keys(t.translations)) allLangs.add(lang);
      totalUsage += t.usageCount;
    }
    return { totalTerms: this.terms.size, domains: this.domainIndex.size, languages: allLangs.size, totalUsage };
  }

  reset(): void {
    this.terms.clear();
    this.domainIndex.clear();
  }
}
