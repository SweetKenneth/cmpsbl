/**
 * Scan Depth Upgrade CTA — Item #13
 * Surfaces scan depth tiers as an upgrade path
 */

import { ArrowUpRight, Zap, Shield, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface ScanDepthUpgradeProps {
  currentDepth: 'triage' | 'standard' | 'deep' | 'forensic';
  className?: string;
}

const DEPTH_INFO = {
  triage: { label: 'Triage', next: 'standard', icon: Search, color: 'text-muted-foreground' },
  standard: { label: 'Standard', next: 'deep', icon: Shield, color: 'text-primary' },
  deep: { label: 'Deep', next: 'forensic', icon: Zap, color: 'text-neon-amber' },
  forensic: { label: 'Forensic', next: null, icon: Zap, color: 'text-destructive' },
};

export function ScanDepthUpgrade({ currentDepth, className = '' }: ScanDepthUpgradeProps) {
  const info = DEPTH_INFO[currentDepth];
  if (!info.next) return null; // Already at max depth

  const nextInfo = DEPTH_INFO[info.next as keyof typeof DEPTH_INFO];

  return (
    <div className={`p-4 rounded-xl border border-primary/20 bg-primary/5 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <nextInfo.icon className={`w-5 h-5 ${nextInfo.color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-foreground">
            Unlock {nextInfo.label} Scan Depth
          </h4>
          <p className="text-xs text-muted-foreground mt-1">
            {info.next === 'standard' && 'Get detailed fix suggestions and root cause analysis for each finding.'}
            {info.next === 'deep' && 'Full root cause analysis with multiple remediation paths per finding.'}
            {info.next === 'forensic' && 'Complete forensic analysis with attack surface mapping and compliance audit.'}
          </p>
          <Link to="/store?tab=plans">
            <Button variant="outline" size="sm" className="mt-3 gap-2 text-xs">
              Upgrade <ArrowUpRight className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
