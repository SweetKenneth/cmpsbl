/**
 * #10 — Configuration Drift Scanner
 * Compare declared config against actual runtime behavior to find mismatches.
 */

export interface ConfigDriftReport {
  drifts: ConfigDrift[];
  envMismatches: EnvMismatch[];
  staleConfigs: StaleConfig[];
  shadowConfigs: ShadowConfig[];
  totalDrifts: number;
  riskScore: number;
  scanTimestamp: string;
}

export interface ConfigDrift {
  id: string;
  category: 'env' | 'build' | 'deploy' | 'security' | 'database' | 'runtime';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  declared: string;
  actual: string;
  file: string;
  remediation: string;
}

export interface EnvMismatch {
  variable: string;
  declaredIn: string;
  declaredValue: string | null;
  usedAs: string;
  issue: string;
}

export interface StaleConfig {
  file: string;
  reason: string;
  lastRelevantDep: string | null;
  canRemove: boolean;
}

export interface ShadowConfig {
  key: string;
  files: string[];
  values: string[];
  issue: string;
}

/**
 * Detect configuration drift across the project
 */
export function detectConfigDrift(
  configFiles: Array<{ path: string; content: string; parsed?: Record<string, unknown> }>,
  envFiles: Array<{ path: string; content: string }>,
  codeFiles: Array<{ path: string; content: string }>,
  dependencies: Record<string, string>,
): ConfigDriftReport {
  const drifts: ConfigDrift[] = [];
  const envMismatches: EnvMismatch[] = [];
  const staleConfigs: StaleConfig[] = [];
  const shadowConfigs: ShadowConfig[] = [];

  // 1. Check for .env.example vs .env drift
  const envExample = envFiles.find(f => f.path.includes('.example') || f.path.includes('.template'));
  const envActual = envFiles.find(f => !f.path.includes('.example') && !f.path.includes('.template'));

  if (envExample && envActual) {
    const exampleVars = parseEnvFile(envExample.content);
    const actualVars = parseEnvFile(envActual.content);

    for (const [key, exampleValue] of Object.entries(exampleVars)) {
      if (!(key in actualVars)) {
        envMismatches.push({
          variable: key,
          declaredIn: envExample.path,
          declaredValue: exampleValue,
          usedAs: 'missing',
          issue: `Declared in ${envExample.path} but missing from ${envActual.path}`,
        });
      }
    }

    for (const [key] of Object.entries(actualVars)) {
      if (!(key in exampleVars) && envExample) {
        envMismatches.push({
          variable: key,
          declaredIn: envActual.path,
          declaredValue: null,
          usedAs: 'undocumented',
          issue: `Present in ${envActual.path} but not documented in ${envExample.path}`,
        });
      }
    }
  }

  // 2. Check for stale config files (configs for deps that no longer exist)
  const configToDepMap: Record<string, string[]> = {
    'tailwind.config': ['tailwindcss'],
    'postcss.config': ['postcss'],
    'babel.config': ['@babel/core', 'babel-loader'],
    '.babelrc': ['@babel/core'],
    'tsconfig': ['typescript'],
    'jest.config': ['jest'],
    'vitest.config': ['vitest'],
    '.eslintrc': ['eslint'],
    'eslint.config': ['eslint'],
    '.prettierrc': ['prettier'],
    'prettier.config': ['prettier'],
    '.stylelintrc': ['stylelint'],
    'cypress.config': ['cypress'],
    'playwright.config': ['@playwright/test'],
    '.storybook': ['@storybook/react', 'storybook'],
    'commitlint.config': ['@commitlint/cli'],
    'lint-staged.config': ['lint-staged'],
    '.husky': ['husky'],
  };

  for (const configFile of configFiles) {
    for (const [configPattern, requiredDeps] of Object.entries(configToDepMap)) {
      if (configFile.path.includes(configPattern)) {
        const hasAnyDep = requiredDeps.some(dep => dep in dependencies);
        if (!hasAnyDep) {
          staleConfigs.push({
            file: configFile.path,
            reason: `Config exists but required dependency (${requiredDeps.join(' or ')}) is not installed`,
            lastRelevantDep: requiredDeps[0],
            canRemove: true,
          });
        }
      }
    }
  }

  // 3. Check for shadow configs (same setting defined in multiple places)
  const settingsMap = new Map<string, Array<{ file: string; value: string }>>();
  
  for (const file of configFiles) {
    if (!file.parsed) continue;
    flattenObject(file.parsed, '', (key, value) => {
      const existing = settingsMap.get(key) || [];
      existing.push({ file: file.path, value: String(value) });
      settingsMap.set(key, existing);
    });
  }

  for (const [key, locations] of settingsMap.entries()) {
    if (locations.length > 1) {
      const uniqueValues = [...new Set(locations.map(l => l.value))];
      if (uniqueValues.length > 1) {
        shadowConfigs.push({
          key,
          files: locations.map(l => l.file),
          values: uniqueValues,
          issue: `Setting "${key}" has conflicting values across ${locations.length} files`,
        });
      }
    }
  }

  // 4. Check for common config drifts
  const allCode = codeFiles.map(f => f.content).join('\n');

  // Node version drift
  const nvmrcFile = configFiles.find(f => f.path.includes('.nvmrc') || f.path.includes('.node-version'));
  const packageEngines = configFiles.find(f => f.path.includes('package.json'));
  if (nvmrcFile && packageEngines?.parsed) {
    const nvmVersion = nvmrcFile.content.trim();
    const engineVersion = (packageEngines.parsed as Record<string, Record<string, string>>).engines?.node;
    if (engineVersion && !engineVersion.includes(nvmVersion.replace('v', ''))) {
      drifts.push({
        id: 'drift-node-version',
        category: 'runtime',
        severity: 'medium',
        title: 'Node.js version mismatch',
        declared: `${nvmrcFile.path}: ${nvmVersion}`,
        actual: `package.json engines.node: ${engineVersion}`,
        file: nvmrcFile.path,
        remediation: 'Synchronize Node.js version across .nvmrc and package.json engines',
      });
    }
  }

  // CORS wildcard in production
  if (/origin:\s*['"`]\*['"`]|Access-Control-Allow-Origin.*\*/.test(allCode)) {
    drifts.push({
      id: 'drift-cors-wildcard',
      category: 'security',
      severity: 'high',
      title: 'CORS wildcard origin in code',
      declared: 'Should be restricted to specific domains',
      actual: 'Access-Control-Allow-Origin: *',
      file: 'multiple',
      remediation: 'Replace wildcard CORS origin with specific allowed domains',
    });
  }

  // Calculate risk
  const riskScore = Math.min(100,
    drifts.filter(d => d.severity === 'critical').length * 25 +
    drifts.filter(d => d.severity === 'high').length * 15 +
    envMismatches.length * 5 +
    shadowConfigs.length * 10 +
    staleConfigs.length * 2
  );

  return {
    drifts,
    envMismatches,
    staleConfigs,
    shadowConfigs,
    totalDrifts: drifts.length + envMismatches.length + staleConfigs.length + shadowConfigs.length,
    riskScore,
    scanTimestamp: new Date().toISOString(),
  };
}

function parseEnvFile(content: string): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) vars[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
  return vars;
}

function flattenObject(obj: unknown, prefix: string, callback: (key: string, value: unknown) => void): void {
  if (obj === null || typeof obj !== 'object') {
    if (prefix) callback(prefix, obj);
    return;
  }
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      flattenObject(value, fullKey, callback);
    } else {
      callback(fullKey, value);
    }
  }
}
