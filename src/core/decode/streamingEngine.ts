/**
 * DECODE Streaming Response Engine — v1.0.0
 * Token-by-token streaming for real-time DECODE responses.
 * 
 * Supports:
 *   - Progressive text accumulation
 *   - Interrupt capability (user can stop generation)
 *   - Stream status tracking
 *   - Backpressure handling
 */

// ═══ Types ════════════════════════════════════════════════════════

export type StreamStatus = 'idle' | 'streaming' | 'paused' | 'completed' | 'interrupted' | 'error';

export interface StreamEvent {
  type: 'token' | 'status' | 'metadata' | 'done' | 'error';
  data: string;
  timestamp: number;
}

export interface StreamState {
  id: string;
  status: StreamStatus;
  accumulatedText: string;
  tokenCount: number;
  startedAt: number;
  elapsedMs: number;
  interrupted: boolean;
}

export type StreamListener = (event: StreamEvent) => void;

// ═══ Stream Controller ════════════════════════════════════════════

export class DecodeStreamController {
  private id: string;
  private status: StreamStatus = 'idle';
  private buffer: string = '';
  private tokenCount: number = 0;
  private startedAt: number = 0;
  private listeners: Set<StreamListener> = new Set();
  private abortController: AbortController | null = null;

  constructor(id?: string) {
    this.id = id || `stream_${Date.now()}`;
  }

  // ── Lifecycle ──

  start(): void {
    this.status = 'streaming';
    this.buffer = '';
    this.tokenCount = 0;
    this.startedAt = performance.now();
    this.abortController = new AbortController();
    this.emit({ type: 'status', data: 'streaming', timestamp: Date.now() });
  }

  interrupt(): void {
    this.status = 'interrupted';
    this.abortController?.abort();
    this.emit({ type: 'status', data: 'interrupted', timestamp: Date.now() });
  }

  complete(): void {
    this.status = 'completed';
    this.emit({ type: 'done', data: this.buffer, timestamp: Date.now() });
  }

  error(message: string): void {
    this.status = 'error';
    this.emit({ type: 'error', data: message, timestamp: Date.now() });
  }

  reset(): void {
    this.status = 'idle';
    this.buffer = '';
    this.tokenCount = 0;
    this.startedAt = 0;
    this.abortController = null;
  }

  // ── Token Processing ──

  pushToken(token: string): boolean {
    if (this.status !== 'streaming') return false;
    if (this.abortController?.signal.aborted) return false;

    this.buffer += token;
    this.tokenCount++;
    this.emit({ type: 'token', data: token, timestamp: Date.now() });
    return true;
  }

  pushChunk(chunk: string): boolean {
    if (this.status !== 'streaming') return false;

    // Simulate token-by-token from chunk
    this.buffer += chunk;
    this.tokenCount += Math.ceil(chunk.length / 4);
    this.emit({ type: 'token', data: chunk, timestamp: Date.now() });
    return true;
  }

  // ── State ──

  getState(): StreamState {
    return {
      id: this.id,
      status: this.status,
      accumulatedText: this.buffer,
      tokenCount: this.tokenCount,
      startedAt: this.startedAt,
      elapsedMs: this.startedAt ? performance.now() - this.startedAt : 0,
      interrupted: this.status === 'interrupted',
    };
  }

  getSignal(): AbortSignal | undefined {
    return this.abortController?.signal;
  }

  isActive(): boolean {
    return this.status === 'streaming';
  }

  getText(): string {
    return this.buffer;
  }

  // ── Event System ──

  subscribe(listener: StreamListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(event: StreamEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch { /* listener error — non-blocking */ }
    }
  }
}

// ═══ Stream Manager (Singleton) ═══════════════════════════════════

const activeStreams = new Map<string, DecodeStreamController>();

/**
 * Create a new stream controller
 */
export function createStream(id?: string): DecodeStreamController {
  const stream = new DecodeStreamController(id);
  const streamId = stream.getState().id;

  // Clean up any existing stream with same ID
  const existing = activeStreams.get(streamId);
  if (existing?.isActive()) {
    existing.interrupt();
  }

  activeStreams.set(streamId, stream);
  return stream;
}

/**
 * Get an active stream by ID
 */
export function getStream(id: string): DecodeStreamController | undefined {
  return activeStreams.get(id);
}

/**
 * Interrupt all active streams
 */
export function interruptAllStreams(): number {
  let count = 0;
  for (const stream of activeStreams.values()) {
    if (stream.isActive()) {
      stream.interrupt();
      count++;
    }
  }
  return count;
}

/**
 * Clean up completed/interrupted streams
 */
export function cleanupStreams(): number {
  let cleaned = 0;
  for (const [id, stream] of activeStreams.entries()) {
    if (!stream.isActive()) {
      activeStreams.delete(id);
      cleaned++;
    }
  }
  return cleaned;
}

/**
 * Process an SSE stream from a fetch response
 */
export async function processSSEStream(
  response: Response,
  controller: DecodeStreamController,
): Promise<string> {
  controller.start();

  try {
    const reader = response.body?.getReader();
    if (!reader) {
      controller.error('No response body');
      return '';
    }

    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      if (controller.getState().interrupted) break;

      const { value, done: streamDone } = await reader.read();
      done = streamDone;

      if (value) {
        const chunk = decoder.decode(value, { stream: !done });
        // Parse SSE format
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              done = true;
              break;
            }
            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content || '';
              if (token) {
                controller.pushToken(token);
              }
            } catch {
              // Non-JSON SSE data — push as chunk
              if (data.trim()) {
                controller.pushChunk(data);
              }
            }
          }
        }
      }
    }

    controller.complete();
    return controller.getText();
  } catch (err) {
    if (controller.getState().status !== 'interrupted') {
      controller.error(err instanceof Error ? err.message : 'stream error');
    }
    return controller.getText();
  }
}
