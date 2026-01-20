/**
 * Version Bump Dialog
 * Modal for bumping bot versions with changelog
 */

import { useState } from 'react';
import { Loader2, ArrowUp, GitBranch } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';

interface VersionBumpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentVersion: string;
  botName: string;
  onBump: (bumpType: 'major' | 'minor' | 'patch', changelog: string) => Promise<void>;
}

function parseVersion(version: string): [number, number, number] {
  const [major, minor, patch] = version.split('.').map(Number);
  return [major || 1, minor || 0, patch || 0];
}

function formatVersion(major: number, minor: number, patch: number): string {
  return `${major}.${minor}.${patch}`;
}

export function VersionBumpDialog({
  open,
  onOpenChange,
  currentVersion,
  botName,
  onBump,
}: VersionBumpDialogProps) {
  const [bumpType, setBumpType] = useState<'major' | 'minor' | 'patch'>('patch');
  const [changelog, setChangelog] = useState('');
  const [loading, setLoading] = useState(false);

  const [major, minor, patch] = parseVersion(currentVersion);

  const getNewVersion = () => {
    switch (bumpType) {
      case 'major':
        return formatVersion(major + 1, 0, 0);
      case 'minor':
        return formatVersion(major, minor + 1, 0);
      case 'patch':
        return formatVersion(major, minor, patch + 1);
    }
  };

  const handleBump = async () => {
    setLoading(true);
    try {
      await onBump(bumpType, changelog);
      onOpenChange(false);
      setChangelog('');
      setBumpType('patch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Bump Version
          </DialogTitle>
          <DialogDescription>
            Create a new version of <strong>{botName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Version Preview */}
          <div className="flex items-center justify-center gap-4 p-4 rounded-lg bg-muted/50">
            <Badge variant="outline" className="text-lg font-mono">
              v{currentVersion}
            </Badge>
            <ArrowUp className="w-5 h-5 text-muted-foreground rotate-90" />
            <Badge className="text-lg font-mono bg-primary">
              v{getNewVersion()}
            </Badge>
          </div>

          {/* Bump Type */}
          <div className="space-y-3">
            <Label>Version Bump Type</Label>
            <RadioGroup
              value={bumpType}
              onValueChange={(v) => setBumpType(v as typeof bumpType)}
              className="grid grid-cols-3 gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="patch" id="patch" />
                <Label htmlFor="patch" className="cursor-pointer">
                  <span className="block font-medium">Patch</span>
                  <span className="text-xs text-muted-foreground">Bug fixes</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minor" id="minor" />
                <Label htmlFor="minor" className="cursor-pointer">
                  <span className="block font-medium">Minor</span>
                  <span className="text-xs text-muted-foreground">New features</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="major" id="major" />
                <Label htmlFor="major" className="cursor-pointer">
                  <span className="block font-medium">Major</span>
                  <span className="text-xs text-muted-foreground">Breaking changes</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Changelog */}
          <div className="space-y-2">
            <Label htmlFor="changelog">Changelog</Label>
            <Textarea
              id="changelog"
              placeholder="Describe what changed in this version..."
              value={changelog}
              onChange={(e) => setChangelog(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleBump} disabled={loading} className="gap-2">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
            Create v{getNewVersion()}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
