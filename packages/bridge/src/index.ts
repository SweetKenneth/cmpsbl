/**
 * @cmpsbl/bridge — Bridge Adapter Framework
 * Wire any language runtime to the CMPSBL® substrate delegation protocol.
 * Includes first-contact Memory Stream integration.
 *
 * © CMPSBL® — All rights reserved.
 */

import type { RuntimeMode, BridgeType, ChainManifest, ChainResult, PrimitiveResult, ExecutionOptions, FirstContactConfig } from '@cmpsbl/types';

export type { RuntimeMode, BridgeType };

// ═══════════════════════════════════════════════════════════════
// Bridge Contract
// ═══════════════════════════════════════════════════════════════

export interface BridgeConfig {
  language: string;
  endpoint?: string | null;
  mode?: RuntimeMode;
  timeoutMs?: number;
}

export interface BridgeAdapter {
  readonly language: string;
  readonly mode: RuntimeMode;
  executeChain(manifest: ChainManifest, input: Record<string, unknown>, options?: ExecutionOptions): Promise<ChainResult>;
  executePrimitive(name: string, data: Record<string, unknown>, confidence: number): Promise<PrimitiveResult>;
  setMode(mode: RuntimeMode): void;
  setEndpoint(url: string | null): void;
  ping(): Promise<boolean>;
}

// ═══════════════════════════════════════════════════════════════
// Bridge Factory
// ═══════════════════════════════════════════════════════════════

export function createBridge(config: BridgeConfig): BridgeAdapter {
  let currentMode: RuntimeMode = config.mode ?? (config.endpoint ? 'hybrid' : 'offline');
  let endpoint: string | null = config.endpoint ?? null;
  const timeoutMs = config.timeoutMs ?? 30000;

  async function remoteExecute(path: string, body: unknown): Promise<unknown> {
    if (!endpoint) throw new Error('No endpoint configured');
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(`${endpoint}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`Remote ${res.status}`);
      return res.json();
    } finally {
      clearTimeout(timer);
    }
  }

  function localFallbackPrimitive(name: string, data: Record<string, unknown>, confidence: number): PrimitiveResult {
    return {
      success: true,
      output: { echo: data, primitive: name, bridge: config.language, fallback: true },
      confidence: confidence * 0.7,
      durationMs: 0,
      handler: `${config.language}-local-fallback`,
    };
  }

  return {
    language: config.language,
    get mode() { return currentMode; },

    async executeChain(manifest, input, options) {
      if (currentMode === 'network' || currentMode === 'hybrid') {
        try {
          return await remoteExecute('/chain', { manifest, input, options }) as ChainResult;
        } catch {
          if (currentMode === 'network') throw new Error('Network mode failed and no fallback');
        }
      }
      const start = Date.now();
      let current = input;
      let completed = 0;
      for (const mod of manifest.modules) {
        const r = localFallbackPrimitive(mod, current, manifest.cjpiScore / 100);
        if (r.success) {
          current = typeof r.output === 'object' && r.output !== null ? r.output as Record<string, unknown> : { value: r.output };
          completed++;
        } else if (!options?.continueOnFailure) break;
      }
      return {
        success: completed === manifest.modules.length,
        output: current,
        confidence: manifest.cjpiScore / 100,
        totalDurationMs: Date.now() - start,
        stagesCompleted: completed,
        totalStages: manifest.modules.length,
        runtimeMode: 'offline' as RuntimeMode,
        bridgeType: 'offline-fallback' as BridgeType,
      };
    },

    async executePrimitive(name, data, confidence) {
      if (currentMode === 'network' || currentMode === 'hybrid') {
        try {
          return await remoteExecute('/primitive', { name, data, confidence }) as PrimitiveResult;
        } catch {
          if (currentMode === 'network') throw new Error('Network mode failed');
        }
      }
      return localFallbackPrimitive(name, data, confidence);
    },

    setMode(mode) { currentMode = mode; },
    setEndpoint(url) { endpoint = url; currentMode = url ? 'hybrid' : 'offline'; },

    async ping() {
      if (!endpoint) return false;
      try {
        const res = await fetch(`${endpoint}/health`, { signal: AbortSignal.timeout(5000) });
        return res.ok;
      } catch { return false; }
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// Supported Languages
// ═══════════════════════════════════════════════════════════════

export const SUPPORTED_LANGUAGES = [
  'typescript', 'javascript', 'python', 'go', 'rust', 'java', 'csharp',
  'ruby', 'php', 'swift', 'kotlin', 'scala', 'dart', 'elixir',
  'cpp', 'c', 'zig', 'lua', 'r', 'julia', 'haskell', 'ocaml',
  'verilog', 'vhdl',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

// ═══════════════════════════════════════════════════════════════
// First Contact — Bridge Domain
// ═══════════════════════════════════════════════════════════════

export function createBridgeFirstContact(apiKey?: string): FirstContactConfig {
  return {
    package: '@cmpsbl/bridge',
    domain: 'bridge',
    apiKey,
    endpoint: 'https://bxodolqqczjuahwdrswy.supabase.co/functions/v1/substrate-api',
    autoDiscover: true,
  };
}
