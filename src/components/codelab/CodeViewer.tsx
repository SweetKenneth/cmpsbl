/**
 * CodeViewer — Display-dialect-aware code block for CodeLab
 * 
 * IMPORTANT: Copy button ALWAYS copies raw modern code.
 * Display dialect only affects visual rendering.
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Check, Eye } from "lucide-react";
import { useObsMode } from "@/lib/ui/obsfunction-mode";
import { renderDialect } from "@/lib/ui/dialect-render";
import { DIALECT_LABELS } from "@/lib/ui/display-dialect";
import { toast } from "sonner";

interface CodeViewerProps {
  code: string;
  filename?: string;
  showDialectBadge?: boolean;
  maxHeight?: string;
  className?: string;
}

export function CodeViewer({ 
  code, 
  filename = "example.ts",
  showDialectBadge = true,
  maxHeight = "max-h-64",
  className = ""
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const { enabled, dialect, showDialectBadge: globalShowBadge } = useObsMode();
  
  // Apply dialect transformation for display only
  const displayCode = enabled ? renderDialect(code, dialect) : code;
  
  // Copy button ALWAYS copies raw modern code
  const handleCopy = () => {
    navigator.clipboard.writeText(code); // Always raw code!
    setCopied(true);
    toast.success("Copied raw code to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shouldShowBadge = showDialectBadge && globalShowBadge && dialect !== 'modern';
  
  return (
    <div className={`relative group ${className}`}>
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-t-lg border border-b-0 border-border/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/50" />
          <div className="w-3 h-3 rounded-full bg-neon-amber/50" />
          <div className="w-3 h-3 rounded-full bg-neon-green/50" />
        </div>
        <span className="text-xs text-muted-foreground font-mono">{filename}</span>
        
        {shouldShowBadge && (
          <Badge 
            variant="outline" 
            className="ml-auto text-xs border-dashed gap-1 bg-muted/30"
          >
            <Eye className="w-3 h-3" />
            {DIALECT_LABELS[dialect]} · Display Only
          </Badge>
        )}
      </div>
      
      {/* Code block */}
      <pre className={`bg-muted/80 p-4 rounded-b-lg font-mono text-xs overflow-auto border border-t-0 border-border/50 ${maxHeight}`}>
        {displayCode}
      </pre>
      
      {/* Copy button - ALWAYS copies raw code */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity gap-1"
        onClick={handleCopy}
        title="Copy raw modern code"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? "Copied!" : "Copy Raw"}
      </Button>
    </div>
  );
}
