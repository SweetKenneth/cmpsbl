/**
 * Bridge Execution Honesty Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Makes bridge adapters honest about what actually executes in-browser
 * vs. what requires a server-side runtime.
 *
 * Browser environment: Only JS/TS runs natively.
 * All other languages produce HONEST bridge stubs that:
 *   1. Document they are delegation stubs, not native executors
 *   2. Emit 'delegated' execution status (never fake 'executed')
 *   3. Provide clear instructions for server-side wiring
 *
 * © CMPSBL® — All rights reserved.
 */

export type ExecutionCapability = 'native' | 'delegated' | 'unavailable';

export interface BridgeHonestyReport {
  language: string;
  capability: ExecutionCapability;
  reason: string;
  serverRequirement: string | null;
  instructions: string;
}

// Languages that execute natively in the browser
const NATIVE_LANGUAGES = new Set([
  'typescript', 'javascript', 'js', 'ts', 'jsx', 'tsx',
]);

// Languages that can potentially run via WASM/transpilation in browser
const WASM_CAPABLE = new Set([
  'rust', 'c', 'cpp', 'go', 'zig',
]);

// Server-side language requirements
const SERVER_REQUIREMENTS: Record<string, string> = {
  python: 'Python 3.8+ runtime (subprocess or microservice)',
  php: 'PHP 8.0+ runtime (php-cgi or microservice)',
  ruby: 'Ruby 3.0+ runtime (subprocess or microservice)',
  java: 'JDK 17+ (JAR execution or microservice)',
  csharp: '.NET 8+ runtime (dotnet CLI or microservice)',
  swift: 'Swift 5.9+ toolchain (macOS/Linux)',
  kotlin: 'Kotlin/JVM 1.9+ (Gradle or microservice)',
  elixir: 'Elixir 1.15+ / OTP 26+ (Mix runtime)',
  lua: 'Lua 5.4+ or LuaJIT runtime',
  dart: 'Dart 3.0+ SDK',
  scala: 'Scala 3 + sbt (JVM-based)',
  haskell: 'GHC 9.4+ / Stack',
  // HDL
  vhdl: 'GHDL simulator',
  verilog: 'Icarus Verilog (iverilog)',
  systemverilog: 'Verilator',
  chisel: 'sbt + Chisel3 (JVM)',
  amaranth: 'Python 3.8+ with Amaranth HDL',
  spice: 'ngspice simulator',
  systemc: 'SystemC library + CMake',
};

/**
 * Assess what a bridge adapter can actually do in the current environment.
 */
export function assessBridgeCapability(language: string): BridgeHonestyReport {
  const lang = language.toLowerCase();

  if (NATIVE_LANGUAGES.has(lang)) {
    return {
      language: lang,
      capability: 'native',
      reason: 'JS/TS executes natively in the browser via the Mini-Runtime™.',
      serverRequirement: null,
      instructions: 'No additional setup required. Code runs directly.',
    };
  }

  const serverReq = SERVER_REQUIREMENTS[lang];
  const isWasm = WASM_CAPABLE.has(lang);

  if (serverReq) {
    return {
      language: lang,
      capability: 'delegated',
      reason: `${lang} cannot execute in the browser. The bridge adapter delegates to the canonical TypeScript runtime for scoring/tiering, and produces ${lang} source code for server-side execution.`,
      serverRequirement: serverReq,
      instructions: [
        `To execute ${lang} bridge output natively:`,
        `1. Deploy a ${lang} microservice that accepts the bridge's JSON payload`,
        `2. Point CMPSBL_BRIDGE_ENDPOINT to your service URL`,
        `3. The bridge adapter will delegate execution via HTTP`,
        `4. Without a server, the bridge produces valid ${lang} source code`,
        `   and delegates CJPI scoring to the local TypeScript runtime`,
        isWasm ? `\nNote: ${lang} may support future WASM compilation for in-browser execution.` : '',
      ].filter(Boolean).join('\n'),
    };
  }

  return {
    language: lang,
    capability: 'unavailable',
    reason: `${lang} is not a recognized bridge target.`,
    serverRequirement: null,
    instructions: 'This language is not supported by the Universal Export system.',
  };
}

/**
 * Generate the honesty disclaimer that gets embedded in non-JS bridge exports.
 */
export function generateHonestyDisclaimer(language: string, commentChar: string): string {
  const report = assessBridgeCapability(language);
  if (report.capability === 'native') return '';

  return [
    `${commentChar} ╔═══════════════════════════════════════════════════════════╗`,
    `${commentChar} ║  EXECUTION HONESTY NOTICE                                ║`,
    `${commentChar} ╠═══════════════════════════════════════════════════════════╣`,
    `${commentChar} ║  This is a DELEGATION BRIDGE, not a native executor.     ║`,
    `${commentChar} ║                                                           ║`,
    `${commentChar} ║  What runs in-browser:                                    ║`,
    `${commentChar} ║    ✓ CJPI scoring & tiering (TypeScript Mini-Runtime™)   ║`,
    `${commentChar} ║    ✓ Module chain validation & integrity checks          ║`,
    `${commentChar} ║    ✓ Manifest generation & metadata                      ║`,
    `${commentChar} ║                                                           ║`,
    `${commentChar} ║  What requires server-side runtime:                       ║`,
    `${commentChar} ║    ✗ Native ${language.padEnd(12)} code execution             ║`,
    `${commentChar} ║    ✗ Language-specific effect handlers                    ║`,
    `${commentChar} ║                                                           ║`,
    `${commentChar} ║  Server: ${(report.serverRequirement || 'N/A').padEnd(48)}║`,
    `${commentChar} ╚═══════════════════════════════════════════════════════════╝`,
    '',
  ].join('\n');
}

/**
 * Get all supported languages with their execution status.
 */
export function getAllBridgeCapabilities(): BridgeHonestyReport[] {
  const allLangs = [
    ...NATIVE_LANGUAGES,
    ...Object.keys(SERVER_REQUIREMENTS),
  ];
  return [...new Set(allLangs)].map(assessBridgeCapability);
}
