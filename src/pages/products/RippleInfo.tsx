/**
 * Ripple Info — Communication Module Product Page
 * v9.3.0 ARCHITECT Epoch — Part of 21-module substrate
 */

import { SEO } from "@/components/SEO";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Radio, Megaphone, TrendingUp, Target, BarChart, Share2, ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6 },
};

const stagger = (i: number) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5, delay: i * 0.08 },
});

const features = [
  { icon: Megaphone, title: "AI Campaign Generation", description: "Generate complete multi-channel campaigns with consistent messaging across all platforms instantly." },
  { icon: Share2, title: "Multi-Platform Publishing", description: "Publish to all major platforms with one click—all formats automatically optimized." },
  { icon: Target, title: "Audience Targeting", description: "AI-powered audience analysis and segmentation to reach the right people at the right time." },
  { icon: TrendingUp, title: "Performance Optimization", description: "Continuous A/B testing and optimization to maximize engagement and conversion rates." },
  { icon: BarChart, title: "Real-Time Analytics", description: "Track campaign performance across all channels with unified reporting and insights." },
  { icon: CheckCircle, title: "Brand Consistency", description: "Maintain your brand voice and visual identity automatically across all content." },
];

const campaignTypes = [
  { title: "Social Media Campaigns", description: "Posts, stories, reels, and ads for all major platforms with optimal timing." },
  { title: "Email Marketing", description: "Welcome sequences, newsletters, drip campaigns, and promotional emails." },
  { title: "Content Marketing", description: "SEO-optimized blog posts, whitepapers, case studies, and educational content." },
  { title: "Paid Advertising", description: "Google Ads, Facebook Ads, LinkedIn Ads with optimized copy and targeting." },
  { title: "Product Launches", description: "Complete launch campaigns with teasers, announcements, and follow-up." },
  { title: "Seasonal Promotions", description: "Holiday campaigns, sales events, and limited-time offers across all channels." },
];

const stats = [
  { value: "10x", label: "Faster Campaign Creation", gradient: "from-primary to-primary-variant" },
  { value: "6", label: "AI Providers Integrated", gradient: "from-primary-variant to-accent" },
  { value: "14", label: "Module Synergies", gradient: "from-accent to-primary" },
];

const benefits = [
  "Create a month of content in under an hour",
  "Maintain brand consistency across all channels automatically",
  "Test multiple variations without additional effort",
  "Scale campaigns without hiring more team members",
  "Get data-driven insights to improve performance continuously",
  "Integrate seamlessly with all 14 CMPSBL modules",
];

export default function RippleInfo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Ripple Module — AI Communication & Marketing Orchestration | CMPSBL"
        description="Generate multi-platform campaigns instantly with AI. Part of CMPSBL's 21-module cognitive substrate for intelligent content creation and distribution."
        canonical="https://cmpsbl.com/products/ripple"
        keywords={['AI marketing orchestration', 'CMPSBL Ripple', 'cognitive communication module', 'AI content generation', 'multi-channel marketing AI', 'marketing campaign creator', 'automated content platform', 'AI copywriting engine', 'marketing analytics AI', 'campaign performance tracking']}
      />

      <PublicNav />

      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          className="absolute top-10 left-1/4 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--neon-magenta) / 0.05) 0%, transparent 60%)" }}
          animate={{ x: [-50, 50, -50], y: [-25, 25, -25] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-1/3 w-[400px] h-[400px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 60%)" }}
          animate={{ x: [30, -30, 30], y: [15, -15, 15] }}
          transition={{ duration: 28, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Hero */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
              <Radio className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Ripple Module</span>
            </div>
          </motion.div>
          <motion.h1 {...fadeUp} transition={{ duration: 0.6, delay: 0.1 }} className="text-5xl md:text-6xl font-bold mb-6">
            Create Campaigns.
            <br />
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Amplify Results.
            </span>
          </motion.h1>
          <motion.p {...fadeUp} transition={{ duration: 0.6, delay: 0.2 }} className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Generate complete marketing campaigns across all channels with AI. Part of CMPSBL's 21-module 
            cognitive substrate for intelligent communication orchestration.
          </motion.p>
          <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.3 }} className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/auth')} className="group">
              Start Creating Free
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')}>
              See Examples
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 container mx-auto px-4 py-20 flex-1">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div key={index} {...stagger(index)}>
              <Card className="p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-primary-variant flex items-center justify-center mb-4 shadow-md shadow-primary/20">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Campaign Types */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fadeUp} className="text-3xl font-bold text-center mb-12">
            Generate Any Type of Campaign
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-4">
            {campaignTypes.map((type, index) => (
              <motion.div key={index} {...stagger(index)}>
                <Card className="p-6 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 h-full">
                  <h3 className="text-lg font-semibold mb-2">{type.title}</h3>
                  <p className="text-muted-foreground text-sm">{type.description}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div {...fadeUp} className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            {stats.map((stat, i) => (
              <motion.div key={i} {...stagger(i)}>
                <div className={`text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Benefits */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.h2 {...fadeUp} className="text-3xl font-bold text-center mb-12">
            Why Teams Love Ripple Module
          </motion.h2>
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div key={index} {...stagger(index)} className="flex items-start gap-3 glass p-4 rounded-lg hover:border-primary/20 transition-colors">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-muted-foreground">{benefit}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 container mx-auto px-4 py-20">
        <motion.div {...fadeUp} className="max-w-3xl mx-auto text-center glass p-12 rounded-2xl border border-primary/10">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Marketing?</h2>
          <p className="text-muted-foreground mb-6">
            Start creating AI-powered campaigns with CMPSBL's Ripple module today.
          </p>
          <Button size="lg" onClick={() => navigate('/auth')} className="group">
            Start Creating Free
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
