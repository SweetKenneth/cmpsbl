/**
 * pf-substrate-package — Complete Substrate Export Package
 * 
 * Creates a complete downloadable package with:
 * - All database data (memories, knowledge graph, events, config)
 * - Frontend configuration (themes, layouts, branding)
 * - Install manifest for restoration wizard
 * - Module activation settings
 * 
 * @version 1.0.0
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUBSTRATE_VERSION = "5.5.0";

// Complete table list for full export
const DATA_TABLES = [
  'brain_memories',
  'brain_memory_hot',
  'brain_memory_warm',
  'brain_memory_cold',
  'brain_graph_nodes',
  'brain_graph_edges',
  'brain_events',
  'brain_orchestrator_state',
  'brain_cross_insights',
  'brain_curiosity_log',
  'brain_daily_reports',
  'cascade_conversations',
  'cascade_dreams',
  'learning_logs',
  'defense_events',
  'defense_rules',
  'ai_daily_quota',
  'pf_brain_anomalies',
];

const CONFIG_TABLES = [
  'brain_curiosity_settings',
  'substrate_install_config',
];

// Secrets manifest for AI providers
const SECRETS_MANIFEST = [
  { key: 'GROQ_API_KEY', provider: 'Groq', required: false },
  { key: 'CEREBRAS_API_KEY', provider: 'Cerebras', required: false },
  { key: 'GOOGLE_AI_API_KEY', provider: 'Google AI', required: false },
  { key: 'DEEPSEEK_API_KEY', provider: 'DeepSeek', required: false },
  { key: 'TOGETHER_API_KEY', provider: 'Together AI', required: false },
  { key: 'HYPERBOLIC_API_KEY', provider: 'Hyperbolic', required: false },
  { key: 'PERPLEXITY_API_KEY', provider: 'Perplexity', required: false },
  { key: 'OPENAI_API_KEY', provider: 'OpenAI', required: false },
  { key: 'RESEND_API_KEY', provider: 'Resend Email', required: false },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
  const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ success: false, error: 'Server misconfiguration' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  try {
    const body = await req.json();
    const { 
      action = 'export',
      include_data = true,
      include_config = true,
      export_type = 'sellable', // 'sellable' | 'full' | 'minimal'
    } = body;

    const now = new Date();
    const packageId = `pkg_${Date.now().toString(36)}_${crypto.randomUUID().substring(0, 8)}`;

    console.log(`📦 Creating ${export_type} substrate package: ${packageId}`);

    // ============ COLLECT DATA ============
    const packageData: Record<string, unknown[]> = {};
    const dataCounts: Record<string, number> = {};

    if (include_data) {
      for (const table of DATA_TABLES) {
        try {
          const { data, error, count } = await supabase
            .from(table)
            .select('*', { count: 'exact' })
            .limit(50000);

          if (!error && data) {
            packageData[table] = data;
            dataCounts[table] = count || data.length;
          }
        } catch (e) {
          console.warn(`⚠️ Could not export ${table}:`, e);
          packageData[table] = [];
          dataCounts[table] = 0;
        }
      }
    }

    // ============ COLLECT CONFIG ============
    const configData: Record<string, unknown> = {};
    
    if (include_config) {
      for (const table of CONFIG_TABLES) {
        try {
          const { data, error } = await supabase.from(table).select('*');
          if (!error && data) {
            configData[table] = data;
          }
        } catch {
          configData[table] = [];
        }
      }
    }

    // ============ INSTALL WIZARD CONFIG ============
    const installWizard = {
      version: '1.0.0',
      steps: [
        {
          id: 'branding',
          title: 'Branding',
          description: 'Set your company name, logo, and tagline',
          fields: [
            { key: 'company_name', type: 'text', label: 'Company Name', required: true },
            { key: 'logo_url', type: 'url', label: 'Logo URL (optional)', required: false },
            { key: 'tagline', type: 'text', label: 'Tagline', required: false },
            { key: 'support_email', type: 'email', label: 'Support Email', required: false },
          ]
        },
        {
          id: 'theme',
          title: 'Theme',
          description: 'Choose your visual theme',
          options: [
            { value: 'dark_professional', label: 'Dark Professional', preview: '🌙' },
            { value: 'light_corporate', label: 'Light Corporate', preview: '☀️' },
            { value: 'minimal_mono', label: 'Minimal Mono', preview: '⚫' },
            { value: 'neon_cyber', label: 'Neon Cyber', preview: '💜' },
          ]
        },
        {
          id: 'layout',
          title: 'Homepage Layout',
          description: 'Choose your homepage style',
          options: [
            { value: 'full_marketing', label: 'Full Marketing', description: 'Complete landing with hero, features, pricing' },
            { value: 'dashboard_only', label: 'Dashboard Only', description: 'Skip marketing, direct to dashboard' },
            { value: 'minimal_landing', label: 'Minimal Landing', description: 'Simple hero + login' },
          ]
        },
        {
          id: 'modules',
          title: 'Modules',
          description: 'Activate the modules you need',
          modules: [
            { key: 'core', name: 'Core Kernel', required: true, description: 'Central orchestration' },
            { key: 'ripple', name: 'Ripple Bus', required: true, description: 'Message routing' },
            { key: 'access', name: 'Access Layer', required: true, description: 'API & identity' },
            { key: 'brain', name: 'Brain', required: false, description: 'Memory & cognition' },
            { key: 'decode', name: 'Decode', required: false, description: 'Chat interface' },
            { key: 'defense', name: 'Defense', required: false, description: 'Security monitoring' },
            { key: 'nexus', name: 'Nexus', required: false, description: 'External research' },
            { key: 'vision', name: 'Vision', required: false, description: 'Image analysis' },
            { key: 'dream', name: 'Dream', required: false, description: 'Autonomous learning' },
            { key: 'system', name: 'System', required: true, description: 'Core utilities' },
            { key: 'modernizer', name: 'Modernizer', required: false, description: 'Code migration' },
          ]
        },
        {
          id: 'ai_providers',
          title: 'AI Providers',
          description: 'Configure your AI API keys',
          providers: SECRETS_MANIFEST.map(s => ({
            key: s.key,
            name: s.provider,
            required: s.required,
          }))
        },
        {
          id: 'quotas',
          title: 'Storage & Limits',
          description: 'Set operational limits',
          settings: [
            { key: 'memory_hot_limit', label: 'Hot Memory Limit', default: 1000, type: 'number' },
            { key: 'memory_warm_limit', label: 'Warm Memory Limit', default: 5000, type: 'number' },
            { key: 'backup_retention_days', label: 'Backup Retention (days)', default: 30, type: 'number' },
            { key: 'rate_limit_per_minute', label: 'Rate Limit (req/min)', default: 60, type: 'number' },
          ]
        },
      ],
    };

    // ============ BUILD PACKAGE ============
    const substratePackage = {
      _manifest: {
        package_id: packageId,
        package_type: export_type,
        substrate_version: SUBSTRATE_VERSION,
        created_at: now.toISOString(),
        compatible_versions: ['4.0.0', '4.1.0', '4.1.1'],
        total_records: Object.values(dataCounts).reduce((a, b) => a + b, 0),
        data_tables: Object.keys(dataCounts),
        includes: {
          data: include_data,
          config: include_config,
          install_wizard: true,
        },
      },
      _install_wizard: installWizard,
      _secrets_required: export_type === 'sellable' ? SECRETS_MANIFEST : [],
      _restore_instructions: {
        steps: [
          '1. Navigate to Substrate OS → Backups → Import',
          '2. Upload this package file',
          '3. Complete the installation wizard',
          '4. Configure API keys for AI providers',
          '5. Verify with brain.status()',
        ],
        notes: export_type === 'sellable' 
          ? 'This package includes customizable homepage options. API keys must be configured separately.'
          : 'This is a complete backup including all data and configuration.',
      },
      config: configData,
      data: include_data ? packageData : {},
    };

    // Calculate size
    const packageJson = JSON.stringify(substratePackage);
    const sizeBytes = new TextEncoder().encode(packageJson).length;

    // Store in backups bucket
    const dateStr = now.toISOString().split('T')[0];
    const filePath = `packages/${dateStr}/${packageId}.json`;

    const { error: uploadError } = await supabase.storage
      .from('backups')
      .upload(filePath, packageJson, {
        contentType: 'application/json',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
    }

    // Track export
    await supabase.from('backup_exports').insert({
      backup_id: packageId,
      export_type: `package_${export_type}`,
      file_path: filePath,
      file_size_bytes: sizeBytes,
      includes_secrets: false,
      download_token: packageId,
      expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
    });

    // Log event
    await supabase.from('brain_events').insert({
      event_type: 'substrate_package_export',
      module: 'system',
      outcome: 'success',
      data: {
        package_id: packageId,
        export_type,
        size_bytes: sizeBytes,
        data_counts: dataCounts,
      },
    });

    console.log(`✅ Package created: ${packageId} (${(sizeBytes / 1024 / 1024).toFixed(2)} MB)`);

    // Try to generate signed download URL if upload succeeded
    let downloadUrl = '';
    if (!uploadError) {
      const { data: signedUrl } = await supabase.storage
        .from('backups')
        .createSignedUrl(filePath, 3600); // 1 hour
      downloadUrl = signedUrl?.signedUrl || '';
    }

    // If no signed URL, create a data URL for direct download
    // This ensures the download always works even if storage fails
    const dataUrl = downloadUrl || `data:application/json;charset=utf-8,${encodeURIComponent(packageJson)}`;

    return new Response(
      JSON.stringify({
        success: true,
        package_id: packageId,
        export_type,
        file_path: uploadError ? null : filePath,
        size_bytes: sizeBytes,
        size_mb: (sizeBytes / 1024 / 1024).toFixed(2),
        total_records: Object.values(dataCounts).reduce((a, b) => a + b, 0),
        data_counts: dataCounts,
        download_url: dataUrl,
        wizard_steps: installWizard.steps.length,
        expires_at: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        message: `✅ ${export_type.charAt(0).toUpperCase() + export_type.slice(1)} package ready for download`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Package creation failed:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
