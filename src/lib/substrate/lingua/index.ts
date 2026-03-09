/**
 * LINGUA — Barrel Export
 * Re-exports core module + CLM + Hardening
 */
export * from '../lingua-module';
export { runLinguaCLM, type LinguaCLMDiagnostic, type LinguaCLMReport } from './clm';
export {
  LINGUA_LIMITS,
  validateTranslationInput,
  validateSchemaInput,
  type LinguaValidationResult,
} from './hardening';
