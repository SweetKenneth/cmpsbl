import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Circle, Loader2, AlertCircle, ExternalLink, Download, Globe, Shield, TrendingUp, Rocket, Eye, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { BeforeAfterComparison } from './BeforeAfterComparison';

interface Job {
  id: string;
  source_url: string;
  job_status: string;
  selected_theme: string;
  detected_cms?: string;
  accessibility_score?: number;
  seo_score?: number;
  created_at: string;
  completed_at?: string;
  preview_url?: string;
  vercel_deploy_url?: string;
  sandbox_id?: string;
  rebuilt_files?: any;
}

export const ModernizerJobStatus = ({ jobId }: { jobId: string }) => {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [deploymentStep, setDeploymentStep] = useState<'preview' | 'deploy' | 'done'>('preview');
  const { toast } = useToast();

  const fetchJob = async () => {
    try {
      const { data, error } = await supabase
        .from('modernizer_jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      setJob(data);
    } catch (error) {
      console.error('Failed to fetch job:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();

    // Only poll if job is not complete
    if (job?.job_status === 'completed' || job?.job_status === 'failed') {
      return;
    }

    const interval = setInterval(() => {
      if (job?.job_status !== 'completed' && job?.job_status !== 'failed') {
        fetchJob();
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [jobId, job?.job_status]);

  const handleCreatePreview = async () => {
    try {
      toast({
        title: "Creating Preview",
        description: "Setting up your live preview environment. This takes 15-20 seconds..."
      });

      const { data, error } = await supabase.functions.invoke('pf-modernizer-preview', {
        body: { job_id: jobId }
      });

      if (error) throw error;

      if (data?.preview_url) {
        toast({
          title: "Preview Ready!",
          description: "Opening your live preview in a new tab...",
          duration: 3000
        });
        
        // Auto-open preview
        window.open(data.preview_url, '_blank');
        
        // Move to deploy step
        setDeploymentStep('deploy');
        fetchJob();
      }
    } catch (error) {
      console.error('Preview error:', error);
      toast({
        title: "Preview Failed",
        description: error instanceof Error ? error.message : "Failed to create preview",
        variant: "destructive"
      });
    }
  };

  const handleDeploy = async () => {
    setDeploying(true);
    try {
      toast({
        title: "Deploying to Vercel",
        description: "Publishing your modernized site to a live domain..."
      });

      const { data, error } = await supabase.functions.invoke('pf-modernizer-deploy', {
        body: { action: 'deploy', job_id: jobId }
      });

      if (error) throw error;

      setDeploymentStep('done');
      setTimeout(fetchJob, 10000);
    } catch (error) {
      console.error('Deploy error:', error);
      toast({
        title: "Deploy Failed",
        description: error instanceof Error ? error.message : "Failed to deploy",
        variant: "destructive"
      });
    } finally {
      setDeploying(false);
    }
  };

  const handleDownload = async () => {
    if (!job?.rebuilt_files) return;

    try {
      toast({
        title: "Preparing Export",
        description: "Packaging your modernized files..."
      });

      const { data, error } = await supabase.functions.invoke('pf-modernizer-export', {
        body: { job_id: job.id }
      });

      if (error) throw error;

      const htmlContent = data.files?.[0]?.content || '';
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const filename = `modernized-${job.source_url.replace(/[^a-z0-9]/gi, '-')}.html`;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Complete",
        description: `Downloaded: ${filename}`,
        duration: 5000
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export files",
        variant: "destructive"
      });
    }
  };

  const handleHost = async () => {
    if (!job) return;

    try {
      toast({
        title: "Hosting Site",
        description: "Publishing to permanent subdomain..."
      });

      const { data, error } = await supabase.functions.invoke('pf-modernizer-host', {
        body: { job_id: job.id }
      });

      if (error) throw error;

      toast({
        title: "Hosted!",
        description: `Site live at ${data.hosted_url}`
      });
      
      fetchJob();
    } catch (error) {
      console.error('Hosting error:', error);
      toast({
        title: "Hosting failed",
        variant: "destructive"
      });
    }
  };

  const handleReactBuild = async () => {
    if (!job) return;

    try {
      toast({
        title: "Building React",
        description: "Converting to React components..."
      });

      const { data, error } = await supabase.functions.invoke('pf-modernizer-react', {
        body: { job_id: job.id }
      });

      if (error) throw error;

      toast({
        title: "React build complete",
        description: `Generated ${data.count} components`
      });
      
      fetchJob();
    } catch (error) {
      console.error('React build error:', error);
      toast({
        title: "React build failed",
        variant: "destructive"
      });
    }
  };

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
          <span>Loading job status...</span>
        </div>
      </Card>
    );
  }

  if (!job) {
    return (
      <Card className="p-6">
        <div className="flex items-center space-x-2 text-muted-foreground">
          <AlertCircle className="h-5 w-5" />
          <span>Job not found</span>
        </div>
      </Card>
    );
  }

  const stages = [
    { status: 'pending', name: 'Queued', description: 'Job in queue', icon: <Circle className="w-5 h-5" /> },
    { status: 'extracting', name: 'Extracting', description: 'Crawling content', icon: <Download className="w-5 h-5" /> },
    { status: 'rebuilding', name: 'Rebuilding', description: 'AI modernizing code', icon: <Loader2 className="w-5 h-5" /> },
    { status: 'scoring', name: 'Scoring', description: 'Analyzing quality', icon: <TrendingUp className="w-5 h-5" /> },
    { status: 'completed', name: 'Complete', description: 'Ready to deploy', icon: <CheckCircle2 className="w-5 h-5" /> }
  ];

  const currentStageIndex = stages.findIndex(s => s.status === job.job_status);
  const progress = ((currentStageIndex + 1) / stages.length) * 100;

  return (
    <Card className="border-2 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Modernization Progress
          </span>
          <div className="flex items-center gap-2">
            {job.detected_cms && (
              <Badge variant="outline" className="text-xs">
                {job.detected_cms}
              </Badge>
            )}
            <Badge className={`${getStatusColor(job.job_status)} text-sm px-3 py-1`}>
              {job.job_status}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">{Math.round(progress)}% Complete</span>
            <span className="text-muted-foreground">{stages.find(s => s.status === job.job_status)?.name}</span>
          </div>
          <div className="relative">
            <Progress value={progress} className="h-3" />
          </div>
        </div>

        <div className="grid gap-3">
          {stages.map((stage, idx) => {
            const isActive = stage.status === job.job_status;
            const isComplete = stages.findIndex(s => s.status === job.job_status) > idx;

            return (
              <div
                key={stage.status}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                  isActive
                    ? 'border-primary bg-primary/10 shadow-md'
                    : isComplete
                    ? 'border-accent/50 bg-accent/5'
                    : 'border-muted bg-muted/20'
                }`}
              >
                <div className={`rounded-full p-2 ${
                  isActive ? 'bg-primary text-primary-foreground animate-pulse' :
                  isComplete ? 'bg-accent text-accent-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {stage.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{stage.name}</p>
                  <p className="text-sm text-muted-foreground">{stage.description}</p>
                </div>
                {isComplete && !isActive && <Check className="w-5 h-5 text-accent" />}
                {isActive && job.job_status !== 'completed' && <Loader2 className="w-5 h-5 text-primary animate-spin" />}
                {isActive && job.job_status === 'completed' && <CheckCircle2 className="w-5 h-5 text-accent" />}
              </div>
            );
          })}
        </div>

        {job.job_status === 'completed' && (
          <div className="space-y-6 animate-in fade-in-50 duration-500">
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Accessibility
                  </h3>
                  <span className="text-2xl font-bold text-primary">{job.accessibility_score}/100</span>
                </div>
                <Progress value={job.accessibility_score} className="h-2" />
              </Card>

              <Card className="p-6 bg-gradient-to-br from-accent/5 to-transparent border-accent/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    SEO Score
                  </h3>
                  <span className="text-2xl font-bold text-accent">{job.seo_score}/100</span>
                </div>
                <Progress value={job.seo_score} className="h-2" />
              </Card>
            </div>

            {/* Step 1: Create Preview */}
            {deploymentStep === 'preview' && !job.preview_url && (
              <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Eye className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Step 1: Preview Your Site</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Create a live preview to see how your modernized site looks and functions.
                        This will spin up a temporary sandbox environment (takes ~20 seconds).
                      </p>
                      <Button 
                        onClick={handleCreatePreview}
                        disabled={!job.rebuilt_files}
                        className="w-full h-12 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Set Up Test Environment
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2 text-center">
                        Preview will open automatically in a new tab
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {job.job_status === 'completed' && job.preview_url && (
              <div className="mb-6">
                <BeforeAfterComparison 
                  originalUrl={job.source_url}
                  modernizedUrl={job.preview_url}
                  scores={{
                    accessibility: job.accessibility_score || 0,
                    seo: job.seo_score || 0
                  }}
                />
              </div>
            )}

            {/* Preview Ready - Move to Deploy */}
            {job.preview_url && deploymentStep === 'deploy' && (
              <div className="space-y-4">
                <Card className="p-4 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Preview Ready!</p>
                      <a 
                        href={job.preview_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        {job.preview_url}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-accent/10 p-2">
                        <Rocket className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">Step 2: Publish to Production</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Deploy your site to Vercel for a permanent, fast, and reliable hosting.
                          You'll get a temporary domain and can connect your own custom domain later.
                        </p>
                        <Button 
                          onClick={handleDeploy}
                          disabled={deploying || !job.rebuilt_files}
                          className="w-full h-12 bg-gradient-to-r from-accent to-accent/80 hover:opacity-90"
                        >
                          {deploying ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Deploying to Vercel...
                            </>
                          ) : (
                            <>
                              <Rocket className="w-4 h-4 mr-2" />
                              Deploy to Vercel
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}

            {/* Deployment Complete */}
            {job.vercel_deploy_url && deploymentStep === 'done' && (
              <div className="space-y-4">
                <Card className="p-6 bg-gradient-to-r from-accent/10 to-primary/10 border-accent/30">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-accent" />
                    <div className="flex-1">
                      <p className="font-semibold text-lg">Site Published!</p>
                      <p className="text-sm text-muted-foreground">Your modernized site is now live</p>
                    </div>
                  </div>
                  <a 
                    href={job.vercel_deploy_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline flex items-center gap-2 font-medium"
                  >
                    <Globe className="w-4 h-4" />
                    {job.vercel_deploy_url}
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Card>

                <Card className="p-6 border-2 bg-muted/50">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Next Steps
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p>
                        <strong>Custom Domain:</strong> Visit your Vercel dashboard to connect your own domain name
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p>
                        <strong>SSL Certificate:</strong> Vercel automatically provisions HTTPS for your site
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <p>
                        <strong>Download Code:</strong> Get the source files to customize further
                      </p>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Download className="w-5 h-5 text-primary" />
                      Export & Build Options
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Download, host permanently, or convert to React components
                    </p>
                    <div className="grid gap-3">
                      <Button
                        onClick={handleDownload}
                        variant="outline"
                        className="w-full h-12 border-2 hover:bg-primary/10 hover:border-primary transition-all"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download HTML
                      </Button>
                      <Button
                        onClick={handleHost}
                        variant="outline"
                        className="w-full h-12 border-2 hover:bg-accent/10 hover:border-accent transition-all"
                      >
                        🚀 Host on Subdomain
                      </Button>
                      <Button
                        onClick={handleReactBuild}
                        variant="outline"
                        className="w-full h-12 border-2 hover:bg-secondary/10 hover:border-secondary transition-all"
                      >
                        ⚛️ Convert to React
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1 pt-2">
                      <p>✓ Modern HTML5 with semantic markup</p>
                      <p>✓ Responsive CSS with utility classes</p>
                      <p>✓ WCAG AA accessible</p>
                      <p>✓ React components available</p>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {job.job_status === 'failed' && (
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-sm text-destructive font-medium">Modernization failed</p>
            <p className="text-sm text-muted-foreground mt-1">
              Please try again or contact support.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};