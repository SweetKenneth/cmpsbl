/**
 * Depot Disclaimer — Legal modal for Capabilities Depot
 */

import { motion } from 'framer-motion';
import { X, AlertTriangle, FileText, Download, Shield, Server, HeartOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LEGAL_DISCLAIMER } from '@/lib/capabilities/depot';

interface DepotDisclaimerProps {
  onClose: () => void;
}

const disclaimerPoints = [
  { icon: HeartOff, title: 'No Support', description: 'Capabilities are sold AS-IS with no technical support, maintenance, or bug fixes guaranteed.' },
  { icon: Shield, title: 'No Warranty', description: 'No warranty of any kind, express or implied, including merchantability or fitness for purpose.' },
  { icon: Server, title: 'No Hosting', description: 'Capabilities are not hosted or executed by the seller. All execution is your responsibility.' },
  { icon: Download, title: 'Local Execution', description: 'All capabilities are designed for local execution within your own infrastructure.' },
];

export function DepotDisclaimer({ onClose }: DepotDisclaimerProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-auto bg-card border border-border rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-5 border-b border-border bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Terms of Use</h2>
              <p className="text-sm text-muted-foreground">Capabilities Depot</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {/* Key points grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {disclaimerPoints.map((point) => (
              <div 
                key={point.title}
                className="p-4 rounded-xl border border-border/50 bg-muted/30"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 rounded-lg bg-amber-500/10">
                    <point.icon className="w-4 h-4 text-amber-500" />
                  </div>
                  <h3 className="font-semibold text-foreground">{point.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{point.description}</p>
              </div>
            ))}
          </div>

          {/* Full disclaimer */}
          <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Full Legal Terms</h3>
            </div>
            <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono leading-relaxed">
              {LEGAL_DISCLAIMER.trim()}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 p-5 border-t border-border bg-card/95 backdrop-blur-sm">
          <Button onClick={onClose} className="w-full">
            I Understand
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
