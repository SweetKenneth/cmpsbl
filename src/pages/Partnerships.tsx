import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Handshake, CheckCircle, Clock, ExternalLink } from "lucide-react";

export default function Partnerships() {
  const partners = [
    { name: "Railway", status: "active", type: "Infrastructure", integration: "Complete", logo: "🚂" },
    { name: "Supabase", status: "active", type: "Database", integration: "Complete", logo: "⚡" },
    { name: "Groq", status: "active", type: "AI Provider", integration: "Complete", logo: "🧠" },
    { name: "Cerebras", status: "active", type: "AI Provider", integration: "Complete", logo: "🤖" },
    { name: "Together AI", status: "active", type: "AI Provider", integration: "Complete", logo: "🎯" },
    { name: "DeepSeek", status: "active", type: "AI Provider", integration: "Complete", logo: "💡" },
  ];

  const opportunities = [
    { name: "Content Management Platform", value: "$50K ARR", stage: "Negotiation" },
    { name: "E-commerce Integration", value: "$120K ARR", stage: "Proposal" },
    { name: "Enterprise SaaS Provider", value: "$200K ARR", stage: "Discovery" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Handshake className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Strategic Partnerships</h1>
          <p className="text-muted-foreground">Ecosystem integrations and collaborations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Active Partners</p>
            <p className="text-4xl font-bold text-primary">
              {partners.filter(p => p.status === 'active').length}
            </p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-4xl font-bold text-yellow-500">
              {partners.filter(p => p.status === 'pending').length}
            </p>
          </div>
        </Card>
        <Card className="p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Pipeline Value</p>
            <p className="text-4xl font-bold text-green-500">$370K</p>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Current Partners</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {partners.map((partner) => (
            <Card key={partner.name} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{partner.logo}</div>
                  <div>
                    <h3 className="font-semibold text-lg">{partner.name}</h3>
                    <p className="text-sm text-muted-foreground">{partner.type}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={partner.status === 'active' ? 'default' : 'secondary'}>
                    {partner.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                    {partner.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                    {partner.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{partner.integration}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Partnership Opportunities</h2>
        {opportunities.map((opp) => (
          <Card key={opp.name} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{opp.name}</h3>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm text-muted-foreground">Potential Value: <span className="text-green-500 font-semibold">{opp.value}</span></span>
                  <Badge variant="outline">{opp.stage}</Badge>
                </div>
              </div>
              <Button variant="outline">
                View Details
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20">
        <h3 className="text-xl font-semibold mb-2">Become a Partner</h3>
        <p className="text-muted-foreground mb-4">
          Join the PromptFluid ecosystem and integrate AI-powered intelligence into your platform.
        </p>
        <Button>Contact Partnership Team</Button>
      </Card>
    </div>
  );
}
