/**
 * Name Chooser — Personalize your cognitive before download
 */

import { useState, useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import { generateCognitiveName, validateCognitiveName } from "@/lib/cognitives/nameGen";
import { secureGet, secureSet } from "@/lib/system/secureStorage";

interface NameChooserProps {
  value: string;
  onChange: (name: string) => void;
}

export function NameChooser({ value, onChange }: NameChooserProps) {
  const [error, setError] = useState<string>();

  // Load from secure storage on mount
  useEffect(() => {
    if (!value) {
      const saved = secureGet<string>('cmpsbl_cognitive_name');
      if (saved) onChange(saved);
      else onChange(generateCognitiveName());
    }
  }, []);

  const handleChange = useCallback((val: string) => {
    const result = validateCognitiveName(val);
    setError(result.valid ? undefined : result.error);
    onChange(val);
    if (result.valid) secureSet('cmpsbl_cognitive_name', val);
  }, [onChange]);

  const randomize = useCallback(() => {
    const name = generateCognitiveName();
    setError(undefined);
    onChange(name);
    secureSet('cmpsbl_cognitive_name', name);
  }, [onChange]);

  return (
    <div className="space-y-2">
      <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
        Name Your Cognitive
      </label>
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder="e.g. Nova-Agent"
          className="font-mono bg-background/50 border-primary/20 focus:border-primary/50"
          maxLength={32}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={randomize}
          className="shrink-0 border-primary/20 hover:border-primary/50"
          title="Randomize name"
        >
          <Shuffle className="w-4 h-4" />
        </Button>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
