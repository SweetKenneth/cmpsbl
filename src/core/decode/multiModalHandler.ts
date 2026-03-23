/**
 * DECODE Multi-Modal Input Handler — v1.0.0
 * Accepts and interprets images, code blocks, structured data,
 * and file uploads — routing each to appropriate substrate nodes.
 * 
 * DECODE itself doesn't process these — it classifies the modality,
 * extracts metadata, and routes to the correct node for processing.
 */

import { resolveRoute, type SubstrateTarget } from './substrateRouter';

// ═══ Types ════════════════════════════════════════════════════════

export type InputModality = 'text' | 'code' | 'image' | 'json' | 'csv' | 'file' | 'url' | 'mixed';

export interface ModalityDetection {
  primary: InputModality;
  secondary?: InputModality;
  confidence: number;
  signals: string[];
}

export interface MultiModalInput {
  raw: string;
  modality: ModalityDetection;
  extracted: ExtractedContent;
  suggestedTargets: SubstrateTarget[];
}

export interface ExtractedContent {
  text: string;
  codeBlocks: CodeBlock[];
  urls: string[];
  jsonFragments: string[];
  fileReferences: string[];
  imageReferences: string[];
}

export interface CodeBlock {
  language: string;
  content: string;
  startLine: number;
  endLine: number;
}

// ═══ Detection Patterns ═══════════════════════════════════════════

const CODE_FENCE_PATTERN = /```(\w*)\n([\s\S]*?)```/g;
const INLINE_CODE_PATTERN = /`([^`]+)`/g;
const URL_PATTERN = /https?:\/\/[^\s<>]+/gi;
const JSON_PATTERN = /^\s*[\[{]/;
const CSV_PATTERN = /^[^,\n]+(?:,[^,\n]+){2,}$/m;
const IMAGE_EXTENSIONS = /\.(png|jpg|jpeg|gif|webp|svg|bmp|ico)(?:\?|$)/i;
const FILE_PATH_PATTERN = /(?:^|[\s(])([./\w-]+\.\w{2,6})(?:[\s)]|$)/g;

// ═══ Modality Detection ═══════════════════════════════════════════

/**
 * Detect the primary input modality
 */
export function detectModality(input: string): ModalityDetection {
  const signals: string[] = [];
  const scores: Record<InputModality, number> = {
    text: 0.3, // baseline
    code: 0,
    image: 0,
    json: 0,
    csv: 0,
    file: 0,
    url: 0,
    mixed: 0,
  };

  // Code detection
  if (CODE_FENCE_PATTERN.test(input)) {
    scores.code += 0.7;
    signals.push('code fence detected');
    CODE_FENCE_PATTERN.lastIndex = 0;
  }
  if ((input.match(INLINE_CODE_PATTERN) || []).length > 2) {
    scores.code += 0.3;
    signals.push('multiple inline code spans');
  }

  // URL detection
  const urls = input.match(URL_PATTERN) || [];
  if (urls.length > 0) {
    scores.url += 0.4;
    signals.push(`${urls.length} URL(s) found`);

    // Image URL check
    if (urls.some(u => IMAGE_EXTENSIONS.test(u))) {
      scores.image += 0.6;
      signals.push('image URL detected');
    }
  }

  // JSON detection
  const trimmed = input.trim();
  if (JSON_PATTERN.test(trimmed)) {
    try {
      JSON.parse(trimmed);
      scores.json += 0.8;
      signals.push('valid JSON detected');
    } catch {
      if (trimmed.includes('"') && (trimmed.includes('{') || trimmed.includes('['))) {
        scores.json += 0.3;
        signals.push('JSON-like structure');
      }
    }
  }

  // CSV detection
  if (CSV_PATTERN.test(input)) {
    scores.csv += 0.5;
    signals.push('CSV-like rows detected');
  }

  // File reference detection
  FILE_PATH_PATTERN.lastIndex = 0;
  const filePaths = input.match(FILE_PATH_PATTERN) || [];
  if (filePaths.length > 0) {
    scores.file += 0.3;
    signals.push(`${filePaths.length} file path(s)`);
  }

  // Mixed detection
  const activeModalities = Object.entries(scores).filter(([k, v]) => v > 0.3 && k !== 'text');
  if (activeModalities.length > 1) {
    scores.mixed += 0.5;
    signals.push('multiple modalities detected');
  }

  // Select primary
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]) as [InputModality, number][];
  const primary = sorted[0];
  const secondary = sorted[1]?.[1] > 0.3 ? sorted[1] : undefined;

  return {
    primary: primary[0],
    secondary: secondary ? secondary[0] : undefined,
    confidence: Math.min(1, primary[1]),
    signals,
  };
}

// ═══ Content Extraction ═══════════════════════════════════════════

/**
 * Extract structured content from multi-modal input
 */
export function extractContent(input: string): ExtractedContent {
  const codeBlocks: CodeBlock[] = [];
  let lineOffset = 0;

  // Extract code blocks
  CODE_FENCE_PATTERN.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = CODE_FENCE_PATTERN.exec(input)) !== null) {
    const startLine = input.slice(0, match.index).split('\n').length;
    const content = match[2];
    codeBlocks.push({
      language: match[1] || 'unknown',
      content,
      startLine: startLine + lineOffset,
      endLine: startLine + content.split('\n').length + lineOffset,
    });
  }

  // Extract URLs
  const urls = (input.match(URL_PATTERN) || []).map(u => u.replace(/[).,;:!?]+$/, ''));

  // Extract JSON fragments
  const jsonFragments: string[] = [];
  try {
    const trimmed = input.trim();
    if (JSON_PATTERN.test(trimmed)) {
      JSON.parse(trimmed);
      jsonFragments.push(trimmed);
    }
  } catch { /* not valid JSON */ }

  // Extract file references
  FILE_PATH_PATTERN.lastIndex = 0;
  const fileReferences: string[] = [];
  let fileMatch: RegExpExecArray | null;
  while ((fileMatch = FILE_PATH_PATTERN.exec(input)) !== null) {
    fileReferences.push(fileMatch[1].trim());
  }

  // Image references
  const imageReferences = urls.filter(u => IMAGE_EXTENSIONS.test(u));

  // Strip non-text content for clean text
  let text = input;
  CODE_FENCE_PATTERN.lastIndex = 0;
  text = text.replace(CODE_FENCE_PATTERN, '');
  text = text.replace(URL_PATTERN, '');
  text = text.trim();

  return { text, codeBlocks, urls, jsonFragments, fileReferences, imageReferences };
}

// ═══ Multi-Modal Router ═══════════════════════════════════════════

/**
 * Process multi-modal input: detect, extract, and suggest routing
 */
export function processMultiModalInput(input: string): MultiModalInput {
  const modality = detectModality(input);
  const extracted = extractContent(input);

  // Determine routing targets based on modality
  const suggestedTargets: SubstrateTarget[] = [];

  switch (modality.primary) {
    case 'code':
      suggestedTargets.push('ENCODE');
      break;
    case 'json':
    case 'csv':
      suggestedTargets.push('BRAIN');
      break;
    case 'image':
      suggestedTargets.push('VISION');
      break;
    case 'url':
      suggestedTargets.push('INTEGRATION');
      break;
    case 'file':
      suggestedTargets.push('MEMORY');
      break;
    default: {
      // Fall back to content-based routing
      const route = resolveRoute(extracted.text || input);
      suggestedTargets.push(...route.targets);
    }
  }

  return {
    raw: input,
    modality,
    extracted,
    suggestedTargets,
  };
}

/**
 * Get a human-readable summary of detected modalities
 */
export function getModalitySummary(detection: ModalityDetection): string {
  const parts = [`Primary: ${detection.primary} (${Math.round(detection.confidence * 100)}%)`];
  if (detection.secondary) {
    parts.push(`Secondary: ${detection.secondary}`);
  }
  if (detection.signals.length > 0) {
    parts.push(`Signals: ${detection.signals.join(', ')}`);
  }
  return parts.join(' | ');
}
