/**
 * S-Tier 040 — Semantic Encoding Pipeline
 * CJPI: 94 | Node: ENCODE | ID: S-ENC02
 *
 * Multi-stage encoding pipeline that transforms raw inputs through
 * normalization → tokenisation → semantic tagging → compression.
 */

export interface EncodingStage {
  name: string;
  transform: (input: string) => string;
}

export interface EncodedOutput {
  original: string;
  encoded: string;
  stages: string[];
  tokens: string[];
  compressionRatio: number;
  encodedAt: string;
}

// Built-in stages
const normalize: EncodingStage = {
  name: 'normalize',
  transform: (input: string) => input.trim().replace(/\s+/g, ' ').toLowerCase(),
};

const tokenize: EncodingStage = {
  name: 'tokenize',
  transform: (input: string) => input.split(/\s+/).join('|'),
};

const tagSemantics: EncodingStage = {
  name: 'semantic_tag',
  transform: (input: string) => {
    const tokens = input.split('|');
    return tokens.map(t => {
      if (/^\d+$/.test(t)) return `[NUM:${t}]`;
      if (t.includes('@')) return `[EMAIL:${t}]`;
      if (/^https?:/.test(t)) return `[URL:${t}]`;
      return t;
    }).join('|');
  },
};

const compress: EncodingStage = {
  name: 'compress',
  transform: (input: string) => {
    // Simple run-length for repeated tokens
    const tokens = input.split('|');
    const compressed: string[] = [];
    let i = 0;
    while (i < tokens.length) {
      let count = 1;
      while (i + count < tokens.length && tokens[i + count] === tokens[i]) count++;
      compressed.push(count > 1 ? `${tokens[i]}×${count}` : tokens[i]);
      i += count;
    }
    return compressed.join('|');
  },
};

const DEFAULT_PIPELINE: EncodingStage[] = [normalize, tokenize, tagSemantics, compress];

export function encode(input: string, pipeline: EncodingStage[] = DEFAULT_PIPELINE): EncodedOutput {
  let result = input;
  const stageNames: string[] = [];

  for (const stage of pipeline) {
    result = stage.transform(result);
    stageNames.push(stage.name);
  }

  const tokens = result.split('|');

  return {
    original: input,
    encoded: result,
    stages: stageNames,
    tokens,
    compressionRatio: input.length > 0 ? Math.round((result.length / input.length) * 100) / 100 : 1,
    encodedAt: new Date().toISOString(),
  };
}

export function createCustomStage(name: string, transform: (input: string) => string): EncodingStage {
  return { name, transform };
}

export { DEFAULT_PIPELINE, normalize, tokenize, tagSemantics, compress };
