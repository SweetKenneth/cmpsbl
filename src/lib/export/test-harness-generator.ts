/**
 * Test Harness Generator
 * Generates test files for exported artifacts to validate correctness.
 * Supports TypeScript (Vitest), Python (pytest), Go (testing), Verilog (testbench).
 */

import type { SynthesisContext } from './logic-synthesizer';

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
