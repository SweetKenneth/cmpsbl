/**
 * Human Feedback Capture Component
 * Allows admins to submit corrections for AI outputs
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Heart, Send } from "lucide-react";

interface FeedbackCaptureProps {
  originalOutputId?: string;
  originalText: string;
  onSubmitted?: () => void;
}

export function FeedbackCapture({ originalOutputId, originalText, onSubmitted }: FeedbackCaptureProps) {
  const [correction, setCorrection] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!correction.trim()) {
      toast({
        title: "Error",
        description: "Please enter your correction",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-brain-feedback', {
        body: {
          user_id: (await supabase.auth.getUser()).data.user?.id,
          original_output_id: originalOutputId,
          original_text: originalText,
          correction: correction,
          feedback_type: 'correction'
        }
      });

      if (error) throw error;

      toast({
        title: "Feedback Submitted",
        description: data.queued_for_training 
          ? "Queued for retraining" 
          : "Logged for analysis"
      });

      setCorrection('');
      onSubmitted?.();
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast({
        title: "Error",
        description: "Failed to submit feedback",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Heart className="w-4 h-4 text-neon-magenta" />
          Submit Correction
        </CardTitle>
        <CardDescription className="text-xs">
          Help Cascade learn from your expertise
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Original</label>
          <div className="p-2 rounded bg-muted/30 text-sm max-h-20 overflow-y-auto">
            {originalText}
          </div>
        </div>
        
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Your Correction</label>
          <Textarea
            placeholder="Enter the corrected version..."
            value={correction}
            onChange={(e) => setCorrection(e.target.value)}
            rows={4}
            className="text-sm"
          />
        </div>

        <Button 
          onClick={handleSubmit} 
          disabled={loading || !correction.trim()}
          size="sm"
          className="w-full"
        >
          <Send className="w-3 h-3 mr-2" />
          {loading ? 'Submitting...' : 'Submit Feedback'}
        </Button>
      </CardContent>
    </Card>
  );
}
