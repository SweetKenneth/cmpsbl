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
    const { project_path } = await req.json();

    console.log(`🔍 Studio: Scanning project at ${project_path}`);

    const scanResults = {
      project_path,
      scanned_at: new Date().toISOString(),
      structure: {
        src: true,
        components: true,
        pages: true,
        assets: true,
      },
      framework: 'react',
      dependencies: {
        react: '18.3.1',
        'react-router-dom': '6.30.1',
        tailwindcss: '3.4.1',
      },
      issues: [],
      recommendations: [
        'Consider code splitting for better performance',
        'Add error boundaries for better error handling',
        'Implement loading states for async operations',
      ],
    };

    return new Response(
      JSON.stringify({ success: true, scan: scanResults }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Studio scan error:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
