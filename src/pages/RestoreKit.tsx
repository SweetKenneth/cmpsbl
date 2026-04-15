/**
 * RestoreKit — PIN-protected page for downloading the standalone restore kit
 * Files are embedded in the component (not in public/) to prevent unauthorized access.
 * PIN: 4645 — Governor access only
 */

import { Shield, Download, FileCode, FileText, Terminal, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCallback } from 'react';

/** Trigger a browser download from a string */
function downloadText(filename: string, content: string, mime = 'application/octet-stream') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function RestoreKit() {
  const handleDownload = useCallback(async (filename: string) => {
    try {
      const mod = await import(`@/data/restore-kit-files`);
      const content = mod.FILES[filename];
      if (!content) throw new Error(`File not found: ${filename}`);
      downloadText(filename, content);
    } catch (err) {
      console.error('[RestoreKit] Download failed:', err);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Substrate Restore Kit</h1>
            <Badge variant="outline" className="text-xs">v1.0.0</Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            100% standalone disaster recovery. Restores a CMPSBL® full-backup ZIP into any
            project — no Lovable account required.
          </p>
        </div>

        {/* Download cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Universal DR
              </CardTitle>
              <CardDescription className="text-xs">
                All-in-one: download backup + restore + inspect + schema DDL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => handleDownload('cmpsbl-disaster-recovery.mjs')}
              >
                <Download className="w-4 h-4" />
                Download DR Script
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileCode className="w-4 h-4 text-primary" />
                restore.mjs
              </CardTitle>
              <CardDescription className="text-xs">
                Zero-dependency Node.js 18+ restore script (~380 lines)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => handleDownload('restore.mjs')}
              >
                <Download className="w-4 h-4" />
                Download Script
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                README.md
              </CardTitle>
              <CardDescription className="text-xs">
                Prerequisites, usage guide, recovery scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => handleDownload('README.md')}
              >
                <Download className="w-4 h-4" />
                Download Guide
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick start */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              Quick Start — Universal DR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="bg-muted/50 border border-border/30 rounded-lg p-4 text-xs font-mono overflow-x-auto">
{`# Download a fresh backup from the live substrate:
node cmpsbl-disaster-recovery.mjs download \\
  --email=you@example.com --password=secret

# Restore to a new project:
node cmpsbl-disaster-recovery.mjs restore backup.zip \\
  --url=https://NEW-PROJECT.supabase.co \\
  --key=SERVICE_ROLE_KEY

# One-shot: download + restore:
node cmpsbl-disaster-recovery.mjs full-recovery \\
  --email=you@example.com --password=secret \\
  --url=https://NEW-PROJECT.supabase.co \\
  --key=SERVICE_ROLE_KEY

# No repo? Generate schema DDL from backup:
node cmpsbl-disaster-recovery.mjs schema-sql backup.zip

# Inspect backup contents:
node cmpsbl-disaster-recovery.mjs inspect backup.zip`}
            </pre>
            <p className="text-xs text-muted-foreground">
              Requires Node.js 18+. Zero dependencies.
              Schema must exist first — run migrations or use schema-sql mode.
            </p>
          </CardContent>
        </Card>

        {/* What gets restored */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">What Gets Restored</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <div className="flex justify-between border-b border-border/20 pb-1">
                <span>All database tables</span>
                <Badge variant="default" className="text-xs">✓ Included</Badge>
              </div>
              <div className="flex justify-between border-b border-border/20 pb-1">
                <span>OpenAPI schema</span>
                <Badge variant="default" className="text-xs">✓ Included</Badge>
              </div>
              <div className="flex justify-between border-b border-border/20 pb-1">
                <span>Storage bucket inventory</span>
                <Badge variant="default" className="text-xs">✓ Included</Badge>
              </div>
              <div className="flex justify-between border-b border-border/20 pb-1">
                <span>RESTORE.md guide</span>
                <Badge variant="default" className="text-xs">✓ Included</Badge>
              </div>
              <div className="flex justify-between border-b border-border/20 pb-1">
                <span>Schema DDL generation</span>
                <Badge variant="default" className="text-xs">✓ No repo needed</Badge>
              </div>
              <div className="flex justify-between border-b border-border/20 pb-1">
                <span className="text-muted-foreground">Edge functions</span>
                <Badge variant="outline" className="text-xs">Redeploy from source</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Storage file contents</span>
                <Badge variant="outline" className="text-xs">Re-upload separately</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
