/**
 * Framework Middleware Emitters — honest activation, not decoration
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *
 * For a small, growing set of frameworks where we recognize the user's
 * source idiomatically, we emit a *real* middleware that wraps every
 * inbound request through the kernel. This is the antidote to the generic
 * regex stubs in `layer-1-5-rebound.ts` — when we know the framework, we
 * give back a drop-in middleware the developer can register in two lines.
 *
 * Detection is conservative — if we're not sure, we return `null` and the
 * caller falls back to the generic rebound stubs (or, ideally, nothing).
 *
 * Currently supported:
 *   • Swift / Vapor — `Middleware` conformance + `app.middleware.use(...)`
 *
 * Future: Spring (Filter), Gin (gin.HandlerFunc), Express (req, res, next),
 * ASP.NET Core (IMiddleware), Ktor (PipelineInterceptor).
 *
 * © CMPSBL® — All rights reserved.
 */

export interface FrameworkSourceFile {
  name: string;
  content: string;
}

export interface FrameworkMiddlewareEmission {
  /** Block of source code to splice into Layer 2 (host language) */
  block: string;
  /** Framework key for telemetry / harness reporting */
  framework: 'vapor' | 'spring' | 'gin' | 'express' | 'aspnet' | 'ktor';
  /** Short label used in the export receipt and harness report */
  label: string;
  /** Two-line snippet developers paste into their existing entry point */
  registrationHint: string;
}

// ─────────────────────────────────────────────────────────────────────
// Detectors — fire only on syntax that strongly indicates the framework
// ─────────────────────────────────────────────────────────────────────

const VAPOR_SIGNAL = [
  /\bimport\s+Vapor\b/,
  /\bRouteCollection\b/,
  /\b\w+\s*:\s*Request\b/,           // `req: Request`
  /\bapp\.middleware\.use\b/,
  /\bapp\.routes\.(get|post|put|delete|patch)\b/,
];

function looksLikeVapor(files: ReadonlyArray<FrameworkSourceFile>): boolean {
  let hits = 0;
  for (const f of files) {
    for (const re of VAPOR_SIGNAL) {
      if (re.test(f.content)) {
        hits += 1;
        if (hits >= 2) return true; // need at least two distinct cues
      }
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────
// Emitter — Vapor
// ─────────────────────────────────────────────────────────────────────

function emitVaporMiddleware(): FrameworkMiddlewareEmission {
  const block = [
    '',
    '// ╔═══════════════════════════════════════════════════════════════════════════════╗',
    '// ║  LAYER 1.5 — VAPOR MIDDLEWARE (framework-aware activation)                   ║',
    '// ║  Wraps every Request through the kernel so Layer 2 governance fires per hop. ║',
    '// ╚═══════════════════════════════════════════════════════════════════════════════╝',
    '',
    'import Vapor',
    '',
    '/// Drop-in Vapor middleware that routes every request through the',
    '/// CMPSBL® kernel. Records the decision in the audit chain and lets',
    '/// Layer 2 short-circuit (deny / detach / quarantine) before the',
    '/// downstream responder runs.',
    'public struct CmpsblTraceMiddleware: AsyncMiddleware {',
    '    public init() {}',
    '',
    '    public func respond(',
    '        to request: Request,',
    '        chainingTo next: AsyncResponder',
    '    ) async throws -> Response {',
    '        let label = "\\(request.method.rawValue) \\(request.url.path)"',
    '        return try await CmpsblIsolatedExecutor.executeAsync(label) {',
    '            try await next.respond(to: request)',
    '        }',
    '    }',
    '}',
    '',
    '/// Convenience registration — call from `configure(_:)`.',
    '///',
    '///     try CmpsblConfigure(app)',
    '///',
    'public func CmpsblConfigure(_ app: Application) throws {',
    '    app.middleware.use(CmpsblTraceMiddleware())',
    '}',
    '',
  ].join('\n');

  const registrationHint = [
    '// In your existing configure(_ app: Application):',
    'try CmpsblConfigure(app)   // ← one line; runs before your routes',
  ].join('\n');

  return {
    block,
    framework: 'vapor',
    label: 'Swift · Vapor middleware',
    registrationHint,
  };
}

// ─────────────────────────────────────────────────────────────────────
// Public API — language-routed framework detection
// ─────────────────────────────────────────────────────────────────────

/**
 * Inspect the user source for known frameworks in the given host language
 * and, if a match is found, return a ready-to-splice middleware block.
 *
 * Returns `null` when no framework is recognized — the caller should treat
 * that as "do not emit a generic stub either", to avoid pretending we wired
 * something up.
 */
export function detectFrameworkMiddleware(
  files: ReadonlyArray<FrameworkSourceFile>,
  lang: string,
): FrameworkMiddlewareEmission | null {
  const lc = lang.toLowerCase();
  if (!files || files.length === 0) return null;

  if (lc === 'swift' && looksLikeVapor(files)) {
    return emitVaporMiddleware();
  }

  return null;
}
