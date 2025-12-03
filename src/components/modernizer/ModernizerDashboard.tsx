import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Globe, Calendar, TrendingUp, Shield, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      case 'completed': return 'bg-primary text-primary-foreground';
      case 'failed': return 'bg-destructive text-destructive-foreground';
      case 'pending': return 'bg-muted text-muted-foreground';
      default: return 'bg-accent text-accent-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading jobs...</span>
        </div>
      </Card>
    );
  }

  if (jobs.length === 0) {
    return (
      <Card className="p-12 text-center border-2 border-dashed border-primary/20">
        <div className="max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <Globe className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-xl font-semibold">No Modernizations Yet</h3>
          <p className="text-muted-foreground">
            Transform your first legacy website into a modern, accessible experience. It takes less than 10 minutes.
          </p>
          <Button 
            onClick={() => {
              // Switch to "New Modernization" tab
              const newTab = document.querySelector('[value="new"]') as HTMLElement;
              newTab?.click();
            }}
            className="mt-4 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
          >
            Start Your First Modernization
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
          Recent Modernizations
        </h2>
        <Badge variant="outline" className="text-base px-4 py-2">
          {jobs.length} Total
        </Badge>
      </div>

      <div className="grid gap-4">
        {jobs.map((job) => (
          <Card 
            key={job.id}
            className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 group cursor-pointer"
            onClick={() => onSelectJob(job.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <p className="font-medium truncate text-lg">{job.source_url}</p>
                  </div>

                  <div className="flex items-center gap-4 text-sm">
                    <Badge className={`${getStatusColor(job.job_status)} px-3 py-1`}>
                      {job.job_status}
                    </Badge>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(job.created_at).toLocaleDateString()}
                    </span>
                    <Badge variant="outline" className="capitalize">{job.selected_theme}</Badge>
                  </div>

                  {job.job_status === 'completed' && job.accessibility_score && job.seo_score && (
                    <div className="flex gap-6 pt-2">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" />
                        <span className="text-sm font-medium">A11y: {job.accessibility_score}/100</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-accent" />
                        <span className="text-sm font-medium">SEO: {job.seo_score}/100</span>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="group-hover:bg-primary/10 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};