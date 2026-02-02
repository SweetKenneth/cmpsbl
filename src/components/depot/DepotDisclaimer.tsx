/**
 * Depot Disclaimer — Legal modal for Capabilities Depot
 */

import { motion } from 'framer-motion';
import { X, FileText, Download, Shield, Server, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DepotDisclaimerProps {
  onClose: () => void;
}

const disclaimerPoints = [
  { icon: Download, title: 'Local Execution', description: 'All capabilities are designed for local execution within your own infrastructure.' },
  { icon: Server, title: 'Self-Hosted', description: 'Capabilities are not hosted or executed by us. Execution is within your environment.' },
  { icon: Shield, title: 'Licensed Artifacts', description: 'A valid license is required to download. Support available during your licensing period.' },
  { icon: FileText, title: 'Need Help?', description: 'Visit our Support page for assistance with integration or technical questions.' },
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
            <div className="p-2 rounded-lg bg-primary/10">
              <Info className="w-5 h-5 text-primary" />
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
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <point.icon className="w-4 h-4 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{point.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">{point.description}</p>
              </div>
            ))}
          </div>

          {/* Terms summary */}
          <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Terms Summary</h3>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li>• Capabilities are downloadable artifacts for local execution</li>
              <li>• A valid license is required for download access</li>
              <li>• All sales are final for digital downloads</li>
              <li>• Execution and deployment is within your infrastructure</li>
            </ul>
          </div>

          {/* Support CTA */}
          <div className="p-4 rounded-xl border border-primary/20 bg-primary/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Need Help?</h3>
                <p className="text-sm text-muted-foreground">Our team is here to assist with any questions.</p>
              </div>
              <Link 
                to="/support" 
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Get Support
              </Link>
            </div>
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
