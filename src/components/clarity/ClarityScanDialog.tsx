import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClarityScanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onScanComplete: () => void;
}

export function ClarityScanDialog({ open, onOpenChange, onScanComplete }: ClarityScanDialogProps) {
  const [url, setUrl] = useState("");
  const [wcagLevel, setWcagLevel] = useState("AA");
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async () => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }

    setIsScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("pf-access-scan", {
        body: { url, wcagLevel, scanDepth: "quick" }
      });

      if (error) throw error;

      if (data.success) {
        toast.success("Scan completed successfully!");
        onOpenChange(false);
        onScanComplete();
        setUrl("");
      } else {
        toast.error(data.error || "Scan failed");
      }
    } catch (error: any) {
      console.error("Scan error:", error);
      toast.error(error.message || "Failed to start scan");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>New Accessibility Scan</DialogTitle>
          <DialogDescription>
            Enter a website URL to scan for WCAG compliance issues
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isScanning}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wcag-level">WCAG Level</Label>
            <Select value={wcagLevel} onValueChange={setWcagLevel} disabled={isScanning}>
              <SelectTrigger id="wcag-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="A">Level A (Minimum)</SelectItem>
                <SelectItem value="AA">Level AA (Mid-range)</SelectItem>
                <SelectItem value="AAA">Level AAA (Highest)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isScanning}>
            Cancel
          </Button>
          <Button onClick={handleScan} disabled={isScanning}>
            {isScanning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isScanning ? "Scanning..." : "Start Scan"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
