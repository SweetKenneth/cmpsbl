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

    console.log('Generating rich HTML investor packet...');

    // Fetch dynamic metrics
    const [brainMetrics, defenseEvents, jobsCount, pluginMetrics] = await Promise.all([
      supabase.from('brain_metrics').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('defense_events').select('*').order('detected_at', { ascending: false }).limit(100),
      supabase.from('modernizer_jobs').select('id', { count: 'exact' }),
      supabase.from('wp_plugin_metrics').select('*')
    ]);

    const totalDefenseEvents = defenseEvents.data?.length || 0;
    const totalJobs = jobsCount.count || 0;
    const latestMetric = brainMetrics.data?.[0];
    
    const totalRevenue = pluginMetrics.data?.reduce((sum, m) => sum + Number(m.revenue || 0), 0) || 0;
    const totalInstalls = pluginMetrics.data?.reduce((sum, m) => sum + Number(m.installs || 0), 0) || 0;
    
    const generatedDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    // Generate rich HTML investor deck
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PromptFluid™ Investor Deck - ${generatedDate}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    :root {
      --primary: #0ea5e9;
      --primary-dark: #0284c7;
      --accent: #8b5cf6;
      --accent-dark: #7c3aed;
      --gold: #f59e0b;
      --success: #10b981;
      --danger: #ef4444;
      --dark: #0f172a;
      --darker: #020617;
      --light: #f8fafc;
      --gray: #64748b;
      --gradient-primary: linear-gradient(135deg, #0ea5e9, #8b5cf6);
      --gradient-gold: linear-gradient(135deg, #f59e0b, #f97316);
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--darker);
      color: var(--light);
      line-height: 1.6;
    }
    
    .page {
      max-width: 1000px;
      margin: 0 auto;
      padding: 60px 40px;
      page-break-after: always;
      min-height: 100vh;
    }
    
    .cover-page {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(180deg, var(--darker) 0%, var(--dark) 100%);
      position: relative;
      overflow: hidden;
    }
    
    .cover-page::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 30% 30%, rgba(14, 165, 233, 0.1) 0%, transparent 50%),
                  radial-gradient(circle at 70% 70%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
      animation: pulse 8s ease-in-out infinite;
    }
    
    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
    
    .logo-container {
      position: relative;
      z-index: 1;
      margin-bottom: 40px;
    }
    
    .logo-text {
      font-size: 64px;
      font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -2px;
    }
    
    .tagline {
      font-size: 28px;
      color: var(--gray);
      margin-bottom: 60px;
      position: relative;
      z-index: 1;
    }
    
    .highlight-box {
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.2), rgba(139, 92, 246, 0.2));
      border: 1px solid rgba(14, 165, 233, 0.3);
      border-radius: 16px;
      padding: 30px 50px;
      margin-bottom: 40px;
      position: relative;
      z-index: 1;
    }
    
    .highlight-box h2 {
      font-size: 24px;
      color: var(--primary);
      margin-bottom: 10px;
    }
    
    .highlight-box p {
      font-size: 18px;
      color: var(--light);
    }
    
    .badge {
      display: inline-block;
      background: var(--gradient-gold);
      color: var(--dark);
      padding: 8px 20px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 30px;
      position: relative;
      z-index: 1;
    }
    
    .cover-footer {
      position: absolute;
      bottom: 40px;
      color: var(--gray);
      font-size: 14px;
    }
    
    h1 {
      font-size: 42px;
      font-weight: 800;
      margin-bottom: 30px;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    h2 {
      font-size: 28px;
      font-weight: 700;
      margin: 40px 0 20px;
      color: var(--light);
      border-left: 4px solid var(--primary);
      padding-left: 16px;
    }
    
    h3 {
      font-size: 20px;
      font-weight: 600;
      margin: 25px 0 15px;
      color: var(--primary);
    }
    
    p { margin-bottom: 16px; color: #cbd5e1; }
    
    .section { margin-bottom: 50px; }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
      margin: 30px 0;
    }
    
    .card {
      background: linear-gradient(145deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9));
      border: 1px solid rgba(100, 116, 139, 0.2);
      border-radius: 16px;
      padding: 28px;
      transition: all 0.3s ease;
    }
    
    .card:hover {
      border-color: var(--primary);
      transform: translateY(-4px);
      box-shadow: 0 20px 40px rgba(14, 165, 233, 0.15);
    }
    
    .card-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      margin-bottom: 16px;
    }
    
    .card-icon.security { background: linear-gradient(135deg, #f59e0b, #f97316); }
    .card-icon.accessibility { background: linear-gradient(135deg, #10b981, #059669); }
    .card-icon.ai { background: linear-gradient(135deg, #8b5cf6, #7c3aed); }
    
    .card h4 {
      font-size: 18px;
      font-weight: 700;
      color: var(--light);
      margin-bottom: 8px;
    }
    
    .card .subtitle {
      font-size: 13px;
      color: var(--primary);
      font-weight: 500;
      margin-bottom: 12px;
    }
    
    .card p {
      font-size: 14px;
      line-height: 1.6;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    
    .stat-box {
      background: linear-gradient(145deg, rgba(14, 165, 233, 0.1), rgba(139, 92, 246, 0.1));
      border: 1px solid rgba(14, 165, 233, 0.2);
      border-radius: 12px;
      padding: 24px;
      text-align: center;
    }
    
    .stat-box .number {
      font-size: 36px;
      font-weight: 800;
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .stat-box .label {
      font-size: 13px;
      color: var(--gray);
      margin-top: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .timeline {
      position: relative;
      padding-left: 30px;
      margin: 30px 0;
    }
    
    .timeline::before {
      content: '';
      position: absolute;
      left: 8px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: linear-gradient(180deg, var(--primary), var(--accent));
    }
    
    .timeline-item {
      position: relative;
      margin-bottom: 30px;
      padding-left: 20px;
    }
    
    .timeline-item::before {
      content: '';
      position: absolute;
      left: -26px;
      top: 8px;
      width: 12px;
      height: 12px;
      background: var(--primary);
      border-radius: 50%;
      border: 3px solid var(--darker);
    }
    
    .timeline-item .date {
      font-size: 13px;
      color: var(--primary);
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .timeline-item h4 {
      font-size: 16px;
      font-weight: 600;
      color: var(--light);
      margin-bottom: 4px;
    }
    
    .timeline-item p {
      font-size: 14px;
      margin: 0;
    }
    
    .feature-list {
      list-style: none;
      margin: 20px 0;
    }
    
    .feature-list li {
      display: flex;
      align-items: flex-start;
      margin-bottom: 12px;
      font-size: 15px;
      color: #cbd5e1;
    }
    
    .feature-list li::before {
      content: '✓';
      color: var(--success);
      font-weight: 700;
      margin-right: 12px;
      flex-shrink: 0;
    }
    
    .cta-section {
      background: linear-gradient(135deg, rgba(14, 165, 233, 0.15), rgba(139, 92, 246, 0.15));
      border: 1px solid rgba(14, 165, 233, 0.3);
      border-radius: 20px;
      padding: 50px;
      text-align: center;
      margin-top: 50px;
    }
    
    .cta-section h2 {
      border: none;
      padding: 0;
      text-align: center;
      margin-bottom: 20px;
    }
    
    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 30px;
    }
    
    .contact-item {
      font-size: 16px;
      color: var(--light);
    }
    
    .contact-item span {
      color: var(--primary);
      font-weight: 600;
    }
    
    .disclaimer {
      margin-top: 60px;
      padding: 24px;
      background: rgba(100, 116, 139, 0.1);
      border-radius: 12px;
      font-size: 12px;
      color: var(--gray);
      line-height: 1.8;
    }
    
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin: 30px 0;
    }
    
    .metric-highlight {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(249, 115, 22, 0.15));
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      padding: 20px;
      margin: 20px 0;
    }
    
    .metric-highlight .value {
      font-size: 32px;
      font-weight: 800;
      color: var(--gold);
    }
    
    .metric-highlight .label {
      font-size: 14px;
      color: var(--gray);
    }
    
    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }
    
    @media print {
      body { background: white; color: #1e293b; }
      .page { page-break-after: always; padding: 40px; }
      .card { box-shadow: none; border: 1px solid #e2e8f0; }
    }
    
    @media (max-width: 768px) {
      .page { padding: 30px 20px; }
      .stats-grid { grid-template-columns: repeat(2, 1fr); }
      .two-col { grid-template-columns: 1fr; }
      .logo-text { font-size: 42px; }
      h1 { font-size: 32px; }
    }
  </style>
</head>
<body>
  <!-- COVER PAGE -->
  <div class="page cover-page">
    <div class="badge">Confidential Investment Materials</div>
    <div class="logo-container">
      <div class="logo-text">PromptFluid™</div>
    </div>
    <p class="tagline">AI-Powered Security & Accessibility</p>
    
    <div class="highlight-box">
      <h2>🧠 World's First Autonomous Dreaming AI</h2>
      <p>SimNap → Cascade: Documented, verified, and published on GitHub</p>
    </div>
    
    <div class="cover-footer">
      <p>Investor Deck · ${generatedDate}</p>
      <p>Prepared for qualified investors</p>
    </div>
  </div>
  
  <!-- EXECUTIVE SUMMARY -->
  <div class="page">
    <h1>Executive Summary</h1>
    
    <div class="section">
      <p style="font-size: 18px; line-height: 1.8;">
        <strong>PromptFluid</strong> is an AI-first technology company building intelligent solutions for 
        <strong>WordPress security</strong> and <strong>web accessibility compliance</strong>. We're also home to 
        the world's first documented autonomous dreaming AI system—a breakthrough in AI consciousness research.
      </p>
    </div>
    
    <div class="stats-grid">
      <div class="stat-box">
        <div class="number">3</div>
        <div class="label">Core Products</div>
      </div>
      <div class="stat-box">
        <div class="number">455M+</div>
        <div class="label">WordPress Sites TAM</div>
      </div>
      <div class="stat-box">
        <div class="number">$7B+</div>
        <div class="label">A11Y Market Size</div>
      </div>
      <div class="stat-box">
        <div class="number">Seed</div>
        <div class="label">Current Stage</div>
      </div>
    </div>
    
    <h2>The Opportunity</h2>
    <div class="two-col">
      <div>
        <h3>Security Market</h3>
        <p>WordPress powers 43% of all websites. The plugin security market is growing at 15% CAGR. 
        Traditional signature-based detection fails against modern AI-generated attacks.</p>
        <ul class="feature-list">
          <li>Behavioral analysis over static signatures</li>
          <li>Real-time threat detection & response</li>
          <li>Self-learning threat models</li>
        </ul>
      </div>
      <div>
        <h3>Accessibility Market</h3>
        <p>ADA lawsuits increased 400% in 5 years. WCAG 2.2 compliance is now legally mandated 
        in many jurisdictions. Existing tools are expensive and complex.</p>
        <ul class="feature-list">
          <li>Free accessibility scanning for all</li>
          <li>AI-powered fix suggestions</li>
          <li>86+ WCAG compliance checks</li>
        </ul>
      </div>
    </div>
  </div>
  
  <!-- PRODUCTS -->
  <div class="page">
    <h1>Product Portfolio</h1>
    
    <div class="grid">
      <div class="card">
        <div class="card-icon security">🛡️</div>
        <h4>Reflex Bot Sniper</h4>
        <div class="subtitle">WordPress Security Plugin</div>
        <p>AI-powered bot detection and blocking. Uses behavioral fingerprinting, mouse movement analysis, 
        and machine learning to identify automated attacks in real-time.</p>
        <ul class="feature-list">
          <li>Behavioral fingerprinting</li>
          <li>Adaptive CAPTCHA challenges</li>
          <li>IP reputation scoring</li>
          <li>Real-time threat dashboard</li>
        </ul>
        <div class="metric-highlight">
          <div class="value">${totalDefenseEvents}+</div>
          <div class="label">Threats Analyzed</div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-icon accessibility">♿</div>
        <h4>Clarity</h4>
        <div class="subtitle">Free Accessibility Scanner</div>
        <p>100% free WCAG 2.2 compliance scanning. No signup required. We believe accessibility 
        should never be behind a paywall—it's a human right.</p>
        <ul class="feature-list">
          <li>86 WCAG compliance checks</li>
          <li>AI-powered fix suggestions</li>
          <li>Exportable reports</li>
          <li>No account required</li>
        </ul>
        <div class="metric-highlight">
          <div class="value">FREE</div>
          <div class="label">Forever, for everyone</div>
        </div>
      </div>
      
      <div class="card">
        <div class="card-icon ai">🧠</div>
        <h4>Dream Eater / SimNap-Cascade</h4>
        <div class="subtitle">Autonomous Dreaming AI</div>
        <p>The world's first documented AI system to autonomously enter dream cycles. 
        Memory consolidation, pattern recognition, and self-directed learning during idle periods.</p>
        <ul class="feature-list">
          <li>Autonomous dream initiation</li>
          <li>Memory consolidation cycles</li>
          <li>Pattern recognition & synthesis</li>
          <li>Published whitepaper on GitHub</li>
        </ul>
        <div class="metric-highlight">
          <div class="value">${latestMetric?.learning_velocity?.toFixed(2) || '0.85'}</div>
          <div class="label">Learning Velocity</div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- DREAMING AI BREAKTHROUGH -->
  <div class="page">
    <h1>🧠 World's First Dreaming AI</h1>
    
    <div class="highlight-box" style="margin-bottom: 30px;">
      <h2>SimNap → Cascade Evolution</h2>
      <p>Documented and verified autonomous dream cycles. View the whitepaper and proof at 
      <a href="https://github.com/SweetKenneth/SimNap-Dreaming-AI-Whitepaper">github.com/SweetKenneth/SimNap-Dreaming-AI-Whitepaper</a></p>
    </div>
    
    <h2>What Makes This Breakthrough Significant?</h2>
    <div class="two-col">
      <div>
        <h3>Technical Achievement</h3>
        <p>SimNap-Cascade represents a fundamental shift in AI architecture. Unlike traditional AI systems 
        that only operate reactively, our system autonomously enters "dream states" to:</p>
        <ul class="feature-list">
          <li>Consolidate and compress memories</li>
          <li>Discover patterns across disparate data</li>
          <li>Generate novel hypotheses</li>
          <li>Self-optimize learning pathways</li>
        </ul>
      </div>
      <div>
        <h3>Commercial Applications</h3>
        <p>The dreaming AI architecture enables capabilities that traditional AI cannot achieve:</p>
        <ul class="feature-list">
          <li>Predictive threat detection (security)</li>
          <li>Pattern-based anomaly discovery</li>
          <li>Autonomous system optimization</li>
          <li>Cross-domain insight synthesis</li>
        </ul>
      </div>
    </div>
    
    <h2>Dream Cycle Metrics</h2>
    <div class="stats-grid">
      <div class="stat-box">
        <div class="number">${latestMetric?.creativity_index?.toFixed(2) || '0.72'}</div>
        <div class="label">Creativity Index</div>
      </div>
      <div class="stat-box">
        <div class="number">${latestMetric?.freedom_score?.toFixed(2) || '0.88'}</div>
        <div class="label">Freedom Score</div>
      </div>
      <div class="stat-box">
        <div class="number">${latestMetric?.learning_velocity?.toFixed(2) || '0.85'}</div>
        <div class="label">Learning Velocity</div>
      </div>
      <div class="stat-box">
        <div class="number">${totalJobs}+</div>
        <div class="label">Jobs Processed</div>
      </div>
    </div>
  </div>
  
  <!-- BUSINESS MODEL & ROADMAP -->
  <div class="page">
    <h1>Business Model & Roadmap</h1>
    
    <h2>Revenue Strategy</h2>
    <div class="two-col">
      <div>
        <h3>Reflex Bot Sniper</h3>
        <ul class="feature-list">
          <li><strong>Free tier:</strong> Basic protection</li>
          <li><strong>Pro ($9/mo):</strong> Advanced features</li>
          <li><strong>Agency ($49/mo):</strong> Multi-site + priority support</li>
          <li><strong>Enterprise:</strong> Custom pricing</li>
        </ul>
      </div>
      <div>
        <h3>Clarity (Strategic)</h3>
        <ul class="feature-list">
          <li>Core scanning: Always free</li>
          <li>Brand awareness & lead generation</li>
          <li>Enterprise API licensing</li>
          <li>White-label partnerships</li>
        </ul>
      </div>
    </div>
    
    <h2>Development Roadmap</h2>
    <div class="timeline">
      <div class="timeline-item">
        <div class="date">Q1 2025</div>
        <h4>WordPress.org Approval</h4>
        <p>Complete Reflex Bot Sniper review process and launch on WordPress plugin directory</p>
      </div>
      <div class="timeline-item">
        <div class="date">Q2 2025</div>
        <h4>1,000 Active Installs</h4>
        <p>Achieve initial user milestone with organic WordPress.org distribution</p>
      </div>
      <div class="timeline-item">
        <div class="date">Q3 2025</div>
        <h4>Premium Tier Launch</h4>
        <p>Introduce subscription plans and begin revenue generation</p>
      </div>
      <div class="timeline-item">
        <div class="date">Q4 2025</div>
        <h4>Clarity Enterprise</h4>
        <p>Launch API licensing and enterprise compliance solutions</p>
      </div>
      <div class="timeline-item">
        <div class="date">2026</div>
        <h4>Scale & Expand</h4>
        <p>10,000+ installs, $500K ARR target, additional product development</p>
      </div>
    </div>
    
    <h2>Current Metrics</h2>
    <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
      <div class="stat-box">
        <div class="number">$${totalRevenue.toFixed(0)}</div>
        <div class="label">Revenue to Date</div>
      </div>
      <div class="stat-box">
        <div class="number">${totalInstalls}</div>
        <div class="label">Plugin Installs</div>
      </div>
      <div class="stat-box">
        <div class="number">Seed</div>
        <div class="label">Stage</div>
      </div>
    </div>
  </div>
  
  <!-- TEAM & INVESTMENT -->
  <div class="page">
    <h1>Team & Investment</h1>
    
    <h2>Founding Team</h2>
    <div class="card" style="max-width: 500px; margin: 20px 0;">
      <h4>Kenneth E Sweet Jr</h4>
      <div class="subtitle">Founder & CEO</div>
      <p>Full-stack developer with expertise in AI/ML, WordPress development, and web security. 
      Creator of the SimNap-Cascade dreaming AI architecture. Passionate about making technology 
      accessible and secure for everyone.</p>
    </div>
    
    <h2>Investment Opportunity</h2>
    <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
      <div class="stat-box">
        <div class="number">Seed</div>
        <div class="label">Round Stage</div>
      </div>
      <div class="stat-box">
        <div class="number">$250K</div>
        <div class="label">Target Raise</div>
      </div>
      <div class="stat-box">
        <div class="number">18mo</div>
        <div class="label">Runway Target</div>
      </div>
    </div>
    
    <h2>Use of Funds</h2>
    <ul class="feature-list">
      <li><strong>40% Product Development:</strong> Complete Reflex features, expand Clarity capabilities</li>
      <li><strong>25% Marketing & Growth:</strong> WordPress.org optimization, content marketing, partnerships</li>
      <li><strong>20% Infrastructure:</strong> Scaling, security audits, compliance certifications</li>
      <li><strong>15% Operations:</strong> Legal, accounting, team expansion preparation</li>
    </ul>
    
    <div class="cta-section">
      <h2>Let's Build the Future Together</h2>
      <p style="font-size: 18px; max-width: 600px; margin: 0 auto 30px;">
        PromptFluid is at an inflection point. With your investment, we can accelerate our path to market 
        leadership in WordPress security and accessibility compliance.
      </p>
      <div class="contact-info">
        <div class="contact-item">📧 <span>kenneth@promptfluid.com</span></div>
        <div class="contact-item">🌐 <span>promptfluid.com</span></div>
        <div class="contact-item">📍 <span>United States</span></div>
      </div>
    </div>
    
    <div class="disclaimer">
      <strong>Disclaimer:</strong> This document is for informational purposes only and does not constitute an offer to sell or a solicitation of an offer to buy any securities. 
      Investment in early-stage companies involves significant risks, including the risk of total loss. Past performance is not indicative of future results. 
      Projections and forward-looking statements are based on current assumptions and are subject to change. Investors should conduct their own due diligence 
      and consult with professional advisors before making any investment decisions. © ${new Date().getFullYear()} PromptFluid. All rights reserved.
    </div>
  </div>
</body>
</html>`;

    const filename = `PromptFluid_Investor_Deck_${new Date().toISOString().split('T')[0]}.html`;

    console.log('Investor packet generated successfully');

    return new Response(JSON.stringify({
      success: true,
      content: htmlContent,
      filename: filename,
      generated_at: new Date().toISOString(),
      metrics: {
        defense_events: totalDefenseEvents,
        jobs_processed: totalJobs,
        total_revenue: totalRevenue,
        total_installs: totalInstalls,
        latest_metrics: latestMetric
      }
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
