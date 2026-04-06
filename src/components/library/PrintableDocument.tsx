/**
 * PrintableDocument — Beautiful print-optimized document format
 * Generates a clean, professional document for printing/PDF
 */

import { useRef, forwardRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PrintableDocumentProps {
  content: string;
  title: string;
  docId: string;
}

export const PrintableDocument = forwardRef<HTMLDivElement, PrintableDocumentProps>(
  ({ content, title, docId }, ref) => {
    return (
      <div 
        ref={ref}
        className="printable-document bg-white text-black font-serif"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '20mm',
          boxSizing: 'border-box',
        }}
      >
        {/* Header */}
        <header className="mb-8 pb-6 border-b-2 border-gray-300">
          <div className="flex items-center justify-between mb-4">
            <div className="text-xs uppercase tracking-widest text-gray-500 font-sans">
              CMPSBL® Documentation
            </div>
            <div className="text-xs text-gray-500 font-sans">
              Document {docId}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 leading-tight">
            {title}
          </h1>
          <div className="mt-3 text-sm text-gray-500 font-sans">
            Version 7.0 • {new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
        </header>

        {/* Content */}
        <article className="print-content prose prose-sm max-w-none">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({children}) => (
                <h1 className="text-2xl font-bold text-gray-900 mt-8 mb-4 pb-2 border-b border-gray-200">
                  {children}
                </h1>
              ),
              h2: ({children}) => (
                <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3 pt-4">
                  {children}
                </h2>
              ),
              h3: ({children}) => (
                <h3 className="text-lg font-semibold text-gray-800 mt-5 mb-2">
                  {children}
                </h3>
              ),
              h4: ({children}) => (
                <h4 className="text-base font-semibold text-gray-700 mt-4 mb-2">
                  {children}
                </h4>
              ),
              p: ({children}) => (
                <p className="text-sm leading-relaxed text-gray-700 mb-4">
                  {children}
                </p>
              ),
              ul: ({children}) => (
                <ul className="my-3 ml-4 space-y-1 list-disc">
                  {children}
                </ul>
              ),
              ol: ({children}) => (
                <ol className="my-3 ml-4 space-y-1 list-decimal">
                  {children}
                </ol>
              ),
              li: ({children}) => (
                <li className="text-sm text-gray-700 leading-relaxed pl-1">
                  {children}
                </li>
              ),
              strong: ({children}) => (
                <strong className="font-bold text-gray-900">{children}</strong>
              ),
              em: ({children}) => (
                <em className="italic">{children}</em>
              ),
              a: ({href, children}) => (
                <span className="text-gray-900 font-medium underline">
                  {children}
                </span>
              ),
              blockquote: ({children}) => (
                <blockquote className="my-4 pl-4 border-l-4 border-gray-300 italic text-gray-600 text-sm">
                  {children}
                </blockquote>
              ),
              hr: () => (
                <hr className="my-6 border-t border-gray-300" />
              ),
              table: ({children}) => (
                <div className="my-4 overflow-hidden">
                  <table className="w-full text-sm border border-gray-300">
                    {children}
                  </table>
                </div>
              ),
              thead: ({children}) => (
                <thead className="bg-gray-100">
                  {children}
                </thead>
              ),
              th: ({children}) => (
                <th className="px-3 py-2 text-left font-semibold text-gray-800 text-xs border border-gray-300">
                  {children}
                </th>
              ),
              td: ({children}) => (
                <td className="px-3 py-2 text-gray-700 text-xs border border-gray-300">
                  {children}
                </td>
              ),
              code: ({className, children}) => {
                const isBlock = className?.includes('language-');
                if (isBlock) {
                  return (
                    <code className="block text-xs font-mono">
                      {children}
                    </code>
                  );
                }
                return (
                  <code className="bg-gray-100 text-gray-800 px-1 py-0.5 rounded text-xs font-mono">
                    {children}
                  </code>
                );
              },
              pre: ({children}) => (
                <pre className="my-4 p-4 bg-gray-50 border border-gray-200 rounded text-xs overflow-x-auto font-mono">
                  {children}
                </pre>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </article>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-gray-200 text-center">
          <div className="text-xs text-gray-400 font-sans">
            © {new Date().getFullYear()} CMPSBL® — Cognitive Infrastructure Layer for AI
          </div>
          <div className="mt-1 text-xs text-gray-400 font-sans">
            cmpsbl.com • Confidential
          </div>
        </footer>
      </div>
    );
  }
);

PrintableDocument.displayName = "PrintableDocument";
