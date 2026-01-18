/**
 * Extension Registry - Manage substrate extensions and plugins
 * BYOK architecture - developers bring their own compute
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-developer-id, x-app-id',
};

interface ExtensionAction {
  action: 'register' | 'list' | 'get' | 'enable' | 'disable' | 'unregister' | 'invoke' | 'hooks';
  extension_id?: string;
  extension?: {
    name: string;
    version: string;
    description?: string;
    extension_type: 'brain_hook' | 'nexus_hook' | 'defense_hook' | 'dream_hook' | 'vision_hook' | 'custom';
    hook_point?: string;
    config?: Record<string, unknown>;
    endpoint_url?: string;
    schema?: Record<string, unknown>;
  };
  invoke_payload?: Record<string, unknown>;
  filters?: {
    type?: string;
    is_enabled?: boolean;
    author?: string;
  };
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

    const body: ExtensionAction = await req.json();
    const { action, extension_id, extension, invoke_payload, filters } = body;

    switch (action) {
      case 'register': {
        if (!extension || !developerId) {
          return new Response(
            JSON.stringify({ error: 'Missing extension data or developer ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Validate extension schema
        const validTypes = ['brain_hook', 'nexus_hook', 'defense_hook', 'dream_hook', 'vision_hook', 'custom'];
        if (!validTypes.includes(extension.extension_type)) {
          return new Response(
            JSON.stringify({ error: `Invalid extension_type. Must be one of: ${validTypes.join(', ')}` }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('substrate_extensions')
          .insert({
            name: extension.name,
            version: extension.version,
            description: extension.description,
            author_id: developerId,
            extension_type: extension.extension_type,
            hook_point: extension.hook_point,
            config: extension.config || {},
            endpoint_url: extension.endpoint_url,
            schema: extension.schema || {},
            is_enabled: true,
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, extension: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'list': {
        let query = supabase
          .from('substrate_extensions')
          .select('*')
          .order('created_at', { ascending: false });

        if (filters?.type) {
          query = query.eq('extension_type', filters.type);
        }
        if (filters?.is_enabled !== undefined) {
          query = query.eq('is_enabled', filters.is_enabled);
        }
        if (filters?.author) {
          query = query.eq('author_id', filters.author);
        }

        const { data, error } = await query;
        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, extensions: data, count: data?.length || 0 }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'get': {
        if (!extension_id) {
          return new Response(
            JSON.stringify({ error: 'Missing extension_id' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('substrate_extensions')
          .select('*')
          .eq('id', extension_id)
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, extension: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'enable': {
        if (!extension_id || !developerId) {
          return new Response(
            JSON.stringify({ error: 'Missing extension_id or developer ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('substrate_extensions')
          .update({ is_enabled: true, updated_at: new Date().toISOString() })
          .eq('id', extension_id)
          .eq('author_id', developerId)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, extension: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'disable': {
        if (!extension_id || !developerId) {
          return new Response(
            JSON.stringify({ error: 'Missing extension_id or developer ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { data, error } = await supabase
          .from('substrate_extensions')
          .update({ is_enabled: false, updated_at: new Date().toISOString() })
          .eq('id', extension_id)
          .eq('author_id', developerId)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, extension: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'unregister': {
        if (!extension_id || !developerId) {
          return new Response(
            JSON.stringify({ error: 'Missing extension_id or developer ID' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const { error } = await supabase
          .from('substrate_extensions')
          .delete()
          .eq('id', extension_id)
          .eq('author_id', developerId);

        if (error) throw error;

        return new Response(
          JSON.stringify({ success: true, message: 'Extension unregistered' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'invoke': {
        if (!extension_id || !invoke_payload) {
          return new Response(
            JSON.stringify({ error: 'Missing extension_id or payload' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Get extension details
        const { data: ext, error: extError } = await supabase
          .from('substrate_extensions')
          .select('*')
          .eq('id', extension_id)
          .eq('is_enabled', true)
          .single();

        if (extError || !ext) {
          return new Response(
            JSON.stringify({ error: 'Extension not found or disabled' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // If extension has an endpoint URL, proxy the call
        if (ext.endpoint_url) {
          const startTime = Date.now();
          
          try {
            const response = await fetch(ext.endpoint_url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                extension_id,
                payload: invoke_payload,
                config: ext.config,
              }),
            });

            const result = await response.json();
            const latency = Date.now() - startTime;

            // Update extension stats
            await supabase
              .from('substrate_extensions')
              .update({ 
                invocation_count: (ext.invocation_count || 0) + 1,
                last_invoked_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', extension_id);

            return new Response(
              JSON.stringify({ 
                success: true, 
                result, 
                latency_ms: latency,
                extension: { id: ext.id, name: ext.name, version: ext.version }
              }),
              { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          } catch (invokeError) {
            return new Response(
              JSON.stringify({ 
                error: 'Failed to invoke extension endpoint',
                details: invokeError instanceof Error ? invokeError.message : 'Unknown error'
              }),
              { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }
        }

        // For extensions without endpoints, just return config and schema
        return new Response(
          JSON.stringify({ 
            success: true, 
            extension: { 
              id: ext.id, 
              name: ext.name, 
              config: ext.config,
              schema: ext.schema,
            },
            message: 'Extension has no endpoint URL configured'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'hooks': {
        // Get all enabled hooks by type
        const hookType = filters?.type;
        
        let query = supabase
          .from('substrate_extensions')
          .select('id, name, version, extension_type, hook_point, config')
          .eq('is_enabled', true)
          .not('hook_point', 'is', null);

        if (hookType) {
          query = query.eq('extension_type', hookType);
        }

        const { data, error } = await query;
        if (error) throw error;

        // Group by hook point
        const hooks: Record<string, typeof data> = {};
        data?.forEach(ext => {
          const point = ext.hook_point || 'default';
          if (!hooks[point]) hooks[point] = [];
          hooks[point].push(ext);
        });

        return new Response(
          JSON.stringify({ success: true, hooks, count: data?.length || 0 }),
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
    console.error('Extension Registry error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
