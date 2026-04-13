/**
 * Repository File Classifier — Smart classification engine for GitHub repo trees
 * Categorizes files as Core / Supporting / Skipped using path heuristics
 * Zero external AI — pure algorithmic classification
 */

export type FileCategory = 'core' | 'supporting' | 'skipped';

export interface ClassifiedFile {
  path: string;
  category: FileCategory;
  reason: string;
  size?: number;
  /** SHA for GitHub raw content fetch */
  sha?: string;
}

export interface RepoTree {
  owner: string;
  repo: string;
  branch: string;
  files: ClassifiedFile[];
}

/** Parse a GitHub URL into owner/repo */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const cleaned = url.trim().replace(/\/+$/, '').replace(/\.git$/, '');
  // https://github.com/owner/repo or github.com/owner/repo
  const match = cleaned.match(/(?:https?:\/\/)?github\.com\/([^/]+)\/([^/]+)/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

// ═══ SKIP PATTERNS ═══
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'out', '.next', '.nuxt',
  '__pycache__', '.cache', 'coverage', '.nyc_output', 'vendor',
  '.vscode', '.idea', '.github', '.husky', '.turbo', 'target',
  'Pods', '.dart_tool', '.pub-cache', 'venv', '.venv', 'env',
  '.tox', 'bower_components', 'jspm_packages', '.parcel-cache',
  '.svelte-kit', '.output', '.vercel', '.netlify', 'storybook-static',
]);

const SKIP_EXTENSIONS = new Set([
  '.lock', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.webp',
  '.woff', '.woff2', '.ttf', '.otf', '.eot',
  '.mp3', '.mp4', '.wav', '.ogg', '.webm', '.mov',
  '.zip', '.tar', '.gz', '.bz2', '.rar', '.7z',
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.pptx',
  '.exe', '.dll', '.so', '.dylib', '.o', '.a',
  '.bin', '.dat', '.db', '.sqlite', '.sqlite3',
  '.map', '.min.js', '.min.css',
  '.DS_Store', '.env', '.env.local', '.env.production',
]);

const SKIP_FILES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', 'bun.lock',
  'composer.lock', 'Gemfile.lock', 'Cargo.lock', 'poetry.lock',
  '.gitignore', '.gitattributes', '.editorconfig', '.prettierrc',
  '.eslintignore', '.npmignore', '.dockerignore', 'Thumbs.db',
  'LICENSE', 'LICENSE.md', 'LICENSE.txt', 'CHANGELOG.md',
  'CONTRIBUTING.md', 'CODE_OF_CONDUCT.md',
]);

const CONFIG_FILES = new Set([
  'package.json', 'tsconfig.json', 'vite.config.ts', 'vite.config.js',
  'webpack.config.js', 'webpack.config.ts', 'rollup.config.js',
  'babel.config.js', '.babelrc', 'jest.config.js', 'jest.config.ts',
  'vitest.config.ts', 'tailwind.config.js', 'tailwind.config.ts',
  'postcss.config.js', 'postcss.config.cjs', '.eslintrc.js', '.eslintrc.json',
  'eslint.config.js', 'eslint.config.mjs', 'Dockerfile', 'docker-compose.yml',
  'Makefile', 'CMakeLists.txt', 'Cargo.toml', 'pyproject.toml',
  'setup.py', 'setup.cfg', 'requirements.txt', 'Pipfile',
  'Gemfile', 'Rakefile', 'go.mod', 'go.sum',
  'pubspec.yaml', 'build.gradle', 'pom.xml', '.prettierrc.js',
]);

const SOURCE_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.jsx', '.py', '.rs', '.go', '.java',
  '.c', '.cpp', '.cc', '.cxx', '.h', '.hpp', '.cs',
  '.rb', '.swift', '.kt', '.kts', '.php', '.scala',
  '.lua', '.r', '.dart', '.ex', '.exs', '.erl', '.hrl',
  '.hs', '.ml', '.mli', '.clj', '.cljs', '.cljc',
  '.nim', '.cr', '.fs', '.fsx', '.groovy', '.gd',
  '.v', '.sv', '.vhd', '.vhdl', '.sol', '.vy', '.move', '.cairo',
  '.cu', '.glsl', '.hlsl', '.wgsl', '.metal',
  '.f90', '.f95', '.f03', '.f08', '.for',
  '.pl', '.pm', '.jl', '.zig', '.d',
]);

// Entry-point patterns → boost to Core
const ENTRY_PATTERNS = [
  /^src\/(main|index|app|server|boot)\.[^/]+$/i,
  /^(main|index|app|server)\.[^/]+$/i,
  /^src\/App\.(tsx|jsx|ts|js)$/,
  /^src\/pages\//,
  /^src\/routes\//,
  /^src\/api\//,
  /^app\//,
  /^pages\//,
  /^routes\//,
  /^controllers\//,
  /^handlers\//,
  /^models\//,
  /^services\//,
  /^src\/core\//,
  /^src\/lib\//,
  /^lib\//,
  /^cmd\//,
  /^pkg\//,
  /^internal\//,
];

// Monorepo / nested package patterns → treat inner source as core
const MONOREPO_CORE_PATTERNS = [
  // libs/package-name/src/...
  /^libs\/[^/]+\/src\//,
  // libs/package-name/package-name/... (Python convention)
  /^libs\/([^/]+)\/\1\//,
  // packages/name/src/...
  /^packages\/[^/]+\/src\//,
  // crates/name/src/...
  /^crates\/[^/]+\/src\//,
  // modules/name/src/...
  /^modules\/[^/]+\/src\//,
  // Python namespace packages: any dir containing __init__.py siblings
  // Handled separately in classifyFile
];

const SUPPORTING_PATTERNS = [
  /^src\/(utils|helpers|constants|types|hooks)\//,
  /^(utils|helpers|constants|types)\//,
  /^src\/components\/ui\//,
  /^src\/styles\//,
  /^middleware\//,
  /^src\/middleware\//,
  /^config\//,
  /^src\/config\//,
];

const TEST_PATTERNS = [
  /\.(test|spec|e2e|stories)\.[^/]+$/,
  /^(__tests__|tests|test|spec|specs)\//,
  /^src\/__tests__\//,
  /\.stories\./,
  /^cypress\//,
  /^e2e\//,
  /^__mocks__\//,
  /^fixtures\//,
];

function getExtension(path: string): string {
  const dot = path.lastIndexOf('.');
  return dot >= 0 ? path.slice(dot).toLowerCase() : '';
}

function getFileName(path: string): string {
  return path.split('/').pop() ?? path;
}

/** Classify a single file path (with optional sibling awareness for monorepos) */
export function classifyFile(path: string, size?: number, siblingPaths?: Set<string>): ClassifiedFile {
  const ext = getExtension(path);
  const name = getFileName(path);
  const parts = path.split('/');

  // Skip dirs
  for (const part of parts.slice(0, -1)) {
    if (SKIP_DIRS.has(part)) {
      return { path, category: 'skipped', reason: `In ${part}/`, size };
    }
  }

  // Skip files
  if (SKIP_FILES.has(name)) {
    return { path, category: 'skipped', reason: 'Lock/config file', size };
  }

  // Skip extensions
  if (SKIP_EXTENSIONS.has(ext)) {
    return { path, category: 'skipped', reason: `${ext} file`, size };
  }

  // Skip very large files (>500KB likely generated)
  if (size && size > 500_000) {
    return { path, category: 'skipped', reason: 'File too large (likely generated)', size };
  }

  // Test files
  if (TEST_PATTERNS.some(p => p.test(path))) {
    return { path, category: 'skipped', reason: 'Test/spec file', size };
  }

  // Non-source extensions
  if (!SOURCE_EXTENSIONS.has(ext) && ext !== '') {
    // Config files → supporting
    if (CONFIG_FILES.has(name)) {
      return { path, category: 'supporting', reason: 'Config file', size };
    }
    // README, docs
    if (name.toLowerCase().startsWith('readme') || ext === '.md') {
      return { path, category: 'skipped', reason: 'Documentation', size };
    }
    return { path, category: 'skipped', reason: `Non-source (${ext})`, size };
  }

  // Entry-point patterns → Core
  if (ENTRY_PATTERNS.some(p => p.test(path))) {
    return { path, category: 'core', reason: 'Entry point / core module', size };
  }

  // Monorepo patterns → Core (even if deeply nested)
  if (MONOREPO_CORE_PATTERNS.some(p => p.test(path))) {
    return { path, category: 'core', reason: 'Monorepo core module', size };
  }

  // Python package detection: if sibling __init__.py exists, this is a real package → core
  if (siblingPaths && SOURCE_EXTENSIONS.has(ext)) {
    const dir = parts.slice(0, -1).join('/');
    if (dir && siblingPaths.has(dir + '/__init__.py')) {
      return { path, category: 'core', reason: 'Python package module', size };
    }
  }

  // Supporting patterns
  if (SUPPORTING_PATTERNS.some(p => p.test(path))) {
    return { path, category: 'supporting', reason: 'Utility / helper', size };
  }

  // Source file — use relaxed depth for monorepos
  if (SOURCE_EXTENSIONS.has(ext)) {
    const depth = parts.length;
    if (depth <= 5) {
      return { path, category: 'core', reason: 'Source file', size };
    }
    return { path, category: 'supporting', reason: 'Deeply nested source file', size };
  }

  return { path, category: 'skipped', reason: 'Unknown type', size };
}

/** Classify an entire repo tree */
export function classifyRepoTree(
  files: { path: string; size?: number; sha?: string }[]
): ClassifiedFile[] {
  return files
    .filter(f => f.path) // Guard against empty paths
    .map(f => {
      const classified = classifyFile(f.path, f.size);
      classified.sha = f.sha;
      return classified;
    });
}

/** Fetch a GitHub repo's file tree (public repos only) */
export async function fetchGitHubTree(
  owner: string,
  repo: string,
  branch = 'main'
): Promise<{ path: string; size?: number; sha: string; type: string }[]> {
  // Try main first, fallback to master
  for (const b of branch === 'main' ? ['main', 'master'] : [branch]) {
    const url = `https://api.github.com/repos/${owner}/${repo}/git/trees/${b}?recursive=1`;
    const res = await fetch(url, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    });

    // Rate limit detection
    if (res.status === 403) {
      const resetHeader = res.headers.get('x-ratelimit-reset');
      const resetIn = resetHeader ? Math.ceil((Number(resetHeader) * 1000 - Date.now()) / 60000) : null;
      throw new Error(
        `GitHub API rate limit exceeded.${resetIn ? ` Resets in ~${resetIn} min.` : ''} ` +
        'Unauthenticated requests are limited to 60/hour. Try again later or use a smaller repository.'
      );
    }

    if (res.status === 404) continue;
    if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);

    const data = await res.json();
    if (!data.tree) throw new Error('Invalid GitHub response');

    // Handle truncated trees (repos with 100k+ files)
    if (data.truncated) {
      // eslint-disable-next-line no-console
      console.warn(`[RepoScanner] Tree truncated for ${owner}/${repo} — showing partial results`);
    }

    return data.tree
      .filter((node: { type: string }) => node.type === 'blob')
      .map((node: { path: string; size?: number; sha: string; type: string }) => ({
        path: node.path,
        size: node.size,
        sha: node.sha,
        type: node.type,
      }));
  }

  throw new Error('Repository not found or branch does not exist. Make sure the repository is public.');
}

/** Fetch raw file content from GitHub */
export async function fetchGitHubFileContent(
  owner: string,
  repo: string,
  sha: string,
): Promise<string> {
  const url = `https://api.github.com/repos/${owner}/${repo}/git/blobs/${sha}`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/vnd.github.v3+json' },
  });

  if (res.status === 403) {
    throw new Error('GitHub API rate limit hit while fetching file content. Try again later.');
  }
  if (!res.ok) throw new Error(`Failed to fetch file: ${res.status}`);

  const data = await res.json();
  // GitHub returns base64-encoded content — handle large files gracefully
  try {
    return atob(data.content.replace(/\n/g, ''));
  } catch {
    // Binary or oversized file — return placeholder
    return `// [Binary or non-decodable file — ${data.size ?? 'unknown'} bytes]`;
  }
}
