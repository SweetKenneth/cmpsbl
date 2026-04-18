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

export type EmitterLang = 'ruby' | 'go' | 'rust' | 'java' | 'kotlin' | 'csharp' | 'swift';

const EMITTERS: Record<EmitterLang, (spec: ComponentSpec) => string> = {
  ruby: emitRuby,
  go: emitGo,
  rust: emitRust,
  java: emitJava,
  kotlin: emitKotlin,
  csharp: emitCSharp,
  swift: emitSwift,
};

export function emitComponent(spec: ComponentSpec, lang: EmitterLang): string {
  return EMITTERS[lang](spec);
}

export function isEmitterLang(lang: string): lang is EmitterLang {
  return lang in EMITTERS;
}

export type { ComponentSpec } from './spec';
