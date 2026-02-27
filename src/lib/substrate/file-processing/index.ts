/**
 * File / Document Processing Pipeline
 * Ingest, parse, and extract knowledge from files
 * 
 * Supports PDF, CSV, JSON, Markdown, and plain text.
 * Extracted content can be routed to Brain for memory ingestion.
 */

export type SupportedFormat = 'pdf' | 'csv' | 'json' | 'markdown' | 'text' | 'html';

export interface FileProcessingRequest {
  file: File | Blob;
  filename: string;
  format?: SupportedFormat;
  options?: {
    extractTables?: boolean;
    maxChunkSize?: number;
    ingestToBrain?: boolean;
    tags?: string[];
  };
}

export interface ProcessedChunk {
  index: number;
  content: string;
  type: 'text' | 'table' | 'heading' | 'code' | 'metadata';
  metadata?: Record<string, unknown>;
}

export interface FileProcessingResult {
  filename: string;
  format: SupportedFormat;
  sizeBytes: number;
  chunks: ProcessedChunk[];
  totalChunks: number;
  totalCharacters: number;
  extractedTables: number;
  processingTimeMs: number;
  ingestedToBrain: boolean;
  summary: string;
}

export interface ProcessingStats {
  totalFilesProcessed: number;
  totalBytesProcessed: number;
  totalChunksGenerated: number;
  formatBreakdown: Record<string, number>;
  avgProcessingTimeMs: number;
  ingestedToBrain: number;
}

class FileProcessingPipeline {
  private static instance: FileProcessingPipeline;
  private history: FileProcessingResult[] = [];

  private constructor() {}

  static getInstance(): FileProcessingPipeline {
    if (!FileProcessingPipeline.instance) {
      FileProcessingPipeline.instance = new FileProcessingPipeline();
    }
    return FileProcessingPipeline.instance;
  }

  /** Process a file and extract structured content */
  async process(request: FileProcessingRequest): Promise<FileProcessingResult> {
    const start = Date.now();
    const format = request.format || this.detectFormat(request.filename);
    const maxChunkSize = request.options?.maxChunkSize || 2000;

    let chunks: ProcessedChunk[] = [];
    let extractedTables = 0;

    const text = await this.readFileAsText(request.file);

    switch (format) {
      case 'csv':
        const csvResult = this.parseCSV(text, request.options?.extractTables ?? true);
        chunks = csvResult.chunks;
        extractedTables = csvResult.tables;
        break;

      case 'json':
        chunks = this.parseJSON(text, maxChunkSize);
        break;

      case 'markdown':
        chunks = this.parseMarkdown(text, maxChunkSize);
        break;

      case 'html':
        chunks = this.parseHTML(text, maxChunkSize);
        break;

      case 'text':
      default:
        chunks = this.parsePlainText(text, maxChunkSize);
        break;
    }

    // Generate summary
    const totalChars = chunks.reduce((s, c) => s + c.content.length, 0);
    const summary = `Processed ${request.filename} (${format}): ${chunks.length} chunks, ${totalChars} characters`;

    // Optionally ingest to brain
    let ingestedToBrain = false;
    if (request.options?.ingestToBrain) {
      try {
        const { substrate } = await import('@/lib/substrate');
        for (const chunk of chunks.slice(0, 50)) { // Max 50 chunks per file
          await substrate.invoke({
            module: 'brain',
            action: 'memory_ingest',
            payload: {
              content: chunk.content,
              source: `file:${request.filename}`,
              type: 'document',
              tags: request.options?.tags,
            },
          });
        }
        ingestedToBrain = true;
      } catch {
        ingestedToBrain = false;
      }
    }

    const result: FileProcessingResult = {
      filename: request.filename,
      format,
      sizeBytes: request.file.size,
      chunks,
      totalChunks: chunks.length,
      totalCharacters: totalChars,
      extractedTables,
      processingTimeMs: Date.now() - start,
      ingestedToBrain,
      summary,
    };

    this.history.push(result);
    if (this.history.length > 100) this.history.shift();

    return result;
  }

  /** Get processing history */
  getHistory(limit = 20): FileProcessingResult[] {
    return this.history.slice(-limit);
  }

  /** Get processing stats */
  stats(): ProcessingStats {
    const formatBreakdown: Record<string, number> = {};
    let totalBytes = 0;
    let totalChunks = 0;
    let totalTime = 0;
    let ingested = 0;

    for (const r of this.history) {
      formatBreakdown[r.format] = (formatBreakdown[r.format] || 0) + 1;
      totalBytes += r.sizeBytes;
      totalChunks += r.totalChunks;
      totalTime += r.processingTimeMs;
      if (r.ingestedToBrain) ingested++;
    }

    return {
      totalFilesProcessed: this.history.length,
      totalBytesProcessed: totalBytes,
      totalChunksGenerated: totalChunks,
      formatBreakdown,
      avgProcessingTimeMs: this.history.length > 0 ? Math.round(totalTime / this.history.length) : 0,
      ingestedToBrain: ingested,
    };
  }

  /** Get supported formats */
  supportedFormats(): SupportedFormat[] {
    return ['pdf', 'csv', 'json', 'markdown', 'text', 'html'];
  }

  private detectFormat(filename: string): SupportedFormat {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'csv': return 'csv';
      case 'json': return 'json';
      case 'md': case 'markdown': return 'markdown';
      case 'html': case 'htm': return 'html';
      case 'pdf': return 'pdf';
      default: return 'text';
    }
  }

  private async readFileAsText(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  private parseCSV(text: string, extractTables: boolean): { chunks: ProcessedChunk[]; tables: number } {
    const lines = text.split('\n').filter(l => l.trim());
    const chunks: ProcessedChunk[] = [];
    let tables = 0;

    if (lines.length === 0) return { chunks, tables };

    // First line as header
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));

    if (extractTables) {
      // Create a table chunk
      chunks.push({
        index: 0,
        content: `Table with ${headers.length} columns: ${headers.join(', ')}. ${lines.length - 1} rows.`,
        type: 'table',
        metadata: { headers, rowCount: lines.length - 1 },
      });
      tables = 1;
    }

    // Create row chunks (batch of 20)
    for (let i = 1; i < lines.length; i += 20) {
      const batch = lines.slice(i, i + 20);
      const content = batch.map(row => {
        const values = row.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
        return headers.map((h, idx) => `${h}: ${values[idx] || ''}`).join(', ');
      }).join('\n');

      chunks.push({
        index: chunks.length,
        content,
        type: 'text',
        metadata: { rowRange: `${i}-${Math.min(i + 19, lines.length - 1)}` },
      });
    }

    return { chunks, tables };
  }

  private parseJSON(text: string, maxChunkSize: number): ProcessedChunk[] {
    try {
      const parsed = JSON.parse(text);
      const chunks: ProcessedChunk[] = [];

      if (Array.isArray(parsed)) {
        // Array of objects — chunk by items
        for (let i = 0; i < parsed.length; i += 10) {
          const batch = parsed.slice(i, i + 10);
          chunks.push({
            index: chunks.length,
            content: JSON.stringify(batch, null, 2).slice(0, maxChunkSize),
            type: 'text',
            metadata: { itemRange: `${i}-${Math.min(i + 9, parsed.length - 1)}`, totalItems: parsed.length },
          });
        }
      } else {
        // Single object — chunk by keys
        const keys = Object.keys(parsed);
        for (let i = 0; i < keys.length; i += 5) {
          const batch = keys.slice(i, i + 5);
          const subset: Record<string, unknown> = {};
          for (const k of batch) subset[k] = parsed[k];
          
          chunks.push({
            index: chunks.length,
            content: JSON.stringify(subset, null, 2).slice(0, maxChunkSize),
            type: 'text',
            metadata: { keys: batch },
          });
        }
      }

      return chunks;
    } catch {
      return [{ index: 0, content: text.slice(0, maxChunkSize), type: 'text' }];
    }
  }

  private parseMarkdown(text: string, maxChunkSize: number): ProcessedChunk[] {
    const chunks: ProcessedChunk[] = [];
    // Split by headings
    const sections = text.split(/^(#{1,6}\s+.+)$/m);
    
    let currentContent = '';
    let currentType: ProcessedChunk['type'] = 'text';

    for (const section of sections) {
      if (section.match(/^#{1,6}\s+/)) {
        if (currentContent.trim()) {
          chunks.push({ index: chunks.length, content: currentContent.trim().slice(0, maxChunkSize), type: currentType });
        }
        currentContent = section + '\n';
        currentType = 'heading';
      } else {
        currentContent += section;
        if (currentContent.length >= maxChunkSize) {
          chunks.push({ index: chunks.length, content: currentContent.trim().slice(0, maxChunkSize), type: currentType });
          currentContent = '';
          currentType = 'text';
        }
      }
    }

    if (currentContent.trim()) {
      chunks.push({ index: chunks.length, content: currentContent.trim().slice(0, maxChunkSize), type: currentType });
    }

    return chunks.length > 0 ? chunks : [{ index: 0, content: text.slice(0, maxChunkSize), type: 'text' }];
  }

  private parseHTML(text: string, maxChunkSize: number): ProcessedChunk[] {
    // Strip HTML tags for text extraction
    const stripped = text
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    return this.parsePlainText(stripped, maxChunkSize);
  }

  private parsePlainText(text: string, maxChunkSize: number): ProcessedChunk[] {
    const chunks: ProcessedChunk[] = [];
    const paragraphs = text.split(/\n\n+/);
    let currentChunk = '';

    for (const para of paragraphs) {
      if ((currentChunk + '\n\n' + para).length > maxChunkSize && currentChunk) {
        chunks.push({ index: chunks.length, content: currentChunk.trim(), type: 'text' });
        currentChunk = para;
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + para;
      }
    }

    if (currentChunk.trim()) {
      chunks.push({ index: chunks.length, content: currentChunk.trim(), type: 'text' });
    }

    return chunks.length > 0 ? chunks : [{ index: 0, content: text.slice(0, maxChunkSize), type: 'text' }];
  }
}

export const fileProcessingPipeline = FileProcessingPipeline.getInstance();
