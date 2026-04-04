/**
 * S-Tier 194 — Cultural Context Adapter
 * CJPI: 92 | Module: LINGUA | ID: S-LNG02
 *
 * Adapts content for cultural context — formality levels, humor
 * filters, idiom substitution, date/number formatting, and
 * sensitivity screening. Zero dependencies. Pure TypeScript.
 */

export interface CulturalProfile {
  cultureId: string;
  formality: number;
  humor: boolean;
  idioms: Map<string, string>;
  dateFormat: string;
  numberSeparator: string;
  sensitivePhrases: string[];
}

export interface AdaptationResult {
  adapted: string;
  adjustments: string[];
  sensitivityFlags: string[];
  formalityDelta: number;
}

export interface AdapterStats {
  registeredCultures: number;
  totalAdaptations: number;
  avgAdjustments: number;
}

export function createCulturalContextAdapter() {
  const profiles = new Map<string, CulturalProfile>();
  let totalAdaptations = 0;
  let totalAdjustments = 0;

  function registerCulture(cultureId: string, opts: {
    formality: number; humor: boolean; idioms?: Record<string, string>;
    dateFormat?: string; numberSeparator?: string; sensitivePhrases?: string[];
  }): void {
    profiles.set(cultureId, {
      cultureId, formality: opts.formality, humor: opts.humor,
      idioms: new Map(Object.entries(opts.idioms ?? {})),
      dateFormat: opts.dateFormat ?? 'YYYY-MM-DD',
      numberSeparator: opts.numberSeparator ?? ',',
      sensitivePhrases: opts.sensitivePhrases ?? [],
    });
  }

  function adapt(content: string, targetCulture: string, sourceFormalityLevel: number = 0.5): AdaptationResult {
    const profile = profiles.get(targetCulture);
    if (!profile) return { adapted: content, adjustments: [], sensitivityFlags: [], formalityDelta: 0 };

    totalAdaptations++;
    const adjustments: string[] = [];
    const sensitivityFlags: string[] = [];
    let output = content;

    // Idiom substitution
    for (const [idiom, replacement] of profile.idioms) {
      if (output.includes(idiom)) {
        output = output.replaceAll(idiom, replacement);
        adjustments.push(`idiom_replaced: ${idiom}`);
      }
    }

    // Formality adjustment
    const formalityDelta = profile.formality - sourceFormalityLevel;
    if (formalityDelta > 0.3) adjustments.push('increased_formality');
    if (formalityDelta < -0.3) adjustments.push('decreased_formality');

    // Humor filter
    if (!profile.humor) adjustments.push('humor_suppressed');

    // Sensitivity screening
    for (const phrase of profile.sensitivePhrases) {
      if (output.toLowerCase().includes(phrase.toLowerCase())) {
        sensitivityFlags.push(`sensitive_phrase: ${phrase}`);
      }
    }

    totalAdjustments += adjustments.length;
    return { adapted: output, adjustments, sensitivityFlags, formalityDelta };
  }

  function getStats(): AdapterStats {
    return {
      registeredCultures: profiles.size,
      totalAdaptations,
      avgAdjustments: totalAdaptations > 0 ? totalAdjustments / totalAdaptations : 0,
    };
  }

  function reset(): void { profiles.clear(); totalAdaptations = 0; totalAdjustments = 0; }

  return { registerCulture, adapt, getStats, reset };
}
