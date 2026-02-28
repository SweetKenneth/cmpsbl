/**
 * #13 — Secret Exposure Scanner
 * Scan git history, build artifacts, client bundles, and error pages
 * for leaked API keys, tokens, connection strings, and credentials.
 */

export interface SecretExposureReport {
  exposures: SecretExposure[];
  gitHistoryRisks: GitHistoryRisk[];
  clientBundleLeaks: ClientBundleLeak[];
  configFileLeaks: ConfigFileLeak[];
  totalExposures: number;
  criticalCount: number;
  riskScore: number;
  recommendations: string[];
  scanTimestamp: string;
}

export interface SecretExposure {
  id: string;
  type: 'api_key' | 'token' | 'password' | 'connection_string' | 'private_key' | 'certificate' | 'webhook_url';
  provider: string;
  severity: 'critical' | 'high' | 'medium';
  file: string;
  line: number | null;
  preview: string;
  inGitHistory: boolean;
  inClientBundle: boolean;
  recommendation: string;
}

export interface GitHistoryRisk {
  file: string;
  issue: string;
  severity: 'critical' | 'high';
}

export interface ClientBundleLeak {
  variable: string;
  file: string;
  isPublishableKey: boolean;
  recommendation: string;
}

export interface ConfigFileLeak {
  file: string;
  issue: string;
  severity: 'critical' | 'high' | 'medium';
}

// Provider-specific API key patterns with named identification
const PROVIDER_PATTERNS: Array<{
  provider: string;
  type: SecretExposure['type'];
  patterns: RegExp[];
  severity: SecretExposure['severity'];
  isPublishable: boolean;
}> = [
  { provider: 'AWS', type: 'api_key', patterns: [/(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}/], severity: 'critical', isPublishable: false },
  { provider: 'AWS', type: 'api_key', patterns: [/aws_secret_access_key\s*=\s*[A-Za-z0-9/+=]{40}/i], severity: 'critical', isPublishable: false },
  { provider: 'Google Cloud', type: 'api_key', patterns: [/AIza[0-9A-Za-z\-_]{35}/], severity: 'high', isPublishable: false },
  { provider: 'Google', type: 'private_key', patterns: [/"private_key"\s*:\s*"-----BEGIN/], severity: 'critical', isPublishable: false },
  { provider: 'Stripe', type: 'api_key', patterns: [/sk_live_[a-zA-Z0-9]{24,}/], severity: 'critical', isPublishable: false },
  { provider: 'Stripe', type: 'api_key', patterns: [/sk_test_[a-zA-Z0-9]{24,}/], severity: 'high', isPublishable: false },
  { provider: 'Stripe', type: 'api_key', patterns: [/pk_(?:live|test)_[a-zA-Z0-9]{24,}/], severity: 'medium', isPublishable: true },
  { provider: 'GitHub', type: 'token', patterns: [/ghp_[a-zA-Z0-9]{36}/, /github_pat_[a-zA-Z0-9]{22}_[a-zA-Z0-9]{59}/], severity: 'critical', isPublishable: false },
  { provider: 'GitLab', type: 'token', patterns: [/glpat-[a-zA-Z0-9\-_]{20,}/], severity: 'critical', isPublishable: false },
  { provider: 'Slack', type: 'token', patterns: [/xox[baps]-[0-9A-Za-z\-]{10,}/], severity: 'critical', isPublishable: false },
  { provider: 'OpenAI', type: 'api_key', patterns: [/sk-[a-zA-Z0-9]{20,}/], severity: 'critical', isPublishable: false },
  { provider: 'Anthropic', type: 'api_key', patterns: [/sk-ant-[a-zA-Z0-9\-_]{20,}/], severity: 'critical', isPublishable: false },
  { provider: 'Supabase', type: 'api_key', patterns: [/sbp_[a-f0-9]{40}/], severity: 'critical', isPublishable: false },
  { provider: 'Supabase', type: 'api_key', patterns: [/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9\.[a-zA-Z0-9\-_]+\.[a-zA-Z0-9\-_]+/], severity: 'medium', isPublishable: true },
  { provider: 'Firebase', type: 'api_key', patterns: [/AIza[0-9A-Za-z\-_]{35}/], severity: 'medium', isPublishable: true },
  { provider: 'SendGrid', type: 'api_key', patterns: [/SG\.[a-zA-Z0-9\-_]{22}\.[a-zA-Z0-9\-_]{43}/], severity: 'critical', isPublishable: false },
  { provider: 'Twilio', type: 'api_key', patterns: [/SK[a-f0-9]{32}/], severity: 'critical', isPublishable: false },
  { provider: 'Mailgun', type: 'api_key', patterns: [/key-[a-f0-9]{32}/], severity: 'critical', isPublishable: false },
  { provider: 'Heroku', type: 'api_key', patterns: [/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/], severity: 'high', isPublishable: false },
  { provider: 'Discord', type: 'token', patterns: [/[MN][A-Za-z\d]{23,}\.[\w-]{6}\.[\w-]{27}/], severity: 'critical', isPublishable: false },
  { provider: 'NPM', type: 'token', patterns: [/npm_[a-zA-Z0-9]{36}/], severity: 'critical', isPublishable: false },
  { provider: 'Generic', type: 'private_key', patterns: [/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/], severity: 'critical', isPublishable: false },
  { provider: 'Generic', type: 'connection_string', patterns: [/(?:postgres|mysql|mongodb(?:\+srv)?):\/\/[^\s'"]{10,}/], severity: 'critical', isPublishable: false },
];

// Files that should never contain secrets
const RISKY_FILE_PATTERNS = [
  /\.tsx?$/, /\.jsx?$/, /\.vue$/, /\.svelte$/,
  /\.html?$/, /\.css$/, /\.scss$/,
  /\.json$/, /\.ya?ml$/, /\.toml$/,
  /Dockerfile/, /docker-compose/,
  /\.md$/, /README/i,
];

// Files that legitimately might contain keys (but should still be checked)
const EXPECTED_SECRET_LOCATIONS = [
  /\.env(?:\..+)?$/,
  /config\/secrets/,
  /credentials/,
];

/**
 * Scan for exposed secrets across all file types
 */
export function scanForSecretExposures(
  files: Array<{ path: string; content: string }>,
  gitIgnoreContent: string | null,
): SecretExposureReport {
  const exposures: SecretExposure[] = [];
  const clientBundleLeaks: ClientBundleLeak[] = [];
  const configFileLeaks: ConfigFileLeak[] = [];
  const gitHistoryRisks: GitHistoryRisk[] = [];
  const recommendations: string[] = [];

  // Check if .env is gitignored
  if (gitIgnoreContent && !gitIgnoreContent.includes('.env')) {
    gitHistoryRisks.push({
      file: '.gitignore',
      issue: '.env file is not in .gitignore — secrets may be committed to git history',
      severity: 'critical',
    });
    recommendations.push('Add .env to .gitignore immediately and rotate any committed secrets');
  }

  for (const file of files) {
    // Skip node_modules, lock files, and binary-like files
    if (/node_modules|\.lock$|\.min\.|dist\/|build\/|\.map$|\.wasm$|\.png|\.jpg|\.gif/i.test(file.path)) continue;

    const isClientFile = /src\/|public\/|pages\/|app\/|components\//i.test(file.path);
    const isConfigFile = EXPECTED_SECRET_LOCATIONS.some(p => p.test(file.path));
    const lines = file.content.split('\n');

    for (let lineNum = 0; lineNum < lines.length; lineNum++) {
      const line = lines[lineNum];
      
      // Skip comments
      if (/^\s*(?:\/\/|#|\/\*|\*)/.test(line)) continue;
      // Skip test mocks
      if (/mock|fake|dummy|example|placeholder|your[-_]?key|xxx+|TODO/i.test(line)) continue;

      for (const provider of PROVIDER_PATTERNS) {
        for (const pattern of provider.patterns) {
          if (pattern.test(line)) {
            const match = line.match(pattern);
            if (!match) continue;

            // Skip publishable keys in expected locations
            if (provider.isPublishable && (isConfigFile || /VITE_|NEXT_PUBLIC_|REACT_APP_/i.test(line))) continue;

            exposures.push({
              id: `exp-${exposures.length}`,
              type: provider.type,
              provider: provider.provider,
              severity: provider.severity,
              file: file.path,
              line: lineNum + 1,
              preview: maskSecretPreview(match[0]),
              inGitHistory: !isConfigFile,
              inClientBundle: isClientFile && !provider.isPublishable,
              recommendation: provider.isPublishable
                ? 'Publishable key detected — ensure it is only used client-side and has appropriate restrictions'
                : `Move ${provider.provider} secret to environment variable. Rotate this key immediately if committed.`,
            });

            // Client bundle leak check
            if (isClientFile && !provider.isPublishable) {
              clientBundleLeaks.push({
                variable: match[0].slice(0, 10) + '...',
                file: file.path,
                isPublishableKey: false,
                recommendation: `Secret ${provider.provider} key found in client-accessible code. This will be exposed in the browser bundle.`,
              });
            }
          }
        }
      }
    }

    // Config file checks
    if (isConfigFile) {
      if (!/.env/.test(file.path) && /password|secret|key|token/i.test(file.content)) {
        const hasPlaceholders = /\{\{|\$\{|<your|TODO|REPLACE/i.test(file.content);
        if (!hasPlaceholders) {
          configFileLeaks.push({
            file: file.path,
            issue: 'Config file contains potential secrets without placeholder markers',
            severity: 'high',
          });
        }
      }
    }
  }

  // Summary recommendations
  const criticalCount = exposures.filter(e => e.severity === 'critical').length;
  if (criticalCount > 0) {
    recommendations.push(`${criticalCount} critical secret(s) detected — rotate all affected credentials immediately`);
  }
  if (clientBundleLeaks.length > 0) {
    recommendations.push(`${clientBundleLeaks.length} secret(s) in client-accessible code — move to server-side environment variables`);
  }

  const riskScore = Math.min(100,
    criticalCount * 30 +
    exposures.filter(e => e.severity === 'high').length * 15 +
    clientBundleLeaks.length * 20 +
    gitHistoryRisks.length * 25
  );

  return {
    exposures,
    gitHistoryRisks,
    clientBundleLeaks,
    configFileLeaks,
    totalExposures: exposures.length,
    criticalCount,
    riskScore,
    recommendations,
    scanTimestamp: new Date().toISOString(),
  };
}

function maskSecretPreview(secret: string): string {
  if (secret.length <= 10) return '***';
  return secret.slice(0, 6) + '...' + secret.slice(-4);
}
