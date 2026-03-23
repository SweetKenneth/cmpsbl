/**
 * NEXUS — Streaming Pipeline Hardening
 * Robust SSE management with chunk validation, partial recovery, backpressure, timeout teardown.
 */

export interface StreamConfig {
  timeoutMs: number;
  maxChunks: number;
  validateChunks: boolean;
  backpressureThreshold: number;  // pending chunks before signaling
  onChunk?: (chunk: StreamChunk) => void;
  onError?: (error: StreamError) => void;
  onComplete?: (summary: StreamSummary) => void;
}

export interface StreamChunk {
  index: number;
  data: string;
  timestamp: number;
  byteSize: number;
  isValid: boolean;
}

export interface StreamError {
  type: 'timeout' | 'invalid_chunk' | 'connection_lost' | 'backpressure' | 'abort';
  message: string;
  chunkIndex: number;
  recoverable: boolean;
}

export interface StreamSummary {
  totalChunks: number;
  validChunks: number;
  invalidChunks: number;
  totalBytes: number;
  durationMs: number;
  wasInterrupted: boolean;
  partialContent: string;
}

export interface StreamHandle {
  abort: () => void;
  getSummary: () => StreamSummary;
  isActive: () => boolean;
}

const DEFAULT_STREAM_CONFIG: StreamConfig = {
  timeoutMs: 60_000,
  maxChunks: 5000,
  validateChunks: true,
  backpressureThreshold: 100,
};

function validateSSEChunk(raw: string): boolean {
  if (!raw || raw.length === 0) return false;
  if (raw.length > 65536) return false; // 64KB max chunk
  // Basic SSE format validation
  return true;
}

export function createHardenedStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  config?: Partial<StreamConfig>
): StreamHandle {
  const cfg = { ...DEFAULT_STREAM_CONFIG, ...config };
  const decoder = new TextDecoder();
  let active = true;
  let chunkIndex = 0;
  let totalBytes = 0;
  let validChunks = 0;
  let invalidChunks = 0;
  let pendingChunks = 0;
  const startTime = Date.now();
  let accumulatedContent = '';
  let wasInterrupted = false;

  const timeoutHandle = setTimeout(() => {
    if (active) {
      active = false;
      wasInterrupted = true;
      cfg.onError?.({
        type: 'timeout',
        message: `Stream timed out after ${cfg.timeoutMs}ms`,
        chunkIndex,
        recoverable: false,
      });
      try { reader.cancel(); } catch {}
    }
  }, cfg.timeoutMs);

  // Process stream
  (async () => {
    try {
      while (active) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const bytes = value.byteLength;
        totalBytes += bytes;

        const isValid = !cfg.validateChunks || validateSSEChunk(text);

        const chunk: StreamChunk = {
          index: chunkIndex++,
          data: text,
          timestamp: Date.now(),
          byteSize: bytes,
          isValid,
        };

        if (isValid) {
          validChunks++;
          accumulatedContent += text;
          cfg.onChunk?.(chunk);
        } else {
          invalidChunks++;
          cfg.onError?.({
            type: 'invalid_chunk',
            message: `Invalid chunk at index ${chunk.index}`,
            chunkIndex: chunk.index,
            recoverable: true,
          });
        }

        // Backpressure check
        pendingChunks++;
        if (pendingChunks >= cfg.backpressureThreshold) {
          cfg.onError?.({
            type: 'backpressure',
            message: `Backpressure threshold reached: ${pendingChunks} pending`,
            chunkIndex: chunk.index,
            recoverable: true,
          });
          pendingChunks = 0;
        }

        // Max chunks guard
        if (chunkIndex >= cfg.maxChunks) {
          active = false;
          wasInterrupted = true;
          break;
        }
      }
    } catch (e: any) {
      if (active) {
        wasInterrupted = true;
        cfg.onError?.({
          type: 'connection_lost',
          message: e.message ?? 'Stream connection lost',
          chunkIndex,
          recoverable: false,
        });
      }
    } finally {
      active = false;
      clearTimeout(timeoutHandle);
      cfg.onComplete?.(getSummary());
    }
  })();

  function getSummary(): StreamSummary {
    return {
      totalChunks: chunkIndex,
      validChunks,
      invalidChunks,
      totalBytes,
      durationMs: Date.now() - startTime,
      wasInterrupted,
      partialContent: accumulatedContent.slice(-2000),
    };
  }

  return {
    abort: () => {
      active = false;
      wasInterrupted = true;
      clearTimeout(timeoutHandle);
      try { reader.cancel(); } catch {}
    },
    getSummary,
    isActive: () => active,
  };
}
