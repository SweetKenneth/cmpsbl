/**
 * V2 Pre-Flight Estimator — Sprint 1 (Ascension V2 Phase 1: Trust & Visibility)
 *
 * Pure client-side heuristic that previews the *projected* shape of an
 * Ascension run BEFORE the user clicks "Analyze Code".
 *
 * 🔒 Read-only, display-only. Touches NO engine code, NO DB, NO Lex, NO Mana.
 *    Every number rendered is clearly labelled "estimate".
 *
 * Inputs:  selected File[] OR pasted text
 * Outputs: projected primitive-coverage band, polyglot count, CJPI band
 */

import { useMemo } from "react";
import { Gauge, Layers, Globe2, Sparkles } from "lucide-react";
import { getSupportedLanguages } from "@/lib/export/v2-supported-languages";

// Live count of every language the V2 export pipeline can emit (canonical + beta).
const SHIPPED_LANGS = getSupportedLanguages().length;

// Extension → display label map. Restricted to the V2 supported set so the
// preflight estimator can never claim a language the pipeline won't actually emit.
const LANG_BY_EXT: Record<string, string> = {
  ts: "TypeScript", tsx: "TypeScript", js: "JavaScript", jsx: "JavaScript",
  py: "Python", rs: "Rust", go: "Go", sol: "Solidity",
  vhd: "VHDL", vhdl: "VHDL", v: "Verilog", sv: "SystemVerilog",
  glsl: "GLSL", wgsl: "WGSL", c: "C", h: "C", cpp: "C++", hpp: "C++",
  java: "Java", kt: "Kotlin", swift: "Swift", rb: "Ruby", php: "PHP",
  cs: "C#", scala: "Scala", ex: "Elixir",
  hs: "Haskell", lua: "Lua", r: "R", dart: "Dart",
  zig: "Zig",
};

interface Estimate {
  fileCount: number;
  totalKb: number;
  detectedLangs: string[];
  primitiveBandLow: number;   // estimated organs+layers+engines+agents fired (of 40)
  primitiveBandHigh: number;
  cjpiBand: string;           // qualitative band, never a fake number
  polyglotCount: number;      // live count from the V2 registry
  confidence: "low" | "medium" | "high";
}

function ext(name: string): string {
  const i = name.lastIndexOf(".");
  return i >= 0 ? name.slice(i + 1).toLowerCase() : "";
}

function computeFromFiles(files: File[]): Estimate | null {
  if (files.length === 0) return null;
  const totalBytes = files.reduce((s, f) => s + f.size, 0);
  const totalKb = Math.max(1, Math.round(totalBytes / 1024));
  const langSet = new Set<string>();
  for (const f of files) {
    const lang = LANG_BY_EXT[ext(f.name)];
    if (lang) langSet.add(lang);
  }
  return buildEstimate(files.length, totalKb, [...langSet]);
}

function computeFromPaste(code: string): Estimate | null {
  const trimmed = code.trim();
  if (trimmed.length < 20) return null;
  const totalKb = Math.max(1, Math.round(trimmed.length / 1024));
  // weak heuristic — we don't know the language, leave detected empty
  return buildEstimate(1, totalKb, []);
}

function buildEstimate(fileCount: number, totalKb: number, detectedLangs: string[]): Estimate {
  // Heuristic primitive-coverage bands. NEVER claims to be a real result —
  // the actual collision happens in the engine, this just sets expectations.
  // Bands are conservative and labelled "estimate" everywhere they're shown.
  let low = 6, high = 12;
  if (totalKb >= 10) { low = 10; high = 18; }
  if (totalKb >= 50) { low = 14; high = 24; }
  if (totalKb >= 200) { low = 18; high = 30; }
  if (fileCount >= 5) { low += 2; high += 2; }
  if (fileCount >= 20) { low += 2; high += 4; }
  high = Math.min(high, 40);
  low = Math.min(low, high);

  // CJPI band — qualitative only. Never invent a numeric score.
  let cjpiBand = "Standard";
  if (totalKb >= 50 && fileCount >= 3) cjpiBand = "Strong";
  if (totalKb >= 200 || fileCount >= 10) cjpiBand = "High";
  if (totalKb < 5 && fileCount === 1) cjpiBand = "Light";

  // Confidence in the estimate itself
  let confidence: Estimate["confidence"] = "medium";
  if (fileCount >= 5 && detectedLangs.length > 0) confidence = "high";
  if (detectedLangs.length === 0 && fileCount <= 1) confidence = "low";

  return {
    fileCount,
    totalKb,
    detectedLangs,
    primitiveBandLow: low,
    primitiveBandHigh: high,
    cjpiBand,
    polyglotCount: SHIPPED_LANGS,
    confidence,
  };
}

interface Props {
  files: File[];
  pastedCode: string;
  mode: "upload" | "paste";
}

export function V2PreflightEstimator({ files, pastedCode, mode }: Props) {
  const est = useMemo<Estimate | null>(() => {
    return mode === "upload" ? computeFromFiles(files) : computeFromPaste(pastedCode);
  }, [files, pastedCode, mode]);

  if (!est) return null;

  const confTone =
    est.confidence === "high" ? "text-emerald-600" :
    est.confidence === "low" ? "text-muted-foreground" : "text-amber-600";

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3 sm:p-4 space-y-3 animate-in fade-in">
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
            Pre-Flight Estimate
          </span>
        </div>
        <span className={`text-[10px] uppercase tracking-wider font-medium ${confTone}`}>
          {est.confidence} confidence
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <Tile
          icon={<Gauge className="h-3.5 w-3.5" />}
          label="Primitives"
          value={`${est.primitiveBandLow}–${est.primitiveBandHigh}`}
          sub="of 40"
        />
        <Tile
          icon={<Layers className="h-3.5 w-3.5" />}
          label="CJPI Band"
          value={est.cjpiBand}
          sub="projected"
        />
        <Tile
          icon={<Globe2 className="h-3.5 w-3.5" />}
          label="Polyglot"
          value={`${est.polyglotCount}`}
          sub="languages"
        />
      </div>

      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-muted-foreground">
        <span>{est.fileCount} file{est.fileCount === 1 ? "" : "s"} · {est.totalKb} KB</span>
        {est.detectedLangs.length > 0 && (
          <>
            <span>·</span>
            <span className="truncate">
              {est.detectedLangs.slice(0, 4).join(", ")}
              {est.detectedLangs.length > 4 ? ` +${est.detectedLangs.length - 4}` : ""}
            </span>
          </>
        )}
      </div>

      <p className="text-[10px] text-muted-foreground/80 leading-relaxed">
        Estimate only — derived from file shape before the collision engine runs.
        The actual primitive set, CJPI score, and audit chain are computed by Ascension.
      </p>
    </div>
  );
}

function Tile({
  icon, label, value, sub,
}: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-lg bg-background/60 border border-border/40 px-2.5 py-2">
      <div className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-foreground tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}
