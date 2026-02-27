/**
 * CMPSBL® Evolution Mesh — Configuration
 * Global SDK configuration. Call configure() before wrapping functions.
 */

export interface EvolutionMeshConfig {
  /** Enable/disable the mesh globally (default: true) */
  enabled?: boolean;
  /** SaaS telemetry endpoint (default: local only) */
  telemetryEndpoint?: string;
  /** API key for SaaS dashboard */
  apiKey?: string;
  /** Max repair attempts per execution (default: 1) */
  maxRepairAttempts?: number;
  /** Enable cross-function learning (default: true) */
  crossLearning?: boolean;
  /** Custom logger (default: console) */
  logger?: {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string) => void;
  };
  /** Enable shadow mode globally (default: false) */
  shadowMode?: boolean;
}

let _config: EvolutionMeshConfig = {
  enabled: true,
  maxRepairAttempts: 1,
  crossLearning: true,
  shadowMode: false,
};

export function configure(config: Partial<EvolutionMeshConfig>): void {
  _config = { ..._config, ...config };
}

export function getConfig(): EvolutionMeshConfig {
  return { ..._config };
}
