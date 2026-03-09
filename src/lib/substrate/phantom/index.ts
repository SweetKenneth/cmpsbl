/**
 * PHANTOM Node — Covert Systems Zone (CSZ)
 * Privacy enforcement, data anonymization, synthetic data generation.
 *
 * Re-exports core phantom-module and adds CLM + hardening layers.
 */

export {
  initPhantom,
  setPrivacyBudget,
  addNoise,
  generateSynthetic,
  anonymize,
  getPhantomState,
  getPhantomHealth,
  getPhantomResilience,
  getPhantomEngine,
  getPhantomHardening,
  upgradePhantomEngine,
  type PrivacyMechanism,
  type AnonymizationMethod,
  type PrivacyBudget,
  type SyntheticDataset,
  type AnonymizationResult,
  type PhantomModuleState,
} from '../phantom-module';

export { phantomCLM, runPhantomCLMCycle, type PhantomCLMInsight, type PhantomCLMReport } from './clm';
export { phantomHardeningReport, validatePhantomInput, PHANTOM_LIMITS } from './hardening';
