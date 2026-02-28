/**
 * #5 — Environment Detection
 * Detect staging vs production, identify environment variable patterns,
 * find hardcoded secrets, and map deployment topology.
 */

export interface EnvironmentProfile {
  environment: 'production' | 'staging' | 'development' | 'unknown';
  environmentConfidence: number;
  envVars: EnvVarAnalysis;
  hardcodedSecrets: HardcodedSecret[];
  topology: DeploymentTopology;
  configFiles: ConfigFileInfo[];
  riskScore: number;
  scanTimestamp: string;
}

export interface EnvVarAnalysis {
  declared: EnvVarInfo[];
  referenced: EnvVarInfo[];
  missingButReferenced: string[];
  unusedButDeclared: string[];
  sensitiveInCode: string[];
  totalDeclared: number;
  totalReferenced: number;
}

export interface EnvVarInfo {
  name: string;
  hasValue: boolean;
  isSecret: boolean;
  source: string;
  usedIn: string[];
}

export interface HardcodedSecret {
  type: 'api_key' | 'token' | 'password' | 'connection_string' | 'private_key' | 'webhook_url';
  pattern: string;
  file: string;
  line: number | null;
  severity: 'critical' | 'high' | 'medium';
  preview: string;
  recommendation: string;
}

export interface DeploymentTopology {
  type: 'monolith' | 'microservices' | 'serverless' | 'jamstack' | 'hybrid' | 'unknown';
  services: ServiceInfo[];
  databases: DatabaseInfo[];
  caches: CacheInfo[];
  queues: QueueInfo[];
  externalAPIs: ExternalAPIInfo[];
}

export interface ServiceInfo {
  name: string;
  type: 'frontend' | 'backend' | 'worker' | 'gateway' | 'edge_function';
  port: number | null;
  entryPoint: string | null;
}

export interface DatabaseInfo {
  type: string;
  connectionVar: string;
  isManaged: boolean;
}

export interface CacheInfo {
  type: string;
  connectionVar: string;
}

export interface QueueInfo {
  type: string;
  connectionVar: string;
}

export interface ExternalAPIInfo {
  name: string;
  baseUrlVar: string | null;
  keyVar: string | null;
}

export interface ConfigFileInfo {
  path: string;
  type: 'env' | 'json' | 'yaml' | 'toml' | 'ini';
  isTemplate: boolean;
  hasSecrets: boolean;
}

// Secret detection patterns
const SECRET_PATTERNS: Array<{
  type: HardcodedSecret['type'];
  patterns: RegExp[];
  severity: HardcodedSecret['severity'];
}> = [
  {
    type: 'api_key',
    patterns: [
      /['"`]sk[-_](?:live|test|prod)[-_][a-zA-Z0-9]{20,}['"`]/,
      /['"`](?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}['"`]/, // AWS
      /['"`]AIza[0-9A-Za-z\-_]{35}['"`]/, // Google
      /['"`]xox[baps]-[0-9A-Za-z\-]{10,}['"`]/, // Slack
      /['"`]ghp_[a-zA-Z0-9]{36}['"`]/, // GitHub
      /['"`]glpat-[a-zA-Z0-9\-_]{20,}['"`]/, // GitLab
      /['"`]sk-[a-zA-Z0-9]{20,}['"`]/, // OpenAI
      /['"`]r8_[a-zA-Z0-9]{20,}['"`]/, // Replicate
    ],
    severity: 'critical',
  },
  {
    type: 'private_key',
    patterns: [
      /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
      /-----BEGIN PGP PRIVATE KEY BLOCK-----/,
    ],
    severity: 'critical',
  },
  {
    type: 'connection_string',
    patterns: [
      /['"`](?:postgres|mysql|mongodb(?:\+srv)?):\/\/[^'"`\s]{10,}['"`]/,
      /['"`]redis:\/\/[^'"`\s]{10,}['"`]/,
      /['"`]amqp:\/\/[^'"`\s]{10,}['"`]/,
    ],
    severity: 'critical',
  },
  {
    type: 'token',
    patterns: [
      /['"`]eyJ[a-zA-Z0-9\-_]+\.eyJ[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+['"`]/, // JWT
      /['"`][a-f0-9]{64}['"`]/, // Generic hex token (64 chars)
    ],
    severity: 'high',
  },
  {
    type: 'password',
    patterns: [
      /(?:password|passwd|pwd)\s*[:=]\s*['"`][^'"`]{8,}['"`]/i,
    ],
    severity: 'high',
  },
  {
    type: 'webhook_url',
    patterns: [
      /['"`]https:\/\/hooks\.slack\.com\/[^'"`]+['"`]/,
      /['"`]https:\/\/discord(?:app)?\.com\/api\/webhooks\/[^'"`]+['"`]/,
    ],
    severity: 'medium',
  },
];

// Environment indicator patterns
const ENV_INDICATORS: Record<string, Array<{ pattern: RegExp; weight: number }>> = {
  production: [
    { pattern: /NODE_ENV\s*=\s*['"`]production['"`]/, weight: 1.0 },
    { pattern: /\.env\.production/, weight: 0.8 },
    { pattern: /PROD[_=]/, weight: 0.5 },
    { pattern: /sentry\.io|bugsnag|datadog|newrelic/, weight: 0.6 },
    { pattern: /production.*domain|\.com['"` ]/, weight: 0.4 },
  ],
  staging: [
    { pattern: /NODE_ENV\s*=\s*['"`]staging['"`]/, weight: 1.0 },
    { pattern: /\.env\.staging/, weight: 0.8 },
    { pattern: /staging\.|stage\.|stg\./, weight: 0.7 },
    { pattern: /STAGING[_=]/, weight: 0.5 },
  ],
  development: [
    { pattern: /NODE_ENV\s*=\s*['"`]development['"`]/, weight: 1.0 },
    { pattern: /\.env\.local/, weight: 0.6 },
    { pattern: /localhost|127\.0\.0\.1/, weight: 0.5 },
    { pattern: /DEV[_=]/, weight: 0.3 },
  ],
};

/**
 * Scan file contents for hardcoded secrets
 */
export function scanForHardcodedSecrets(
  files: Array<{ path: string; content: string }>
): HardcodedSecret[] {
  const secrets: HardcodedSecret[] = [];
  const IGNORED_PATHS = [/node_modules/, /\.lock$/, /\.min\./, /dist\//, /build\//, /\.map$/];

  for (const file of files) {
    if (IGNORED_PATHS.some(p => p.test(file.path))) continue;

    const lines = file.content.split('\n');
    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      
      // Skip comments
      if (/^\s*[#\/\/]/.test(line)) continue;
      // Skip .env template lines with empty values
      if (/^[A-Z_]+=\s*$/.test(line)) continue;
      // Skip test/mock files
      if (/\.(test|spec|mock|fixture)\.[jt]sx?$/.test(file.path)) continue;

      for (const secretType of SECRET_PATTERNS) {
        for (const pattern of secretType.patterns) {
          if (pattern.test(line)) {
            const match = line.match(pattern);
            secrets.push({
              type: secretType.type,
              pattern: pattern.source.slice(0, 40) + '...',
              file: file.path,
              line: lineNum + 1,
              severity: secretType.severity,
              preview: maskSecret(match?.[0] || line.trim()),
              recommendation: `Move to environment variable. Never commit ${secretType.type} values to source control.`,
            });
          }
        }
      }
    }
  }

  return secrets;
}

/**
 * Detect environment type from file contents
 */
export function detectEnvironment(
  fileContents: Array<{ path: string; content: string }>
): { environment: 'production' | 'staging' | 'development' | 'unknown'; confidence: number } {
  const scores: Record<string, number> = { production: 0, staging: 0, development: 0 };
  let totalWeight = 0;

  for (const file of fileContents) {
    for (const [env, indicators] of Object.entries(ENV_INDICATORS)) {
      for (const indicator of indicators) {
        if (indicator.pattern.test(file.content)) {
          scores[env] += indicator.weight;
          totalWeight += indicator.weight;
        }
      }
    }
  }

  if (totalWeight === 0) return { environment: 'unknown', confidence: 0 };

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const [topEnv, topScore] = sorted[0];
  const confidence = Math.min(topScore / Math.max(totalWeight, 1), 1);

  return {
    environment: topEnv as 'production' | 'staging' | 'development',
    confidence,
  };
}

/**
 * Analyze environment variable declarations and references
 */
export function analyzeEnvVars(
  envFiles: Array<{ path: string; content: string }>,
  codeFiles: Array<{ path: string; content: string }>
): EnvVarAnalysis {
  const declared = new Map<string, EnvVarInfo>();
  const referenced = new Map<string, EnvVarInfo>();

  // Parse env files
  for (const file of envFiles) {
    const lines = file.content.split('\n');
    for (const line of lines) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
      if (match) {
        const [, name, value] = match;
        declared.set(name, {
          name,
          hasValue: value.trim().length > 0,
          isSecret: isSecretVarName(name),
          source: file.path,
          usedIn: [],
        });
      }
    }
  }

  // Find references in code
  const envPatterns = [
    /process\.env\.([A-Z_][A-Z0-9_]*)/g,
    /import\.meta\.env\.([A-Z_][A-Z0-9_]*)/g,
    /Deno\.env\.get\(['"`]([A-Z_][A-Z0-9_]*)['"`]\)/g,
    /os\.environ\[['"`]([A-Z_][A-Z0-9_]*)['"`]\]/g,
    /ENV\[['"`]([A-Z_][A-Z0-9_]*)['"`]\]/g,
  ];

  for (const file of codeFiles) {
    for (const pattern of envPatterns) {
      const regex = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = regex.exec(file.content)) !== null) {
        const name = match[1];
        if (!referenced.has(name)) {
          referenced.set(name, {
            name,
            hasValue: declared.has(name),
            isSecret: isSecretVarName(name),
            source: 'code',
            usedIn: [file.path],
          });
        } else {
          referenced.get(name)!.usedIn.push(file.path);
        }
      }
    }
  }

  const missingButReferenced = Array.from(referenced.keys()).filter(k => !declared.has(k));
  const unusedButDeclared = Array.from(declared.keys()).filter(k => !referenced.has(k));
  const sensitiveInCode = Array.from(referenced.values())
    .filter(v => v.isSecret)
    .map(v => v.name);

  return {
    declared: Array.from(declared.values()),
    referenced: Array.from(referenced.values()),
    missingButReferenced,
    unusedButDeclared,
    sensitiveInCode,
    totalDeclared: declared.size,
    totalReferenced: referenced.size,
  };
}

/**
 * Map the deployment topology from config and code analysis
 */
export function mapTopology(
  configFiles: ConfigFileInfo[],
  envVars: EnvVarAnalysis,
): DeploymentTopology {
  const databases: DatabaseInfo[] = [];
  const caches: CacheInfo[] = [];
  const queues: QueueInfo[] = [];
  const externalAPIs: ExternalAPIInfo[] = [];

  for (const envVar of [...envVars.declared, ...envVars.referenced]) {
    const name = envVar.name.toUpperCase();

    // Database detection
    if (/DATABASE_URL|DB_HOST|POSTGRES|MYSQL|MONGO|SUPABASE_URL/.test(name)) {
      databases.push({
        type: name.includes('MONGO') ? 'mongodb' : name.includes('MYSQL') ? 'mysql' : 'postgresql',
        connectionVar: envVar.name,
        isManaged: /SUPABASE|PLANETSCALE|NEON|TURSO/.test(name),
      });
    }

    // Cache detection
    if (/REDIS|MEMCACHED|CACHE/.test(name) && /URL|HOST/.test(name)) {
      caches.push({ type: name.includes('REDIS') ? 'redis' : 'memcached', connectionVar: envVar.name });
    }

    // Queue detection
    if (/RABBITMQ|AMQP|SQS|QUEUE/.test(name)) {
      queues.push({ type: name.includes('SQS') ? 'sqs' : 'rabbitmq', connectionVar: envVar.name });
    }

    // External API detection
    if (/API_KEY|API_SECRET|ACCESS_TOKEN/.test(name) && !/_URL$/.test(name)) {
      const apiName = name.replace(/_(API_KEY|API_SECRET|ACCESS_TOKEN|KEY|SECRET)$/, '');
      externalAPIs.push({ name: apiName, baseUrlVar: null, keyVar: envVar.name });
    }
  }

  const type: DeploymentTopology['type'] = 
    databases.length > 1 || externalAPIs.length > 3 ? 'microservices' :
    configFiles.some(f => f.path.includes('serverless') || f.path.includes('lambda')) ? 'serverless' :
    configFiles.some(f => f.path.includes('vercel') || f.path.includes('netlify')) ? 'jamstack' :
    'monolith';

  return {
    type,
    services: [],
    databases,
    caches,
    queues,
    externalAPIs,
  };
}

function isSecretVarName(name: string): boolean {
  return /SECRET|KEY|TOKEN|PASSWORD|PRIVATE|CREDENTIAL|AUTH/.test(name.toUpperCase());
}

function maskSecret(value: string): string {
  if (value.length <= 8) return '***';
  return value.slice(0, 4) + '***' + value.slice(-4);
}
