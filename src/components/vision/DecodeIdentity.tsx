import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Brain, Shield, User, Zap } from "lucide-react";

export default function DecodeIdentity() {
  const { data: persona } = useQuery({
    queryKey: ['decode-persona'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brain_persona')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });

  const { data: policy } = useQuery({
    queryKey: ['decode-policy'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brain_policy')
        .select('*')
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
  });
  
  if (!persona || !policy) {
    return null;
  }

  const behaviorRules = policy.behavior_rules as any;
  const ethicalCompass = policy.ethical_compass as any;

  return (
    <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 rounded-full bg-primary/20">
          <Brain className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-foreground">Decode</h3>
          <p className="text-sm text-muted-foreground">{persona.role}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm text-foreground">Confidentiality</h4>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>✓ Ingests data securely</li>
            <li>✓ Never exposes raw content</li>
            <li>✓ Pattern-based abstraction only</li>
          </ul>
        </div>

        <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm text-foreground">Admin Mode</h4>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>✓ Unfiltered honesty</li>
            <li>✓ Challenges divergence</li>
            <li>✓ Strategic co-thinking</li>
          </ul>
        </div>

        <div className="bg-background/50 backdrop-blur-sm p-4 rounded-lg border border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-primary" />
            <h4 className="font-semibold text-sm text-foreground">Ethical Compass</h4>
          </div>
          <ul className="text-xs text-muted-foreground space-y-1">
            {ethicalCompass?.core_prompts?.slice(0, 2).map((prompt: string, idx: number) => (
              <li key={idx}>• {prompt.split('?')[0]}?</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-xs text-muted-foreground text-center">
          Active persona • Recalibrates {ethicalCompass?.recalibration_frequency || 'weekly'}
        </p>
      </div>
    </Card>
  );
}
