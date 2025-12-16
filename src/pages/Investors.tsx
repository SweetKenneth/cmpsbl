import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Download, FileText, BarChart3, DollarSign } from "lucide-react";

export default function Investors() {
  const metrics = [
    { label: "Core Products", value: "3", trend: "In Development" },
    { label: "Founded", value: "2024", trend: "Seed Stage" },
    { label: "AI Providers", value: "6", trend: "Free-Tier" },
    { label: "Team Size", value: "1", trend: "Founder" },
  ];

  const documents = [
    { name: "Pitch Deck", date: "Available on request", type: "PDF" },
    { name: "Product Roadmap", date: "Available on request", type: "PDF" },
    { name: "Technical Overview", date: "Available on request", type: "PDF" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Investor Relations</h1>
          <p className="text-muted-foreground">Seed stage investment opportunity</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-3xl font-bold text-foreground">{metric.value}</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-medium">{metric.trend}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Investment Opportunity</h2>
            <p className="text-muted-foreground">Seeking Seed Funding</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Request Materials
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <BarChart3 className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Market Opportunity</h3>
            <p className="text-sm text-muted-foreground">
              WordPress security and web accessibility markets with significant growth potential
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <DollarSign className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-semibold mb-1">Revenue Model</h3>
            <p className="text-sm text-muted-foreground">
              Freemium SaaS with premium tiers for Bot Sniper; Clarity remains free forever
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-semibold mb-1">Product Status</h3>
            <p className="text-sm text-muted-foreground">
              Reflex Bot Sniper pending WordPress.org; Clarity live and free; Dream Eater experimental
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Investor Documents</h2>
        {documents.map((doc) => (
          <Card key={doc.name} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{doc.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.type} • Updated {doc.date}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
