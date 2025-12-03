import { useState } from 'react';
import { ModernizerForm } from '@/components/modernizer/ModernizerForm';
import { ModernizerJobStatus } from '@/components/modernizer/ModernizerJobStatus';
import { ModernizerDashboard } from '@/components/modernizer/ModernizerDashboard';
import { PricingTiers } from '@/components/modernizer/PricingTiers';
import { UsageLimits } from '@/components/modernizer/UsageLimits';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';

const Modernizer = () => {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 animate-pulse" style={{ animationDuration: '3s' }} />
        <div className="relative container mx-auto px-4 py-16">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-sm font-semibold text-primary">AI-Powered Modernization</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent leading-tight">
              Transform Legacy Sites in Minutes
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Turn outdated websites into modern, accessible, SEO-optimized experiences. Export clean code or host with us.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-6 max-w-2xl mx-auto">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-transparent border border-primary/20">
                <p className="text-4xl font-bold text-primary mb-1">95+</p>
                <p className="text-sm font-medium text-muted-foreground">Accessibility Score</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-accent/10 to-transparent border border-accent/20">
                <p className="text-4xl font-bold text-accent mb-1">92+</p>
                <p className="text-sm font-medium text-muted-foreground">SEO Score</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary-glow/10 to-transparent border border-primary-glow/20">
                <p className="text-4xl font-bold text-primary-glow mb-1">&lt;10min</p>
                <p className="text-sm font-medium text-muted-foreground">Average Build</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="new" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 h-12">
            <TabsTrigger value="new" className="text-base">New Modernization</TabsTrigger>
            <TabsTrigger value="dashboard" className="text-base">Dashboard</TabsTrigger>
            <TabsTrigger value="pricing" className="text-base">Pricing</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="border-2 border-primary/20 shadow-xl">
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
              <div className="max-w-4xl mx-auto">
                <ModernizerJobStatus jobId={activeJobId} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="dashboard">
            <ModernizerDashboard onSelectJob={setActiveJobId} />
            {activeJobId && (
              <div className="mt-8 max-w-4xl mx-auto">
                <ModernizerJobStatus jobId={activeJobId} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="pricing">
            <PricingTiers />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Modernizer;