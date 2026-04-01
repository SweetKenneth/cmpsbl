/**
 * DocsMarkdown — Shared markdown renderer for documentation readers.
 * Provides well-spaced headers, readable tables, styled code blocks,
 * and proper section separation for both /docs/system and /docs/users.
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface DocsMarkdownProps {
  content: string;
  className?: string;
}

export function DocsMarkdown({ content, className }: DocsMarkdownProps) {
  return (
    <article className={cn('docs-markdown', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight border-b border-border pb-4 mb-8">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground tracking-tight mt-12 mb-5 pt-6 border-t border-border/50 first:border-t-0 first:pt-0 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight mt-8 mb-4">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base sm:text-lg font-semibold text-foreground mt-6 mb-3">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-[15px] sm:text-base text-foreground leading-[1.8] mb-4 last:mb-0">
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
              className="text-primary font-medium underline underline-offset-2 decoration-primary/30 hover:decoration-primary transition-colors"
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 mb-5 pl-1">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-2 mb-5 pl-1 list-decimal list-inside">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-[15px] sm:text-base text-foreground leading-[1.7] flex gap-2">
              <span className="text-primary/60 mt-[2px] shrink-0">•</span>
              <span>{children}</span>
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
            return (
              <code className="block text-[13px] font-mono leading-relaxed">
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="my-6 p-4 sm:p-5 rounded-xl bg-muted/80 border border-border overflow-x-auto text-sm leading-relaxed">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="my-6 pl-4 sm:pl-5 border-l-[3px] border-primary/30 bg-primary/[0.03] rounded-r-lg py-3 px-4">
              {children}
            </blockquote>
          ),
          hr: () => (
            <hr className="my-8 border-t border-border/60" />
          ),
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-sm border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/60">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-left text-xs font-semibold text-foreground uppercase tracking-wider border-b border-border">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 text-[14px] text-foreground border-b border-border/50 leading-relaxed">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-muted/30 transition-colors">{children}</tr>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}

export default DocsMarkdown;
