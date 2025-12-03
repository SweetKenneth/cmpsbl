/**
 * PromptFluid Modernizer Preview
 * Creates E2B sandbox for live site preview
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { job_id } = await req.json();

    const { data: job, error: jobError } = await supabase
      .from('modernizer_jobs')
      .select('*')
      .eq('id', job_id)
      .eq('user_id', user.id)
      .single();

    if (jobError || !job) {
      return new Response(JSON.stringify({ error: 'Job not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Use Vercel for preview deployment (more reliable with HTTPS)
    const VERCEL_TOKEN = Deno.env.get('VERCEL_TOKEN');
    if (!VERCEL_TOKEN) {
      console.error('❌ VERCEL_TOKEN not found in environment');
      return new Response(JSON.stringify({ error: 'Vercel not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('🏗️ Creating static site deployment...');
    
    const files = job.rebuilt_files?.files || [];
    if (files.length === 0) {
      throw new Error('No files to preview');
    }

    const projectName = `pf-preview-${job_id.substring(0, 8)}`;

    // Ensure we have an index.html at the root
    const hasIndexHtml = files.some((f: any) => f.path === 'index.html');
    if (!hasIndexHtml) {
      throw new Error('No index.html found in rebuilt files');
    }

    console.log(`📦 Preparing ${files.length} static file(s) for deployment`);

    // Vercel v13 requires base64-encoded file content with encoding field
    const vercelFiles = files.map((f: any) => {
      // Encode content as base64
      const bytes = new TextEncoder().encode(f.content);
      const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
      return {
        file: f.path,
        data: btoa(binString),
        encoding: 'base64' // CRITICAL: Tell Vercel this is base64-encoded
      };
    });

    console.log(`📤 Deploying static site to Vercel...`);

    const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: projectName,
        files: vercelFiles,
        projectSettings: {
          framework: null,
          devCommand: null,
          installCommand: null,
          buildCommand: null,
          outputDirectory: null
        },
        target: 'production'
      })
    });

    if (!deployRes.ok) {
      const errorText = await deployRes.text();
      console.error('❌ Vercel deploy failed:', errorText);
      throw new Error(`Vercel deploy failed: ${errorText}`);
    }

    const deployData = await deployRes.json();
    const previewUrl = `https://${deployData.url}`;

    console.log(`✅ Preview deployed to: ${previewUrl}`);

    // Save preview URL
    await supabase
      .from('modernizer_jobs')
      .update({
        preview_url: previewUrl,
        vercel_deployment_id: deployData.id
      })
      .eq('id', job_id);

    return new Response(JSON.stringify({
      success: true,
      preview_url: previewUrl,
      deployment_id: deployData.id
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Preview error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
