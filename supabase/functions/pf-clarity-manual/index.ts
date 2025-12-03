import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { format = 'html' } = await req.json();

    // Generate comprehensive user manual HTML
    const manualHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PromptFluid Clarity - User Manual</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 { color: #7A5FFF; border-bottom: 3px solid #7A5FFF; padding-bottom: 10px; }
    h2 { color: #01C9E8; margin-top: 30px; }
    h3 { color: #666; }
    code {
      background: #f4f4f4;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Courier New', monospace;
    }
    pre {
      background: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      overflow-x: auto;
    }
    .section { margin-bottom: 40px; }
    .feature-box {
      background: #f9f9f9;
      padding: 15px;
      margin: 10px 0;
      border-left: 4px solid #7A5FFF;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th { background-color: #7A5FFF; color: white; }
  </style>
</head>
<body>
  <h1>PromptFluid Clarity™ User Manual</h1>
  <p><strong>Version 4.1.0 - Universal Edition</strong></p>
  <p><em>Install once. Comply forever.</em></p>

  <div class="section">
    <h2>1. Overview</h2>
    <p>PromptFluid Clarity is a universal AI-powered accessibility scanner and auto-fix engine that brings WCAG 2.2 compliance to any website. Whether you're running WordPress, React, Next.js, Vue, or vanilla HTML, Clarity provides:</p>
    <ul>
      <li><strong>86 WCAG Checks</strong> covering Level A, AA, and AAA criteria</li>
      <li><strong>24 Auto-Fix Types</strong> that repair accessibility issues automatically</li>
      <li><strong>Continuous Monitoring</strong> with real-time compliance tracking</li>
      <li><strong>Rollback-Safe</strong> architecture to ensure zero downtime</li>
      <li><strong>AI-Powered</strong> remediation using PromptFluid Nexus intelligence</li>
    </ul>
  </div>

  <div class="section">
    <h2>2. Installation Wizard</h2>
    <h3>Step 1: Add the Agent</h3>
    <p>For any website, add this script before your closing <code>&lt;/body&gt;</code> tag:</p>
    <pre><code>&lt;script src="https://cdn.promptfluid.com/clarity-agent.js" 
        data-clarity-key="YOUR_API_KEY"&gt;&lt;/script&gt;</code></pre>
    
    <h3>Step 2: Configure Settings</h3>
    <p>Log in to your Clarity dashboard to:</p>
    <ul>
      <li>Set auto-fix preferences</li>
      <li>Configure scan schedules</li>
      <li>Enable/disable specific checks</li>
      <li>Set up team access</li>
    </ul>

    <h3>Step 3: Run Your First Scan</h3>
    <p>Navigate to <strong>Scans > Run New Scan</strong> to perform your first comprehensive accessibility audit.</p>
  </div>

  <div class="section">
    <h2>3. Auto-Fix Engine</h2>
    <p>Clarity automatically repairs these 24 accessibility issues:</p>
    <div class="feature-box">
      <strong>Image Accessibility:</strong>
      <ul>
        <li>Missing alt text (AI-generated descriptions)</li>
        <li>Decorative image marking</li>
        <li>Complex image ARIA labels</li>
      </ul>
    </div>
    <div class="feature-box">
      <strong>Form Accessibility:</strong>
      <ul>
        <li>Missing form labels</li>
        <li>Input field associations</li>
        <li>Error message announcements</li>
        <li>Required field indicators</li>
      </ul>
    </div>
    <div class="feature-box">
      <strong>Navigation & Structure:</strong>
      <ul>
        <li>Skip navigation links</li>
        <li>Heading hierarchy corrections</li>
        <li>Landmark region markup</li>
        <li>Keyboard focus indicators</li>
      </ul>
    </div>
  </div>

  <div class="section">
    <h2>4. Rollback System</h2>
    <p>Clarity maintains a 30-day rollback buffer for all auto-fixes. If any fix causes an issue:</p>
    <ol>
      <li>Navigate to <strong>History > Rollback</strong></li>
      <li>Select the fix date/time</li>
      <li>Click <strong>Restore Previous State</strong></li>
    </ol>
    <p>Rollbacks happen instantly with zero downtime.</p>
  </div>

  <div class="section">
    <h2>5. Continuous Monitoring</h2>
    <p>Set up automated scans to ensure ongoing compliance:</p>
    <ul>
      <li><strong>Daily Scans:</strong> Monitor high-traffic pages</li>
      <li><strong>Weekly Reports:</strong> Receive compliance summaries via email</li>
      <li><strong>Real-Time Alerts:</strong> Get notified of critical issues immediately</li>
    </ul>
  </div>

  <div class="section">
    <h2>6. Pricing Plans</h2>
    <table>
      <tr>
        <th>Plan</th>
        <th>Price</th>
        <th>Features</th>
      </tr>
      <tr>
        <td>Free</td>
        <td>$0</td>
        <td>View-only, 1 scan/month, basic reports</td>
      </tr>
      <tr>
        <td>One-Time Fix</td>
        <td>$199</td>
        <td>50 pages, auto-fix enabled, 30-day rollback</td>
      </tr>
      <tr>
        <td>Continuous</td>
        <td>$69/mo or $690/yr</td>
        <td>Unlimited scans, 3 sites, priority support</td>
      </tr>
      <tr>
        <td>Enterprise</td>
        <td>$249/mo</td>
        <td>Unlimited sites, API access, SSO, white-label</td>
      </tr>
    </table>
  </div>

  <div class="section">
    <h2>7. Frequently Asked Questions</h2>
    <h3>Is Clarity compatible with my CMS/framework?</h3>
    <p>Yes! Clarity is a universal JavaScript agent that works with WordPress, React, Next.js, Vue, Angular, and any HTML-based website.</p>

    <h3>Does auto-fix break my site design?</h3>
    <p>No. Clarity uses non-invasive DOM manipulation and maintains your existing CSS. Plus, you can rollback any fix within 30 days.</p>

    <h3>How accurate is AI-generated alt text?</h3>
    <p>Clarity uses PromptFluid Nexus AI with 95%+ accuracy for common image types. Complex images are flagged for human review.</p>

    <h3>Can I customize which fixes run automatically?</h3>
    <p>Yes. Navigate to <strong>Settings > Auto-Fix Preferences</strong> to enable/disable specific fix types.</p>
  </div>

  <div class="section">
    <h2>8. Privacy & Security</h2>
    <p>PromptFluid Clarity is SOC 2 Type II compliant and maintains:</p>
    <ul>
      <li>Zero storage of user data beyond compliance reports</li>
      <li>End-to-end encryption for all API communications</li>
      <li>GDPR and CCPA compliance out of the box</li>
      <li>Optional self-hosted deployment for enterprise customers</li>
    </ul>
  </div>

  <div class="section">
    <h2>9. Support & Resources</h2>
    <p><strong>Need help?</strong> Contact us at:</p>
    <ul>
      <li>Email: <a href="mailto:support@promptfluid.com">support@promptfluid.com</a></li>
      <li>Documentation: <a href="https://docs.promptfluid.com/clarity">docs.promptfluid.com/clarity</a></li>
      <li>Community: <a href="https://discord.gg/promptfluid">discord.gg/promptfluid</a></li>
    </ul>
  </div>

  <footer style="margin-top: 60px; padding-top: 20px; border-top: 2px solid #7A5FFF; text-align: center; color: #666;">
    <p><strong>PromptFluid™</strong> — AI That Flows</p>
    <p>© 2025 PromptFluid. All rights reserved.</p>
  </footer>
</body>
</html>
    `;

    return new Response(
      format === 'pdf' ? manualHTML : JSON.stringify({ html: manualHTML, format }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': format === 'pdf' ? 'application/pdf' : 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Manual generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
