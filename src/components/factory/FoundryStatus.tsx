import { Activity, Zap, Clock, Package, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function FoundryStatus() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
          AUTONOMOUS · 24/7
        </Badge>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          The Foundry
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm">
          Memory Stream discovers. Ascension packages. The catalog grows every 8 hours — whether anyone is watching or not.
        </p>
      </div>

      {/* Cycle Status */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            Production Cycle
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-foreground font-medium">Active</span>
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Cycle Interval</span>
            <span className="text-foreground">Every 8 hours</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">External AI</span>
            <span className="text-foreground">Zero</span>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Zap, label: 'Discover', desc: 'Scouts find capabilities' },
          { icon: Package, label: 'Score', desc: 'CJPI + tier classification' },
          { icon: BarChart3, label: 'List', desc: 'Showroom, Vault, or Junkyard' },
        ].map((step) => (
          <Card key={step.label} className="border-border/50">
            <CardContent className="pt-4 pb-3 text-center space-y-1.5">
              <step.icon className="h-5 w-5 text-primary mx-auto" />
              <p className="text-xs font-semibold text-foreground">{step.label}</p>
              <p className="text-[10px] text-muted-foreground">{step.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Routing Logic */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Discovery Routing
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-1">
          <p>• CJPI 100 → <span className="text-primary">The Vault</span> ($1,952)</p>
          <p>• CJPI 68–99 → <span className="text-emerald-400">The Showroom</span> (graduated pricing)</p>
          <p>• CJPI &lt; 68 → <span className="text-muted-foreground">The Junkyard</span> (free picks)</p>
        </CardContent>
      </Card>
    </div>
  );
}
