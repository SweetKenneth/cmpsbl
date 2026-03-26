/**
 * Universal Export Adapter — Artifact Export Runtime
 * 
 * Inputs: S-tier discovery manifest (crystallized pipelines)
 * Pipeline: map_module_chain → generate_scaffold → attach_runtime → create_tests → package
 * 
 * Targets: 18 software languages + 7 hardware targets
 * Export events logged in audit ledger.
 */

import { emit } from '../events/emit';
import { generateHonestyDisclaimer } from '../../export/bridge-execution-honesty';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ExportLanguage =
  | 'typescript' | 'javascript' | 'python' | 'rust' | 'go' | 'java'
  | 'csharp' | 'swift' | 'kotlin' | 'ruby' | 'php' | 'dart'
  | 'elixir' | 'scala' | 'haskell' | 'lua' | 'zig' | 'cpp';

export type HardwareTarget =
  | 'x86_64' | 'arm64' | 'riscv' | 'wasm' | 'esp32' | 'fpga' | 'tpu';

export interface ExportManifest {
  id: string;
  sourceModules: string[];
  pipelineSteps: string[];
  capabilities: string[];
  metadata: Record<string, unknown>;
}

export interface ExportBundle {
  id: string;
  manifestId: string;
  language: ExportLanguage;
  hardwareTarget?: HardwareTarget;
  files: ExportFile[];
  testCount: number;
  createdAt: number;
  sizeBytes: number;
}

export interface ExportFile {
  path: string;
  content: string;
  type: 'scaffold' | 'runtime' | 'test' | 'config' | 'readme';
}

// ═══════════════════════════════════════════════════════════════
// SHARED HELPERS
// ═══════════════════════════════════════════════════════════════

function steps(manifest: ExportManifest): string[] {
  return manifest.pipelineSteps.length > 0 ? manifest.pipelineSteps : manifest.sourceModules;
}

function readmeFile(manifest: ExportManifest, lang: string, buildCmd: string, testCmd: string): ExportFile {
  return {
    path: 'README.md',
    type: 'readme',
    content: [
      `# CMPSBL® Exported Pipeline — ${lang}`,
      ``,
      `**Manifest:** ${manifest.id}`,
      `**Modules:** ${manifest.sourceModules.join(', ')}`,
      `**Capabilities:** ${manifest.capabilities.join(', ')}`,
      ``,
      `## Build`,
      '```',
      buildCmd,
      '```',
      ``,
      `## Test`,
      '```',
      testCmd,
      '```',
      ``,
      `## Execution Model`,
      ``,
      `CJPI scoring and tiering run via the bundled TypeScript Mini-Runtime™.`,
      `Native ${lang} execution requires a server-side ${lang} runtime.`,
      `See the honesty notice in the source files for details.`,
      ``,
      `© CMPSBL® — All rights reserved.`,
    ].join('\n'),
  };
}

// ═══════════════════════════════════════════════════════════════
// LANGUAGE SCAFFOLDERS
// ═══════════════════════════════════════════════════════════════

const SCAFFOLDERS: Record<ExportLanguage, (manifest: ExportManifest) => ExportFile[]> = {
  typescript: (m) => scaffoldTS(m),
  javascript: (m) => scaffoldTS(m),
  python: (m) => scaffoldPython(m),
  rust: (m) => scaffoldRust(m),
  go: (m) => scaffoldGo(m),
  java: (m) => scaffoldJava(m),
  csharp: (m) => scaffoldCSharp(m),
  swift: (m) => scaffoldSwift(m),
  kotlin: (m) => scaffoldKotlin(m),
  ruby: (m) => scaffoldRuby(m),
  php: (m) => scaffoldPHP(m),
  dart: (m) => scaffoldDart(m),
  elixir: (m) => scaffoldElixir(m),
  scala: (m) => scaffoldScala(m),
  haskell: (m) => scaffoldHaskell(m),
  lua: (m) => scaffoldLua(m),
  zig: (m) => scaffoldZig(m),
  cpp: (m) => scaffoldCpp(m),
};

// ── TypeScript ──────────────────────────────────────────────────

function scaffoldTS(manifest: ExportManifest): ExportFile[] {
  const s = steps(manifest);
  return [
    {
      path: 'src/index.ts',
      type: 'scaffold',
      content: [
        `// CMPSBL® Export Adapter — TypeScript`,
        `// Manifest: ${manifest.id}`,
        ``,
        `export interface PipelineConfig {`,
        ...s.map(st => `  ${st}: boolean;`),
        `}`,
        ``,
        `export interface PipelineResult {`,
        `  success: boolean;`,
        `  output: Record<string, unknown>;`,
        `  stagesCompleted: number;`,
        `  totalStages: number;`,
        `  durationMs: number;`,
        `}`,
        ``,
        `export async function runPipeline(config: PipelineConfig, input: unknown): Promise<PipelineResult> { if (typeof input !== 'object' || input === null) throw new TypeError('Invalid input: expected an object'); const inputKeys = Object.keys(input); if (inputKeys.length === 0) throw new Error('Invalid input: object cannot be empty'); if (inputKeys.some(key => typeof key !== 'string' || key.trim() === '')) throw new TypeError('Invalid input: keys must be non-empty strings');`,
        `  const start = Date.now();`,
        `  let current = input;`,
        `  let completed = 0;`,
        `  const stages = ${JSON.stringify(s)};`,
        ``,
        `  for (const stage of stages) {`,
        `    if (config[stage as keyof PipelineConfig]) {`,
        `      current = { stage, input: current, timestamp: Date.now() };`,
        `      completed++;`,
        `    }`,
        `  }`,
        ``,
        `  return {`,
        `    success: completed === stages.length,`,
        `    output: current,`,
        `    stagesCompleted: completed,`,
        `    totalStages: stages.length,`,
        `    durationMs: Date.now() - start,`,
        `  };`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'src/runtime.ts',
      type: 'runtime',
      content: [
        `// Mini-Runtime™ connector`,
        `export const MODULES = ${JSON.stringify(manifest.sourceModules)};`,
        `export const CAPABILITIES = ${JSON.stringify(manifest.capabilities)};`,
        `export const MANIFEST_ID = '${manifest.id}';`,
      ].join('\n'),
    },
    {
      path: 'tests/pipeline.test.ts',
      type: 'test',
      content: [
        `import { runPipeline, PipelineConfig } from '../src/index';`,
        ``,
        `test('pipeline executes all stages', async () => {`,
        `  const config = { ${s.map(st => `${st}: true`).join(', ')} } as PipelineConfig;`,
        `  const result = await runPipeline(config, { test: true });`,
        `  expect(result.success).toBe(true);`,
        `  expect(result.stagesCompleted).toBe(${s.length});`,
        `});`,
        ``,
        `test('pipeline handles partial config', async () => {`,
        `  const result = await runPipeline({} as PipelineConfig, {});;`,
        `  expect(result.stagesCompleted).toBe(0);`,
        `});`,
      ].join('\n'),
    },
    readmeFile(manifest, 'TypeScript', 'npx tsc && node dist/index.js', 'npx vitest'),
  ];
}

// ── Python ──────────────────────────────────────────────────────

function scaffoldPython(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('python', '#');
  const s = steps(manifest);
  return [
    {
      path: 'src/pipeline.py',
      type: 'scaffold',
      content: [
        honesty,
        `"""CMPSBL® Exported Pipeline — Python"""`,
        ``,
        `import time`,
        `from dataclasses import dataclass`,
        `from typing import Any, Dict, List`,
        ``,
        `MODULES: List[str] = ${JSON.stringify(manifest.sourceModules)}`,
        `STAGES: List[str] = ${JSON.stringify(s)}`,
        `MANIFEST_ID: str = "${manifest.id}"`,
        ``,
        ``,
        `@dataclass`,
        `class PipelineResult:`,
        `    success: bool`,
        `    output: Any`,
        `    stages_completed: int`,
        `    total_stages: int`,
        `    duration_ms: float`,
        ``,
        ``,
        `def run_pipeline(config: Dict[str, bool], input_data: Any) -> PipelineResult:`,
        `    start = time.time()`,
        `    current = input_data`,
        `    completed = 0`,
        `    for stage in STAGES:`,
        `        if config.get(stage, False):`,
        `            current = {"stage": stage, "input": current, "timestamp": time.time()}`,
        `            completed += 1`,
        `    return PipelineResult(`,
        `        success=completed == len(STAGES),`,
        `        output=current,`,
        `        stages_completed=completed,`,
        `        total_stages=len(STAGES),`,
        `        duration_ms=(time.time() - start) * 1000,`,
        `    )`,
        ``,
        ``,
        `if __name__ == "__main__":`,
        `    config = {s: True for s in STAGES}`,
        `    result = run_pipeline(config, {"test": True})`,
        `    print(f"Pipeline {MANIFEST_ID}: {result.stages_completed}/{result.total_stages} stages")`,
      ].join('\n'),
    },
    {
      path: 'tests/test_pipeline.py',
      type: 'test',
      content: [
        `"""Auto-generated test harness for CMPSBL® exported pipeline."""`,
        `import pytest`,
        `from src.pipeline import run_pipeline, STAGES, MANIFEST_ID`,
        ``,
        `def test_full_pipeline():`,
        `    config = {s: True for s in STAGES}`,
        `    result = run_pipeline(config, {"test": True})`,
        `    assert result.success is True`,
        `    assert result.stages_completed == len(STAGES)`,
        `    assert result.duration_ms >= 0`,
        ``,
        `def test_empty_config():`,
        `    result = run_pipeline({}, {})`,
        `    assert result.stages_completed == 0`,
        ``,
        `def test_manifest_id():`,
        `    assert MANIFEST_ID and len(MANIFEST_ID) > 0`,
      ].join('\n'),
    },
    {
      path: 'setup.py',
      type: 'config',
      content: `from setuptools import setup, find_packages\nsetup(name="cmpsbl-pipeline-${manifest.id}", version="1.0.0", packages=find_packages())\n`,
    },
    { path: 'Makefile', type: 'config', content: `all:\n\tpython -m src.pipeline\ntest:\n\tpytest tests/\n` },
    readmeFile(manifest, 'Python', 'python -m src.pipeline', 'pytest tests/'),
  ];
}

// ── Rust ─────────────────────────────────────────────────────────

function scaffoldRust(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('rust', '//');
  const s = steps(manifest);
  return [
    {
      path: 'src/lib.rs',
      type: 'scaffold',
      content: [
        honesty,
        `//! CMPSBL® Exported Pipeline — Rust`,
        `use std::collections::HashMap;`,
        `use std::time::Instant;`,
        ``,
        `pub const MANIFEST_ID: &str = "${manifest.id}";`,
        `pub const MODULES: &[&str] = &[${manifest.sourceModules.map(m => `"${m}"`).join(', ')}];`,
        `pub const STAGES: &[&str] = &[${s.map(st => `"${st}"`).join(', ')}];`,
        ``,
        `#[derive(Debug)]`,
        `pub struct PipelineResult {`,
        `    pub success: bool,`,
        `    pub stages_completed: usize,`,
        `    pub total_stages: usize,`,
        `    pub duration_ms: f64,`,
        `}`,
        ``,
        `pub fn run_pipeline(config: &HashMap<String, bool>, _input: &str) -> PipelineResult {`,
        `    let start = Instant::now();`,
        `    let mut completed = 0usize;`,
        `    for stage in STAGES {`,
        `        if *config.get(*stage).unwrap_or(&false) { completed += 1; }`,
        `    }`,
        `    PipelineResult {`,
        `        success: completed == STAGES.len(),`,
        `        stages_completed: completed,`,
        `        total_stages: STAGES.len(),`,
        `        duration_ms: start.elapsed().as_secs_f64() * 1000.0,`,
        `    }`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'src/main.rs',
      type: 'scaffold',
      content: [
        `use std::collections::HashMap;`,
        ``,
        `fn main() {`,
        `    let mut config = HashMap::new();`,
        `    for stage in cmpsbl_pipeline::STAGES { config.insert(stage.to_string(), true); }`,
        `    let result = cmpsbl_pipeline::run_pipeline(&config, "{}");`,
        `    println!("Pipeline {}: {}/{} stages in {:.2}ms",`,
        `        cmpsbl_pipeline::MANIFEST_ID, result.stages_completed, result.total_stages, result.duration_ms);`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'tests/pipeline_test.rs',
      type: 'test',
      content: [
        `use std::collections::HashMap;`,
        ``,
        `#[test]`,
        `fn test_full_pipeline() {`,
        `    let mut config = HashMap::new();`,
        `    for stage in cmpsbl_pipeline::STAGES { config.insert(stage.to_string(), true); }`,
        `    let result = cmpsbl_pipeline::run_pipeline(&config, "{}");`,
        `    assert!(result.success);`,
        `    assert_eq!(result.stages_completed, cmpsbl_pipeline::STAGES.len());`,
        `}`,
        ``,
        `#[test]`,
        `fn test_empty_config() {`,
        `    let result = cmpsbl_pipeline::run_pipeline(&HashMap::new(), "{}");`,
        `    assert_eq!(result.stages_completed, 0);`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'Cargo.toml',
      type: 'config',
      content: `[package]\nname = "cmpsbl-pipeline"\nversion = "1.0.0"\nedition = "2021"\n\n[lib]\nname = "cmpsbl_pipeline"\npath = "src/lib.rs"\n`,
    },
    readmeFile(manifest, 'Rust', 'cargo build --release', 'cargo test'),
  ];
}

// ── Go ──────────────────────────────────────────────────────────

function scaffoldGo(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('go', '//');
  const s = steps(manifest);
  return [
    {
      path: 'pipeline/pipeline.go',
      type: 'scaffold',
      content: [
        honesty,
        `package pipeline`,
        ``,
        `import "time"`,
        ``,
        `var ManifestID = "${manifest.id}"`,
        `var Modules = []string{${manifest.sourceModules.map(m => `"${m}"`).join(', ')}}`,
        `var Stages = []string{${s.map(st => `"${st}"`).join(', ')}}`,
        ``,
        `type PipelineResult struct {`,
        `\tSuccess         bool`,
        `\tStagesCompleted int`,
        `\tTotalStages     int`,
        `\tDurationMs      float64`,
        `}`,
        ``,
        `func RunPipeline(config map[string]bool, input string) PipelineResult {`,
        `\tstart := time.Now()`,
        `\tcompleted := 0`,
        `\tfor _, stage := range Stages {`,
        `\t\tif config[stage] { completed++ }`,
        `\t}`,
        `\treturn PipelineResult{`,
        `\t\tSuccess: completed == len(Stages),`,
        `\t\tStagesCompleted: completed,`,
        `\t\tTotalStages: len(Stages),`,
        `\t\tDurationMs: float64(time.Since(start).Microseconds()) / 1000.0,`,
        `\t}`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'pipeline/pipeline_test.go',
      type: 'test',
      content: [
        `package pipeline`,
        ``,
        `import "testing"`,
        ``,
        `func TestFullPipeline(t *testing.T) {`,
        `\tconfig := make(map[string]bool)`,
        `\tfor _, s := range Stages { config[s] = true }`,
        `\tresult := RunPipeline(config, "{}")`,
        `\tif !result.Success { t.Error("expected success") }`,
        `\tif result.StagesCompleted != len(Stages) { t.Errorf("expected %d stages", len(Stages)) }`,
        `}`,
        ``,
        `func TestEmptyConfig(t *testing.T) {`,
        `\tresult := RunPipeline(make(map[string]bool), "{}")`,
        `\tif result.StagesCompleted != 0 { t.Error("expected 0 stages") }`,
        `}`,
      ].join('\n'),
    },
    { path: 'go.mod', type: 'config', content: `module cmpsbl-pipeline\n\ngo 1.21\n` },
    readmeFile(manifest, 'Go', 'go build ./...', 'go test ./...'),
  ];
}

// ── Java ────────────────────────────────────────────────────────

function scaffoldJava(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('java', '//');
  const s = steps(manifest);
  return [
    {
      path: 'src/main/java/com/cmpsbl/Pipeline.java',
      type: 'scaffold',
      content: [
        honesty,
        `package com.cmpsbl;`,
        `import java.util.*;`,
        ``,
        `public class Pipeline {`,
        `    public static final String MANIFEST_ID = "${manifest.id}";`,
        `    public static final List<String> STAGES = List.of(${s.map(st => `"${st}"`).join(', ')});`,
        ``,
        `    public record Result(boolean success, int stagesCompleted, int totalStages, double durationMs) {}`,
        ``,
        `    public static Result run(Map<String, Boolean> config, Object input) {`,
        `        long start = System.nanoTime();`,
        `        int completed = 0;`,
        `        for (String stage : STAGES) {`,
        `            if (Boolean.TRUE.equals(config.get(stage))) completed++;`,
        `        }`,
        `        double ms = (System.nanoTime() - start) / 1_000_000.0;`,
        `        return new Result(completed == STAGES.size(), completed, STAGES.size(), ms);`,
        `    }`,
        ``,
        `    public static void main(String[] args) {`,
        `        var config = new HashMap<String, Boolean>();`,
        `        STAGES.forEach(s -> config.put(s, true));`,
        `        var result = run(config, Map.of());`,
        `        System.out.printf("Pipeline %s: %d/%d stages in %.2fms%n",`,
        `            MANIFEST_ID, result.stagesCompleted(), result.totalStages(), result.durationMs());`,
        `    }`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'src/test/java/com/cmpsbl/PipelineTest.java',
      type: 'test',
      content: [
        `package com.cmpsbl;`,
        `import org.junit.jupiter.api.Test;`,
        `import java.util.*;`,
        `import static org.junit.jupiter.api.Assertions.*;`,
        ``,
        `class PipelineTest {`,
        `    @Test void fullPipeline() {`,
        `        var config = new HashMap<String, Boolean>();`,
        `        Pipeline.STAGES.forEach(s -> config.put(s, true));`,
        `        var r = Pipeline.run(config, Map.of());`,
        `        assertTrue(r.success());`,
        `        assertEquals(Pipeline.STAGES.size(), r.stagesCompleted());`,
        `    }`,
        `    @Test void emptyConfig() {`,
        `        var r = Pipeline.run(Map.of(), Map.of());`,
        `        assertEquals(0, r.stagesCompleted());`,
        `    }`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'pom.xml',
      type: 'config',
      content: `<?xml version="1.0" encoding="UTF-8"?>\n<project><modelVersion>4.0.0</modelVersion>\n  <groupId>com.cmpsbl</groupId><artifactId>pipeline</artifactId><version>1.0.0</version>\n  <properties><maven.compiler.release>17</maven.compiler.release></properties>\n  <dependencies><dependency><groupId>org.junit.jupiter</groupId><artifactId>junit-jupiter</artifactId><version>5.10.0</version><scope>test</scope></dependency></dependencies>\n</project>\n`,
    },
    readmeFile(manifest, 'Java', 'mvn compile', 'mvn test'),
  ];
}

// ── C# ──────────────────────────────────────────────────────────

function scaffoldCSharp(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('csharp', '//');
  const s = steps(manifest);
  return [
    {
      path: 'src/Pipeline.cs',
      type: 'scaffold',
      content: [
        honesty,
        `using System; using System.Collections.Generic; using System.Diagnostics; using System.Linq;`,
        `namespace Cmpsbl;`,
        ``,
        `public record PipelineResult(bool Success, int StagesCompleted, int TotalStages, double DurationMs);`,
        ``,
        `public static class Pipeline {`,
        `    public const string ManifestId = "${manifest.id}";`,
        `    public static readonly string[] Stages = { ${s.map(st => `"${st}"`).join(', ')} };`,
        ``,
        `    public static PipelineResult Run(Dictionary<string, bool> config, object input) {`,
        `        var sw = Stopwatch.StartNew();`,
        `        int completed = Stages.Count(s => config.TryGetValue(s, out var v) && v);`,
        `        sw.Stop();`,
        `        return new(completed == Stages.Length, completed, Stages.Length, sw.Elapsed.TotalMilliseconds);`,
        `    }`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'tests/PipelineTest.cs',
      type: 'test',
      content: [
        `using Xunit; using Cmpsbl; using System.Collections.Generic;`,
        `public class PipelineTest {`,
        `    [Fact] public void FullPipeline() {`,
        `        var config = new Dictionary<string, bool>();`,
        `        foreach (var s in Pipeline.Stages) config[s] = true;`,
        `        var r = Pipeline.Run(config, new {});`,
        `        Assert.True(r.Success);`,
        `        Assert.Equal(Pipeline.Stages.Length, r.StagesCompleted);`,
        `    }`,
        `    [Fact] public void EmptyConfig() {`,
        `        var r = Pipeline.Run(new(), new {});`,
        `        Assert.Equal(0, r.StagesCompleted);`,
        `    }`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'CmpsblPipeline.csproj',
      type: 'config',
      content: `<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><TargetFramework>net8.0</TargetFramework></PropertyGroup></Project>\n`,
    },
    readmeFile(manifest, 'C#', 'dotnet build', 'dotnet test'),
  ];
}

// ── Swift ───────────────────────────────────────────────────────

function scaffoldSwift(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('swift', '//');
  const s = steps(manifest);
  return [
    {
      path: 'Sources/Pipeline/Pipeline.swift',
      type: 'scaffold',
      content: [
        honesty,
        `import Foundation`,
        ``,
        `public struct PipelineResult {`,
        `    public let success: Bool`,
        `    public let stagesCompleted: Int`,
        `    public let totalStages: Int`,
        `    public let durationMs: Double`,
        `}`,
        ``,
        `public enum Pipeline {`,
        `    public static let manifestId = "${manifest.id}"`,
        `    public static let stages: [String] = [${s.map(st => `"${st}"`).join(', ')}]`,
        ``,
        `    public static func run(config: [String: Bool], input: Any) -> PipelineResult {`,
        `        let start = CFAbsoluteTimeGetCurrent()`,
        `        let completed = stages.filter { config[$0] == true }.count`,
        `        let ms = (CFAbsoluteTimeGetCurrent() - start) * 1000`,
        `        return PipelineResult(success: completed == stages.count, stagesCompleted: completed, totalStages: stages.count, durationMs: ms)`,
        `    }`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'Tests/PipelineTests/PipelineTests.swift',
      type: 'test',
      content: [
        `import XCTest`,
        `@testable import Pipeline`,
        ``,
        `final class PipelineTests: XCTestCase {`,
        `    func testFullPipeline() {`,
        `        var config: [String: Bool] = [:]`,
        `        Pipeline.stages.forEach { config[$0] = true }`,
        `        let r = Pipeline.run(config: config, input: [:])`,
        `        XCTAssertTrue(r.success)`,
        `        XCTAssertEqual(r.stagesCompleted, Pipeline.stages.count)`,
        `    }`,
        `    func testEmptyConfig() {`,
        `        let r = Pipeline.run(config: [:], input: [:])`,
        `        XCTAssertEqual(r.stagesCompleted, 0)`,
        `    }`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'Package.swift',
      type: 'config',
      content: `// swift-tools-version: 5.9\nimport PackageDescription\nlet package = Package(name: "CmpsblPipeline", targets: [.target(name: "Pipeline"), .testTarget(name: "PipelineTests", dependencies: ["Pipeline"])])\n`,
    },
    readmeFile(manifest, 'Swift', 'swift build', 'swift test'),
  ];
}

// ── Kotlin ──────────────────────────────────────────────────────

function scaffoldKotlin(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('kotlin', '//');
  const s = steps(manifest);
  return [
    {
      path: 'src/main/kotlin/Pipeline.kt',
      type: 'scaffold',
      content: [
        honesty,
        `package com.cmpsbl`,
        ``,
        `data class PipelineResult(val success: Boolean, val stagesCompleted: Int, val totalStages: Int, val durationMs: Double)`,
        ``,
        `object Pipeline {`,
        `    const val MANIFEST_ID = "${manifest.id}"`,
        `    val STAGES = listOf(${s.map(st => `"${st}"`).join(', ')})`,
        ``,
        `    fun run(config: Map<String, Boolean>, input: Any): PipelineResult {`,
        `        val start = System.nanoTime()`,
        `        val completed = STAGES.count { config[it] == true }`,
        `        val ms = (System.nanoTime() - start) / 1_000_000.0`,
        `        return PipelineResult(completed == STAGES.size, completed, STAGES.size, ms)`,
        `    }`,
        `}`,
        ``,
        `fun main() {`,
        `    val config = Pipeline.STAGES.associateWith { true }`,
        `    val result = Pipeline.run(config, mapOf<String, Any>())`,
        `    println("Pipeline \${Pipeline.MANIFEST_ID}: \${result.stagesCompleted}/\${result.totalStages}")`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'src/test/kotlin/PipelineTest.kt',
      type: 'test',
      content: [
        `package com.cmpsbl`,
        `import org.junit.jupiter.api.Test`,
        `import org.junit.jupiter.api.Assertions.*`,
        ``,
        `class PipelineTest {`,
        `    @Test fun fullPipeline() {`,
        `        val config = Pipeline.STAGES.associateWith { true }`,
        `        val r = Pipeline.run(config, mapOf<String, Any>())`,
        `        assertTrue(r.success)`,
        `        assertEquals(Pipeline.STAGES.size, r.stagesCompleted)`,
        `    }`,
        `    @Test fun emptyConfig() {`,
        `        val r = Pipeline.run(emptyMap(), mapOf<String, Any>())`,
        `        assertEquals(0, r.stagesCompleted)`,
        `    }`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'build.gradle.kts',
      type: 'config',
      content: `plugins { kotlin("jvm") version "1.9.0"; application }\nrepositories { mavenCentral() }\ndependencies { testImplementation("org.junit.jupiter:junit-jupiter:5.10.0") }\napplication { mainClass.set("com.cmpsbl.PipelineKt") }\n`,
    },
    readmeFile(manifest, 'Kotlin', 'gradle build', 'gradle test'),
  ];
}

// ── Ruby ────────────────────────────────────────────────────────

function scaffoldRuby(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('ruby', '#');
  const s = steps(manifest);
  return [
    {
      path: 'lib/pipeline.rb',
      type: 'scaffold',
      content: [
        honesty,
        `module Cmpsbl`,
        `  MANIFEST_ID = "${manifest.id}".freeze`,
        `  STAGES = ${JSON.stringify(s)}.freeze`,
        ``,
        `  PipelineResult = Struct.new(:success, :stages_completed, :total_stages, :duration_ms)`,
        ``,
        `  def self.run_pipeline(config, input)`,
        `    start = Process.clock_gettime(Process::CLOCK_MONOTONIC)`,
        `    completed = STAGES.count { |s| config[s] }`,
        `    ms = (Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000`,
        `    PipelineResult.new(completed == STAGES.length, completed, STAGES.length, ms)`,
        `  end`,
        `end`,
      ].join('\n'),
    },
    {
      path: 'spec/pipeline_spec.rb',
      type: 'test',
      content: [
        `require_relative "../lib/pipeline"`,
        ``,
        `RSpec.describe Cmpsbl do`,
        `  it "runs full pipeline" do`,
        `    config = Cmpsbl::STAGES.each_with_object({}) { |s, h| h[s] = true }`,
        `    result = Cmpsbl.run_pipeline(config, {})`,
        `    expect(result.success).to be true`,
        `    expect(result.stages_completed).to eq(Cmpsbl::STAGES.length)`,
        `  end`,
        `  it "handles empty config" do`,
        `    result = Cmpsbl.run_pipeline({}, {})`,
        `    expect(result.stages_completed).to eq(0)`,
        `  end`,
        `end`,
      ].join('\n'),
    },
    { path: 'Gemfile', type: 'config', content: `source "https://rubygems.org"\ngem "rspec", "~> 3.12"\n` },
    readmeFile(manifest, 'Ruby', 'ruby lib/pipeline.rb', 'bundle exec rspec'),
  ];
}

// ── PHP ─────────────────────────────────────────────────────────

function scaffoldPHP(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('php', '//');
  const s = steps(manifest);
  return [
    {
      path: 'src/Pipeline.php',
      type: 'scaffold',
      content: [
        `<?php`,
        honesty,
        `namespace Cmpsbl;`,
        ``,
        `class Pipeline {`,
        `    public const MANIFEST_ID = '${manifest.id}';`,
        `    public const STAGES = [${s.map(st => `'${st}'`).join(', ')}];`,
        ``,
        `    public static function run(array $config, mixed $input): array {`,
        `        $start = hrtime(true);`,
        `        $completed = 0;`,
        `        foreach (self::STAGES as $stage) {`,
        `            if (!empty($config[$stage])) $completed++;`,
        `        }`,
        `        $ms = (hrtime(true) - $start) / 1e6;`,
        `        return [`,
        `            'success' => $completed === count(self::STAGES),`,
        `            'stages_completed' => $completed,`,
        `            'total_stages' => count(self::STAGES),`,
        `            'duration_ms' => $ms,`,
        `        ];`,
        `    }`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'tests/PipelineTest.php',
      type: 'test',
      content: [
        `<?php`,
        `use PHPUnit\\Framework\\TestCase;`,
        `use Cmpsbl\\Pipeline;`,
        ``,
        `class PipelineTest extends TestCase {`,
        `    public function testFullPipeline(): void {`,
        `        $config = array_fill_keys(Pipeline::STAGES, true);`,
        `        $r = Pipeline::run($config, []);`,
        `        $this->assertTrue($r['success']);`,
        `        $this->assertEquals(count(Pipeline::STAGES), $r['stages_completed']);`,
        `    }`,
        `    public function testEmptyConfig(): void {`,
        `        $r = Pipeline::run([], []);`,
        `        $this->assertEquals(0, $r['stages_completed']);`,
        `    }`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'composer.json',
      type: 'config',
      content: `{"name":"cmpsbl/pipeline","autoload":{"psr-4":{"Cmpsbl\\\\":"src/"}},"require-dev":{"phpunit/phpunit":"^10.0"}}\n`,
    },
    readmeFile(manifest, 'PHP', 'php src/Pipeline.php', 'vendor/bin/phpunit'),
  ];
}

// ── Dart ────────────────────────────────────────────────────────

function scaffoldDart(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('dart', '//');
  const s = steps(manifest);
  return [
    {
      path: 'lib/pipeline.dart',
      type: 'scaffold',
      content: [
        honesty,
        `const manifestId = '${manifest.id}';`,
        `const stages = [${s.map(st => `'${st}'`).join(', ')}];`,
        ``,
        `class PipelineResult {`,
        `  final bool success;`,
        `  final int stagesCompleted;`,
        `  final int totalStages;`,
        `  final double durationMs;`,
        `  PipelineResult({required this.success, required this.stagesCompleted, required this.totalStages, required this.durationMs});`,
        `}`,
        ``,
        `PipelineResult runPipeline(Map<String, bool> config, dynamic input) {`,
        `  final sw = Stopwatch()..start();`,
        `  int completed = stages.where((s) => config[s] == true).length;`,
        `  sw.stop();`,
        `  return PipelineResult(success: completed == stages.length, stagesCompleted: completed, totalStages: stages.length, durationMs: sw.elapsedMicroseconds / 1000);`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'test/pipeline_test.dart',
      type: 'test',
      content: [
        `import 'package:test/test.dart';`,
        `import 'package:cmpsbl_pipeline/pipeline.dart';`,
        ``,
        `void main() {`,
        `  test('full pipeline', () {`,
        `    final config = {for (var s in stages) s: true};`,
        `    final r = runPipeline(config, {});`,
        `    expect(r.success, isTrue);`,
        `    expect(r.stagesCompleted, equals(stages.length));`,
        `  });`,
        `  test('empty config', () {`,
        `    final r = runPipeline({}, {});`,
        `    expect(r.stagesCompleted, equals(0));`,
        `  });`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'pubspec.yaml',
      type: 'config',
      content: `name: cmpsbl_pipeline\nversion: 1.0.0\nenvironment:\n  sdk: ">=3.0.0 <4.0.0"\ndev_dependencies:\n  test: ^1.24.0\n`,
    },
    readmeFile(manifest, 'Dart', 'dart run', 'dart test'),
  ];
}

// ── Elixir ──────────────────────────────────────────────────────

function scaffoldElixir(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('elixir', '#');
  const s = steps(manifest);
  return [
    {
      path: 'lib/pipeline.ex',
      type: 'scaffold',
      content: [
        honesty,
        `defmodule Cmpsbl.Pipeline do`,
        `  @manifest_id "${manifest.id}"`,
        `  @stages ${JSON.stringify(s)}`,
        ``,
        `  def manifest_id, do: @manifest_id`,
        `  def stages, do: @stages`,
        ``,
        `  def run(config, _input) do`,
        `    start = System.monotonic_time(:microsecond)`,
        `    completed = Enum.count(@stages, fn s -> Map.get(config, s, false) end)`,
        `    ms = (System.monotonic_time(:microsecond) - start) / 1000`,
        `    %{success: completed == length(@stages), stages_completed: completed, total_stages: length(@stages), duration_ms: ms}`,
        `  end`,
        `end`,
      ].join('\n'),
    },
    {
      path: 'test/pipeline_test.exs',
      type: 'test',
      content: [
        `defmodule Cmpsbl.PipelineTest do`,
        `  use ExUnit.Case`,
        `  test "full pipeline" do`,
        `    config = Map.new(Cmpsbl.Pipeline.stages(), fn s -> {s, true} end)`,
        `    result = Cmpsbl.Pipeline.run(config, %{})`,
        `    assert result.success`,
        `    assert result.stages_completed == length(Cmpsbl.Pipeline.stages())`,
        `  end`,
        `  test "empty config" do`,
        `    result = Cmpsbl.Pipeline.run(%{}, %{})`,
        `    assert result.stages_completed == 0`,
        `  end`,
        `end`,
      ].join('\n'),
    },
    {
      path: 'mix.exs',
      type: 'config',
      content: `defmodule CmpsblPipeline.MixProject do\n  use Mix.Project\n  def project do [app: :cmpsbl_pipeline, version: "1.0.0", elixir: "~> 1.15"] end\nend\n`,
    },
    readmeFile(manifest, 'Elixir', 'mix compile', 'mix test'),
  ];
}

// ── Scala ───────────────────────────────────────────────────────

function scaffoldScala(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('scala', '//');
  const s = steps(manifest);
  return [
    {
      path: 'src/main/scala/Pipeline.scala',
      type: 'scaffold',
      content: [
        honesty,
        `package com.cmpsbl`,
        ``,
        `case class PipelineResult(success: Boolean, stagesCompleted: Int, totalStages: Int, durationMs: Double)`,
        ``,
        `object Pipeline {`,
        `  val ManifestId: String = "${manifest.id}"`,
        `  val Stages: Seq[String] = Seq(${s.map(st => `"${st}"`).join(', ')})`,
        ``,
        `  def run(config: Map[String, Boolean], input: Any): PipelineResult = {`,
        `    val start = System.nanoTime()`,
        `    val completed = Stages.count(s => config.getOrElse(s, false))`,
        `    val ms = (System.nanoTime() - start) / 1e6`,
        `    PipelineResult(completed == Stages.length, completed, Stages.length, ms)`,
        `  }`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'src/test/scala/PipelineTest.scala',
      type: 'test',
      content: [
        `package com.cmpsbl`,
        `import org.scalatest.funsuite.AnyFunSuite`,
        ``,
        `class PipelineTest extends AnyFunSuite {`,
        `  test("full pipeline") {`,
        `    val config = Pipeline.Stages.map(_ -> true).toMap`,
        `    val r = Pipeline.run(config, Map.empty)`,
        `    assert(r.success)`,
        `    assert(r.stagesCompleted == Pipeline.Stages.length)`,
        `  }`,
        `  test("empty config") {`,
        `    val r = Pipeline.run(Map.empty, Map.empty)`,
        `    assert(r.stagesCompleted == 0)`,
        `  }`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'build.sbt',
      type: 'config',
      content: `name := "cmpsbl-pipeline"\nversion := "1.0.0"\nscalaVersion := "3.3.0"\nlibraryDependencies += "org.scalatest" %% "scalatest" % "3.2.17" % Test\n`,
    },
    readmeFile(manifest, 'Scala', 'sbt compile', 'sbt test'),
  ];
}

// ── Haskell ─────────────────────────────────────────────────────

function scaffoldHaskell(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('haskell', '--');
  const s = steps(manifest);
  return [
    {
      path: 'src/Pipeline.hs',
      type: 'scaffold',
      content: [
        honesty,
        `module Pipeline (runPipeline, PipelineResult(..), stages, manifestId) where`,
        ``,
        `import Data.Map (Map)`,
        `import qualified Data.Map as Map`,
        `import Data.Time.Clock (getCurrentTime, diffUTCTime)`,
        ``,
        `manifestId :: String`,
        `manifestId = "${manifest.id}"`,
        ``,
        `stages :: [String]`,
        `stages = [${s.map(st => `"${st}"`).join(', ')}]`,
        ``,
        `data PipelineResult = PipelineResult`,
        `  { success :: Bool`,
        `  , stagesCompleted :: Int`,
        `  , totalStages :: Int`,
        `  , durationMs :: Double`,
        `  } deriving (Show)`,
        ``,
        `runPipeline :: Map String Bool -> a -> IO PipelineResult`,
        `runPipeline config _ = do`,
        `  start <- getCurrentTime`,
        `  let completed = length $ filter (\\s -> Map.findWithDefault False s config) stages`,
        `  end <- getCurrentTime`,
        `  let ms = realToFrac (diffUTCTime end start) * 1000`,
        `  return PipelineResult`,
        `    { success = completed == length stages`,
        `    , stagesCompleted = completed`,
        `    , totalStages = length stages`,
        `    , durationMs = ms`,
        `    }`,
      ].join('\n'),
    },
    {
      path: 'test/Spec.hs',
      type: 'test',
      content: [
        `import Test.Hspec`,
        `import qualified Data.Map as Map`,
        `import Pipeline`,
        ``,
        `main :: IO ()`,
        `main = hspec $ do`,
        `  describe "Pipeline" $ do`,
        `    it "runs full pipeline" $ do`,
        `      let config = Map.fromList [(s, True) | s <- stages]`,
        `      result <- runPipeline config ()`,
        `      success result \`shouldBe\` True`,
        `      stagesCompleted result \`shouldBe\` length stages`,
        `    it "handles empty config" $ do`,
        `      result <- runPipeline Map.empty ()`,
        `      stagesCompleted result \`shouldBe\` 0`,
      ].join('\n'),
    },
    {
      path: 'package.yaml',
      type: 'config',
      content: `name: cmpsbl-pipeline\nversion: 1.0.0\ndependencies:\n  - base >= 4.7\n  - containers\n  - time\ntests:\n  spec:\n    main: Spec.hs\n    source-dirs: test\n    dependencies:\n      - hspec\n`,
    },
    readmeFile(manifest, 'Haskell', 'stack build', 'stack test'),
  ];
}

// ── Lua ─────────────────────────────────────────────────────────

function scaffoldLua(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('lua', '--');
  const s = steps(manifest);
  return [
    {
      path: 'src/pipeline.lua',
      type: 'scaffold',
      content: [
        honesty,
        `local Pipeline = {}`,
        ``,
        `Pipeline.MANIFEST_ID = "${manifest.id}"`,
        `Pipeline.STAGES = {${s.map(st => `"${st}"`).join(', ')}}`,
        ``,
        `function Pipeline.run(config, input)`,
        `  local start = os.clock()`,
        `  local completed = 0`,
        `  for _, stage in ipairs(Pipeline.STAGES) do`,
        `    if config[stage] then completed = completed + 1 end`,
        `  end`,
        `  local ms = (os.clock() - start) * 1000`,
        `  return {`,
        `    success = completed == #Pipeline.STAGES,`,
        `    stages_completed = completed,`,
        `    total_stages = #Pipeline.STAGES,`,
        `    duration_ms = ms,`,
        `  }`,
        `end`,
        ``,
        `return Pipeline`,
      ].join('\n'),
    },
    {
      path: 'spec/pipeline_spec.lua',
      type: 'test',
      content: [
        `local Pipeline = require("src.pipeline")`,
        `describe("Pipeline", function()`,
        `  it("runs full pipeline", function()`,
        `    local config = {}`,
        `    for _, s in ipairs(Pipeline.STAGES) do config[s] = true end`,
        `    local r = Pipeline.run(config, {})`,
        `    assert.is_true(r.success)`,
        `    assert.are.equal(#Pipeline.STAGES, r.stages_completed)`,
        `  end)`,
        `  it("handles empty config", function()`,
        `    local r = Pipeline.run({}, {})`,
        `    assert.are.equal(0, r.stages_completed)`,
        `  end)`,
        `end)`,
      ].join('\n'),
    },
    readmeFile(manifest, 'Lua', 'lua src/pipeline.lua', 'busted spec/'),
  ];
}

// ── Zig ─────────────────────────────────────────────────────────

function scaffoldZig(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('zig', '//');
  const s = steps(manifest);
  return [
    {
      path: 'src/pipeline.zig',
      type: 'scaffold',
      content: [
        honesty,
        `const std = @import("std");`,
        ``,
        `pub const manifest_id = "${manifest.id}";`,
        `pub const stage_count = ${s.length};`,
        ``,
        `pub const PipelineResult = struct {`,
        `    success: bool,`,
        `    stages_completed: usize,`,
        `    total_stages: usize,`,
        `    duration_ns: i128,`,
        `};`,
        ``,
        `pub fn runPipeline(config: [stage_count]bool) PipelineResult {`,
        `    const start = std.time.nanoTimestamp();`,
        `    var completed: usize = 0;`,
        `    for (config) |enabled| {`,
        `        if (enabled) completed += 1;`,
        `    }`,
        `    return .{`,
        `        .success = completed == stage_count,`,
        `        .stages_completed = completed,`,
        `        .total_stages = stage_count,`,
        `        .duration_ns = std.time.nanoTimestamp() - start,`,
        `    };`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'src/pipeline_test.zig',
      type: 'test',
      content: [
        `const std = @import("std");`,
        `const pipeline = @import("pipeline.zig");`,
        ``,
        `test "full pipeline" {`,
        `    var config: [pipeline.stage_count]bool = undefined;`,
        `    for (&config) |*v| v.* = true;`,
        `    const r = pipeline.runPipeline(config);`,
        `    try std.testing.expect(r.success);`,
        `    try std.testing.expectEqual(pipeline.stage_count, r.stages_completed);`,
        `}`,
        ``,
        `test "empty config" {`,
        `    var config: [pipeline.stage_count]bool = undefined;`,
        `    for (&config) |*v| v.* = false;`,
        `    const r = pipeline.runPipeline(config);`,
        `    try std.testing.expectEqual(@as(usize, 0), r.stages_completed);`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'build.zig',
      type: 'config',
      content: [
        `const std = @import("std");`,
        `pub fn build(b: *std.Build) void {`,
        `    const exe = b.addExecutable(.{ .name = "cmpsbl-pipeline", .root_source_file = .{ .path = "src/pipeline.zig" } });`,
        `    b.installArtifact(exe);`,
        `    const tests = b.addTest(.{ .root_source_file = .{ .path = "src/pipeline_test.zig" } });`,
        `    const run_tests = b.addRunArtifact(tests);`,
        `    const test_step = b.step("test", "Run tests");`,
        `    test_step.dependOn(&run_tests.step);`,
        `}`,
      ].join('\n'),
    },
    readmeFile(manifest, 'Zig', 'zig build', 'zig build test'),
  ];
}

// ── C++ ─────────────────────────────────────────────────────────

function scaffoldCpp(manifest: ExportManifest): ExportFile[] {
  const honesty = generateHonestyDisclaimer('cpp', '//');
  const s = steps(manifest);
  return [
    {
      path: 'src/pipeline.hpp',
      type: 'scaffold',
      content: [
        honesty,
        `#pragma once`,
        `#include <string>`,
        `#include <vector>`,
        `#include <map>`,
        `#include <chrono>`,
        ``,
        `namespace cmpsbl {`,
        ``,
        `inline const std::string MANIFEST_ID = "${manifest.id}";`,
        `inline const std::vector<std::string> STAGES = {${s.map(st => `"${st}"`).join(', ')}};`,
        ``,
        `struct PipelineResult {`,
        `    bool success;`,
        `    int stages_completed;`,
        `    int total_stages;`,
        `    double duration_ms;`,
        `};`,
        ``,
        `inline PipelineResult run_pipeline(const std::map<std::string, bool>& config) {`,
        `    auto start = std::chrono::high_resolution_clock::now();`,
        `    int completed = 0;`,
        `    for (const auto& stage : STAGES) {`,
        `        auto it = config.find(stage);`,
        `        if (it != config.end() && it->second) completed++;`,
        `    }`,
        `    auto elapsed = std::chrono::high_resolution_clock::now() - start;`,
        `    double ms = std::chrono::duration<double, std::milli>(elapsed).count();`,
        `    return {completed == static_cast<int>(STAGES.size()), completed, static_cast<int>(STAGES.size()), ms};`,
        `}`,
        ``,
        `} // namespace cmpsbl`,
      ].join('\n'),
    },
    {
      path: 'src/main.cpp',
      type: 'scaffold',
      content: [
        `#include "pipeline.hpp"`,
        `#include <iostream>`,
        ``,
        `int main() {`,
        `    std::map<std::string, bool> config;`,
        `    for (const auto& s : cmpsbl::STAGES) config[s] = true;`,
        `    auto result = cmpsbl::run_pipeline(config);`,
        `    std::cout << "Pipeline " << cmpsbl::MANIFEST_ID << ": "`,
        `              << result.stages_completed << "/" << result.total_stages << " stages" << std::endl;`,
        `    return result.success ? 0 : 1;`,
        `}`,
      ].join('\n'),
    },
    {
      path: 'tests/pipeline_test.cpp',
      type: 'test',
      content: [
        `#include "../src/pipeline.hpp"`,
        `#include <cassert>`,
        `#include <iostream>`,
        ``,
        `void test_full_pipeline() {`,
        `    std::map<std::string, bool> config;`,
        `    for (const auto& s : cmpsbl::STAGES) config[s] = true;`,
        `    auto r = cmpsbl::run_pipeline(config);`,
        `    assert(r.success);`,
        `    assert(r.stages_completed == static_cast<int>(cmpsbl::STAGES.size()));`,
        `    std::cout << "PASS: full_pipeline" << std::endl;`,
        `}`,
        ``,
        `void test_empty_config() {`,
        `    auto r = cmpsbl::run_pipeline({});`,
        `    assert(r.stages_completed == 0);`,
        `    std::cout << "PASS: empty_config" << std::endl;`,
        `}`,
        ``,
        `int main() { test_full_pipeline(); test_empty_config(); return 0; }`,
      ].join('\n'),
    },
    {
      path: 'CMakeLists.txt',
      type: 'config',
      content: [
        `cmake_minimum_required(VERSION 3.20)`,
        `project(cmpsbl_pipeline CXX)`,
        `set(CMAKE_CXX_STANDARD 20)`,
        `add_executable(pipeline src/main.cpp)`,
        `add_executable(pipeline_test tests/pipeline_test.cpp)`,
        `enable_testing()`,
        `add_test(NAME pipeline_test COMMAND pipeline_test)`,
      ].join('\n'),
    },
    readmeFile(manifest, 'C++', 'cmake -B build && cmake --build build', 'cd build && ctest'),
  ];
}

// ═══════════════════════════════════════════════════════════════
// EXPORT ENGINE
// ═══════════════════════════════════════════════════════════════

export async function exportBundle(
  manifest: ExportManifest,
  language: ExportLanguage,
  hardwareTarget?: HardwareTarget
): Promise<ExportBundle> {
  emit({
    module: 'export',
    event_type: 'export.started',
    outcome: 'started',
    data: { manifest_id: manifest.id, language, hardware: hardwareTarget },
  });

  const scaffolder = SCAFFOLDERS[language];
  if (!scaffolder) throw new Error(`Unsupported language: ${language}`);

  const files = scaffolder(manifest);
  const testCount = files.filter(f => f.type === 'test').length;
  const totalSize = files.reduce((s, f) => s + new TextEncoder().encode(f.content).length, 0);

  const bundle: ExportBundle = {
    id: `export-${crypto.randomUUID().slice(0, 8)}`,
    manifestId: manifest.id,
    language,
    hardwareTarget,
    files,
    testCount,
    createdAt: Date.now(),
    sizeBytes: totalSize,
  };

  emit({
    module: 'export',
    event_type: 'export.completed',
    outcome: 'succeeded',
    data: {
      bundle_id: bundle.id,
      language,
      files: files.length,
      tests: testCount,
      size_bytes: totalSize,
    },
  });

  return bundle;
}

export function getSupportedLanguages(): ExportLanguage[] {
  return Object.keys(SCAFFOLDERS) as ExportLanguage[];
}

export function getSupportedHardware(): HardwareTarget[] {
  return ['x86_64', 'arm64', 'riscv', 'wasm', 'esp32', 'fpga', 'tpu'];
}
