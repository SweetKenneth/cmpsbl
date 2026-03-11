/**
 * EVOLUTION Module — Migration Planner
 * Dependency upgrades, breaking changes, and migration paths
 */

// ============ Types ============

export interface DependencyInfo {
  name: string;
  current_version: string;
  latest_version: string;
  wanted_version: string;
  type: 'prod' | 'dev' | 'peer';
  is_outdated: boolean;
  versions_behind: number;
  has_breaking_changes: boolean;
  breaking_changes?: BreakingChange[];
  changelog_url?: string;
  homepage?: string;
}

export interface BreakingChange {
  version: string;
  description: string;
  migration_guide?: string;
  affected_apis: string[];
}

export interface MigrationPlan {
  id: string;
  name: string;
  description: string;
  dependencies: DependencyMigration[];
  total_effort_hours: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  phases: MigrationPhase[];
  rollback_strategy: string;
  created_at: string;
}

export interface DependencyMigration {
  package: string;
  from_version: string;
  to_version: string;
  effort_hours: number;
  breaking_changes: BreakingChange[];
  auto_migratable: boolean;
  migration_script?: string;
}

export interface MigrationPhase {
  order: number;
  name: string;
  description: string;
  dependencies: string[];
  estimated_hours: number;
  tasks: MigrationTask[];
}

export interface MigrationTask {
  id: string;
  name: string;
  type: 'code_change' | 'config_update' | 'test' | 'deploy' | 'verify';
  description: string;
  auto_executable: boolean;
  files_affected: string[];
  commands?: string[];
}

export interface UpgradeSimulation {
  package: string;
  from_version: string;
  to_version: string;
  compatible: boolean;
  issues: SimulationIssue[];
  type_changes: TypeChange[];
}

export interface SimulationIssue {
  severity: 'error' | 'warning' | 'info';
  message: string;
  file?: string;
  line?: number;
}

export interface TypeChange {
  symbol: string;
  change_type: 'removed' | 'modified' | 'added';
  old_signature?: string;
  new_signature?: string;
  migration_hint?: string;
}

// ============ State ============

const dependencyCache: Map<string, DependencyInfo> = new Map();
const migrationPlans: Map<string, MigrationPlan> = new Map();

// ============ Dependency Analysis ============

/**
 * Analyze project dependencies
 */
export function analyzeDependencies(packageJson: {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}): DependencyInfo[] {
  const deps: DependencyInfo[] = [];
  
  const processDeps = (
    depsObj: Record<string, string> | undefined,
    type: DependencyInfo['type']
  ) => {
    if (!depsObj) return;
    
    for (const [name, version] of Object.entries(depsObj)) {
      const cleanVersion = version.replace(/^[\^~]/, '');
      const info: DependencyInfo = {
        name,
        current_version: cleanVersion,
        latest_version: cleanVersion, // Would fetch from npm registry
        wanted_version: cleanVersion,
        type,
        is_outdated: false, // Would compare with registry
        versions_behind: 0,
        has_breaking_changes: false,
      };
      
      deps.push(info);
      dependencyCache.set(name, info);
    }
  };
  
  processDeps(packageJson.dependencies, 'prod');
  processDeps(packageJson.devDependencies, 'dev');
  processDeps(packageJson.peerDependencies, 'peer');
  
  return deps;
}

/**
 * Check for available updates
 */
export async function checkForUpdates(
  dependencies: DependencyInfo[]
): Promise<DependencyInfo[]> {
  // In production, this would query npm registry
  // Simulating some updates for demo
  return dependencies.map(dep => ({
    ...dep,
    is_outdated: Math.random() > 0.7,
    versions_behind: Math.floor(Math.random() * 5),
    has_breaking_changes: Math.random() > 0.8,
  }));
}

/**
 * Get breaking changes for a package upgrade
 */
export function getBreakingChanges(
  packageName: string,
  fromVersion: string,
  toVersion: string
): BreakingChange[] {
  // Known breaking changes for common packages
  const knownBreakingChanges: Record<string, Array<{version: string; desc: string; guide: string; apis: string[]}>> = {
    'react': [
      { version: '18.0.0', desc: 'Concurrent rendering changes', guide: 'Review concurrent mode docs', apis: ['render', 'ReactDOM'] },
    ],
    'react-router-dom': [
      { version: '6.0.0', desc: 'Route component API changed', guide: 'Use Routes instead of Switch', apis: ['Switch', 'Route'] },
      { version: '6.0.0', desc: 'useHistory replaced with useNavigate', guide: 'Replace all useHistory calls', apis: ['useHistory'] },
    ],
    '@tanstack/react-query': [
      { version: '5.0.0', desc: 'useQuery signature changed', guide: 'Update to object syntax', apis: ['useQuery', 'useMutation'] },
    ],
    'tailwindcss': [
      { version: '4.0.0', desc: 'Config file format updated', guide: 'Run npx tailwindcss migrate', apis: ['tailwind.config'] },
    ],
    'vite': [
      { version: '5.0.0', desc: 'Plugin API changes', guide: 'Update vite.config.ts', apis: ['plugins'] },
    ],
    'typescript': [
      { version: '5.0.0', desc: 'Stricter type checking', guide: 'Fix new type errors', apis: ['any', 'unknown'] },
    ],
  };
  
  // Check for major version bump
  const fromMajor = parseInt(fromVersion.split('.')[0], 10);
  const toMajor = parseInt(toVersion.split('.')[0], 10);
  
  if (toMajor > fromMajor && knownBreakingChanges[packageName]) {
    return knownBreakingChanges[packageName].map(bc => ({
      version: bc.version,
      description: bc.desc,
      migration_guide: bc.guide,
      affected_apis: bc.apis,
    }));
  }
  
  // Generate generic breaking change for major version bumps
  if (toMajor > fromMajor) {
    return [{
      version: toVersion,
      description: `Major version upgrade from v${fromMajor} to v${toMajor}`,
      migration_guide: 'Review package changelog',
      affected_apis: [],
    }];
  }
  
  return [];
}

// ============ Migration Planning ============

/**
 * Create a migration plan for dependency upgrades
 */
export function createMigrationPlan(
  upgrades: { package: string; from: string; to: string }[],
  options?: {
    name?: string;
    description?: string;
    aggressive?: boolean;
  }
): MigrationPlan {
  const dependencies: DependencyMigration[] = upgrades.map(u => ({
    package: u.package,
    from_version: u.from,
    to_version: u.to,
    effort_hours: estimateEffort(u.package, u.from, u.to),
    breaking_changes: getBreakingChanges(u.package, u.from, u.to),
    auto_migratable: isAutoMigratable(u.package),
  }));
  
  const totalEffort = dependencies.reduce((sum, d) => sum + d.effort_hours, 0);
  const riskLevel = calculateRiskLevel(dependencies);
  const phases = createPhases(dependencies);
  
  const plan: MigrationPlan = {
    id: `plan_${Date.now()}`,
    name: options?.name || 'Dependency Upgrade Plan',
    description: options?.description || 'Auto-generated migration plan',
    dependencies,
    total_effort_hours: totalEffort,
    risk_level: riskLevel,
    phases,
    rollback_strategy: 'Revert package.json and run npm install',
    created_at: new Date().toISOString(),
  };
  
  migrationPlans.set(plan.id, plan);
  
  return plan;
}

/**
 * Get migration plan by ID
 */
export function getMigrationPlan(id: string): MigrationPlan | null {
  return migrationPlans.get(id) || null;
}

/**
 * Get all migration plans
 */
export function getAllMigrationPlans(): MigrationPlan[] {
  return Array.from(migrationPlans.values());
}

// ============ Upgrade Simulation ============

/**
 * Simulate an upgrade to detect potential issues
 */
export function simulateUpgrade(
  packageName: string,
  fromVersion: string,
  toVersion: string,
  projectFiles: { path: string; content: string }[]
): UpgradeSimulation {
  const issues: SimulationIssue[] = [];
  const typeChanges: TypeChange[] = [];
  
  // Check for usage of package in project files
  for (const file of projectFiles) {
    if (file.content.includes(`from '${packageName}'`) || 
        file.content.includes(`from "${packageName}"`)) {
      // In production, would do AST analysis to find specific API usage
      issues.push({
        severity: 'info',
        message: `File imports from ${packageName}`,
        file: file.path,
      });
    }
  }
  
  return {
    package: packageName,
    from_version: fromVersion,
    to_version: toVersion,
    compatible: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    type_changes: typeChanges,
  };
}

// ============ Codemod Generation ============

/**
 * Generate codemod for API changes
 */
export function generateCodemod(
  oldApi: string,
  newApi: string,
  options?: {
    pattern?: 'function' | 'method' | 'import' | 'type';
    async?: boolean;
  }
): {
  name: string;
  description: string;
  find: string;
  replace: string;
  regex: RegExp;
} {
  const pattern = options?.pattern || 'function';
  
  let find = oldApi;
  let replace = newApi;
  let regex: RegExp;
  
  switch (pattern) {
    case 'import':
      regex = new RegExp(`import\\s+{[^}]*${oldApi}[^}]*}\\s+from`, 'g');
      break;
    case 'method':
      regex = new RegExp(`\\.${oldApi}\\(`, 'g');
      replace = `.${newApi}(`;
      break;
    case 'function':
    default:
      regex = new RegExp(`\\b${oldApi}\\(`, 'g');
      replace = `${newApi}(`;
      break;
  }
  
  return {
    name: `migrate-${oldApi}-to-${newApi}`,
    description: `Replace ${oldApi} with ${newApi}`,
    find,
    replace,
    regex,
  };
}

/**
 * Apply codemod to content
 */
export function applyCodemod(
  content: string,
  codemod: { regex: RegExp; replace: string }
): { content: string; changes: number } {
  let changes = 0;
  
  const newContent = content.replace(codemod.regex, () => {
    changes++;
    return codemod.replace;
  });
  
  return { content: newContent, changes };
}

// ============ Helpers ============

function estimateEffort(packageName: string, from: string, to: string): number {
  // Estimate based on major version difference
  const fromMajor = parseInt(from.split('.')[0]) || 0;
  const toMajor = parseInt(to.split('.')[0]) || 0;
  const majorDiff = toMajor - fromMajor;
  
  if (majorDiff === 0) return 0.5; // Patch/minor update
  if (majorDiff === 1) return 2; // Single major version
  return majorDiff * 2; // Multiple major versions
}

function isAutoMigratable(packageName: string): boolean {
  // Some packages provide codemods
  const autoMigratablePackages = [
    'react', 'react-router', 'jest', 'eslint',
  ];
  return autoMigratablePackages.some(p => packageName.includes(p));
}

function calculateRiskLevel(deps: DependencyMigration[]): MigrationPlan['risk_level'] {
  const totalBreaking = deps.reduce((sum, d) => sum + d.breaking_changes.length, 0);
  const majorVersionJumps = deps.filter(d => {
    const from = parseInt(d.from_version.split('.')[0]) || 0;
    const to = parseInt(d.to_version.split('.')[0]) || 0;
    return to - from >= 2;
  }).length;
  
  if (majorVersionJumps >= 3 || totalBreaking >= 5) return 'critical';
  if (majorVersionJumps >= 2 || totalBreaking >= 3) return 'high';
  if (majorVersionJumps >= 1 || totalBreaking >= 1) return 'medium';
  return 'low';
}

function createPhases(deps: DependencyMigration[]): MigrationPhase[] {
  const phases: MigrationPhase[] = [];
  
  // Phase 1: Auto-migratable dependencies
  const autoMigrate = deps.filter(d => d.auto_migratable);
  if (autoMigrate.length > 0) {
    phases.push({
      order: 1,
      name: 'Auto-Migration',
      description: 'Run automated codemods for compatible packages',
      dependencies: autoMigrate.map(d => d.package),
      estimated_hours: autoMigrate.reduce((sum, d) => sum + d.effort_hours * 0.5, 0),
      tasks: autoMigrate.map(d => ({
        id: `task_${d.package}_auto`,
        name: `Upgrade ${d.package}`,
        type: 'code_change',
        description: `Auto-migrate ${d.package} from ${d.from_version} to ${d.to_version}`,
        auto_executable: true,
        files_affected: [],
        commands: [`npm install ${d.package}@${d.to_version}`],
      })),
    });
  }
  
  // Phase 2: Manual migrations
  const manualMigrate = deps.filter(d => !d.auto_migratable);
  if (manualMigrate.length > 0) {
    phases.push({
      order: 2,
      name: 'Manual Migration',
      description: 'Address breaking changes requiring manual intervention',
      dependencies: manualMigrate.map(d => d.package),
      estimated_hours: manualMigrate.reduce((sum, d) => sum + d.effort_hours, 0),
      tasks: manualMigrate.map(d => ({
        id: `task_${d.package}_manual`,
        name: `Migrate ${d.package}`,
        type: 'code_change',
        description: `Manually update code for ${d.package} breaking changes`,
        auto_executable: false,
        files_affected: [],
      })),
    });
  }
  
  // Phase 3: Testing
  phases.push({
    order: phases.length + 1,
    name: 'Verification',
    description: 'Run tests and verify all functionality',
    dependencies: [],
    estimated_hours: 2,
    tasks: [
      { id: 'task_test', name: 'Run Tests', type: 'test', description: 'Run full test suite', auto_executable: true, files_affected: [], commands: ['npm test'] },
      { id: 'task_typecheck', name: 'Type Check', type: 'verify', description: 'Verify TypeScript types', auto_executable: true, files_affected: [], commands: ['npm run typecheck'] },
    ],
  });
  
  return phases;
}
