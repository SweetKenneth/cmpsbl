/**
 * usePrintDocument — Hook for generating printable/PDF documents
 */

import { useCallback } from "react";
import { toast } from "sonner";

interface PrintDocumentOptions {
  content: string;
  title: string;
  docId: string;
}

export function usePrintDocument() {
  const printDocument = useCallback(({ content, title, docId }: PrintDocumentOptions) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      toast.error("Please allow popups to download documents");
      return;
    }

    // Generate print-optimized HTML
    const printHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — CMPSBL® Documentation</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    @page {
      size: A4;
      margin: 20mm;
    }
    
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .page-break {
        page-break-before: always;
      }
      
      h2, h3, h4 {
        page-break-after: avoid;
      }
      
      table, pre, blockquote {
        page-break-inside: avoid;
      }
    }
    
    body {
      font-family: 'Merriweather', Georgia, serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      background: white;
      max-width: 210mm;
      margin: 0 auto;
      padding: 20mm;
    }
    
    .header {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .header-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    
    .brand {
      font-family: 'Inter', sans-serif;
      font-size: 9pt;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: #6b7280;
    }
    
    .doc-id {
      font-family: 'Inter', sans-serif;
      font-size: 9pt;
      color: #9ca3af;
    }
    
    .doc-title {
      font-size: 24pt;
      font-weight: 700;
      color: #111827;
      line-height: 1.2;
      margin-bottom: 0.75rem;
    }
    
    .doc-meta {
      font-family: 'Inter', sans-serif;
      font-size: 9pt;
      color: #6b7280;
    }
    
    h1 {
      font-size: 20pt;
      font-weight: 700;
      color: #111827;
      margin: 2rem 0 1rem;
      padding-bottom: 0.5rem;
      border-bottom: 1px solid #e5e7eb;
    }
    
    h2 {
      font-size: 16pt;
      font-weight: 700;
      color: #1f2937;
      margin: 1.75rem 0 0.75rem;
      padding-top: 1rem;
      border-top: 1px solid #f3f4f6;
    }
    
    h3 {
      font-size: 13pt;
      font-weight: 600;
      color: #374151;
      margin: 1.5rem 0 0.5rem;
    }
    
    h4 {
      font-size: 11pt;
      font-weight: 600;
      color: #4b5563;
      margin: 1.25rem 0 0.5rem;
    }
    
    p {
      margin-bottom: 1rem;
      text-align: justify;
      hyphens: auto;
    }
    
    ul, ol {
      margin: 1rem 0;
      padding-left: 1.5rem;
    }
    
    li {
      margin-bottom: 0.5rem;
    }
    
    strong {
      font-weight: 700;
      color: #111827;
    }
    
    em {
      font-style: italic;
    }
    
    a {
      color: #1f2937;
      text-decoration: underline;
      text-underline-offset: 2px;
    }
    
    blockquote {
      margin: 1.5rem 0;
      padding: 1rem 1.5rem;
      border-left: 4px solid #d1d5db;
      background: #f9fafb;
      font-style: italic;
      color: #4b5563;
    }
    
    blockquote p {
      margin: 0;
    }
    
    hr {
      border: none;
      border-top: 1px solid #e5e7eb;
      margin: 2rem 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
      font-size: 10pt;
    }
    
    th {
      background: #f3f4f6;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      text-align: left;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      color: #374151;
    }
    
    td {
      padding: 0.75rem;
      border: 1px solid #e5e7eb;
      vertical-align: top;
    }
    
    tr:nth-child(even) {
      background: #fafafa;
    }
    
    code {
      font-family: 'SF Mono', Consolas, monospace;
      font-size: 9pt;
      background: #f3f4f6;
      padding: 0.15rem 0.4rem;
      border-radius: 3px;
      color: #1f2937;
    }
    
    pre {
      margin: 1.5rem 0;
      padding: 1rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      overflow-x: auto;
      font-size: 9pt;
      line-height: 1.5;
    }
    
    pre code {
      background: none;
      padding: 0;
      border-radius: 0;
    }
    
    .footer {
      margin-top: 3rem;
      padding-top: 1.5rem;
      border-top: 1px solid #e5e7eb;
      text-align: center;
    }
    
    .footer-text {
      font-family: 'Inter', sans-serif;
      font-size: 8pt;
      color: #9ca3af;
    }
    
    /* Print button - hidden on print */
    .print-controls {
      position: fixed;
      top: 20px;
      right: 20px;
      display: flex;
      gap: 8px;
      z-index: 1000;
    }
    
    .print-btn {
      font-family: 'Inter', sans-serif;
      padding: 10px 20px;
      font-size: 13px;
      font-weight: 500;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    }
    
    .print-btn-primary {
      background: #2563eb;
      color: white;
    }
    
    .print-btn-primary:hover {
      background: #1d4ed8;
    }
    
    .print-btn-secondary {
      background: #f3f4f6;
      color: #374151;
    }
    
    .print-btn-secondary:hover {
      background: #e5e7eb;
    }
    
    @media print {
      .print-controls {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="print-controls">
    <button class="print-btn print-btn-primary" onclick="window.print()">
      📄 Print / Save as PDF
    </button>
    <button class="print-btn print-btn-secondary" onclick="window.close()">
      ✕ Close
    </button>
  </div>
  
  <header class="header">
    <div class="header-meta">
      <span class="brand">CMPSBL® Documentation</span>
      <span class="doc-id">Document ${docId}</span>
    </div>
    <h1 class="doc-title">${title}</h1>
    <div class="doc-meta">
      Version 7.0 • ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })}
    </div>
  </header>
  
  <article class="content">
    ${convertMarkdownToHTML(content)}
  </article>
  
  <footer class="footer">
    <div class="footer-text">
      © ${new Date().getFullYear()} CMPSBL® — Cognitive Infrastructure Layer for AI
    </div>
    <div class="footer-text" style="margin-top: 4px;">
      cmpsbl.ai • Confidential
    </div>
  </footer>
</body>
</html>
    `;

    printWindow.document.write(printHTML);
    printWindow.document.close();
    
    toast.success("Document opened for printing", {
      description: "Click 'Print / Save as PDF' to download"
    });
  }, []);

  return { printDocument };
}

// Simple markdown to HTML converter for print
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown;
  
  // Escape HTML entities first
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  
  // Bold and italic
  html = html.replace(/\*\*\*(.*?)\*\*\*/gim, '<strong><em>$1</em></strong>');
  html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/gim, '<em>$1</em>');
  
  // Code blocks
  html = html.replace(/```[\w]*\n([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
  html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');
  
  // Blockquotes
  html = html.replace(/^\s*&gt;\s*(.*$)/gim, '<blockquote><p>$1</p></blockquote>');
  
  // Horizontal rules
  html = html.replace(/^---$/gim, '<hr>');
  html = html.replace(/^\*\*\*$/gim, '<hr>');
  
  // Tables
  html = html.replace(/^\|(.+)\|$/gim, (match, content) => {
    if (content.match(/^[\s\-|:]+$/)) return ''; // Skip separator row
    const cells = content.split('|').map((cell: string) => cell.trim());
    const isHeader = markdown.indexOf(match) < markdown.indexOf('|---');
    const tag = isHeader ? 'th' : 'td';
    return `<tr>${cells.map((cell: string) => `<${tag}>${cell}</${tag}>`).join('')}</tr>`;
  });
  
  // Wrap table rows
  html = html.replace(/(<tr>.*<\/tr>\n?)+/gim, '<table>$&</table>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');
  
  // Unordered lists
  html = html.replace(/^\s*[-*]\s+(.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/gim, '<ul>$&</ul>');
  
  // Ordered lists  
  html = html.replace(/^\s*\d+\.\s+(.*$)/gim, '<li>$1</li>');
  
  // Paragraphs (lines with content that aren't already wrapped)
  html = html.split('\n\n').map(block => {
    if (block.trim() && !block.match(/^<[a-z]/i)) {
      return `<p>${block.replace(/\n/g, ' ')}</p>`;
    }
    return block;
  }).join('\n');
  
  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');
  
  return html;
}
