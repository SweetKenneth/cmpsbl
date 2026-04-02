import { DollarSign, TrendingUp, Package, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const SPLIT_VISUAL = [
  { label: 'Developer', pct: 70, accent: 'bg-emerald-500' },
  { label: 'CMPSBL', pct: 30, accent: 'bg-primary' },
];

const HOW_IT_WORKS = [
  { step: '1', title: 'Submit Your Discovery', desc: 'Upload code that scored 68+ CJPI through Ascension.' },
  { step: '2', title: 'Listed in the Showroom', desc: 'Your discovery enters the Memory Stream catalog with graduated pricing.' },
  { step: '3', title: 'Customer Purchases', desc: 'A buyer picks your discovery. Certificate issued. Discovery retired.' },
  { step: '4', title: 'You Earn 70%', desc: 'Royalty deposited automatically. Payouts at $25 minimum.' },
];

export function LicensingDashboard() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          The Licensing Engine
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Upload once. Earn forever. Every time your discovered pattern is purchased, you keep 70%.
        </p>
      </div>

      {/* Revenue Split Visual */}
      <Card className="border-border/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-emerald-400" />
            Revenue Split
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-8 rounded-lg overflow-hidden mb-3">
            {SPLIT_VISUAL.map((s) => (
              <div
                key={s.label}
                className={`${s.accent} flex items-center justify-center text-xs font-semibold text-white`}
                style={{ width: `${s.pct}%` }}
              >
                {s.label} {s.pct}%
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Every purchase. Every discovery. No caps. No clawbacks.
          </p>
        </CardContent>
      </Card>

      {/* How it Works */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {HOW_IT_WORKS.map((item) => (
          <Card key={item.step} className="border-border/50">
            <CardContent className="pt-5 pb-4 flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                {item.step}
              </div>
              <div>
                <p className="font-medium text-foreground text-sm">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Earnings Preview */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Earnings Example
          </CardTitle>
          <CardDescription>
            A Mythic-tier discovery (CJPI 96) sells for $192.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-foreground">$192</p>
              <p className="text-xs text-muted-foreground">Sale Price</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">$134</p>
              <p className="text-xs text-muted-foreground">You Earn (70%)</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">$58</p>
              <p className="text-xs text-muted-foreground">Platform (30%)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center">
        <Button size="lg" className="gap-2">
          <Package className="h-4 w-4" />
          Submit a Discovery
          <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Requires Ascension membership (Studio+) and a discovery scored 68+ CJPI.
        </p>
      </div>
    </div>
  );
}
