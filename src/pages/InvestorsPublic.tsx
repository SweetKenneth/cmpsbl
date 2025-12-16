import { TrendingUp, DollarSign, Users, Rocket, FileText, BarChart, Award, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";

export default function InvestorsPublic() {
  const navigate = useNavigate();

  const metrics = [
    { icon: Users, label: "Products Live", value: "5+", color: "text-blue-500" },
    { icon: TrendingUp, label: "Development Stage", value: "Active", color: "text-green-500" },
    { icon: Award, label: "Edge Functions", value: "270+", color: "text-purple-500" },
    { icon: Target, label: "Market Position", value: "First Mover", color: "text-orange-500" }
  ];

  const highlights = [
    {
      icon: Rocket,
      title: "First Mover Advantage",
      description: "World's first AI with autonomous dream cycles. Multiple WordPress.org submissions live with active users."
    },
    {
      icon: DollarSign,
      title: "Multiple Revenue Streams",
      description: "WordPress plugins, SaaS subscriptions, API licensing, and enterprise contracts."
    },
    {
      icon: BarChart,
      title: "Proven Technology",
      description: "Complete infrastructure with 270+ edge functions, 80+ database tables, full production deployment."
    },
    {
      icon: FileText,
      title: "IP Portfolio",
      description: "Proprietary AI architecture, dream cycle intelligence, behavioral analysis systems, and adaptive learning models."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Investors — PromptFluid Funding Opportunities"
        description="Invest in the world's first dreaming AI. Revolutionary technology, multiple revenue streams, first-mover advantage in AI-powered automation and security."
        canonical="https://promptfluid.com/investors"
        keywords={[
          'AI startup investment',
          'venture capital AI',
          'AI security funding',
          'machine learning investment',
          'AI automation startup',
          'WordPress plugin funding',
          'SaaS investment opportunity',
          'AI technology investors',
          'early stage AI funding',
          'AI infrastructure investment'
        ]}
      />
      
      <PublicNav />

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <TrendingUp className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">Investment Opportunity</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Invest in the AI That Dreams
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Join us in building the world's first AI ecosystem with autonomous dream intelligence. Revolutionary technology with proven traction and multiple revenue streams.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/contact')}
              className="bg-gradient-to-r from-primary via-primary-variant to-accent hover:shadow-glow-lg"
            >
              Schedule Meeting
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/investor-packets')}
            >
              <FileText className="w-5 h-5 mr-2" />
              Download Investor Deck
            </Button>
          </div>
        </div>
      </div>

      {/* Metrics Bar */}
      <div className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <metric.icon className={`w-8 h-8 mx-auto mb-2 ${metric.color}`} />
                <div className="text-3xl font-bold mb-1">{metric.value}</div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Highlights */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Investment Highlights
            </span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {highlights.map((highlight, index) => (
              <Card 
                key={index}
                className="p-6 glass border-border/50"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-4">
                  <highlight.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{highlight.title}</h3>
                <p className="text-muted-foreground">{highlight.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-4xl mx-auto text-center glass rounded-3xl p-12 border border-primary/20">
          <h2 className="text-3xl font-bold mb-4">Ready to Learn More?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Download our comprehensive investor packet or schedule a meeting with our team to discuss partnership opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => navigate('/investor-packets')}
            >
              Access Investor Materials
            </Button>
            <Button 
              size="lg"
              variant="outline"
              onClick={() => navigate('/contact')}
            >
              Contact Team
            </Button>
          </div>
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
}
