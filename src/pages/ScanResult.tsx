/**
 * Shareable Scan Result Page — /scan/results/:id
 * Item #3: Indexable scan result URLs with meta tags
 */

import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { ScanShareCard } from '@/components/conversion/ScanShareCard';
import { InternalLinkMesh } from '@/components/seo/InternalLinkMesh';
import { LeadCaptureCTA } from '@/components/conversion/LeadCaptureCTA';
import { ArrowLeft, Shield, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScanData {
  id: string;
  domain: string;
  scan_mode: string;
  score: number | null;
  findings_count: number;
  result_data: unknown;
  created_at: string;
}

export default function ScanResult() {
  const { id } = useParams<{ id: string }>();
  const [scan, setScan] = useState<ScanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error: err } = await supabase
        .from('scan_results_cache')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (err || !data) {
        setError('Scan result not found or expired.');
      } else {
        setScan(data as ScanData);
      }
      setLoading(false);
    })();
  }, [id]);

  const scoreLabel = scan?.score != null
    ? scan.score >= 80 ? 'Strong' : scan.score >= 50 ? 'Needs Work' : 'Critical'
    : 'N/A';

  return (
    <>
      <Helmet>
        <title>{scan ? `${scan.domain} Security Scan — ${scoreLabel}` : 'Scan Result'} | CMPSBL</title>
        <meta name="description" content={scan ? `Security scan of ${scan.domain}: score ${scan.score ?? 'N/A'}/100 with ${scan.findings_count} findings.` : 'View scan results on CMPSBL.'} />
        <meta property="og:title" content={scan ? `${scan.domain} — Score: ${scan.score ?? 'N/A'}` : 'Scan Result'} />
        <meta property="og:description" content={scan ? `${scan.findings_count} findings detected in ${scan.scan_mode} scan.` : ''} />
        <meta property="og:type" content="article" />
        <link rel="canonical" href={`https://cmpsbl.com/scan/results/${id}`} />
      </Helmet>

      <PublicNav />
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-6 gap-2">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Button>
          </Link>

          {loading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-foreground mb-2">Scan Not Found</h1>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Link to="/">
                <Button>Run a New Scan</Button>
              </Link>
            </div>
          )}

          {scan && (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
                  {scan.domain}
                </h1>
                <p className="text-muted-foreground">
                  {scan.scan_mode.toUpperCase()} scan — {new Date(scan.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Score Card */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-6 rounded-xl bg-muted/30 border border-border text-center">
                  <div className="text-4xl font-bold text-primary">{scan.score ?? '—'}</div>
                  <div className="text-xs text-muted-foreground mt-1">Score</div>
                </div>
                <div className="p-6 rounded-xl bg-muted/30 border border-border text-center">
                  <div className="text-4xl font-bold text-foreground">{scan.findings_count}</div>
                  <div className="text-xs text-muted-foreground mt-1">Findings</div>
                </div>
                <div className="p-6 rounded-xl bg-muted/30 border border-border text-center">
                  <div className={`text-4xl font-bold ${scan.score != null && scan.score >= 80 ? 'text-neon-green' : scan.score != null && scan.score >= 50 ? 'text-neon-amber' : 'text-destructive'}`}>
                    {scoreLabel}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">Rating</div>
                </div>
              </div>

              {/* Share Card */}
              <ScanShareCard
                scanId={scan.id}
                domain={scan.domain}
                score={scan.score ?? undefined}
                scanType="security"
              />

              {/* Lead Capture */}
              <LeadCaptureCTA
                context="scanner"
              />

              {/* Internal Links */}
              <InternalLinkMesh
                currentPath={`/scan/results/${id}`}
                tags={['scan', 'security', 'compliance', 'modules']}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
