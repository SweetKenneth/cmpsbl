import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Industry-standard behavioral patterns
const HUMAN_PATTERNS = {
  mouseSpeed: { min: 50, max: 500, ideal: 150 },
  clickInterval: { min: 200, max: 30000, suspicious: 50 },
  keyboardTiming: { min: 50, max: 500, suspicious: 20 },
  scrollPattern: { minVariation: 0.3, maxSpeed: 5000 },
  navigationTiming: { minPageTime: 2000, maxPageTime: 600000 }
};

const BehavioralDataSchema = z.object({
  fingerprint_hash: z.string().min(1).max(128),
  mouse_movements: z.array(z.object({
    x: z.number(),
    y: z.number(),
    timestamp: z.number(),
  })).max(10000),
  keyboard_events: z.array(z.object({
    key: z.string().max(50),
    timestamp: z.number(),
    type: z.string().max(50),
  })).max(10000),
  scroll_events: z.array(z.object({
    scrollY: z.number(),
    timestamp: z.number(),
  })).max(1000),
  click_events: z.array(z.object({
    x: z.number(),
    y: z.number(),
    timestamp: z.number(),
  })).max(1000),
  page_focus_times: z.array(z.object({
    focused: z.boolean(),
    timestamp: z.number(),
  })).max(1000),
});

type BehavioralData = z.infer<typeof BehavioralDataSchema>;

interface BehavioralScore {
  overall_score: number;
  risk_level: 'human' | 'suspicious' | 'bot';
  analysis: {
    mouse_score: number;
    keyboard_score: number;
    scroll_score: number;
    timing_score: number;
  };
  flags: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    const validation = BehavioralDataSchema.safeParse(rawData);
    
    if (!validation.success) {
      console.error('[Behavioral Analysis] Invalid data format:', validation.error);
      return new Response(
        JSON.stringify({ error: 'Invalid data format' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    const behavioralData: BehavioralData = validation.data;
    console.log('[Behavioral Analysis] Analyzing enhanced detection:', behavioralData.fingerprint_hash);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const flags: string[] = [];
    let mouseScore = 100;
    let keyboardScore = 100;
    let scrollScore = 100;
    let timingScore = 100;

    // ENHANCED MOUSE MOVEMENT ANALYSIS
    if (behavioralData.mouse_movements.length > 5) {
      const movements = behavioralData.mouse_movements;
      
      let totalSpeed = 0;
      let speedVariance = 0;
      const speeds = [];
      
      for (let i = 1; i < movements.length; i++) {
        const dx = movements[i].x - movements[i-1].x;
        const dy = movements[i].y - movements[i-1].y;
        const dt = movements[i].timestamp - movements[i-1].timestamp;
        const speed = Math.sqrt(dx*dx + dy*dy) / (dt || 1);
        speeds.push(speed);
        totalSpeed += speed;
      }
      
      const avgSpeed = totalSpeed / (movements.length - 1);
      speeds.forEach(speed => {
        speedVariance += Math.pow(speed - avgSpeed, 2);
      });
      speedVariance = Math.sqrt(speedVariance / speeds.length);
      
      // Bot indicators: too fast, too slow, or too consistent
      if (avgSpeed < HUMAN_PATTERNS.mouseSpeed.min || avgSpeed > HUMAN_PATTERNS.mouseSpeed.max) {
        mouseScore -= 25;
        flags.push('abnormal_mouse_speed');
      }
      
      if (speedVariance < 10) {
        mouseScore -= 20;
        flags.push('robotic_mouse_consistency');
      }
      
      // Check for linear movements
      let linearityScore = 0;
      for (let i = 2; i < movements.length; i++) {
        const angle1 = Math.atan2(
          movements[i-1].y - movements[i-2].y,
          movements[i-1].x - movements[i-2].x
        );
        const angle2 = Math.atan2(
          movements[i].y - movements[i-1].y,
          movements[i].x - movements[i-1].x
        );
        const angleDiff = Math.abs(angle1 - angle2);
        if (angleDiff < 0.1) linearityScore++;
      }
      
      if (linearityScore > movements.length * 0.7) {
        mouseScore -= 15;
        flags.push('linear_mouse_path');
      }
    } else {
      mouseScore -= 40;
      flags.push('no_mouse_movements');
    }

    // ENHANCED CLICK PATTERN ANALYSIS
    if (behavioralData.click_events.length > 2) {
      const intervals = [];
      const positions = [];
      
      for (let i = 1; i < behavioralData.click_events.length; i++) {
        const interval = behavioralData.click_events[i].timestamp - 
                        behavioralData.click_events[i-1].timestamp;
        intervals.push(interval);
        
        const dx = behavioralData.click_events[i].x - behavioralData.click_events[i-1].x;
        const dy = behavioralData.click_events[i].y - behavioralData.click_events[i-1].y;
        positions.push({ dx, dy });
      }
      
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const intervalVariance = intervals.reduce((sum, val) => 
        sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
      
      if (avgInterval < HUMAN_PATTERNS.clickInterval.suspicious) {
        mouseScore -= 30;
        flags.push('rapid_fire_clicks');
      }
      
      if (intervalVariance < 1000 && behavioralData.click_events.length > 5) {
        mouseScore -= 20;
        flags.push('robotic_click_timing');
      }
      
      // Pixel-perfect clicks
      if (positions.length > 3) {
        const samePosition = positions.filter(p => p.dx === 0 && p.dy === 0).length;
        if (samePosition > positions.length * 0.5) {
          mouseScore -= 25;
          flags.push('pixel_perfect_clicks');
        }
      }
    }

    // ENHANCED SCROLL PATTERN ANALYSIS
    if (behavioralData.scroll_events.length > 5) {
      const scrollSpeeds = [];
      const scrollDeltas = [];
      
      for (let i = 1; i < behavioralData.scroll_events.length; i++) {
        const dy = behavioralData.scroll_events[i].scrollY - behavioralData.scroll_events[i-1].scrollY;
        const dt = behavioralData.scroll_events[i].timestamp - 
                   behavioralData.scroll_events[i-1].timestamp;
        const speed = Math.abs(dy) / (dt || 1);
        scrollSpeeds.push(speed);
        scrollDeltas.push(dy);
      }
      
      const avgScrollSpeed = scrollSpeeds.reduce((a, b) => a + b, 0) / scrollSpeeds.length;
      const speedVariance = scrollSpeeds.reduce((sum, val) => 
        sum + Math.pow(val - avgScrollSpeed, 2), 0) / scrollSpeeds.length;
      
      if (avgScrollSpeed > HUMAN_PATTERNS.scrollPattern.maxSpeed) {
        scrollScore -= 25;
        flags.push('inhuman_scroll_speed');
      }
      
      const scrollVariation = Math.sqrt(speedVariance) / avgScrollSpeed;
      if (scrollVariation < HUMAN_PATTERNS.scrollPattern.minVariation) {
        scrollScore -= 20;
        flags.push('robotic_scroll_pattern');
      }
      
      // Perfect incremental scrolling
      const uniqueDeltas = new Set(scrollDeltas.map(d => Math.abs(d)));
      if (uniqueDeltas.size === 1 && scrollDeltas.length > 5) {
        scrollScore -= 30;
        flags.push('programmatic_scroll');
      }
    }

    // ENHANCED KEYBOARD ANALYSIS
    if (behavioralData.keyboard_events.length > 3) {
      const intervals = [];
      for (let i = 1; i < behavioralData.keyboard_events.length; i++) {
        const interval = behavioralData.keyboard_events[i].timestamp - 
                        behavioralData.keyboard_events[i-1].timestamp;
        intervals.push(interval);
      }
      
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, val) => 
        sum + Math.pow(val - avgInterval, 2), 0) / intervals.length;
      
      if (avgInterval < HUMAN_PATTERNS.keyboardTiming.suspicious) {
        keyboardScore -= 30;
        flags.push('inhuman_typing_speed');
      }
      
      if (variance < 100 && behavioralData.keyboard_events.length > 10) {
        keyboardScore -= 25;
        flags.push('robotic_typing_rhythm');
      }
    }
    
    // SESSION-LEVEL PATTERN ANALYSIS
    const allTimestamps = [
      ...behavioralData.mouse_movements.map(m => m.timestamp),
      ...behavioralData.keyboard_events.map(k => k.timestamp),
      ...behavioralData.scroll_events.map(s => s.timestamp),
      ...behavioralData.click_events.map(c => c.timestamp),
    ].sort((a, b) => a - b);

    if (allTimestamps.length > 10) {
      const sessionDuration = allTimestamps[allTimestamps.length - 1] - allTimestamps[0];
      const eventsPerSecond = allTimestamps.length / (sessionDuration / 1000);

      // High-velocity session
      if (sessionDuration < 5000 && allTimestamps.length > 50) {
        timingScore -= 35;
        flags.push('high_velocity_session');
      }
      
      // Check interaction diversity
      const hasMouseMovement = behavioralData.mouse_movements.length > 0;
      const hasScrolling = behavioralData.scroll_events.length > 0;
      const hasClicks = behavioralData.click_events.length > 0;
      const interactionTypes = [hasMouseMovement, hasScrolling, hasClicks].filter(Boolean).length;
      
      if (interactionTypes < 2 && allTimestamps.length > 20) {
        timingScore -= 20;
        flags.push('limited_interaction_types');
      }

      if (eventsPerSecond > 50) {
        timingScore -= 30;
        flags.push('excessive_event_frequency');
      }
    }

    // Calculate overall score
    const overallScore = Math.max(0, (mouseScore + keyboardScore + scrollScore + timingScore) / 4);
    
    let riskLevel: BehavioralScore['risk_level'] = 'human';
    if (overallScore < 40) riskLevel = 'bot';
    else if (overallScore < 70) riskLevel = 'suspicious';

    const result: BehavioralScore = {
      overall_score: Math.round(overallScore),
      risk_level: riskLevel,
      analysis: {
        mouse_score: Math.round(mouseScore),
        keyboard_score: Math.round(keyboardScore),
        scroll_score: Math.round(scrollScore),
        timing_score: Math.round(timingScore),
      },
      flags,
    };

    console.log('[Behavioral Analysis] Enhanced result:', result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('[Behavioral Analysis] Internal error:', error);
    return new Response(JSON.stringify({ error: 'An error occurred during behavioral analysis' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});