/**
 * Streaming Response Pipeline
 * SSE-based streaming for real-time AI responses
 * 
 * Makes DECODE and NEXUS feel alive and premium with
 * partial result streaming via Server-Sent Events.
 */

export interface StreamChunk {
  id: string;
  index: number;
  content: string;
  done: boolean;
  metadata?: Record<string, unknown>;
}

export interface StreamOptions {
  onChunk: (chunk: StreamChunk) => void;
  onComplete?: (fullContent: string) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
  bufferSize?: number;
}

export interface StreamSession {
  id: string;
  startedAt: number;
  chunksReceived: number;
  bytesReceived: number;
  status: 'streaming' | 'complete' | 'error' | 'aborted';
  fullContent: string;
  durationMs: number;
}

export interface StreamStats {
  totalStreams: number;
  activeStreams: number;
  completedStreams: number;
  erroredStreams: number;
  avgChunksPerStream: number;
  avgDurationMs: number;
}

class StreamingPipeline {
  private static instance: StreamingPipeline;
  private activeSessions = new Map<string, StreamSession>();
  private completedSessions: StreamSession[] = [];

  private constructor() {}

  static getInstance(): StreamingPipeline {
    if (!StreamingPipeline.instance) {
      StreamingPipeline.instance = new StreamingPipeline();
    }
    return StreamingPipeline.instance;
  }

  /** Start a streaming response from a Supabase edge function */
  async streamFromEdge(
    functionName: string,
    body: Record<string, unknown>,
    options: StreamOptions
  ): Promise<StreamSession> {
    const sessionId = `stream_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const session: StreamSession = {
      id: sessionId,
      startedAt: Date.now(),
      chunksReceived: 0,
      bytesReceived: 0,
      status: 'streaming',
      fullContent: '',
      durationMs: 0,
    };

    this.activeSessions.set(sessionId, session);

    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Use fetch directly for SSE support
      const supabaseUrl = (supabase as any).supabaseUrl || '';
      const supabaseKey = (supabase as any).supabaseKey || '';
      
      const url = `${supabaseUrl}/functions/v1/${functionName}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({ ...body, stream: true }),
        signal: options.signal,
      });

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.status}`);
      }

      const contentType = response.headers.get('content-type') || '';

      if (contentType.includes('text/event-stream')) {
        await this.processSSEStream(response, session, options);
      } else {
        // Fallback: non-streaming response, simulate chunks
        const text = await response.text();
        await this.simulateStream(text, session, options);
      }

      session.status = 'complete';
      session.durationMs = Date.now() - session.startedAt;
      options.onComplete?.(session.fullContent);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        session.status = 'aborted';
      } else {
        session.status = 'error';
        options.onError?.(err instanceof Error ? err : new Error(String(err)));
      }
      session.durationMs = Date.now() - session.startedAt;
    } finally {
      this.activeSessions.delete(sessionId);
      this.completedSessions.push(session);
      if (this.completedSessions.length > 100) this.completedSessions.shift();
    }

    return session;
  }

  /** Stream text content with simulated typing effect */
  async simulateStream(
    content: string,
    session: StreamSession,
    options: StreamOptions
  ): Promise<void> {
    const words = content.split(/(\s+)/);
    const chunkSize = options.bufferSize || 3;
    let index = 0;

    for (let i = 0; i < words.length; i += chunkSize) {
      if (options.signal?.aborted) break;

      const chunkContent = words.slice(i, i + chunkSize).join('');
      const done = i + chunkSize >= words.length;

      const chunk: StreamChunk = {
        id: session.id,
        index: index++,
        content: chunkContent,
        done,
      };

      session.chunksReceived++;
      session.bytesReceived += chunkContent.length;
      session.fullContent += chunkContent;

      options.onChunk(chunk);

      // Small delay for visual effect
      if (!done) {
        await new Promise(r => setTimeout(r, 20 + Math.random() * 30));
      }
    }
  }

  /** Get active stream sessions */
  getActiveSessions(): StreamSession[] {
    return Array.from(this.activeSessions.values());
  }

  /** Get stats */
  stats(): StreamStats {
    const completed = this.completedSessions;
    const totalChunks = completed.reduce((s, sess) => s + sess.chunksReceived, 0);
    const totalDuration = completed.reduce((s, sess) => s + sess.durationMs, 0);

    return {
      totalStreams: completed.length + this.activeSessions.size,
      activeStreams: this.activeSessions.size,
      completedStreams: completed.filter(s => s.status === 'complete').length,
      erroredStreams: completed.filter(s => s.status === 'error').length,
      avgChunksPerStream: completed.length > 0 ? Math.round(totalChunks / completed.length) : 0,
      avgDurationMs: completed.length > 0 ? Math.round(totalDuration / completed.length) : 0,
    };
  }

  private async processSSEStream(
    response: Response,
    session: StreamSession,
    options: StreamOptions
  ): Promise<void> {
    const reader = response.body?.getReader();
    if (!reader) throw new Error('No readable stream');

    const decoder = new TextDecoder();
    let index = 0;
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              const chunk: StreamChunk = { id: session.id, index: index++, content: '', done: true };
              options.onChunk(chunk);
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.content || parsed.text || parsed.delta || '';

              const chunk: StreamChunk = {
                id: session.id,
                index: index++,
                content,
                done: false,
                metadata: parsed.metadata,
              };

              session.chunksReceived++;
              session.bytesReceived += content.length;
              session.fullContent += content;
              options.onChunk(chunk);
            } catch {
              // Non-JSON data line, treat as content
              const chunk: StreamChunk = {
                id: session.id,
                index: index++,
                content: data,
                done: false,
              };
              session.chunksReceived++;
              session.bytesReceived += data.length;
              session.fullContent += data;
              options.onChunk(chunk);
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }
}

export const streamingPipeline = StreamingPipeline.getInstance();
