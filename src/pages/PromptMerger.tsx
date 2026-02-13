import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Rocket, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

export default function PromptMerger() {
  const [rawInput, setRawInput] = useState('');
  const [projectName, setProjectName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [recentProjects, setRecentProjects] = useState<any[]>([]);

  useEffect(() => {
    loadRecentProjects();
    const interval = setInterval(() => {
      if (currentProject?.id) {
        refreshProjectStatus(currentProject.id);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [currentProject?.id]);

  const loadRecentProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('pf-merger-status', {
        body: { user_id: user.id }
      });

      if (!error && data?.projects) {
        setRecentProjects(data.projects);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const refreshProjectStatus = async (projectId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('pf-merger-status', {
        body: { project_id: projectId }
      });

      if (!error && data?.project) {
        setCurrentProject(data.project);
        
        if (data.project.status === 'completed') {
          toast.success('MVP build completed!');
        } else if (data.project.status === 'failed') {
          toast.error('Build failed: ' + data.project.error);
        }
      }
    } catch (error) {
      console.error('Error refreshing status:', error);
    }
  };

  const handleParseAndBuild = async () => {
    if (!rawInput || !projectName) {
      toast.error('Please provide both idea and project name');
      return;
    }

    setIsProcessing(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Phase 1: Parse intent
      toast.info('Parsing your idea...');
      const { data: parseData, error: parseError } = await supabase.functions.invoke('pf-merger-parse-intent', {
        body: { raw_input: rawInput, user_id: user?.id }
      });

      if (parseError) throw parseError;
      
      toast.success('Intent parsed successfully!');
      console.log('Parsed:', parseData);

      // Phase 2: Create fusion
      toast.info('Fusing with prompt blueprints...');
      const { data: fuseData, error: fuseError } = await supabase.functions.invoke('pf-merger-fuse', {
        body: { intent_id: parseData.intent_id }
      });

      if (fuseError) throw fuseError;
      
      toast.success(`Blueprint "${fuseData.blueprint_used}" selected`);
      console.log('Fusion:', fuseData);

      // Phase 3: Build MVP
      toast.info('Starting MVP build pipeline...');
      const { data: buildData, error: buildError } = await supabase.functions.invoke('pf-merger-build', {
        body: { 
          fusion_id: fuseData.fusion_id, 
          project_name: projectName,
          user_id: user?.id
        }
      });

      if (buildError) throw buildError;
      
      toast.success('Build pipeline started!');
      setCurrentProject({ id: buildData.project_id, status: 'initializing' });
      
      // Clear form
      setRawInput('');
      setProjectName('');
      
      // Start polling for updates
      setTimeout(() => refreshProjectStatus(buildData.project_id), 2000);

    } catch (error: any) {
      console.error('Build error:', error);
      toast.error(`Failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-destructive" />;
      case 'initializing':
      case 'researching':
      case 'structuring':
      case 'coding':
      case 'deploying':
        return <Clock className="w-5 h-5 text-primary animate-pulse" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'failed': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in px-4 sm:px-0">
      <SEO
        title="Prompt Merger — CMPSBL"
        description="Transform ideas into deployable MVPs through intelligent prompt fusion"
        canonical="https://cmpsbl.com/prompt-merger"
      />
      
      <div>
        <h1 className="text-3xl font-bold glow-text mb-2">Prompt Merger</h1>
        <p className="text-muted-foreground">Transform ideas into MVPs through adaptive prompt fusion</p>
      </div>

      {/* Input Card */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create New MVP
          </CardTitle>
          <CardDescription>
            Describe your idea and let AI fuse it with proven blueprints to build a complete MVP
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Project Name</label>
            <Input
              placeholder="My Awesome App"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={isProcessing}
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Your Idea</label>
            <Textarea
              placeholder="I want to build a task management app for remote teams with real-time collaboration, AI-powered task prioritization, and Slack integration..."
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              rows={6}
              disabled={isProcessing}
            />
          </div>

          <Button 
            onClick={handleParseAndBuild}
            disabled={isProcessing || !rawInput || !projectName}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Rocket className="w-5 h-5 mr-2" />
                Parse & Build MVP
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Current Build Progress */}
      {currentProject && (
        <Card className="border-primary/30 shadow-glow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {getStatusIcon(currentProject.status)}
                Building: {currentProject.name}
              </CardTitle>
              <Badge variant={getStatusColor(currentProject.status) as any}>
                {currentProject.status}
              </Badge>
            </div>
            <CardDescription>
              Phase: {currentProject.phase || 'initializing'} · Progress: {currentProject.progress || 0}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={currentProject.progress || 0} className="h-2" />
            
            {/* Build Logs */}
            {currentProject.logs && currentProject.logs.length > 0 && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                <h4 className="text-sm font-semibold">Build Log:</h4>
                {currentProject.logs.map((log: any, idx: number) => (
                  <div key={idx} className="text-xs p-2 bg-muted/50 rounded flex items-start gap-2">
                    <span className="text-muted-foreground">{log.phase}</span>
                    <span>{log.message}</span>
                    <Badge variant="outline" className="ml-auto text-xs">
                      {log.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}

            {/* Deployment Links */}
            {currentProject.deploy_url && (
              <div className="flex gap-2">
                <Button asChild variant="default">
                  <a href={currentProject.deploy_url} target="_blank" rel="noopener noreferrer">
                    View Deployed MVP
                  </a>
                </Button>
                {currentProject.github_repo && (
                  <Button asChild variant="outline">
                    <a href={currentProject.github_repo} target="_blank" rel="noopener noreferrer">
                      View on GitHub
                    </a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your previously generated MVPs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => refreshProjectStatus(project.id)}
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(project.status)}
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Created {new Date(project.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {project.progress !== undefined && (
                      <span className="text-sm text-muted-foreground">{project.progress}%</span>
                    )}
                    <Badge variant={getStatusColor(project.status) as any}>
                      {project.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🧠 Intelligent Fusion</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Merges your intent with proven blueprints and Brain knowledge
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">⚡ Auto-Generation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Research → Structure → Code → Deploy pipeline fully automated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">📈 Self-Improving</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Learns from every build to improve future MVP quality
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
