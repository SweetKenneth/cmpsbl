/**
 * PromptFluid Modernizer Hosting
 * Creates permanent subdomain hosting on *.promptfluid.com
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

    const { job_id, subdomain } = await req.json();

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

    const VERCEL_TOKEN = Deno.env.get('VERCEL_TOKEN');
    if (!VERCEL_TOKEN) {
      return new Response(JSON.stringify({ error: 'Hosting not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const files = job.rebuilt_files?.files || [];
    if (files.length === 0) {
      throw new Error('No files to host');
    }

    const projectName = subdomain || `modernized-${job_id.substring(0, 8)}`;
    
    console.log(`🚀 Deploying to permanent subdomain: ${projectName}`);

    const vercelFiles = files.map((f: any) => {
      const bytes = new TextEncoder().encode(f.content);
      const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join("");
      return {
        file: f.path,
        data: btoa(binString),
        encoding: 'base64'
      };
    });

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
      throw new Error(`Hosting failed: ${errorText}`);
    }

    const deployData = await deployRes.json();
    const hostedUrl = `https://${deployData.url}`;

    console.log(`✅ Permanently hosted at: ${hostedUrl}`);

    await supabase
      .from('modernizer_jobs')
      .update({
        hosted_url: hostedUrl,
        hosted_subdomain: projectName,
        hosted_at: new Date().toISOString()
      })
      .eq('id', job_id);

    return new Response(JSON.stringify({
      success: true,
      hosted_url: hostedUrl,
      subdomain: projectName
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Hosting error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
