/**
 * Changelog Generator — Auto-generates changelog from substrate evolution receipts
 */

interface ChangelogEntry {
  id: string;
  timestamp: number;
  type: 'feature' | 'fix' | 'improvement' | 'breaking';
  module: string;
  title: string;
  description?: string;
}

const entries: ChangelogEntry[] = [];

export function addEntry(type: ChangelogEntry['type'], module: string, title: string, description?: string): string {
  const id = `cl_${Date.now()}_${entries.length}`;
  entries.push({ id, timestamp: Date.now(), type, module, title, description });
  return id;
}

export function getChangelog(since?: number): ChangelogEntry[] {
  const filtered = since ? entries.filter(e => e.timestamp >= since) : entries;
  return [...filtered].sort((a, b) => b.timestamp - a.timestamp);
}

export function getChangelogByModule(module: string): ChangelogEntry[] {
  return entries.filter(e => e.module === module).sort((a, b) => b.timestamp - a.timestamp);
}

/** Format as markdown */
export function toMarkdown(since?: number): string {
  const log = getChangelog(since);
  if (log.length === 0) return '# Changelog\n\nNo changes recorded.';

  const groups: Record<string, ChangelogEntry[]> = {};
  for (const e of log) {
    const date = new Date(e.timestamp).toISOString().split('T')[0];
    if (!groups[date]) groups[date] = [];
    groups[date].push(e);
  }

  const typeEmoji: Record<string, string> = { feature: '✨', fix: '🐛', improvement: '⚡', breaking: '💥' };
  let md = '# Changelog\n\n';

  for (const [date, items] of Object.entries(groups)) {
    md += `## ${date}\n\n`;
    for (const item of items) {
      md += `- ${typeEmoji[item.type] || '•'} **[${item.module.toUpperCase()}]** ${item.title}`;
      if (item.description) md += ` — ${item.description}`;
      md += '\n';
    }
    md += '\n';
  }

  return md;
}

export function getStats() {
  return {
    total: entries.length,
    features: entries.filter(e => e.type === 'feature').length,
    fixes: entries.filter(e => e.type === 'fix').length,
    improvements: entries.filter(e => e.type === 'improvement').length,
    breaking: entries.filter(e => e.type === 'breaking').length,
  };
}
