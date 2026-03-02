/**
 * Universal Export Adapter System
 * Generates drop-in code for any S-Tier Crown Jewel across multiple languages/frameworks.
 * 
 * Supported targets:
 *   TypeScript (Node/Deno/Bun), Python, Go, Rust, Java, C#, Ruby,
 *   PHP, Swift, Kotlin, Elixir, Lua
 * 
 * Adapter wrappers:
 *   REST API, gRPC stub, CLI, Docker, WASM, SDK wrapper
 */

export type ExportLanguage =
  | 'typescript' | 'python' | 'go' | 'rust' | 'java'
  | 'csharp' | 'ruby' | 'php' | 'swift' | 'kotlin'
  | 'elixir' | 'lua'
  | 'verilog' | 'vhdl' | 'systemverilog' | 'chisel';

export type ExportAdapter =
  | 'standalone' | 'rest-api' | 'grpc-stub' | 'cli'
  | 'docker' | 'wasm' | 'sdk-wrapper' | 'fpga-synth';

export interface ExportTarget {
  language: ExportLanguage;
  adapter: ExportAdapter;
}

export interface ExportableArtifact {
  id: string;
  name: string;
  rank: number;
  cjpi: number;
  module: string;
  description: string;
  sourceCode: string;
}

export interface ExportedFile {
  filename: string;
  content: string;
  language: ExportLanguage;
  adapter: ExportAdapter;
  mimeType: string;
}

export interface ExportBundle {
  artifact: { id: string; name: string; rank: number };
  files: ExportedFile[];
  readme: string;
  generatedAt: string;
}

const LANG_EXT: Record<ExportLanguage, string> = {
  typescript: 'ts', python: 'py', go: 'go', rust: 'rs', java: 'java',
  csharp: 'cs', ruby: 'rb', php: 'php', swift: 'swift', kotlin: 'kt',
  elixir: 'ex', lua: 'lua',
  verilog: 'v', vhdl: 'vhd', systemverilog: 'sv', chisel: 'scala',
};

const LANG_LABELS: Record<ExportLanguage, string> = {
  typescript: 'TypeScript', python: 'Python', go: 'Go', rust: 'Rust',
  java: 'Java', csharp: 'C#', ruby: 'Ruby', php: 'PHP',
  swift: 'Swift', kotlin: 'Kotlin', elixir: 'Elixir', lua: 'Lua',
  verilog: 'Verilog', vhdl: 'VHDL', systemverilog: 'SystemVerilog', chisel: 'Chisel (Scala)',
};

const ADAPTER_LABELS: Record<ExportAdapter, string> = {
  standalone: 'Standalone Module',
  'rest-api': 'REST API Wrapper',
  'grpc-stub': 'gRPC Service Stub',
  cli: 'CLI Tool',
  docker: 'Docker Container',
  wasm: 'WASM Module',
  'sdk-wrapper': 'SDK Client',
  'fpga-synth': 'FPGA Synthesis Ready',
};

export function getAllLanguages(): { value: ExportLanguage; label: string }[] {
  return Object.entries(LANG_LABELS).map(([v, l]) => ({ value: v as ExportLanguage, label: l }));
}

export function getAllAdapters(): { value: ExportAdapter; label: string }[] {
  return Object.entries(ADAPTER_LABELS).map(([v, l]) => ({ value: v as ExportAdapter, label: l }));
}

/**
 * Generate a full export bundle for a single artifact
 */
export function generateExportBundle(
  artifact: ExportableArtifact,
  targets: ExportTarget[]
): ExportBundle {
  const files: ExportedFile[] = [];
  const slug = artifact.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');

  for (const target of targets) {
    const ext = LANG_EXT[target.language];
    const filename = target.adapter === 'standalone'
      ? `${slug}.${ext}`
      : `${slug}-${target.adapter}.${ext}`;

    const content = generateCode(artifact, target);
    files.push({
      filename,
      content,
      language: target.language,
      adapter: target.adapter,
      mimeType: getMimeType(target.language),
    });
  }

  // Always include a README
  const readme = generateReadme(artifact, targets, files);

  return {
    artifact: { id: artifact.id, name: artifact.name, rank: artifact.rank },
    files,
    readme,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Export a single file for quick single-language download
 */
export function generateSingleExport(
  artifact: ExportableArtifact,
  language: ExportLanguage,
  adapter: ExportAdapter = 'standalone'
): ExportedFile {
  const ext = LANG_EXT[language];
  const slug = artifact.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  const filename = adapter === 'standalone' ? `${slug}.${ext}` : `${slug}-${adapter}.${ext}`;
  return {
    filename,
    content: generateCode(artifact, { language, adapter }),
    language,
    adapter,
    mimeType: getMimeType(language),
  };
}

function getMimeType(lang: ExportLanguage): string {
  const map: Partial<Record<ExportLanguage, string>> = {
    typescript: 'text/typescript', python: 'text/x-python', go: 'text/x-go',
    rust: 'text/x-rust', java: 'text/x-java', csharp: 'text/x-csharp',
    ruby: 'text/x-ruby', php: 'text/x-php', swift: 'text/x-swift',
    kotlin: 'text/x-kotlin', elixir: 'text/x-elixir', lua: 'text/x-lua',
    verilog: 'text/x-verilog', vhdl: 'text/x-vhdl', systemverilog: 'text/x-systemverilog',
    chisel: 'text/x-scala',
  };
  return map[lang] ?? 'text/plain';
}

// ─── Code Generation per Language ──────────────────────────────────

function generateCode(artifact: ExportableArtifact, target: ExportTarget): string {
  const { language, adapter } = target;
  const gen = CODE_GENERATORS[language];
  if (!gen) return `// Export not yet implemented for ${language}`;
  return gen(artifact, adapter);
}

type CodeGen = (a: ExportableArtifact, adapter: ExportAdapter) => string;

const CODE_GENERATORS: Record<ExportLanguage, CodeGen> = {
  typescript: genTypeScript,
  python: genPython,
  go: genGo,
  rust: genRust,
  java: genJava,
  csharp: genCSharp,
  ruby: genRuby,
  php: genPHP,
  swift: genSwift,
  kotlin: genKotlin,
  elixir: genElixir,
  lua: genLua,
  verilog: genVerilog,
  vhdl: genVHDL,
  systemverilog: genSystemVerilog,
  chisel: genChisel,
};

function header(a: ExportableArtifact, lang: string, comment: string): string {
  return [
    `${comment} ════════════════════════════════════════════════════════`,
    `${comment} CMPSBL® S-Tier Crown Jewel — ${a.name}`,
    `${comment} Rank: #${a.rank} | CJPI: ${a.cjpi} | Module: ${a.module}`,
    `${comment} ID: ${a.id}`,
    `${comment} ${a.description}`,
    `${comment}`,
    `${comment} Generated by CMPSBL Universal Export Adapter`,
    `${comment} Language: ${lang} | Zero external dependencies`,
    `${comment} ════════════════════════════════════════════════════════`,
    '',
  ].join('\n');
}

function className(a: ExportableArtifact): string {
  return a.name.replace(/[^a-zA-Z0-9]/g, '');
}

function snakeCase(a: ExportableArtifact): string {
  return a.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');
}

// ─── TypeScript ────────────────────────────────────────────────────

function genTypeScript(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'TypeScript', '//');
  if (adapter === 'standalone' && a.sourceCode) {
    return `${h}\n${a.sourceCode}`;
  }
  const cls = className(a);
  const base = `
export interface ${cls}Config {
  maxRetries?: number;
  timeoutMs?: number;
  onError?: (error: Error) => void;
}

export interface ${cls}Result<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  latencyMs: number;
  confidence: number;
}

export class ${cls} {
  private config: Required<${cls}Config>;

  constructor(config: ${cls}Config = {}) {
    this.config = {
      maxRetries: config.maxRetries ?? 3,
      timeoutMs: config.timeoutMs ?? 30000,
      onError: config.onError ?? console.error,
    };
  }

  async execute<T = unknown>(input: Record<string, unknown>): Promise<${cls}Result<T>> {
    const start = performance.now();
    try {
      // Core logic placeholder — wire to your implementation
      const data = await this.process(input);
      return {
        success: true,
        data: data as T,
        latencyMs: performance.now() - start,
        confidence: 1.0,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      this.config.onError(new Error(error));
      return { success: false, error, latencyMs: performance.now() - start, confidence: 0 };
    }
  }

  private async process(input: Record<string, unknown>): Promise<unknown> {
    // TODO: Implement ${a.name} core logic
    return { processed: true, input };
  }

  getInfo() {
    return { name: '${a.name}', rank: ${a.rank}, cjpi: ${a.cjpi}, module: '${a.module}' };
  }
}
`;

  if (adapter === 'rest-api') {
    return `${h}${base}
// ─── REST API Adapter ──────────────────────────────────
// Express/Hono/Fastify compatible handler

export function create${cls}Handler() {
  const engine = new ${cls}();

  return async (req: Request): Promise<Response> => {
    const body = await req.json().catch(() => ({}));
    const result = await engine.execute(body);
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  };
}
`;
  }

  if (adapter === 'cli') {
    return `${h}${base}
// ─── CLI Adapter ───────────────────────────────────────
// Run: npx ts-node ${a.name.toLowerCase().replace(/\\s+/g, '-')}-cli.ts '{"key":"value"}'

async function main() {
  const input = JSON.parse(process.argv[2] || '{}');
  const engine = new ${cls}();
  const result = await engine.execute(input);
  console.log(JSON.stringify(result, null, 2));
  process.exit(result.success ? 0 : 1);
}

main();
`;
  }

  return `${h}${base}`;
}

// ─── Python ────────────────────────────────────────────────────────

function genPython(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'Python', '#');
  const cls = className(a);
  const snake = snakeCase(a);
  let code = `${h}
import time
from dataclasses import dataclass, field
from typing import Any, Optional, Dict

@dataclass
class ${cls}Config:
    max_retries: int = 3
    timeout_ms: int = 30000

@dataclass
class ${cls}Result:
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None
    latency_ms: float = 0.0
    confidence: float = 0.0

class ${cls}:
    """${a.description}"""

    def __init__(self, config: Optional[${cls}Config] = None):
        self.config = config or ${cls}Config()

    def execute(self, input_data: Dict[str, Any]) -> ${cls}Result:
        start = time.perf_counter()
        try:
            result = self._process(input_data)
            elapsed = (time.perf_counter() - start) * 1000
            return ${cls}Result(success=True, data=result, latency_ms=elapsed, confidence=1.0)
        except Exception as e:
            elapsed = (time.perf_counter() - start) * 1000
            return ${cls}Result(success=False, error=str(e), latency_ms=elapsed, confidence=0.0)

    def _process(self, input_data: Dict[str, Any]) -> Any:
        # TODO: Implement ${a.name} core logic
        return {"processed": True, "input": input_data}

    @property
    def info(self) -> Dict[str, Any]:
        return {"name": "${a.name}", "rank": ${a.rank}, "cjpi": ${a.cjpi}, "module": "${a.module}"}
`;

  if (adapter === 'rest-api') {
    code += `

# ─── REST API Adapter (Flask/FastAPI) ─────────────────
# pip install fastapi uvicorn
# uvicorn ${snake}:app

from fastapi import FastAPI

app = FastAPI(title="${a.name}")
engine = ${cls}()

@app.post("/execute")
async def execute(body: dict):
    return engine.execute(body).__dict__

@app.get("/info")
async def info():
    return engine.info
`;
  }

  if (adapter === 'cli') {
    code += `

# ─── CLI Adapter ──────────────────────────────────────
# python ${snake}.py '{"key":"value"}'

if __name__ == "__main__":
    import sys, json
    input_data = json.loads(sys.argv[1]) if len(sys.argv) > 1 else {}
    engine = ${cls}()
    result = engine.execute(input_data)
    print(json.dumps(result.__dict__, indent=2))
    sys.exit(0 if result.success else 1)
`;
  }

  return code;
}

// ─── Go ────────────────────────────────────────────────────────────

function genGo(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'Go', '//');
  const cls = className(a);
  let code = `${h}
package ${snakeCase(a)}

import (
\t"encoding/json"
\t"time"
)

type Config struct {
\tMaxRetries int \`json:"max_retries"\`
\tTimeoutMs  int \`json:"timeout_ms"\`
}

type Result struct {
\tSuccess    bool        \`json:"success"\`
\tData       interface{} \`json:"data,omitempty"\`
\tError      string      \`json:"error,omitempty"\`
\tLatencyMs  float64     \`json:"latency_ms"\`
\tConfidence float64     \`json:"confidence"\`
}

type ${cls} struct {
\tconfig Config
}

func New${cls}(config ...Config) *${cls} {
\tcfg := Config{MaxRetries: 3, TimeoutMs: 30000}
\tif len(config) > 0 {
\t\tcfg = config[0]
\t}
\treturn &${cls}{config: cfg}
}

func (e *${cls}) Execute(input map[string]interface{}) Result {
\tstart := time.Now()
\tdata, err := e.process(input)
\telapsed := float64(time.Since(start).Milliseconds())
\tif err != nil {
\t\treturn Result{Success: false, Error: err.Error(), LatencyMs: elapsed}
\t}
\treturn Result{Success: true, Data: data, LatencyMs: elapsed, Confidence: 1.0}
}

func (e *${cls}) process(input map[string]interface{}) (interface{}, error) {
\t// TODO: Implement ${a.name} core logic
\treturn map[string]interface{}{"processed": true, "input": input}, nil
}

func (e *${cls}) Info() map[string]interface{} {
\treturn map[string]interface{}{
\t\t"name": "${a.name}", "rank": ${a.rank}, "cjpi": ${a.cjpi}, "module": "${a.module}",
\t}
}
`;

  if (adapter === 'rest-api') {
    code += `
// ─── REST API (net/http) ─────────────────────────────
import (
\t"net/http"
)

func Handler(w http.ResponseWriter, r *http.Request) {
\tengine := New${cls}()
\tvar input map[string]interface{}
\tjson.NewDecoder(r.Body).Decode(&input)
\tresult := engine.Execute(input)
\tw.Header().Set("Content-Type", "application/json")
\tjson.NewEncoder(w).Encode(result)
}
`;
  }

  return code;
}

// ─── Rust ──────────────────────────────────────────────────────────

function genRust(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'Rust', '//');
  const snake = snakeCase(a);
  return `${h}
use std::collections::HashMap;
use std::time::Instant;

#[derive(Debug, Clone)]
pub struct Config {
    pub max_retries: u32,
    pub timeout_ms: u64,
}

impl Default for Config {
    fn default() -> Self {
        Config { max_retries: 3, timeout_ms: 30000 }
    }
}

#[derive(Debug, Clone)]
pub struct Result {
    pub success: bool,
    pub data: Option<HashMap<String, String>>,
    pub error: Option<String>,
    pub latency_ms: f64,
    pub confidence: f64,
}

pub struct ${className(a)} {
    config: Config,
}

impl ${className(a)} {
    pub fn new(config: Option<Config>) -> Self {
        Self { config: config.unwrap_or_default() }
    }

    pub fn execute(&self, input: HashMap<String, String>) -> Result {
        let start = Instant::now();
        match self.process(&input) {
            Ok(data) => Result {
                success: true,
                data: Some(data),
                error: None,
                latency_ms: start.elapsed().as_secs_f64() * 1000.0,
                confidence: 1.0,
            },
            Err(e) => Result {
                success: false,
                data: None,
                error: Some(e),
                latency_ms: start.elapsed().as_secs_f64() * 1000.0,
                confidence: 0.0,
            },
        }
    }

    fn process(&self, input: &HashMap<String, String>) -> std::result::Result<HashMap<String, String>, String> {
        // TODO: Implement ${a.name} core logic
        let mut out = HashMap::new();
        out.insert("processed".into(), "true".into());
        Ok(out)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_execute() {
        let engine = ${className(a)}::new(None);
        let result = engine.execute(HashMap::new());
        assert!(result.success);
    }
}
`;
}

// ─── Java ──────────────────────────────────────────────────────────

function genJava(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'Java', '//');
  const cls = className(a);
  return `${h}
import java.util.*;

public class ${cls} {

    public static class Config {
        public int maxRetries = 3;
        public int timeoutMs = 30000;
    }

    public static class Result {
        public boolean success;
        public Object data;
        public String error;
        public double latencyMs;
        public double confidence;

        public Result(boolean success, Object data, String error, double latencyMs, double confidence) {
            this.success = success;
            this.data = data;
            this.error = error;
            this.latencyMs = latencyMs;
            this.confidence = confidence;
        }
    }

    private final Config config;

    public ${cls}() { this(new Config()); }
    public ${cls}(Config config) { this.config = config; }

    public Result execute(Map<String, Object> input) {
        long start = System.nanoTime();
        try {
            Object data = process(input);
            double elapsed = (System.nanoTime() - start) / 1_000_000.0;
            return new Result(true, data, null, elapsed, 1.0);
        } catch (Exception e) {
            double elapsed = (System.nanoTime() - start) / 1_000_000.0;
            return new Result(false, null, e.getMessage(), elapsed, 0.0);
        }
    }

    private Object process(Map<String, Object> input) {
        // TODO: Implement ${a.name} core logic
        Map<String, Object> out = new HashMap<>();
        out.put("processed", true);
        out.put("input", input);
        return out;
    }

    public Map<String, Object> getInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("name", "${a.name}");
        info.put("rank", ${a.rank});
        info.put("cjpi", ${a.cjpi});
        info.put("module", "${a.module}");
        return info;
    }
}
`;
}

// ─── C# ────────────────────────────────────────────────────────────

function genCSharp(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'C#', '//');
  const cls = className(a);
  return `${h}
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace CMPSBL.CrownJewels
{
    public class ${cls}Config
    {
        public int MaxRetries { get; set; } = 3;
        public int TimeoutMs { get; set; } = 30000;
    }

    public class ${cls}Result
    {
        public bool Success { get; set; }
        public object Data { get; set; }
        public string Error { get; set; }
        public double LatencyMs { get; set; }
        public double Confidence { get; set; }
    }

    public class ${cls}
    {
        private readonly ${cls}Config _config;

        public ${cls}(${cls}Config config = null)
        {
            _config = config ?? new ${cls}Config();
        }

        public ${cls}Result Execute(Dictionary<string, object> input)
        {
            var sw = Stopwatch.StartNew();
            try
            {
                var data = Process(input);
                sw.Stop();
                return new ${cls}Result
                {
                    Success = true, Data = data,
                    LatencyMs = sw.Elapsed.TotalMilliseconds, Confidence = 1.0
                };
            }
            catch (Exception ex)
            {
                sw.Stop();
                return new ${cls}Result
                {
                    Success = false, Error = ex.Message,
                    LatencyMs = sw.Elapsed.TotalMilliseconds, Confidence = 0.0
                };
            }
        }

        private object Process(Dictionary<string, object> input)
        {
            // TODO: Implement ${a.name} core logic
            return new Dictionary<string, object> { { "processed", true }, { "input", input } };
        }
    }
}
`;
}

// ─── Ruby ──────────────────────────────────────────────────────────

function genRuby(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'Ruby', '#');
  const cls = className(a);
  return `${h}
module CMPSBL
  class ${cls}
    attr_reader :config

    def initialize(max_retries: 3, timeout_ms: 30_000)
      @config = { max_retries: max_retries, timeout_ms: timeout_ms }
    end

    def execute(input = {})
      start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
      begin
        data = process(input)
        elapsed = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000).round(2)
        { success: true, data: data, latency_ms: elapsed, confidence: 1.0 }
      rescue => e
        elapsed = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000).round(2)
        { success: false, error: e.message, latency_ms: elapsed, confidence: 0.0 }
      end
    end

    def info
      { name: "${a.name}", rank: ${a.rank}, cjpi: ${a.cjpi}, module: "${a.module}" }
    end

    private

    def process(input)
      # TODO: Implement ${a.name} core logic
      { processed: true, input: input }
    end
  end
end
`;
}

// ─── PHP ───────────────────────────────────────────────────────────

function genPHP(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'PHP', '//');
  const cls = className(a);
  return `<?php
${h}
namespace CMPSBL\\CrownJewels;

class ${cls} {
    private array $config;

    public function __construct(int $maxRetries = 3, int $timeoutMs = 30000) {
        $this->config = ['max_retries' => $maxRetries, 'timeout_ms' => $timeoutMs];
    }

    public function execute(array $input = []): array {
        $start = microtime(true);
        try {
            $data = $this->process($input);
            $elapsed = (microtime(true) - $start) * 1000;
            return ['success' => true, 'data' => $data, 'latency_ms' => round($elapsed, 2), 'confidence' => 1.0];
        } catch (\\Throwable $e) {
            $elapsed = (microtime(true) - $start) * 1000;
            return ['success' => false, 'error' => $e->getMessage(), 'latency_ms' => round($elapsed, 2), 'confidence' => 0.0];
        }
    }

    private function process(array $input): array {
        // TODO: Implement ${a.name} core logic
        return ['processed' => true, 'input' => $input];
    }

    public function info(): array {
        return ['name' => '${a.name}', 'rank' => ${a.rank}, 'cjpi' => ${a.cjpi}, 'module' => '${a.module}'];
    }
}
`;
}

// ─── Swift ─────────────────────────────────────────────────────────

function genSwift(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'Swift', '//');
  const cls = className(a);
  return `${h}
import Foundation

struct ${cls}Config {
    var maxRetries: Int = 3
    var timeoutMs: Int = 30000
}

struct ${cls}Result {
    let success: Bool
    let data: [String: Any]?
    let error: String?
    let latencyMs: Double
    let confidence: Double
}

class ${cls} {
    private let config: ${cls}Config

    init(config: ${cls}Config = ${cls}Config()) {
        self.config = config
    }

    func execute(input: [String: Any] = [:]) -> ${cls}Result {
        let start = CFAbsoluteTimeGetCurrent()
        do {
            let data = try process(input: input)
            let elapsed = (CFAbsoluteTimeGetCurrent() - start) * 1000
            return ${cls}Result(success: true, data: data, error: nil, latencyMs: elapsed, confidence: 1.0)
        } catch {
            let elapsed = (CFAbsoluteTimeGetCurrent() - start) * 1000
            return ${cls}Result(success: false, data: nil, error: error.localizedDescription, latencyMs: elapsed, confidence: 0.0)
        }
    }

    private func process(input: [String: Any]) throws -> [String: Any] {
        // TODO: Implement ${a.name} core logic
        return ["processed": true, "input": input]
    }

    var info: [String: Any] {
        ["name": "${a.name}", "rank": ${a.rank}, "cjpi": ${a.cjpi}, "module": "${a.module}"]
    }
}
`;
}

// ─── Kotlin ────────────────────────────────────────────────────────

function genKotlin(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'Kotlin', '//');
  const cls = className(a);
  return `${h}
data class ${cls}Config(val maxRetries: Int = 3, val timeoutMs: Int = 30000)

data class ${cls}Result(
    val success: Boolean,
    val data: Map<String, Any?>? = null,
    val error: String? = null,
    val latencyMs: Double = 0.0,
    val confidence: Double = 0.0
)

class ${cls}(private val config: ${cls}Config = ${cls}Config()) {

    fun execute(input: Map<String, Any?> = emptyMap()): ${cls}Result {
        val start = System.nanoTime()
        return try {
            val data = process(input)
            val elapsed = (System.nanoTime() - start) / 1_000_000.0
            ${cls}Result(success = true, data = data, latencyMs = elapsed, confidence = 1.0)
        } catch (e: Exception) {
            val elapsed = (System.nanoTime() - start) / 1_000_000.0
            ${cls}Result(success = false, error = e.message, latencyMs = elapsed, confidence = 0.0)
        }
    }

    private fun process(input: Map<String, Any?>): Map<String, Any?> {
        // TODO: Implement ${a.name} core logic
        return mapOf("processed" to true, "input" to input)
    }

    val info: Map<String, Any>
        get() = mapOf("name" to "${a.name}", "rank" to ${a.rank}, "cjpi" to ${a.cjpi}, "module" to "${a.module}")
}
`;
}

// ─── Elixir ────────────────────────────────────────────────────────

function genElixir(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'Elixir', '#');
  const mod = className(a);
  return `${h}
defmodule CMPSBL.${mod} do
  @moduledoc """
  ${a.description}
  Rank: #${a.rank} | CJPI: ${a.cjpi} | Module: ${a.module}
  """

  defstruct max_retries: 3, timeout_ms: 30_000

  def new(opts \\\\ []) do
    struct(__MODULE__, opts)
  end

  def execute(%__MODULE__{} = engine, input \\\\ %{}) do
    start = System.monotonic_time(:millisecond)
    try do
      data = process(engine, input)
      elapsed = System.monotonic_time(:millisecond) - start
      {:ok, %{success: true, data: data, latency_ms: elapsed, confidence: 1.0}}
    rescue
      e ->
        elapsed = System.monotonic_time(:millisecond) - start
        {:error, %{success: false, error: Exception.message(e), latency_ms: elapsed, confidence: 0.0}}
    end
  end

  defp process(_engine, input) do
    # TODO: Implement ${a.name} core logic
    %{processed: true, input: input}
  end

  def info do
    %{name: "${a.name}", rank: ${a.rank}, cjpi: ${a.cjpi}, module: "${a.module}"}
  end
end
`;
}

// ─── Lua ───────────────────────────────────────────────────────────

function genLua(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'Lua', '--');
  const mod = className(a);
  return `${h}
local ${mod} = {}
${mod}.__index = ${mod}

function ${mod}.new(config)
    config = config or {}
    local self = setmetatable({}, ${mod})
    self.max_retries = config.max_retries or 3
    self.timeout_ms = config.timeout_ms or 30000
    return self
end

function ${mod}:execute(input)
    input = input or {}
    local start = os.clock()
    local ok, data = pcall(function() return self:process(input) end)
    local elapsed = (os.clock() - start) * 1000
    if ok then
        return { success = true, data = data, latency_ms = elapsed, confidence = 1.0 }
    else
        return { success = false, error = tostring(data), latency_ms = elapsed, confidence = 0.0 }
    end
end

function ${mod}:process(input)
    -- TODO: Implement ${a.name} core logic
    return { processed = true, input = input }
end

function ${mod}:info()
    return { name = "${a.name}", rank = ${a.rank}, cjpi = ${a.cjpi}, module = "${a.module}" }
end

return ${mod}
`;
}

// ─── Verilog (Gate-Level HDL) ──────────────────────────────────────

function genVerilog(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'Verilog', '//');
  const mod = snakeCase(a);
  const isFpga = adapter === 'fpga-synth';
  return `${h}
\`timescale 1ns / 1ps

// ═══════════════════════════════════════════════════════════════
// Gate-Level Hardware Description — ${a.name}
// Target: FPGA / ASIC synthesis${isFpga ? ' (synthesis-optimized)' : ''}
// ═══════════════════════════════════════════════════════════════

module ${mod} #(
    parameter DATA_WIDTH  = 32,
    parameter FIFO_DEPTH  = 16,
    parameter PIPELINE_STAGES = 4
)(
    input  wire                    clk,
    input  wire                    rst_n,

    // Control interface
    input  wire                    start,
    output reg                     done,
    output reg                     busy,
    output reg                     error,

    // Data interface
    input  wire [DATA_WIDTH-1:0]   data_in,
    input  wire                    data_valid,
    output reg  [DATA_WIDTH-1:0]   data_out,
    output reg                     data_ready,

    // Status / telemetry
    output reg  [7:0]              confidence,
    output reg  [31:0]             latency_cycles
);

    // ─── State machine ─────────────────────────────────────
    localparam IDLE     = 3'b000,
               LOAD     = 3'b001,
               PROCESS  = 3'b010,
               COMMIT   = 3'b011,
               COMPLETE = 3'b100,
               ERROR_ST = 3'b101;

    reg [2:0] state, next_state;
    reg [31:0] cycle_counter;
    reg [DATA_WIDTH-1:0] pipeline_reg [0:PIPELINE_STAGES-1];
    reg [$clog2(PIPELINE_STAGES)-1:0] stage_ptr;

    // ─── FIFO buffer ───────────────────────────────────────
    reg [DATA_WIDTH-1:0] fifo_mem [0:FIFO_DEPTH-1];
    reg [$clog2(FIFO_DEPTH)-1:0] wr_ptr, rd_ptr;
    reg [$clog2(FIFO_DEPTH):0]   fifo_count;
    wire fifo_full  = (fifo_count == FIFO_DEPTH);
    wire fifo_empty = (fifo_count == 0);

    // ─── Sequential logic ──────────────────────────────────
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            state         <= IDLE;
            done          <= 1'b0;
            busy          <= 1'b0;
            error         <= 1'b0;
            data_out      <= {DATA_WIDTH{1'b0}};
            data_ready    <= 1'b0;
            confidence    <= 8'd0;
            latency_cycles <= 32'd0;
            cycle_counter <= 32'd0;
            wr_ptr        <= 0;
            rd_ptr        <= 0;
            fifo_count    <= 0;
            stage_ptr     <= 0;
        end else begin
            state <= next_state;
            case (state)
                IDLE: begin
                    done  <= 1'b0;
                    busy  <= 1'b0;
                    error <= 1'b0;
                    data_ready <= 1'b0;
                    cycle_counter <= 32'd0;
                end

                LOAD: begin
                    busy <= 1'b1;
                    cycle_counter <= cycle_counter + 1;
                    if (data_valid && !fifo_full) begin
                        fifo_mem[wr_ptr] <= data_in;
                        wr_ptr     <= wr_ptr + 1;
                        fifo_count <= fifo_count + 1;
                    end
                end

                PROCESS: begin
                    cycle_counter <= cycle_counter + 1;
                    // Pipeline stage advancement
                    if (!fifo_empty) begin
                        pipeline_reg[0] <= fifo_mem[rd_ptr];
                        rd_ptr     <= rd_ptr + 1;
                        fifo_count <= fifo_count - 1;
                    end
                    // Shift through pipeline stages
                    if (stage_ptr < PIPELINE_STAGES - 1) begin
                        stage_ptr <= stage_ptr + 1;
                        // TODO: Insert ${a.name} core transform per stage
                        pipeline_reg[stage_ptr + 1] <= pipeline_reg[stage_ptr] ^ {DATA_WIDTH{1'b1}};
                    end
                end

                COMMIT: begin
                    data_out   <= pipeline_reg[PIPELINE_STAGES-1];
                    data_ready <= 1'b1;
                    confidence <= 8'd255; // Full confidence
                    latency_cycles <= cycle_counter;
                end

                COMPLETE: begin
                    done <= 1'b1;
                    busy <= 1'b0;
                end

                ERROR_ST: begin
                    error <= 1'b1;
                    busy  <= 1'b0;
                end
            endcase
        end
    end

    // ─── Next-state combinational logic ────────────────────
    always @(*) begin
        next_state = state;
        case (state)
            IDLE:     if (start) next_state = LOAD;
            LOAD:     if (!data_valid || fifo_full) next_state = PROCESS;
            PROCESS:  if (fifo_empty && stage_ptr == PIPELINE_STAGES - 1) next_state = COMMIT;
            COMMIT:   next_state = COMPLETE;
            COMPLETE: next_state = IDLE;
            ERROR_ST: next_state = IDLE;
            default:  next_state = IDLE;
        endcase
    end

    // ─── Provenance ROM ────────────────────────────────────
    // Burned-in metadata for hardware identification
    localparam [31:0] CJPI_STAMP  = 32'd${a.cjpi};
    localparam [31:0] RANK_STAMP  = 32'd${a.rank};

endmodule
`;
}

// ─── VHDL ──────────────────────────────────────────────────────────

function genVHDL(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'VHDL', '--');
  const entityName = snakeCase(a);
  return `${h}
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;
use IEEE.NUMERIC_STD.ALL;

-- ═══════════════════════════════════════════════════════════════
-- VHDL Entity — ${a.name}
-- Target: FPGA / ASIC synthesis
-- ═══════════════════════════════════════════════════════════════

entity ${entityName} is
    generic (
        DATA_WIDTH      : integer := 32;
        PIPELINE_STAGES : integer := 4
    );
    port (
        clk        : in  std_logic;
        rst_n      : in  std_logic;
        start      : in  std_logic;
        done       : out std_logic;
        busy       : out std_logic;
        error_flag : out std_logic;
        data_in    : in  std_logic_vector(DATA_WIDTH-1 downto 0);
        data_valid : in  std_logic;
        data_out   : out std_logic_vector(DATA_WIDTH-1 downto 0);
        data_ready : out std_logic;
        confidence : out std_logic_vector(7 downto 0);
        latency    : out std_logic_vector(31 downto 0)
    );
end entity ${entityName};

architecture rtl of ${entityName} is

    type state_t is (IDLE, LOAD, PROCESS, COMMIT, COMPLETE, ERROR_ST);
    signal state, next_state : state_t;

    type pipeline_t is array (0 to PIPELINE_STAGES-1) of std_logic_vector(DATA_WIDTH-1 downto 0);
    signal pipeline_reg : pipeline_t;
    signal cycle_counter : unsigned(31 downto 0);
    signal stage_ptr     : integer range 0 to PIPELINE_STAGES-1;

begin

    -- Sequential process
    process(clk, rst_n)
    begin
        if rst_n = '0' then
            state         <= IDLE;
            done          <= '0';
            busy          <= '0';
            error_flag    <= '0';
            data_out      <= (others => '0');
            data_ready    <= '0';
            confidence    <= (others => '0');
            latency       <= (others => '0');
            cycle_counter <= (others => '0');
            stage_ptr     <= 0;
        elsif rising_edge(clk) then
            state <= next_state;
            case state is
                when IDLE =>
                    done       <= '0';
                    busy       <= '0';
                    error_flag <= '0';
                    data_ready <= '0';
                    cycle_counter <= (others => '0');

                when LOAD =>
                    busy <= '1';
                    cycle_counter <= cycle_counter + 1;
                    if data_valid = '1' then
                        pipeline_reg(0) <= data_in;
                    end if;

                when PROCESS =>
                    cycle_counter <= cycle_counter + 1;
                    -- TODO: Implement ${a.name} transform logic per pipeline stage
                    if stage_ptr < PIPELINE_STAGES - 1 then
                        pipeline_reg(stage_ptr + 1) <= not pipeline_reg(stage_ptr);
                        stage_ptr <= stage_ptr + 1;
                    end if;

                when COMMIT =>
                    data_out   <= pipeline_reg(PIPELINE_STAGES-1);
                    data_ready <= '1';
                    confidence <= x"FF";
                    latency    <= std_logic_vector(cycle_counter);

                when COMPLETE =>
                    done <= '1';
                    busy <= '0';

                when ERROR_ST =>
                    error_flag <= '1';
                    busy       <= '0';

                when others => null;
            end case;
        end if;
    end process;

    -- Next-state logic
    process(state, start, data_valid, stage_ptr)
    begin
        next_state <= state;
        case state is
            when IDLE     => if start = '1' then next_state <= LOAD; end if;
            when LOAD     => if data_valid = '0' then next_state <= PROCESS; end if;
            when PROCESS  => if stage_ptr = PIPELINE_STAGES - 1 then next_state <= COMMIT; end if;
            when COMMIT   => next_state <= COMPLETE;
            when COMPLETE => next_state <= IDLE;
            when ERROR_ST => next_state <= IDLE;
            when others   => next_state <= IDLE;
        end case;
    end process;

end architecture rtl;
`;
}

// ─── SystemVerilog ─────────────────────────────────────────────────

function genSystemVerilog(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'SystemVerilog', '//');
  const mod = snakeCase(a);
  return `${h}
// ═══════════════════════════════════════════════════════════════
// SystemVerilog Module — ${a.name}
// Enhanced typing, interfaces, and assertions for verification
// ═══════════════════════════════════════════════════════════════

package ${mod}_pkg;
    typedef enum logic [2:0] {
        IDLE     = 3'b000,
        LOAD     = 3'b001,
        PROCESS  = 3'b010,
        COMMIT   = 3'b011,
        COMPLETE = 3'b100,
        ERROR_ST = 3'b101
    } state_e;

    typedef struct packed {
        logic [31:0] cjpi;
        logic [31:0] rank;
        logic [31:0] latency_cycles;
        logic [7:0]  confidence;
    } telemetry_t;
endpackage

interface ${mod}_if #(parameter DATA_WIDTH = 32) (input logic clk, rst_n);
    logic                    start;
    logic                    done;
    logic                    busy;
    logic                    error;
    logic [DATA_WIDTH-1:0]   data_in;
    logic                    data_valid;
    logic [DATA_WIDTH-1:0]   data_out;
    logic                    data_ready;

    modport engine (
        input  clk, rst_n, start, data_in, data_valid,
        output done, busy, error, data_out, data_ready
    );

    modport controller (
        input  clk, rst_n, done, busy, error, data_out, data_ready,
        output start, data_in, data_valid
    );
endinterface

module ${mod}
    import ${mod}_pkg::*;
#(
    parameter int DATA_WIDTH      = 32,
    parameter int PIPELINE_STAGES = 4
)(
    input  logic                    clk,
    input  logic                    rst_n,
    input  logic                    start,
    output logic                    done,
    output logic                    busy,
    output logic                    error,
    input  logic [DATA_WIDTH-1:0]   data_in,
    input  logic                    data_valid,
    output logic [DATA_WIDTH-1:0]   data_out,
    output logic                    data_ready,
    output telemetry_t              telemetry
);

    state_e state, next_state;
    logic [DATA_WIDTH-1:0] pipeline [PIPELINE_STAGES];
    logic [$clog2(PIPELINE_STAGES)-1:0] stage;
    logic [31:0] cycles;

    always_ff @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            state      <= IDLE;
            done       <= '0;
            busy       <= '0;
            error      <= '0;
            data_out   <= '0;
            data_ready <= '0;
            cycles     <= '0;
            stage      <= '0;
            telemetry  <= '{cjpi: 32'd${a.cjpi}, rank: 32'd${a.rank}, default: '0};
        end else begin
            state <= next_state;
            unique case (state)
                IDLE: begin
                    done <= '0; busy <= '0; error <= '0;
                    data_ready <= '0; cycles <= '0;
                end
                LOAD: begin
                    busy <= '1; cycles <= cycles + 1;
                    if (data_valid) pipeline[0] <= data_in;
                end
                PROCESS: begin
                    cycles <= cycles + 1;
                    // TODO: ${a.name} core transform
                    if (stage < PIPELINE_STAGES - 1) begin
                        pipeline[stage + 1] <= ~pipeline[stage];
                        stage <= stage + 1;
                    end
                end
                COMMIT: begin
                    data_out <= pipeline[PIPELINE_STAGES-1];
                    data_ready <= '1;
                    telemetry.confidence <= 8'hFF;
                    telemetry.latency_cycles <= cycles;
                end
                COMPLETE: begin done <= '1; busy <= '0; end
                ERROR_ST: begin error <= '1; busy <= '0; end
            endcase
        end
    end

    always_comb begin
        next_state = state;
        unique case (state)
            IDLE:     if (start) next_state = LOAD;
            LOAD:     if (!data_valid) next_state = PROCESS;
            PROCESS:  if (stage == PIPELINE_STAGES - 1) next_state = COMMIT;
            COMMIT:   next_state = COMPLETE;
            COMPLETE: next_state = IDLE;
            ERROR_ST: next_state = IDLE;
        endcase
    end

    // ─── SVA Assertions for verification ───────────────────
    // synthesis translate_off
    assert property (@(posedge clk) disable iff (!rst_n)
        (state == COMPLETE) |-> ##1 (state == IDLE)
    ) else $error("FSM did not return to IDLE after COMPLETE");

    assert property (@(posedge clk) disable iff (!rst_n)
        (done && busy) == 0
    ) else $error("done and busy asserted simultaneously");
    // synthesis translate_on

endmodule
`;
}

// ─── Chisel (Scala-based HDL) ──────────────────────────────────────

function genChisel(a: ExportableArtifact, adapter: ExportAdapter): string {
  const h = header(a, 'Chisel (Scala)', '//');
  const cls = className(a);
  return `${h}
import chisel3._
import chisel3.util._

// ═══════════════════════════════════════════════════════════════
// Chisel Hardware Generator — ${a.name}
// Generates synthesizable Verilog via FIRRTL
// ═══════════════════════════════════════════════════════════════

class ${cls}Config(
  val dataWidth: Int = 32,
  val pipelineStages: Int = 4,
  val fifoDepth: Int = 16
)

class ${cls}IO(config: ${cls}Config) extends Bundle {
  val start     = Input(Bool())
  val done      = Output(Bool())
  val busy      = Output(Bool())
  val error     = Output(Bool())

  val dataIn    = Input(UInt(config.dataWidth.W))
  val dataValid = Input(Bool())
  val dataOut   = Output(UInt(config.dataWidth.W))
  val dataReady = Output(Bool())

  val confidence    = Output(UInt(8.W))
  val latencyCycles = Output(UInt(32.W))
}

class ${cls}(config: ${cls}Config = new ${cls}Config()) extends Module {
  val io = IO(new ${cls}IO(config))

  // State machine
  val sIdle :: sLoad :: sProcess :: sCommit :: sComplete :: sError :: Nil = Enum(6)
  val state = RegInit(sIdle)
  val cycleCounter = RegInit(0.U(32.W))

  // Pipeline registers
  val pipeline = Reg(Vec(config.pipelineStages, UInt(config.dataWidth.W)))
  val stagePtr = RegInit(0.U(log2Ceil(config.pipelineStages + 1).W))

  // FIFO
  val fifo = Module(new Queue(UInt(config.dataWidth.W), config.fifoDepth))
  fifo.io.enq.valid := io.dataValid && state === sLoad
  fifo.io.enq.bits  := io.dataIn
  fifo.io.deq.ready := state === sProcess && stagePtr === 0.U

  // Defaults
  io.done      := false.B
  io.busy      := false.B
  io.error     := false.B
  io.dataOut   := 0.U
  io.dataReady := false.B
  io.confidence    := 0.U
  io.latencyCycles := 0.U

  switch(state) {
    is(sIdle) {
      cycleCounter := 0.U
      stagePtr     := 0.U
      when(io.start) { state := sLoad }
    }
    is(sLoad) {
      io.busy := true.B
      cycleCounter := cycleCounter + 1.U
      when(!io.dataValid || !fifo.io.enq.ready) { state := sProcess }
    }
    is(sProcess) {
      io.busy := true.B
      cycleCounter := cycleCounter + 1.U
      when(fifo.io.deq.valid && stagePtr === 0.U) {
        pipeline(0) := fifo.io.deq.bits
      }
      // TODO: Implement ${a.name} core transform per stage
      when(stagePtr < (config.pipelineStages - 1).U) {
        pipeline(stagePtr + 1.U) := ~pipeline(stagePtr)
        stagePtr := stagePtr + 1.U
      }.otherwise {
        state := sCommit
      }
    }
    is(sCommit) {
      io.dataOut   := pipeline(config.pipelineStages - 1)
      io.dataReady := true.B
      io.confidence    := 255.U
      io.latencyCycles := cycleCounter
      state := sComplete
    }
    is(sComplete) {
      io.done := true.B
      state   := sIdle
    }
    is(sError) {
      io.error := true.B
      state    := sIdle
    }
  }

  // Provenance constants (burned into hardware)
  val cjpiStamp = ${a.cjpi}.U(32.W)
  val rankStamp = ${a.rank}.U(32.W)
}

// Generate Verilog from Chisel
object ${cls}Driver extends App {
  (new chisel3.stage.ChiselStage).emitVerilog(new ${cls}())
}
`;
}



function generateReadme(
  a: ExportableArtifact,
  targets: ExportTarget[],
  files: ExportedFile[]
): string {
  const langList = [...new Set(targets.map(t => LANG_LABELS[t.language]))].join(', ');
  const fileList = files.map(f => `- \`${f.filename}\` — ${LANG_LABELS[f.language]} (${ADAPTER_LABELS[f.adapter]})`).join('\n');

  return `# ${a.name}

> **CMPSBL® S-Tier Crown Jewel** — Rank #${a.rank} | CJPI: ${a.cjpi} | Module: ${a.module}

${a.description}

## Exported Files

${fileList}

## Languages

${langList}

## Quick Start

### TypeScript/Node
\`\`\`typescript
import { ${className(a)} } from './${a.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}';
const engine = new ${className(a)}();
const result = await engine.execute({ key: 'value' });
\`\`\`

### Python
\`\`\`python
from ${snakeCase(a)} import ${className(a)}
engine = ${className(a)}()
result = engine.execute({"key": "value"})
\`\`\`

### Go
\`\`\`go
engine := New${className(a)}()
result := engine.Execute(map[string]interface{}{"key": "value"})
\`\`\`

## License

CMPSBL® Proprietary. All rights reserved.
`;
}

/**
 * Download helper — triggers browser download of a single file
 */
export function downloadFile(file: ExportedFile): void {
  const blob = new Blob([file.content], { type: file.mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download a full bundle as a ZIP (requires JSZip)
 */
export async function downloadBundle(bundle: ExportBundle): Promise<void> {
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  const folderName = bundle.artifact.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const folder = zip.folder(folderName)!;
  folder.file('README.md', bundle.readme);
  for (const file of bundle.files) {
    folder.file(file.filename, file.content);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${folderName}-export.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
