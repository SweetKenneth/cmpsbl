/**
 * CMPSBL® Layer Polyglot Templates
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates circuit breaker (and future layer) code in every
 * supported language. Same pattern as the polyglot runtime:
 * one canonical algorithm, N syntax skins.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { CmpsblLayerDefinition } from './cmpsbl-layers';

// ═══════════════════════════════════════════════════════════════════════════════
// Comment character map — matches polyglot-templates.ts
// ═══════════════════════════════════════════════════════════════════════════════

const LANG_COMMENT: Record<string, string> = {
  typescript: '//', javascript: '//', python: '#', rust: '//', go: '//',
  java: '//', csharp: '//', ruby: '#', swift: '//', kotlin: '//',
  c: '//', cpp: '//', lua: '--', dart: '//', scala: '//',
  elixir: '#', r: '#', haskell: '--', zig: '//',
  verilog: '//', systemverilog: '//', vhdl: '--',
  chisel: '//', amaranth: '#', spinalhdl: '//', firrtl: '//',
  php: '//', fsharp: '//', nim: '#', crystal: '#',
  ocaml: '(*', clojure: ';;', erlang: '%',
  perl: '#', groovy: '//', bash: '#', powershell: '#',
  objective_c: '//', fortran: '!', d: '//',
  solidity: '//', vyper: '#', move: '//', cairo: '//',
  cuda: '//', glsl: '//', hlsl: '//', wgsl: '//', metal: '//', opencl: '//',
};

const HDL_LANGS = new Set([
  'verilog', 'systemverilog', 'vhdl', 'chisel', 'amaranth',
  'spinalhdl', 'firrtl', 'bluespec',
]);

// ═══════════════════════════════════════════════════════════════════════════════
// Rust
// ═══════════════════════════════════════════════════════════════════════════════

function circuitBreakerRust(): string {
  const lines = [
    '// CMPSBL Layer — Circuit Breaker (Crown Jewel #11)',
    '// Three-state FSM: closed -> open -> half-open with exponential backoff.',
    '',
    'use std::collections::HashMap;',
    'use std::time::{SystemTime, UNIX_EPOCH};',
    '',
    '#[derive(Debug, Clone, PartialEq)]',
    'pub enum CmpsblCircuitState { Closed, Open, HalfOpen }',
    '',
    'pub struct CmpsblCircuitBreaker {',
    '    pub name: String,',
    '    state: CmpsblCircuitState,',
    '    failures: u32, successes: u32, consecutive_successes: u32, total_calls: u32,',
    '    failure_threshold: u32, success_threshold: u32,',
    '    timeout_ms: u64, max_timeout_ms: u64, backoff_multiplier: f64,',
    '    current_timeout_ms: u64, opened_at: Option<u64>,',
    '}',
    '',
    'impl CmpsblCircuitBreaker {',
    '    pub fn new(name: &str) -> Self {',
    '        Self {',
    '            name: name.to_string(), state: CmpsblCircuitState::Closed,',
    '            failures: 0, successes: 0, consecutive_successes: 0, total_calls: 0,',
    '            failure_threshold: 5, success_threshold: 2,',
    '            timeout_ms: 30_000, max_timeout_ms: 300_000, backoff_multiplier: 2.0,',
    '            current_timeout_ms: 30_000, opened_at: None,',
    '        }',
    '    }',
    '',
    '    fn now_ms() -> u64 {',
    '        SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as u64',
    '    }',
    '',
    '    fn transition(&mut self, to: CmpsblCircuitState) {',
    '        if self.state == to { return; }',
    '        self.state = to.clone();',
    '        match to {',
    '            CmpsblCircuitState::Open => { self.opened_at = Some(Self::now_ms()); self.consecutive_successes = 0; }',
    '            CmpsblCircuitState::Closed => { self.failures = 0; self.current_timeout_ms = self.timeout_ms; }',
    '            _ => {}',
    '        }',
    '    }',
    '',
    '    pub fn should_attempt(&mut self) -> bool {',
    '        match self.state {',
    '            CmpsblCircuitState::Closed => true,',
    '            CmpsblCircuitState::Open => {',
    '                let elapsed = Self::now_ms() - self.opened_at.unwrap_or(0);',
    '                if elapsed >= self.current_timeout_ms { self.transition(CmpsblCircuitState::HalfOpen); true }',
    '                else { false }',
    '            }',
    '            CmpsblCircuitState::HalfOpen => true,',
    '        }',
    '    }',
    '',
    '    pub fn record_success(&mut self) {',
    '        self.total_calls += 1; self.successes += 1; self.consecutive_successes += 1;',
    '        if self.state == CmpsblCircuitState::HalfOpen && self.consecutive_successes >= self.success_threshold {',
    '            self.transition(CmpsblCircuitState::Closed);',
    '        }',
    '    }',
    '',
    '    pub fn record_failure(&mut self) {',
    '        self.total_calls += 1; self.failures += 1; self.consecutive_successes = 0;',
    '        match self.state {',
    '            CmpsblCircuitState::HalfOpen => {',
    '                self.current_timeout_ms = ((self.current_timeout_ms as f64 * self.backoff_multiplier) as u64).min(self.max_timeout_ms);',
    '                self.transition(CmpsblCircuitState::Open);',
    '            }',
    '            CmpsblCircuitState::Closed if self.failures >= self.failure_threshold => {',
    '                self.transition(CmpsblCircuitState::Open);',
    '            }',
    '            _ => {}',
    '        }',
    '    }',
    '',
    '    pub fn reset(&mut self) {',
    '        self.state = CmpsblCircuitState::Closed; self.failures = 0; self.successes = 0;',
    '        self.consecutive_successes = 0; self.current_timeout_ms = self.timeout_ms; self.opened_at = None;',
    '    }',
    '',
    '    pub fn is_closed(&self) -> bool { self.state == CmpsblCircuitState::Closed }',
    '}',
  ];
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Go
// ═══════════════════════════════════════════════════════════════════════════════

function circuitBreakerGo(): string {
  const lines = [
    '// CMPSBL Layer — Circuit Breaker (Crown Jewel #11)',
    '// Three-state FSM: closed -> open -> half-open with exponential backoff.',
    '',
    'type CmpsblCircuitState int',
    'const (',
    '\tCmpsblClosed CmpsblCircuitState = iota',
    '\tCmpsblOpen',
    '\tCmpsblHalfOpen',
    ')',
    '',
    'type CmpsblCircuitBreaker struct {',
    '\tName                 string',
    '\tstate                CmpsblCircuitState',
    '\tfailures             int',
    '\tsuccessThreshold     int',
    '\tfailureThreshold     int',
    '\tconsecutiveSuccesses int',
    '\ttotalCalls           int',
    '\ttimeoutMs            int64',
    '\tmaxTimeoutMs         int64',
    '\tbackoffMultiplier    float64',
    '\tcurrentTimeoutMs     int64',
    '\topenedAt             int64',
    '}',
    '',
    'func NewCmpsblCircuitBreaker(name string) *CmpsblCircuitBreaker {',
    '\treturn &CmpsblCircuitBreaker{',
    '\t\tName: name, state: CmpsblClosed,',
    '\t\tfailureThreshold: 5, successThreshold: 2,',
    '\t\ttimeoutMs: 30000, maxTimeoutMs: 300000, backoffMultiplier: 2.0,',
    '\t\tcurrentTimeoutMs: 30000,',
    '\t}',
    '}',
    '',
    'func (cb *CmpsblCircuitBreaker) transition(to CmpsblCircuitState) {',
    '\tif cb.state == to { return }',
    '\tcb.state = to',
    '\tif to == CmpsblOpen { cb.openedAt = time.Now().UnixMilli(); cb.consecutiveSuccesses = 0 }',
    '\tif to == CmpsblClosed { cb.failures = 0; cb.currentTimeoutMs = cb.timeoutMs }',
    '}',
    '',
    'func (cb *CmpsblCircuitBreaker) ShouldAttempt() bool {',
    '\tswitch cb.state {',
    '\tcase CmpsblClosed: return true',
    '\tcase CmpsblOpen:',
    '\t\telapsed := time.Now().UnixMilli() - cb.openedAt',
    '\t\tif elapsed >= cb.currentTimeoutMs { cb.transition(CmpsblHalfOpen); return true }',
    '\t\treturn false',
    '\tdefault: return true',
    '\t}',
    '}',
    '',
    'func (cb *CmpsblCircuitBreaker) RecordSuccess() {',
    '\tcb.totalCalls++; cb.consecutiveSuccesses++',
    '\tif cb.state == CmpsblHalfOpen && cb.consecutiveSuccesses >= cb.successThreshold {',
    '\t\tcb.transition(CmpsblClosed)',
    '\t}',
    '}',
    '',
    'func (cb *CmpsblCircuitBreaker) RecordFailure() {',
    '\tcb.totalCalls++; cb.failures++; cb.consecutiveSuccesses = 0',
    '\tif cb.state == CmpsblHalfOpen {',
    '\t\tcb.currentTimeoutMs = int64(math.Min(float64(cb.currentTimeoutMs)*cb.backoffMultiplier, float64(cb.maxTimeoutMs)))',
    '\t\tcb.transition(CmpsblOpen)',
    '\t} else if cb.state == CmpsblClosed && cb.failures >= cb.failureThreshold {',
    '\t\tcb.transition(CmpsblOpen)',
    '\t}',
    '}',
    '',
    'func (cb *CmpsblCircuitBreaker) Reset() {',
    '\tcb.state = CmpsblClosed; cb.failures = 0; cb.consecutiveSuccesses = 0',
    '\tcb.currentTimeoutMs = cb.timeoutMs; cb.openedAt = 0',
    '}',
    '',
    'func (cb *CmpsblCircuitBreaker) IsClosed() bool { return cb.state == CmpsblClosed }',
    '',
    '// Breaker Panel',
    'var cmpsblBreakerPanel = map[string]*CmpsblCircuitBreaker{}',
    '',
    'func CmpsblGetBreaker(name string) *CmpsblCircuitBreaker {',
    '\tif b, ok := cmpsblBreakerPanel[name]; ok { return b }',
    '\tb := NewCmpsblCircuitBreaker(name)',
    '\tcmpsblBreakerPanel[name] = b',
    '\treturn b',
    '}',
    '',
    'func CmpsblHealthyCapabilities() []string {',
    '\tvar out []string',
    '\tfor k, v := range cmpsblBreakerPanel { if v.IsClosed() { out = append(out, k) } }',
    '\treturn out',
    '}',
    '',
    'func CmpsblResetBreakers() {',
    '\tfor _, v := range cmpsblBreakerPanel { v.Reset() }',
    '}',
  ];
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Java
// ═══════════════════════════════════════════════════════════════════════════════

function circuitBreakerJava(): string {
  const lines = [
    '// CMPSBL Layer — Circuit Breaker (Crown Jewel #11)',
    '// Three-state FSM: closed -> open -> half-open with exponential backoff.',
    '',
    'enum CmpsblCircuitState { CLOSED, OPEN, HALF_OPEN }',
    '',
    'class CmpsblCircuitBreaker {',
    '    final String name;',
    '    private CmpsblCircuitState state = CmpsblCircuitState.CLOSED;',
    '    private int failures = 0, successes = 0, consecutiveSuccesses = 0, totalCalls = 0;',
    '    private final int failureThreshold = 5, successThreshold = 2;',
    '    private long timeoutMs = 30_000, maxTimeoutMs = 300_000, currentTimeoutMs = 30_000;',
    '    private double backoffMultiplier = 2.0;',
    '    private long openedAt = 0;',
    '',
    '    CmpsblCircuitBreaker(String name) { this.name = name; }',
    '',
    '    private void transition(CmpsblCircuitState to) {',
    '        if (this.state == to) return;',
    '        this.state = to;',
    '        if (to == CmpsblCircuitState.OPEN) { this.openedAt = System.currentTimeMillis(); this.consecutiveSuccesses = 0; }',
    '        if (to == CmpsblCircuitState.CLOSED) { this.failures = 0; this.currentTimeoutMs = this.timeoutMs; }',
    '    }',
    '',
    '    boolean shouldAttempt() {',
    '        if (state == CmpsblCircuitState.CLOSED) return true;',
    '        if (state == CmpsblCircuitState.OPEN) {',
    '            if (System.currentTimeMillis() - openedAt >= currentTimeoutMs) { transition(CmpsblCircuitState.HALF_OPEN); return true; }',
    '            return false;',
    '        }',
    '        return true;',
    '    }',
    '',
    '    void recordSuccess() {',
    '        totalCalls++; successes++; consecutiveSuccesses++;',
    '        if (state == CmpsblCircuitState.HALF_OPEN && consecutiveSuccesses >= successThreshold)',
    '            transition(CmpsblCircuitState.CLOSED);',
    '    }',
    '',
    '    void recordFailure() {',
    '        totalCalls++; failures++; consecutiveSuccesses = 0;',
    '        if (state == CmpsblCircuitState.HALF_OPEN) {',
    '            currentTimeoutMs = (long) Math.min(currentTimeoutMs * backoffMultiplier, maxTimeoutMs);',
    '            transition(CmpsblCircuitState.OPEN);',
    '        } else if (state == CmpsblCircuitState.CLOSED && failures >= failureThreshold) {',
    '            transition(CmpsblCircuitState.OPEN);',
    '        }',
    '    }',
    '',
    '    void reset() { state = CmpsblCircuitState.CLOSED; failures = 0; successes = 0; consecutiveSuccesses = 0; currentTimeoutMs = timeoutMs; }',
    '    boolean isClosed() { return state == CmpsblCircuitState.CLOSED; }',
    '}',
    '',
    '// Breaker Panel',
    'class CmpsblBreakerPanel {',
    '    private static final java.util.Map<String, CmpsblCircuitBreaker> panel = new java.util.concurrent.ConcurrentHashMap<>();',
    '    static CmpsblCircuitBreaker getBreaker(String name) { return panel.computeIfAbsent(name, CmpsblCircuitBreaker::new); }',
    '    static java.util.List<String> healthyCapabilities() {',
    '        return panel.entrySet().stream().filter(e -> e.getValue().isClosed()).map(java.util.Map.Entry::getKey).collect(java.util.stream.Collectors.toList());',
    '    }',
    '    static void resetAll() { panel.values().forEach(CmpsblCircuitBreaker::reset); }',
    '}',
  ];
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// C#
// ═══════════════════════════════════════════════════════════════════════════════

function circuitBreakerCSharp(): string {
  const lines = [
    '// CMPSBL Layer — Circuit Breaker (Crown Jewel #11)',
    '',
    'public enum CmpsblCircuitState { Closed, Open, HalfOpen }',
    '',
    'public class CmpsblCircuitBreaker {',
    '    public string Name { get; }',
    '    public CmpsblCircuitState State { get; private set; } = CmpsblCircuitState.Closed;',
    '    private int failures, successes, consecutiveSuccesses, totalCalls;',
    '    private readonly int failureThreshold = 5, successThreshold = 2;',
    '    private long timeoutMs = 30_000, maxTimeoutMs = 300_000, currentTimeoutMs = 30_000;',
    '    private double backoffMultiplier = 2.0;',
    '    private long openedAt;',
    '',
    '    public CmpsblCircuitBreaker(string name) { Name = name; }',
    '',
    '    private long NowMs() { return DateTimeOffset.UtcNow.ToUnixTimeMilliseconds(); }',
    '',
    '    private void Transition(CmpsblCircuitState to) {',
    '        if (State == to) return; State = to;',
    '        if (to == CmpsblCircuitState.Open) { openedAt = NowMs(); consecutiveSuccesses = 0; }',
    '        if (to == CmpsblCircuitState.Closed) { failures = 0; currentTimeoutMs = timeoutMs; }',
    '    }',
    '',
    '    public bool ShouldAttempt() {',
    '        if (State == CmpsblCircuitState.Closed) return true;',
    '        if (State == CmpsblCircuitState.Open) {',
    '            if (NowMs() - openedAt >= currentTimeoutMs) { Transition(CmpsblCircuitState.HalfOpen); return true; }',
    '            return false;',
    '        }',
    '        return true;',
    '    }',
    '',
    '    public void RecordSuccess() {',
    '        totalCalls++; successes++; consecutiveSuccesses++;',
    '        if (State == CmpsblCircuitState.HalfOpen && consecutiveSuccesses >= successThreshold) Transition(CmpsblCircuitState.Closed);',
    '    }',
    '',
    '    public void RecordFailure() {',
    '        totalCalls++; failures++; consecutiveSuccesses = 0;',
    '        if (State == CmpsblCircuitState.HalfOpen) {',
    '            currentTimeoutMs = (long)Math.Min(currentTimeoutMs * backoffMultiplier, maxTimeoutMs);',
    '            Transition(CmpsblCircuitState.Open);',
    '        } else if (State == CmpsblCircuitState.Closed && failures >= failureThreshold) Transition(CmpsblCircuitState.Open);',
    '    }',
    '',
    '    public void Reset() { State = CmpsblCircuitState.Closed; failures = successes = consecutiveSuccesses = 0; currentTimeoutMs = timeoutMs; }',
    '    public bool IsClosed => State == CmpsblCircuitState.Closed;',
    '}',
    '',
    'public static class CmpsblBreakerPanel {',
    '    private static readonly Dictionary<string, CmpsblCircuitBreaker> _panel = new();',
    '    public static CmpsblCircuitBreaker GetBreaker(string name) {',
    '        if (!_panel.ContainsKey(name)) _panel[name] = new CmpsblCircuitBreaker(name);',
    '        return _panel[name];',
    '    }',
    '    public static List<string> HealthyCapabilities() => _panel.Where(kv => kv.Value.IsClosed).Select(kv => kv.Key).ToList();',
    '    public static void ResetAll() { foreach (var b in _panel.Values) b.Reset(); }',
    '}',
  ];
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Ruby
// ═══════════════════════════════════════════════════════════════════════════════

function circuitBreakerRuby(): string {
  const lines = [
    '# CMPSBL Layer — Circuit Breaker (Crown Jewel #11)',
    '',
    'class CmpsblCircuitBreaker',
    '  attr_reader :name, :state',
    '',
    '  def initialize(name)',
    '    @name = name; @state = :closed',
    '    @failures = 0; @consecutive_successes = 0; @total_calls = 0',
    '    @failure_threshold = 5; @success_threshold = 2',
    '    @timeout = 30.0; @max_timeout = 300.0; @backoff = 2.0',
    '    @current_timeout = @timeout; @opened_at = nil',
    '  end',
    '',
    '  def should_attempt?',
    '    return true if @state == :closed',
    '    if @state == :open',
    '      elapsed = Time.now.to_f - (@opened_at || 0)',
    '      if elapsed >= @current_timeout',
    '        transition(:half_open); return true',
    '      end',
    '      return false',
    '    end',
    '    true',
    '  end',
    '',
    '  def record_success',
    '    @total_calls += 1; @consecutive_successes += 1',
    '    transition(:closed) if @state == :half_open && @consecutive_successes >= @success_threshold',
    '  end',
    '',
    '  def record_failure',
    '    @total_calls += 1; @failures += 1; @consecutive_successes = 0',
    '    if @state == :half_open',
    '      @current_timeout = [@current_timeout * @backoff, @max_timeout].min',
    '      transition(:open)',
    '    elsif @state == :closed && @failures >= @failure_threshold',
    '      transition(:open)',
    '    end',
    '  end',
    '',
    '  def reset',
    '    @state = :closed; @failures = 0; @consecutive_successes = 0',
    '    @current_timeout = @timeout; @opened_at = nil',
    '  end',
    '',
    '  def closed?; @state == :closed; end',
    '',
    '  private',
    '',
    '  def transition(to)',
    '    return if @state == to; @state = to',
    '    if to == :open; @opened_at = Time.now.to_f; @consecutive_successes = 0; end',
    '    if to == :closed; @failures = 0; @current_timeout = @timeout; end',
    '  end',
    'end',
    '',
    '$cmpsbl_breaker_panel = {}',
    'def cmpsbl_get_breaker(name); $cmpsbl_breaker_panel[name] ||= CmpsblCircuitBreaker.new(name); end',
    'def cmpsbl_healthy_capabilities; $cmpsbl_breaker_panel.select { |_, b| b.closed? }.keys; end',
    'def cmpsbl_reset_breakers; $cmpsbl_breaker_panel.each_value(&:reset); end',
  ];
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Swift
// ═══════════════════════════════════════════════════════════════════════════════

function circuitBreakerSwift(): string {
  const lines = [
    '// CMPSBL Layer — Circuit Breaker (Crown Jewel #11)',
    '',
    'enum CmpsblCircuitState { case closed, open, halfOpen }',
    '',
    'class CmpsblCircuitBreaker {',
    '    let name: String',
    '    private(set) var state: CmpsblCircuitState = .closed',
    '    private var failures = 0, consecutiveSuccesses = 0, totalCalls = 0',
    '    private let failureThreshold = 5, successThreshold = 2',
    '    private var timeoutS: Double = 30.0, maxTimeoutS: Double = 300.0',
    '    private var backoff: Double = 2.0, currentTimeoutS: Double = 30.0',
    '    private var openedAt: Double = 0',
    '',
    '    init(name: String) { self.name = name }',
    '',
    '    private func nowS() -> Double { Date().timeIntervalSince1970 }',
    '',
    '    private func transition(_ to: CmpsblCircuitState) {',
    '        guard state != to else { return }; state = to',
    '        if to == .open { openedAt = nowS(); consecutiveSuccesses = 0 }',
    '        if to == .closed { failures = 0; currentTimeoutS = timeoutS }',
    '    }',
    '',
    '    func shouldAttempt() -> Bool {',
    '        switch state {',
    '        case .closed: return true',
    '        case .open: if nowS() - openedAt >= currentTimeoutS { transition(.halfOpen); return true }; return false',
    '        case .halfOpen: return true',
    '        }',
    '    }',
    '',
    '    func recordSuccess() {',
    '        totalCalls += 1; consecutiveSuccesses += 1',
    '        if state == .halfOpen && consecutiveSuccesses >= successThreshold { transition(.closed) }',
    '    }',
    '',
    '    func recordFailure() {',
    '        totalCalls += 1; failures += 1; consecutiveSuccesses = 0',
    '        if state == .halfOpen { currentTimeoutS = min(currentTimeoutS * backoff, maxTimeoutS); transition(.open) }',
    '        else if state == .closed && failures >= failureThreshold { transition(.open) }',
    '    }',
    '',
    '    func reset() { state = .closed; failures = 0; consecutiveSuccesses = 0; currentTimeoutS = timeoutS }',
    '    var isClosed: Bool { state == .closed }',
    '}',
    '',
    'var cmpsblBreakerPanel: [String: CmpsblCircuitBreaker] = [:]',
    'func cmpsblGetBreaker(_ name: String) -> CmpsblCircuitBreaker {',
    '    if let b = cmpsblBreakerPanel[name] { return b }',
    '    let b = CmpsblCircuitBreaker(name: name); cmpsblBreakerPanel[name] = b; return b',
    '}',
    'func cmpsblHealthyCapabilities() -> [String] { cmpsblBreakerPanel.filter { $0.value.isClosed }.map { $0.key } }',
    'func cmpsblResetBreakers() { cmpsblBreakerPanel.values.forEach { $0.reset() } }',
  ];
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Kotlin
// ═══════════════════════════════════════════════════════════════════════════════

function circuitBreakerKotlin(): string {
  const lines = [
    '// CMPSBL Layer — Circuit Breaker (Crown Jewel #11)',
    '',
    'enum class CmpsblCircuitState { CLOSED, OPEN, HALF_OPEN }',
    '',
    'class CmpsblCircuitBreaker(val name: String) {',
    '    var state = CmpsblCircuitState.CLOSED; private set',
    '    private var failures = 0; private var consecutiveSuccesses = 0; private var totalCalls = 0',
    '    private val failureThreshold = 5; private val successThreshold = 2',
    '    private var timeoutMs = 30_000L; private var maxTimeoutMs = 300_000L',
    '    private var backoff = 2.0; private var currentTimeoutMs = 30_000L; private var openedAt = 0L',
    '',
    '    private fun transition(to: CmpsblCircuitState) {',
    '        if (state == to) return; state = to',
    '        if (to == CmpsblCircuitState.OPEN) { openedAt = System.currentTimeMillis(); consecutiveSuccesses = 0 }',
    '        if (to == CmpsblCircuitState.CLOSED) { failures = 0; currentTimeoutMs = timeoutMs }',
    '    }',
    '',
    '    fun shouldAttempt(): Boolean = when (state) {',
    '        CmpsblCircuitState.CLOSED -> true',
    '        CmpsblCircuitState.OPEN -> if (System.currentTimeMillis() - openedAt >= currentTimeoutMs) { transition(CmpsblCircuitState.HALF_OPEN); true } else false',
    '        CmpsblCircuitState.HALF_OPEN -> true',
    '    }',
    '',
    '    fun recordSuccess() {',
    '        totalCalls++; consecutiveSuccesses++',
    '        if (state == CmpsblCircuitState.HALF_OPEN && consecutiveSuccesses >= successThreshold) transition(CmpsblCircuitState.CLOSED)',
    '    }',
    '',
    '    fun recordFailure() {',
    '        totalCalls++; failures++; consecutiveSuccesses = 0',
    '        if (state == CmpsblCircuitState.HALF_OPEN) {',
    '            currentTimeoutMs = minOf((currentTimeoutMs * backoff).toLong(), maxTimeoutMs)',
    '            transition(CmpsblCircuitState.OPEN)',
    '        } else if (state == CmpsblCircuitState.CLOSED && failures >= failureThreshold) transition(CmpsblCircuitState.OPEN)',
    '    }',
    '',
    '    fun reset() { state = CmpsblCircuitState.CLOSED; failures = 0; consecutiveSuccesses = 0; currentTimeoutMs = timeoutMs }',
    '    val isClosed get() = state == CmpsblCircuitState.CLOSED',
    '}',
    '',
    'object CmpsblBreakerPanel {',
    '    private val panel = mutableMapOf<String, CmpsblCircuitBreaker>()',
    '    fun getBreaker(name: String) = panel.getOrPut(name) { CmpsblCircuitBreaker(name) }',
    '    fun healthyCapabilities() = panel.filter { it.value.isClosed }.keys.toList()',
    '    fun resetAll() = panel.values.forEach { it.reset() }',
    '}',
  ];
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Generic fallback — comment-based spec for remaining languages
// ═══════════════════════════════════════════════════════════════════════════════

function circuitBreakerGeneric(lang: string, lc: string): string {
  const lines = [
    lc + ' CMPSBL Layer — Circuit Breaker (Crown Jewel #11)',
    lc + ' Three-state FSM: closed -> open -> half-open with exponential backoff.',
    lc + ' Language: ' + lang,
    lc,
    lc + ' Circuit Breaker State Machine:',
    lc + '   CLOSED  — Normal operation. Failures increment counter.',
    lc + '             When failures >= 5, transitions to OPEN.',
    lc + '   OPEN    — All calls rejected. After timeout (30s), transitions to HALF_OPEN.',
    lc + '             Timeout doubles on each re-open (exponential backoff, max 300s).',
    lc + '   HALF_OPEN — Probe calls allowed. 2 consecutive successes -> CLOSED.',
    lc + '               Any failure -> OPEN (with increased timeout).',
    lc,
    lc + ' API Surface:',
    lc + '   cmpsbl_get_breaker(name)         — Get/create breaker for capability',
    lc + '   breaker.should_attempt()         — True if call is allowed',
    lc + '   breaker.record_success()         — Notify success',
    lc + '   breaker.record_failure()         — Notify failure',
    lc + '   breaker.reset()                  — Reset to CLOSED',
    lc + '   cmpsbl_healthy_capabilities()    — List closed-circuit capabilities',
    lc + '   cmpsbl_reset_breakers()          — Reset all breakers',
    lc,
    lc + ' Auto-wired: cmpsbl_execute() automatically uses circuit breakers',
    lc + ' for all capability invocations. No manual wiring required.',
    lc,
    lc + ' See TypeScript or Python source for canonical implementation.',
  ];
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════════════════════════════════════════

/** Native generators keyed by language */
const NATIVE_GENERATORS: Record<string, () => string> = {
  rust: circuitBreakerRust,
  go: circuitBreakerGo,
  java: circuitBreakerJava,
  csharp: circuitBreakerCSharp,
  ruby: circuitBreakerRuby,
  swift: circuitBreakerSwift,
  kotlin: circuitBreakerKotlin,
};

/**
 * Generate circuit breaker code for any language.
 * Returns native code for major languages, comment-based spec for others.
 */
export function generateCircuitBreakerForLang(lang: string): string | null {
  // TS/JS and Python are handled by the hand-written templates in cmpsbl-layers.ts
  if (lang === 'typescript' || lang === 'javascript' || lang === 'python') return null;

  // HDL — brief bridge notice
  if (HDL_LANGS.has(lang)) {
    const lc = LANG_COMMENT[lang] || '//';
    return [
      lc + ' CMPSBL Layer — Circuit Breaker (Crown Jewel #11)',
      lc + ' HDL NOTE: Circuit breaker is a software-domain pattern.',
      lc + ' For hardware targets, this layer provides a watchdog/timeout FSM',
      lc + ' equivalent in the host testbench or cocotb wrapper.',
    ].join('\n');
  }

  // Native generators
  const gen = NATIVE_GENERATORS[lang];
  if (gen) return gen();

  // Generic fallback
  const lc = LANG_COMMENT[lang] || '//';
  return circuitBreakerGeneric(lang, lc);
}

/**
 * Get all layer code for a language, concatenated.
 */
export function getAllLayerCode(layers: CmpsblLayerDefinition[], lang: string): string {
  const parts: string[] = [];
  for (const layer of layers) {
    if (layer.id === 'circuit-breaker') {
      // TS/PY use their own hand-written templates
      if (lang === 'typescript' || lang === 'javascript') {
        parts.push(layer.tsCode);
      } else if (lang === 'python') {
        parts.push(layer.pyCode);
      } else {
        const code = generateCircuitBreakerForLang(lang);
        if (code) parts.push(code);
      }
    }
  }
  return parts.join('\n');
}

/**
 * Get auto-wire commentary/code for any language.
 */
export function getAutoWireForLang(layers: CmpsblLayerDefinition[], lang: string): string {
  if (layers.length === 0) return '';
  const hasCircuitBreaker = layers.some(l => l.id === 'circuit-breaker');
  if (!hasCircuitBreaker) return '';

  // TS and PY have executable auto-wire — imported from cmpsbl-layers.ts
  if (lang === 'typescript' || lang === 'javascript' || lang === 'python') return '';

  // HDL — no auto-wire
  if (HDL_LANGS.has(lang)) return '';

  const lc = LANG_COMMENT[lang] || '//';
  return [
    '',
    lc + ' Layer Auto-Wire',
    lc + ' Selected layers are automatically applied to all capability executions.',
    lc + ' Your code (Layer 1) is never modified — layers operate in Layer 2 only.',
    lc + ' The cmpsbl_execute function is wrapped to check the circuit breaker',
    lc + ' for each capability before dispatching.',
  ].join('\n');
}

/** Get the comment character for a language */
export function getLayerCommentChar(lang: string): string {
  return LANG_COMMENT[lang] || '//';
}
