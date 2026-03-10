/**
 * Terminal Mobile Renderer v0.8.0
 * Mobile-first rendering with no-break zones for atomic tokens
 * 
 * Ensures words, UUIDs, timestamps, and module names never break mid-token
 */

// Atomic tokens that should never break mid-word
const ATOMIC_PATTERNS = [
  // UUIDs: 8-4-4-4-12 format
  /[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi,
  // Short IDs (8+ hex chars)
  /\b[a-f0-9]{8,}\b/gi,
  // Module.action format
  /\b(core|ripple|access|brain|decode|dream|defense|nexus|vision|system|evolution|inclusive|integration|cortex|clm)\.[a-z_]+\b/gi,
  // Timestamps ISO format
  /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/g,
  // Date format
  /\d{4}-\d{2}-\d{2}/g,
  // Time format
  /\d{2}:\d{2}:\d{2}/g,
  // Percentages
  /\d+(\.\d+)?%/g,
  // Version numbers
  /v\d+\.\d+\.\d+/gi,
  // API key prefixes
  /sk_[a-zA-Z0-9]+/g,
  /pk_[a-zA-Z0-9]+/g,
  // Status badges
  /\[OK\]|\[FAIL\]|\[WARN\]|\[ERROR\]/g,
];

/**
 * Viewport modes for responsive rendering
 */
export type ViewportMode = 'compact' | 'standard' | 'full';

/**
 * Get viewport mode based on width
 */
export function getViewportMode(width: number): ViewportMode {
  if (width < 480) return 'compact';
  if (width < 768) return 'standard';
  return 'full';
}

/**
 * Wrap text with respect to atomic tokens (no mid-token breaks)
 */
export function wrapWithNoBreakZones(text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  const words = text.split(/(\s+)/);
  let currentLine = '';

  for (const word of words) {
    // Check if adding this word would exceed max width
    const testLine = currentLine + word;
    
    // Simple visual width (approximate for monospace)
    if (testLine.length > maxWidth && currentLine.length > 0) {
      // Push current line and start new one
      lines.push(currentLine.trimEnd());
      currentLine = word.trimStart();
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine.trim()) {
    lines.push(currentLine.trimEnd());
  }

  return lines;
}

/**
 * Process terminal output for mobile display
 * Ensures atomic tokens don't break across lines
 */
export function renderForMobile(output: string, maxWidth: number = 40): string {
  const lines = output.split('\n');
  const processedLines: string[] = [];

  for (const line of lines) {
    // Skip empty lines or lines that are already short
    if (!line || line.length <= maxWidth) {
      processedLines.push(line);
      continue;
    }

    // Check if line contains box-drawing characters (preserve formatting)
    if (/[┌┐└┘├┤┬┴┼─│═╔╗╚╝╠╣╦╩╬║]/.test(line)) {
      // Truncate with ellipsis for box-drawing lines
      if (line.length > maxWidth) {
        processedLines.push(line.slice(0, maxWidth - 1) + '…');
      } else {
        processedLines.push(line);
      }
      continue;
    }

    // Wrap with no-break zones
    const wrapped = wrapWithNoBreakZones(line, maxWidth);
    processedLines.push(...wrapped);
  }

  return processedLines.join('\n');
}

/**
 * Format table output for mobile (stacked rows)
 */
export function formatTableForMobile(
  headers: string[],
  rows: string[][],
  maxWidth: number = 40
): string {
  const output: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    output.push(`┌─ Row ${i + 1} ─────────────────────────`);
    
    for (let j = 0; j < headers.length && j < row.length; j++) {
      const label = headers[j].padEnd(12);
      const value = row[j];
      output.push(`│ ${label}: ${value}`);
    }
    
    output.push('└─────────────────────────────────────');
  }

  return output.join('\n');
}

/**
 * Truncate UUID for mobile display (show first 8 chars)
 */
export function truncateUUID(uuid: string): string {
  if (uuid.length === 36 && uuid.includes('-')) {
    return uuid.slice(0, 8) + '…';
  }
  return uuid;
}

/**
 * Format bytes for compact display
 */
export function formatBytesCompact(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)}GB`;
}

/**
 * Format duration for compact display
 */
export function formatDurationCompact(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  if (ms < 3600000) return `${(ms / 60000).toFixed(1)}m`;
  return `${(ms / 3600000).toFixed(1)}h`;
}

/**
 * Create a responsive box header
 */
export function createResponsiveHeader(title: string, width: number): string {
  const maxTitleLen = width - 6; // Account for "┌─ " and " ─┐"
  const displayTitle = title.length > maxTitleLen 
    ? title.slice(0, maxTitleLen - 1) + '…'
    : title;
  
  const remainingWidth = width - 4 - displayTitle.length;
  const padding = '─'.repeat(Math.max(0, remainingWidth));
  
  return `┌─ ${displayTitle} ${padding}┐`;
}

/**
 * Create a responsive footer
 */
export function createResponsiveFooter(width: number): string {
  return '└' + '─'.repeat(width - 2) + '┘';
}

/**
 * Apply CSS class for no-wrap zones
 */
export function applyNoWrapStyles(text: string): string {
  // Wrap atomic tokens in span with nowrap style
  let result = text;
  
  for (const pattern of ATOMIC_PATTERNS) {
    result = result.replace(pattern, (match) => 
      `<span class="whitespace-nowrap">${match}</span>`
    );
  }
  
  return result;
}

/**
 * Detect if running on mobile viewport
 */
export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

/**
 * Get optimal terminal character width for viewport
 */
export function getOptimalCharWidth(): number {
  if (typeof window === 'undefined') return 80;
  
  const width = window.innerWidth;
  if (width < 400) return 36;
  if (width < 480) return 42;
  if (width < 640) return 52;
  if (width < 768) return 60;
  if (width < 1024) return 72;
  return 80;
}
