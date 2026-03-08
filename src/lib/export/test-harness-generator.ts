/**
 * Test Harness Generator
 * Generates test files for exported artifacts to validate correctness.
 * Supports TypeScript (Vitest), Python (pytest), Go (testing), Verilog (testbench).
 */

import type { SynthesisContext } from './logic-synthesizer';
import { generateLicenseHTML, generateReadmeHTML } from './elegant-html-docs';
import { generatePipelineDetailsHTML } from './pipeline-details-page';
import { getTierFromScore } from '@/lib/pipeline-valuation';

export function generateTypeScriptTest(ctx: SynthesisContext): string {
  const cls = ctx.name.replace(/[^a-zA-Z0-9]/g, '');
  const slug = ctx.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  return `/**
 * Test Suite — ${ctx.name}
 * Auto-generated test harness for CMPSBL® artifact validation
 * Run: npx vitest run ${slug}.test.ts
 */

import { describe, it, expect } from 'vitest';
import { ${cls} } from './${slug}';

describe('${cls}', () => {
  it('should instantiate with default config', () => {
    const engine = new ${cls}();
    expect(engine).toBeDefined();
    const stats = engine.getStats();
    expect(stats.name).toBe('${ctx.name}');
    expect(stats.cjpi).toBe(${ctx.cjpi});
  });

  it('should execute pipeline with empty input', async () => {
    const engine = new ${cls}();
    const result = await engine.execute({});
    expect(result.totalStages).toBe(${ctx.moduleChain.length});
    expect(result.entryPoint).toBe('${ctx.entryCapability}');
    expect(result.exitPoint).toBe('${ctx.exitCapability}');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should execute pipeline with sample data', async () => {
    const engine = new ${cls}();
    const result = await engine.execute({
      test_key: 'test_value',
      score: 42,
      tags: ['alpha', 'beta'],
    });
    expect(result.success).toBe(true);
    expect(result.stagesCompleted).toBe(result.totalStages);
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.pipelineTrace.length).toBe(${ctx.moduleChain.length});
  });

  it('should track execution statistics', async () => {
    const engine = new ${cls}();
    await engine.execute({ a: 1 });
    await engine.execute({ b: 2 });
    const stats = engine.getStats();
    expect(stats.executionCount).toBe(2);
    expect(stats.successRate).toBeGreaterThan(0);
    expect(stats.avgLatencyMs).toBeGreaterThan(0);
  });

  it('should report module chain in stats', () => {
    const engine = new ${cls}();
    const stats = engine.getStats();
    expect(stats.moduleChain).toEqual(${JSON.stringify(ctx.moduleChain)});
    expect(stats.category).toBe('${ctx.category}');
  });

  it('should reset statistics', async () => {
    const engine = new ${cls}();
    await engine.execute({ x: 1 });
    engine.reset();
    const stats = engine.getStats();
    expect(stats.executionCount).toBe(0);
  });
});
`;
}

export function generatePythonTest(ctx: SynthesisContext): string {
  const cls = ctx.name.replace(/[^a-zA-Z0-9]/g, '');
  const snake = ctx.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');
  return `"""
Test Suite — ${ctx.name}
Auto-generated test harness for CMPSBL® artifact validation
Run: pytest test_${snake}.py -v
"""

import pytest
from ${snake} import ${cls}


class Test${cls}:
    def test_instantiation(self):
        engine = ${cls}()
        stats = engine.stats
        assert stats["name"] == "${ctx.name}"
        assert stats["cjpi"] == ${ctx.cjpi}

    def test_empty_input(self):
        engine = ${cls}()
        result = engine.execute({})
        assert result.total_stages == ${ctx.moduleChain.length}
        assert result.entry_point == "${ctx.entryCapability}"
        assert result.exit_point == "${ctx.exitCapability}"
        assert result.latency_ms >= 0

    def test_sample_data(self):
        engine = ${cls}()
        result = engine.execute({
            "test_key": "test_value",
            "score": 42,
            "tags": ["alpha", "beta"],
        })
        assert result.success is True
        assert result.stages_completed == result.total_stages
        assert result.confidence > 0.5
        assert len(result.pipeline_trace) == ${ctx.moduleChain.length}

    def test_statistics_tracking(self):
        engine = ${cls}()
        engine.execute({"a": 1})
        engine.execute({"b": 2})
        stats = engine.stats
        assert stats["execution_count"] == 2
        assert stats["success_rate"] > 0

    def test_module_chain(self):
        engine = ${cls}()
        stats = engine.stats
        assert stats["module_chain"] == ${JSON.stringify(ctx.moduleChain)}
        assert stats["category"] == "${ctx.category}"

    def test_reset(self):
        engine = ${cls}()
        engine.execute({"x": 1})
        engine.reset()
        assert engine.stats["execution_count"] == 0
`;
}

export function generateGoTest(ctx: SynthesisContext): string {
  const cls = ctx.name.replace(/[^a-zA-Z0-9]/g, '');
  const pkg = ctx.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');
  return `// Test Suite — ${ctx.name}
// Auto-generated test harness for CMPSBL® artifact validation
// Run: go test -v ./${pkg}/

package ${pkg}

import (
\t"testing"
)

func TestNew${cls}(t *testing.T) {
\tengine := New${cls}()
\tif engine == nil {
\t\tt.Fatal("Expected non-nil engine")
\t}
}

func TestExecuteEmpty(t *testing.T) {
\tengine := New${cls}()
\tresult := engine.Execute(map[string]interface{}{})
\tif result.TotalStages != ${ctx.moduleChain.length} {
\t\tt.Errorf("Expected ${ctx.moduleChain.length} stages, got %d", result.TotalStages)
\t}
\tif result.EntryPoint != "${ctx.entryCapability}" {
\t\tt.Errorf("Expected entry '${ctx.entryCapability}', got '%s'", result.EntryPoint)
\t}
}

func TestExecuteSampleData(t *testing.T) {
\tengine := New${cls}()
\tinput := map[string]interface{}{
\t\t"test_key": "test_value",
\t\t"score":    42,
\t}
\tresult := engine.Execute(input)
\tif !result.Success {
\t\tt.Fatalf("Pipeline failed: %s", result.Error)
\t}
\tif result.StagesCompleted != result.TotalStages {
\t\tt.Errorf("Expected %d stages completed, got %d", result.TotalStages, result.StagesCompleted)
\t}
\tif result.Confidence <= 0.5 {
\t\tt.Errorf("Expected confidence > 0.5, got %f", result.Confidence)
\t}
}

func TestStats(t *testing.T) {
\tengine := New${cls}()
\tengine.Execute(map[string]interface{}{"a": 1})
\tengine.Execute(map[string]interface{}{"b": 2})
\tstats := engine.Stats()
\tif stats["execution_count"].(int) != 2 {
\t\tt.Errorf("Expected 2 executions, got %v", stats["execution_count"])
\t}
}
`;
}

export function generateVerilogTestbench(ctx: SynthesisContext): string {
  const snake = ctx.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');
  return `\`timescale 1ns / 1ps
// ═══════════════════════════════════════════════════════════════
// Testbench — ${ctx.name}
// Auto-generated validation testbench for CMPSBL® silicon artifact
// Run: iverilog -o tb_${snake} tb_${snake}.v ${snake}.v && vvp tb_${snake}
// ═══════════════════════════════════════════════════════════════

module tb_${snake};
    parameter DATA_WIDTH = 32;
    parameter NUM_STAGES = ${ctx.moduleChain.length};

    reg clk, rst_n, start;
    reg [DATA_WIDTH-1:0] data_in;
    reg data_valid;
    wire done, busy, error;
    wire [DATA_WIDTH-1:0] data_out;
    wire data_ready;
    wire [7:0] confidence;
    wire [31:0] latency_cycles;

    // DUT
    ${snake} #(.DATA_WIDTH(DATA_WIDTH), .NUM_STAGES(NUM_STAGES)) dut (
        .clk(clk), .rst_n(rst_n), .start(start),
        .data_in(data_in), .data_valid(data_valid),
        .data_out(data_out), .data_ready(data_ready),
        .done(done), .busy(busy), .error(error),
        .confidence(confidence), .latency_cycles(latency_cycles)
    );

    // Clock: 100 MHz
    always #5 clk = ~clk;

    integer pass_count = 0;
    integer fail_count = 0;

    task check(input string name, input logic cond);
        if (cond) begin
            $display("[PASS] %s", name);
            pass_count = pass_count + 1;
        end else begin
            $display("[FAIL] %s", name);
            fail_count = fail_count + 1;
        end
    endtask

    initial begin
        $dumpfile("tb_${snake}.vcd");
        $dumpvars(0, tb_${snake});

        // Init
        clk = 0; rst_n = 0; start = 0; data_in = 0; data_valid = 0;
        #20 rst_n = 1;
        #10;

        // Test 1: Basic execution
        $display("\\n=== Test 1: Basic Pipeline Execution ===");
        data_in = 32'hDEADBEEF;
        data_valid = 1;
        start = 1;
        #10 start = 0; data_valid = 0;
        
        // Wait for done
        repeat (100) @(posedge clk);
        check("Pipeline completes", done === 1'b1);
        check("No error", error === 1'b0);
        check("Confidence > 0", confidence > 0);
        check("Output produced", data_out !== 0);

        // Test 2: Reset behavior
        $display("\\n=== Test 2: Reset Behavior ===");
        rst_n = 0;
        #20 rst_n = 1;
        #10;
        check("Reset clears busy", busy === 1'b0);
        check("Reset clears done", done === 1'b0);

        // Test 3: Different input
        $display("\\n=== Test 3: Different Input ===");
        data_in = 32'hCAFEBABE;
        data_valid = 1;
        start = 1;
        #10 start = 0; data_valid = 0;
        repeat (100) @(posedge clk);
        check("Second run completes", done === 1'b1);

        // Summary
        $display("\\n═══════════════════════════════════════");
        $display("Results: %0d passed, %0d failed", pass_count, fail_count);
        $display("═══════════════════════════════════════\\n");

        $finish;
    end
endmodule
`;
}

export function generateRustTest(ctx: SynthesisContext): string {
  const cls = ctx.name.replace(/[^a-zA-Z0-9]/g, '');
  const snake = ctx.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');
  return `// Test Suite — ${ctx.name}
// Auto-generated test harness for CMPSBL® artifact validation
// Run: cargo test

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn test_instantiation() {
        let engine = ${cls}::new();
        let stats = engine.stats();
        assert_eq!(stats.get("name").unwrap(), "${ctx.name}");
    }

    #[test]
    fn test_empty_input() {
        let mut engine = ${cls}::new();
        let result = engine.execute(HashMap::new());
        assert_eq!(result.total_stages, ${ctx.moduleChain.length});
        assert!(result.latency_ms >= 0.0);
    }

    #[test]
    fn test_sample_data() {
        let mut engine = ${cls}::new();
        let input = HashMap::from([
            ("test_key".into(), "test_value".into()),
            ("score".into(), "42".into()),
        ]);
        let result = engine.execute(input);
        assert!(result.success, "Pipeline should succeed: {:?}", result.error);
        assert_eq!(result.stages_completed, result.total_stages);
        assert!(result.confidence > 0.5);
    }

    #[test]
    fn test_statistics() {
        let mut engine = ${cls}::new();
        engine.execute(HashMap::from([("a".into(), "1".into())]));
        engine.execute(HashMap::from([("b".into(), "2".into())]));
        let stats = engine.stats();
        assert_eq!(stats.get("executions").unwrap(), "2");
    }
}
`;
}

export function generateSystemCTest(ctx: SynthesisContext): string {
  const cls = ctx.name.replace(/[^a-zA-Z0-9]/g, '');
  return `// SystemC Testbench — ${ctx.name}
// Auto-generated validation testbench for CMPSBL® artifact
// Compile: g++ -I$SYSTEMC_HOME/include -L$SYSTEMC_HOME/lib -lsystemc -o tb_${cls.toLowerCase()} tb_${cls.toLowerCase()}.cpp ${cls.toLowerCase()}.cpp

#include <systemc.h>
#include <cassert>
#include <iostream>

// Include the DUT
#include "${cls.toLowerCase()}.cpp"

SC_MODULE(${cls}_TB) {
    sc_clock clk;
    sc_signal<bool> rst_n, start, done, busy;
    sc_signal<sc_uint<32>> data_in, data_out;
    sc_signal<sc_uint<8>> confidence;

    ${cls}* dut;

    void run_tests() {
        // Reset
        rst_n.write(false);
        wait(3, SC_NS);
        rst_n.write(true);
        wait(1, SC_NS);

        std::cout << "[TEST 1] Basic pipeline execution" << std::endl;
        data_in.write(0xDEADBEEF);
        start.write(true);
        wait(1, SC_NS);
        start.write(false);

        for (int i = 0; i < ${ctx.moduleChain.length + 4}; i++) wait(1, SC_NS);

        assert(done.read() == true);
        std::cout << "  Output:     0x" << std::hex << data_out.read() << std::endl;
        std::cout << "  Confidence: " << std::dec << confidence.read() << std::endl;
        std::cout << "  [PASS]" << std::endl;

        // Reset test
        std::cout << "[TEST 2] Reset clears state" << std::endl;
        rst_n.write(false);
        wait(2, SC_NS);
        rst_n.write(true);
        wait(1, SC_NS);
        assert(busy.read() == false);
        assert(done.read() == false);
        std::cout << "  [PASS]" << std::endl;

        // Different input
        std::cout << "[TEST 3] Different input" << std::endl;
        data_in.write(0xCAFEBABE);
        start.write(true);
        wait(1, SC_NS);
        start.write(false);
        for (int i = 0; i < ${ctx.moduleChain.length + 4}; i++) wait(1, SC_NS);
        assert(done.read() == true);
        std::cout << "  [PASS]" << std::endl;

        std::cout << "\\n=== All tests passed ===" << std::endl;
        sc_stop();
    }

    SC_CTOR(${cls}_TB) : clk("clk", 1, SC_NS) {
        dut = new ${cls}("dut");
        dut->clk(clk);
        dut->rst_n(rst_n);
        dut->start(start);
        dut->data_in(data_in);
        dut->data_out(data_out);
        dut->done(done);
        dut->busy(busy);
        dut->confidence_out(confidence);

        SC_THREAD(run_tests);
    }
    ~${cls}_TB() { delete dut; }
};

int sc_main(int argc, char* argv[]) {
    ${cls}_TB tb("tb");
    sc_start();
    return 0;
}
`;
}

export function generateExportScaffolding(ctx: SynthesisContext): { filename: string; content: string }[] {
  const cls = ctx.name.replace(/[^a-zA-Z0-9]/g, '');
  const slug = ctx.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/, '');
  const snake = ctx.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+$/, '');

  return [
    {
      filename: 'LICENSE',
      content: `CMPSBL® Commercial Distribution License

Copyright (c) ${new Date().getFullYear()} CMPSBL®. All rights reserved.

ORIGIN NOTICE — This software was crystallized and exported from the CMPSBL®
Substrate, a cognitive orchestration platform by promptfluid®. This software
requires the included CMPSBL® Micro-Substrate Runtime to function. The runtime
is proprietary to CMPSBL® and may not be separated, reverse-engineered, or
redistributed independently of this package.

GRANT OF RIGHTS — Subject to the terms below, the licensee is granted a
non-exclusive, worldwide right to:
  (a) Use, modify, and integrate this software into derivative works.
  (b) Sell, sublicense, or commercially distribute this software and
      derivative works, provided that ALL of the following conditions are met.

CONDITIONS:
  1. ATTRIBUTION — Every distribution of this software, whether in original
     or modified form, MUST include the following notice in a prominent
     location (e.g. README, About screen, license file, or documentation):

       "Built with the CMPSBL® Substrate — https://cmpsbl.com
        Powered by the CMPSBL® Micro-Substrate Runtime."

  2. RUNTIME DEPENDENCY — This software depends on the CMPSBL® Micro-Substrate
     Runtime included in this package. The runtime MUST be included in all
     distributions. It may NOT be replaced, stubbed out, or removed.

  3. LICENSE PRESERVATION — This license file MUST be included, unmodified,
     in every copy or distribution of this software.

  4. NO MISREPRESENTATION — You may not claim that this software was created
     entirely by you or any party other than CMPSBL®. The substrate origin
     must be acknowledged.

RUNTIME LICENSE — The CMPSBL® Micro-Substrate Runtime (standalone-runtime.ts
and standalone-discovery-engine.ts) is licensed solely for use with software
exported from the CMPSBL® Substrate. It may not be used, copied, or
distributed for any other purpose.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
CMPSBL® BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY.

For licensing inquiries: legal@cmpsbl.com | https://cmpsbl.com
`,
    },
    {
      filename: 'LICENSE.html',
      content: generateLicenseHTML(ctx.name),
    },
    {
      filename: 'PIPELINE-DETAILS.html',
      content: generatePipelineDetailsHTML({
        name: ctx.name,
        description: ctx.description,
        category: ctx.category,
        score: ctx.cjpi,
        tier: getTierFromScore(ctx.cjpi),
        systemChain: ctx.moduleChain,
        exportLanguages: ctx.moduleChain,
        source: 'Memory Stream Export',
      }),
    },
    {
      filename: 'README.html',
      content: generateReadmeHTML({
        name: ctx.name,
        description: ctx.description,
        category: ctx.category,
        modules: ctx.moduleChain,
        files: [
          { name: `${slug}.ts`, purpose: 'Main pipeline implementation (TypeScript)' },
          { name: 'LICENSE', purpose: 'CMPSBL® Commercial Distribution License' },
          { name: 'LICENSE.html', purpose: 'Formatted license document' },
          { name: 'PIPELINE-DETAILS.html', purpose: 'Pipeline certificate with valuation and provenance' },
          { name: 'Makefile', purpose: 'Build & test commands for all languages' },
          { name: 'package.json', purpose: 'Node.js package manifest' },
        ],
      }),
    },
    {
      filename: 'Makefile',
      content: `# CMPSBL® Crown Jewel — ${ctx.name}
# Auto-generated build system

.PHONY: all test clean

# TypeScript
ts-run:
\tnpx tsx ${slug}.ts

ts-test:
\tnpx vitest run ${slug}.test.ts

# Python
py-run:
\tpython ${snake}.py '{}'

py-test:
\tpytest test_${snake}.py -v

# Go
go-run:
\tgo run ${snake}.go

go-test:
\tgo test -v ./${snake}/

# Rust
rs-build:
\tcargo build --release

rs-test:
\tcargo test

# Verilog
verilog-sim:
\tiverilog -o tb_${snake} tb_${snake}.v ${snake}.v && vvp tb_${snake}

# SystemC
systemc-build:
\tg++ -I$$SYSTEMC_HOME/include -L$$SYSTEMC_HOME/lib -lsystemc -o ${snake} ${slug}.cpp

clean:
\trm -f *.o tb_${snake} ${snake}
`,
    },
    {
      filename: 'package.json',
      content: JSON.stringify({
        name: `@cmpsbl/${slug}`,
        version: '1.0.0',
        description: ctx.description,
        main: `${slug}.ts`,
        scripts: {
          start: `npx tsx ${slug}.ts`,
          test: `npx vitest run ${slug}.test.ts`,
          build: `tsc ${slug}.ts --outDir dist`,
        },
        keywords: ['cmpsbl', 'crown-jewel', ctx.category, ...ctx.moduleChain.map(m => m.toLowerCase())],
        license: 'SEE LICENSE IN LICENSE',
        private: true,
      }, null, 2),
    },
  ];
}

