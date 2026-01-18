/**
 * Example: Bot Detection Middleware
 * 
 * Protect your API endpoints from bots using fingerprint analysis.
 * 
 * BYOK ARCHITECTURE:
 * - You deploy your own substrate infrastructure
 * - You control all security policies
 * - No external dependencies for core detection
 * - AI-enhanced analysis uses YOUR registered keys
 */

import { SubstrateClient } from '../substrate-client';

const substrate = new SubstrateClient({
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!,
  developerId: process.env.DEVELOPER_ID!, // Required for BYOK
  appId: process.env.APP_ID! // Required for BYOK
});

interface RequestContext {
  ip: string;
  userAgent: string;
  fingerprint: {
    canvas?: string;
    webgl?: string;
    audio?: string;
    fonts?: string[];
    screen?: { width: number; height: number };
    timezone?: string;
    language?: string;
  };
}

interface AnalysisResult {
  allowed: boolean;
  riskScore: number;
  reason?: string;
  action: 'allow' | 'challenge' | 'block';
}

async function analyzeRequest(ctx: RequestContext): Promise<AnalysisResult> {
  // 1. Check IP reputation first (fast)
  const reputation = await substrate.defense.reputation(ctx.ip);
  
  if (reputation.success && reputation.data) {
    const repData = reputation.data as any;
    if (repData.score < 0.2) {
      return {
        allowed: false,
        riskScore: 1 - repData.score,
        reason: 'IP has poor reputation',
        action: 'block'
      };
    }
  }

  // 2. Full fingerprint analysis
  const analysis = await substrate.defense.analyze(
    ctx.fingerprint,
    ctx.ip
  );

  if (!analysis.success || !analysis.data) {
    // Fail open with caution
    return {
      allowed: true,
      riskScore: 0.5,
      reason: 'Analysis unavailable',
      action: 'challenge'
    };
  }

  const data = analysis.data as any;
  const riskScore = data.risk_score || 0;

  // Risk thresholds
  if (riskScore > 0.8) {
    return {
      allowed: false,
      riskScore,
      reason: data.reason || 'High risk detected',
      action: 'block'
    };
  }

  if (riskScore > 0.5) {
    return {
      allowed: true,
      riskScore,
      reason: 'Moderate risk - challenge recommended',
      action: 'challenge'
    };
  }

  return {
    allowed: true,
    riskScore,
    action: 'allow'
  };
}

// Express middleware example
function botProtectionMiddleware(riskThreshold = 0.7) {
  return async (req: any, res: any, next: any) => {
    const context: RequestContext = {
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || '',
      fingerprint: req.body.fingerprint || {}
    };

    const result = await analyzeRequest(context);

    // Attach result to request for logging
    req.botAnalysis = result;

    if (!result.allowed && result.riskScore > riskThreshold) {
      return res.status(403).json({
        error: 'Access denied',
        reason: result.reason
      });
    }

    if (result.action === 'challenge') {
      // You could redirect to CAPTCHA here
      req.requiresChallenge = true;
    }

    next();
  };
}

// Usage example
async function main() {
  const testRequest: RequestContext = {
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
    fingerprint: {
      canvas: 'a1b2c3d4e5f6',
      webgl: 'nvidia-gtx-1080',
      timezone: 'America/Los_Angeles',
      language: 'en-US'
    }
  };

  console.log('Analyzing request...');
  const result = await analyzeRequest(testRequest);
  
  console.log('Result:', result);
  console.log(`Action: ${result.action}`);
  console.log(`Risk Score: ${(result.riskScore * 100).toFixed(1)}%`);
}

main().catch(console.error);

export { analyzeRequest, botProtectionMiddleware, RequestContext, AnalysisResult };
