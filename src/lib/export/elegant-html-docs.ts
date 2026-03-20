/**
 * Elegant HTML Document Generator
 * Produces beautifully styled, print-ready HTML documents for all exported bundles.
 * Shared across pipeline exports, bot exports, and discovery bundles.
 */

const DOCUMENT_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@300;400;500&display=swap');
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: A4; margin: 2cm 2.5cm; }
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: #faf9f6;
      color: #1a1a1f;
      line-height: 1.75;
      font-size: 12.5px;
      -webkit-font-smoothing: antialiased;
      overflow-wrap: break-word;
    }
    .page {
      max-width: 740px;
      margin: 0 auto;
      padding: 4rem;
      background: white;
      min-height: 100vh;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 20px 60px rgba(0,0,0,0.06);
    }
    @media print { body { background: white; } .page { box-shadow: none; padding: 0; max-width: 100%; } }
    @media (max-width: 680px) { .page { padding: 2rem 1.5rem; } }
    .doc-header {
      text-align: center;
      padding-bottom: 2.5rem;
      border-bottom: 2px solid #1a1a1f;
      margin-bottom: 2.5rem;
    }
    .doc-header .issuer {
      font-size: 0.6rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3em;
      color: #9b9baa;
      margin-bottom: 1.5rem;
    }
    .doc-title {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.8rem;
      font-weight: 600;
      letter-spacing: -0.01em;
      line-height: 1.25;
      word-break: break-word;
      overflow-wrap: break-word;
      hyphens: auto;
      max-width: 100%;
    }
    .doc-subtitle {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.05rem;
      font-style: italic;
      color: #6b6b78;
      margin-top: 0.5rem;
    }
    .seal-area { display: flex; justify-content: center; margin: -1rem 0 2rem; }
    .seal-badge {
      width: 90px; height: 90px;
      border-radius: 50%;
      border: 2px solid #c9a84c;
      background: radial-gradient(circle at 40% 35%, rgba(201,168,76,0.12), rgba(201,168,76,0.03));
      display: flex; align-items: center; justify-content: center; flex-direction: column;
      box-shadow: 0 2px 12px rgba(201,168,76,0.15);
    }
    .seal-badge .mark {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 0.7rem; font-weight: 700; color: #c9a84c; letter-spacing: 0.15em;
    }
    .seal-badge .year { font-size: 0.55rem; color: #c9a84c; opacity: 0.7; letter-spacing: 0.1em; }
    h2 {
      font-family: 'Cormorant Garamond', Georgia, serif;
      font-size: 1.15rem; font-weight: 600;
      margin: 2.2rem 0 0.8rem; padding-bottom: 0.4rem;
      border-bottom: 1px solid rgba(26,26,31,0.1);
    }
    h2 .num { font-size: 0.7rem; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; color: #9b9baa; margin-right: 0.5rem; }
    p { margin-bottom: 0.9rem; color: #3a3a42; }
    .indent { padding-left: 1.5rem; }
    .highlight {
      background: #faf5e8; border-left: 3px solid #c9a84c;
      padding: 0.9rem 1.25rem; border-radius: 0 4px 4px 0; margin: 1rem 0; font-size: 0.88rem;
    }
    .highlight strong { color: #1a1a1f; }
    .disclaimer-block {
      background: #f8f8f6; border: 1px solid rgba(26,26,31,0.08); border-radius: 4px;
      padding: 1.25rem 1.5rem; margin: 1.5rem 0; font-size: 0.82rem;
      color: #6b6b78; text-transform: uppercase; letter-spacing: 0.02em; line-height: 1.85;
    }
    .colophon {
      margin-top: 3rem; padding-top: 2rem; border-top: 2px solid #1a1a1f;
      display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 1rem;
    }
    .colophon-left { font-size: 0.72rem; color: #9b9baa; line-height: 1.8; }
    .colophon-right { font-family: 'Cormorant Garamond', Georgia, serif; font-size: 1.1rem; font-weight: 600; color: #9b9baa; }
    .section-card {
      background: #faf9f6; border: 1px solid rgba(26,26,31,0.1); border-radius: 6px;
      padding: 1.5rem 1.75rem; margin-bottom: 1.25rem;
    }
    .section-card p:last-child { margin-bottom: 0; }
    .meta-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 1rem; margin: 1rem 0;
    }
    .meta-item-label { font-size: 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: #9b9baa; }
    .meta-item-value { font-size: 0.88rem; font-weight: 500; color: #1a1a1f; margin-top: 0.15rem; }
    code { font-family: 'JetBrains Mono', monospace; font-size: 0.85em; background: #f0ede6; padding: 0.1em 0.4em; border-radius: 3px; }
    .file-list { list-style: none; padding: 0; }
    .file-list li {
      padding: 0.5rem 0; border-bottom: 1px solid rgba(26,26,31,0.06);
      font-size: 0.88rem; color: #3a3a42;
      display: flex; gap: 0.75rem; align-items: baseline;
    }
    .file-list li:last-child { border-bottom: none; }
    .file-list .fname { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 500; color: #1a1a1f; min-width: 160px; }
    .ornament { text-align: center; font-size: 1.2rem; color: rgba(26,26,31,0.2); margin: 2rem 0; letter-spacing: 0.5em; }
`;

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

const year = () => new Date().getFullYear();
const dateStr = () => new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

/**
 * Generate a beautifully styled HTML README for any export bundle
 */
export function generateReadmeHTML(opts: {
  name: string;
  description: string;
  files: { name: string; purpose: string }[];
  quickStart?: string;
  category?: string;
  modules?: string[];
  version?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${esc(opts.name)} — Documentation</title>
  <style>${DOCUMENT_STYLES}</style>
</head>
<body>
<div class="page">

  <header class="doc-header">
    <div class="issuer">CMPSBL® · Export Documentation</div>
    <div class="doc-title">${esc(opts.name)}</div>
    <div class="doc-subtitle">${esc(opts.description)}</div>
  </header>

  <div class="seal-area">
    <div class="seal-badge">
      <div class="mark">CMPSBL®</div>
      <div class="year">${year()}</div>
    </div>
  </div>

  <div class="meta-grid">
    ${opts.category ? `<div><div class="meta-item-label">Category</div><div class="meta-item-value">${esc(opts.category)}</div></div>` : ''}
    ${opts.version ? `<div><div class="meta-item-label">Version</div><div class="meta-item-value">${esc(opts.version)}</div></div>` : ''}
    <div><div class="meta-item-label">Exported</div><div class="meta-item-value">${dateStr()}</div></div>
    ${opts.modules?.length ? `<div><div class="meta-item-label">Systems</div><div class="meta-item-value">${opts.modules.join(' · ')}</div></div>` : ''}
  </div>

  <h2>About This Software</h2>
  <div class="section-card">
    <p>${esc(opts.description)}</p>
    <p style="font-size: 0.82rem; color: #6b6b78; font-style: italic;">
      This software was crystallized from the CMPSBL® Substrate. Each file is self-contained 
      and runs independently — no external runtime infrastructure is required for basic usage.
    </p>
  </div>

  <h2>Included Files</h2>
  <ul class="file-list">
    ${opts.files.map(f => `<li><span class="fname">${esc(f.name)}</span> <span>${esc(f.purpose)}</span></li>`).join('\n    ')}
  </ul>

  ${opts.quickStart ? `
  <h2>Quick Start</h2>
  <div class="section-card">
    <pre style="font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; line-height: 1.7; white-space: pre-wrap; color: #3a3a42;">${esc(opts.quickStart)}</pre>
  </div>` : ''}

  <div class="ornament">· · ·</div>

  <footer class="colophon">
    <div class="colophon-left">
      Generated by the CMPSBL® Export System<br>
      https://cmpsbl.com<br>
      © ${year()} CMPSBL®. All rights reserved.
    </div>
    <div class="colophon-right">CMPSBL®</div>
  </footer>

</div>
</body>
</html>`;
}

/**
 * Generate elegant HTML license for any CMPSBL export
 */
export function generateLicenseHTML(productName: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>License — ${esc(productName)}</title>
  <style>${DOCUMENT_STYLES}</style>
</head>
<body>
<div class="page">

  <div class="doc-header">
    <div class="issuer">CMPSBL® · promptfluid®</div>
    <div class="doc-title">Commercial Distribution License</div>
    <div class="doc-subtitle">Governing the use, modification, and distribution of exported pipeline software</div>
  </div>

  <div class="seal-area">
    <div class="seal-badge">
      <div class="mark">CMPSBL®</div>
      <div class="year">${year()}</div>
    </div>
  </div>

  <p style="text-align: center; font-size: 0.82rem; color: #6b6b78; margin-bottom: 2rem;">
    Issued ${dateStr()} for <strong style="color: #1a1a1f;">${esc(productName)}</strong>
  </p>

  <h2><span class="num">§1</span> Origin Notice</h2>
  <p>
    This software was crystallized and exported from the CMPSBL® Substrate, a cognitive 
    orchestration platform by promptfluid®. This software requires the included CMPSBL® 
    Micro-Substrate Runtime to function. The runtime is proprietary to CMPSBL® and may not 
    be separated, reverse-engineered, or redistributed independently of this package.
  </p>

  <h2><span class="num">§2</span> Grant of Rights</h2>
  <p>
    Subject to the conditions below, the licensee is granted a non-exclusive, worldwide 
    right to:
  </p>
  <p class="indent">
    <strong>(a)</strong> Use, modify, and integrate this software into derivative works.<br>
    <strong>(b)</strong> Sell, sublicense, or commercially distribute this software and derivative 
    works, provided that <em>all</em> of the following conditions are met.
  </p>

  <h2><span class="num">§3</span> Conditions</h2>

  <p><strong>3.1 — Attribution.</strong> Every distribution of this software, whether in original 
  or modified form, must include the following notice in a prominent location:</p>

  <div class="highlight">
    <strong>"Built with the CMPSBL® Substrate — https://cmpsbl.com<br>
    Powered by the CMPSBL® Micro-Substrate Runtime."</strong>
  </div>

  <p><strong>3.2 — Runtime Dependency.</strong> This software depends on the CMPSBL® Micro-Substrate 
  Runtime included in this package. The runtime must be included in all distributions. It may not 
  be replaced, stubbed out, or removed.</p>

  <p><strong>3.3 — License Preservation.</strong> This license file must be included, unmodified, 
  in every copy or distribution of this software.</p>

  <p><strong>3.4 — No Misrepresentation.</strong> You may not claim that this software was created 
  entirely by you or any party other than CMPSBL®. The substrate origin must be acknowledged.</p>

  <h2><span class="num">§4</span> Runtime License</h2>
  <p>
    The CMPSBL® Micro-Substrate Runtime (<code>standalone-runtime.ts</code>) is licensed 
    solely for use with software exported from the CMPSBL® Substrate. It may not be used, 
    copied, or distributed for any other purpose. The Discovery Engine, Memory Stream, and 
    Ascension Reactor are substrate-exclusive components and are never distributed.
  </p>

  <h2><span class="num">§5</span> Disclaimer of Warranty</h2>
  <div class="disclaimer-block">
    The software is provided "as is", without warranty of any kind, express or implied, 
    including but not limited to the warranties of merchantability, fitness for a particular 
    purpose and noninfringement. In no event shall CMPSBL® be liable for any claim, damages 
    or other liability.
  </div>

  <footer class="colophon">
    <div class="colophon-left">
      For licensing inquiries: legal@cmpsbl.com<br>
      https://cmpsbl.com<br>
      Copyright © ${year()} CMPSBL®. All rights reserved.
    </div>
    <div class="colophon-right">CMPSBL®</div>
  </footer>

</div>
</body>
</html>`;
}
