/**
 * CMPSBL® Install Wizard — Self-Contained HTML Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates a zero-dependency HTML file that ships inside every export.
 * Users open it locally to configure their agent on any stack.
 *
 * © 2025–2026 CMPSBL® · PromptFluid™. All rights reserved.
 */

import type { ExportKind } from './integration-guide-generator';

export interface InstallWizardInput {
  kind: ExportKind;
  name: string;
  slug: string;
  version?: string;
  score?: number;
  tier?: string;
  languages?: string[];
  modules?: string[];
  hasMemory?: boolean;
  hasDream?: boolean;
}

/**
 * Generate a self-contained HTML install wizard for the export bundle.
 * Ships to docs/html/install-wizard.html inside every ZIP.
 */
export function generateInstallWizardHtml(input: InstallWizardInput): string {
  const {
    name,
    slug,
    kind,
    version = '1.0.0',
    score = 0,
    tier = 'Raw',
    languages = ['typescript'],
    modules = ['SYSTEM'],
    hasMemory = true,
    hasDream = false,
  } = input;

  const langOptions = buildLanguageOptions(languages);
  const envVars = buildEnvVars(hasMemory, hasDream);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Install — ${esc(name)} · CMPSBL®</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
  *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
  :root{--bg:#0d0d12;--surface:#16161e;--surface2:#1e1e28;--border:#2a2a38;--text:#e8e8ef;--muted:#7a7a8e;--gold:#c9a84c;--gold-dim:rgba(201,168,76,0.15);--green:#4ade80;--blue:#60a5fa;--red:#f87171;--radius:8px}
  body{font-family:'Inter',system-ui,sans-serif;background:var(--bg);color:var(--text);line-height:1.6;font-size:14px;-webkit-font-smoothing:antialiased;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:2rem 1rem}
  .wizard{max-width:680px;width:100%;background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden}
  .wizard-header{padding:2rem 2rem 1.5rem;border-bottom:1px solid var(--border);text-align:center}
  .wizard-header .issuer{font-size:0.6rem;font-weight:600;text-transform:uppercase;letter-spacing:0.3em;color:var(--muted);margin-bottom:0.75rem}
  .wizard-header h1{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.6rem;font-weight:600;letter-spacing:-0.01em}
  .wizard-header .meta{font-size:0.75rem;color:var(--muted);margin-top:0.5rem}
  .wizard-header .meta span{margin:0 0.5rem}
  .badge{display:inline-block;padding:0.15rem 0.5rem;border-radius:3px;font-size:0.65rem;font-weight:600;text-transform:uppercase;letter-spacing:0.08em}
  .badge-gold{background:var(--gold-dim);color:var(--gold);border:1px solid rgba(201,168,76,0.3)}

  .steps{padding:0 2rem 2rem}
  .step{display:none;animation:fadeIn 0.3s ease}
  .step.active{display:block}
  @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

  .step-indicator{display:flex;justify-content:center;gap:0.5rem;padding:1.5rem 0 1rem}
  .dot{width:8px;height:8px;border-radius:50%;background:var(--border);transition:all 0.3s}
  .dot.active{background:var(--gold);box-shadow:0 0 8px rgba(201,168,76,0.4)}
  .dot.done{background:var(--green)}

  h2{font-family:'Cormorant Garamond',Georgia,serif;font-size:1.15rem;font-weight:600;margin:1.5rem 0 0.75rem}
  p{color:var(--muted);margin-bottom:1rem;font-size:0.85rem}

  .option-grid{display:grid;gap:0.75rem;margin:1rem 0}
  .option{padding:1rem;border:1px solid var(--border);border-radius:var(--radius);cursor:pointer;transition:all 0.2s}
  .option:hover{border-color:var(--gold);background:var(--gold-dim)}
  .option.selected{border-color:var(--gold);background:var(--gold-dim)}
  .option .label{font-weight:500;margin-bottom:0.25rem}
  .option .desc{font-size:0.75rem;color:var(--muted)}

  .code-block{background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:1rem;font-family:'JetBrains Mono',monospace;font-size:0.78rem;line-height:1.7;overflow-x:auto;position:relative;margin:0.75rem 0}
  .code-block .copy-btn{position:absolute;top:0.5rem;right:0.5rem;background:var(--surface2);border:1px solid var(--border);color:var(--muted);padding:0.25rem 0.5rem;border-radius:4px;cursor:pointer;font-size:0.65rem;font-family:inherit}
  .code-block .copy-btn:hover{color:var(--text);border-color:var(--gold)}

  .env-table{width:100%;border-collapse:collapse;margin:0.75rem 0;font-size:0.78rem}
  .env-table th{text-align:left;padding:0.5rem;border-bottom:1px solid var(--border);color:var(--muted);font-weight:500;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.05em}
  .env-table td{padding:0.5rem;border-bottom:1px solid rgba(42,42,56,0.5)}
  .env-table td:first-child{font-family:'JetBrains Mono',monospace;color:var(--gold);font-size:0.75rem}

  .btn-row{display:flex;gap:0.75rem;margin-top:1.5rem}
  .btn{flex:1;padding:0.75rem;border-radius:var(--radius);font-size:0.85rem;font-weight:500;cursor:pointer;border:1px solid var(--border);background:var(--surface2);color:var(--text);transition:all 0.2s}
  .btn:hover{border-color:var(--gold)}
  .btn-primary{background:linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.1));border-color:var(--gold);color:var(--gold)}
  .btn-primary:hover{background:linear-gradient(135deg,rgba(201,168,76,0.3),rgba(201,168,76,0.15))}
  .btn:disabled{opacity:0.4;cursor:not-allowed}

  .check{color:var(--green);margin-right:0.5rem}
  .warn{color:#fbbf24;margin-right:0.5rem}

  .summary-card{background:var(--bg);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem;margin:1rem 0}
  .summary-card .row{display:flex;justify-content:space-between;padding:0.35rem 0;font-size:0.8rem}
  .summary-card .row .k{color:var(--muted)}
  .summary-card .row .v{font-weight:500}

  .footer{text-align:center;padding:1rem 2rem;border-top:1px solid var(--border);font-size:0.65rem;color:var(--muted)}
</style>
</head>
<body>
<div class="wizard">
  <div class="wizard-header">
    <div class="issuer">CMPSBL® Install Wizard</div>
    <h1>${esc(name)}</h1>
    <div class="meta">
      <span class="badge badge-gold">${esc(tier)}</span>
      <span>v${esc(version)}</span>
      <span>CJPI ${score}</span>
    </div>
  </div>

  <div class="step-indicator">
    <div class="dot active" data-step="0"></div>
    <div class="dot" data-step="1"></div>
    <div class="dot" data-step="2"></div>
    <div class="dot" data-step="3"></div>
  </div>

  <div class="steps">

    <!-- Step 0: Choose Client -->
    <div class="step active" data-step="0">
      <h2>1. Choose Your Client</h2>
      <p>Where will this ${esc(kind)} run?</p>
      <div class="option-grid" id="client-options">
        <div class="option" data-value="node" onclick="selectClient(this)">
          <div class="label">Node.js / Bun / Deno</div>
          <div class="desc">Server-side JavaScript/TypeScript runtime</div>
        </div>
        <div class="option" data-value="react" onclick="selectClient(this)">
          <div class="label">React / Next.js / Vite</div>
          <div class="desc">Frontend web application</div>
        </div>
        <div class="option" data-value="python" onclick="selectClient(this)">
          <div class="label">Python</div>
          <div class="desc">FastAPI, Django, Flask, or standalone scripts</div>
        </div>
        <div class="option" data-value="other" onclick="selectClient(this)">
          <div class="label">Other (REST API)</div>
          <div class="desc">Any language via HTTP — cURL, Go, Rust, Java, etc.</div>
        </div>
      </div>
      <div class="btn-row">
        <button class="btn btn-primary" id="btn-next-0" disabled onclick="goStep(1)">Next →</button>
      </div>
    </div>

    <!-- Step 1: Install -->
    <div class="step" data-step="1">
      <h2>2. Install</h2>
      <p>Copy and run the command for your environment.</p>
      <div id="install-commands"></div>
      <div class="btn-row">
        <button class="btn" onclick="goStep(0)">← Back</button>
        <button class="btn btn-primary" onclick="goStep(2)">Next →</button>
      </div>
    </div>

    <!-- Step 2: Configure -->
    <div class="step" data-step="2">
      <h2>3. Configure Environment</h2>
      <p>Set these variables in your <code>.env</code> or runtime config.</p>
      <table class="env-table">
        <thead><tr><th>Variable</th><th>Required</th><th>Description</th></tr></thead>
        <tbody id="env-rows"></tbody>
      </table>
      <div class="btn-row">
        <button class="btn" onclick="goStep(1)">← Back</button>
        <button class="btn btn-primary" onclick="goStep(3)">Next →</button>
      </div>
    </div>

    <!-- Step 3: Verify -->
    <div class="step" data-step="3">
      <h2>4. Verify Installation</h2>
      <p>Run the quickstart to confirm everything works.</p>
      <div id="verify-commands"></div>
      <div class="summary-card">
        <div class="row"><span class="k">Export</span><span class="v">${esc(name)}</span></div>
        <div class="row"><span class="k">Type</span><span class="v">${esc(kind)}</span></div>
        <div class="row"><span class="k">Tier</span><span class="v">${esc(tier)}</span></div>
        <div class="row"><span class="k">CJPI</span><span class="v">${score}/100</span></div>
        <div class="row"><span class="k">Primitives</span><span class="v">${modules.join(', ')}</span></div>
        <div class="row"><span class="k">Memory</span><span class="v">${hasMemory ? '✓ Persistent' : '○ Ephemeral'}</span></div>
        <div class="row"><span class="k">DREAM</span><span class="v">${hasDream ? '✓ Active' : '○ Inactive'}</span></div>
      </div>
      <div class="btn-row">
        <button class="btn" onclick="goStep(2)">← Back</button>
        <button class="btn btn-primary" onclick="markDone()">✓ Done</button>
      </div>
    </div>

  </div>

  <div class="footer">
    © CMPSBL® · PromptFluid™ · Generated ${new Date().toISOString().slice(0, 10)} · support@cmpsbl.com
  </div>
</div>

<script>
(function(){
  var state = { client: null, step: 0 };
  var slug = ${JSON.stringify(slug)};
  var kind = ${JSON.stringify(kind)};

  var installMap = {
    node: [
      { label: 'npm', cmd: 'npm install ./' + slug },
      { label: 'Or copy directly', cmd: 'cp -r ./src ./your-project/' + slug },
    ],
    react: [
      { label: 'npm', cmd: 'npm install ./' + slug },
      { label: 'Import', cmd: "import { " + slug.replace(/-/g,'') + " } from './" + slug + "/src';" },
    ],
    python: [
      { label: 'Install bridge', cmd: 'pip install cmpsbl-bridge' },
      { label: 'Copy source', cmd: 'cp -r ./' + slug + '/src ./your_project/' + slug.replace(/-/g,'_') },
    ],
    other: [
      { label: 'Copy bundle', cmd: 'cp -r ./' + slug + ' /your/project/vendor/' + slug },
      { label: 'REST endpoint', cmd: 'POST http://localhost:3000/api/' + slug + '/invoke' },
    ],
  };

  var verifyMap = {
    node:   'npx tsx ./' + slug + '/quickstart.ts',
    react:  'npm run dev  # then open http://localhost:5173',
    python: 'python -c "from ' + slug.replace(/-/g,'_') + ' import runtime; print(runtime.health())"',
    other:  'curl -X POST http://localhost:3000/api/' + slug + '/health',
  };

  window.selectClient = function(el) {
    document.querySelectorAll('#client-options .option').forEach(function(o){ o.classList.remove('selected'); });
    el.classList.add('selected');
    state.client = el.getAttribute('data-value');
    document.getElementById('btn-next-0').disabled = false;
  };

  window.goStep = function(n) {
    state.step = n;
    document.querySelectorAll('.step').forEach(function(s){ s.classList.remove('active'); });
    document.querySelector('.step[data-step="'+n+'"]').classList.add('active');
    document.querySelectorAll('.dot').forEach(function(d,i){
      d.classList.remove('active','done');
      if(i < n) d.classList.add('done');
      if(i === n) d.classList.add('active');
    });
    if(n === 1) renderInstall();
    if(n === 2) renderEnv();
    if(n === 3) renderVerify();
  };

  function codeBlock(cmd) {
    return '<div class="code-block"><button class="copy-btn" onclick="copyCode(this)">Copy</button>' + escHtml(cmd) + '</div>';
  }

  function renderInstall() {
    var cmds = installMap[state.client] || installMap.other;
    var html = '';
    cmds.forEach(function(c){ html += '<p style="color:var(--muted);font-size:0.8rem;margin-bottom:0.25rem">' + c.label + '</p>' + codeBlock(c.cmd); });
    document.getElementById('install-commands').innerHTML = html;
  }

  function renderEnv() {
    var rows = ${JSON.stringify(envVars)};
    var html = '';
    rows.forEach(function(r){ html += '<tr><td>' + r.name + '</td><td>' + (r.required ? '✓' : '—') + '</td><td style="color:var(--muted)">' + r.desc + '</td></tr>'; });
    document.getElementById('env-rows').innerHTML = html;
  }

  function renderVerify() {
    var cmd = verifyMap[state.client] || verifyMap.other;
    document.getElementById('verify-commands').innerHTML = codeBlock(cmd);
  }

  window.copyCode = function(btn) {
    var text = btn.parentNode.textContent.replace('Copy','').trim();
    if(navigator.clipboard) navigator.clipboard.writeText(text);
    btn.textContent = 'Copied!';
    setTimeout(function(){ btn.textContent = 'Copy'; }, 1500);
  };

  window.markDone = function() {
    document.querySelector('.steps').innerHTML = '<div style="text-align:center;padding:3rem 1rem"><div style="font-size:2.5rem;margin-bottom:1rem">✓</div><h2 style="color:var(--green)">Installation Complete</h2><p style="margin-top:0.75rem">Your ${esc(kind)} is ready. Check <code>quickstart.ts</code> for usage examples.</p><p style="margin-top:1rem;font-size:0.75rem">Need help? <a href="mailto:support@cmpsbl.com" style="color:var(--gold)">support@cmpsbl.com</a></p></div>';
    document.querySelectorAll('.dot').forEach(function(d){ d.classList.remove('active'); d.classList.add('done'); });
  };

  function escHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
})();
</script>
</body>
</html>`;
}

// ─── Helpers ────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildLanguageOptions(languages: string[]): string[] {
  const map: Record<string, string> = {
    typescript: 'TypeScript', javascript: 'JavaScript', python: 'Python',
    rust: 'Rust', go: 'Go', java: 'Java',
  };
  return languages.map(l => map[l.toLowerCase()] ?? l);
}

interface EnvVarRow {
  name: string;
  required: boolean;
  desc: string;
}

function buildEnvVars(hasMemory: boolean, hasDream: boolean): EnvVarRow[] {
  const vars: EnvVarRow[] = [
    { name: 'CMPSBL_API_KEY', required: true, desc: 'Your CMPSBL API key from cmpsbl.com/api-access' },
    { name: 'CMPSBL_ENDPOINT', required: false, desc: 'Custom substrate endpoint (optional)' },
  ];
  if (hasMemory) {
    vars.push({ name: 'CMPSBL_MEMORY_TTL_DAYS', required: false, desc: 'Memory retention in days (default: 90)' });
    vars.push({ name: 'CMPSBL_MEMORY_DIR', required: false, desc: 'Custom memory storage path' });
  }
  if (hasDream) {
    vars.push({ name: 'CMPSBL_DREAM_MODE', required: false, desc: 'DREAM synthesis mode: active | passive' });
  }
  return vars;
}
