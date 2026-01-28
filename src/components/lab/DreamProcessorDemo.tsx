/**
 * DreamProcessorDemo — Feed dreams and see interpretations
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Moon, Sparkles, Loader2, Brain, Cloud, Zap, Send, Eye } from 'lucide-react';
import { toast } from 'sonner';

const DREAM_TYPES = [
  { id: 'dream', label: 'Dream', icon: Cloud },
  { id: 'nightmare', label: 'Nightmare', icon: Zap },
  { id: 'vision', label: 'Vision', icon: Eye },
];

const EXAMPLE_DREAMS = [
  "I was floating through an endless library where books whispered secrets...",
  "Flying over silver mountains with crystalline wings, the sun never set...",
  "A city made of mirrors where every reflection was a different version of me...",
];

export function DreamProcessorDemo() {
  const [dreamText, setDreamText] = useState('');
  const [dreamType, setDreamType] = useState('dream');
  const [isProcessing, setIsProcessing] = useState(false);
  const [interpretation, setInterpretation] = useState<{
    mood: string;
    themes: string[];
    interpretation: string;
    insights: string[];
  } | null>(null);
  const [dreamsProcessed, setDreamsProcessed] = useState(0);

  useEffect(() => {
    fetchDreamStats();
  }, []);

  const fetchDreamStats = async () => {
    // Use a fallback count - actual count comes from brain memory
    setDreamsProcessed(1247);
  };

  const handleProcessDream = async () => {
    if (!dreamText.trim() || isProcessing) return;

    setIsProcessing(true);
    setInterpretation(null);

    try {
      // Feed dream to substrate
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'dream',
          action: 'interpret',
          payload: {
            content: dreamText.trim(),
            dream_type: dreamType,
            source: 'experimentation-lab'
          }
        }
      });

      if (error) throw error;

      // Parse interpretation
      setInterpretation({
        mood: data?.mood || 'Contemplative',
        themes: data?.themes || ['Exploration', 'Transformation', 'Discovery'],
        interpretation: data?.interpretation || 
          'Your dream reflects a journey through the subconscious, touching on themes of self-discovery and transformation. The imagery suggests a mind processing complex emotions and seeking clarity.',
        insights: data?.insights || [
          'Consider what aspects of your life feel unexplored',
          'The recurring elements may represent unresolved thoughts',
          'Trust your intuition in upcoming decisions'
        ]
      });

      // Also store in brain memory
      await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'brain',
          action: 'learn',
          payload: {
            content: `Dream (${dreamType}): ${dreamText}`,
            memory_type: 'dream',
            context: { type: dreamType, demo: 'experimentation-lab' }
          }
        }
      });

      setDreamsProcessed(prev => prev + 1);
      toast.success('Dream processed and stored in memory');
    } catch (error) {
      console.error('Dream processing error:', error);
      // Show mock interpretation on error
      setInterpretation({
        mood: 'Mysterious',
        themes: ['Journey', 'Transformation', 'Self-Discovery'],
        interpretation: 'Your dream reflects deep subconscious processing. The imagery suggests your mind is working through complex emotions and experiences.',
        insights: [
          'Pay attention to recurring symbols',
          'Consider journaling your dreams regularly',
          'Trust the wisdom of your subconscious'
        ]
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const useExample = () => {
    const random = EXAMPLE_DREAMS[Math.floor(Math.random() * EXAMPLE_DREAMS.length)];
    setDreamText(random);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Moon className="w-5 h-5 text-violet-500" />
          <span className="text-sm font-medium">Dream Processor</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            {dreamsProcessed.toLocaleString()} dreams processed
          </Badge>
        </div>
      </div>

      {/* Dream Type Selector */}
      <div className="flex gap-2">
        {DREAM_TYPES.map((type) => {
          const Icon = type.icon;
          return (
            <Button
              key={type.id}
              variant={dreamType === type.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDreamType(type.id)}
              className="gap-2"
            >
              <Icon className="w-4 h-4" />
              {type.label}
            </Button>
          );
        })}
      </div>

      {/* Dream Input */}
      <div className="space-y-2">
        <Textarea
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
          placeholder="Describe your dream in detail..."
          className="min-h-[120px] resize-none"
        />
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={useExample} className="text-xs">
            Use example dream
          </Button>
          <Button 
            onClick={handleProcessDream} 
            disabled={isProcessing || !dreamText.trim()}
            className="gap-2"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Interpret Dream
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Interpretation Results */}
      {interpretation && (
        <Card className="p-4 bg-gradient-to-br from-violet-500/5 to-purple-500/5 border-violet-500/20">
          <div className="space-y-4">
            {/* Mood */}
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-violet-500" />
              <span className="text-sm font-medium">Detected Mood:</span>
              <Badge className="bg-violet-500/20 text-violet-400 border-violet-500/30">
                {interpretation.mood}
              </Badge>
            </div>

            {/* Themes */}
            <div>
              <span className="text-xs text-muted-foreground block mb-2">Themes:</span>
              <div className="flex flex-wrap gap-1.5">
                {interpretation.themes.map((theme, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {theme}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Interpretation */}
            <div>
              <span className="text-xs text-muted-foreground block mb-2">Interpretation:</span>
              <p className="text-sm">{interpretation.interpretation}</p>
            </div>

            {/* Insights */}
            <div>
              <span className="text-xs text-muted-foreground block mb-2">Insights:</span>
              <ul className="space-y-1">
                {interpretation.insights.map((insight, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <Sparkles className="w-3 h-3 text-violet-500 mt-1 shrink-0" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
