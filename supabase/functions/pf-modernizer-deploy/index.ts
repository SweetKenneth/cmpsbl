/**
 * PromptFluid Modernizer Deploy
 * Deploys modernized sites to Vercel with domain management
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

    const { action, job_id, domain } = await req.json();

    // Get job data
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

    if (action === 'deploy') {
      // Deploy to Vercel
      const VERCEL_TOKEN = Deno.env.get('VERCEL_TOKEN');
      if (!VERCEL_TOKEN) {
        return new Response(JSON.stringify({ error: 'Vercel not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const files = job.rebuilt_files?.files || [];
      const projectName = `pf-site-${job_id.substring(0, 8)}`;

      // Add package.json with vite if not present
      const hasPackageJson = files.some((f: any) => f.path === 'package.json');
      if (!hasPackageJson) {
        files.push({
          path: 'package.json',
          content: JSON.stringify({
            name: projectName,
            private: true,
            version: '1.0.0',
            type: 'module',
            scripts: {
              dev: 'vite',
              build: 'vite build',
              preview: 'vite preview'
            },
            dependencies: {
              react: '^18.3.1',
              'react-dom': '^18.3.1'
            },
            devDependencies: {
              '@vitejs/plugin-react': '^4.3.4',
              vite: '^5.4.11'
            }
          }, null, 2)
        });

        // Add vite.config.js if not present
        const hasViteConfig = files.some((f: any) => f.path === 'vite.config.js');
        if (!hasViteConfig) {
          files.push({
            path: 'vite.config.js',
            content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
          });
        }
      }

      console.log(`📦 Creating Vercel project: ${projectName}`);
      
      // First, create or get the project
      const projectRes = await fetch('https://api.vercel.com/v9/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: projectName,
          framework: 'vite'
        })
      });

      let projectId;
      if (projectRes.status === 409) {
        // Project already exists, get it
        const existingRes = await fetch(`https://api.vercel.com/v9/projects/${projectName}`, {
          headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
        });
        const existingData = await existingRes.json();
        projectId = existingData.id;
      } else if (projectRes.ok) {
        const projectData = await projectRes.json();
        projectId = projectData.id;
      } else {
        throw new Error(`Failed to create project: ${await projectRes.text()}`);
      }

      console.log(`✅ Project ID: ${projectId}`);
      console.log(`📤 Deploying ${files.length} files...`);

      // Vercel v13 expects files as an array of {file: path, data: base64}
      const vercelFiles = files.map((f: any) => ({
        file: f.path,
        data: btoa(unescape(encodeURIComponent(f.content)))
      }));

      const deployRes = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: projectName,
          project: projectId,
          files: vercelFiles,
          target: 'production'
        })
      });

      if (!deployRes.ok) {
        const errorText = await deployRes.text();
        console.error('❌ Vercel deploy failed:', errorText);
        throw new Error(`Vercel deploy failed: ${errorText}`);
      }

      const deployData = await deployRes.json();
      const deployUrl = `https://${deployData.url}`;

      console.log(`🚀 Deployed to: ${deployUrl}`);

      // Save deployment info
      await supabase
        .from('modernizer_jobs')
        .update({
          preview_url: deployUrl,
          vercel_deployment_id: deployData.id,
          vercel_project_id: projectId
        })
        .eq('id', job_id);

      return new Response(JSON.stringify({
        success: true,
        url: deployUrl,
        deployment_id: deployData.id,
        project_id: projectId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'add-domain') {
      const VERCEL_TOKEN = Deno.env.get('VERCEL_TOKEN');
      const VERCEL_PROJECT_ID = job.vercel_project_id;

      if (!VERCEL_TOKEN || !VERCEL_PROJECT_ID) {
        return new Response(JSON.stringify({ error: 'Deploy to Vercel first' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log(`🌐 Adding domain ${domain} to project ${VERCEL_PROJECT_ID}...`);

      // Add domain to Vercel project
      const domainRes = await fetch(`https://api.vercel.com/v9/projects/${VERCEL_PROJECT_ID}/domains`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VERCEL_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: domain })
      });

      if (!domainRes.ok) {
        const errorText = await domainRes.text();
        console.error('❌ Domain add failed:', errorText);
        throw new Error(`Domain add failed: ${errorText}`);
      }

      const domainData = await domainRes.json();
      console.log(`✅ Domain added: ${domain}`);

      return new Response(JSON.stringify({
        success: true,
        domain: domainData
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'export') {
      // Return files as ZIP-ready JSON
      return new Response(JSON.stringify({
        success: true,
        files: job.rebuilt_files?.files || []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Deploy error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
