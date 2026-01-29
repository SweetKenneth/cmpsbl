/**
 * Dialect Selector — Display-only code skin toggle for CodeLab
 */

import { useObsMode } from "@/lib/ui/obsfunction-mode";
import { DIALECT_LABELS, DIALECT_DESCRIPTIONS, DisplayDialect } from "@/lib/ui/display-dialect";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Code, Terminal, Braces, MessageSquare, Hash } from "lucide-react";

const DIALECT_ICONS: Record<DisplayDialect, React.ElementType> = {
  modern: Code,
  lisp: Braces,
  c: Hash,
  smalltalk: MessageSquare,
  hacker: Terminal,
};

interface DialectSelectorProps {
  compact?: boolean;
}

export function DialectSelector({ compact = false }: DialectSelectorProps) {
  const { dialect, setDialect } = useObsMode();
  
  const Icon = DIALECT_ICONS[dialect];
  
  if (compact) {
    return (
      <Select value={dialect} onValueChange={(v) => setDialect(v as DisplayDialect)}>
        <SelectTrigger className="w-auto gap-2 h-8 text-xs border-dashed">
          <Icon className="w-3 h-3" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(DIALECT_LABELS) as DisplayDialect[]).map((d) => {
            const DIcon = DIALECT_ICONS[d];
            return (
              <SelectItem key={d} value={d}>
                <div className="flex items-center gap-2">
                  <DIcon className="w-4 h-4" />
                  <span>{DIALECT_LABELS[d]}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Code Display Dialect</label>
        <Badge variant="outline" className="text-xs bg-muted/50">
          Display Only
        </Badge>
      </div>
      
      <Select value={dialect} onValueChange={(v) => setDialect(v as DisplayDialect)}>
        <SelectTrigger className="w-full">
          <div className="flex items-center gap-2">
            <Icon className="w-4 h-4" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(DIALECT_LABELS) as DisplayDialect[]).map((d) => {
            const DIcon = DIALECT_ICONS[d];
            return (
              <SelectItem key={d} value={d}>
                <div className="flex items-center gap-2">
                  <DIcon className="w-4 h-4" />
                  <div>
                    <div className="font-medium">{DIALECT_LABELS[d]}</div>
                    <div className="text-xs text-muted-foreground">
                      {DIALECT_DESCRIPTIONS[d]}
                    </div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      
      <p className="text-xs text-muted-foreground">
        Display-only legacy dialects. Execution remains modern JS/TS.
      </p>
    </div>
  );
}
