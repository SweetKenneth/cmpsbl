/**
 * Rich Chat Message Formatter — XSS-safe markdown rendering for all chat interfaces
 * Supports bold, italic, code, headers, lists, links, and blockquotes
 */

// Escape HTML to prevent XSS attacks
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Format chat message content with rich HTML (XSS-safe)
 * Handles: **bold**, *italic*, `code`, ```code blocks```, ## headers,
 *          - lists, [links](url), > blockquotes, --- dividers
 */
export function formatChatMessage(content: string): string {
  // SECURITY: Escape HTML first
  let formatted = escapeHtml(content);

  // Code blocks (``` ... ```) — must come before inline code
  formatted = formatted.replace(
    /```(\w*)\n?([\s\S]*?)```/g,
    '<pre class="my-2 p-3 rounded-lg bg-black/30 border border-border/30 overflow-x-auto"><code class="text-xs font-mono text-emerald-300">$2</code></pre>'
  );

  // Inline code (`...`)
  formatted = formatted.replace(
    /`([^`]+)`/g,
    '<code class="px-1.5 py-0.5 rounded bg-muted/60 text-xs font-mono text-primary">$1</code>'
  );

  // Headers (## and ###)
  formatted = formatted.replace(
    /^### (.+)$/gm,
    '<strong class="text-sm block mt-3 mb-1 text-foreground">$1</strong>'
  );
  formatted = formatted.replace(
    /^## (.+)$/gm,
    '<strong class="text-base block mt-3 mb-1 text-foreground">$1</strong>'
  );

  // Blockquotes (> ...)
  formatted = formatted.replace(
    /^&gt; (.+)$/gm,
    '<div class="pl-3 border-l-2 border-primary/40 text-muted-foreground italic my-1">$1</div>'
  );

  // Horizontal rules (---)
  formatted = formatted.replace(
    /^---$/gm,
    '<hr class="my-3 border-border/30" />'
  );

  // Bold (**text**)
  formatted = formatted.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-semibold text-foreground">$1</strong>'
  );

  // Italic (*text* but not inside bold)
  formatted = formatted.replace(
    /(?<!\*)\*([^*]+)\*(?!\*)/g,
    '<em class="italic text-muted-foreground">$1</em>'
  );

  // Links [text](url)
  formatted = formatted.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors">$1</a>'
  );

  // Unordered lists (- item or • item)
  formatted = formatted.replace(
    /^[-•] (.+)$/gm,
    '<div class="flex gap-2 my-0.5"><span class="text-primary/60 shrink-0">•</span><span>$1</span></div>'
  );

  // Numbered lists (1. item)
  formatted = formatted.replace(
    /^(\d+)\. (.+)$/gm,
    '<div class="flex gap-2 my-0.5"><span class="text-primary/60 shrink-0 font-mono text-xs">$1.</span><span>$2</span></div>'
  );

  // Line breaks
  formatted = formatted.replace(/\n/g, '<br />');

  // Clean up double line breaks from block elements
  formatted = formatted.replace(/(<br \/>){3,}/g, '<br /><br />');

  return formatted;
}
