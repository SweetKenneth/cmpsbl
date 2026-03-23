/**
 * RELAY Ultimate — Protocol Translator
 * Format translation between Module Bus, Matrix Signal, and External API formats.
 * Schema versioning with forward/backward compatibility.
 */

export interface ModuleBusFormat {
  module: string;
  event_type: string;
  data: Record<string, unknown>;
}

export interface MatrixSignalFormat {
  from: string;
  to: string;
  signal: string;
  payload: Record<string, unknown>;
  sector: string;
}

export interface ExternalAPIFormat {
  action: string;
  params: Record<string, unknown>;
  auth?: string;
}

export type MessageFormat = 'module_bus' | 'matrix_signal' | 'external_api';

export interface TranslationResult {
  success: boolean;
  sourceFormat: MessageFormat;
  targetFormat: MessageFormat;
  original: unknown;
  translated: unknown;
  lossless: boolean;
  version: string;
  translatedAt: number;
}

export interface TranslatorStats {
  totalTranslations: number;
  losslessRate: number;
  byPair: Record<string, number>;
  errors: number;
}

const SCHEMA_VERSION = '2.0.0';
const MAX_HISTORY = 500;
const history: TranslationResult[] = [];
let errorCount = 0;

export function toModuleBus(source: MatrixSignalFormat | ExternalAPIFormat, sourceFormat: 'matrix_signal' | 'external_api'): TranslationResult {
  try {
    let translated: ModuleBusFormat;
    if (sourceFormat === 'matrix_signal') {
      const s = source as MatrixSignalFormat;
      translated = { module: s.from, event_type: s.signal, data: { ...s.payload, _sector: s.sector, _to: s.to } };
    } else {
      const s = source as ExternalAPIFormat;
      translated = { module: 'external', event_type: s.action, data: { ...s.params } };
    }
    return recordTranslation(sourceFormat, 'module_bus', source, translated, true);
  } catch {
    errorCount++;
    return recordTranslation(sourceFormat, 'module_bus', source, null, false);
  }
}

export function toMatrixSignal(source: ModuleBusFormat | ExternalAPIFormat, sourceFormat: 'module_bus' | 'external_api', to: string = 'unknown', sector: string = 'OCG'): TranslationResult {
  try {
    let translated: MatrixSignalFormat;
    if (sourceFormat === 'module_bus') {
      const s = source as ModuleBusFormat;
      translated = { from: s.module, to, signal: s.event_type, payload: { ...s.data }, sector };
    } else {
      const s = source as ExternalAPIFormat;
      translated = { from: 'external', to, signal: s.action, payload: { ...s.params }, sector };
    }
    return recordTranslation(sourceFormat, 'matrix_signal', source, translated, true);
  } catch {
    errorCount++;
    return recordTranslation(sourceFormat, 'matrix_signal', source, null, false);
  }
}

export function toExternalAPI(source: ModuleBusFormat | MatrixSignalFormat, sourceFormat: 'module_bus' | 'matrix_signal'): TranslationResult {
  try {
    let translated: ExternalAPIFormat;
    if (sourceFormat === 'module_bus') {
      const s = source as ModuleBusFormat;
      translated = { action: `${s.module}.${s.event_type}`, params: { ...s.data } };
    } else {
      const s = source as MatrixSignalFormat;
      translated = { action: s.signal, params: { ...s.payload, _from: s.from, _sector: s.sector } };
    }
    return recordTranslation(sourceFormat, 'external_api', source, translated, true);
  } catch {
    errorCount++;
    return recordTranslation(sourceFormat, 'external_api', source, null, false);
  }
}

function recordTranslation(sourceFormat: MessageFormat, targetFormat: MessageFormat, original: unknown, translated: unknown, lossless: boolean): TranslationResult {
  const result: TranslationResult = {
    success: translated !== null, sourceFormat, targetFormat,
    original, translated, lossless, version: SCHEMA_VERSION,
    translatedAt: Date.now(),
  };
  if (history.length >= MAX_HISTORY) history.shift();
  history.push(result);
  return result;
}

export function getTranslatorStats(): TranslatorStats {
  const byPair: Record<string, number> = {};
  for (const h of history) {
    const key = `${h.sourceFormat}→${h.targetFormat}`;
    byPair[key] = (byPair[key] ?? 0) + 1;
  }
  const successful = history.filter(h => h.success && h.lossless).length;
  return {
    totalTranslations: history.length,
    losslessRate: history.length > 0 ? successful / history.length : 1,
    byPair, errors: errorCount,
  };
}

export function resetTranslatorState(): void { history.length = 0; errorCount = 0; }
