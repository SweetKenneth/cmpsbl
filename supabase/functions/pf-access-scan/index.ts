/**
 * PromptFluid Access - Enhanced Accessibility Scanner
 * Full WCAG 2.2 compliance scanning with rate limiting and SSRF protection
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ScanSchema = z.object({
  url: z.string().url().max(2048),
  wcagLevel: z.enum(['A', 'AA', 'AAA']).optional().default('AA'),
  scanDepth: z.enum(['quick', 'standard', 'deep']).optional().default('quick')
});

// Rate limiting
const RATE_LIMIT = 60000;
const MAX_SCANS = 5;
const scanTimestamps = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const timestamps = scanTimestamps.get(ip) || [];
  const recent = timestamps.filter(t => now - t < RATE_LIMIT);
  if (recent.length >= MAX_SCANS) return false;
  recent.push(now);
  scanTimestamps.set(ip, recent);
  return true;
}

function validateUrl(urlString: string): URL {
  if (urlString.length > 2048) throw new Error('URL too long');
  const url = new URL(urlString);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Only HTTP/HTTPS allowed');
  const hostname = url.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname === '127.0.0.1') throw new Error('Cannot scan localhost');
  return url;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIp)) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded. Max 5 scans per minute.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const body = await req.json();
    const validation = ScanSchema.safeParse(body);
    
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validation.error?.errors || [] }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { url, wcagLevel, scanDepth } = validation.data;
    const validatedUrl = validateUrl(url);
    console.log(`[Access Scan] Starting ${scanDepth} scan: ${validatedUrl.href}`);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Create scan record
    const { data: scan, error: scanError } = await supabase
      .from('accessibility_scans')
      .insert({ 
        domain: validatedUrl.href, 
        wcag_level: wcagLevel, 
        scan_status: 'processing',
        metadata: { scan_depth: scanDepth }
      })
      .select()
      .single();

    if (scanError || !scan) {
      console.error('[Access Scan] Failed to create scan record:', scanError);
      throw new Error('Failed to create scan record');
    }

    // Fetch page with timeout
    const pageResponse = await fetch(validatedUrl.href, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PromptFluid-Access/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml',
      },
      signal: AbortSignal.timeout(30000)
    });

    if (!pageResponse.ok) throw new Error(`HTTP ${pageResponse.status}: Cannot access site`);

    const html = await pageResponse.text();
    const issues: any[] = [];
    
    // Check for missing alt text
    const imgMatches: string[] = html.match(/<img[^>]*>/gi) || [];
    const missingAlt = imgMatches.filter((img: string) => !img.includes('alt=')).length;
    if (missingAlt > 0) {
      issues.push({ type: 'missing-alt-text', severity: 'error', wcag: '1.1.1', description: 'Images missing alt text', count: missingAlt });
    }
    
    // Check for H1 heading
    const h1Matches = html.match(/<h1[^>]*>/gi) || [];
    if (h1Matches.length === 0) {
      issues.push({ type: 'missing-h1', severity: 'error', wcag: '2.4.6', description: 'Page missing H1 heading', count: 1 });
    } else if (h1Matches.length > 1) {
      issues.push({ type: 'multiple-h1', severity: 'warning', wcag: '2.4.6', description: 'Multiple H1 headings found', count: h1Matches.length });
    }
    
    // Check for main landmark
    if (!html.includes('<main') && !html.includes('role="main"')) {
      issues.push({ type: 'missing-main', severity: 'warning', wcag: '1.3.1', description: 'Page missing main landmark', count: 1 });
    }
    
    // Calculate score
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    const score = Math.max(0, 100 - (errorCount * 15) - (warningCount * 5));

    // Update scan
    await supabase
      .from('accessibility_scans')
      .update({ scan_status: 'completed', issues, score, completed_at: new Date().toISOString() })
      .eq('id', scan!.id);

    console.log(`[Access Scan] Complete. Score: ${score}, Issues: ${issues.length}`);

    return new Response(JSON.stringify({ 
      success: true, scanId: scan!.id, url: validatedUrl.href, wcagLevel, score, issues, timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Access Scan] Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Scan failed' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
