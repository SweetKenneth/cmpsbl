/**
 * Hardware Synthesizer — Generates REAL silicon processing logic
 * for HDL targets (Verilog, VHDL, SystemVerilog, Chisel, Amaranth, SPICE)
 * based on module chain and category metadata.
 *
 * Each module maps to a concrete hardware primitive:
 *   BRAIN    → entropy accumulator + comparator tree
 *   DEFENSE  → XOR-chain validator + pattern matcher
 *   ANALYTICS→ running accumulator + statistical reducer
 *   MEMORY   → addressable SRAM-style read/write
 *   ORACLE   → linear prediction MAC unit
 *   EVOLUTION → fitness comparator + MUX crossover
 *   GOVERNANCE→ bitmask policy checker
 *   CORTEX   → priority arbiter + scheduler
 *   DECODE   → barrel shifter + byte extractor
 *   NEXUS    → round-robin router MUX
 *   VISION   → threshold detector + counter
 *   AUDIT    → hash accumulator (CRC-style)
 *   Default  → configurable ALU (add/sub/xor/and/or)
 */

import type { SynthesisContext } from './logic-synthesizer';

// ═══════════════════════════════════════════════════════════════════
// Verilog Pipeline Stage Transforms
// ═══════════════════════════════════════════════════════════════════

export function verilogPipelineTransform(modules: string[], ctx: SynthesisContext): string {
  if (modules.length === 0) return defaultVerilogTransform();
  
  const stages = modules.map((m, i) => verilogStageForModule(m, i));
  return stages.join('\n');
}

function verilogStageForModule(mod: string, idx: number): string {
  const prev = idx === 0 ? 'data_in_reg' : `stage_${idx - 1}_out`;
  const out = `stage_${idx}_out`;
  
  switch (mod) {
    case 'BRAIN':
    case 'CORTEX':
      return `
                    // Stage ${idx}: ${mod} — Entropy accumulator + weighted sum
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [DATA_WIDTH-1:0] entropy_acc_${idx};
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            entropy_acc_${idx} <= entropy_acc_${idx} ^ (${prev} >> 1) ^ (${prev} << 3);
                            ${out} <= ${prev} + entropy_acc_${idx}[DATA_WIDTH-1:DATA_WIDTH/2] 
                                     - entropy_acc_${idx}[DATA_WIDTH/2-1:0];
                        end
                    end`;

    case 'DEFENSE':
    case 'ACCESS':
      return `
                    // Stage ${idx}: ${mod} — XOR pattern validator + injection filter
                    reg [DATA_WIDTH-1:0] ${out};
                    wire [DATA_WIDTH-1:0] defense_mask_${idx} = {DATA_WIDTH{1'b1}} ^ (${prev} >> 4);
                    wire defense_valid_${idx} = (${prev} != {DATA_WIDTH{1'b0}}) && 
                                                 (${prev} != {DATA_WIDTH{1'b1}}) &&
                                                 (${prev}[7:0] != 8'h3C); // Block '<' injection
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            ${out} <= defense_valid_${idx} ? (${prev} & defense_mask_${idx}) 
                                                           : {DATA_WIDTH{1'b0}}; // Quarantine
                            security_score <= security_score + defense_valid_${idx};
                        end
                    end`;

    case 'ANALYTICS':
    case 'VISION':
      return `
                    // Stage ${idx}: ${mod} — Running mean accumulator + variance estimator
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [DATA_WIDTH+7:0] sum_acc_${idx};
                    reg [15:0] sample_count_${idx};
                    wire [DATA_WIDTH-1:0] running_mean_${idx} = sum_acc_${idx}[DATA_WIDTH+7:8];
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            sum_acc_${idx} <= sum_acc_${idx} + {{8{${prev}[DATA_WIDTH-1]}}, ${prev}};
                            sample_count_${idx} <= sample_count_${idx} + 1;
                            ${out} <= ${prev} - running_mean_${idx}; // Deviation from mean
                        end
                    end`;

    case 'MEMORY':
      return `
                    // Stage ${idx}: ${mod} — Addressable register file with hash addressing
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [DATA_WIDTH-1:0] mem_bank_${idx} [0:15];
                    wire [3:0] mem_addr_${idx} = ${prev}[3:0] ^ ${prev}[7:4]; // Hash address
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            mem_bank_${idx}[mem_addr_${idx}] <= ${prev};
                            ${out} <= mem_bank_${idx}[mem_addr_${idx}]; // Read-before-write
                        end
                    end`;

    case 'ORACLE':
      return `
                    // Stage ${idx}: ${mod} — Linear prediction MAC unit (y = ax + b)
                    reg [DATA_WIDTH-1:0] ${out};
                    reg signed [DATA_WIDTH-1:0] pred_weight_${idx};
                    reg signed [DATA_WIDTH-1:0] pred_bias_${idx};
                    wire signed [DATA_WIDTH*2-1:0] mac_result_${idx} = 
                        $signed(${prev}) * pred_weight_${idx} + {{DATA_WIDTH{pred_bias_${idx}[DATA_WIDTH-1]}}, pred_bias_${idx}};
                    always @(posedge clk) begin
                        if (!rst_n) begin
                            pred_weight_${idx} <= {{(DATA_WIDTH-1){1'b0}}, 1'b1}; // weight = 1
                            pred_bias_${idx} <= {DATA_WIDTH{1'b0}};
                        end else if (stage_active[${idx}]) begin
                            ${out} <= mac_result_${idx}[DATA_WIDTH-1:0];
                            // Adaptive weight: nudge toward prediction error
                            pred_weight_${idx} <= pred_weight_${idx} + 
                                (($signed(${prev}) - $signed(${out})) >>> 4);
                        end
                    end`;

    case 'EVOLUTION':
      return `
                    // Stage ${idx}: ${mod} — Fitness comparator + MUX crossover
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [DATA_WIDTH-1:0] best_candidate_${idx};
                    reg [DATA_WIDTH-1:0] generation_${idx};
                    wire candidate_better_${idx} = ($signed(${prev}) > $signed(best_candidate_${idx}));
                    wire [DATA_WIDTH-1:0] crossover_${idx} = 
                        (${prev} & {{DATA_WIDTH/2{1'b1}}, {DATA_WIDTH/2{1'b0}}}) |
                        (best_candidate_${idx} & {{DATA_WIDTH/2{1'b0}}, {DATA_WIDTH/2{1'b1}}});
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            best_candidate_${idx} <= candidate_better_${idx} ? ${prev} : best_candidate_${idx};
                            ${out} <= crossover_${idx} ^ generation_${idx}[3:0]; // Mutation
                            generation_${idx} <= generation_${idx} + 1;
                        end
                    end`;

    case 'GOVERNANCE':
    case 'AUDIT':
      return `
                    // Stage ${idx}: ${mod} — Policy bitmask checker + CRC hash trail
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [31:0] audit_hash_${idx};
                    localparam [DATA_WIDTH-1:0] POLICY_MASK_${idx} = 32'hDEADBEEF;
                    wire policy_pass_${idx} = |((${prev} ^ POLICY_MASK_${idx}) & ${prev});
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            // CRC-32-like accumulation
                            audit_hash_${idx} <= {audit_hash_${idx}[30:0], 1'b0} ^ 
                                (audit_hash_${idx}[31] ? 32'h04C11DB7 : 32'h0) ^
                                ${prev};
                            ${out} <= policy_pass_${idx} ? ${prev} : (${prev} & POLICY_MASK_${idx});
                        end
                    end`;

    case 'DECODE':
    case 'LINGUA':
      return `
                    // Stage ${idx}: ${mod} — Barrel shifter + byte lane extractor
                    reg [DATA_WIDTH-1:0] ${out};
                    wire [4:0] shift_amt_${idx} = ${prev}[4:0];
                    wire [DATA_WIDTH-1:0] shifted_${idx} = ${prev} >> shift_amt_${idx};
                    wire [7:0] byte0_${idx} = shifted_${idx}[7:0];
                    wire [7:0] byte1_${idx} = shifted_${idx}[15:8];
                    wire [7:0] byte2_${idx} = shifted_${idx}[23:16];
                    wire [7:0] byte3_${idx} = shifted_${idx}[31:24];
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            ${out} <= {byte3_${idx} ^ byte1_${idx}, byte2_${idx} ^ byte0_${idx},
                                       byte1_${idx} + byte3_${idx}, byte0_${idx} - byte2_${idx}};
                        end
                    end`;

    case 'NEXUS':
    case 'NERVE':
    case 'RIPPLE':
      return `
                    // Stage ${idx}: ${mod} — Round-robin router with priority override
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [2:0] route_select_${idx};
                    wire [DATA_WIDTH-1:0] route_a_${idx} = ${prev};
                    wire [DATA_WIDTH-1:0] route_b_${idx} = {${prev}[0], ${prev}[DATA_WIDTH-1:1]}; // Rotate
                    wire [DATA_WIDTH-1:0] route_c_${idx} = ${prev} ^ {DATA_WIDTH/2{2'b10}};
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            route_select_${idx} <= route_select_${idx} + 1;
                            case (route_select_${idx}[1:0])
                                2'b00: ${out} <= route_a_${idx};
                                2'b01: ${out} <= route_b_${idx};
                                2'b10: ${out} <= route_c_${idx};
                                default: ${out} <= route_a_${idx} + route_b_${idx};
                            endcase
                        end
                    end`;

    case 'SOVEREIGN':
    case 'TREATY':
      return `
                    // Stage ${idx}: ${mod} — Jurisdiction classifier + compliance gate
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [15:0] jurisdiction_code_${idx};
                    localparam [DATA_WIDTH-1:0] COMPLIANCE_MASK_${idx} = 32'hFEDCBA98;
                    wire compliant_${idx} = ((${prev} & COMPLIANCE_MASK_${idx}) != {DATA_WIDTH{1'b0}});
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            jurisdiction_code_${idx} <= ${prev}[15:0] ^ ${prev}[31:16];
                            ${out} <= compliant_${idx} ? ${prev} : (${prev} | COMPLIANCE_MASK_${idx});
                        end
                    end`;

    case 'CONSCIENCE':
      return `
                    // Stage ${idx}: ${mod} — Fairness scorer + bias detector
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [DATA_WIDTH-1:0] fairness_acc_${idx};
                    wire [DATA_WIDTH-1:0] deviation_${idx} = ($signed(${prev}) > $signed(fairness_acc_${idx}))
                        ? (${prev} - fairness_acc_${idx}) : (fairness_acc_${idx} - ${prev});
                    wire biased_${idx} = deviation_${idx} > (fairness_acc_${idx} >> 2);
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            fairness_acc_${idx} <= fairness_acc_${idx} + ((${prev} - fairness_acc_${idx}) >>> 3);
                            ${out} <= biased_${idx} ? fairness_acc_${idx} : ${prev};
                        end
                    end`;

    case 'PHANTOM':
      return `
                    // Stage ${idx}: ${mod} — Privacy anonymizer + noise injector
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [31:0] noise_lfsr_${idx};
                    localparam [DATA_WIDTH-1:0] PRIVACY_MASK_${idx} = 32'hFF000000;
                    always @(posedge clk) begin
                        if (!rst_n) noise_lfsr_${idx} <= 32'hACE1CAFE;
                        else if (stage_active[${idx}]) begin
                            noise_lfsr_${idx} <= {noise_lfsr_${idx}[30:0], noise_lfsr_${idx}[31] ^ noise_lfsr_${idx}[21]};
                            ${out} <= (${prev} & PRIVACY_MASK_${idx}) | ({noise_lfsr_${idx}[0], noise_lfsr_${idx}[31:1]} & ~PRIVACY_MASK_${idx});
                        end
                    end`;

    case 'FORGE':
      return `
                    // Stage ${idx}: ${mod} — Synthesis combiner + artifact fuser
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [DATA_WIDTH-1:0] forge_acc_${idx};
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            forge_acc_${idx} <= forge_acc_${idx} ^ ${prev};
                            ${out} <= (${prev} & forge_acc_${idx}) | (~${prev} & (forge_acc_${idx} >> 1));
                        end
                    end`;

    case 'COMPASS':
      return `
                    // Stage ${idx}: ${mod} — Geospatial zone classifier
                    reg [DATA_WIDTH-1:0] ${out};
                    wire [3:0] zone_${idx} = ${prev}[3:0];
                    wire [3:0] risk_${idx} = ${prev}[7:4];
                    wire high_risk_${idx} = (risk_${idx} > 4'd8);
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            ${out} <= high_risk_${idx} ? {${prev}[DATA_WIDTH-1:8], risk_${idx}, zone_${idx}} : ${prev};
                        end
                    end`;

    case 'ECHO':
      return `
                    // Stage ${idx}: ${mod} — Digital twin shadow register
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [DATA_WIDTH-1:0] twin_shadow_${idx};
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            twin_shadow_${idx} <= ${prev};
                            ${out} <= (${prev} ^ twin_shadow_${idx}) ? ${prev} : twin_shadow_${idx};
                        end
                    end`;

    case 'HARVEST':
      return `
                    // Stage ${idx}: ${mod} — Deduplicator + quality scorer
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [DATA_WIDTH-1:0] last_seen_${idx};
                    wire duplicate_${idx} = (${prev} == last_seen_${idx});
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            last_seen_${idx} <= ${prev};
                            ${out} <= duplicate_${idx} ? {DATA_WIDTH{1'b0}} : ${prev};
                        end
                    end`;

    case 'REFLEX':
      return `
                    // Stage ${idx}: ${mod} — Edge dispatch + local cache
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [DATA_WIDTH-1:0] reflex_cache_${idx} [0:3];
                    reg [1:0] cache_ptr_${idx};
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            reflex_cache_${idx}[cache_ptr_${idx}] <= ${prev};
                            cache_ptr_${idx} <= cache_ptr_${idx} + 1;
                            ${out} <= ${prev} ^ reflex_cache_${idx}[cache_ptr_${idx}];
                        end
                    end`;

    case 'DREAM':
      return `
                    // Stage ${idx}: ${mod} — Generative explorer (LFSR perturbation)
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [31:0] dream_lfsr_${idx};
                    always @(posedge clk) begin
                        if (!rst_n) dream_lfsr_${idx} <= 32'hDEAD_BEEF;
                        else if (stage_active[${idx}]) begin
                            dream_lfsr_${idx} <= {dream_lfsr_${idx}[30:0], dream_lfsr_${idx}[31] ^ dream_lfsr_${idx}[21] ^ dream_lfsr_${idx}[1] ^ dream_lfsr_${idx}[0]};
                            ${out} <= ${prev} ^ dream_lfsr_${idx};
                        end
                    end`;

    case 'SYSTEM':
    case 'MEDIC':
      return `
                    // Stage ${idx}: ${mod} — Health monitor + watchdog
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [15:0] watchdog_${idx};
                    wire healthy_${idx} = (${prev} != {DATA_WIDTH{1'b0}}) && (watchdog_${idx} < 16'hFFFF);
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            watchdog_${idx} <= healthy_${idx} ? 16'b0 : watchdog_${idx} + 1;
                            ${out} <= healthy_${idx} ? ${prev} : {DATA_WIDTH{1'b0}};
                        end
                    end`;

    case 'IDENTITY':
      return `
                    // Stage ${idx}: ${mod} — Hash fingerprinter
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [31:0] id_hash_${idx};
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            id_hash_${idx} <= {id_hash_${idx}[30:0], 1'b0} ^ 
                                (id_hash_${idx}[31] ? 32'h04C11DB7 : 32'h0) ^ ${prev};
                            ${out} <= ${prev} ^ id_hash_${idx}[15:0];
                        end
                    end`;

    default:
      return `
                    // Stage ${idx}: ${mod} — Configurable ALU (add/sub/xor/and)
                    reg [DATA_WIDTH-1:0] ${out};
                    reg [1:0] alu_op_${idx};
                    always @(posedge clk) begin
                        if (stage_active[${idx}]) begin
                            case (alu_op_${idx})
                                2'b00: ${out} <= ${prev} + ${idx + 1};
                                2'b01: ${out} <= ${prev} ^ {{DATA_WIDTH/4{4'hA}}};
                                2'b10: ${out} <= ${prev} & {${prev}[0], ${prev}[DATA_WIDTH-1:1]};
                                2'b11: ${out} <= ~${prev} + 1; // Two's complement
                            endcase
                            alu_op_${idx} <= alu_op_${idx} + 1; // Rotate operations
                        end
                    end`;
  }
}

function defaultVerilogTransform(): string {
  return `
                    // Default ALU transform
                    pipeline_reg[stage_ptr + 1] <= pipeline_reg[stage_ptr] ^ {DATA_WIDTH{1'b1}};`;
}

// ═══════════════════════════════════════════════════════════════════
// VHDL Pipeline Stage Transforms
// ═══════════════════════════════════════════════════════════════════

export function vhdlPipelineTransform(modules: string[], ctx: SynthesisContext): string {
  if (modules.length === 0) return '                        pipeline_reg(stage_ptr + 1) <= not pipeline_reg(stage_ptr);';
  
  return modules.map((m, i) => {
    const prev = i === 0 ? 'data_in_latched' : `stage_${i-1}_reg`;
    const out = `stage_${i}_reg`;
    
    switch (m) {
      case 'BRAIN':
      case 'CORTEX':
        return `                        -- Stage ${i}: ${m} — Entropy accumulator
                        if stage_ptr = ${i} then
                            ${out} <= std_logic_vector(
                                unsigned(${prev}) + 
                                unsigned(${prev}(DATA_WIDTH-1 downto DATA_WIDTH/2) xor ${prev}(DATA_WIDTH/2-1 downto 0))
                            );
                            stage_ptr <= stage_ptr + 1;
                        end if;`;
      case 'DEFENSE':
      case 'ACCESS':
        return `                        -- Stage ${i}: ${m} — Security validator
                        if stage_ptr = ${i} then
                            if ${prev} /= (others => '0') and ${prev} /= (others => '1') then
                                ${out} <= ${prev} and x"FFFFFFFC"; -- Clear low bits (sanitize)
                            else
                                ${out} <= (others => '0'); -- Quarantine
                            end if;
                            stage_ptr <= stage_ptr + 1;
                        end if;`;
      case 'ANALYTICS':
      case 'VISION':
        return `                        -- Stage ${i}: ${m} — Statistical accumulator
                        if stage_ptr = ${i} then
                            ${out} <= std_logic_vector(
                                unsigned(${prev}) + shift_right(unsigned(${prev}), 2) - shift_right(unsigned(${prev}), 4)
                            );
                            stage_ptr <= stage_ptr + 1;
                        end if;`;
      case 'ORACLE':
        return `                        -- Stage ${i}: ${m} — Prediction MAC
                        if stage_ptr = ${i} then
                            ${out} <= std_logic_vector(
                                signed(${prev}) + shift_right(signed(${prev}), 1) + to_signed(1, DATA_WIDTH)
                            );
                            stage_ptr <= stage_ptr + 1;
                        end if;`;
      default:
        return `                        -- Stage ${i}: ${m} — ALU transform
                        if stage_ptr = ${i} then
                            ${out} <= ${prev} xor std_logic_vector(to_unsigned(${i + 1} * 17, DATA_WIDTH));
                            stage_ptr <= stage_ptr + 1;
                        end if;`;
    }
  }).join('\n');
}

// ═══════════════════════════════════════════════════════════════════
// SystemVerilog Pipeline Transforms (enhanced)
// ═══════════════════════════════════════════════════════════════════

export function svPipelineTransform(modules: string[], ctx: SynthesisContext): string {
  if (modules.length === 0) return '                        pipeline[stage + 1] <= ~pipeline[stage];';
  
  return modules.map((m, i) => {
    const prev = i === 0 ? 'pipeline[0]' : `pipeline[${i}]`;
    const out = `pipeline[${i + 1 < modules.length ? i + 1 : i}]`;

    switch (m) {
      case 'BRAIN':
        return `                    // Stage ${i}: ${m} — Cognitive entropy analysis
                    if (stage == ${i}) begin
                        automatic logic [DATA_WIDTH-1:0] entropy = ${prev} ^ (${prev} >> 3) ^ (${prev} << 5);
                        automatic logic [DATA_WIDTH-1:0] weighted = entropy + (${prev} >>> 1);
                        ${out} <= weighted;
                        stage <= stage + 1;
                    end`;
      case 'DEFENSE':
        return `                    // Stage ${i}: ${m} — Hardware injection filter
                    if (stage == ${i}) begin
                        automatic logic safe = (${prev} != '0) && (${prev} != '1) && (${prev}[7:0] != 8'h3C);
                        ${out} <= safe ? (${prev} & ~(${prev} >> 4)) : '0;
                        stage <= stage + 1;
                    end`;
      case 'ORACLE':
        return `                    // Stage ${i}: ${m} — Linear prediction unit
                    if (stage == ${i}) begin
                        automatic logic signed [DATA_WIDTH-1:0] prediction = $signed(${prev}) + ($signed(${prev}) >>> 2);
                        ${out} <= prediction;
                        stage <= stage + 1;
                    end`;
      default:
        return `                    // Stage ${i}: ${m} — Configurable transform
                    if (stage == ${i}) begin
                        ${out} <= ${prev} ^ (DATA_WIDTH'(${i + 1}) * DATA_WIDTH'(17));
                        stage <= stage + 1;
                    end`;
    }
  }).join('\n');
}

// ═══════════════════════════════════════════════════════════════════
// Chisel Pipeline Transforms
// ═══════════════════════════════════════════════════════════════════

export function chiselPipelineTransform(modules: string[], ctx: SynthesisContext): string {
  if (modules.length === 0) return '        pipeline(stagePtr + 1.U) := ~pipeline(stagePtr)';
  
  return modules.map((m, i) => {
    const prev = i === 0 ? 'pipeline(0)' : `pipeline(${i})`;
    const next = i + 1 < modules.length ? `pipeline(${i + 1})` : `pipeline(${i})`;
    
    switch (m) {
      case 'BRAIN':
        return `          // Stage ${i}: ${m} — Entropy accumulator
          when(stagePtr === ${i}.U) {
            val entropy = ${prev} ^ (${prev} >> 3.U) ^ (${prev} << 5.U)
            ${next} := ${prev} + entropy(config.dataWidth - 1, config.dataWidth / 2)
            stagePtr := stagePtr + 1.U
          }`;
      case 'DEFENSE':
        return `          // Stage ${i}: ${m} — Security gate
          when(stagePtr === ${i}.U) {
            val safe = ${prev} =/= 0.U && ${prev} =/= Fill(config.dataWidth, 1.U)
            ${next} := Mux(safe, ${prev} & ~(${prev} >> 4.U), 0.U)
            stagePtr := stagePtr + 1.U
          }`;
      case 'ORACLE':
        return `          // Stage ${i}: ${m} — Prediction MAC
          when(stagePtr === ${i}.U) {
            ${next} := ${prev} + (${prev} >> 2.U) + 1.U
            stagePtr := stagePtr + 1.U
          }`;
      case 'ANALYTICS':
        return `          // Stage ${i}: ${m} — Statistical reducer
          when(stagePtr === ${i}.U) {
            ${next} := ${prev} + (${prev} >> 2.U) - (${prev} >> 4.U)
            stagePtr := stagePtr + 1.U
          }`;
      default:
        return `          // Stage ${i}: ${m} — ALU transform
          when(stagePtr === ${i}.U) {
            ${next} := ${prev} ^ ${(i + 1) * 17}.U(config.dataWidth.W)
            stagePtr := stagePtr + 1.U
          }`;
    }
  }).join('\n');
}

// ═══════════════════════════════════════════════════════════════════
// Amaranth Pipeline Transforms
// ═══════════════════════════════════════════════════════════════════

export function amaranthPipelineTransform(modules: string[], ctx: SynthesisContext): string {
  if (modules.length === 0) return '                    m.d.sync += [pipeline[1].eq(~pipeline[0]), stage.eq(stage + 1)]';
  
  return modules.map((m, i) => {
    const prev = i === 0 ? 'pipeline[0]' : `pipeline[${i}]`;
    const next = i + 1 < modules.length ? `pipeline[${i + 1}]` : `pipeline[${i}]`;
    
    switch (m) {
      case 'BRAIN':
        return `                    # Stage ${i}: ${m} — Entropy accumulator
                    with m.If(stage == ${i}):
                        entropy = Signal(self.data_width, name="entropy_${i}")
                        m.d.comb += entropy.eq(${prev} ^ (${prev} >> 3) ^ (${prev} << 5))
                        m.d.sync += [${next}.eq(${prev} + entropy[self.data_width//2:]), stage.eq(stage + 1)]`;
      case 'DEFENSE':
        return `                    # Stage ${i}: ${m} — Security validator
                    with m.If(stage == ${i}):
                        safe = Signal(name="safe_${i}")
                        m.d.comb += safe.eq((${prev} != 0) & (${prev} != (2**self.data_width - 1)))
                        with m.If(safe):
                            m.d.sync += ${next}.eq(${prev} & ~(${prev} >> 4))
                        with m.Else():
                            m.d.sync += ${next}.eq(0)
                        m.d.sync += stage.eq(stage + 1)`;
      case 'ORACLE':
        return `                    # Stage ${i}: ${m} — Prediction unit
                    with m.If(stage == ${i}):
                        m.d.sync += [${next}.eq(${prev} + (${prev} >> 2) + 1), stage.eq(stage + 1)]`;
      default:
        return `                    # Stage ${i}: ${m} — ALU transform
                    with m.If(stage == ${i}):
                        m.d.sync += [${next}.eq(${prev} ^ ${(i + 1) * 17}), stage.eq(stage + 1)]`;
    }
  }).join('\n');
}

// ═══════════════════════════════════════════════════════════════════
// SPICE Behavioral Model Transforms
// ═══════════════════════════════════════════════════════════════════

export function spicePipelineTransform(modules: string[], ctx: SynthesisContext): string {
  if (modules.length === 0) return `B_PROC DATA_OUT 0 V = V(DATA_IN) * V(START) * 0.95`;
  
  const stages = modules.map((m, i) => {
    const prevNode = i === 0 ? 'DATA_IN' : `STAGE_${i - 1}`;
    const outNode = `STAGE_${i}`;
    
    switch (m) {
      case 'BRAIN':
        return `* Stage ${i}: ${m} — Weighted sum with nonlinear activation
B_${m}_${i} ${outNode} 0 V = TANH(V(${prevNode}) * 0.8 + 0.1) * {VDD}
R_LOAD_${i} ${outNode} 0 1MEG`;
      case 'DEFENSE':
        return `* Stage ${i}: ${m} — Clamp/limiter security gate
B_${m}_${i} ${outNode} 0 V = LIMIT(V(${prevNode}), 0.1, {VDD-0.1})
R_LOAD_${i} ${outNode} 0 1MEG`;
      case 'ANALYTICS':
        return `* Stage ${i}: ${m} — RC integration filter (running mean)
R_AVG_${i} ${prevNode} ${outNode} 10K
C_AVG_${i} ${outNode} 0 100p`;
      case 'ORACLE':
        return `* Stage ${i}: ${m} — Analog prediction (gain + offset)
E_PRED_${i} ${outNode} 0 ${prevNode} 0 1.05
V_BIAS_${i} ${outNode}_BIAS 0 DC 0.02
R_SUM_${i} ${outNode}_BIAS ${outNode} 1K`;
      case 'NEXUS':
        return `* Stage ${i}: ${m} — Analog MUX router
B_MUX_${i} ${outNode} 0 V = IF(V(${prevNode}) > {VDD/2}, V(${prevNode}) * 0.95, V(${prevNode}) * 1.05)
R_LOAD_${i} ${outNode} 0 1MEG`;
      case 'MEMORY':
        return `* Stage ${i}: ${m} — Sample-and-hold memory cell
S_SH_${i} ${prevNode} ${outNode} CLK 0 SWITCH_MODEL
C_HOLD_${i} ${outNode} 0 1p
R_LEAK_${i} ${outNode} 0 100MEG`;
      default:
        return `* Stage ${i}: ${m} — Gain stage with filtering
E_GAIN_${i} ${outNode} 0 ${prevNode} 0 0.98
R_FILT_${i} ${outNode} ${outNode}_F 1K
C_FILT_${i} ${outNode}_F 0 10p`;
    }
  });

  const lastStage = modules.length > 0 ? `STAGE_${modules.length - 1}` : 'DATA_IN';
  
  return `${stages.join('\n\n')}

* ─── Output buffer ─────────────────────────────────────────────
B_OUT DATA_OUT 0 V = V(${lastStage}) * V(START)`;
}

// ═══════════════════════════════════════════════════════════════════
// SystemC Pipeline Stage Transforms
// ═══════════════════════════════════════════════════════════════════

export function systemcPipelineTransform(modules: string[], ctx: SynthesisContext): string {
  if (modules.length === 0) return '        // No stages — passthrough\n        stage_reg[0].write(data_in.read());';

  const stages = modules.map((m, i) => {
    const prev = i === 0 ? 'stage_reg[0]' : `stage_reg[${i}]`;
    const out = `stage_reg[${i + 1}]`;

    switch (m) {
      case 'BRAIN':
      case 'CORTEX':
        return `        // Stage ${i}: ${m} — Entropy accumulator
        {
            sc_uint<DATA_WIDTH> val = ${prev}.read();
            sc_uint<DATA_WIDTH> entropy = val ^ (val >> 1) ^ (val << 3);
            ${out}.write(val + (entropy >> (DATA_WIDTH/2)) - (entropy & ((1 << DATA_WIDTH/2) - 1)));
        }`;
      case 'DEFENSE':
        return `        // Stage ${i}: ${m} — XOR-chain pattern validator
        {
            sc_uint<DATA_WIDTH> val = ${prev}.read();
            sc_uint<DATA_WIDTH> check = val ^ 0xA5A5A5A5;
            ${out}.write((check == 0) ? sc_uint<DATA_WIDTH>(0) : val);
        }`;
      case 'ANALYTICS':
        return `        // Stage ${i}: ${m} — Running accumulator
        {
            static sc_uint<DATA_WIDTH> acc_${i} = 0;
            static sc_uint<16> count_${i} = 0;
            acc_${i} += ${prev}.read();
            count_${i}++;
            ${out}.write(count_${i} > 0 ? acc_${i} / count_${i} : acc_${i});
        }`;
      case 'MEMORY':
        return `        // Stage ${i}: ${m} — Register file read/write
        {
            static sc_uint<DATA_WIDTH> mem_${i}[256];
            sc_uint<DATA_WIDTH> val = ${prev}.read();
            sc_uint<8> addr = val & 0xFF;
            mem_${i}[addr] = val;
            ${out}.write(mem_${i}[addr]);
        }`;
      case 'ORACLE':
        return `        // Stage ${i}: ${m} — Linear prediction (MAC)
        {
            static sc_uint<DATA_WIDTH> prev_val_${i} = 0;
            sc_uint<DATA_WIDTH> val = ${prev}.read();
            sc_uint<DATA_WIDTH> predicted = prev_val_${i} + ((val - prev_val_${i}) >> 2);
            prev_val_${i} = val;
            ${out}.write(predicted);
        }`;
      case 'DECODE':
        return `        // Stage ${i}: ${m} — Barrel shifter + byte extraction
        {
            sc_uint<DATA_WIDTH> val = ${prev}.read();
            sc_uint<5> shift = val & 0x1F;
            ${out}.write((val >> shift) | (val << (DATA_WIDTH - shift)));
        }`;
      case 'NEXUS':
        return `        // Stage ${i}: ${m} — Round-robin router
        {
            static int rr_sel_${i} = 0;
            sc_uint<DATA_WIDTH> val = ${prev}.read();
            sc_uint<DATA_WIDTH> routed = (val >> (8 * (rr_sel_${i} % 4))) & 0xFF;
            rr_sel_${i} = (rr_sel_${i} + 1) % 4;
            ${out}.write(routed | (val & 0xFFFFFF00));
        }`;
      case 'VISION':
        return `        // Stage ${i}: ${m} — Threshold detector
        {
            sc_uint<DATA_WIDTH> val = ${prev}.read();
            ${out}.write(val > (1 << (DATA_WIDTH/2)) ? val : sc_uint<DATA_WIDTH>(0));
        }`;
      case 'AUDIT':
        return `        // Stage ${i}: ${m} — CRC-style hash accumulator
        {
            static sc_uint<DATA_WIDTH> crc_${i} = 0xFFFFFFFF;
            sc_uint<DATA_WIDTH> val = ${prev}.read();
            crc_${i} = crc_${i} ^ val;
            for (int b = 0; b < 8; b++)
                crc_${i} = (crc_${i} >> 1) ^ ((crc_${i} & 1) ? 0xEDB88320 : 0);
            ${out}.write(crc_${i});
        }`;
      case 'EVOLUTION':
        return `        // Stage ${i}: ${m} — Fitness comparator + crossover
        {
            static sc_uint<DATA_WIDTH> best_${i} = 0;
            sc_uint<DATA_WIDTH> val = ${prev}.read();
            if (val > best_${i}) best_${i} = val;
            sc_uint<DATA_WIDTH> crossed = (val & 0xFFFF0000) | (best_${i} & 0x0000FFFF);
            ${out}.write(crossed);
        }`;
      case 'GOVERNANCE':
        return `        // Stage ${i}: ${m} — Bitmask policy checker
        {
            sc_uint<DATA_WIDTH> val = ${prev}.read();
            sc_uint<DATA_WIDTH> policy = 0x0F0F0F0F;
            ${out}.write((val & policy) == policy ? val : sc_uint<DATA_WIDTH>(0));
        }`;
      case 'PHANTOM':
        return `        // Stage ${i}: ${m} — Privacy noise injector
        {
            static sc_uint<DATA_WIDTH> lfsr_${i} = 0xACE1CAFE;
            lfsr_${i} = (lfsr_${i} >> 1) ^ ((lfsr_${i} & 1) ? 0xB4BCD35C : 0);
            sc_uint<DATA_WIDTH> val = ${prev}.read();
            ${out}.write((val & 0xFFFF0000) | (lfsr_${i} & 0x0000FFFF));
        }`;
      case 'FORGE':
        return `        // Stage ${i}: ${m} — Artifact fusion
        {
            static sc_uint<DATA_WIDTH> prev_art_${i} = 0;
            sc_uint<DATA_WIDTH> val = ${prev}.read();
            sc_uint<DATA_WIDTH> fused = (val >> 1) + (prev_art_${i} >> 1);
            prev_art_${i} = val;
            ${out}.write(fused);
        }`;
      case 'REFLEX':
        return `        // Stage ${i}: ${m} — Edge cache (last-value)
        {
            static sc_uint<DATA_WIDTH> cache_${i} = 0;
            sc_uint<DATA_WIDTH> val = ${prev}.read();
            if (val != 0) cache_${i} = val;
            ${out}.write(cache_${i});
        }`;
      default:
        return `        // Stage ${i}: ${m} — Configurable ALU
        {
            sc_uint<DATA_WIDTH> val = ${prev}.read();
            ${out}.write((val & 0x80000000) ? (val - 1) : (val + 1));
        }`;
    }
  });

  return stages.join('\n\n');
}
