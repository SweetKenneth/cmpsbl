import { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, CheckCircle, Activity, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useLearningPatterns } from '@/hooks/useLearningPatterns';
import { LearningAnalyzer } from '@/lib/learning/analyzer';
import { toast } from 'sonner';
import { SEO } from '@/components/SEO';

export default function LearningIntelligence() {
  const [analyzing, setAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [stats, setStats] = useState({
    total_patterns: 0,
    high_confidence: 0,
    error_patterns: 0,
    success_patterns: 0
  });

  const { patterns: allPatterns, loading: allLoading, refresh } = useLearningPatterns();
  const { patterns: errorPatterns, loading: errorLoading } = useLearningPatterns('error');
  const { patterns: successPatterns, loading: successLoading } = useLearningPatterns('success');

  useEffect(() => {
    loadSuggestions();
    updateStats();
  }, [allPatterns]);

  const loadSuggestions = async () => {
    const suggestions = await LearningAnalyzer.generateBrainSuggestions();
    setSuggestions(suggestions);
  };

  const updateStats = () => {
    setStats({
      total_patterns: allPatterns.length,
      high_confidence: allPatterns.filter(p => p.confidence >= 0.75).length,
      error_patterns: allPatterns.filter(p => p.pattern_type === 'error').length,
      success_patterns: allPatterns.filter(p => p.pattern_type === 'success').length
    });
  };

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await LearningAnalyzer.analyzePatterns(24);
      toast.success(`Analyzed ${result.patterns_generated} patterns from recent activity`);
      refresh();
      await loadSuggestions();
    } catch (error) {
      toast.error('Failed to analyze patterns');
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-success';
    if (confidence >= 0.6) return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <>
      <SEO 
        title="Learning Intelligence | CMPSBL Vision"
        description="View AI learning patterns, system heuristics, and adaptive recommendations from CMPSBL Brain module."
      />
      
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
              <Brain className="h-8 w-8 text-primary" />
              Learning Intelligence
            </h1>
            <p className="text-muted-foreground">
              AI-powered pattern recognition and adaptive system optimization
            </p>
          </div>
          <Button onClick={handleAnalyze} disabled={analyzing}>
            <Activity className="mr-2 h-4 w-4" />
            {analyzing ? 'Analyzing...' : 'Analyze Patterns'}
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Patterns</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_patterns}</div>
              <p className="text-xs text-muted-foreground">Learned behaviors</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.high_confidence}</div>
              <p className="text-xs text-muted-foreground">≥75% confidence</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Patterns</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.error_patterns}</div>
              <p className="text-xs text-muted-foreground">Issues identified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Patterns</CardTitle>
              <TrendingUp className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.success_patterns}</div>
              <p className="text-xs text-muted-foreground">Best practices</p>
            </CardContent>
          </Card>
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Brain Recommendations
              </CardTitle>
              <CardDescription>
                Adaptive suggestions based on learned patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {suggestions.map((suggestion, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-muted/50">
                    <p className="text-sm">{suggestion}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Patterns Tabs */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Patterns</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
            <TabsTrigger value="success">Success</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Learning Patterns</CardTitle>
                <CardDescription>
                  {allLoading ? 'Loading patterns...' : `${allPatterns.length} patterns detected`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {allLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : allPatterns.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No patterns yet. System will learn as you use the substrate.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {allPatterns.map((pattern) => (
                      <div key={pattern.pattern_name} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold">{pattern.pattern_name}</h4>
                              <Badge variant={pattern.pattern_type === 'error' ? 'destructive' : 'default'}>
                                {pattern.pattern_type}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{pattern.description}</p>
                          </div>
                          <div className="text-right ml-4">
                            <div className={`text-sm font-medium ${getConfidenceColor(pattern.confidence)}`}>
                              {(pattern.confidence * 100).toFixed(0)}% confidence
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {pattern.frequency} occurrences
                            </div>
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs text-muted-foreground">Success Rate:</span>
                            <Progress value={pattern.success_rate} className="flex-1 h-2" />
                            <span className="text-xs font-medium">{pattern.success_rate.toFixed(1)}%</span>
                          </div>
                        </div>

                        {pattern.recommendations && pattern.recommendations.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs font-medium mb-2">Recommendations:</p>
                            <div className="space-y-1">
                              {pattern.recommendations.slice(0, 2).map((rec: any, idx: number) => (
                                <p key={idx} className="text-xs text-muted-foreground pl-4">
                                  • {rec.suggestion || rec.message}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Error Patterns</CardTitle>
                <CardDescription>
                  Common issues and recommended fixes
                </CardDescription>
              </CardHeader>
              <CardContent>
                {errorLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : errorPatterns.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No error patterns detected. System is running smoothly!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {errorPatterns.map((pattern) => (
                      <div key={pattern.pattern_name} className="border border-destructive/30 rounded-lg p-4 bg-destructive/5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                              <h4 className="font-semibold">{pattern.pattern_name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">{pattern.description}</p>
                          </div>
                          <Badge variant="destructive">{pattern.frequency} occurrences</Badge>
                        </div>
                        
                        {pattern.recommendations && pattern.recommendations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-destructive/20">
                            <p className="text-xs font-medium mb-2">Suggested Fixes:</p>
                            <div className="space-y-1">
                              {pattern.recommendations.map((rec: any, idx: number) => (
                                <p key={idx} className="text-xs pl-4">
                                  • {rec.suggestion || rec.message}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="success" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Success Patterns</CardTitle>
                <CardDescription>
                  Reliable behaviors and best practices
                </CardDescription>
              </CardHeader>
              <CardContent>
                {successLoading ? (
                  <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : successPatterns.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No success patterns yet. Keep using the system!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {successPatterns.map((pattern) => (
                      <div key={pattern.pattern_name} className="border border-success/30 rounded-lg p-4 bg-success/5">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="h-4 w-4 text-success" />
                              <h4 className="font-semibold">{pattern.pattern_name}</h4>
                            </div>
                            <p className="text-sm text-muted-foreground">{pattern.description}</p>
                          </div>
                          <Badge className="bg-success text-success-foreground">
                            {pattern.success_rate.toFixed(1)}% success
                          </Badge>
                        </div>
                        
                        {pattern.recommendations && pattern.recommendations.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-success/20">
                            <p className="text-xs font-medium mb-2">Why It Works:</p>
                            <div className="space-y-1">
                              {pattern.recommendations.map((rec: any, idx: number) => (
                                <p key={idx} className="text-xs pl-4">
                                  • {rec.suggestion || rec.message}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
