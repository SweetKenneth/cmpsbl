import { Shield, AlertTriangle, Lock, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { COPYRIGHT_NOTICE, PATENT_NOTICE } from "@/config/domains";
import { COPYRIGHT_NOTICE } from "@/config/domains";

export const CopyrightShield = () => {
  return (
    <Card className="border-2 border-destructive/50 bg-destructive/5 backdrop-blur">
      <div className="p-6 space-y-4">
        {/* Header with Shield Icon */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Shield className="h-12 w-12 text-destructive animate-pulse" />
            <Lock className="h-5 w-5 text-destructive absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              PROTECTED INTELLECTUAL PROPERTY
            </h3>
            <p className="text-sm text-muted-foreground">
              {COPYRIGHT_NOTICE.copyright} {COPYRIGHT_NOTICE.year} CMPSBL. All Rights Reserved.
            </p>
          </div>
        </div>

        {/* Trademarked Entities */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm text-destructive">Protected Trademarks:</h4>
          <div className="grid grid-cols-2 gap-2">
            {COPYRIGHT_NOTICE.entities.map((entity, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <Shield className="h-3 w-3 text-destructive" />
                <span className="font-mono">{entity}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Legal Warning */}
        <div className="border-l-4 border-destructive pl-4 py-2 bg-destructive/10">
          <p className="text-sm font-medium text-destructive">
            ⚠️ LEGAL NOTICE
          </p>
          <p className="text-xs text-foreground/80 mt-1">
            {COPYRIGHT_NOTICE.legalWarning}
          </p>
        </div>

        {/* Defense System Notice */}
        <div className="border-l-4 border-warning pl-4 py-2 bg-warning/10">
          <p className="text-sm font-medium text-warning">
            🛡️ SECURITY ENFORCEMENT
          </p>
          <p className="text-xs text-foreground/80 mt-1">
            {COPYRIGHT_NOTICE.enforcementNotice}
          </p>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-destructive/20 text-center">
          <p className="text-xs text-muted-foreground font-mono">
            Unauthorized access attempts will be prosecuted to the fullest extent of the law.
          </p>
        </div>
      </div>
    </Card>
  );
};
