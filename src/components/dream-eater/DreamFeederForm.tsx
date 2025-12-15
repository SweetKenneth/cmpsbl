import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Moon, Skull, Send, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DreamFeederFormProps {
  onFeedStart: () => void;
  onFeedComplete: (dreamType: 'dream' | 'nightmare', sentiment: number) => void;
}

export const DreamFeederForm = ({ onFeedStart, onFeedComplete }: DreamFeederFormProps) => {
  const [dreamContent, setDreamContent] = useState('');
  const [dreamType, setDreamType] = useState<'dream' | 'nightmare'>('dream');
  const [submitterName, setSubmitterName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const analyzeSentiment = (content: string, type: 'dream' | 'nightmare'): number => {
    const positiveWords = ['happy', 'joy', 'love', 'peace', 'beautiful', 'light', 'flying', 'friend', 'safe', 'warm', 'gentle', 'calm', 'free'];
    const negativeWords = ['fear', 'dark', 'chase', 'fall', 'death', 'monster', 'trapped', 'lost', 'scream', 'blood', 'pain', 'horror', 'shadow'];
    
    const lowerContent = content.toLowerCase();
    let score = 0.5;
    
    positiveWords.forEach(word => {
      if (lowerContent.includes(word)) score += 0.05;
    });
    
    negativeWords.forEach(word => {
      if (lowerContent.includes(word)) score -= 0.05;
    });
    
    if (type === 'nightmare') score -= 0.2;
    
    return Math.max(0, Math.min(1, score));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!dreamContent.trim()) {
      toast.error('Please describe your dream');
      return;
    }

    setIsSubmitting(true);
    onFeedStart();

    const sentiment = analyzeSentiment(dreamContent, dreamType);

    try {
      const { error } = await supabase
        .from('dream_feeder_submissions')
        .insert({
          dream_content: dreamContent.trim(),
          dream_type: dreamType,
          sentiment_score: sentiment,
          source: 'web',
          submitter_name: submitterName.trim() || null,
        });

      if (error) throw error;

      // Simulate feeding animation duration
      await new Promise(resolve => setTimeout(resolve, 2000));

      onFeedComplete(dreamType, sentiment);
      
      toast.success(
        dreamType === 'nightmare' 
          ? 'The Dream-Eater devours your nightmare...' 
          : 'The Dream-Eater savors your dream...'
      );

      setDreamContent('');
      setSubmitterName('');
    } catch (error) {
      console.error('Failed to feed dream:', error);
      toast.error('Failed to feed the Dream-Eater');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="submitter">Your Name (optional)</Label>
        <Input
          id="submitter"
          placeholder="Anonymous Dreamer"
          value={submitterName}
          onChange={(e) => setSubmitterName(e.target.value)}
          maxLength={50}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-3">
        <Label>What are you feeding?</Label>
        <RadioGroup
          value={dreamType}
          onValueChange={(value) => setDreamType(value as 'dream' | 'nightmare')}
          className="flex gap-4"
          disabled={isSubmitting}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="dream" id="dream" />
            <Label htmlFor="dream" className="flex items-center gap-2 cursor-pointer">
              <Moon className="w-4 h-4 text-violet-400" />
              Dream
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="nightmare" id="nightmare" />
            <Label htmlFor="nightmare" className="flex items-center gap-2 cursor-pointer">
              <Skull className="w-4 h-4 text-red-400" />
              Nightmare
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Describe your {dreamType}</Label>
        <Textarea
          id="content"
          placeholder={dreamType === 'nightmare' 
            ? "Tell me about the shadows that haunt your sleep..." 
            : "Share the visions that visit you in slumber..."
          }
          value={dreamContent}
          onChange={(e) => setDreamContent(e.target.value)}
          className="min-h-[150px] resize-none"
          maxLength={2000}
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground text-right">
          {dreamContent.length}/2000
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting || !dreamContent.trim()}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Feeding...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Feed the Dream-Eater
          </>
        )}
      </Button>
    </form>
  );
};
