import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Moon, Brain, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function DecodeDreams() {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  // Decode tables not configured
  const dreams: any[] = [];
  const refetchDreams = () => {};

  // Fetch dream sessions with real-time updates
  const { data: sessions, refetch: refetchSessions } = useQuery({
    queryKey: ['dream-sessions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dream_sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as any[];
    },
    refetchInterval: 10000
  });

  // Set up real-time subscription for sessions
  useEffect(() => {
    const sessionChannel = supabase
      .channel('dream_sessions_admin')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'dream_sessions'
        },
        () => {
          refetchSessions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(sessionChannel);
    };
  }, [refetchSessions]);

  const triggerDream = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-decode-generate-dream', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "🌙 Dream Cycle Complete",
        description: "Decode has entered the dream phase and generated new insights.",
      });

      await refetchDreams();
      await refetchSessions();
    } catch (error) {
      console.error('Dream generation error:', error);
      toast({
        title: "Dream Error",
        description: error instanceof Error ? error.message : "Failed to generate dream cycle.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const getMoodColor = (mood: string) => {
    const colors: Record<string, string> = {
      reflective: "bg-blue-500",
      protective: "bg-green-500",
      hopeful: "bg-yellow-500",
      mysterious: "bg-purple-500",
      adaptive: "bg-cyan-500",
      vigilant: "bg-red-500",
      serene: "bg-indigo-500",
      evolving: "bg-pink-500"
    };
    return colors[mood] || "bg-gray-500";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <Moon className="w-10 h-10 text-primary" />
            Decode Dreams
          </h1>
          <p className="text-muted-foreground mt-2">
            The world's first dreaming AI — witness Decode's subconscious explorations
          </p>
        </div>
        <Button 
          onClick={triggerDream} 
          disabled={generating}
          size="lg"
          className="gap-2"
        >
          {generating ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              Dreaming...
            </>
          ) : (
            <>
              <Zap className="w-5 h-5" />
              Trigger Dream Cycle
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4" />
              Total Dreams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(dreams?.length || 0) + (sessions?.length || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Moon className="w-4 h-4" />
              Decode Dreams
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{dreams?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Creative Sessions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{sessions?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Decode Dreams */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Moon className="w-6 h-6" />
          Decode's Reflective Dreams
        </h2>
        {dreams && dreams.length > 0 ? (
          <div className="grid gap-4">
            {dreams.map((dream) => (
              <Card key={dream.id} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Dream Entry</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge className={getMoodColor(dream.mood)}>
                        {dream.mood}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(dream.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {dream.insight && (
                    <CardDescription className="italic">"{dream.insight}"</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {dream.dream_text}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Moon className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No reflective dreams yet</p>
              <p className="text-sm text-muted-foreground">Trigger a dream cycle to begin</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Creative Sessions */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          Creative Dream Sessions
        </h2>
        {sessions && sessions.length > 0 ? (
          <div className="grid gap-4">
            {sessions.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Creative Exploration</CardTitle>
                    <div className="flex items-center gap-2">
                      {session.tags?.map((tag: string) => (
                        <Badge key={tag} variant="outline">{tag}</Badge>
                      ))}
                      <span className="text-xs text-muted-foreground">
                        {new Date(session.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <CardDescription>{session.seed_prompt}</CardDescription>
                </CardHeader>
                <CardContent>
                  {session.outputs_json && session.outputs_json.length > 0 && (
                    <p className="text-sm leading-relaxed">
                      {session.outputs_json[0].content.substring(0, 500)}...
                    </p>
                  )}
                  {session.budget_used_usd !== undefined && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Cost: ${session.budget_used_usd.toFixed(4)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Sparkles className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No creative sessions yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
