/**
 * CMPSBL® Interface Contract Extractor
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * For any candidate capability being evaluated for integration,
 * extracts the interface contract: what it expects as input,
 * what it produces as output, what it assumes about its environment.
 *
 * Also builds the target environment profile: data shapes, call graph
 * patterns, and runtime assumptions baked into the scanned codebase.
 *
 * Together these form the left and right sides of compatibility matching.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface InterfaceContract {
  /** Functions/methods exported or publicly accessible */
  exports: ExportedSymbol[];
  /** External dependencies (imports from packages) */
  dependencies: string[];
  /** Data shapes detected (interfaces, types, classes, structs) */
  dataShapes: DataShape[];
  /** Runtime assumptions (environment variables, globals, platform APIs) */
  runtimeAssumptions: string[];
  /** Error handling patterns detected */
  errorPatterns: ErrorPattern[];
  /** Async patterns (promises, callbacks, streams) */
  asyncPatterns: string[];
}

export interface ExportedSymbol {
  name: string;
  kind: 'function' | 'class' | 'constant' | 'type' | 'variable';
  paramCount: number;
  hasReturn: boolean;
  isAsync: boolean;
}

export interface DataShape {
  name: string;
  kind: 'interface' | 'type' | 'class' | 'struct' | 'enum' | 'schema';
  fieldCount: number;
  fields: string[];
}

export interface ErrorPattern {
  kind: 'try-catch' | 'error-return' | 'result-type' | 'callback-error' | 'panic' | 'raise';
  count: number;
}

export interface EnvironmentProfile {
  /** Detected primary language/ecosystem */
  ecosystem: string;
  /** Framework indicators found */
  frameworks: string[];
  /** Database/storage patterns detected */
  storagePatterns: string[];
  /** API style (REST, GraphQL, gRPC, WebSocket) */
  apiStyles: string[];
  /** Architectural patterns (MVC, microservice, monolith, serverless) */
  architecturalPatterns: string[];
  /** Dependency count and complexity estimate */
  dependencyComplexity: 'minimal' | 'moderate' | 'heavy';
  /** Code maturity signals */
  maturitySignals: MaturitySignal[];
}

export interface MaturitySignal {
  signal: string;
  present: boolean;
  category: 'testing' | 'documentation' | 'ci_cd' | 'monitoring' | 'security';
}

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — CONTRACT EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Extract the interface contract from a code sample.
 * Language-agnostic pattern matching for exports, shapes, and assumptions.
 */
export function extractContract(code: string): InterfaceContract {
  return {
    exports: extractExports(code),
    dependencies: extractDependencies(code),
    dataShapes: extractDataShapes(code),
    runtimeAssumptions: extractRuntimeAssumptions(code),
    errorPatterns: extractErrorPatterns(code),
    asyncPatterns: extractAsyncPatterns(code),
  };
}

function extractExports(code: string): ExportedSymbol[] {
  const exports: ExportedSymbol[] = [];
  const seen = new Set<string>();

  // JS/TS exports
  const jsExports = code.matchAll(
    /export\s+(?:default\s+)?(?:async\s+)?(?:function|const|let|class|type|interface)\s+(\w+)/g
  );
  for (const m of jsExports) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    const isAsync = /async/.test(m[0]);
    const kind = /function/.test(m[0]) ? 'function'
      : /class/.test(m[0]) ? 'class'
      : /type|interface/.test(m[0]) ? 'type'
      : /const|let/.test(m[0]) ? 'constant'
      : 'variable' as ExportedSymbol['kind'];
    // Count params for functions
    const paramMatch = code.match(new RegExp(`(?:function|const)\\s+${m[1]}\\s*[=]?\\s*\\(([^)]*)\\)`));
    const paramCount = paramMatch?.[1]?.split(',').filter(p => p.trim()).length ?? 0;
    exports.push({ name: m[1], kind, paramCount, hasReturn: kind === 'function', isAsync });
  }

  // Python exports (def at module level, class at module level)
  const pyDefs = code.matchAll(/^(?:async\s+)?def\s+(\w+)\s*\(([^)]*)\)/gm);
  for (const m of pyDefs) {
    if (seen.has(m[1]) || m[1].startsWith('_')) continue;
    seen.add(m[1]);
    const paramCount = m[2].split(',').filter(p => p.trim() && p.trim() !== 'self' && p.trim() !== 'cls').length;
    exports.push({
      name: m[1], kind: 'function', paramCount,
      hasReturn: true, isAsync: /async/.test(m[0]),
    });
  }

  // Go exports (capitalized functions)
  const goDefs = code.matchAll(/^func\s+(\p{Lu}\w*)\s*\(([^)]*)\)/gmu);
  for (const m of goDefs) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    const paramCount = m[2].split(',').filter(p => p.trim()).length;
    exports.push({ name: m[1], kind: 'function', paramCount, hasReturn: true, isAsync: false });
  }

  return exports;
}

function extractDependencies(code: string): string[] {
  const deps = new Set<string>();

  // JS/TS imports
  const jsImports = code.matchAll(/(?:import|from)\s+['"]([^'"./][^'"]*)['"]/g);
  for (const m of jsImports) deps.add(m[1].split('/')[0]);

  // Python imports
  const pyImports = code.matchAll(/(?:^import|^from)\s+(\w+)/gm);
  for (const m of pyImports) deps.add(m[1]);

  // Go imports
  const goImports = code.matchAll(/["']([^"']+)["']/g);
  for (const m of goImports) {
    if (m[1].includes('/') && !m[1].startsWith('.')) deps.add(m[1].split('/')[0]);
  }

  // Rust use
  const rustUse = code.matchAll(/use\s+(\w+)::/g);
  for (const m of rustUse) deps.add(m[1]);

  return [...deps].sort();
}

function extractDataShapes(code: string): DataShape[] {
  const shapes: DataShape[] = [];
  const seen = new Set<string>();

  // TS/JS interfaces and types
  const tsShapes = code.matchAll(
    /(?:export\s+)?(?:interface|type)\s+(\w+)\s*(?:=\s*)?[{<]/g
  );
  for (const m of tsShapes) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    const bodyMatch = code.match(new RegExp(`(?:interface|type)\\s+${m[1]}[^{]*\\{([^}]*)\\}`));
    const fields = bodyMatch
      ? bodyMatch[1].match(/\b(\w+)\s*[?:]?\s*:/g)?.map(f => f.replace(/\s*[?:]\s*:/, '').trim()) ?? []
      : [];
    shapes.push({
      name: m[1],
      kind: /interface/.test(m[0]) ? 'interface' : 'type',
      fieldCount: fields.length,
      fields: fields.slice(0, 20),
    });
  }

  // Python dataclass / TypedDict
  const pyShapes = code.matchAll(/@dataclass[\s\S]{0,50}class\s+(\w+)|class\s+(\w+)\s*\(.*TypedDict/g);
  for (const m of pyShapes) {
    const name = m[1] ?? m[2];
    if (!name || seen.has(name)) continue;
    seen.add(name);
    shapes.push({ name, kind: 'class', fieldCount: 0, fields: [] });
  }

  // Go structs
  const goStructs = code.matchAll(/type\s+(\w+)\s+struct\s*\{([^}]*)\}/g);
  for (const m of goStructs) {
    if (seen.has(m[1])) continue;
    seen.add(m[1]);
    const fields = m[2].match(/\b(\w+)\s+\w+/g)?.map(f => f.split(/\s+/)[0]) ?? [];
    shapes.push({ name: m[1], kind: 'struct', fieldCount: fields.length, fields });
  }

  return shapes;
}

function extractRuntimeAssumptions(code: string): string[] {
  const assumptions = new Set<string>();

  // Environment variables
  const envMatches = code.matchAll(
    /(?:process\.env|os\.environ|os\.getenv|env::var|System\.getenv|Environment\.GetEnvironmentVariable)\s*[\[.(]\s*['"]?(\w+)/g
  );
  for (const m of envMatches) assumptions.add(`env:${m[1]}`);

  // Global/window references
  if (/\bwindow\b/.test(code)) assumptions.add('platform:browser');
  if (/\bprocess\b/.test(code) && !/process\.env/.test(code)) assumptions.add('platform:node');
  if (/\bdocument\b/.test(code)) assumptions.add('platform:dom');

  // File system access
  if (/\b(fs\.|open\(|File\.|fopen|std::fs)/.test(code)) assumptions.add('io:filesystem');

  // Network access
  if (/\b(fetch|http|axios|requests\.|net\.http|reqwest)/.test(code)) assumptions.add('io:network');

  // Database
  if (/\b(sql|query|database|db\.|cursor|connection|pool)/.test(code)) assumptions.add('io:database');

  return [...assumptions].sort();
}

function extractErrorPatterns(code: string): ErrorPattern[] {
  const patterns: ErrorPattern[] = [];

  const tryCatch = (code.match(/\btry\s*\{/g) ?? []).length + (code.match(/\btry:/g) ?? []).length;
  if (tryCatch > 0) patterns.push({ kind: 'try-catch', count: tryCatch });

  const errorReturn = (code.match(/return\s+(?:err|error|Error|fmt\.Errorf)/g) ?? []).length;
  if (errorReturn > 0) patterns.push({ kind: 'error-return', count: errorReturn });

  const resultType = (code.match(/Result<|Result\(/g) ?? []).length;
  if (resultType > 0) patterns.push({ kind: 'result-type', count: resultType });

  const raises = (code.match(/\braise\s+\w+/g) ?? []).length;
  if (raises > 0) patterns.push({ kind: 'raise', count: raises });

  const panics = (code.match(/\bpanic[!(]/g) ?? []).length;
  if (panics > 0) patterns.push({ kind: 'panic', count: panics });

  return patterns;
}

function extractAsyncPatterns(code: string): string[] {
  const patterns: string[] = [];
  if (/\basync\b/.test(code)) patterns.push('async-await');
  if (/\bPromise\b/.test(code)) patterns.push('promise');
  if (/\bcallback\b/i.test(code) || /function\s*\(\s*err/.test(code)) patterns.push('callback');
  if (/\bStream\b|\bstream\b/.test(code)) patterns.push('stream');
  if (/\bchannel\b|\bchan\s/.test(code)) patterns.push('channel');
  if (/\bObservable\b/.test(code)) patterns.push('observable');
  if (/\bgenerator\b|\byield\b/.test(code)) patterns.push('generator');
  return patterns;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — ENVIRONMENT PROFILER
// ═══════════════════════════════════════════════════════════════════════════════

/** Framework detection patterns */
const FRAMEWORK_MARKERS: Record<string, RegExp> = {
  react: /\b(useState|useEffect|React\.|jsx|tsx)\b/,
  nextjs: /\b(getServerSideProps|getStaticProps|next\/)/,
  express: /\b(app\.(get|post|use)|express\(\))/,
  django: /\b(django|models\.Model|views\.py|urlpatterns)/,
  flask: /\b(Flask\(|@app\.route|flask)/,
  fastapi: /\b(FastAPI\(|@app\.(get|post)|Depends\()/,
  spring: /\b(@SpringBootApplication|@RestController|@Autowired)/,
  rails: /\b(ApplicationController|ActiveRecord|rails)/,
  gin: /\b(gin\.(Default|New)|c\.JSON\()/,
  actix: /\b(actix_web|HttpServer|web::)/,
  dotnet: /\b(IServiceCollection|IApplicationBuilder|WebApplication)/,
};

const STORAGE_MARKERS: Record<string, RegExp> = {
  postgresql: /\b(pg|postgres|psycopg|postgresql)\b/i,
  mysql: /\b(mysql|mariadb)\b/i,
  mongodb: /\b(mongo|mongoose|mongodb)\b/i,
  redis: /\b(redis|ioredis)\b/i,
  sqlite: /\b(sqlite|sqlite3)\b/i,
  s3: /\b(s3|aws.*bucket|boto)\b/i,
  elasticsearch: /\b(elastic|elasticsearch|opensearch)\b/i,
};

const API_MARKERS: Record<string, RegExp> = {
  rest: /\b(GET|POST|PUT|DELETE|PATCH)\b.*\/|\.(get|post|put|delete)\s*\(/,
  graphql: /\b(graphql|gql`|type Query|type Mutation)\b/,
  grpc: /\b(grpc|protobuf|proto\.)\b/,
  websocket: /\b(websocket|ws\.|socket\.io|Socket\()\b/i,
};

const ARCH_MARKERS: Record<string, RegExp> = {
  microservice: /\b(service|microservice|gateway|api_gateway)\b/i,
  serverless: /\b(lambda|serverless|cloud_function|edge_function)\b/i,
  monolith: /\b(monolith|ApplicationController|urls\.py)\b/i,
  event_driven: /\b(event_bus|message_queue|pubsub|kafka|rabbitmq)\b/i,
};

/**
 * Build a complete environment profile from a code sample.
 */
export function profileEnvironment(
  code: string,
  ecosystem: string,
): EnvironmentProfile {
  const frameworks: string[] = [];
  for (const [name, pattern] of Object.entries(FRAMEWORK_MARKERS)) {
    if (pattern.test(code)) frameworks.push(name);
  }

  const storagePatterns: string[] = [];
  for (const [name, pattern] of Object.entries(STORAGE_MARKERS)) {
    if (pattern.test(code)) storagePatterns.push(name);
  }

  const apiStyles: string[] = [];
  for (const [name, pattern] of Object.entries(API_MARKERS)) {
    if (pattern.test(code)) apiStyles.push(name);
  }

  const architecturalPatterns: string[] = [];
  for (const [name, pattern] of Object.entries(ARCH_MARKERS)) {
    if (pattern.test(code)) architecturalPatterns.push(name);
  }

  // Dependency complexity estimation
  const depCount = extractDependencies(code).length;
  const dependencyComplexity: EnvironmentProfile['dependencyComplexity'] =
    depCount > 15 ? 'heavy' : depCount > 5 ? 'moderate' : 'minimal';

  // Maturity signals
  const maturitySignals: MaturitySignal[] = [
    { signal: 'test_files', present: /\b(test|spec|__test__|_test\.)\b/.test(code), category: 'testing' },
    { signal: 'docstrings', present: /"""|'''|\/\*\*/.test(code), category: 'documentation' },
    { signal: 'ci_config', present: /\b(github_actions|circleci|jenkins|travis)\b/i.test(code), category: 'ci_cd' },
    { signal: 'health_check', present: /\/health|\/ready|health_check/.test(code), category: 'monitoring' },
    { signal: 'input_validation', present: /\b(validate|sanitize|schema\.parse)\b/.test(code), category: 'security' },
    { signal: 'error_handling', present: /\b(try|catch|except|rescue|Result<)\b/.test(code), category: 'security' },
    { signal: 'logging', present: /\b(logger|log\.(info|warn|error)|logging)\b/.test(code), category: 'monitoring' },
    { signal: 'type_safety', present: /\b(TypeScript|type\s+\w+|interface\s+\w+|@dataclass)\b/.test(code), category: 'security' },
  ];

  return {
    ecosystem,
    frameworks,
    storagePatterns,
    apiStyles,
    architecturalPatterns,
    dependencyComplexity,
    maturitySignals,
  };
}
