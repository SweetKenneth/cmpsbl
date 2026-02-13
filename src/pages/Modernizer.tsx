import { useState } from 'react';
import { motion } from 'framer-motion';
import { ModernizerForm } from '@/components/modernizer/ModernizerForm';
import { ModernizerJobStatus } from '@/components/modernizer/ModernizerJobStatus';
import { ModernizerDashboard } from '@/components/modernizer/ModernizerDashboard';
import { PricingTiers } from '@/components/modernizer/PricingTiers';
import { UsageLimits } from '@/components/modernizer/UsageLimits';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { SEO } from '@/components/SEO';
import { Sparkles, Shield, TrendingUp, Clock, Zap, Wand2 } from 'lucide-react';

const Modernizer = () => {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  const stats = [
    { icon: Shield, value: '95+', label: 'Accessibility Score', color: 'text-primary' },
    { icon: TrendingUp, value: '92+', label: 'SEO Score', color: 'text-accent' },
    { icon: Clock, value: '<10min', label: 'Average Build', color: 'text-primary-glow' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="AI Website Modernizer — Transform Legacy Sites | CMPSBL"
        description="Turn outdated websites into modern, accessible, SEO-optimized experiences in minutes. Export clean code or host with us."
        canonical="https://cmpsbl.com/modernizer"
      />
      
      <PublicNav />

      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        {/* Ambient glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-[100px]" />
        </div>

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6 max-w-4xl mx-auto"
          >
            <Badge variant="outline" className="gap-2 px-4 py-2 text-sm border-primary/30 bg-primary/5">
              <Sparkles className="w-4 h-4 text-primary" />
              AI-Powered Modernization
            </Badge>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
                Transform Legacy Sites
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
                in Minutes
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Turn outdated websites into modern, accessible, SEO-optimized experiences. 
              Export clean code or host with us.
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 pt-8 max-w-xl mx-auto">
              {stats.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.1 }}
                  className="text-center p-4 rounded-xl bg-card/50 border border-border/50 backdrop-blur-sm"
                >
                  <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                  <p className={`text-2xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="new" className="space-y-8">
          <TabsList className="grid w-full max-w-lg mx-auto grid-cols-3 h-12 p-1 bg-muted/50">
            <TabsTrigger value="new" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Wand2 className="w-4 h-4 mr-2" />
              New
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Zap className="w-4 h-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="pricing" className="text-sm font-medium data-[state=active]:bg-background data-[state=active]:shadow-sm">
              Pricing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border-2 border-border/50 shadow-lg bg-card/80 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <ModernizerForm onJobCreated={setActiveJobId} />
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <UsageLimits />
              </div>
            </div>

            {activeJobId && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
              >
                <ModernizerJobStatus jobId={activeJobId} />
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="dashboard">
            <ModernizerDashboard onSelectJob={setActiveJobId} />
            {activeJobId && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 max-w-4xl mx-auto"
              >
                <ModernizerJobStatus jobId={activeJobId} />
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="pricing">
            <PricingTiers />
          </TabsContent>
        </Tabs>
      </div>

      <EnhancedFooter />
    </div>
  );
};

export default Modernizer;