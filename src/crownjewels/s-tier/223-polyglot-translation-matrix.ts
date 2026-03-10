/**
 * S-Tier 223 — Polyglot Translation Matrix | S-LNG01 | CJPI: 90 | LINGUA
 */
export class PolyglotTranslationMatrix {
  private translations: Map<string, Map<string, string>> = new Map();
  register(fromLang: string, toLang: string, term: string, translation: string): void {
    const key = `${fromLang}:${term}`;
    if (!this.translations.has(key)) this.translations.set(key, new Map());
    this.translations.get(key)!.set(toLang, translation);
  }
  translate(term: string, fromLang: string, toLang: string): string {
    return this.translations.get(`${fromLang}:${term}`)?.get(toLang) ?? term;
  }
}
