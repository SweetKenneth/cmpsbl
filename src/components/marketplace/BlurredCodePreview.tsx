/**
 * BlurredCodePreview — Shows code structure with blurred/redacted implementation
 * Protects trade secrets while enticing buyers
 */

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Eye, ShoppingCart, Code, Shield } from 'lucide-react';

interface BlurredCodePreviewProps {
  code: string;
  isPurchased?: boolean;
  onBuy: () => void;
  isLoading?: boolean;
  /** When true, source is permanently sealed — no purchase can unlock it */
  isBlackBoxed?: boolean;
}

// Redact sensitive implementation details
function redactCode(code: string): string {
  const lines = code.split('\n');
  
  return lines.map((line, index) => {
    // Keep structure visible: imports, function signatures, comments
    if (line.trim().startsWith('//') || line.trim().startsWith('/*') || line.trim().startsWith('*')) {
      return line;
    }
    if (line.trim().startsWith('import') || line.trim().startsWith('export')) {
      return line;
    }
    if (line.includes('function') || line.includes('const ') && line.includes('=') && line.includes('=>')) {
      // Show function signatures but blur body
      return line;
    }
    if (line.trim().startsWith('interface') || line.trim().startsWith('type')) {
      return line;
    }
    if (line.trim() === '{' || line.trim() === '}' || line.trim() === '') {
      return line;
    }
    if (line.trim().startsWith('return')) {
      return line.replace(/return\s+.+/, 'return /* ... implementation hidden ... */');
    }
    
    // Blur actual implementation lines
    if (index % 3 === 0) {
      return '  // ... proprietary logic ...';
    }
    if (index % 5 === 0) {
      return '  /* ▓▓▓ protected implementation ▓▓▓ */';
    }
    
    // Partially redact some lines
    const words = line.split(' ');
    if (words.length > 4) {
      return words.slice(0, 2).join(' ') + ' ▓▓▓ ' + words.slice(-1).join(' ');
    }
    
    return line;
  }).join('\n');
}

export function BlurredCodePreview({ code, isPurchased, onBuy, isLoading, isBlackBoxed }: BlurredCodePreviewProps) {
  const [revealHint, setRevealHint] = useState(false);
  
  // Black-boxed items never reveal source, even if purchased
  const displayCode = (isPurchased && !isBlackBoxed) ? code : redactCode(code);
  const lineCount = code.split('\n').length;

  return (
    <div className="relative group">
      {/* Code container */}
      <div className="relative rounded-xl overflow-hidden border bg-zinc-950">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-800 bg-zinc-900">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-zinc-500" />
            <span className="text-xs text-zinc-400">
              {isPurchased ? 'Full Source Code' : 'Protected Preview'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {!isPurchased && (
              <Badge variant="outline" className="text-[10px] border-amber-500/50 text-amber-400 gap-1">
                <Lock className="w-3 h-3" />
                Trade Secret Protected
              </Badge>
            )}
            <span className="text-xs text-zinc-500">{lineCount} lines</span>
          </div>
        </div>

        {/* Code content */}
        <div className="relative">
          <pre className={cn(
            "p-4 overflow-x-auto text-sm font-mono max-h-[400px] overflow-y-auto",
            !isPurchased && "select-none"
          )}>
            <code className={cn("text-zinc-100", isBlackBoxed && "select-none")}>
              {displayCode.split('\n').map((line, i) => (
                <div key={i} className="flex">
                  <span className="w-10 text-right pr-4 text-zinc-600 select-none shrink-0">
                    {i + 1}
                  </span>
                  <span className={cn(
                    !isPurchased && (
                      line.includes('▓▓▓') || 
                      line.includes('proprietary') || 
                      line.includes('protected') ||
                      line.includes('hidden')
                    ) && "text-zinc-600 italic"
                  )}>
                    {line || ' '}
                  </span>
                </div>
              ))}
            </code>
          </pre>

          {/* Gradient overlay for non-purchased or black-boxed */}
          {(!isPurchased || isBlackBoxed) && (
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />
          )}
        </div>
      </div>

      {/* Black-box sealed overlay — permanent, no purchase can unlock */}
      {isBlackBoxed && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/70 backdrop-blur-[3px] rounded-xl"
        >
          <div className="text-center space-y-4 p-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <Shield className="w-8 h-8 text-orange-400" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">
                Sealed Runtime
              </h4>
              <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                This capability is delivered as a black-boxed runtime. Source code is permanently sealed to protect proprietary architecture.
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] border-orange-500/50 text-orange-400 gap-1">
              <Lock className="w-3 h-3" />
              Black-Box Protected
            </Badge>
          </div>
        </div>
      )}

      {/* Purchase overlay — only for non-purchased, non-black-boxed items */}
      {!isPurchased && !isBlackBoxed && (
        <div 
          className={cn(
            "absolute inset-0 flex flex-col items-center justify-center",
            "bg-zinc-950/60 backdrop-blur-[2px] rounded-xl",
            "transition-opacity duration-300",
            revealHint ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onMouseEnter={() => setRevealHint(true)}
          onMouseLeave={() => setRevealHint(false)}
        >
          <div className="text-center space-y-4 p-6">
            <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-bold text-white">
                Full Implementation Protected
              </h4>
              <p className="text-sm text-zinc-400 max-w-xs mx-auto">
                Purchase to unlock the complete source code, documentation, and integration guides.
              </p>
            </div>
            <Button 
              onClick={onBuy}
              disabled={isLoading}
              className="gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {isLoading ? 'Processing...' : 'Unlock Full Code'}
            </Button>
          </div>
        </div>
      )}

      {/* Watermark for non-purchased */}
      {!isPurchased && (
        <div className="absolute bottom-4 right-4 text-[10px] text-zinc-700 font-mono pointer-events-none">
          © CMPSBL® — Trade Secret
        </div>
      )}
    </div>
  );
}
