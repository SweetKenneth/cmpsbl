/**
 * Example: Substrate Extensions
 * 
 * Extend substrate functionality with custom hooks:
 * - brain_hook: Memory and learning extensions
 * - nexus_hook: AI routing extensions
 * - defense_hook: Security extensions
 * - dream_hook: Dream processing extensions
 * - vision_hook: Observability extensions
 * 
 * BYOK: Extensions run on YOUR infrastructure with YOUR credentials.
 */

import { SubstrateClient } from '../substrate-client';

const substrate = new SubstrateClient({
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!,
  developerId: process.env.DEVELOPER_ID!,
  appId: process.env.APP_ID!
});

/**
 * Register a brain extension for semantic enrichment
 */
async function registerBrainExtension() {
  const extension = await substrate.extensions.register({
    name: 'semantic-enricher',
    version: '1.0.0',
    description: 'Enriches memories with semantic metadata before storage',
    extension_type: 'brain_hook',
    hook_point: 'pre_remember', // Runs before memory is stored
    endpoint_url: 'https://your-api.com/enrich',
    config: {
      model: 'text-embedding-3-small',
      add_keywords: true,
      add_sentiment: true
    }
  });

  console.log('✓ Brain extension registered:', extension.data?.id);
  return extension.data?.id;
}

/**
 * Register a defense extension for custom threat detection
 */
async function registerDefenseExtension() {
  const extension = await substrate.extensions.register({
    name: 'geo-blocker',
    version: '1.0.0',
    description: 'Blocks requests from specific geographic regions',
    extension_type: 'defense_hook',
    hook_point: 'pre_analyze', // Runs before fingerprint analysis
    endpoint_url: 'https://your-api.com/geo-check',
    config: {
      blocked_countries: ['XX', 'YY'],
      allow_vpn: false
    }
  });

  console.log('✓ Defense extension registered:', extension.data?.id);
  return extension.data?.id;
}

/**
 * Register a nexus extension for custom routing logic
 */
async function registerNexusExtension() {
  const extension = await substrate.extensions.register({
    name: 'cost-optimizer',
    version: '1.0.0',
    description: 'Routes AI calls to cheapest available provider',
    extension_type: 'nexus_hook',
    hook_point: 'pre_route', // Runs before routing decision
    endpoint_url: 'https://your-api.com/optimize-route',
    config: {
      max_cost_per_1k_tokens: 0.01,
      preferred_providers: ['groq', 'together']
    }
  });

  console.log('✓ Nexus extension registered:', extension.data?.id);
  return extension.data?.id;
}

/**
 * Register a dream extension for dream analysis
 */
async function registerDreamExtension() {
  const extension = await substrate.extensions.register({
    name: 'dream-analyzer',
    version: '1.0.0',
    description: 'Analyzes dreams for symbolic patterns',
    extension_type: 'dream_hook',
    hook_point: 'post_feed', // Runs after dream is fed
    endpoint_url: 'https://your-api.com/analyze-dream',
    config: {
      extract_symbols: true,
      detect_themes: true,
      jungian_analysis: true
    }
  });

  console.log('✓ Dream extension registered:', extension.data?.id);
  return extension.data?.id;
}

/**
 * Register a vision extension for custom metrics
 */
async function registerVisionExtension() {
  const extension = await substrate.extensions.register({
    name: 'custom-metrics',
    version: '1.0.0',
    description: 'Exports metrics to external monitoring system',
    extension_type: 'vision_hook',
    hook_point: 'post_metrics', // Runs after metrics collection
    endpoint_url: 'https://your-api.com/export-metrics',
    config: {
      export_to: 'datadog',
      datadog_api_key: 'REDACTED', // Use secrets
      include_custom: ['brain_efficiency', 'dream_quality']
    }
  });

  console.log('✓ Vision extension registered:', extension.data?.id);
  return extension.data?.id;
}

/**
 * List and manage extensions
 */
async function manageExtensions() {
  // List all extensions
  const all = await substrate.extensions.list();
  console.log('All extensions:', all.data?.extensions?.map(e => ({
    name: e.name,
    type: e.extension_type,
    enabled: e.is_enabled
  })));

  // Filter by type
  const brainHooks = await substrate.extensions.list({ 
    type: 'brain_hook', 
    is_enabled: true 
  });
  console.log('Active brain hooks:', brainHooks.data?.extensions?.length);

  // Get hooks for a specific point
  const preRememberHooks = await substrate.extensions.hooks('pre_remember');
  console.log('Pre-remember hooks:', preRememberHooks.data?.hooks?.length);

  return all.data;
}

/**
 * Enable/disable extensions
 */
async function toggleExtension(extensionId: string, enable: boolean) {
  if (enable) {
    await substrate.extensions.enable(extensionId);
    console.log('✓ Extension enabled');
  } else {
    await substrate.extensions.disable(extensionId);
    console.log('✓ Extension disabled');
  }
}

/**
 * Invoke an extension manually
 */
async function invokeExtension(extensionId: string, data: any) {
  const result = await substrate.extensions.invoke(extensionId, data);
  console.log('Extension result:', result.data);
  return result.data;
}

/**
 * Create a custom extension (full example)
 */
async function createCustomExtension() {
  const extension = await substrate.extensions.register({
    name: 'slack-notifier',
    version: '1.0.0',
    description: 'Sends notifications to Slack for important events',
    extension_type: 'custom',
    hook_point: 'on_event', // Custom hook point
    endpoint_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL',
    config: {
      channel: '#substrate-alerts',
      notify_on: ['high_risk_detection', 'quota_exceeded', 'system_error'],
      mention_on_critical: '@channel'
    }
  });

  return extension.data;
}

/**
 * Unregister an extension
 */
async function unregisterExtension(extensionId: string) {
  await substrate.extensions.unregister(extensionId);
  console.log('✓ Extension unregistered');
}

// Main
async function main() {
  console.log('=== Substrate Extensions Example ===\n');

  // Register various extensions
  const brainExtId = await registerBrainExtension();
  const defenseExtId = await registerDefenseExtension();
  const nexusExtId = await registerNexusExtension();
  
  // List all extensions
  await manageExtensions();

  // Toggle an extension
  if (brainExtId) {
    await toggleExtension(brainExtId, false);
    await toggleExtension(brainExtId, true);
  }

  // Invoke extension manually
  if (defenseExtId) {
    await invokeExtension(defenseExtId, { 
      ip: '1.2.3.4', 
      country: 'US' 
    });
  }

  console.log('\n✓ Extensions example complete');
}

main().catch(console.error);

export {
  registerBrainExtension,
  registerDefenseExtension,
  registerNexusExtension,
  registerDreamExtension,
  registerVisionExtension,
  manageExtensions,
  toggleExtension,
  invokeExtension,
  createCustomExtension,
  unregisterExtension
};
