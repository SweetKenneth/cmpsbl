/**
 * Integration Bus - Connects external services to the substrate
 * Handles: Stripe, Twilio, Shopify, n8n, webhooks, etc.
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-developer-id, x-app-id',
};

interface IntegrationRequest {
  action: 'register' | 'call' | 'webhook' | 'list' | 'status';
  integration_type?: string;
  integration_name?: string;
  config?: Record<string, unknown>;
  credentials?: Record<string, string>;
  method?: string;
  endpoint?: string;
  payload?: Record<string, unknown>;
}

// Integration type definitions with their capabilities
const INTEGRATION_TYPES: Record<string, {
  name: string;
  baseUrl: string;
  authType: 'bearer' | 'basic' | 'header' | 'query';
  authHeader?: string;
  capabilities: string[];
}> = {
  stripe: {
    name: 'Stripe',
    baseUrl: 'https://api.stripe.com/v1',
    authType: 'bearer',
    capabilities: ['payments', 'subscriptions', 'customers', 'invoices'],
  },
  twilio: {
    name: 'Twilio',
    baseUrl: 'https://api.twilio.com/2010-04-01',
    authType: 'basic',
    capabilities: ['sms', 'voice', 'verify'],
  },
  sendgrid: {
    name: 'SendGrid',
    baseUrl: 'https://api.sendgrid.com/v3',
    authType: 'bearer',
    capabilities: ['email', 'templates'],
  },
  shopify: {
    name: 'Shopify',
    baseUrl: 'https://{shop}.myshopify.com/admin/api/2024-01',
    authType: 'header',
    authHeader: 'X-Shopify-Access-Token',
    capabilities: ['products', 'orders', 'customers', 'inventory'],
  },
  n8n: {
    name: 'n8n',
    baseUrl: '{webhook_url}',
    authType: 'header',
    authHeader: 'X-N8N-API-KEY',
    capabilities: ['workflow', 'automation'],
  },
  slack: {
    name: 'Slack',
    baseUrl: 'https://slack.com/api',
    authType: 'bearer',
    capabilities: ['messages', 'channels', 'users'],
  },
  discord: {
    name: 'Discord',
    baseUrl: 'https://discord.com/api/v10',
    authType: 'bearer',
    capabilities: ['messages', 'webhooks'],
  },
  webhook: {
    name: 'Custom Webhook',
    baseUrl: '{webhook_url}',
    authType: 'header',
    capabilities: ['http'],
  },
};

// Simple encryption for credentials
function encryptCredential(value: string, salt: string): string {
  let result = '';
  for (let i = 0; i < value.length; i++) {
    result += String.fromCharCode(value.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
  }
  return btoa(result);
}

function decryptCredential(encrypted: string, salt: string): string {
  const decoded = atob(encrypted);
  let result = '';
  for (let i = 0; i < decoded.length; i++) {
    result += String.fromCharCode(decoded.charCodeAt(i) ^ salt.charCodeAt(i % salt.length));
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const developerId = req.headers.get('x-developer-id');
    const appId = req.headers.get('x-app-id');
    
    if (!developerId || !appId) {
      return new Response(
        JSON.stringify({ error: 'Missing x-developer-id or x-app-id headers' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: IntegrationRequest = await req.json();
    const { action } = body;

    switch (action) {
      case 'register': {
        const { integration_type, integration_name, config, credentials } = body;
        
        if (!integration_type || !integration_name) {
          return new Response(
            JSON.stringify({ error: 'Missing integration_type or integration_name' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const integrationType = INTEGRATION_TYPES[integration_type];
        if (!integrationType) {
          return new Response(
            JSON.stringify({ 
              error: `Unknown integration type: ${integration_type}`,
              available: Object.keys(INTEGRATION_TYPES),
            }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Encrypt credentials
        const salt = Deno.env.get('INTEGRATION_ENCRYPTION_SALT') || developerId;
        const credentialsRef = credentials ? 
          encryptCredential(JSON.stringify(credentials), salt) : null;

        const { data, error } = await supabase
          .from('substrate_integrations')
          .upsert({
            developer_id: developerId,
            app_id: appId,
            integration_type,
            integration_name,
            config: config || {},
            credentials_ref: credentialsRef,
            webhook_url: config?.webhook_url as string,
            is_active: true,
          }, {
            onConflict: 'developer_id,app_id,integration_type,integration_name',
          })
          .select()
          .single();

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            integration: {
              id: data.id,
              type: integration_type,
              name: integration_name,
              capabilities: integrationType.capabilities,
            },
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'call': {
        const { integration_type, integration_name, method = 'POST', endpoint, payload } = body;

        // Get integration config
        const { data: integration, error: intError } = await supabase
          .from('substrate_integrations')
          .select('*')
          .eq('developer_id', developerId)
          .eq('app_id', appId)
          .eq('integration_type', integration_type)
          .eq('integration_name', integration_name || integration_type)
          .eq('is_active', true)
          .single();

        if (intError || !integration) {
          return new Response(
            JSON.stringify({ 
              error: `Integration not found: ${integration_type}`,
              hint: 'Use substrate.integrations.register() first',
            }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Decrypt credentials
        const salt = Deno.env.get('INTEGRATION_ENCRYPTION_SALT') || developerId;
        const credentials = integration.credentials_ref ? 
          JSON.parse(decryptCredential(integration.credentials_ref, salt)) : {};

        const integrationType = INTEGRATION_TYPES[integration_type as keyof typeof INTEGRATION_TYPES];
        
        // Build URL
        let baseUrl = integrationType?.baseUrl || '';
        if (baseUrl.includes('{shop}')) {
          baseUrl = baseUrl.replace('{shop}', integration.config?.shop as string || '');
        }
        if (baseUrl.includes('{webhook_url}')) {
          baseUrl = integration.webhook_url || '';
        }
        
        const url = endpoint ? `${baseUrl}${endpoint}` : baseUrl;

        // Build headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (integrationType.authType === 'bearer') {
          headers['Authorization'] = `Bearer ${credentials.api_key || credentials.access_token}`;
        } else if (integrationType.authType === 'basic') {
          const auth = btoa(`${credentials.account_sid || credentials.username}:${credentials.auth_token || credentials.password}`);
          headers['Authorization'] = `Basic ${auth}`;
        } else if (integrationType.authType === 'header' && integrationType.authHeader) {
          headers[integrationType.authHeader] = credentials.api_key || credentials.access_token || '';
        }

        // Make the request
        const startTime = Date.now();
        const response = await fetch(url, {
          method,
          headers,
          body: method !== 'GET' ? JSON.stringify(payload) : undefined,
        });

        const result = await response.json();
        const latencyMs = Date.now() - startTime;

        // Update integration stats
        await supabase
          .from('substrate_integrations')
          .update({
            last_called_at: new Date().toISOString(),
            call_count: (integration.call_count || 0) + 1,
            error_count: response.ok ? integration.error_count : (integration.error_count || 0) + 1,
          })
          .eq('id', integration.id);

        return new Response(
          JSON.stringify({
            success: response.ok,
            status: response.status,
            data: result,
            latency_ms: latencyMs,
          }),
          { 
            status: response.ok ? 200 : response.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'list': {
        const { data, error } = await supabase
          .from('substrate_integrations')
          .select('id, integration_type, integration_name, config, is_active, last_called_at, call_count, error_count')
          .eq('developer_id', developerId)
          .eq('app_id', appId);

        if (error) {
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({
            integrations: data,
            available_types: Object.entries(INTEGRATION_TYPES).map(([key, value]) => ({
              type: key,
              name: value.name,
              capabilities: value.capabilities,
            })),
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'status': {
        return new Response(
          JSON.stringify({
            status: 'operational',
            available_integrations: Object.keys(INTEGRATION_TYPES),
            version: '1.0.0',
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        return new Response(
          JSON.stringify({ error: `Unknown action: ${action}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

  } catch (error: unknown) {
    console.error('Integration Bus error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
