/**
 * FORGE Node — Expansion Manufacturing Zone (EMZ)
 * Artifact synthesis, blueprint management, build pipelines.
 *
 * Re-exports the core forge-module and adds CLM + hardening layers.
 */

export {
  initForge,
  createBlueprint,
  generate,
  build,
  getForgeState,
  getForgeHealth,
  getForgeResilience,
  getForgeEngine,
  getForgeHardening,
  upgradeForgeEngine,
  type ForgeLanguage,
  type ForgeArtifactType,
  type ForgeBlueprint,
  type ForgeArtifact,
  type ForgeBuild,
  type ForgeModuleState,
} from '../forge-module';

export { forgeCLM, runForgeCLMCycle } from './clm';
export { forgeHardeningReport, validateForgeInput, FORGE_LIMITS } from './hardening';
export {
  SIGNAL_FORGE_PRIMITIVE,
  forgeSignalBatch,
  forgeRetireCombo,
  forgeIsComboRetired,
  forgeGetRetired,
  forgeClearRetired,
  forgeSignalStats,
  type ForgeSignalRequest,
  type ForgeSignalResult,
} from './signal-forge';
