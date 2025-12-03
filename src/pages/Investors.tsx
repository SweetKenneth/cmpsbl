import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Download, FileText, BarChart3, DollarSign } from "lucide-react";

export default function Investors() {
  const metrics = [
    { label: "Monthly Recurring Revenue", value: "$47.2K", trend: "+23%" },
    { label: "Active Users", value: "1,247", trend: "+18%" },
    { label: "Customer Retention", value: "94.3%", trend: "+5%" },
    { label: "Gross Margin", value: "82%", trend: "+2%" },
  ];

  const documents = [
    { name: "Pitch Deck Q4 2025", date: "2025-11-15", type: "PDF" },
    { name: "Financial Statement Oct 2025", date: "2025-11-01", type: "PDF" },
    { name: "Product Roadmap 2026", date: "2025-10-20", type: "PDF" },
    { name: "Market Analysis Report", date: "2025-10-15", type: "PDF" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Investor Relations</h1>
          <p className="text-muted-foreground">Financial metrics and investor documents</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-3xl font-bold text-foreground">{metric.value}</p>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">{metric.trend}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Executive Summary</h2>
            <p className="text-muted-foreground">Q4 2025 Performance</p>
          </div>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Download Full Report
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg">
            <BarChart3 className="w-8 h-8 text-primary mb-2" />
            <h3 className="font-semibold mb-1">Revenue Growth</h3>
            <p className="text-sm text-muted-foreground">
              Consistent 20%+ MoM growth with strong customer acquisition
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <DollarSign className="w-8 h-8 text-green-500 mb-2" />
            <h3 className="font-semibold mb-1">Unit Economics</h3>
            <p className="text-sm text-muted-foreground">
              CAC payback in 4.2 months with 82% gross margin
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <TrendingUp className="w-8 h-8 text-blue-500 mb-2" />
            <h3 className="font-semibold mb-1">Market Position</h3>
            <p className="text-sm text-muted-foreground">
              Leading AI orchestration platform with unique Brain technology
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
