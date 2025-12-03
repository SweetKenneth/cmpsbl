import { Brain, Target, Link, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function CascadeMindmap() {
  const navigate = useNavigate();

  // Cascade tables not configured
  const knowledgeCore: any[] = [];
  const objectives: any[] = [];
  const memoryAnchors: any[] = [];

  const activeObjectives = [];
  const completedObjectives = [];
  const contradictions = [];
  const staleAnchors = [];

  return (
    <div className="space-y-6 animate-fade-in p-4">
      <div className="flex items-center justify-between">
        <div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/nexus-brain')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Brain
          </Button>
          <h1 className="text-3xl font-bold glow-text">Cascade Mindmap</h1>
          <p className="text-muted-foreground">Executive cognition and knowledge graph visualization</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" />
              Knowledge Core
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{knowledgeCore?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {contradictions.length} contradictions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-500" />
              Active Objectives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeObjectives.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {completedObjectives.length} completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Link className="w-4 h-4 text-green-500" />
              Memory Anchors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memoryAnchors?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {staleAnchors.length} need refresh
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Attention Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contradictions.length + staleAnchors.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              issues to resolve
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Objectives */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            72-Hour Rolling Objectives
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activeObjectives.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active objectives</p>
            ) : (
              activeObjectives.map((obj) => (
                <div key={obj.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{obj.objective}</p>
                      {obj.progress_notes && (
                        <p className="text-sm text-muted-foreground mt-1">{obj.progress_notes}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {obj.target_date ? new Date(obj.target_date).toLocaleDateString() : 'No deadline'}
                        </span>
                        <span className="text-xs font-medium">
                          Progress: {obj.completion_percentage?.toFixed(0) || 0}%
                        </span>
                      </div>
                    </div>
                    <Badge variant={obj.status === 'active' ? 'default' : 'secondary'}>
                      {obj.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Knowledge Core */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Core Principles & Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {knowledgeCore?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No knowledge synthesized yet</p>
            ) : (
              knowledgeCore?.slice(0, 10).map((knowledge) => (
                <div key={knowledge.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{knowledge.topic}</h4>
                        {knowledge.contradiction_flag && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Contradiction
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{knowledge.content.substring(0, 150)}...</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          Confidence: {(knowledge.confidence * 100).toFixed(0)}%
                        </span>
                        <span className="text-xs text-muted-foreground">
                          • Verified {new Date(knowledge.last_verified).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Memory Anchors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            Memory Anchors to PromptFluid Modules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {memoryAnchors?.length === 0 ? (
              <p className="text-sm text-muted-foreground col-span-2">No memory anchors established yet</p>
            ) : (
              memoryAnchors?.map((anchor) => (
                <div key={anchor.id} className="p-3 border rounded-lg bg-card">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{anchor.memory_type}</Badge>
                        {anchor.memory_type === 'stale' && (
                          <Badge variant="secondary" className="text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Stale
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Importance: {(anchor.importance_score * 100).toFixed(0)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {anchor.anchor_text}
                      </p>
                    </div>
                    {anchor.memory_type === 'core' && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
