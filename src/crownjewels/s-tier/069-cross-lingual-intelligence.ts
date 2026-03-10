/**
 * S-Tier 069 — Cross-Lingual Intelligence
 * CJPI: 93 | Node: HARVEST | ID: S-SYN04
 *
 * Language detection and normalization for multi-lingual data ingestion.
 * Ensures HARVEST can process sources in any language.
 */

export interface LanguageDetection {
  input: string;
  detectedLanguage: string;
  confidence: number;
  script: string;
}

const LANGUAGE_PATTERNS: Array<{ lang: string; pattern: RegExp; script: string }> = [
  { lang: 'en', pattern: /\b(the|and|is|in|to|of|for|with)\b/gi, script: 'Latin' },
  { lang: 'es', pattern: /\b(el|la|de|en|los|las|del|que)\b/gi, script: 'Latin' },
  { lang: 'fr', pattern: /\b(le|la|les|de|des|du|un|une)\b/gi, script: 'Latin' },
  { lang: 'de', pattern: /\b(der|die|das|und|ist|ein|eine|den)\b/gi, script: 'Latin' },
  { lang: 'ja', pattern: /[\u3040-\u309F\u30A0-\u30FF]/g, script: 'Japanese' },
  { lang: 'zh', pattern: /[\u4E00-\u9FFF]/g, script: 'CJK' },
  { lang: 'ko', pattern: /[\uAC00-\uD7AF]/g, script: 'Hangul' },
  { lang: 'ar', pattern: /[\u0600-\u06FF]/g, script: 'Arabic' },
  { lang: 'ru', pattern: /[\u0400-\u04FF]/g, script: 'Cyrillic' },
];

export function detectLanguage(input: string): LanguageDetection {
  let bestLang = 'unknown';
  let bestScore = 0;
  let bestScript = 'Unknown';

  for (const { lang, pattern, script } of LANGUAGE_PATTERNS) {
    const matches = input.match(pattern);
    const score = matches ? matches.length / input.split(/\s+/).length : 0;
    if (score > bestScore) {
      bestLang = lang;
      bestScore = score;
      bestScript = script;
    }
  }

  return {
    input: input.slice(0, 100),
    detectedLanguage: bestLang,
    confidence: Math.min(1, Math.round(bestScore * 100) / 100),
    script: bestScript,
  };
}
