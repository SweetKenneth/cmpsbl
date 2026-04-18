/**
 * CMPSBL® Spec-Driven Emitter Registry
 * Single source of truth: one ComponentSpec → 7 native language renderings.
 * Hybrid model: NATIVE_REGISTRY in cmpsbl-layer-polyglot still wins when present.
 * © CMPSBL® — All rights reserved.
 */
import type { ComponentSpec } from './spec';
import { emitRuby } from './emit-ruby';
import { emitGo } from './emit-go';
import { emitRust } from './emit-rust';
import { emitJava, emitKotlin } from './emit-jvm';
import { emitCSharp, emitSwift } from './emit-csharp-swift';
import { emitPython } from './emit-python';
import { emitPhp } from './emit-php';
import { emitLua } from './emit-lua';
import { emitPerl } from './emit-perl';
import { emitBash } from './emit-bash';
import { emitC } from './emit-c';
import { emitCpp } from './emit-cpp';
import { emitZig } from './emit-zig';
import { emitNim } from './emit-nim';
import { emitD } from './emit-d';

export type EmitterLang =
  | 'ruby' | 'go' | 'rust' | 'java' | 'kotlin' | 'csharp' | 'swift'
  | 'python' | 'php' | 'lua' | 'perl' | 'bash'
  | 'c' | 'cpp' | 'zig' | 'nim' | 'd';

const EMITTERS: Record<EmitterLang, (spec: ComponentSpec) => string> = {
  ruby: emitRuby,
  go: emitGo,
  rust: emitRust,
  java: emitJava,
  kotlin: emitKotlin,
  csharp: emitCSharp,
  swift: emitSwift,
  python: emitPython,
  php: emitPhp,
  lua: emitLua,
  perl: emitPerl,
  bash: emitBash,
  c: emitC,
  cpp: emitCpp,
  zig: emitZig,
  nim: emitNim,
  d: emitD,
};

export function emitComponent(spec: ComponentSpec, lang: EmitterLang): string {
  return EMITTERS[lang](spec);
}

export function isEmitterLang(lang: string): lang is EmitterLang {
  return lang in EMITTERS;
}

export type { ComponentSpec } from './spec';
