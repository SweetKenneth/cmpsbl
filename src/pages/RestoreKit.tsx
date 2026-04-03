/**
 * RestoreKit — PIN-protected page for downloading the standalone restore kit
 * PIN: 4645 — Governor access only
 */

import { Shield, Download, FileCode, FileText, Terminal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function RestoreKit() {
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
        <div className="grid gap-4 md:grid-cols-2">
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
              <a href="/restore-kit/restore.mjs" download>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download Script
                </Button>
              </a>
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
              <a href="/restore-kit/README.md" download>
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Download className="w-4 h-4" />
                  Download Guide
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Quick start */}
        <Card className="border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Terminal className="w-4 h-4 text-primary" />
              Quick Start
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <pre className="bg-muted/50 border border-border/30 rounded-lg p-4 text-xs font-mono overflow-x-auto">
{`# 1. Download your latest backup ZIP from the admin panel
# 2. Run the restore against any target project:

node restore.mjs full-backup-2026-04-03.zip \\
  https://YOUR-PROJECT.supabase.co \\
  YOUR_SERVICE_ROLE_KEY

# Optional flags:
#   --dry-run          Validate without writing
#   --skip=table1,t2   Skip specific tables`}
            </pre>
            <p className="text-xs text-muted-foreground">
              Requires Node.js 18+ and a target project service_role key.
              Schema must exist first — run migrations before restoring data.
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
