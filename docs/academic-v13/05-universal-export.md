# 05 — Universal Export Architecture

**Classification:** 📖 OPEN ACCESS / PRIOR ART  
**Version:** v13.5 — IRONCLAD Epoch  
**DOI:** [10.5281/zenodo.18234909](https://doi.org/10.5281/zenodo.18234909)

---

## 1. Purpose

This document describes the Universal Export Adapter: the mechanism by which substrate discoveries and crystallized pipelines are exported to external programming languages and hardware description languages as complete, self-contained packages.

## 2. Design Rationale

The substrate's internal runtime is TypeScript-based. To maximize the utility of crystallized discoveries, the Universal Export Adapter translates them into idiomatic implementations across 25 target languages, each packaged with build tooling, test harnesses, and a standalone micro-runtime.

## 3. Target Languages

### 3.1 Software Languages (18)

| Language | Build Tool | Test Framework |
|---|---|---|
| TypeScript | tsc + esbuild | Vitest |
| JavaScript | esbuild | Jest |
| Python | pip + setuptools | pytest |
| Rust | Cargo | built-in |
| Go | go build | go test |
| Java | Maven | JUnit |
| Kotlin | Gradle | JUnit |
| Swift | Swift Package Manager | XCTest |
| C# | dotnet | xUnit |
| C++ | CMake | Google Test |
| Ruby | Bundler | RSpec |
| PHP | Composer | PHPUnit |
| Dart | pub | dart test |
| Scala | sbt | ScalaTest |
| Elixir | mix | ExUnit |
| Haskell | Stack | HSpec |
| Lua | LuaRocks | busted |
| R | devtools | testthat |

### 3.2 Hardware / HDL Targets (7)

| Target | Toolchain | Simulation |
|---|---|---|
| VHDL | GHDL | GHDL sim |
| Verilog | Icarus Verilog | iverilog |
| SystemVerilog | Verilator | Verilator sim |
| Chisel | sbt + Chisel3 | ChiselTest |
| Amaranth | Python + Amaranth | built-in sim |
| SPICE | ngspice | ngspice sim |
| SystemC | CMake + SystemC | built-in sim |

## 4. Export Bundle Structure

Every export is delivered as a self-contained package:

```
cmpsbl-export-{language}-{timestamp}/
├── src/                          — Generated source code
│   └── {discovery-name}.{ext}
├── test/                         — Auto-generated test harness
│   └── {discovery-name}_test.{ext}
├── _runtime/
│   ├── standalone-runtime        — Micro-Substrate runtime
│   └── standalone-discovery-engine
├── Makefile                      — Build & test commands
├── {package-manifest}            — Language-specific manifest
├── LICENSE
└── README.md
```

## 5. Micro-Substrate Runtime

Each export includes a standalone micro-runtime that provides:

| Capability | Description |
|---|---|
| CJPI scoring | Crown Jewel Pipeline Index computation |
| Auto-tiering | S/A/B/C/D tier assignment |
| Pipeline orchestration | Sequential chain execution |
| Manifest parsing | Import/export discovery manifests |

The micro-runtime has zero external dependencies and operates independently of the full substrate.

## 6. Test Harness Generation

Every export includes auto-generated tests that:

- Validate CJPI metadata preservation
- Test basic invocation and output shape
- Verify structural fingerprint consistency
- Include performance benchmarks where applicable

## 7. Export Process

1. Read discovery manifest from the crystallized artifact store
2. Map module chain to target language primitives
3. Generate language-specific scaffold with CJPI metadata
4. Generate test harness
5. Include standalone micro-runtime
6. Package with build configuration and license
7. Log export to AUDIT trail

## 8. Disclosure Boundary

The following are withheld:

- Language translation algorithms
- CJPI metadata embedding format
- Micro-runtime internal architecture
- Test harness generation heuristics

---

## Revision History

| Date | Author | Change |
|---|---|---|
| 2026-03-06 | Kenneth E. Sweet Jr. | Initial universal export documentation — v13.5 |

---

© 2025–2026 PromptFluid®. All rights reserved.
