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
    const { dateRange = '30d' } = await req.json();

    // TODO: Integrate with Google Analytics Data API
    // This requires GA4 API credentials and service account setup
    // For now, returning mock data structure
    
    const mockData = {
      summary: {
        users: 12847,
        pageViews: 45293,
        avgSessionDuration: 222, // seconds
        bounceRate: 42.3
      },
      timeSeries: [
        { date: '2025-01-25', views: 1240, users: 890 },
        { date: '2025-01-26', views: 1580, users: 1100 },
        { date: '2025-01-27', views: 1890, users: 1340 },
        { date: '2025-01-28', views: 2100, users: 1520 },
        { date: '2025-01-29', views: 1950, users: 1380 },
        { date: '2025-01-30', views: 2280, users: 1650 },
        { date: '2025-01-31', views: 2450, users: 1780 },
      ],
      topPages: [
        { path: '/', views: 4523 },
        { path: '/projects/defense', views: 3821 },
        { path: '/solutions', views: 2940 },
        { path: '/blog', views: 2140 },
        { path: '/about', views: 1876 },
      ],
      devices: {
        desktop: 45,
        mobile: 40,
        tablet: 15
      },
      realtime: {
        activeUsers: 23,
        topActivePage: '/projects/defense',
        topSource: 'google'
      }
    };

    return new Response(
      JSON.stringify(mockData),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Analytics function error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
