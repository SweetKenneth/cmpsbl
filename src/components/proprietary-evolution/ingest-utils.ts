export const LANG_MAP: Record<string, string> = {
  ts: 'TypeScript', tsx: 'TypeScript/React', js: 'JavaScript', jsx: 'JavaScript/React',
  py: 'Python', rs: 'Rust', go: 'Go', java: 'Java', rb: 'Ruby', cs: 'C#',
  cpp: 'C++', cc: 'C++', cxx: 'C++', hpp: 'C++ Header', c: 'C', h: 'C/C++ Header',
  zig: 'Zig', hs: 'Haskell', lhs: 'Haskell', swift: 'Swift', kt: 'Kotlin', kts: 'Kotlin',
  php: 'PHP', lua: 'Lua', dart: 'Dart', scala: 'Scala', sc: 'Scala', ex: 'Elixir', exs: 'Elixir',
  v: 'Verilog', sv: 'SystemVerilog', svh: 'SystemVerilog', vhd: 'VHDL', vhdl: 'VHDL', bsv: 'Bluespec',
  cir: 'SPICE', sp: 'SPICE', spice: 'SPICE', json: 'JSON', yaml: 'YAML', yml: 'YAML', toml: 'TOML', xml: 'XML',
  md: 'Markdown', txt: 'Text',
};

const SUPPORTED_TEXT_EXTENSIONS = new Set(Object.keys(LANG_MAP));
const TEXT_SAMPLE_BYTES = 64 * 1024;
const MAX_TEXT_ANALYSIS_BYTES = 1024 * 1024;
const MAX_STORED_CHARS_PER_FILE = 16_000;
const MAX_STORED_TOTAL_CHARS = 80_000;

type SupportedTextEncoding = 'utf-8' | 'utf-16le' | 'utf-16be' | 'windows-1252';

export interface IngestedSourceFile {
  name: string;
  extension: string;
  language: string;
  sizeBytes: number;
  charCount: number;
  content: string;
  truncated: boolean;
}

export interface CandidateAnalysis {
  name: string;
  fileCount: number;
  resolverCount: number;
  language: string;
  sizeKb: number;
  parseWarnings: string[];
  ingestedFiles: IngestedSourceFile[];
  unreadableFileCount: number;
}

function getFileExtension(name: string): string {
  return name.split('.').pop()?.toLowerCase() || '';
}

function isKnownSourceFile(file: File): boolean {
  return SUPPORTED_TEXT_EXTENSIONS.has(getFileExtension(file.name));
}

function detectLanguage(file: File): string {
  return LANG_MAP[getFileExtension(file.name)] || 'Unknown';
}

export function sanitizeCandidateName(fileName: string): string {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .toUpperCase()
    .slice(0, 40);
}

async function blobToArrayBuffer(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') {
    return blob.arrayBuffer();
  }

  return await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob'));
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(blob);
  });
}

function detectTextEncoding(bytes: Uint8Array): SupportedTextEncoding {
  if (bytes.length >= 2) {
    if (bytes[0] === 0xff && bytes[1] === 0xfe) return 'utf-16le';
    if (bytes[0] === 0xfe && bytes[1] === 0xff) return 'utf-16be';
  }

  const pairCount = Math.floor(Math.min(bytes.length, 512) / 2);
  if (pairCount < 8) return 'utf-8';

  let evenNulls = 0;
  let oddNulls = 0;

  for (let i = 0; i < pairCount * 2; i += 2) {
    if (bytes[i] === 0x00) evenNulls++;
    if (bytes[i + 1] === 0x00) oddNulls++;
  }

  const evenRatio = evenNulls / pairCount;
  const oddRatio = oddNulls / pairCount;

  if (oddRatio > 0.3 && evenRatio < 0.05) return 'utf-16le';
  if (evenRatio > 0.3 && oddRatio < 0.05) return 'utf-16be';

  return 'utf-8';
}

function hasHardBinarySignature(bytes: Uint8Array, knownSourceFile: boolean, encoding: SupportedTextEncoding): boolean {
  if (knownSourceFile || encoding === 'utf-16le' || encoding === 'utf-16be' || bytes.length === 0) {
    return false;
  }

  let nullBytes = 0;
  let suspiciousControls = 0;

  for (const byte of bytes) {
    if (byte === 0x00) nullBytes++;
    const isWhitespace = byte === 0x09 || byte === 0x0a || byte === 0x0d || byte === 0x0c;
    const isControl = byte < 0x20 && !isWhitespace;
    if (isControl) suspiciousControls++;
  }

  return (nullBytes / bytes.length) > 0.01 || (suspiciousControls / bytes.length) > 0.2;
}

function scoreDecodedText(text: string): number {
  if (!text) return Number.NEGATIVE_INFINITY;

  const replacementCount = (text.match(/\uFFFD/g) || []).length;
  const nullCount = (text.match(/\u0000/g) || []).length;
  const controlCount = (text.match(/[\x00-\x08\x0B\x0E-\x1F\x7F]/g) || []).length;
  const codeLikeCount = (text.match(/[A-Za-z0-9_{}()[\];,.<>:=+\-/*#@$%&|!?"'`~]/g) || []).length;

  return (codeLikeCount * 2) - (replacementCount * 40) - (nullCount * 200) - (controlCount * 20);
}

function decodeBestEffort(buffer: ArrayBuffer, preferredEncoding: SupportedTextEncoding): string | null {
  const encodings: SupportedTextEncoding[] = Array.from(new Set([
    preferredEncoding,
    'utf-8',
    'utf-16le',
    'utf-16be',
    'windows-1252',
  ]));

  let bestText: string | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;

  for (const encoding of encodings) {
    try {
      const text = new TextDecoder(encoding, { fatal: false }).decode(buffer).replace(/^\uFEFF/, '');
      const score = scoreDecodedText(text);
      if (score > bestScore) {
        bestScore = score;
        bestText = text;
      }
    } catch {
      // Try the next decoder.
    }
  }

  return bestText;
}

function looksUnreadable(text: string): boolean {
  if (!text) return true;
  const replacementRatio = ((text.match(/\uFFFD/g) || []).length) / text.length;
  const controlRatio = ((text.match(/[\x00-\x08\x0B\x0E-\x1F\x7F]/g) || []).length) / text.length;
  return replacementRatio > 0.2 || controlRatio > 0.1;
}

export async function safeReadText(file: File): Promise<string | null> {
  const knownSource = isKnownSourceFile(file);

  // Fast path for known source extensions — always use file.text() directly.
  // This avoids false-positive binary detection for PHP, Rust, Verilog, etc.
  if (knownSource) {
    try {
      const text = await file.text();
      return text.replace(/^\uFEFF/, '');
    } catch {
      // Fallback: try arrayBuffer → TextDecoder
      try {
        const buf = await blobToArrayBuffer(file.slice(0, MAX_TEXT_ANALYSIS_BYTES));
        return new TextDecoder('utf-8', { fatal: false }).decode(buf).replace(/^\uFEFF/, '');
      } catch {
        return null;
      }
    }
  }

  // Unknown extensions: probe for binary content
  try {
    const sampleSize = Math.min(file.size, TEXT_SAMPLE_BYTES);
    const sampleBuffer = await blobToArrayBuffer(file.slice(0, sampleSize));
    const sampleBytes = new Uint8Array(sampleBuffer);
    const detectedEncoding = detectTextEncoding(sampleBytes);

    if (hasHardBinarySignature(sampleBytes, false, detectedEncoding)) {
      return null;
    }

    const analysisSize = Math.min(file.size, MAX_TEXT_ANALYSIS_BYTES);
    const analysisBuffer = analysisSize === sampleSize
      ? sampleBuffer
      : await blobToArrayBuffer(file.slice(0, analysisSize));

    const decoded = decodeBestEffort(analysisBuffer, detectedEncoding);
    if (decoded && !looksUnreadable(decoded)) {
      return decoded;
    }

    return null;
  } catch {
    return null;
  }
}

export function estimateResolverCount(text: string): number {
  const patterns = [
    /export\s+(?:async\s+)?(?:function|class|const|default)/g,
    /(?:pub\s+)?fn\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/g,
    /function\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/g,
    /func\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/g,
    /def\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/g,
    /module\s+[A-Za-z_][A-Za-z0-9_]*\b/g,
    /entity\s+[A-Za-z_][A-Za-z0-9_]*\s+is/gi,
  ];

  return patterns.reduce((count, pattern) => count + (text.match(pattern)?.length || 0), 0);
}

export async function analyzeUploadedFiles(files: File[]): Promise<CandidateAnalysis> {
  const warnings: string[] = [];
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const detectedLanguages = Array.from(new Set(files.map(detectLanguage).filter(lang => lang !== 'Unknown')));
  const primaryLanguage = detectedLanguages[0] || 'Unknown';

  if (detectedLanguages.length === 0) {
    warnings.push('No recognized language extensions — files will be analyzed as raw input');
  }
  if (detectedLanguages.length > 3) {
    warnings.push(`Mixed-language upload detected (${detectedLanguages.length} languages)`);
  }

  let resolverEstimate = 0;
  let unreadableFileCount = 0;
  let storedChars = 0;
  let truncatedCount = 0;
  const ingestedFiles: IngestedSourceFile[] = [];

  for (const file of files) {
    const text = await safeReadText(file);
    if (text === null) {
      unreadableFileCount++;
      continue;
    }

    resolverEstimate += estimateResolverCount(text);
    const remainingBudget = Math.max(0, MAX_STORED_TOTAL_CHARS - storedChars);
    const sliceLength = Math.min(text.length, MAX_STORED_CHARS_PER_FILE, remainingBudget);
    const content = sliceLength > 0 ? text.slice(0, sliceLength) : '';
    const truncated = sliceLength < text.length;

    if (truncated) truncatedCount++;
    if (content) {
      storedChars += content.length;
    }

    ingestedFiles.push({
      name: file.name,
      extension: getFileExtension(file.name),
      language: detectLanguage(file),
      sizeBytes: file.size,
      charCount: text.length,
      content,
      truncated,
    });
  }

  if (unreadableFileCount > 0) {
    warnings.push(`${unreadableFileCount} file(s) skipped (binary or unreadable text content)`);
  }
  if (truncatedCount > 0) {
    warnings.push('Large sources were partially stored for browser-safe ingest while preserving code registration');
  }
  if (ingestedFiles.length === 0) {
    warnings.push('No readable source payload was extracted — registration is blocked until at least one supported text file is parsed');
  }

  return {
    name: sanitizeCandidateName(files[0]?.name || 'candidate_node'),
    fileCount: files.length,
    resolverCount: Math.max(resolverEstimate, 1),
    language: primaryLanguage + (detectedLanguages.length > 1 ? ` +${detectedLanguages.length - 1}` : ''),
    sizeKb: Math.round(totalSize / 1024),
    parseWarnings: warnings,
    ingestedFiles,
    unreadableFileCount,
  };
}
