/**
 * CMPSBL® Black-Box Obfuscation Layer
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Protects IP in exported single-file distributions by:
 *   1. Renaming internal variables/functions to opaque identifiers
 *   2. Obfuscating proprietary constants (CJPI weights, tier thresholds)
 *   3. Stripping internal implementation comments
 *   4. Adding Convex Core™ artifact notice + integrity hash
 *   5. Encoding scoring formula as computed constants
 *
 * PUBLIC API surface (execute, executeChain, validate, selfTest, etc.)
 * is preserved verbatim — only internals are obfuscated.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════════════════════
// §1 — Identifier Obfuscation Map
// ═══════════════════════════════════════════════════════════════════════════════

const OBFUSCATION_MAP: [RegExp, string][] = [
  // Runtime internals
  [/\b_computeRawScore\b/g, '_crs'],
  [/\b_clampScore\b/g, '_cs'],
  [/\b_classifyTier\b/g, '_ct'],
  [/\b_hashPayload\b/g, '_hp'],
  [/\b_buildFingerprint\b/g, '_bf'],
  [/\b_sagaCompensate\b/g, '_sc'],
  [/\b_fsmTransitionTable\b/g, '_ftt'],
  [/\b_moduleRegistry\b/g, '_mr'],
  [/\b_handlerMap\b/g, '_hm'],
  [/\b_pipelineContext\b/g, '_pc'],
  [/\b_executionTrace\b/g, '_et'],
  [/\b_signalBuffer\b/g, '_sb'],
  [/\b_errorAccumulator\b/g, '_ea'],
  [/\b_stageResult\b/g, '_sr'],
  [/\b_contextSnapshot\b/g, '_csn'],
  [/\b_resolveHandler\b/g, '_rh'],
  [/\b_dispatchModule\b/g, '_dm'],
  [/\b_normalizeInput\b/g, '_ni'],
  [/\b_serializeOutput\b/g, '_so'],
  [/\b_validateChain\b/g, '_vc'],
  [/\b_topologicalOrder\b/g, '_to'],
  [/\b_cycleDetect\b/g, '_cd'],
  [/\b_depthFirstWalk\b/g, '_dfw'],
  [/\b_manifestVersion\b/g, '_mv'],
  [/\b_runtimeEpoch\b/g, '_re'],
  [/\b_bootstrapSequence\b/g, '_bs'],
  [/\b_guardEvaluate\b/g, '_ge'],
  [/\b_transitionFire\b/g, '_tf'],

  // Persistent memory adapter internals
  [/\bclassifyTier\b/g, '_cft'],
  [/\bcompactCollection\b/g, '_cc'],
  [/\bfindItem\b/g, '_fi'],
  [/\blistAll\b/g, '_la'],
  [/\bwriteItem\b/g, '_wi'],
  [/\breadItem\b/g, '_ri'],
  [/\bdeleteItem\b/g, '_di'],
  [/\bcollectionDir\b/g, '_cdr'],
  [/\bitemPath\b/g, '_ip'],
  [/\bhotCache\b/g, '_hc'],
  [/\bhotMaxMs\b/g, '_hm'],
  [/\bwarmMaxMs\b/g, '_wm'],
  [/\bcoldMaxMs\b/g, '_cm'],
  [/\bMemoryEnvelope\b/g, '_ME'],
  [/\bMemoryTier\b/g, '_MT'],
  [/\bautoCompact\b/g, '_ac'],
  [/\bensureDir\b/g, '_ed'],

  // Opacity engine internals — further obscure dispatch mechanics
  [/\b_cmpsbl_resolve\b/g, '_xr'],
  [/\b_cmpsbl_gate\b/g, '_xg'],
  [/\b_cmpsblResolve\b/g, '_xr'],
  [/\b_CMPSBL_DT\b/g, '_xD'],
  [/\b_CMPSBL_CM\b/g, '_xC'],
  [/\b_CMPSBL_IV\b/g, '_xI'],
  [/\b_CMPSBL_EPOCH\b/g, '_xE'],
  [/\b_cmpsblDT\b/g, '_xD'],
  [/\b_cmpsblCM\b/g, '_xC'],
  [/\b_cmpsblIV\b/g, '_xI'],
  [/\borchestr(?:ation|ator)/gi, 'sealed matrix'],
  [/\bcollision\s*(?:matrix|scoring|mechanics)/gi, 'dispatch table'],

  // ── CMPSBL® Hardening Layer internals (the 7 always-on cores + selectable layers).
  // Public class names (CmpsblCircuitBreaker, CmpsblTimeoutBox, ...) and public
  // methods (execute, should_attempt, record_success, record_failure, reset,
  // is_closed, ShouldAttempt, RecordSuccess, RecordFailure, IsClosed, Reset)
  // are NOT renamed — customer code calls them directly and brand visibility
  // is part of the moat. We obfuscate ONLY private fields, internal helpers,
  // and the FSM math that constitutes the actual trade secret.
  // Circuit Breaker private state
  [/\bfailure_threshold\b/g, '_ft1'],
  [/\bsuccess_threshold\b/g, '_st1'],
  [/\bfailureThreshold\b/g, '_ft1'],
  [/\bsuccessThreshold\b/g, '_st1'],
  [/\bconsecutive_successes\b/g, '_cx1'],
  [/\bconsecutiveSuccesses\b/g, '_cx1'],
  [/\bcurrent_timeout_ms\b/g, '_ct1'],
  [/\bcurrentTimeoutMs\b/g, '_ct1'],
  [/\bmax_timeout_ms\b/g, '_mt1'],
  [/\bmaxTimeoutMs\b/g, '_mt1'],
  [/\bbackoff_multiplier\b/g, '_bm1'],
  [/\bbackoffMultiplier\b/g, '_bm1'],
  [/\bopened_at\b/g, '_oa1'],
  [/\bopenedAt\b/g, '_oa1'],
  [/\btotal_calls\b/g, '_tc1'],
  [/\btotalCalls\b/g, '_tc1'],
  // Private helper methods (NOT the public surface). Scoped to receiver-call
  // shapes so we never collide with unrelated user code that mentions "transition".
  [/\bnow_ms\b/g, '_nm'],
  [/\b(self|this|cb)\.transition\b/g, '$1._tr1'],
  [/\bfn transition\b/g, 'fn _tr1'],
  [/func \(cb \*CmpsblCircuitBreaker\) transition\b/g, 'func (cb *CmpsblCircuitBreaker) _tr1'],
  // Breaker panel registry (internal singleton)
  [/\bcmpsblBreakerPanel\b/g, '_bpx'],
  // Timeout / Retry private knobs (legacy aliases)
  [/\bdeadline_ms\b/g, '_dl1'],
  [/\bdeadlineMs\b/g, '_dl1'],
  [/\bjitter_ms\b/g, '_jt1'],
  [/\bjitterMs\b/g, '_jt1'],
  [/\bmax_attempts\b/g, '_ma1'],
  [/\bmaxAttempts\b/g, '_ma1'],
  [/\bbase_delay_ms\b/g, '_bd1'],
  [/\bbaseDelayMs\b/g, '_bd1'],

  // ── Always-On Core: Timeout Guard (#12) ──────────────────────────────────
  // Public API kept: cmpsbl_set_timeout, cmpsbl_get_timeout, cmpsbl_run_with_deadline
  [/\b_cmpsbl_timeout_config\b/g, '_xtc'],
  [/\b_cmpsbl_timeout_default_ms\b/g, '_xtd'],
  [/\b_cmpsbl_timeout_per_capability\b/g, '_xtp'],
  [/\bCmpsblTimeoutConfig\b/g, '_XTCfg'],
  [/\b_CmpsblTimeoutBox\b/g, '_XTBx'],

  // ── Always-On Core: Retry with Backoff (#13) ─────────────────────────────
  // Public API kept: cmpsbl_with_retry, cmpsbl_is_retryable
  [/\b_cmpsbl_retry_config\b/g, '_xrc'],
  [/\b_cmpsbl_retry_max_attempts\b/g, '_xrm'],
  [/\b_cmpsbl_retry_base_delay_ms\b/g, '_xrb'],
  [/\b_cmpsbl_retry_multiplier\b/g, '_xrx'],
  [/\b_cmpsbl_retry_jitter\b/g, '_xrj'],
  [/\b_CMPSBL_RETRYABLE_PATTERNS\b/g, '_XRP'],
  [/\b_CMPSBL_NON_RETRYABLE_PATTERNS\b/g, '_XNP'],
  [/\b_cmpsbl_backoff_ms\b/g, '_xbm'],
  [/\b_cmpsbl_sleep_sync\b/g, '_xss'],
  [/\bCmpsblRetryConfig\b/g, '_XRCfg'],

  // ── Always-On Core: Structured Error Envelope (#14) ──────────────────────
  // Public API kept: cmpsbl_classify_error, cmpsbl_wrap_envelope
  [/\b_CMPSBL_ENV_PATTERNS\b/g, '_XEP'],

  // ── Always-On Core: Trace ID Propagation (#15) ───────────────────────────
  // Public API kept: cmpsbl_new_trace_id, cmpsbl_current_trace_id, cmpsbl_with_trace
  [/\b_cmpsbl_trace_counter\b/g, '_xtcn'],
  [/\b_cmpsbl_current_trace_id\b/g, '_xcti'],
  [/\b_cmpsbl_current_trace\b/g, '_xct'],

  // ── Always-On Core: Graceful Degradation (#16) ───────────────────────────
  // Public API kept: cmpsbl_register_fallback, cmpsbl_get_fallback, cmpsbl_to_degraded
  [/\b_cmpsbl_fallback_registry\b/g, '_xfr'],

  // ── Always-On Core: BEACON Health Signal (#17) ───────────────────────────
  // Public API kept: cmpsbl_beacon_subscribe, cmpsbl_beacon_emit, cmpsbl_beacon_recent, cmpsbl_beacon_health
  [/\b_CMPSBL_BEACON_RING_MAX\b/g, '_XBM'],
  [/\b_cmpsbl_beacon_ring\b/g, '_xbr'],
  [/\b_cmpsbl_beacon_sinks\b/g, '_xbs'],
  [/\bCmpsblBeaconSink\b/g, '_XBSk'],

  // ── Selectable: Self-Healing Orchestrator (#1) ───────────────────────────
  // Public API kept: cmpsbl_self_heal, cmpsbl_repair_*
  [/\b_cmpsbl_repair_strategies\b/g, '_xrs1'],
  [/\b_cmpsbl_repair_history\b/g, '_xrh1'],
  [/\b_cmpsbl_strategy_scores\b/g, '_xss1'],
  [/\b_cmpsbl_failure_signatures\b/g, '_xfs1'],
  [/\b_cmpsbl_match_signature\b/g, '_xms1'],
  [/\b_cmpsbl_register_defaults\b/g, '_xrd1'],
  [/\b_cmpsbl_healer\b/g, '_xhl1'],
  [/\b_cmpsbl_raw_execute_sh\b/g, '_xresh'],

  // ── Selectable: Autonomous Triage (#2) ───────────────────────────────────
  [/\b_cmpsbl_triage\b/g, '_xtg1'],
  [/\b_cmpsbl_triage_history\b/g, '_xth1'],
  [/\b_cmpsbl_symptom_buffer\b/g, '_xsb1'],
  [/\b_cmpsbl_incident_history\b/g, '_xih1'],
  [/\b_cmpsbl_blast_score\b/g, '_xbs2'],
  [/\b_cmpsbl_raw_execute_tri\b/g, '_xretri'],

  // ── Selectable: Distributed Consensus (#3) ───────────────────────────────
  [/\b_cmpsbl_consensus\b/g, '_xcs1'],
  [/\b_cmpsbl_peers\b/g, '_xpr1'],
  [/\b_cmpsbl_local_clock\b/g, '_xlc1'],
  [/\b_cmpsbl_state_listeners\b/g, '_xsl1'],
  [/\b_cmpsbl_raw_execute_cs\b/g, '_xrecs'],

  // ── Selectable: Oracle-Ripple Precognition (#4) ──────────────────────────
  [/\b_cmpsbl_oracle_series\b/g, '_xos1'],
  [/\b_cmpsbl_oracle_thresholds\b/g, '_xot1'],
  [/\b_cmpsbl_oracle_actions_taken\b/g, '_xoa1'],
  [/\b_cmpsbl_ripple_graph\b/g, '_xrg1'],
  [/\b_cmpsbl_or_call_chain\b/g, '_xocc'],
  [/\b_cmpsbl_raw_execute_or\b/g, '_xreor'],

  // ── Selectable: Anomaly Correlation Engine (#5) ──────────────────────────
  [/\b_cmpsbl_anomaly_baselines\b/g, '_xab1'],
  [/\b_cmpsbl_anomaly_events\b/g, '_xae1'],
  [/\b_cmpsbl_error_counts\b/g, '_xec1'],
  [/\b_cmpsbl_adjusted_rate\b/g, '_xar1'],
  [/\b_cmpsbl_anc_call_counter\b/g, '_xacc'],
  [/\b_cmpsbl_update_baseline\b/g, '_xub1'],
  [/\b_cmpsbl_raw_execute_anc\b/g, '_xreanc'],

  // ── Selectable: Governance Shield Suite (#18) ────────────────────────────
  // Public API kept: cmpsbl_register_policy, cmpsbl_check_policies, cmpsbl_self_audit,
  // cmpsbl_execute_governed
  [/\b_cmpsbl_policies\b/g, '_xpl1'],
  [/\b_cmpsbl_vetoes\b/g, '_xvt1'],
  [/\b_cmpsbl_raw_execute_gs\b/g, '_xregs'],
  [/\bCmpsblPolicy\b/g, '_XPl1'],
  [/\bCmpsblVeto\b/g, '_XVt1'],

  // ── Selectable: Tamper-Evident Audit Chain (#19) ─────────────────────────
  // Public API kept: cmpsbl_append_audit, cmpsbl_verify_chain, cmpsbl_audit_root,
  // cmpsbl_execute_audited
  [/\b_cmpsbl_audit_chain\b/g, '_xac1'],
  [/\b_cmpsbl_audit_hash\b/g, '_xah1'],
  [/\b_cmpsbl_raw_execute_ach\b/g, '_xreach'],
  [/\bCmpsblAuditEntry\b/g, '_XAE1'],

  // ── Selectable: Adaptive Defense Breeding (#6) ───────────────────────────
  // Public API kept: cmpsbl_seed_defense, cmpsbl_breed_defenses, cmpsbl_defense_stats,
  // cmpsbl_execute_defended
  [/\b_cmpsbl_defense_pool\b/g, '_xdp1'],
  [/\b_cmpsbl_defense_generation\b/g, '_xdg1'],
  [/\b_cmpsbl_random_cd\b/g, '_xrcd'],
  [/\b_cmpsbl_raw_execute_def\b/g, '_xredef'],
  [/\bCmpsblDefenseGenome\b/g, '_XDG1'],

  // ── Selectable: Zero-Trust Identity Suite (#7) ───────────────────────────
  // Public API kept: cmpsbl_bind_session, cmpsbl_verify_session, cmpsbl_score_attack,
  // cmpsbl_execute_zerotrust
  [/\b_cmpsbl_sessions\b/g, '_xsn1'],
  [/\b_cmpsbl_session\b/g, '_xse1'],
  [/\b_cmpsbl_default_session\b/g, '_xds1'],
  [/\b_cmpsbl_hash_bind\b/g, '_xhb1'],
  [/\b_cmpsbl_raw_execute_zt\b/g, '_xrezt'],
  [/\bCmpsblSession\b/g, '_XSe1'],

  // ── Selectable: Cyber Defense Suite (#8) ─────────────────────────────────
  // Public API kept: cmpsbl_record_ioc, cmpsbl_correlate_iocs, cmpsbl_ddos_check,
  // cmpsbl_execute_cyberdefense
  [/\b_cmpsbl_iocs\b/g, '_xio1'],
  [/\b_cmpsbl_traffic_buckets\b/g, '_xtb1'],
  [/\b_cmpsbl_last_bucket_at\b/g, '_xlba'],
  [/\b_cmpsbl_ddos_absorbed\b/g, '_xda1'],
  [/\b_cmpsbl_raw_execute_cd\b/g, '_xrecd'],
  [/\bCmpsblIOC\b/g, '_XIO1'],

  // ── Selectable: Fleet Intelligence Orchestrator (#9) ─────────────────────
  // Public API kept: cmpsbl_register_provider, cmpsbl_pick_provider, cmpsbl_score_provider,
  // cmpsbl_record_provider_call, cmpsbl_execute_fleet
  [/\b_cmpsbl_providers\b/g, '_xpv1'],
  [/\b_cmpsbl_provider\b/g, '_xpv2'],
  [/\b_cmpsbl_routed_to\b/g, '_xrt1'],
  [/\b_cmpsbl_raw_execute_fi\b/g, '_xrefi'],
  [/\bCmpsblProvider\b/g, '_XPv1'],

  // ── Selectable: AI Safety Suite (#10) ────────────────────────────────────
  // Public API kept: cmpsbl_check_hallucination, cmpsbl_sanitize_prompt, cmpsbl_execute_safe
  [/\b_cmpsbl_raw_execute_as\b/g, '_xreas'],

  // ── Selectable: AI Cost Intelligence Suite (#11) ─────────────────────────
  // Public API kept: cmpsbl_set_budget, cmpsbl_can_spend, cmpsbl_record_spend,
  // cmpsbl_register_cost, cmpsbl_estimate_cost, cmpsbl_execute_costaware
  [/\b_cmpsbl_budget\b/g, '_xbg1'],
  [/\b_cmpsbl_provider_cpm\b/g, '_xpcp'],
  [/\b_cmpsbl_quality_hint\b/g, '_xqh1'],
  [/\b_cmpsbl_tokens_in\b/g, '_xti1'],
  [/\b_cmpsbl_raw_execute_co\b/g, '_xreco'],
  [/\bCmpsblBudget\b/g, '_XBg1'],
  [/\bCmpsblTokenPlan\b/g, '_XTP1'],

  // ── Selectable: Cognitive Memory Suite (#12) ─────────────────────────────
  // Public API kept: cmpsbl_remember, cmpsbl_recall, cmpsbl_relate, cmpsbl_traverse,
  // cmpsbl_compact, cmpsbl_execute_memory
  [/\b_cmpsbl_nodes\b/g, '_xnd1'],
  [/\b_cmpsbl_edges\b/g, '_xed1'],
  [/\b_cmpsbl_label_index\b/g, '_xli1'],
  [/\b_cmpsbl_raw_execute_cm\b/g, '_xrecm'],
  [/\bCmpsblNode\b/g, '_XNd1'],
  [/\bCmpsblEdge\b/g, '_XEd1'],

  // ── Selectable: Performance Surgery Suite (#13) ──────────────────────────
  // Public API kept: cmpsbl_record_sample, cmpsbl_top_hotpaths, cmpsbl_set_baseline,
  // cmpsbl_check_regression, cmpsbl_execute_profiled
  [/\b_cmpsbl_hot_paths\b/g, '_xhp1'],
  [/\b_cmpsbl_baselines\b/g, '_xbl1'],
  [/\b_cmpsbl_classify_complexity\b/g, '_xcc1'],
  [/\b_cmpsbl_time_ps\b/g, '_xtp2'],
  [/\b_cmpsbl_raw_execute_ps\b/g, '_xreps'],
  [/\bCmpsblHotPath\b/g, '_XHP1'],

  // ── Selectable: Data Pipeline Resilience Suite (#14) ─────────────────────
  // Public API kept: cmpsbl_create_stream, cmpsbl_publish, cmpsbl_consume, cmpsbl_replay,
  // cmpsbl_stream_stats, cmpsbl_execute_streamed
  [/\b_cmpsbl_streams\b/g, '_xst1'],
  [/\b_cmpsbl_event_log\b/g, '_xel1'],
  [/\b_cmpsbl_raw_execute_pr\b/g, '_xrepr'],
  [/\bCmpsblBuffer\b/g, '_XBu1'],
  [/\bCmpsblEvent\b/g, '_XEv1'],

  // ── Selectable: Pipeline Composition Engine (#15) ────────────────────────
  // Public API kept: cmpsbl_pipeline, cmpsbl_add_stage, cmpsbl_run_pipeline,
  // cmpsbl_pipeline_stats, cmpsbl_execute_composable
  // (raw_execute_pc was already mapped via _pipelineContext above; add explicit)
  [/\b_cmpsbl_pipelines\b/g, '_xpp1'],
  [/\bCmpsblPipeline\b/g, '_XPp1'],
  [/\bCmpsblStage\b/g, '_XSg1'],

  // ── Selectable: Universal Input Intelligence (#16) ───────────────────────
  // Public API kept: cmpsbl_thread, cmpsbl_fork_thread, cmpsbl_append_turn,
  // cmpsbl_detect_modality, cmpsbl_normalize_input, cmpsbl_execute_universal
  [/\b_cmpsbl_threads\b/g, '_xth2'],
  [/\b_cmpsbl_modality\b/g, '_xmd1'],
  [/\b_cmpsbl_raw_execute_ui\b/g, '_xreui'],
  [/\bCmpsblThread\b/g, '_XTh1'],
  [/\bCmpsblInputModality\b/g, '_XIM1'],

  // ── Selectable: Self-Evolution Suite (#17) ───────────────────────────────
  // Public API kept: cmpsbl_propose_mutation, cmpsbl_shadow_run, cmpsbl_promote,
  // cmpsbl_rollback, cmpsbl_mutation_stats, cmpsbl_execute_evolved
  [/\b_cmpsbl_mutations\b/g, '_xmu1'],
  [/\b_cmpsbl_shadow_state\b/g, '_xss2'],
  [/\b_cmpsbl_evolve_outcomes\b/g, '_xeo1'],
  [/\b_cmpsbl_raw_execute_se\b/g, '_xrese'],
  [/\bCmpsblMutation\b/g, '_XMu1'],

  // ── Selectable: Regulatory Compliance Suite (#20) ────────────────────────
  // Public API kept: cmpsbl_record_compliance, cmpsbl_attestation, cmpsbl_route_for,
  // cmpsbl_execute_compliant
  [/\b_cmpsbl_compliance_events\b/g, '_xce1'],
  [/\b_cmpsbl_jurisdiction_controls\b/g, '_xjc1'],
  [/\b_cmpsbl_jurisdiction\b/g, '_xju1'],
  [/\b_cmpsbl_residency_routes\b/g, '_xrr1'],
  [/\b_cmpsbl_fingerprint\b/g, '_xfp1'],
  [/\b_cmpsbl_json_ps\b/g, '_xjp1'],
  [/\b_cmpsbl_raw_execute_ac\b/g, '_xreac'],
  [/\bCmpsblComplianceEvent\b/g, '_XCE1'],
  [/\bCmpsblJurisdiction\b/g, '_XJu1'],

  // ── Python Unified Emitter — 40 organ/layer/engine/agent handlers (#21) ──
  // These names leak the 40-Primitive architecture in plain text. They are
  // internal dispatch handlers — never part of public API. We rename each one
  // to an opaque token; the HANDLER_REGISTRY string keys ("CORE", "BRAIN", ...)
  // are kept (they're data, not symbols), but the function references they
  // resolve to become opaque. Renames apply consistently to def + reference.
  // Organs (12)
  [/\bhandle_core\b/g, '_h01'],
  [/\bhandle_system\b/g, '_h02'],
  [/\bhandle_brain\b/g, '_h03'],
  [/\bhandle_memory\b/g, '_h04'],
  [/\bhandle_nerve\b/g, '_h05'],
  [/\bhandle_nexus\b/g, '_h06'],
  [/\bhandle_identity\b/g, '_h07'],
  [/\bhandle_sovereign\b/g, '_h08'],
  [/\bhandle_atlas\b/g, '_h09'],
  [/\bhandle_medic\b/g, '_h10'],
  [/\bhandle_relay\b/g, '_h11'],
  [/\bhandle_conscience\b/g, '_h12'],
  // Layers (12)
  [/\bhandle_defense\b/g, '_h13'],
  [/\bhandle_immunity\b/g, '_h14'],
  [/\bhandle_governance\b/g, '_h15'],
  [/\bhandle_treaty\b/g, '_h16'],
  [/\bhandle_evolution\b/g, '_h17'],
  [/\bhandle_reflex\b/g, '_h18'],
  [/\bhandle_compass\b/g, '_h19'],
  [/\bhandle_integration\b/g, '_h20'],
  [/\bhandle_intent\b/g, '_h21'],
  [/\bhandle_access\b/g, '_h22'],
  [/\bhandle_vision\b/g, '_h23'],
  [/\bhandle_shadow\b/g, '_h24'],
  // Engines (8)
  [/\bhandle_dream\b/g, '_h25'],
  [/\bhandle_harvest\b/g, '_h26'],
  [/\bhandle_forge\b/g, '_h27'],
  [/\bhandle_lingua\b/g, '_h28'],
  [/\bhandle_echo\b/g, '_h29'],
  [/\bhandle_phantom\b/g, '_h30'],
  [/\bhandle_sandbox\b/g, '_h31'],
  [/\bhandle_ripple\b/g, '_h32'],
  // Agents (8)
  [/\bhandle_encode\b/g, '_h33'],
  [/\bhandle_decode\b/g, '_h34'],
  [/\bhandle_audit\b/g, '_h35'],
  [/\bhandle_economy\b/g, '_h36'],
  [/\bhandle_inclusive\b/g, '_h37'],
  [/\bhandle_cortex\b/g, '_h38'],
  [/\bhandle_oracle\b/g, '_h39'],
  [/\bhandle_engineer\b/g, '_h40'],
  // Always-on candidate slot + default
  [/\bhandle_candidate\b/g, '_h41'],
  [/\bhandle_default\b/g, '_h42'],
  // Internal helpers used only by Python handlers
  [/\bquick_hash\b/g, '_qh1'],
  [/\buser_keys\b/g, '_uk1'],
  // Registry name itself — opaque dispatch table
  [/\bHANDLER_REGISTRY\b/g, '_HR1'],
];

// ═══════════════════════════════════════════════════════════════════════════════
// §2 — Proprietary Constant Obfuscation
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * CJPI scoring weights and tier thresholds are competitive IP.
 * Replace readable constants with computed expressions that produce the same values
 * but are much harder to extract by inspection.
 */
const CONSTANT_OBFUSCATION: [RegExp, string][] = [
  // CJPI weights: 0.30, 0.30, 0.20, 0.20 → computed from encoded array
  // TypeScript/JavaScript
  [/\(novelty \* 0\.30\) \+ \(utility \* 0\.30\) \+ \(complexity \* 0\.20\) \+ \(composability \* 0\.20\)/g,
    '(novelty * _W[0]) + (utility * _W[1]) + (complexity * _W[2]) + (composability * _W[3])'],
  [/novelty \* 0\.30/g, 'novelty * _W[0]'],
  [/utility \* 0\.30/g, 'utility * _W[1]'],
  [/complexity \* 0\.20/g, 'complexity * _W[2]'],
  [/composability \* 0\.20/g, 'composability * _W[3]'],

  // Python weights
  [/novelty \* 0\.3(?:0)?/g, 'novelty * _W[0]'],
  [/utility \* 0\.3(?:0)?/g, 'utility * _W[1]'],
  [/complexity \* 0\.2(?:0)?/g, 'complexity * _W[2]'],
  [/composability \* 0\.2(?:0)?/g, 'composability * _W[3]'],

  // Tier thresholds: 92, 80, 65, 45
  [/score >= 92/g, 'score >= _T[0]'],
  [/score >= 80/g, 'score >= _T[1]'],
  [/score >= 65/g, 'score >= _T[2]'],
  [/score >= 45/g, 'score >= _T[3]'],

  // Memory tier thresholds (hours/days → ms)
  [/hotMaxHours\s*\?\?\s*24/g, '_MH[0]'],
  [/warmMaxDays\s*\?\?\s*7/g, '_MH[1]'],
  [/coldMaxDays\s*\?\?\s*parseInt\([^)]+\)/g, '_MH[2]'],
  [/'90'/g, "'' + _MH[3]"],
];

/**
 * Generate the obfuscated weight/threshold declarations for insertion.
 * The values are split into base + offset to prevent simple grep.
 */
function getObfuscatedConstants(lang: string): string {
  const c = getCommentPrefix(lang);
  
  if (lang === 'typescript' || lang === 'javascript') {
    return `${c} Sealed scoring parameters — DO NOT MODIFY
const _W = [0x1E, 0x1E, 0x14, 0x14].map(v => v / 100);
const _T = [0x5C, 0x50, 0x41, 0x2D];
const _MH = [0x18, 0x07, 0x5A, 0x5A];
`;
  }
  
  if (lang === 'python') {
    return `# Sealed scoring parameters — DO NOT MODIFY
_W = [v / 100 for v in [0x1E, 0x1E, 0x14, 0x14]]
_T = [0x5C, 0x50, 0x41, 0x2D]
`;
  }
  
  if (lang === 'php') {
    return `// Sealed scoring parameters — DO NOT MODIFY
define('CMPSBL_W', array_map(fn($v) => $v / 100, [0x1E, 0x1E, 0x14, 0x14]));
define('CMPSBL_T', [0x5C, 0x50, 0x41, 0x2D]);
`;
  }
  
  if (lang === 'rust') {
    return `// Sealed scoring parameters — DO NOT MODIFY
const _W: [f64; 4] = [0x1Eu32 as f64 / 100.0, 0x1Eu32 as f64 / 100.0, 0x14u32 as f64 / 100.0, 0x14u32 as f64 / 100.0];
const _T: [u32; 4] = [0x5C, 0x50, 0x41, 0x2D];
`;
  }
  
  if (lang === 'go') {
    return `// Sealed scoring parameters — DO NOT MODIFY
var _W = [4]float64{float64(0x1E) / 100, float64(0x1E) / 100, float64(0x14) / 100, float64(0x14) / 100}
var _T = [4]int{0x5C, 0x50, 0x41, 0x2D}
`;
  }
  
  if (lang === 'java' || lang === 'kotlin' || lang === 'csharp' || lang === 'swift' || lang === 'scala' || lang === 'dart') {
    return `${c} Sealed scoring parameters — DO NOT MODIFY
`;
  }
  
  return `${c} Sealed scoring parameters (built-in)\n`;
}

// Section markers that should NOT be stripped
const PRESERVED_PATTERNS = [
  '§1', '§2', '§3', '§4',
  'CONVEX CORE', 'MODULE EFFECTS', 'RUNTIME BRIDGE', 'CAPABILITY API',
  'SEALED', 'CMPSBL®', '© 2025', '© 2026',
  'DO NOT MODIFY', 'REDISTRIBUTION PROHIBITED',
  'DROP-IN DISTRIBUTION',
  '═══', '╔', '╚', '║',
];

// ═══════════════════════════════════════════════════════════════════════════════
// §3 — Main Black-Box Function
// ═══════════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════════
// Layer 1 protection — obfuscation MUST NOT touch the original source region.
// We split the file into [pre-L1, L1 verbatim, post-L1], obfuscate only the
// non-L1 segments, then rejoin. This preserves the byte-perfect Layer 1 mandate
// (U.S. App. No. 64/029,678) while still sealing Layer 2 internals.
// ═══════════════════════════════════════════════════════════════════════════════

/** Locate the Layer 1 region by its banner markers. Returns null if absent. */
function findLayer1Region(source: string): { start: number; end: number } | null {
  // Begin markers (any of these)
  const beginRegexes = [
    /LAYER 1 — YOUR ORIGINAL SOURCE/,
    /LAYER 1 — ORIGINAL SOURCE/,
    /LAYER 1 — Original customer code/,
    /Layer 1 — Original Source/,
  ];
  // End markers
  const endRegexes = [
    /END LAYER 1/,
    /END OF LAYER 1/,
  ];

  let beginIdx = -1;
  for (const r of beginRegexes) {
    const m = source.match(r);
    if (m && m.index !== undefined) { beginIdx = m.index; break; }
  }
  if (beginIdx < 0) return null;

  // Walk back to start of the line containing the begin marker so we
  // don't strip the banner's leading comment characters.
  while (beginIdx > 0 && source[beginIdx - 1] !== '\n') beginIdx--;

  let endIdx = -1;
  for (const r of endRegexes) {
    const m = source.slice(beginIdx).match(r);
    if (m && m.index !== undefined) { endIdx = beginIdx + m.index; break; }
  }
  if (endIdx < 0) return null;

  // Extend endIdx past the rest of that line (so the closing banner row stays intact).
  const nextNewline = source.indexOf('\n', endIdx);
  const end = nextNewline === -1 ? source.length : nextNewline;
  // Also include the closing banner box bottom row if present (line starting with similar comment + ╚)
  const after = source.slice(end + 1);
  const closingBoxMatch = after.match(/^[ \t]*(?:\/\/|#|--)[ \t]*╚[^\n]*\n?/);
  const finalEnd = closingBoxMatch ? end + 1 + closingBoxMatch[0].length : end + 1;

  return { start: beginIdx, end: finalEnd };
}

/** Apply the full Layer-2 obfuscation pass to a single text segment. */
function obfuscateSegment(segment: string, lang: string): string {
  let result = segment;

  // Obfuscate proprietary constants (CJPI weights, tier thresholds)
  if (['typescript', 'javascript', 'python', 'php', 'rust', 'go'].includes(lang)) {
    for (const [pattern, replacement] of CONSTANT_OBFUSCATION) {
      result = result.replace(pattern, replacement);
    }
  }

  // Obfuscate internal identifiers
  if (['typescript', 'javascript', 'python', 'php', 'rust', 'go', 'java', 'csharp', 'swift', 'kotlin'].includes(lang)) {
    for (const [pattern, replacement] of OBFUSCATION_MAP) {
      result = result.replace(pattern, replacement);
    }
  }

  // Strip verbose internal comments
  result = stripInternalComments(result, lang);

  return result;
}

/**
 * Apply black-box obfuscation to a generated capability file.
 * Preserves public API + Layer 1 source verbatim, obfuscates Layer 2 internals,
 * adds sealed notice and integrity hash.
 */
export function blackboxFile(source: string, lang: string): string {
  // 1. Split off Layer 1 (must remain byte-identical)
  const region = findLayer1Region(source);

  let pre: string;
  let l1: string;
  let post: string;
  if (region) {
    pre  = source.slice(0, region.start);
    l1   = source.slice(region.start, region.end);
    post = source.slice(region.end);
  } else {
    // No Layer 1 banners — treat entire file as obfuscatable (e.g., sealed runtime files)
    pre  = source;
    l1   = '';
    post = '';
  }

  // 2. Obfuscate ONLY the non-L1 segments
  let obfPre  = obfuscateSegment(pre, lang);
  let obfPost = obfuscateSegment(post, lang);

  // 3. Prepend sealed notice — always at the very top so the SEALED RUNTIME /
  //    PROPRIETARY DISTRIBUTION marker is unambiguous and discoverable.
  const sealedNotice = getSealedNotice(lang);
  obfPre = sealedNotice + '\n\n' + obfPre;

  // 4. Insert obfuscated constant declarations (after imports, before first function)
  //    Always inject into the pre-segment so Layer 2 references resolve.
  const constantsBlock = getObfuscatedConstants(lang);
  const insertPoint = findConstantInsertPoint(obfPre, lang);
  if (insertPoint > 0) {
    obfPre = obfPre.slice(0, insertPoint) + '\n' + constantsBlock + '\n' + obfPre.slice(insertPoint);
  }

  // 5. Reassemble — Layer 1 is restored byte-for-byte
  let result = obfPre + l1 + obfPost;

  // 6. Append integrity seal at the very bottom
  const integrityHash = computeSimpleHash(result);
  const commentPrefix = getCommentPrefix(lang);
  result += `\n${commentPrefix} ═══ CONVEX CORE™ INTEGRITY ═══\n`;
  result += `${commentPrefix} Hash: ${integrityHash}\n`;
  result += `${commentPrefix} Sealed: ${new Date().toISOString().slice(0, 10)}\n`;
  result += `${commentPrefix} CMPSBL® runtime — built into this file. Redistribution as standalone product prohibited.\n`;
  result += `${commentPrefix} Decompilation, extraction, or reverse engineering of scoring parameters is prohibited.\n`;

  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// §4 — Helper Functions
// ═══════════════════════════════════════════════════════════════════════════════

function getSealedNotice(lang: string): string {
  const c = getCommentPrefix(lang);
  return [
    `${c} ╔═══════════════════════════════════════════════════════════════════════════════╗`,
    `${c} ║  CMPSBL® ASCENSION LAYER™ — SEALED RUNTIME · PROPRIETARY DISTRIBUTION         ║`,
    `${c} ║                                                                               ║`,
    `${c} ║  This file contains the Ascension Layer runtime — a deterministic,            ║`,
    `${c} ║  patent-protected execution layer that wraps your code (LAYER 1).             ║`,
    `${c} ║  All components are baked into this single file — drop-in, zero deps.         ║`,
    `${c} ║                                                                               ║`,
    `${c} ║  Sections marked Black-Boxed contain proprietary scoring, governance,         ║`,
    `${c} ║  and orchestration logic. DO NOT MODIFY, extract, or redistribute.            ║`,
    `${c} ║  Decompilation or reverse engineering of layer internals is prohibited.       ║`,
    `${c} ║                                                                               ║`,
    `${c} ║  Configure layers, view telemetry, or learn more:                             ║`,
    `${c} ║    · https://cmpsbl.com                                                       ║`,
    `${c} ║    · npx @cmpsbl/cli   (advanced settings · layer management)                 ║`,
    `${c} ║                                                                               ║`,
    `${c} ║  U.S. Patent App. No. 64/029,678 · No. 64/031,637                            ║`,
    `${c} ║  © 2025–2026 CMPSBL®. All rights reserved.                                   ║`,
    `${c} ╚═══════════════════════════════════════════════════════════════════════════════╝`,
  ].join('\n');
}

function getCommentPrefix(lang: string): string {
  const map: Record<string, string> = {
    typescript: '//', javascript: '//', python: '#', php: '//', rust: '//',
    go: '//', java: '//', csharp: '//', swift: '//', kotlin: '//',
    ruby: '#', lua: '--', dart: '//', scala: '//', elixir: '#',
    haskell: '--', zig: '//', c: '//', cpp: '//',
    verilog: '//', systemverilog: '//', vhdl: '--',
  };
  return map[lang] || '//';
}

function findHeaderEnd(source: string, lang: string): number {
  const lines = source.split('\n');
  const prefix = getCommentPrefix(lang);
  let inHeader = false;
  for (let i = 0; i < Math.min(lines.length, 30); i++) {
    const trimmed = lines[i].trim();
    if (trimmed.startsWith(prefix) || trimmed.startsWith('/*') || trimmed.startsWith('"""') || trimmed.startsWith('#')) {
      inHeader = true;
    } else if (inHeader && trimmed.length > 0) {
      return lines.slice(0, i).join('\n').length;
    }
  }
  return 0;
}

function findConstantInsertPoint(source: string, lang: string): number {
  const lines = source.split('\n');
  // Find first function/class declaration — insert constants just before
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (lang === 'typescript' || lang === 'javascript') {
      if (trimmed.startsWith('export function') || trimmed.startsWith('function ') || trimmed.startsWith('export class')) {
        return lines.slice(0, i).join('\n').length;
      }
    } else if (lang === 'python') {
      if (trimmed.startsWith('def ') || trimmed.startsWith('class ')) {
        return lines.slice(0, i).join('\n').length;
      }
    } else if (lang === 'php') {
      if (trimmed.startsWith('function ') || trimmed.startsWith('class ')) {
        return lines.slice(0, i).join('\n').length;
      }
    } else if (lang === 'rust') {
      if (trimmed.startsWith('pub fn ') || trimmed.startsWith('fn ') || trimmed.startsWith('pub struct')) {
        return lines.slice(0, i).join('\n').length;
      }
    } else if (lang === 'go') {
      if (trimmed.startsWith('func ') || trimmed.startsWith('type ')) {
        return lines.slice(0, i).join('\n').length;
      }
    }
  }
  return 0;
}

function stripInternalComments(source: string, lang: string): string {
  const prefix = getCommentPrefix(lang);
  const lines = source.split('\n');
  
  return lines.filter(line => {
    const trimmed = line.trim();
    // Keep non-comment lines
    if (!trimmed.startsWith(prefix)) return true;
    // Keep empty comment lines (spacing)
    if (trimmed === prefix) return true;
    // Keep preserved patterns (headers, legal, sealed notices)
    if (PRESERVED_PATTERNS.some(h => trimmed.includes(h))) return true;
    // Keep JSDoc / docstring markers
    if (trimmed.startsWith('/**') || trimmed.startsWith('*/') || trimmed.startsWith('* ')) return true;
    // Keep lines with just a few words (likely structural)
    const commentContent = trimmed.slice(prefix.length).trim();
    if (commentContent.length < 10) return true;
    // Strip verbose internal implementation comments
    // (anything that looks like an explanation of HOW the code works)
    if (commentContent.includes('TODO') || commentContent.includes('HACK') || commentContent.includes('FIXME')) return false;
    if (commentContent.startsWith('This ') || commentContent.startsWith('We ') || commentContent.startsWith('The ')) return false;
    if (commentContent.startsWith('Note:') || commentContent.startsWith('Explanation:')) return false;
    // Strip CMPSBL® Hardening Layer design comments — they leak the FSM/algorithm
    // shape (e.g. "Three-state FSM: closed -> open -> half-open with exponential backoff").
    // The Layer banner ("Ascension Layer™ — <Name>") is preserved by PRESERVED_PATTERNS above.
    const lower = commentContent.toLowerCase();
    if (lower.includes('three-state fsm') || lower.includes('exponential backoff')) return false;
    if (lower.includes('half-open') && lower.includes('closed')) return false;
    if (lower.includes('breaker panel') || lower.includes('breaker registry')) return false;
    if (lower.startsWith('three-state') || lower.startsWith('two-state')) return false;
    // Keep everything else
    return true;
  }).join('\n');
}

function computeSimpleHash(content: string): string {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}
