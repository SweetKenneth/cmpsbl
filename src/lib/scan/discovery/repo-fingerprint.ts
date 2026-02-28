/**
 * #1 — Repo Fingerprinting Engine
 * 15 initial API calls to detect framework, package manager, ORM, auth provider,
 * CI/CD, deployment target, and DB type before any audit logic runs.
 */

export interface RepoFingerprint {
  framework: FrameworkDetection;
  packageManager: PackageManagerDetection;
  orm: ORMDetection;
  authProvider: AuthProviderDetection;
  cicd: CICDDetection;
  deploymentTarget: DeploymentDetection;
  databaseType: DatabaseDetection;
  language: LanguageDetection;
  testFramework: TestFrameworkDetection;
  bundler: BundlerDetection;
  cssFramework: CSSDetection;
  apiStyle: APIStyleDetection;
  containerization: ContainerDetection;
  monorepo: MonorepoDetection;
  stateManagement: StateManagementDetection;
  scanTimestamp: string;
  confidence: number;
}

interface DetectionResult {
  detected: boolean;
  name: string | null;
  version: string | null;
  confidence: number;
  evidence: string[];
}

type FrameworkDetection = DetectionResult & { type: 'frontend' | 'backend' | 'fullstack' | 'unknown' };
type PackageManagerDetection = DetectionResult;
type ORMDetection = DetectionResult;
type AuthProviderDetection = DetectionResult & { method: 'oauth' | 'jwt' | 'session' | 'api_key' | 'unknown' };
type CICDDetection = DetectionResult & { provider: string | null };
type DeploymentDetection = DetectionResult & { platform: string | null };
type DatabaseDetection = DetectionResult & { engine: string | null; managed: boolean };
type LanguageDetection = DetectionResult & { primary: string | null; secondary: string[] };
type TestFrameworkDetection = DetectionResult;
type BundlerDetection = DetectionResult;
type CSSDetection = DetectionResult;
type APIStyleDetection = DetectionResult & { style: 'rest' | 'graphql' | 'grpc' | 'trpc' | 'unknown' };
type ContainerDetection = DetectionResult;
type MonorepoDetection = DetectionResult & { tool: string | null };
type StateManagementDetection = DetectionResult;

// Framework signatures mapped to file indicators
const FRAMEWORK_SIGNATURES: Record<string, { files: string[]; deps: string[]; type: 'frontend' | 'backend' | 'fullstack' }> = {
  'Next.js': { files: ['next.config.js', 'next.config.mjs', 'next.config.ts'], deps: ['next'], type: 'fullstack' },
  'React': { files: ['src/App.tsx', 'src/App.jsx', 'src/index.tsx'], deps: ['react', 'react-dom'], type: 'frontend' },
  'Vue': { files: ['vue.config.js', 'src/App.vue'], deps: ['vue'], type: 'frontend' },
  'Svelte': { files: ['svelte.config.js'], deps: ['svelte'], type: 'frontend' },
  'SvelteKit': { files: ['svelte.config.js', 'src/routes'], deps: ['@sveltejs/kit'], type: 'fullstack' },
  'Angular': { files: ['angular.json', 'src/app/app.module.ts'], deps: ['@angular/core'], type: 'frontend' },
  'Nuxt': { files: ['nuxt.config.ts', 'nuxt.config.js'], deps: ['nuxt'], type: 'fullstack' },
  'Remix': { files: ['remix.config.js'], deps: ['@remix-run/react'], type: 'fullstack' },
  'Astro': { files: ['astro.config.mjs'], deps: ['astro'], type: 'fullstack' },
  'Express': { files: ['server.js', 'app.js'], deps: ['express'], type: 'backend' },
  'Fastify': { files: [], deps: ['fastify'], type: 'backend' },
  'NestJS': { files: ['nest-cli.json'], deps: ['@nestjs/core'], type: 'backend' },
  'Django': { files: ['manage.py', 'settings.py'], deps: [], type: 'backend' },
  'Rails': { files: ['Gemfile', 'config/routes.rb'], deps: [], type: 'backend' },
  'Laravel': { files: ['artisan', 'composer.json'], deps: [], type: 'backend' },
  'Flask': { files: ['app.py', 'wsgi.py'], deps: [], type: 'backend' },
  'FastAPI': { files: ['main.py'], deps: [], type: 'backend' },
  'Go Fiber': { files: ['go.mod', 'main.go'], deps: [], type: 'backend' },
};

const ORM_SIGNATURES: Record<string, { deps: string[]; files: string[] }> = {
  'Prisma': { deps: ['prisma', '@prisma/client'], files: ['prisma/schema.prisma'] },
  'Drizzle': { deps: ['drizzle-orm'], files: ['drizzle.config.ts'] },
  'TypeORM': { deps: ['typeorm'], files: ['ormconfig.json'] },
  'Sequelize': { deps: ['sequelize'], files: ['.sequelizerc'] },
  'Mongoose': { deps: ['mongoose'], files: [] },
  'Knex': { deps: ['knex'], files: ['knexfile.js'] },
  'SQLAlchemy': { deps: [], files: ['alembic.ini'] },
  'ActiveRecord': { deps: [], files: ['db/schema.rb'] },
  'Eloquent': { deps: [], files: ['database/migrations'] },
};

const AUTH_SIGNATURES: Record<string, { deps: string[]; files: string[]; method: 'oauth' | 'jwt' | 'session' | 'api_key' }> = {
  'Supabase Auth': { deps: ['@supabase/supabase-js'], files: [], method: 'jwt' },
  'NextAuth': { deps: ['next-auth'], files: ['pages/api/auth/[...nextauth].ts'], method: 'oauth' },
  'Auth0': { deps: ['@auth0/auth0-react', '@auth0/nextjs-auth0'], files: [], method: 'oauth' },
  'Clerk': { deps: ['@clerk/nextjs', '@clerk/clerk-react'], files: [], method: 'oauth' },
  'Firebase Auth': { deps: ['firebase'], files: [], method: 'jwt' },
  'Passport': { deps: ['passport'], files: [], method: 'session' },
  'Devise': { deps: [], files: ['config/initializers/devise.rb'], method: 'session' },
  'Lucia': { deps: ['lucia'], files: [], method: 'session' },
};

const DB_SIGNATURES: Record<string, { indicators: string[]; engine: string; managed: boolean }> = {
  'PostgreSQL': { indicators: ['postgres', 'pg', 'psql', 'DATABASE_URL.*postgres'], engine: 'postgresql', managed: false },
  'MySQL': { indicators: ['mysql', 'mysql2', 'DATABASE_URL.*mysql'], engine: 'mysql', managed: false },
  'MongoDB': { indicators: ['mongoose', 'mongodb', 'MONGODB_URI'], engine: 'mongodb', managed: false },
  'SQLite': { indicators: ['better-sqlite3', 'sqlite3', 'sql.js'], engine: 'sqlite', managed: false },
  'Supabase': { indicators: ['@supabase/supabase-js', 'SUPABASE_URL'], engine: 'postgresql', managed: true },
  'PlanetScale': { indicators: ['@planetscale/database'], engine: 'mysql', managed: true },
  'Neon': { indicators: ['@neondatabase/serverless'], engine: 'postgresql', managed: true },
  'Turso': { indicators: ['@libsql/client'], engine: 'sqlite', managed: true },
  'Firebase Firestore': { indicators: ['firebase/firestore'], engine: 'nosql', managed: true },
  'DynamoDB': { indicators: ['@aws-sdk/client-dynamodb'], engine: 'nosql', managed: true },
};

export function createRepoFingerprint(): RepoFingerprint {
  return {
    framework: { detected: false, name: null, version: null, confidence: 0, evidence: [], type: 'unknown' },
    packageManager: { detected: false, name: null, version: null, confidence: 0, evidence: [] },
    orm: { detected: false, name: null, version: null, confidence: 0, evidence: [] },
    authProvider: { detected: false, name: null, version: null, confidence: 0, evidence: [], method: 'unknown' },
    cicd: { detected: false, name: null, version: null, confidence: 0, evidence: [], provider: null },
    deploymentTarget: { detected: false, name: null, version: null, confidence: 0, evidence: [], platform: null },
    databaseType: { detected: false, name: null, version: null, confidence: 0, evidence: [], engine: null, managed: false },
    language: { detected: false, name: null, version: null, confidence: 0, evidence: [], primary: null, secondary: [] },
    testFramework: { detected: false, name: null, version: null, confidence: 0, evidence: [] },
    bundler: { detected: false, name: null, version: null, confidence: 0, evidence: [] },
    cssFramework: { detected: false, name: null, version: null, confidence: 0, evidence: [] },
    apiStyle: { detected: false, name: null, version: null, confidence: 0, evidence: [], style: 'unknown' },
    containerization: { detected: false, name: null, version: null, confidence: 0, evidence: [] },
    monorepo: { detected: false, name: null, version: null, confidence: 0, evidence: [], tool: null },
    stateManagement: { detected: false, name: null, version: null, confidence: 0, evidence: [] },
    scanTimestamp: new Date().toISOString(),
    confidence: 0,
  };
}

/**
 * Execute 15 fingerprinting probes against an unknown codebase
 */
export async function fingerprintRepo(
  probeFiles: (path: string) => Promise<boolean>,
  probeDeps: (name: string) => Promise<{ found: boolean; version?: string }>,
  probeContent: (path: string) => Promise<string | null>,
  probeDirectories: () => Promise<string[]>
): Promise<RepoFingerprint> {
  const fingerprint = createRepoFingerprint();
  const probeResults: Array<{ probe: string; result: unknown }> = [];

  // Probe 1: Framework detection
  const frameworkProbe = async () => {
    for (const [name, sig] of Object.entries(FRAMEWORK_SIGNATURES)) {
      const fileHits = await Promise.all(sig.files.map(f => probeFiles(f)));
      const depHits = await Promise.all(sig.deps.map(d => probeDeps(d)));
      
      const fileEvidence = sig.files.filter((_, i) => fileHits[i]);
      const depEvidence = sig.deps.filter((_, i) => depHits[i].found);
      const totalEvidence = [...fileEvidence, ...depEvidence];
      
      if (totalEvidence.length > 0) {
        const confidence = totalEvidence.length / (sig.files.length + sig.deps.length);
        if (confidence > (fingerprint.framework.confidence || 0)) {
          fingerprint.framework = {
            detected: true,
            name,
            version: depHits.find(d => d.found)?.version || null,
            confidence,
            evidence: totalEvidence,
            type: sig.type,
          };
        }
      }
    }
    probeResults.push({ probe: 'framework', result: fingerprint.framework });
  };

  // Probe 2: Package manager detection
  const packageManagerProbe = async () => {
    const managers = [
      { name: 'bun', files: ['bun.lockb', 'bunfig.toml'] },
      { name: 'pnpm', files: ['pnpm-lock.yaml', 'pnpm-workspace.yaml'] },
      { name: 'yarn', files: ['yarn.lock', '.yarnrc.yml'] },
      { name: 'npm', files: ['package-lock.json'] },
      { name: 'pip', files: ['requirements.txt', 'Pipfile', 'pyproject.toml'] },
      { name: 'cargo', files: ['Cargo.toml', 'Cargo.lock'] },
      { name: 'go modules', files: ['go.mod', 'go.sum'] },
      { name: 'composer', files: ['composer.json', 'composer.lock'] },
      { name: 'bundler', files: ['Gemfile', 'Gemfile.lock'] },
    ];

    for (const mgr of managers) {
      const hits = await Promise.all(mgr.files.map(f => probeFiles(f)));
      const evidence = mgr.files.filter((_, i) => hits[i]);
      if (evidence.length > 0) {
        fingerprint.packageManager = {
          detected: true,
          name: mgr.name,
          version: null,
          confidence: evidence.length / mgr.files.length,
          evidence,
        };
        break;
      }
    }
    probeResults.push({ probe: 'packageManager', result: fingerprint.packageManager });
  };

  // Probe 3: ORM detection
  const ormProbe = async () => {
    for (const [name, sig] of Object.entries(ORM_SIGNATURES)) {
      const fileHits = await Promise.all(sig.files.map(f => probeFiles(f)));
      const depHits = await Promise.all(sig.deps.map(d => probeDeps(d)));
      const evidence = [...sig.files.filter((_, i) => fileHits[i]), ...sig.deps.filter((_, i) => depHits[i].found)];
      
      if (evidence.length > 0) {
        fingerprint.orm = {
          detected: true,
          name,
          version: depHits.find(d => d.found)?.version || null,
          confidence: evidence.length / (sig.files.length + sig.deps.length),
          evidence,
        };
        break;
      }
    }
    probeResults.push({ probe: 'orm', result: fingerprint.orm });
  };

  // Probe 4: Auth provider detection
  const authProbe = async () => {
    for (const [name, sig] of Object.entries(AUTH_SIGNATURES)) {
      const fileHits = await Promise.all(sig.files.map(f => probeFiles(f)));
      const depHits = await Promise.all(sig.deps.map(d => probeDeps(d)));
      const evidence = [...sig.files.filter((_, i) => fileHits[i]), ...sig.deps.filter((_, i) => depHits[i].found)];
      
      if (evidence.length > 0) {
        fingerprint.authProvider = {
          detected: true,
          name,
          version: depHits.find(d => d.found)?.version || null,
          confidence: evidence.length / Math.max(sig.files.length + sig.deps.length, 1),
          evidence,
          method: sig.method,
        };
        break;
      }
    }
    probeResults.push({ probe: 'authProvider', result: fingerprint.authProvider });
  };

  // Probe 5: CI/CD detection
  const cicdProbe = async () => {
    const providers = [
      { name: 'GitHub Actions', files: ['.github/workflows'], provider: 'github' },
      { name: 'GitLab CI', files: ['.gitlab-ci.yml'], provider: 'gitlab' },
      { name: 'CircleCI', files: ['.circleci/config.yml'], provider: 'circleci' },
      { name: 'Vercel', files: ['vercel.json', '.vercel'], provider: 'vercel' },
      { name: 'Netlify', files: ['netlify.toml'], provider: 'netlify' },
      { name: 'Jenkins', files: ['Jenkinsfile'], provider: 'jenkins' },
      { name: 'Travis CI', files: ['.travis.yml'], provider: 'travis' },
    ];

    for (const ci of providers) {
      const hits = await Promise.all(ci.files.map(f => probeFiles(f)));
      const evidence = ci.files.filter((_, i) => hits[i]);
      if (evidence.length > 0) {
        fingerprint.cicd = {
          detected: true, name: ci.name, version: null,
          confidence: 0.9, evidence, provider: ci.provider,
        };
        break;
      }
    }
    probeResults.push({ probe: 'cicd', result: fingerprint.cicd });
  };

  // Probe 6: Deployment target
  const deploymentProbe = async () => {
    const targets = [
      { name: 'Vercel', files: ['vercel.json', '.vercel'], platform: 'vercel' },
      { name: 'Netlify', files: ['netlify.toml', '_redirects'], platform: 'netlify' },
      { name: 'Railway', files: ['railway.json', 'railway.toml'], platform: 'railway' },
      { name: 'Fly.io', files: ['fly.toml'], platform: 'fly' },
      { name: 'Render', files: ['render.yaml'], platform: 'render' },
      { name: 'AWS', files: ['serverless.yml', 'template.yaml', 'cdk.json'], platform: 'aws' },
      { name: 'GCP', files: ['app.yaml', 'cloudbuild.yaml'], platform: 'gcp' },
      { name: 'Azure', files: ['azure-pipelines.yml'], platform: 'azure' },
      { name: 'Heroku', files: ['Procfile', 'app.json'], platform: 'heroku' },
    ];

    for (const t of targets) {
      const hits = await Promise.all(t.files.map(f => probeFiles(f)));
      const evidence = t.files.filter((_, i) => hits[i]);
      if (evidence.length > 0) {
        fingerprint.deploymentTarget = {
          detected: true, name: t.name, version: null,
          confidence: 0.85, evidence, platform: t.platform,
        };
        break;
      }
    }
    probeResults.push({ probe: 'deployment', result: fingerprint.deploymentTarget });
  };

  // Probe 7: Database detection
  const dbProbe = async () => {
    for (const [name, sig] of Object.entries(DB_SIGNATURES)) {
      for (const indicator of sig.indicators) {
        const dep = await probeDeps(indicator);
        if (dep.found) {
          fingerprint.databaseType = {
            detected: true, name, version: dep.version || null,
            confidence: 0.9, evidence: [indicator],
            engine: sig.engine, managed: sig.managed,
          };
          break;
        }
      }
      if (fingerprint.databaseType.detected) break;
    }
    probeResults.push({ probe: 'database', result: fingerprint.databaseType });
  };

  // Probe 8: Primary language detection
  const languageProbe = async () => {
    const dirs = await probeDirectories();
    const extensions: Record<string, number> = {};
    for (const d of dirs) {
      const ext = d.split('.').pop()?.toLowerCase();
      if (ext) extensions[ext] = (extensions[ext] || 0) + 1;
    }
    
    const langMap: Record<string, string> = {
      ts: 'TypeScript', tsx: 'TypeScript', js: 'JavaScript', jsx: 'JavaScript',
      py: 'Python', rb: 'Ruby', go: 'Go', rs: 'Rust', java: 'Java',
      php: 'PHP', cs: 'C#', swift: 'Swift', kt: 'Kotlin',
    };
    
    const sorted = Object.entries(extensions)
      .filter(([ext]) => langMap[ext])
      .sort(([, a], [, b]) => b - a);
    
    if (sorted.length > 0) {
      fingerprint.language = {
        detected: true, name: langMap[sorted[0][0]], version: null,
        confidence: 0.95, evidence: sorted.map(([ext, count]) => `${ext}: ${count} files`),
        primary: langMap[sorted[0][0]],
        secondary: sorted.slice(1).map(([ext]) => langMap[ext]).filter(Boolean),
      };
    }
    probeResults.push({ probe: 'language', result: fingerprint.language });
  };

  // Probe 9: Test framework
  const testProbe = async () => {
    const frameworks = [
      { name: 'Vitest', deps: ['vitest'], files: ['vitest.config.ts'] },
      { name: 'Jest', deps: ['jest'], files: ['jest.config.js', 'jest.config.ts'] },
      { name: 'Playwright', deps: ['@playwright/test'], files: ['playwright.config.ts'] },
      { name: 'Cypress', deps: ['cypress'], files: ['cypress.config.ts'] },
      { name: 'Mocha', deps: ['mocha'], files: ['.mocharc.yml'] },
      { name: 'pytest', deps: [], files: ['pytest.ini', 'conftest.py'] },
      { name: 'RSpec', deps: [], files: ['spec/spec_helper.rb'] },
    ];

    for (const fw of frameworks) {
      const fileHits = await Promise.all(fw.files.map(f => probeFiles(f)));
      const depHits = await Promise.all(fw.deps.map(d => probeDeps(d)));
      const evidence = [...fw.files.filter((_, i) => fileHits[i]), ...fw.deps.filter((_, i) => depHits[i].found)];
      if (evidence.length > 0) {
        fingerprint.testFramework = { detected: true, name: fw.name, version: null, confidence: 0.9, evidence };
        break;
      }
    }
    probeResults.push({ probe: 'testFramework', result: fingerprint.testFramework });
  };

  // Probe 10: Bundler
  const bundlerProbe = async () => {
    const bundlers = [
      { name: 'Vite', deps: ['vite'], files: ['vite.config.ts', 'vite.config.js'] },
      { name: 'Webpack', deps: ['webpack'], files: ['webpack.config.js'] },
      { name: 'esbuild', deps: ['esbuild'], files: [] },
      { name: 'Rollup', deps: ['rollup'], files: ['rollup.config.js'] },
      { name: 'Turbopack', deps: [], files: [] },
      { name: 'Parcel', deps: ['parcel'], files: ['.parcelrc'] },
    ];

    for (const b of bundlers) {
      const fileHits = await Promise.all(b.files.map(f => probeFiles(f)));
      const depHits = await Promise.all(b.deps.map(d => probeDeps(d)));
      const evidence = [...b.files.filter((_, i) => fileHits[i]), ...b.deps.filter((_, i) => depHits[i].found)];
      if (evidence.length > 0) {
        fingerprint.bundler = { detected: true, name: b.name, version: null, confidence: 0.9, evidence };
        break;
      }
    }
    probeResults.push({ probe: 'bundler', result: fingerprint.bundler });
  };

  // Probe 11: CSS framework
  const cssProbe = async () => {
    const frameworks = [
      { name: 'Tailwind CSS', deps: ['tailwindcss'], files: ['tailwind.config.ts', 'tailwind.config.js'] },
      { name: 'Styled Components', deps: ['styled-components'], files: [] },
      { name: 'Emotion', deps: ['@emotion/react'], files: [] },
      { name: 'CSS Modules', deps: [], files: [] },
      { name: 'Sass', deps: ['sass'], files: [] },
      { name: 'Bootstrap', deps: ['bootstrap', 'react-bootstrap'], files: [] },
      { name: 'Material UI', deps: ['@mui/material'], files: [] },
      { name: 'Chakra UI', deps: ['@chakra-ui/react'], files: [] },
    ];

    for (const css of frameworks) {
      const depHits = await Promise.all(css.deps.map(d => probeDeps(d)));
      const fileHits = await Promise.all(css.files.map(f => probeFiles(f)));
      const evidence = [...css.deps.filter((_, i) => depHits[i].found), ...css.files.filter((_, i) => fileHits[i])];
      if (evidence.length > 0) {
        fingerprint.cssFramework = { detected: true, name: css.name, version: null, confidence: 0.9, evidence };
        break;
      }
    }
    probeResults.push({ probe: 'css', result: fingerprint.cssFramework });
  };

  // Probe 12: API style
  const apiStyleProbe = async () => {
    const styles: Array<{ name: string; style: 'rest' | 'graphql' | 'grpc' | 'trpc'; deps: string[]; files: string[] }> = [
      { name: 'tRPC', style: 'trpc', deps: ['@trpc/server'], files: [] },
      { name: 'GraphQL', style: 'graphql', deps: ['graphql', '@apollo/server', 'type-graphql'], files: ['schema.graphql'] },
      { name: 'gRPC', style: 'grpc', deps: ['@grpc/grpc-js'], files: [] },
      { name: 'REST', style: 'rest', deps: ['express', 'fastify', '@nestjs/core'], files: [] },
    ];

    for (const s of styles) {
      const depHits = await Promise.all(s.deps.map(d => probeDeps(d)));
      const fileHits = await Promise.all(s.files.map(f => probeFiles(f)));
      const evidence = [...s.deps.filter((_, i) => depHits[i].found), ...s.files.filter((_, i) => fileHits[i])];
      if (evidence.length > 0) {
        fingerprint.apiStyle = { detected: true, name: s.name, version: null, confidence: 0.85, evidence, style: s.style };
        break;
      }
    }
    probeResults.push({ probe: 'apiStyle', result: fingerprint.apiStyle });
  };

  // Probe 13: Containerization
  const containerProbe = async () => {
    const containers = [
      { name: 'Docker', files: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml', '.dockerignore'] },
      { name: 'Podman', files: ['Containerfile'] },
      { name: 'Kubernetes', files: ['k8s/', 'kubernetes/', 'helm/'] },
    ];

    for (const c of containers) {
      const hits = await Promise.all(c.files.map(f => probeFiles(f)));
      const evidence = c.files.filter((_, i) => hits[i]);
      if (evidence.length > 0) {
        fingerprint.containerization = { detected: true, name: c.name, version: null, confidence: 0.9, evidence };
        break;
      }
    }
    probeResults.push({ probe: 'container', result: fingerprint.containerization });
  };

  // Probe 14: Monorepo detection
  const monorepoProbe = async () => {
    const tools = [
      { name: 'Turborepo', tool: 'turborepo', files: ['turbo.json'] },
      { name: 'Nx', tool: 'nx', files: ['nx.json'] },
      { name: 'Lerna', tool: 'lerna', files: ['lerna.json'] },
      { name: 'pnpm Workspace', tool: 'pnpm', files: ['pnpm-workspace.yaml'] },
      { name: 'Yarn Workspaces', tool: 'yarn', files: [] },
    ];

    for (const m of tools) {
      const hits = await Promise.all(m.files.map(f => probeFiles(f)));
      const evidence = m.files.filter((_, i) => hits[i]);
      if (evidence.length > 0) {
        fingerprint.monorepo = { detected: true, name: m.name, version: null, confidence: 0.9, evidence, tool: m.tool };
        break;
      }
    }
    probeResults.push({ probe: 'monorepo', result: fingerprint.monorepo });
  };

  // Probe 15: State management
  const stateProbe = async () => {
    const managers = [
      { name: 'Zustand', deps: ['zustand'] },
      { name: 'Redux', deps: ['@reduxjs/toolkit', 'redux'] },
      { name: 'Jotai', deps: ['jotai'] },
      { name: 'Recoil', deps: ['recoil'] },
      { name: 'MobX', deps: ['mobx'] },
      { name: 'Pinia', deps: ['pinia'] },
      { name: 'Vuex', deps: ['vuex'] },
      { name: 'XState', deps: ['xstate'] },
      { name: 'TanStack Query', deps: ['@tanstack/react-query'] },
    ];

    for (const sm of managers) {
      const depHits = await Promise.all(sm.deps.map(d => probeDeps(d)));
      const evidence = sm.deps.filter((_, i) => depHits[i].found);
      if (evidence.length > 0) {
        fingerprint.stateManagement = { detected: true, name: sm.name, version: null, confidence: 0.9, evidence };
        break;
      }
    }
    probeResults.push({ probe: 'stateManagement', result: fingerprint.stateManagement });
  };

  // Execute all 15 probes in parallel
  await Promise.allSettled([
    frameworkProbe(), packageManagerProbe(), ormProbe(), authProbe(),
    cicdProbe(), deploymentProbe(), dbProbe(), languageProbe(),
    testProbe(), bundlerProbe(), cssProbe(), apiStyleProbe(),
    containerProbe(), monorepoProbe(), stateProbe(),
  ]);

  // Calculate overall confidence
  const detections = [
    fingerprint.framework, fingerprint.packageManager, fingerprint.orm,
    fingerprint.authProvider, fingerprint.cicd, fingerprint.deploymentTarget,
    fingerprint.databaseType, fingerprint.language, fingerprint.testFramework,
    fingerprint.bundler, fingerprint.cssFramework, fingerprint.apiStyle,
    fingerprint.containerization, fingerprint.monorepo, fingerprint.stateManagement,
  ];
  
  const detected = detections.filter(d => d.detected);
  fingerprint.confidence = detected.length > 0
    ? detected.reduce((sum, d) => sum + d.confidence, 0) / detections.length
    : 0;

  return fingerprint;
}
