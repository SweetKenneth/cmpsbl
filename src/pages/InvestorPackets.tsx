import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FileText, Download, Loader2 } from "lucide-react";
import { SEO } from "@/components/SEO";

export default function InvestorPackets() {
  const [generating, setGenerating] = useState(false);
  const [lastPacket, setLastPacket] = useState<any>(null);

  const downloadHTML = (content: string, filename?: string) => {
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `investor-packet-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const generatePacket = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-investor-packet', {
        method: 'POST'
      });

      if (error) throw error;

      setLastPacket(data);

      // Auto-download immediately if content is returned
      if (data?.content) {
        downloadHTML(data.content, data.filename);
        toast.success('Investor packet generated and downloaded');
      } else {
        toast.success('Investor packet generated successfully');
      }
    } catch (error) {
      console.error('Failed to generate packet:', error);
      toast.error('Failed to generate investor packet');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <SEO 
        title="Investor Packets - PromptFluid Vision"
        description="Generate automated investor packets with current valuation and metrics"
      />
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Investor Packet Generator</h1>
          <p className="text-muted-foreground">
            Auto-generate investor materials from live system data
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generate New Packet
            </CardTitle>
            <CardDescription>
              Creates a comprehensive packet with current valuation, metrics, and system status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={generatePacket} 
              disabled={generating}
              className="w-full sm:w-auto"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Investor Packet
                </>
              )}
            </Button>

            {lastPacket && (
              <Card className="bg-muted/50">
                <CardContent className="pt-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Latest Packet</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (!lastPacket?.content) {
                          toast.error('No downloadable content returned');
                          return;
                        }
                        downloadHTML(lastPacket.content, lastPacket.filename);
                      }}
                      disabled={!lastPacket?.content}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  <div className="text-sm space-y-1">
                    <p><strong>Valuation:</strong> ${lastPacket.valuation?.toLocaleString()}</p>
                    <p><strong>Revenue:</strong> ${lastPacket.revenue?.toFixed(2)}</p>
                    <p><strong>Installs:</strong> {lastPacket.installs}</p>
                    {lastPacket.filename ? (
                      <p className="text-muted-foreground">{lastPacket.filename}</p>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>What's Included</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Current valuation calculation (base + revenue multiple)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Live plugin metrics (installs, activations, revenue)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>System completion status and operational metrics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>Growth trajectory and next milestones</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
