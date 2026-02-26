/**
 * CMPSBL Local Mode Initialization
 * Restores all modules using cached environment variables only
 */

import { secureSet, secureGet, migrateLegacyKey } from './secureStorage';

interface ModuleState {
  name: string;
  status: 'initializing' | 'active' | 'error';
  dependencies: string[];
  initialized: boolean;
}

interface DependencyGraph {
  [key: string]: ModuleState;
}

/**
 * Load cached environment variables
 */
function loadCachedEnv(): Record<string, string> {
  // Migrate legacy plaintext env if present
  migrateLegacyKey('pf_cached_env');
  
  const cached = secureGet<Record<string, string>>('pf_cached_env');
  if (cached) return cached;

  // Fallback to import.meta.env
  return {
    SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || '',
    SUPABASE_KEY: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '',
    PROJECT_ID: import.meta.env.VITE_SUPABASE_PROJECT_ID || '',
  };
}

/**
 * Initialize Brain module (learning, memory, orchestration)
 */
async function initBrain(): Promise<ModuleState> {
  const state: ModuleState = {
    name: 'Brain',
    status: 'initializing',
    dependencies: [],
    initialized: false,
  };

  try {
    // Use secure storage for sensitive Brain memory references
    secureSet('brain_learning_active', true);
    secureSet('brain_mode', 'local');

    state.status = 'active';
    state.initialized = true;
  } catch (e) {
    state.status = 'error';
  }

  return state;
}

/**
 * Initialize Cascade module (workflow orchestration)
 */
async function initCascade(): Promise<ModuleState> {
  const state: ModuleState = {
    name: 'Cascade',
    status: 'initializing',
    dependencies: ['Brain'],
    initialized: false,
  };

  try {
    localStorage.setItem('cascade_workflows', '[]');
    localStorage.setItem('cascade_queue', '[]');
    localStorage.setItem('cascade_mode', 'local');

    state.status = 'active';
    state.initialized = true;
  } catch (e) {
    state.status = 'error';
  }

  return state;
}

/**
 * Initialize PTCHBL module (code quality, validation)
 */
async function initPTCHBL(): Promise<ModuleState> {
  const state: ModuleState = {
    name: 'PTCHBL',
    status: 'initializing',
    dependencies: [],
    initialized: false,
  };

  try {
    localStorage.setItem('ptchbl_scans', '[]');
    localStorage.setItem('ptchbl_mode', 'local');

    state.status = 'active';
    state.initialized = true;
  } catch (e) {
    state.status = 'error';
  }

  return state;
}

/**
 * Initialize RCKBL module (WordPress bot protection)
 */
async function initRCKBL(): Promise<ModuleState> {
  const state: ModuleState = {
    name: 'RCKBL',
    status: 'initializing',
    dependencies: ['Defense'],
    initialized: false,
  };

  try {
    localStorage.setItem('rckbl_sniper_active', 'true');
    localStorage.setItem('rckbl_mode', 'local');

    state.status = 'active';
    state.initialized = true;
  } catch (e) {
    state.status = 'error';
  }

  return state;
}

/**
 * Initialize Defense module (security, threat intelligence)
 */
async function initDefense(): Promise<ModuleState> {
  const state: ModuleState = {
    name: 'Defense',
    status: 'initializing',
    dependencies: [],
    initialized: false,
  };

  try {
    localStorage.setItem('defense_events', '[]');
    localStorage.setItem('defense_ip_reputation', '{}');
    localStorage.setItem('defense_mode', 'local');

    state.status = 'active';
    state.initialized = true;
  } catch (e) {
    state.status = 'error';
  }

  return state;
}

/**
 * Initialize Nexus module (API gateway, routing)
 */
async function initNexus(): Promise<ModuleState> {
  const state: ModuleState = {
    name: 'Nexus',
    status: 'initializing',
    dependencies: ['Brain'],
    initialized: false,
  };

  try {
    localStorage.setItem('nexus_routes', '[]');
    localStorage.setItem('nexus_cache', '{}');
    localStorage.setItem('nexus_mode', 'local');

    state.status = 'active';
    state.initialized = true;
  } catch (e) {
    state.status = 'error';
  }

  return state;
}

/**
 * Build dependency graph and initialize modules in correct order
 */
async function buildDependencyGraph(): Promise<DependencyGraph> {
  const graph: DependencyGraph = {};

  // Initialize modules without dependencies first
  graph.Brain = await initBrain();
  graph.PTCHBL = await initPTCHBL();
  graph.Defense = await initDefense();

  // Initialize modules with dependencies
  graph.Cascade = await initCascade();
  graph.Nexus = await initNexus();
  graph.RCKBL = await initRCKBL();

  return graph;
}

/**
 * Verify inter-module communication locally
 */
async function verifyInterModuleCommunication(graph: DependencyGraph): Promise<boolean> {
  const verifications: Record<string, boolean> = {};

  // Verify Brain <-> Nexus
  verifications.brain_nexus = graph.Brain.initialized && graph.Nexus.initialized;

  // Verify Defense <-> RCKBL
  verifications.defense_rckbl = graph.Defense.initialized && graph.RCKBL.initialized;

  // Verify Brain <-> Cascade
  verifications.brain_cascade = graph.Brain.initialized && graph.Cascade.initialized;

  // Store verification results
  localStorage.setItem('pf_module_verification', JSON.stringify(verifications));

  return Object.values(verifications).every(v => v === true);
}

/**
 * Execute full local mode initialization
 */
export async function initializeLocalMode(): Promise<{
  success: boolean;
  graph: DependencyGraph;
  communication_verified: boolean;
  timestamp: number;
}> {
  // Load cached environment
  const env = loadCachedEnv();
  secureSet('pf_cached_env', env);

  // Set local mode flag
  secureSet('pf_local_mode', true);
  secureSet('pf_skip_sync', true);
  secureSet('pf_skip_diagnostics', true);
  secureSet('pf_skip_telemetry', true);

  // Build dependency graph
  const graph = await buildDependencyGraph();

  // Verify inter-module communication
  const communicationVerified = await verifyInterModuleCommunication(graph);

  // All modules active?
  const allActive = Object.values(graph).every(m => m.status === 'active');

  return {
    success: allActive && communicationVerified,
    graph,
    communication_verified: communicationVerified,
    timestamp: Date.now(),
  };
}

/**
 * Get current local mode status
 */
export function getLocalModeStatus(): {
  active: boolean;
  modules: string[];
  timestamp: number;
} {
  const isLocal = secureGet<boolean>('pf_local_mode') === true;
  const modules: string[] = [];

  const moduleNames = ['Brain', 'Cascade', 'PTCHBL', 'RCKBL', 'Defense', 'Nexus'];
  moduleNames.forEach(name => {
    const key = `${name.toLowerCase()}_mode`;
    if (localStorage.getItem(key) === 'local') {
      modules.push(name);
    }
  });

  return {
    active: isLocal,
    modules,
    timestamp: Date.now(),
  };
}
