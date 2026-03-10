/**
 * Terminal Visual Enhancements
 * Typing effects, progress bars, sparklines, and syntax highlighting
 */

import { useMemo } from 'react';

// Progress bar generator
export function generateProgressBar(
  progress: number, 
  width = 20, 
  style: 'block' | 'line' | 'dots' = 'block'
): string {
  const filled = Math.round((progress / 100) * width);
  const empty = width - filled;
  
  switch (style) {
    case 'block':
      return '█'.repeat(filled) + '░'.repeat(empty);
    case 'line':
      return '━'.repeat(filled) + '─'.repeat(empty);
    case 'dots':
      return '●'.repeat(filled) + '○'.repeat(empty);
    default:
      return '█'.repeat(filled) + '░'.repeat(empty);
  }
}

// Sparkline generator (inline mini charts)
export function generateSparkline(values: number[], width = 10): string {
  if (values.length === 0) return '─'.repeat(width);
  
  const chars = ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  // Sample values to fit width
  const step = Math.max(1, Math.floor(values.length / width));
  const sampled = [];
  for (let i = 0; i < values.length; i += step) {
    sampled.push(values[i]);
  }
  
  return sampled.slice(0, width).map(v => {
    const normalized = (v - min) / range;
    const charIndex = Math.floor(normalized * (chars.length - 1));
    return chars[charIndex];
  }).join('');
}

// ASCII module banners
export const MODULE_BANNERS: Record<string, string> = {
  brain: `
╔══════════════════════════════════════════════════════════════╗
║  ██████╗ ██████╗  █████╗ ██╗███╗   ██╗                       ║
║  ██╔══██╗██╔══██╗██╔══██╗██║████╗  ██║                       ║
║  ██████╔╝██████╔╝███████║██║██╔██╗ ██║  Cognitive Memory     ║
║  ██╔══██╗██╔══██╗██╔══██║██║██║╚██╗██║  Knowledge Graph      ║
║  ██████╔╝██║  ██║██║  ██║██║██║ ╚████║  Learning Engine      ║
║  ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝                       ║
╚══════════════════════════════════════════════════════════════╝`,
  
  defense: `
╔══════════════════════════════════════════════════════════════╗
║  ██████╗ ███████╗███████╗███████╗███╗   ██╗███████╗███████╗  ║
║  ██╔══██╗██╔════╝██╔════╝██╔════╝████╗  ██║██╔════╝██╔════╝  ║
║  ██║  ██║█████╗  █████╗  █████╗  ██╔██╗ ██║███████╗█████╗    ║
║  ██║  ██║██╔══╝  ██╔══╝  ██╔══╝  ██║╚██╗██║╚════██║██╔══╝    ║
║  ██████╔╝███████╗██║     ███████╗██║ ╚████║███████║███████╗  ║
║  ╚═════╝ ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═══╝╚══════╝╚══════╝  ║
╚══════════════════════════════════════════════════════════════╝`,
  
  dream: `
╔══════════════════════════════════════════════════════════════╗
║  ██████╗ ██████╗ ███████╗ █████╗ ███╗   ███╗                 ║
║  ██╔══██╗██╔══██╗██╔════╝██╔══██╗████╗ ████║                 ║
║  ██║  ██║██████╔╝█████╗  ███████║██╔████╔██║  Dream-Eater    ║
║  ██║  ██║██╔══██╗██╔══╝  ██╔══██║██║╚██╔╝██║  Mutation Engine║
║  ██████╔╝██║  ██║███████╗██║  ██║██║ ╚═╝ ██║                 ║
║  ╚═════╝ ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝                 ║
╚══════════════════════════════════════════════════════════════╝`,
  
  evolution: `
╔══════════════════════════════════════════════════════════════╗
║  ███████╗██╗   ██╗ ██████╗ ██╗     ██╗   ██╗███████╗        ║
║  ██╔════╝██║   ██║██╔═══██╗██║     ██║   ██║██╔════╝        ║
║  █████╗  ██║   ██║██║   ██║██║     ██║   ██║█████╗          ║
║  ██╔══╝  ╚██╗ ██╔╝██║   ██║██║     ██║   ██║██╔══╝          ║
║  ███████╗ ╚████╔╝ ╚██████╔╝███████╗╚██████╔╝███████╗        ║
║  ╚══════╝  ╚═══╝   ╚═════╝ ╚══════╝ ╚═════╝ ╚══════╝        ║
║                        Evolution Engine                       ║
╚══════════════════════════════════════════════════════════════╝`,
};

// Syntax highlighting patterns
export interface HighlightToken {
  text: string;
  type: 'default' | 'keyword' | 'string' | 'number' | 'success' | 'error' | 'warning' | 'info' | 'muted' | 'command' | 'module';
}

const KEYWORDS = ['true', 'false', 'null', 'undefined', 'success', 'error', 'pending', 'active', 'inactive'];
const MODULES = ['brain', 'decode', 'defense', 'nexus', 'vision', 'dream', 'system', 'evolution', 'core', 'ripple', 'access', 'integration'];

export function tokenize(text: string): HighlightToken[] {
  const tokens: HighlightToken[] = [];
  
  // Simple tokenizer - split by whitespace and special chars
  const regex = /(".*?"|'.*?'|\d+\.?\d*|[a-zA-Z_][a-zA-Z0-9_]*\.?[a-zA-Z_]*[a-zA-Z0-9_]*|[^\s\w]|\s+)/g;
  let match;
  
  while ((match = regex.exec(text)) !== null) {
    const word = match[0];
    let type: HighlightToken['type'] = 'default';
    
    if (word.startsWith('"') || word.startsWith("'")) {
      type = 'string';
    } else if (/^\d+\.?\d*$/.test(word)) {
      type = 'number';
    } else if (KEYWORDS.includes(word.toLowerCase())) {
      if (word.toLowerCase() === 'true' || word.toLowerCase() === 'success') {
        type = 'success';
      } else if (word.toLowerCase() === 'false' || word.toLowerCase() === 'error') {
        type = 'error';
      } else {
        type = 'keyword';
      }
    } else if (word.includes('.')) {
      const parts = word.split('.');
      if (MODULES.includes(parts[0].toLowerCase())) {
        type = 'command';
      }
    } else if (MODULES.includes(word.toLowerCase())) {
      type = 'module';
    } else if (word === '◉' || word === '✓') {
      type = 'success';
    } else if (word === '▓' || word === '✗') {
      type = 'error';
    } else if (word === '⚠') {
      type = 'warning';
    }
    
    tokens.push({ text: word, type });
  }
  
  return tokens;
}

// Color severity levels
export function getSeverityColor(severity: 'info' | 'warn' | 'error' | 'success' | 'debug'): string {
  switch (severity) {
    case 'error': return 'text-red-400';
    case 'warn': return 'text-amber-400';
    case 'success': return 'text-emerald-400';
    case 'info': return 'text-cyan-400';
    case 'debug': return 'text-muted-foreground';
    default: return 'text-foreground';
  }
}

// Get token color class
export function getTokenColor(type: HighlightToken['type']): string {
  switch (type) {
    case 'keyword': return 'text-purple-400';
    case 'string': return 'text-amber-400';
    case 'number': return 'text-cyan-400';
    case 'success': return 'text-emerald-400';
    case 'error': return 'text-red-400';
    case 'warning': return 'text-amber-400';
    case 'info': return 'text-blue-400';
    case 'muted': return 'text-muted-foreground';
    case 'command': return 'text-cyan-300';
    case 'module': return 'text-purple-300';
    default: return '';
  }
}

// Typing effect hook data
export interface TypingState {
  text: string;
  isComplete: boolean;
  charIndex: number;
}

// Format output with visual enhancements
export function enhanceOutput(output: string, options?: {
  showSparklines?: boolean;
  showProgressBars?: boolean;
  syntaxHighlight?: boolean;
}): string {
  let enhanced = output;
  
  // Convert numeric percentages to progress bars
  if (options?.showProgressBars !== false) {
    enhanced = enhanced.replace(
      /(\d+)%\s*(health|progress|complete|usage|score)/gi,
      (match, num, label) => {
        const value = parseInt(num);
        const bar = generateProgressBar(value, 15, 'block');
        return `${bar} ${num}% ${label}`;
      }
    );
  }
  
  return enhanced;
}

// Mini dashboard widget
export function generateMiniDashboard(metrics: {
  health?: number;
  memory?: number;
  cpu?: number;
  requests?: number[];
}): string {
  const healthBar = metrics.health !== undefined 
    ? generateProgressBar(metrics.health, 10) 
    : '░'.repeat(10);
  
  const memoryBar = metrics.memory !== undefined 
    ? generateProgressBar(metrics.memory, 10) 
    : '░'.repeat(10);
  
  const cpuBar = metrics.cpu !== undefined 
    ? generateProgressBar(metrics.cpu, 10) 
    : '░'.repeat(10);
  
  const reqSparkline = metrics.requests?.length 
    ? generateSparkline(metrics.requests, 10) 
    : '─'.repeat(10);
  
  return `
┌─ QUICK METRICS ─────────────────────────────────┐
│  Health   ${healthBar} ${metrics.health?.toFixed(0) ?? '--'}%     │
│  Memory   ${memoryBar} ${metrics.memory?.toFixed(0) ?? '--'}%     │
│  CPU      ${cpuBar} ${metrics.cpu?.toFixed(0) ?? '--'}%     │
│  Requests ${reqSparkline}          │
└─────────────────────────────────────────────────┘`;
}
