import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Globe, Calendar, TrendingUp, Shield, ChevronRight, Sparkles, Wand2 } from 'lucide-react';

interface Job {
  id: string;
  source_url: string;
  job_status: string;
  selected_theme: string;
  accessibility_score?: number;
  seo_score?: number;
  created_at: string;
  completed_at?: string;
}

export const ModernizerDashboard = ({ onSelectJob }: { onSelectJob: (jobId: string) => void }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data, error } = await supabase
          .from('modernizer_jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;
        setJobs(data || []);
      } catch (error) {
        console.error('Failed to fetch jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-primary/10 text-primary border-primary/30';
      case 'failed': return 'bg-destructive/10 text-destructive border-destructive/30';
      case 'pending': return 'bg-muted text-muted-foreground border-border';
      default: return 'bg-accent/10 text-accent border-accent/30';
    }
  };

  if (loading) {
    return (
      <Card className="p-12 border-2 border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-sm text-muted-foreground">Loading your modernizations...</span>
        </div>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="p-12 text-center border-2 border-dashed border-primary/20 bg-card/50 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto space-y-4"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Wand2 className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">No Modernizations Yet</h3>
          <p className="text-muted-foreground text-sm">
            Transform your first legacy website into a modern, accessible experience. It takes less than 10 minutes.
          </p>
          <Button 
            onClick={() => {
              const newTab = document.querySelector('[value="new"]') as HTMLElement;
              newTab?.click();
            }}
            className="mt-4 bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Start Your First Modernization
          </Button>
        </motion.div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">
          Recent Modernizations
        </h2>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {jobs.length} Total
        </Badge>
      </div>

      <div className="grid gap-3">
        {jobs.map((job, idx) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card 
              className="hover:shadow-md transition-all duration-200 border border-border/50 hover:border-primary/30 group cursor-pointer bg-card/80 backdrop-blur-sm"
              onClick={() => onSelectJob(job.id)}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <p className="font-medium truncate text-sm">{job.source_url}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="outline" className={`${getStatusColor(job.job_status)} text-xs px-2 py-0.5`}>
                        {job.job_status}
                      </Badge>
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(job.created_at).toLocaleDateString()}
                      </span>
                      <Badge variant="secondary" className="capitalize text-xs px-2 py-0.5">
                        {job.selected_theme}
                      </Badge>
                    </div>

                    {job.job_status === 'completed' && job.accessibility_score && job.seo_score && (
                      <div className="flex gap-4 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-primary" />
                          <span className="text-xs font-medium">{job.accessibility_score}/100</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-accent" />
                          <span className="text-xs font-medium">{job.seo_score}/100</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-50 group-hover:opacity-100 group-hover:bg-primary/10 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};