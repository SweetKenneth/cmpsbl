/**
 * @cmpsbl/cli — Spinner & Animation Utilities
 * Animated terminal output for a living substrate feel.
 *
 * © CMPSBL® — All rights reserved.
 */

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
  const interval = setInterval(() => {
    process.stdout.write(`\r  ${frames[i % frames.length]} ${current}`);
    i++;
  }, 80);

  return {
    stop(finalMessage?: string) {
      clearInterval(interval);
      process.stdout.write(`\r  ✔ ${finalMessage ?? current}${' '.repeat(20)}\n`);
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

export function progressBar(current: number, total: number, width = 30): string {
  const ratio = Math.min(current / total, 1);
  const filled = Math.round(ratio * width);
  const bar = '█'.repeat(filled) + '░'.repeat(width - filled);
  return `[${bar}] ${Math.round(ratio * 100)}%`;
}

export async function animatedList(items: string[], delay = 100): Promise<void> {
  for (const item of items) {
    await new Promise(r => setTimeout(r, delay));
    console.log(`  ${item}`);
  }
}

export function table(headers: string[], rows: string[][], padding = 2): void {
  const colWidths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => (r[i] ?? '').length)) + padding
  );

  const headerLine = headers.map((h, i) => h.padEnd(colWidths[i])).join('');
  const separator = colWidths.map(w => '─'.repeat(w)).join('');

  console.log(`  ${headerLine}`);
  console.log(`  ${separator}`);
  for (const row of rows) {
    console.log(`  ${row.map((c, i) => (c ?? '').padEnd(colWidths[i])).join('')}`);
  }
}

export function box(lines: string[], title?: string): void {
  const titleLen = title ? title.length + 4 : 0; // "═ TITLE ═" padding
  const maxLen = Math.max(...lines.map(l => l.length), titleLen);
  const innerWidth = maxLen + 2; // padding inside box

  if (title) {
    const fillLen = Math.max(0, innerWidth - title.length - 3); // "═ " prefix + " " suffix
    console.log(`  ╔═ ${title} ${'═'.repeat(fillLen)}╗`);
  } else {
    console.log(`  ╔${'═'.repeat(innerWidth + 2)}╗`);
  }
  for (const line of lines) {
    console.log(`  ║ ${line.padEnd(innerWidth)} ║`);
  }
  const bottomWidth = title ? title.length + 5 + Math.max(0, innerWidth - title.length - 3) : innerWidth + 2;
  console.log(`  ╚${'═'.repeat(bottomWidth)}╝`);
}
