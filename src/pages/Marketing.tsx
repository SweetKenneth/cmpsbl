import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Megaphone, TrendingUp, Users, Target, Mail, Share2, ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";

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
    <div className="min-h-screen bg-background">
      <SEO 
        title="Marketing Hub — PromptFluid Campaign Management"
        description="Campaign management and analytics for PromptFluid marketing initiatives."
        canonical="https://promptfluid.com/marketing"
        keywords={['marketing analytics', 'campaign management', 'AI marketing']}
      />

      <PublicNav />

      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <div 
          className="absolute inset-0 h-[50vh] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 h-[50vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-16">
          <nav className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </nav>
          
          <div className="max-w-4xl">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              <Megaphone className="w-3 h-3 mr-2" />
              Campaign Hub
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Marketing Hub
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Campaign management and analytics for growth.
            </p>
          </div>
        </div>
      </section>

      {/* Metrics */}
      <section className="border-y border-border bg-muted/30">
        <div className="container mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <div key={metric.label} className="text-center">
                  <Icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-3xl font-bold text-foreground mb-1">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.label}</p>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-[hsl(var(--system-green))]" />
                    <span className="text-xs text-[hsl(var(--system-green))] font-medium">{metric.trend}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Campaigns */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-foreground">Active Campaigns</h2>
            <Button className="bg-primary hover:bg-primary/90">
              <Megaphone className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
          
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <Card key={campaign.name} className="p-6 bg-card border-border hover:border-primary/40 transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <h3 className="font-semibold text-lg text-foreground">{campaign.name}</h3>
                      <Badge variant={campaign.status === "Active" ? "default" : "outline"}>
                        {campaign.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Reach</p>
                        <p className="font-semibold text-lg text-foreground">{campaign.reach}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conversion</p>
                        <p className="font-semibold text-lg text-[hsl(var(--system-green))]">{campaign.conversion}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Budget</p>
                        <p className="font-semibold text-lg text-foreground">{campaign.budget}</p>
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
        </div>
      </section>

      {/* Earth Window */}
      <section className="relative w-full h-[40vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
            <p className="text-2xl md:text-4xl font-light text-white drop-shadow-lg">
              "Growth through intelligent systems."
            </p>
          </blockquote>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6 bg-card border-border">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Content Calendar</h3>
              <div className="space-y-3">
                {[
                  { date: "Dec 20", title: "AI Trends 2026 Blog Post", status: "Planned" },
                  { date: "Dec 22", title: "Product Update Newsletter", status: "Draft" },
                  { date: "Jan 05", title: "Feature Spotlight", status: "Planned" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="text-sm font-mono text-muted-foreground">{item.date}</div>
                      <div>
                        <p className="font-medium text-foreground">{item.title}</p>
                      </div>
                    </div>
                    <Badge variant="outline">{item.status}</Badge>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-card border-border">
              <h3 className="text-xl font-semibold mb-4 text-foreground">Quick Actions</h3>
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
      </section>

      <EnhancedFooter />
    </div>
  );
}
