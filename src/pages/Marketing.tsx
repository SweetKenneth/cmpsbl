import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Megaphone, TrendingUp, Users, Target, Mail, Share2 } from "lucide-react";

export default function Marketing() {
  const campaigns = [
    { name: "Product Launch Q4", status: "Active", reach: "45K", conversion: "3.2%", budget: "$5K" },
    { name: "Developer Outreach", status: "Active", reach: "28K", conversion: "4.1%", budget: "$3K" },
    { name: "Enterprise Sales", status: "Planning", reach: "12K", conversion: "8.5%", budget: "$8K" },
  ];

  const metrics = [
    { label: "Website Visitors", value: "87.5K", icon: Users, trend: "+24%" },
    { label: "Conversion Rate", value: "4.2%", icon: Target, trend: "+12%" },
    { label: "Email Open Rate", value: "32.8%", icon: Mail, trend: "+8%" },
    { label: "Social Engagement", value: "12.3K", icon: Share2, trend: "+31%" },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Megaphone className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Marketing Hub</h1>
          <p className="text-muted-foreground">Campaign management and analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Icon className="w-6 h-6 text-primary" />
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-500 font-medium">{metric.trend}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-3xl font-bold text-foreground">{metric.value}</p>
            </Card>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Active Campaigns</h2>
          <Button>
            <Megaphone className="w-4 h-4 mr-2" />
            New Campaign
          </Button>
        </div>
        
        {campaigns.map((campaign) => (
          <Card key={campaign.name} className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="font-semibold text-lg">{campaign.name}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'Active' 
                      ? 'bg-green-500/20 text-green-500' 
                      : 'bg-yellow-500/20 text-yellow-500'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Reach</p>
                    <p className="font-semibold text-lg">{campaign.reach}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Conversion</p>
                    <p className="font-semibold text-lg text-green-500">{campaign.conversion}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-semibold text-lg">{campaign.budget}</p>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Content Calendar</h3>
          <div className="space-y-3">
            {[
              { date: "Dec 20", title: "AI Trends 2026 Blog Post", status: "Planned" },
              { date: "Dec 22", title: "Product Update Newsletter", status: "Draft" },
              { date: "Jan 05", title: "Feature Spotlight", status: "Planned" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="text-sm font-mono text-muted-foreground">{item.date}</div>
                  <div>
                    <p className="font-medium">{item.title}</p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-secondary">{item.status}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-20">
              <Mail className="w-5 h-5 mr-2" />
              Send Newsletter
            </Button>
            <Button variant="outline" className="h-20">
              <Share2 className="w-5 h-5 mr-2" />
              Social Post
            </Button>
            <Button variant="outline" className="h-20">
              <Target className="w-5 h-5 mr-2" />
              Create Ad
            </Button>
            <Button variant="outline" className="h-20">
              <TrendingUp className="w-5 h-5 mr-2" />
              View Analytics
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
