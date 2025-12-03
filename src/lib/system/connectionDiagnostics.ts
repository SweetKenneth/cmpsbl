/**
 * Connection Diagnostics Tool
 * Manual debugging utilities for backend connection issues
 */

import { supabase } from '@/integrations/supabase/client';

export interface DiagnosticResult {
  test: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  details?: any;
}

/**
 * Run comprehensive connection diagnostics
 * Returns results that can be reviewed manually
 */
export async function runConnectionDiagnostics(): Promise<DiagnosticResult[]> {
  const results: DiagnosticResult[] = [];

  // Test 1: Environment Variables
  try {
    const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
    const hasKey = !!import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    
    results.push({
      test: 'Environment Variables',
      status: hasUrl && hasKey ? 'pass' : 'fail',
      message: hasUrl && hasKey 
        ? 'All required environment variables present' 
        : 'Missing environment variables',
      details: {
        hasUrl,
        hasKey,
        urlPrefix: hasUrl ? import.meta.env.VITE_SUPABASE_URL.substring(0, 20) + '...' : 'missing'
      }
    });
  } catch (error) {
    results.push({
      test: 'Environment Variables',
      status: 'fail',
      message: 'Error checking environment variables',
      details: error
    });
  }

  // Test 2: Basic Connectivity
  try {
    const { error } = await supabase.from('profiles').select('count').limit(1).maybeSingle();
    
    results.push({
      test: 'Basic Connectivity',
      status: error && error.code !== 'PGRST116' ? 'fail' : 'pass',
      message: error && error.code !== 'PGRST116' 
        ? `Connection failed: ${error.message}` 
        : 'Successfully connected to backend',
      details: error
    });
  } catch (error) {
    results.push({
      test: 'Basic Connectivity',
      status: 'fail',
      message: 'Network error occurred',
      details: error
    });
  }

  // Test 3: Authentication State
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    results.push({
      test: 'Authentication State',
      status: error ? 'fail' : session ? 'pass' : 'warning',
      message: error 
        ? 'Error checking auth state' 
        : session 
        ? 'User authenticated' 
        : 'No active session',
      details: { 
        hasSession: !!session,
        error 
      }
    });
  } catch (error) {
    results.push({
      test: 'Authentication State',
      status: 'fail',
      message: 'Auth check failed',
      details: error
    });
  }

  // Test 4: Local Storage
  try {
    const stored = localStorage.getItem('pf_supabase_status');
    const canWrite = (() => {
      try {
        localStorage.setItem('test_write', 'test');
        localStorage.removeItem('test_write');
        return true;
      } catch {
        return false;
      }
    })();
    
    results.push({
      test: 'Local Storage',
      status: canWrite ? 'pass' : 'fail',
      message: canWrite ? 'Local storage working' : 'Local storage blocked',
      details: {
        canWrite,
        hasStoredStatus: !!stored,
        storedData: stored ? JSON.parse(stored) : null
      }
    });
  } catch (error) {
    results.push({
      test: 'Local Storage',
      status: 'fail',
      message: 'Local storage error',
      details: error
    });
  }

  // Test 5: Realtime Channels
  try {
    const channels = supabase.getChannels();
    
    results.push({
      test: 'Realtime Channels',
      status: 'pass',
      message: `${channels.length} active channel(s)`,
      details: {
        channelCount: channels.length,
        channels: channels.map(c => c.topic)
      }
    });
  } catch (error) {
    results.push({
      test: 'Realtime Channels',
      status: 'fail',
      message: 'Error checking channels',
      details: error
    });
  }

  return results;
}

/**
 * Export diagnostics as downloadable report
 */
export function exportDiagnostics(results: DiagnosticResult[]): string {
  const report = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    results
  };
  
  return JSON.stringify(report, null, 2);
}

/**
 * Get human-readable summary
 */
export function getDiagnosticSummary(results: DiagnosticResult[]): string {
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const warnings = results.filter(r => r.status === 'warning').length;
  
  return `${passed} passed, ${failed} failed, ${warnings} warnings`;
}
