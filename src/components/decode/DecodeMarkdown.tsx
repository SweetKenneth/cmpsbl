/**
 * Decode Markdown Renderer
 * Renders markdown content in DECODE chat bubbles with substrate-aware styling.
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface DecodeMarkdownProps {
  content: string;
  className?: string;
  /** Whether this is a user message (applies inverted styling) */
  isUser?: boolean;
}

export function DecodeMarkdown({ content, className, isUser = false }: DecodeMarkdownProps) {
  return (
    <div className={cn('decode-markdown', isUser && 'decode-markdown--user', className)}>
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        p: ({ children }) => (
          <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>
        ),
        strong: ({ children }) => (
          <strong className={cn('font-semibold', isUser ? 'text-primary-foreground' : 'text-foreground')}>
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className="italic opacity-90">{children}</em>
        ),
        code: ({ children, className: codeClass }) => {
          const isInline = !codeClass;
          if (isInline) {
            return (
              <code className={cn(
                'px-1 py-0.5 rounded text-xs font-mono',
                isUser
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-primary/10 text-primary'
              )}>
                {children}
              </code>
            );
          }
          return (
            <code className={cn('block p-2 rounded-lg text-xs font-mono my-1.5 overflow-x-auto',
              isUser
                ? 'bg-primary-foreground/15 text-primary-foreground'
                : 'bg-muted text-foreground border border-border/40'
            )}>
              {children}
            </code>
          );
        },
        pre: ({ children }) => (
          <pre className="my-1.5 overflow-x-auto">{children}</pre>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside space-y-0.5 mb-1.5 last:mb-0 text-sm">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside space-y-0.5 mb-1.5 last:mb-0 text-sm">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="leading-relaxed">{children}</li>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'underline underline-offset-2',
              isUser ? 'text-primary-foreground/90 hover:text-primary-foreground' : 'text-primary hover:text-primary/80'
            )}
          >
            {children}
          </a>
        ),
        blockquote: ({ children }) => (
          <blockquote className={cn(
            'border-l-2 pl-3 my-1.5 italic opacity-80',
            isUser ? 'border-primary-foreground/40' : 'border-primary/40'
          )}>
            {children}
          </blockquote>
        ),
        h1: ({ children }) => <h1 className="text-base font-bold mb-1">{children}</h1>,
        h2: ({ children }) => <h2 className="text-sm font-bold mb-1">{children}</h2>,
        h3: ({ children }) => <h3 className="text-sm font-semibold mb-0.5">{children}</h3>,
        hr: () => <hr className={cn('my-2 border-t', isUser ? 'border-primary-foreground/20' : 'border-border/50')} />,
        table: ({ children }) => (
          <div className="overflow-x-auto my-1.5">
            <table className="text-xs w-full border-collapse">{children}</table>
          </div>
        ),
        th: ({ children }) => (
          <th className={cn(
            'px-2 py-1 text-left font-semibold border-b',
            isUser ? 'border-primary-foreground/20' : 'border-border/50'
          )}>
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className={cn(
            'px-2 py-1 border-b',
            isUser ? 'border-primary-foreground/10' : 'border-border/30'
          )}>
            {children}
          </td>
        ),
      }}
    />
    </div>
  );
}

export default DecodeMarkdown;
