import { useState, useEffect } from "react";
import { ArrowLeft, BookOpen, TrendingUp, Brain, Lightbulb, Target } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { BrainPasscode } from "@/components/BrainPasscode";

export default function BrainLearning() {
  const navigate = useNavigate();
  const [learningPatterns, setLearningPatterns] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLearningData();
  }, []);

  const fetchLearningData = async () => {
    try {
      const [patternsRes, queriesRes, learningDataRes] = await Promise.all([
        supabase
          .from('learning_patterns')
          .select('*')
          .order('confidence', { ascending: false })
          .limit(10),
        supabase
          .from('learning_queries')
          .select('*')
          .eq('status', 'done')
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('ai_learning_data')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      // Use learning_patterns if available, otherwise use ai_learning_data
      if (patternsRes.data && patternsRes.data.length > 0) {
        setLearningPatterns(patternsRes.data);
      } else if (learningDataRes.data && learningDataRes.data.length > 0) {
        // Transform ai_learning_data to pattern format
        const patterns = learningDataRes.data.map(d => ({
          id: d.id,
          pattern_type: d.model || 'learning',
          description: `Learned from ${d.provider}: ${d.model_name || d.model}`,
          confidence: d.success ? 0.85 : 0.3,
          application_count: 1,
          created_at: d.created_at
        }));
        setLearningPatterns(patterns);
      }
      
      if (queriesRes.data) setInsights(queriesRes.data);
    } catch (error) {
      console.error('Error fetching learning data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BrainPasscode>
      <div className="space-y-6 animate-fade-in px-4 sm:px-0">
        <div className="flex flex-col gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/nexus-brain')}
            className="w-fit"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Nexus Brain
          </Button>
          <div>
            <h1 className="text-3xl font-bold glow-text mb-2">Brain Learning Progress</h1>
            <p className="text-muted-foreground">Track patterns, insights, and knowledge acquired by the AI Brain</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass glass-hover p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Brain className="w-8 h-8 text-primary animate-glow" />
              <div>
                <p className="text-2xl font-bold">{learningPatterns.length}</p>
                <p className="text-sm text-muted-foreground">Learning Patterns</p>
              </div>
            </div>
          </div>

          <div className="glass glass-hover p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Lightbulb className="w-8 h-8 text-yellow-400 animate-glow" />
              <div>
                <p className="text-2xl font-bold">{insights.length}</p>
                <p className="text-sm text-muted-foreground">High-Confidence Insights</p>
              </div>
            </div>
          </div>

          <div className="glass glass-hover p-6 rounded-xl">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-8 h-8 text-green-400 animate-glow" />
              <div>
                <p className="text-2xl font-bold">
                  {learningPatterns.length > 0 
                    ? Math.round(learningPatterns.reduce((sum, p) => sum + (p.confidence_score || 0), 0) / learningPatterns.length * 100)
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Confidence</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass glass-hover p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary animate-glow" />
            Recent Learning Patterns
          </h2>
          {loading ? (
            <p className="text-muted-foreground">Loading patterns...</p>
          ) : learningPatterns.length === 0 ? (
            <p className="text-muted-foreground">No learning patterns yet. Start the Brain learning process to generate patterns.</p>
          ) : (
            <div className="space-y-3">
              {learningPatterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{pattern.pattern_type}</h3>
                    <span className="text-sm px-2 py-1 rounded-full bg-primary/20 text-primary">
                      {Math.round((pattern.confidence || pattern.confidence_score || 0) * 100)}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {pattern.description || 'No description available'}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <TrendingUp className="w-3 h-3" />
                    Applied {pattern.application_count || 0} times
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass glass-hover p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-yellow-400 animate-glow" />
            Completed Research Queries
          </h2>
          {loading ? (
            <p className="text-muted-foreground">Loading queries...</p>
          ) : insights.length === 0 ? (
            <p className="text-muted-foreground">No completed queries yet. Add research queries to start learning.</p>
          ) : (
            <div className="space-y-3">
              {insights.map((query: any) => (
                <div
                  key={query.id}
                  className="p-4 rounded-lg bg-muted/30 hover:bg-muted/40 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{query.topic}</h3>
                    <div className="flex items-center gap-2">
                      {query.confidence && (
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                          {Math.round(query.confidence * 100)}% confidence
                        </span>
                      )}
                      <span className="text-sm px-2 py-1 rounded-full bg-green-500/20 text-green-400">
                        Completed
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Source: {query.source || 'system'}
                  </p>
                  
                  {/* Cascade's Final Thought */}
                  {query.context?.cascade_thought && (
                    <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-primary">Cascade's Final Thought</span>
                      </div>
                      <p className="text-sm text-foreground italic">
                        "{query.context.cascade_thought}"
                      </p>
                    </div>
                  )}
                  
                  {query.result_summary && (
                    <div className="text-xs text-muted-foreground mt-2">
                      {query.result_summary}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </BrainPasscode>
  );
}
