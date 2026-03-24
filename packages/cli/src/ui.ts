/**
 * @cmpsbl/cli — UI Toolkit with Brand Colors
 * ANSI 256-color palette mapped to CMPSBL website theme tokens.
 * Animated terminal output for a living substrate feel.
 *
 * © CMPSBL® — All rights reserved.
 */

// ═══════════════════════════════════════════════════════════════
// CMPSBL Brand Color Palette (ANSI 256-color equivalents)
// ═══════════════════════════════════════════════════════════════
//
// Website Token          HSL                    ANSI 256
// --primary              ~195 100% 45%          39  (dodger blue)
// --neon-cyan            185 100% 40%           37  (cyan)
// --neon-purple          280 100% 55%           135 (medium purple)
// --neon-amber           38 100% 50%            214 (orange/amber)
// --neon-green           145 80% 40%            35  (green)
// --neon-magenta         310 100% 50%           199 (hot pink)
// --neon-blue            210 100% 50%           33  (royal blue)

let NO_COLOR = false;

export function setNoColor(v: boolean) { NO_COLOR = v; }

export function supportsAnimatedOutput(): boolean {
  const isTTY = Boolean(process.stdout.isTTY);
  const isGitBashOnWindows = process.platform === 'win32' && Boolean(
    process.env.MSYSTEM || process.env.SHELL?.toLowerCase().includes('bash')
  );

  return isTTY && !isGitBashOnWindows;
}

function ansi(code: string, text: string): string {
  if (NO_COLOR) return text;
  return `\x1b[${code}m${text}\x1b[0m`;
}

// ── Brand Colors ──
export const c = {
  // Primary palette (mapped from website CSS tokens)
  primary:  (s: string) => ansi('38;5;39', s),   // --primary (dodger blue)
  cyan:     (s: string) => ansi('38;5;37', s),    // --neon-cyan
  purple:   (s: string) => ansi('38;5;135', s),   // --neon-purple
  amber:    (s: string) => ansi('38;5;214', s),   // --neon-amber
  green:    (s: string) => ansi('38;5;35', s),     // --neon-green
  magenta:  (s: string) => ansi('38;5;199', s),   // --neon-magenta
  blue:     (s: string) => ansi('38;5;33', s),    // --neon-blue

  // Semantic colors
  success:  (s: string) => ansi('38;5;35', s),    // green
  error:    (s: string) => ansi('38;5;196', s),    // red
  warn:     (s: string) => ansi('38;5;214', s),    // amber
  muted:    (s: string) => ansi('38;5;242', s),    // gray
  dim:      (s: string) => ansi('2', s),           // dim

  // Formatting
  bold:     (s: string) => ansi('1', s),
  italic:   (s: string) => ansi('3', s),
  underline:(s: string) => ansi('4', s),

  // Category colors (matching primitive taxonomy)
  layer:    (s: string) => ansi('38;5;37', s),     // cyan — Layers
  organ:    (s: string) => ansi('38;5;39', s),     // primary blue — Organs
  engine:   (s: string) => ansi('38;5;135', s),    // purple — Engines
  agent:    (s: string) => ansi('38;5;214', s),    // amber — Agents

  // Health colors
  healthy:  (s: string) => ansi('38;5;35', s),
  degraded: (s: string) => ansi('38;5;214', s),
  critical: (s: string) => ansi('38;5;196', s),
};

// ═══════════════════════════════════════════════════════════════
// Spinners
// ═══════════════════════════════════════════════════════════════

const SPINNER_FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const PULSE_FRAMES = ['◇', '◈', '◆', '◈'];
const MESH_FRAMES = ['≋', '≈', '∼', '≈'];

export interface SpinnerHandle {
  stop: (finalMessage?: string) => void;
  update: (message: string) => void;
}

export function spinner(message: string, frames = SPINNER_FRAMES): SpinnerHandle {
  let i = 0;
  let current = message;

  if (!supportsAnimatedOutput()) {
    return {
      stop(finalMessage?: string) {
        if (finalMessage) console.log(`  ${c.green('✔')} ${finalMessage}`);
      },
      update(msg: string) {
        current = msg;
      },
    };
  }

  const interval = setInterval(() => {
    const frame = c.cyan(frames[i % frames.length]);
    process.stdout.write(`\r  ${frame} ${c.muted(current)}${' '.repeat(10)}`);
    i++;
  }, 80);

  return {
    stop(finalMessage?: string) {
      clearInterval(interval);
      process.stdout.write(`\r  ${c.green('✔')} ${finalMessage ?? current}${' '.repeat(20)}\n`);
    },
    update(msg: string) {
      current = msg;
    },
  };
}

export function pulseSpinner(message: string): SpinnerHandle {
  return spinner(message, PULSE_FRAMES);
}

export function meshSpinner(message: string): SpinnerHandle {
  return spinner(message, MESH_FRAMES);
}

export async function withSpinner<T>(message: string, fn: () => Promise<T>): Promise<T> {
  const s = spinner(message);
  try {
    const result = await fn();
    s.stop();
    return result;
  } catch (err) {
    s.stop(`Failed: ${message}`);
    throw err;
  }
}

// ═══════════════════════════════════════════════════════════════
// Progress Bar (colored)
// ═══════════════════════════════════════════════════════════════

export function progressBar(current: number, total: number, width = 30): string {
  const ratio = Math.min(current / total, 1);
  const filled = Math.round(ratio * width);
  const pct = Math.round(ratio * 100);

  const colorFn = pct >= 90 ? c.green : pct >= 70 ? c.amber : c.critical;
  const filledBar = colorFn('█'.repeat(filled));
  const emptyBar = c.muted('░'.repeat(width - filled));

  return `[${filledBar}${emptyBar}] ${colorFn(`${pct}%`)}`;
}

// ═══════════════════════════════════════════════════════════════
// Animated List
// ═══════════════════════════════════════════════════════════════

export async function animatedList(items: string[], delay = 100): Promise<void> {
  for (const item of items) {
    await new Promise(r => setTimeout(r, delay));
    console.log(`  ${item}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// Table (colored headers)
// ═══════════════════════════════════════════════════════════════

export function table(headers: string[], rows: string[][], padding = 2): void {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => (r[i] ?? '').length)) + padding
  );

  const headerLine = headers.map((h, i) => c.bold(c.cyan(h.padEnd(colWidths[i])))).join('');
  const separator = c.muted(colWidths.map(w => '─'.repeat(w)).join(''));

  console.log(`  ${headerLine}`);
  console.log(`  ${separator}`);
  for (const row of rows) {
    console.log(`  ${row.map((cell, i) => (cell ?? '').padEnd(colWidths[i])).join('')}`);
  }
}

// ═══════════════════════════════════════════════════════════════
// Box (brand-colored borders)
// ═══════════════════════════════════════════════════════════════

export function box(lines: string[], title?: string): void {
  const titleLen = title ? title.length + 4 : 0;
  const maxLen = Math.max(...lines.map(l => stripAnsi(l).length), titleLen);
  const innerWidth = maxLen + 2;

  const border = c.primary;

  if (title) {
    const fillLen = Math.max(0, innerWidth - title.length - 3);
    console.log(`  ${border('╔═')} ${c.bold(c.cyan(title))} ${border('═'.repeat(fillLen) + '╗')}`);
  } else {
    console.log(`  ${border('╔' + '═'.repeat(innerWidth + 2) + '╗')}`);
  }
  for (const line of lines) {
    const visible = stripAnsi(line).length;
    const pad = innerWidth - visible;
    console.log(`  ${border('║')} ${line}${' '.repeat(Math.max(0, pad))} ${border('║')}`);
  }
  const bottomWidth = title ? title.length + 5 + Math.max(0, innerWidth - title.length - 3) : innerWidth + 2;
  console.log(`  ${border('╚' + '═'.repeat(bottomWidth) + '╝')}`);
}

// ═══════════════════════════════════════════════════════════════
// Font Recommendation
// ═══════════════════════════════════════════════════════════════

export function printFontRecommendation(): void {
  console.log('');
  console.log(`  ${c.muted('┌──────────────────────────────────────────────────────┐')}`);
  console.log(`  ${c.muted('│')} ${c.dim('For the best experience, use a Nerd Font or:')}        ${c.muted('│')}`);
  console.log(`  ${c.muted('│')} ${c.cyan('JetBrains Mono')} · ${c.cyan('Fira Code')} · ${c.cyan('Cascadia Code')}          ${c.muted('│')}`);
  console.log(`  ${c.muted('│')} ${c.dim('These fonts render substrate glyphs (◈ ⬢ ★) cleanly.')} ${c.muted('│')}`);
  console.log(`  ${c.muted('└──────────────────────────────────────────────────────┘')}`);
  console.log('');
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

/** Strip ANSI escape codes for length calculation */
function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, '');
}

/** Health-colored node display */
export function healthColor(health: number, text: string): string {
  if (health >= 95) return c.healthy(text);
  if (health >= 85) return c.degraded(text);
  return c.critical(text);
}

/** Category-colored primitive name */
export function primitiveColor(category: 'layer' | 'organ' | 'engine' | 'agent', name: string): string {
  return c[category](name);
}
