import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Generating Earth-themed investor packet...');

    const generatedDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Earth Theme Investor Deck - Light, Breathable, Grounded
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PromptFluid — Investor Overview · ${generatedDate}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,300;6..72,400;6..72,500;6..72,600&family=Inter:wght@400;500;600&display=swap');
    
    :root {
      --earth-stone: #2d2926;
      --earth-warm: #5c4d3c;
      --earth-sand: #a69076;
      --earth-cream: #f5f0e8;
      --earth-paper: #faf8f5;
      --earth-moss: #4a5940;
      --earth-sage: #87907a;
      --earth-clay: #c4a77d;
      --earth-terracotta: #b87333;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Newsreader', Georgia, serif;
      background: var(--earth-paper);
      color: var(--earth-stone);
      line-height: 1.8;
      font-size: 17px;
    }
    
    .page {
      max-width: 800px;
      margin: 0 auto;
      padding: 80px 60px;
      page-break-after: always;
      min-height: 100vh;
    }
    
    /* ═══════════════════════════════════════
       COVER PAGE
    ═══════════════════════════════════════ */
    .cover {
      display: flex;
      flex-direction: column;
      justify-content: center;
      min-height: 100vh;
      text-align: left;
      padding: 100px 60px;
    }
    
    .cover-badge {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--earth-sand);
      margin-bottom: 40px;
    }
    
    .cover h1 {
      font-size: 56px;
      font-weight: 300;
      line-height: 1.15;
      letter-spacing: -1px;
      margin-bottom: 30px;
      color: var(--earth-stone);
    }
    
    .cover-tagline {
      font-size: 22px;
      color: var(--earth-warm);
      margin-bottom: 60px;
      max-width: 500px;
      font-weight: 300;
    }
    
    .cover-meta {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: var(--earth-sage);
    }
    
    /* ═══════════════════════════════════════
       TYPOGRAPHY
    ═══════════════════════════════════════ */
    h1 {
      font-size: 38px;
      font-weight: 400;
      margin-bottom: 40px;
      color: var(--earth-stone);
      letter-spacing: -0.5px;
    }
    
    h2 {
      font-size: 26px;
      font-weight: 400;
      margin: 50px 0 24px;
      color: var(--earth-stone);
    }
    
    h3 {
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: var(--earth-sand);
      margin: 40px 0 20px;
    }
    
    p {
      margin-bottom: 20px;
      color: var(--earth-warm);
    }
    
    .lead {
      font-size: 20px;
      line-height: 1.7;
      color: var(--earth-stone);
      margin-bottom: 40px;
    }
    
    /* ═══════════════════════════════════════
       COMPONENTS
    ═══════════════════════════════════════ */
    .divider {
      height: 1px;
      background: var(--earth-sand);
      opacity: 0.3;
      margin: 50px 0;
    }
    
    .stat-row {
      display: flex;
      gap: 40px;
      margin: 40px 0;
    }
    
    .stat {
      flex: 1;
    }
    
    .stat-value {
      font-size: 32px;
      font-weight: 300;
      color: var(--earth-stone);
      margin-bottom: 6px;
    }
    
    .stat-label {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--earth-sage);
    }
    
    .product-card {
      background: var(--earth-cream);
      padding: 36px;
      margin: 24px 0;
      border-radius: 4px;
    }
    
    .product-card h4 {
      font-size: 22px;
      font-weight: 500;
      margin-bottom: 8px;
      color: var(--earth-stone);
    }
    
    .product-card .subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--earth-sand);
      margin-bottom: 16px;
    }
    
    .product-card p {
      font-size: 16px;
      line-height: 1.7;
    }
    
    .status-badge {
      display: inline-block;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 1px;
      padding: 4px 12px;
      background: var(--earth-moss);
      color: white;
      border-radius: 2px;
      margin-bottom: 16px;
    }
    
    .status-badge.pending { background: var(--earth-clay); }
    .status-badge.research { background: var(--earth-terracotta); }
    
    ul {
      list-style: none;
      margin: 20px 0;
    }
    
    ul li {
      position: relative;
      padding-left: 24px;
      margin-bottom: 12px;
      color: var(--earth-warm);
    }
    
    ul li::before {
      content: '—';
      position: absolute;
      left: 0;
      color: var(--earth-sand);
    }
    
    .quote {
      font-size: 24px;
      font-style: italic;
      color: var(--earth-stone);
      margin: 50px 0;
      padding-left: 30px;
      border-left: 2px solid var(--earth-sand);
    }
    
    .contact-section {
      background: var(--earth-cream);
      padding: 50px;
      margin-top: 60px;
      text-align: center;
      border-radius: 4px;
    }
    
    .contact-section h2 {
      margin-top: 0;
    }
    
    .contact-item {
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      color: var(--earth-stone);
      margin: 10px 0;
    }
    
    .disclaimer {
      margin-top: 80px;
      padding: 30px;
      background: var(--earth-cream);
      font-size: 12px;
      line-height: 1.8;
      color: var(--earth-sage);
      border-radius: 4px;
    }
    
    .two-column {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 50px;
      margin: 30px 0;
    }
    
    @media print {
      .page { page-break-after: always; padding: 40px; }
    }
    
    @media (max-width: 768px) {
      .page { padding: 40px 24px; }
      .cover { padding: 60px 24px; }
      .cover h1 { font-size: 36px; }
      .two-column { grid-template-columns: 1fr; gap: 30px; }
      .stat-row { flex-direction: column; gap: 24px; }
    }
  </style>
</head>
<body>

  <!-- ═══════════════════════════════════════
       COVER
  ═══════════════════════════════════════ -->
  <div class="cover">
    <div class="cover-badge">Confidential Investment Overview</div>
    <h1>PromptFluid</h1>
    <p class="cover-tagline">
      Applied AI infrastructure for security, accessibility, and autonomous systems.
    </p>
    <div class="cover-meta">
      ${generatedDate} · Seed Stage
    </div>
  </div>

  <!-- ═══════════════════════════════════════
       OVERVIEW
  ═══════════════════════════════════════ -->
  <div class="page">
    <h1>Overview</h1>
    
    <p class="lead">
      PromptFluid builds AI-powered infrastructure that works without supervision. 
      We've shipped six products over the past year, with 100+ projects delivered across 15 years of software development.
    </p>
    
    <div class="stat-row">
      <div class="stat">
        <div class="stat-value">6</div>
        <div class="stat-label">Shipped Products</div>
      </div>
      <div class="stat">
        <div class="stat-value">100+</div>
        <div class="stat-label">Projects Delivered</div>
      </div>
      <div class="stat">
        <div class="stat-value">15+</div>
        <div class="stat-label">Years Building</div>
      </div>
      <div class="stat">
        <div class="stat-value">Seed</div>
        <div class="stat-label">Current Stage</div>
      </div>
    </div>
    
    <div class="divider"></div>
    
    <h2>What We Build</h2>
    <ul>
      <li>Autonomous system orchestration and self-improving AI</li>
      <li>Security infrastructure with behavioral analysis</li>
      <li>Accessibility compliance tools that remain free</li>
      <li>Multi-provider AI routing across 20+ LLMs</li>
      <li>Experimental interfaces for complex systems</li>
    </ul>
    
    <p class="quote">
      "Real systems. Grounded infrastructure. Built to last."
    </p>
  </div>

  <!-- ═══════════════════════════════════════
       PRODUCTS
  ═══════════════════════════════════════ -->
  <div class="page">
    <h1>Product Portfolio</h1>
    
    <h3>Security</h3>
    
    <div class="product-card">
      <span class="status-badge">Live</span>
      <h4>RCKBL — Rockable Defense</h4>
      <div class="subtitle">Enterprise Bot Defense</div>
      <p>
        AI-powered bot detection born from reverse-engineering stealth technology. 
        Behavioral fingerprinting, adaptive CAPTCHA, and real-time threat blocking 
        for WordPress and enterprise sites.
      </p>
    </div>
    
    <h3>Accessibility</h3>
    
    <div class="product-card">
      <span class="status-badge">Live</span>
      <h4>RNDRBL — Renderable</h4>
      <div class="subtitle">Accessibility Browser</div>
      <p>
        Browser technology with integrated control panel. Enables users with disabilities 
        to customize their browsing experience in real-time.
      </p>
    </div>
    
    <div class="product-card">
      <span class="status-badge">Live</span>
      <h4>PTCHBL — Patchable</h4>
      <div class="subtitle">Free WCAG Scanner</div>
      <p>
        100% free accessibility scanning with AI-powered fixes. Detects and repairs 
        45 of 86 WCAG compliance functions. Accessibility should never be behind a paywall.
      </p>
    </div>
    
    <div class="product-card">
      <span class="status-badge">Live</span>
      <h4>SPLCBL — Spliceable</h4>
      <div class="subtitle">WordPress Plugin Validator</div>
      <p>
        Pre-submission compliance checker for WordPress.org plugin approval. 
        Free tool for developers to validate plugins before official review.
      </p>
    </div>
  </div>

  <!-- ═══════════════════════════════════════
       AI SYSTEMS
  ═══════════════════════════════════════ -->
  <div class="page">
    <h1>Autonomous AI</h1>
    
    <h3>Internal Simulation</h3>
    
    <div class="product-card">
      <span class="status-badge">Deployed</span>
      <h4>Cascade — Autonomous Dreaming AI</h4>
      <div class="subtitle">Memory Reflection Cycles</div>
      <p>
        First documented autonomous AI with internal simulation cycles—what we call "dreaming." 
        Memory consolidation, pattern recognition, and self-directed learning during idle periods. 
        Published on Zenodo and OSF with full documentation.
      </p>
      <ul>
        <li>Autonomous dream initiation</li>
        <li>Memory compression and consolidation</li>
        <li>Cross-domain pattern synthesis</li>
        <li>Whitepaper published on GitHub</li>
      </ul>
    </div>
    
    <h3>Infrastructure</h3>
    
    <div class="product-card">
      <span class="status-badge">Running</span>
      <h4>AI Nexus — Multi-Provider Gateway</h4>
      <div class="subtitle">Intelligent LLM Routing</div>
      <p>
        Unified routing across 20+ AI providers. Intelligent load balancing, 
        automatic failover, and cost optimization. Zero-downtime provider switching.
      </p>
    </div>
    
    <div class="divider"></div>
    
    <p class="quote">
      "We ship real systems. These are live, operational, and independently verifiable."
    </p>
  </div>

  <!-- ═══════════════════════════════════════
       OPPORTUNITY
  ═══════════════════════════════════════ -->
  <div class="page">
    <h1>Investment Opportunity</h1>
    
    <p class="lead">
      Seeking seed investment to scale AI-powered infrastructure for security, 
      accessibility, and autonomous systems.
    </p>
    
    <h3>Market Context</h3>
    
    <div class="two-column">
      <div>
        <h2>Security</h2>
        <p>
          WordPress powers 43% of all websites. Traditional signature-based detection 
          fails against modern AI-generated attacks. Our behavioral analysis approach 
          adapts to emerging threats automatically.
        </p>
      </div>
      <div>
        <h2>Accessibility</h2>
        <p>
          Web accessibility lawsuits have increased significantly over the past five years. 
          WCAG 2.2 compliance is now legally mandated in many jurisdictions. 
          We believe accessibility tools should remain free.
        </p>
      </div>
    </div>
    
    <h3>Revenue Model</h3>
    
    <ul>
      <li><strong>Security Products:</strong> Freemium SaaS with premium tiers</li>
      <li><strong>Accessibility Tools:</strong> Core features remain free; enterprise API licensing</li>
      <li><strong>AI Infrastructure:</strong> Usage-based pricing for high-volume integrations</li>
    </ul>
    
    <h3>Use of Investment</h3>
    
    <ul>
      <li><strong>Product Development:</strong> Complete feature roadmap, expand capabilities</li>
      <li><strong>Growth:</strong> WordPress.org optimization, content marketing, partnerships</li>
      <li><strong>Infrastructure:</strong> Scaling, security audits, compliance certifications</li>
      <li><strong>Operations:</strong> Legal, accounting, team expansion preparation</li>
    </ul>
  </div>

  <!-- ═══════════════════════════════════════
       TEAM & CONTACT
  ═══════════════════════════════════════ -->
  <div class="page">
    <h1>Team</h1>
    
    <div class="product-card">
      <h4>Kenneth E Sweet Jr</h4>
      <div class="subtitle">Founder</div>
      <p>
        Full-stack developer with 15+ years of experience in web development, AI/ML, 
        and security systems. Creator of the SimNap-Cascade dreaming AI architecture. 
        Focused on building technology that works for everyone.
      </p>
    </div>
    
    <div class="contact-section">
      <h2>Let's Connect</h2>
      <p style="color: var(--earth-warm); margin-bottom: 30px;">
        Interested in learning more about PromptFluid and investment opportunities?
      </p>
      <div class="contact-item">kenneth@promptfluid.com</div>
      <div class="contact-item">promptfluid.com</div>
      <div class="contact-item">(760) 358-4324</div>
    </div>
    
    <div class="disclaimer">
      <strong>Disclaimer:</strong> This document is for informational purposes only and does not constitute 
      an offer to sell or a solicitation of an offer to buy any securities. Investment in early-stage 
      companies involves significant risks, including the risk of total loss. Projections and forward-looking 
      statements are based on current assumptions and are subject to change. Investors should conduct their 
      own due diligence and consult with professional advisors before making any investment decisions.
      <br><br>
      © ${new Date().getFullYear()} PromptFluid. All rights reserved.
    </div>
  </div>

</body>
</html>`;

    const filename = `PromptFluid_Investor_Overview_${new Date().toISOString().split('T')[0]}.html`;

    console.log('Earth-themed investor packet generated successfully');

    return new Response(JSON.stringify({
      success: true,
      content: htmlContent,
      filename: filename,
      generated_at: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Investor packet generation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
