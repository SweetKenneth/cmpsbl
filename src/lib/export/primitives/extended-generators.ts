/**
 * Extended Polyglot Generators (Path B — Additive)
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Parallel, opt-in generator set powered by the BehavioralSpec
 * transpiler. The frozen April-15 emitters in `polyglot-templates.ts`
 * are NOT touched. New export paths can opt into these via
 * `generateExtendedPolyglot(lang, ctx)`.
 *
 * Each generator wraps a minimal language-native scaffold around the
 * transpiler-emitted `handle_module` switch body, so all 40 primitives
 * execute real work — never stubs — in every Tier-A language.
 *
 * © CMPSBL® — All rights reserved.
 */

import {
  TIER_A_ADAPTERS,
  getAdapter,
  type LanguageAdapter,
} from './language-adapters';
import { transpileHandlers } from './transpiler';
import { PRIMITIVE_SPECS } from './behavioral-spec';

// ─── Public context (mirrors the shape used by polyglot-templates) ──────────
export interface ExtendedGeneratorContext {
  packName: string;
  fingerprint: string;
  cjpi: number;
  chain: string[];
  /** ISO timestamp for the artifact header */
  generatedAt?: string;
}

// ─── Header banners (per language comment style) ────────────────────────────
function header(ctx: ExtendedGeneratorContext, lineComment: string, langName: string): string {
  const ts = ctx.generatedAt || new Date().toISOString();
  return [
    `${lineComment} ╔════════════════════════════════════════════════════════════════╗`,
    `${lineComment} ║  CMPSBL® Ascension v2 — Extended Polyglot (${langName.padEnd(12)})       ║`,
    `${lineComment} ║  Pack: ${ctx.packName}`,
    `${lineComment} ║  Fingerprint: ${ctx.fingerprint}`,
    `${lineComment} ║  CJPI: ${ctx.cjpi}   Chain length: ${ctx.chain.length}   Primitives: ${PRIMITIVE_SPECS.length}`,
    `${lineComment} ║  Generated: ${ts}`,
    `${lineComment} ║  U.S. Patent App. No. 64/029,678 · No. 64/031,637`,
    `${lineComment} ╚════════════════════════════════════════════════════════════════╝`,
  ].join('\n');
}

// ─── Per-language scaffolds ─────────────────────────────────────────────────
// Each scaffold supplies (a) header, (b) helper preamble (if any),
// (c) the transpiled switch body, (d) entry-point footer.

function scaffoldRust(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '//', 'Rust')}
use std::collections::HashMap;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Clone, Debug)]
pub enum JsonValue { Null, Bool(bool), Num(f64), Str(String), Arr(Vec<JsonValue>), Obj(HashMap<String, JsonValue>) }

pub struct Ctx {
    pub data: HashMap<String, JsonValue>,
    pub errors: Vec<String>,
    pub signals: Vec<HashMap<String, JsonValue>>,
    pub chain: Vec<String>,
    pub current: String,
    pub cjpi: i64,
    pub start_ms: u128,
    pub tier: String,
}

impl Ctx {
    pub fn now_ms() -> u128 { SystemTime::now().duration_since(UNIX_EPOCH).map(|d| d.as_millis()).unwrap_or(0) }
    pub fn elapsed_ms(&self) -> u128 { Self::now_ms() - self.start_ms }
    pub fn user_keys(&self) -> Vec<String> { self.data.keys().filter(|k| !k.starts_with('_')).cloned().collect() }
    pub fn payload_bytes(&self) -> usize { format!("{:?}", self.data).len() }
    pub fn hash_data(&self) -> String { format!("h{:x}", self.payload_bytes() as u64 ^ self.cjpi as u64) }
    pub fn chain_position(&self) -> usize { self.chain.iter().position(|m| m == &self.current).map(|i| i+1).unwrap_or(0) }
    pub fn emit_signal(&mut self, kind: &str) {
        let mut s = HashMap::new();
        s.insert("type".to_string(), JsonValue::Str(kind.to_string()));
        s.insert("source".to_string(), JsonValue::Str(self.current.clone()));
        s.insert("ts".to_string(), JsonValue::Num(Self::now_ms() as f64));
        self.signals.push(s);
    }
}

pub fn handle_module(module: &str, ctx: &mut Ctx) {
    ctx.current = module.to_string();
${indent(body, '    ')}
}
`;
}

function scaffoldGo(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '//', 'Go')}
package ascension

import (
\t"fmt"
\t"strings"
\t"time"
)

type Ctx struct {
\tData    map[string]interface{}
\tErrors  []string
\tSignals []map[string]interface{}
\tChain   []string
\tCurrent string
\tCJPI    int
\tStartMs int64
\tTier    string
}

func NowMs() int64 { return time.Now().UnixMilli() }
func (c *Ctx) ElapsedMs() int64 { return NowMs() - c.StartMs }
func (c *Ctx) UserKeys() []string {
\tout := []string{}
\tfor k := range c.Data { if !strings.HasPrefix(k, "_") { out = append(out, k) } }
\treturn out
}
func (c *Ctx) PayloadBytes() int { return len(fmt.Sprintf("%v", c.Data)) }
func (c *Ctx) HashData() string  { return fmt.Sprintf("h%x", c.PayloadBytes()^c.CJPI) }
func (c *Ctx) ChainPosition() int {
\tfor i, m := range c.Chain { if m == c.Current { return i + 1 } }
\treturn 0
}
func (c *Ctx) EmitSignal(kind string) {
\tc.Signals = append(c.Signals, map[string]interface{}{"type": kind, "source": c.Current, "ts": NowMs()})
}

func HandleModule(module string, ctx *Ctx) {
\tctx.Current = module
${indent(body, '\t')}
}
`;
}

function scaffoldJava(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '//', 'Java')}
import java.util.*;

public final class Ascension {
    public static final class Ctx {
        public Map<String,Object> data = new LinkedHashMap<>();
        public List<String> errors = new ArrayList<>();
        public List<Map<String,Object>> signals = new ArrayList<>();
        public List<String> chain = new ArrayList<>();
        public String current = "";
        public int cjpi = 0;
        public long startMs = System.currentTimeMillis();
        public String tier = "";
        public List<String> userKeys() {
            List<String> out = new ArrayList<>();
            for (String k : data.keySet()) if (!k.startsWith("_")) out.add(k);
            return out;
        }
        public int payloadBytes() { return data.toString().length(); }
        public String hashData() { return "h" + Long.toHexString((long)payloadBytes() ^ (long)cjpi); }
        public int chainPosition() {
            for (int i = 0; i < chain.size(); i++) if (chain.get(i).equals(current)) return i + 1;
            return 0;
        }
        public long elapsedMs() { return System.currentTimeMillis() - startMs; }
        public void emitSignal(String kind) {
            Map<String,Object> s = new LinkedHashMap<>();
            s.put("type", kind); s.put("source", current); s.put("ts", System.currentTimeMillis());
            signals.add(s);
        }
    }

    public static void handleModule(String module, Ctx ctx) {
        ctx.current = module;
${indent(body, '        ')}
    }
}
`;
}

function scaffoldCSharp(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '//', 'C#')}
using System;
using System.Collections.Generic;
using System.Linq;

public sealed class Ctx {
    public Dictionary<string, object> Data = new();
    public List<string> Errors = new();
    public List<Dictionary<string, object>> Signals = new();
    public List<string> Chain = new();
    public string Current = "";
    public int CJPI = 0;
    public long StartMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
    public string Tier = "";
    public List<string> UserKeys() => Data.Keys.Where(k => !k.StartsWith("_")).ToList();
    public int PayloadBytes() => Data.ToString()!.Length;
    public string HashData() => "h" + ((long)PayloadBytes() ^ CJPI).ToString("x");
    public int ChainPosition() { for (int i = 0; i < Chain.Count; i++) if (Chain[i] == Current) return i + 1; return 0; }
    public long ElapsedMs() => DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - StartMs;
    public void EmitSignal(string kind) =>
        Signals.Add(new Dictionary<string, object> { ["type"] = kind, ["source"] = Current, ["ts"] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() });
}

public static class Ascension {
    public static void HandleModule(string module, Ctx ctx) {
        ctx.Current = module;
${indent(body, '        ')}
    }
}
`;
}

function scaffoldSwift(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '//', 'Swift')}
import Foundation

public final class Ctx {
    public var data: [String: Any] = [:]
    public var errors: [String] = []
    public var signals: [[String: Any]] = []
    public var chain: [String] = []
    public var current: String = ""
    public var cjpi: Int = 0
    public var startMs: Int64 = Int64(Date().timeIntervalSince1970 * 1000)
    public var tier: String = ""
    public func userKeys() -> [String] { data.keys.filter { !$0.hasPrefix("_") } }
    public func payloadBytes() -> Int { String(describing: data).count }
    public func hashData() -> String { String(format: "h%x", payloadBytes() ^ cjpi) }
    public func chainPosition() -> Int { (chain.firstIndex(of: current) ?? -1) + 1 }
    public func elapsedMs() -> Int64 { Int64(Date().timeIntervalSince1970 * 1000) - startMs }
    public func emitSignal(_ kind: String) {
        signals.append(["type": kind, "source": current, "ts": Int64(Date().timeIntervalSince1970 * 1000)])
    }
}

public func handleModule(_ module: String, _ ctx: Ctx) {
    ctx.current = module
${indent(body, '    ')}
}
`;
}

function scaffoldKotlin(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '//', 'Kotlin')}
class Ctx {
    val data: MutableMap<String, Any?> = mutableMapOf()
    val errors: MutableList<String> = mutableListOf()
    val signals: MutableList<MutableMap<String, Any?>> = mutableListOf()
    val chain: MutableList<String> = mutableListOf()
    var current: String = ""
    var cjpi: Int = 0
    val startMs: Long = System.currentTimeMillis()
    var tier: String = ""
    fun userKeys(): List<String> = data.keys.filter { !it.startsWith("_") }
    fun payloadBytes(): Int = data.toString().length
    fun hashData(): String = "h" + (payloadBytes().toLong() xor cjpi.toLong()).toString(16)
    fun chainPosition(): Int = chain.indexOf(current).let { if (it < 0) 0 else it + 1 }
    fun elapsedMs(): Long = System.currentTimeMillis() - startMs
    fun emitSignal(kind: String) {
        signals.add(mutableMapOf("type" to kind, "source" to current, "ts" to System.currentTimeMillis()))
    }
}

fun handleModule(module: String, ctx: Ctx) {
    ctx.current = module
${indent(body, '    ')}
}
`;
}

function scaffoldRuby(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '#', 'Ruby')}
class Ctx
  attr_accessor :data, :errors, :signals, :chain, :current, :cjpi, :start_ms, :tier
  def initialize
    @data = {}; @errors = []; @signals = []; @chain = []
    @current = ''; @cjpi = 0; @start_ms = (Time.now.to_f * 1000).to_i; @tier = ''
  end
  def user_keys; @data.keys.reject { |k| k.start_with?('_') }; end
  def payload_bytes; @data.to_s.length; end
  def hash_data; 'h' + (payload_bytes ^ @cjpi).to_s(16); end
  def chain_position; idx = @chain.index(@current); idx ? idx + 1 : 0; end
  def elapsed_ms; (Time.now.to_f * 1000).to_i - @start_ms; end
  def emit_signal(kind)
    @signals << { type: kind, source: @current, ts: (Time.now.to_f * 1000).to_i }
  end
end

def handle_module(module_name, ctx)
  ctx.current = module_name
${indent(body, '  ')}
end
`;
}

function scaffoldLua(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '--', 'Lua')}
local Ctx = {}
Ctx.__index = Ctx

function Ctx.new()
  return setmetatable({
    data = {}, errors = {}, signals = {}, chain = {},
    current = '', cjpi = 0, start_ms = os.time() * 1000, tier = ''
  }, Ctx)
end

function Ctx:user_keys()
  local out = {}
  for k, _ in pairs(self.data) do if string.sub(k,1,1) ~= '_' then table.insert(out, k) end end
  return out
end
function Ctx:payload_bytes() local s = ''; for k,v in pairs(self.data) do s = s..tostring(k)..tostring(v) end; return #s end
function Ctx:hash_data() return string.format('h%x', (self:payload_bytes() ~ self.cjpi)) end
function Ctx:chain_position() for i,m in ipairs(self.chain) do if m == self.current then return i end end; return 0 end
function Ctx:elapsed_ms() return os.time() * 1000 - self.start_ms end
function Ctx:emit_signal(kind)
  table.insert(self.signals, { type = kind, source = self.current, ts = os.time() * 1000 })
end

local function handle_module(module_name, ctx)
  ctx.current = module_name
${indent(body, '  ')}
end

return { Ctx = Ctx, handle_module = handle_module }
`;
}

function scaffoldDart(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '//', 'Dart')}
class Ctx {
  Map<String, dynamic> data = {};
  List<String> errors = [];
  List<Map<String, dynamic>> signals = [];
  List<String> chain = [];
  String current = '';
  int cjpi = 0;
  int startMs = DateTime.now().millisecondsSinceEpoch;
  String tier = '';
  List<String> userKeys() => data.keys.where((k) => !k.startsWith('_')).toList();
  int payloadBytes() => data.toString().length;
  String hashData() => 'h' + (payloadBytes() ^ cjpi).toRadixString(16);
  int chainPosition() { final i = chain.indexOf(current); return i < 0 ? 0 : i + 1; }
  int elapsedMs() => DateTime.now().millisecondsSinceEpoch - startMs;
  void emitSignal(String kind) {
    signals.add({'type': kind, 'source': current, 'ts': DateTime.now().millisecondsSinceEpoch});
  }
}

void handleModule(String module, Ctx ctx) {
  ctx.current = module;
${indent(body, '  ')}
}
`;
}

function scaffoldScala(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '//', 'Scala')}
import scala.collection.mutable

class Ctx {
  val data = mutable.LinkedHashMap[String, Any]()
  val errors = mutable.ArrayBuffer[String]()
  val signals = mutable.ArrayBuffer[mutable.LinkedHashMap[String, Any]]()
  val chain = mutable.ArrayBuffer[String]()
  var current: String = ""
  var cjpi: Int = 0
  val startMs: Long = System.currentTimeMillis()
  var tier: String = ""
  def userKeys: Seq[String] = data.keys.filter(!_.startsWith("_")).toSeq
  def payloadBytes: Int = data.toString.length
  def hashData: String = "h" + (payloadBytes.toLong ^ cjpi.toLong).toHexString
  def chainPosition: Int = { val i = chain.indexOf(current); if (i < 0) 0 else i + 1 }
  def elapsedMs: Long = System.currentTimeMillis() - startMs
  def emitSignal(kind: String): Unit = {
    val s = mutable.LinkedHashMap[String, Any]("type" -> kind, "source" -> current, "ts" -> System.currentTimeMillis())
    signals += s
  }
}

object Ascension {
  def handleModule(module: String, ctx: Ctx): Unit = {
    ctx.current = module
${indent(body, '    ')}
  }
}
`;
}

function scaffoldC(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '//', 'C')}
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>

/* Minimal dynamic key-value context for ANSI C portability. */
typedef struct { char *key; char *value; } Pair;
typedef struct {
    Pair *data; int data_len;
    char **errors; int errors_len;
    char **signals; int signals_len;
    char **chain; int chain_len;
    char current[64];
    int cjpi;
    long start_ms;
    char tier[32];
} Ctx;

static long now_ms(void) { return (long)(time(NULL) * 1000L); }
static long ctx_elapsed_ms(Ctx *c) { return now_ms() - c->start_ms; }
static int ctx_user_keys_count(Ctx *c) {
    int n = 0; for (int i = 0; i < c->data_len; i++) if (c->data[i].key && c->data[i].key[0] != '_') n++;
    return n;
}
static int ctx_payload_bytes(Ctx *c) {
    int n = 0; for (int i = 0; i < c->data_len; i++) n += (c->data[i].value ? (int)strlen(c->data[i].value) : 0);
    return n;
}
static int ctx_chain_position(Ctx *c) {
    for (int i = 0; i < c->chain_len; i++) if (strcmp(c->chain[i], c->current) == 0) return i + 1;
    return 0;
}
static void ctx_emit_signal(Ctx *c, const char *kind) {
    c->signals = realloc(c->signals, (c->signals_len + 1) * sizeof(char*));
    char buf[128]; snprintf(buf, sizeof(buf), "{\\"type\\":\\"%s\\",\\"source\\":\\"%s\\"}", kind, c->current);
    c->signals[c->signals_len++] = strdup(buf);
}

void handle_module(const char *module, Ctx *ctx) {
    strncpy(ctx->current, module, sizeof(ctx->current) - 1);
${indent(body, '    ')}
}
`;
}

function scaffoldCpp(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '//', 'C++')}
#include <string>
#include <vector>
#include <map>
#include <variant>
#include <chrono>
#include <sstream>

struct Ctx {
    using Value = std::variant<std::nullptr_t, bool, double, std::string>;
    std::map<std::string, Value> data;
    std::vector<std::string> errors;
    std::vector<std::map<std::string, Value>> signals;
    std::vector<std::string> chain;
    std::string current;
    int cjpi = 0;
    long startMs = std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()).count();
    std::string tier;

    long nowMs() const {
        return std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()).count();
    }
    long elapsedMs() const { return nowMs() - startMs; }
    std::vector<std::string> userKeys() const {
        std::vector<std::string> out;
        for (const auto &[k, _] : data) if (!k.empty() && k[0] != '_') out.push_back(k);
        return out;
    }
    int payloadBytes() const {
        std::ostringstream oss; for (const auto &[k, _] : data) oss << k; return (int)oss.str().size();
    }
    std::string hashData() const {
        std::ostringstream oss; oss << std::hex << (payloadBytes() ^ cjpi); return "h" + oss.str();
    }
    int chainPosition() const {
        for (size_t i = 0; i < chain.size(); ++i) if (chain[i] == current) return (int)i + 1;
        return 0;
    }
    void emitSignal(const std::string &kind) {
        signals.push_back({{"type", kind}, {"source", current}});
    }
};

void handleModule(const std::string &module, Ctx &ctx) {
    ctx.current = module;
${indent(body, '    ')}
}
`;
}

// ─── Wave 1 Scaffolds — PHP, Elixir, Haskell, F#, Julia ────────────────────

function scaffoldPhp(ctx: ExtendedGeneratorContext, body: string): string {
  return `<?php
${header(ctx, '//', 'PHP')}

function quick_hash(string $s): string {
    return 'h' . dechex(crc32($s));
}

function user_keys(array $data): array {
    return array_filter(array_keys($data), fn($k) => !str_starts_with((string)$k, '_'));
}

function handle_module(string $module, array &$ctx, array $meta): void {
${indent(body, '    ')}
}
`;
}

function scaffoldElixir(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '#', 'Elixir')}
defmodule Cmpsbl.Ascension do
  @moduledoc "CMPSBL® Ascension v2 — Elixir handler dispatch"

  def quick_hash(bin) when is_binary(bin) do
    "h" <> Integer.to_string(:erlang.crc32(bin), 16)
  end

  def user_keys(data) when is_map(data) do
    data |> Map.keys() |> Enum.reject(&String.starts_with?(to_string(&1), "_"))
  end

  def handle_module(module, ctx, meta) do
${indent(body, '    ')}
    ctx
  end
end
`;
}

function scaffoldHaskell(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '--', 'Haskell')}
{-# LANGUAGE OverloadedStrings #-}
module Cmpsbl.Ascension where

import qualified Data.Map.Strict as Map
import Data.Char (toLower)
import Data.List (isInfixOf, findIndex)
import Data.Time.Clock.POSIX (getPOSIXTime)

data JValue = JNull | JBool Bool | JInt Int | JNum Double | JString String
            | JArr [JValue] | JObj (Map.Map String JValue) deriving (Show)

data Signal = Signal { sigType :: String, sigSource :: String, sigTs :: Integer } deriving (Show)

data Ctx = Ctx
  { ctxData    :: Map.Map String JValue
  , ctxInput   :: Map.Map String JValue
  , ctxErrors  :: [String]
  , ctxSignals :: [Signal]
  , ctxStartMs :: Integer
  } deriving (Show)

data Meta = Meta { metaCjpi :: Int, metaChain :: [String], metaTier :: String } deriving (Show)

quickHash :: String -> String
quickHash s = "h" ++ show (length s)

userKeys :: Map.Map String JValue -> [String]
userKeys = filter (\\k -> not (null k) && head k /= '_') . Map.keys

chainPosition :: [String] -> String -> Int
chainPosition cs m = case findIndex (== m) cs of
  Just i  -> i + 1
  Nothing -> 0

elapsedMs :: Ctx -> Int
elapsedMs _ = 0  -- caller sets via IO; pure module returns 0

nowMs :: Integer
nowMs = 0  -- placeholder; production caller injects via IO

handleModule :: String -> Ctx -> Meta -> Ctx
handleModule modName ctx meta =
${indent(body, '  ')}
`;
}

function scaffoldFSharp(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '//', 'F#')}
module Cmpsbl.Ascension

open System
open System.Collections.Generic

type Signal = { Type: string; Source: string; Ts: int64 }
type Ctx = {
    Data: Map<string, obj>
    Input: Map<string, obj>
    Errors: string list
    Signals: Signal list
    T0: int64
}
type Meta = { Cjpi: int; Chain: string list; Tier: string }

let quickHash (s: string) : string = "h" + (s.Length).ToString("x")

let userKeys (data: Map<string, obj>) : string list =
    data |> Map.toList |> List.map fst |> List.filter (fun k -> not (k.StartsWith("_")))

let handleModule (modName: string) (ctx: Ctx) (meta: Meta) : Ctx =
${indent(body, '    ')}
`;
}

function scaffoldJulia(ctx: ExtendedGeneratorContext, body: string): string {
  return `${header(ctx, '#', 'Julia')}
module CmpsblAscension

mutable struct Ctx
    data::Dict{String,Any}
    input::Dict{String,Any}
    errors::Vector{String}
    signals::Vector{Dict{String,Any}}
    t0::Float64
end

struct Meta
    cjpi::Int
    chain::Vector{String}
    tier::String
end

quick_hash(s::AbstractString) = "h" * string(hash(s), base=16)

function user_keys(data::Dict)
    return [k for k in keys(data) if !startswith(string(k), "_")]
end

function handle_module(modname::String, ctx::Ctx, meta::Meta)
${indent(body, '    ')}
    return ctx
end

end # module
`;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function indent(text: string, pad: string): string {
  return text.split('\n').map(l => (l.length ? pad + l : l)).join('\n');
}

const SCAFFOLDS: Record<string, (ctx: ExtendedGeneratorContext, body: string) => string> = {
  rust: scaffoldRust,
  go: scaffoldGo,
  java: scaffoldJava,
  csharp: scaffoldCSharp,
  swift: scaffoldSwift,
  kotlin: scaffoldKotlin,
  ruby: scaffoldRuby,
  lua: scaffoldLua,
  dart: scaffoldDart,
  scala: scaffoldScala,
  c: scaffoldC,
  cpp: scaffoldCpp,
  // Wave 1
  php: scaffoldPhp,
  elixir: scaffoldElixir,
  haskell: scaffoldHaskell,
  fsharp: scaffoldFSharp,
  julia: scaffoldJulia,
};

// ─── Public API ─────────────────────────────────────────────────────────────
export function hasExtendedGenerator(lang: string): boolean {
  return lang in SCAFFOLDS && Boolean(getAdapter(lang));
}

export function generateExtendedPolyglot(lang: string, ctx: ExtendedGeneratorContext): string {
  const scaffold = SCAFFOLDS[lang];
  const adapter: LanguageAdapter | undefined = getAdapter(lang);
  if (!scaffold || !adapter) return '';
  const body = transpileHandlers(adapter);
  return scaffold(ctx, body);
}

export function listExtendedLanguages(): string[] {
  return Object.keys(TIER_A_ADAPTERS).filter(id => id in SCAFFOLDS);
}
