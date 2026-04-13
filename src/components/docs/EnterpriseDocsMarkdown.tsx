/**
 * EnterpriseDocsMarkdown — Enterprise-grade markdown renderer
 * Inter/JetBrains Mono typography, copy-to-clipboard, language labels,
 * auto-generated heading anchors for TOC linking.
 */

import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';

interface EnterpriseDocsMarkdownProps {
  content: string;
  className?: string;
  onHeadingsDetected?: (headings: { id: string; text: string; level: number }[]) => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function CodeBlock({ children, className: codeClass }: { children: React.ReactNode; className?: string }) {
  const [copied, setCopied] = useState(false);
  const lang = codeClass?.replace(/language-/, '') ?? '';
  const text = String(children).replace(/\n$/, '');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);

  return (
    <div className="group relative my-6 rounded-xl border border-border bg-[hsl(var(--muted)/0.6)] overflow-hidden">
      {/* Language label + copy button */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-[hsl(var(--muted)/0.4)]">
        <span className="text-[11px] font-mono font-medium text-muted-foreground uppercase tracking-wider">
          {lang || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-green-500" />
              <span className="text-green-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span className="opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 sm:p-5 overflow-x-auto">
        <code className="block text-[13px] font-mono leading-relaxed text-foreground/90">
          {children}
        </code>
      </pre>
    </div>
  );
}

export function EnterpriseDocsMarkdown({ content, className, onHeadingsDetected }: EnterpriseDocsMarkdownProps) {
  // Extract headings on first render for TOC
  const headingsCollected: { id: string; text: string; level: number }[] = [];
  let headingsReported = false;

  const reportHeadings = () => {
    if (!headingsReported && onHeadingsDetected && headingsCollected.length > 0) {
      headingsReported = true;
      // Defer to avoid setState during render
      setTimeout(() => onHeadingsDetected(headingsCollected), 0);
    }
  };

  return (
    <article className={cn('enterprise-docs-markdown max-w-none', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => {
            const text = String(children);
            const id = slugify(text);
            headingsCollected.push({ id, text, level: 1 });
            reportHeadings();
            return (
              <h1 id={id} className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight border-b border-border pb-4 mb-8 scroll-mt-24">
                {children}
              </h1>
            );
          },
          h2: ({ children }) => {
            const text = String(children);
            const id = slugify(text);
            headingsCollected.push({ id, text, level: 2 });
            reportHeadings();
            return (
              <h2 id={id} className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight mt-14 mb-5 pt-8 border-t border-border/40 first:border-t-0 first:pt-0 first:mt-0 scroll-mt-24">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const text = String(children);
            const id = slugify(text);
            headingsCollected.push({ id, text, level: 3 });
            reportHeadings();
            return (
              <h3 id={id} className="text-lg sm:text-xl font-semibold text-foreground tracking-tight mt-10 mb-4 scroll-mt-24">
                {children}
              </h3>
            );
          },
          h4: ({ children }) => (
            <h4 className="text-base sm:text-lg font-semibold text-foreground mt-8 mb-3">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-[15px] sm:text-base text-foreground/90 leading-[1.85] mb-5 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-muted-foreground">{children}</em>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="text-primary font-medium underline underline-offset-3 decoration-primary/30 hover:decoration-primary/70 transition-colors"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2.5 mb-6 pl-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2.5 mb-6 pl-1 list-decimal list-inside marker:text-primary/50 marker:font-semibold">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-[15px] sm:text-base text-foreground/90 leading-[1.75] flex gap-2.5">
              <span className="text-primary/50 mt-[3px] shrink-0 text-sm">•</span>
              <span className="flex-1">{children}</span>
            </li>
          ),
          code: ({ children, className: codeClass }) => {
            const isBlock = !!codeClass;
            if (!isBlock) {
              return (
                <code className="px-1.5 py-0.5 rounded-md text-[13px] font-mono bg-primary/8 text-primary border border-primary/10">
                  {children}
                </code>
              );
            }
            return <CodeBlock className={codeClass}>{children}</CodeBlock>;
          },
          pre: ({ children }) => {
            // If children is a CodeBlock, render directly (no extra wrapper)
            return <>{children}</>;
          },
          blockquote: ({ children }) => (
            <blockquote className="my-7 pl-5 border-l-[3px] border-primary/40 bg-primary/[0.04] rounded-r-xl py-4 px-5">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-10 border-t border-border/50" />
          ),
          table: ({ children }) => (
            <div className="my-7 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-[11px] font-semibold text-foreground uppercase tracking-wider border-b border-border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-[14px] text-foreground/90 border-b border-border/40 leading-relaxed">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-muted/20 transition-colors">{children}</tr>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}

export default EnterpriseDocsMarkdown;
