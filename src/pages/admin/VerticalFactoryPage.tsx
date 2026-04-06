/**
 * Vertical Factory — Governor Admin Panel
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Simple form: subdomain + genre → full vertical instantiation
 * with database seeding and federated scanner registration.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Factory, Loader2, CheckCircle2, XCircle, Rocket, Zap } from 'lucide-react';
import {
  instantiateVertical,
  seedVertical,
  getAllDynamicVerticals,
  type VerticalManifest,
} from '@/lib/factory/vertical-factory-engine';
import { generateVerticalSpec } from '@/lib/factory/genre-spec-generator';

interface InstantiationLog {
  timestamp: string;
  message: string;
  status: 'info' | 'success' | 'error';
}

export default function VerticalFactoryPage() {
  const [subdomain, setSubdomain] = useState('');
  const [genre, setGenre] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<InstantiationLog[]>([]);
  const [manifest, setManifest] = useState<VerticalManifest | null>(null);

  const addLog = useCallback((message: string, status: InstantiationLog['status'] = 'info') => {
    setLogs(prev => [...prev, { timestamp: new Date().toISOString(), message, status }]);
  }, []);

  const handleInstantiate = useCallback(async () => {
    const cleanSubdomain = subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    const cleanGenre = genre.trim();

    if (!cleanSubdomain || !cleanGenre) {
      toast.error('Both subdomain and genre are required');
      return;
    }

    setIsRunning(true);
    setLogs([]);
    setManifest(null);

    try {
      // Step 1: Generate spec from genre
      addLog(`Generating 40-primitive spec for "${cleanGenre}" vertical...`);
      const spec = generateVerticalSpec(cleanSubdomain, cleanGenre);
      addLog(`Spec generated: ${spec.engines.length} engines + ${spec.agents.length} agents`, 'success');

      // Step 2: Validate & instantiate
      addLog('Validating primitive matrix and name collisions...');
      const result = instantiateVertical(spec);

      if (!result.validation.valid) {
        for (const err of result.validation.errors) {
          addLog(`Validation error: ${err}`, 'error');
        }
        toast.error('Vertical instantiation failed validation');
        setIsRunning(false);
        return;
      }

      addLog(`Matrix assembled: 40 primitives (24 Spine + 16 Expansion)`, 'success');
      addLog(`Crown Jewels generated: ${result.crownJewels.length} entries`, 'success');
      addLog(`Names registered: ${result.registeredNames.length} primitives`, 'success');

      // Step 3: Check activation
      const checklist = result.activationChecklist;
      if (checklist.discoveryEngineReady) addLog('Federated Scanner: registered', 'success');
      if (checklist.ssoRegistered) addLog('SSO domain: registered', 'success');
      if (checklist.portalRegistered) addLog('Portal entry: registered', 'success');

      setManifest(result);

      // Step 4: Seed database
      addLog('Seeding 200 discoveries to database...');
      const seedResult = await seedVertical(spec.verticalId);

      if (seedResult) {
        addLog(
          `Database seeded: ${seedResult.totalDiscoveries} discoveries (${seedResult.vaultCount} vault / ${seedResult.showroomCount} showroom / ${seedResult.junkyardCount} junkyard)`,
          'success',
        );
        if (seedResult.persisted) {
          addLog('All discoveries persisted to unified discoveries table', 'success');
        }
      } else {
        addLog('Seed engine returned null — vertical may not be registered', 'error');
      }

      addLog(`✅ ${cleanSubdomain}.cmpsbl.com is LIVE`, 'success');
      toast.success(`${cleanGenre} vertical instantiated at ${cleanSubdomain}.cmpsbl.com`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      addLog(`Fatal error: ${msg}`, 'error');
      toast.error(`Instantiation failed: ${msg}`);
    } finally {
      setIsRunning(false);
    }
  }, [subdomain, genre, addLog]);

  const existingVerticals = getAllDynamicVerticals();

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Factory className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vertical Factory</h1>
          <p className="text-sm text-muted-foreground">
            Instantiate a full 40-primitive substrate from a subdomain and genre
          </p>
        </div>
      </div>

      {/* Input Form */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Rocket className="h-5 w-5" />
            New Vertical
          </CardTitle>
          <CardDescription>
            Enter a subdomain and genre — GENESIS handles the rest: 16 expansion primitives, 144 Crown Jewels, 200 discoveries, and federated scanner integration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Subdomain</label>
              <div className="flex items-center gap-1">
                <Input
                  value={subdomain}
                  onChange={e => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="health"
                  disabled={isRunning}
                  className="font-mono"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">.cmpsbl.com</span>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Genre</label>
              <Input
                value={genre}
                onChange={e => setGenre(e.target.value)}
                placeholder="Health"
                disabled={isRunning}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleInstantiate}
                disabled={isRunning || !subdomain.trim() || !genre.trim()}
                className="gap-2"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Building...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Instantiate
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      {logs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Instantiation Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 font-mono text-xs max-h-80 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  {log.status === 'success' && <CheckCircle2 className="h-3.5 w-3.5 text-green-500 mt-0.5 shrink-0" />}
                  {log.status === 'error' && <XCircle className="h-3.5 w-3.5 text-destructive mt-0.5 shrink-0" />}
                  {log.status === 'info' && <Loader2 className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0 animate-spin" />}
                  <span className={log.status === 'error' ? 'text-destructive' : log.status === 'success' ? 'text-green-500' : 'text-muted-foreground'}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manifest Summary */}
      {manifest && manifest.validation.valid && (
        <Card className="border-green-500/30">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Manifest
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">40</p>
                <p className="text-xs text-muted-foreground">Primitives</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{manifest.crownJewels.length}</p>
                <p className="text-xs text-muted-foreground">Crown Jewels</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{manifest.registeredNames.length}</p>
                <p className="text-xs text-muted-foreground">Registered Names</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Object.values(manifest.activationChecklist).filter(Boolean).length}/{Object.keys(manifest.activationChecklist).length}
                </p>
                <p className="text-xs text-muted-foreground">Systems Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Dynamic Verticals */}
      {existingVerticals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Active Dynamic Verticals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {existingVerticals.map(v => (
                <Badge key={v.config.verticalId} variant="secondary" className="gap-1">
                  <span className="font-mono">{v.config.subdomain}</span>
                  <span className="text-muted-foreground">·</span>
                  <span>{v.config.name}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
