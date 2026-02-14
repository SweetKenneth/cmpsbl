/**
 * Name Certificate — Ownership certificate for a purchased cognitive
 */

import { Card, CardContent } from "@/components/ui/card";
import { Shield, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useCallback } from "react";

interface NameCertificateProps {
  name: string;
  sku: string;
  issuedAt?: string;
}

export function NameCertificate({ name, sku, issuedAt }: NameCertificateProps) {
  const [copied, setCopied] = useState(false);

  const certText = `CMPSBL® Cognitive Ownership Certificate
─────────────────────────────────
Name: ${name}
SKU: ${sku}
License: MIT
Issued: ${issuedAt || new Date().toISOString()}
─────────────────────────────────
You own your copy. Use, modify, and
distribute under MIT license terms.
Support: help@CMPSBL.com | (760) FLUID-AI`;

  const copy = useCallback(() => {
    navigator.clipboard.writeText(certText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [certText]);

  return (
    <Card className="border-primary/20 bg-background/80 backdrop-blur relative overflow-hidden">
      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, currentColor 2px, currentColor 3px)',
        }} />
      </div>
      
      <CardContent className="p-6 space-y-4 relative">
        <div className="flex items-center gap-2 text-primary">
          <Shield className="w-5 h-5" />
          <span className="font-mono text-sm font-bold uppercase tracking-widest">
            Ownership Certificate
          </span>
        </div>
        
        <pre className="font-mono text-xs text-muted-foreground whitespace-pre-wrap bg-muted/50 rounded-lg p-4 border border-border/50">
          {certText}
        </pre>
        
        <Button variant="outline" size="sm" onClick={copy} className="gap-2">
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy Certificate'}
        </Button>
      </CardContent>
    </Card>
  );
}
