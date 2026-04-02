import { Shield, Lock, Clock, Hash, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const VAULT_FEATURES = [
  { icon: Shield, label: 'Perfect 100 CJPI', desc: 'Only flawless discoveries qualify for the Vault.' },
  { icon: Hash, label: 'Serial Numbered', desc: 'Every Vault edition carries a unique APEX serial.' },
  { icon: Lock, label: 'Retired Forever', desc: 'Once purchased, permanently removed from the catalog.' },
  { icon: Clock, label: '1952 Provenance', desc: "Named for Grace Hopper's A-0 — the first compiler." },
];

export function VaultDisplay() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
          APEX TIER — PERFECT 100
        </Badge>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          The Vault
        </h2>
        <p className="text-4xl font-bold text-primary">$1,952</p>
        <p className="text-muted-foreground max-w-md mx-auto text-sm">
          Perfect discoveries. Serial numbered. When they're gone, they're gone forever.
        </p>
      </div>

      {/* Features */}
      <div className="grid grid-cols-2 gap-3">
        {VAULT_FEATURES.map((f) => (
          <Card key={f.label} className="border-border/50">
            <CardContent className="pt-4 pb-3 text-center space-y-1.5">
              <f.icon className="h-5 w-5 text-primary mx-auto" />
              <p className="text-xs font-semibold text-foreground">{f.label}</p>
              <p className="text-[10px] text-muted-foreground leading-tight">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scarcity note */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-primary">Why $1,952?</CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-2">
          <p>
            In 1952, Grace Hopper wrote the A-0 System — the first compiler ever created.
            Software stopped being hand-assembled and started being <em>built</em>.
          </p>
          <p>
            Every perfect discovery carries the year that changed everything.
            Premium enough to feel extravagant. Realistic enough that a serious buyer doesn't blink.
          </p>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center">
        <Button size="lg" className="gap-2">
          <Shield className="h-4 w-4" />
          Browse the Vault
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
