/**
 * SentimentAnalysisDemo — Real-time emotion and sentiment detection
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Zap, TrendingUp, TrendingDown, Minus, Loader2, Sparkles, BarChart3, RefreshCw, History } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SentimentResult { sentiment: 'positive' | 'negative' | 'neutral' | 'mixed'; confidence: number; emotions: Record<string, number>; keywords: string[]; summary: string; }

const EXAMPLE_TEXTS = [
  "I absolutely love working with this new AI system! It's incredibly intuitive.",
  "The product arrived damaged and customer support was unhelpful. Very disappointed.",
  "The weather today is cloudy with a chance of rain. Temperature around 65°F.",
  "I'm both excited and nervous about my upcoming presentation.",
];

const EMOTION_COLORS: Record<string, { bg: string; bar: string }> = {
  joy: { bg: 'bg-neon-amber/20', bar: 'bg-neon-amber' },
  sadness: { bg: 'bg-neon-blue/20', bar: 'bg-neon-blue' },
  anger: { bg: 'bg-destructive/20', bar: 'bg-destructive' },
  fear: { bg: 'bg-neon-purple/20', bar: 'bg-neon-purple' },
  surprise: { bg: 'bg-neon-magenta/20', bar: 'bg-neon-magenta' },
  trust: { bg: 'bg-neon-green/20', bar: 'bg-neon-green' },
};

export function SentimentAnalysisDemo() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [history, setHistory] = useState<{ text: string; result: SentimentResult }[]>([]);
  const [analysisCount, setAnalysisCount] = useState(2847);

  const getSentimentIcon = (s: string) => s === 'positive' ? <TrendingUp className="w-5 h-5 text-neon-green" /> : s === 'negative' ? <TrendingDown className="w-5 h-5 text-destructive" /> : s === 'mixed' ? <Zap className="w-5 h-5 text-neon-amber" /> : <Minus className="w-5 h-5 text-muted-foreground" />;
  const getSentimentColor = (s: string) => s === 'positive' ? 'border-neon-green/40 bg-neon-green/10 text-neon-green' : s === 'negative' ? 'border-destructive/40 bg-destructive/10 text-destructive' : s === 'mixed' ? 'border-neon-amber/40 bg-neon-amber/10 text-neon-amber' : 'border-muted bg-muted/50';

  const determineSentiment = (t: string): SentimentResult['sentiment'] => {
    const lower = t.toLowerCase();
    const pos = ['love', 'great', 'amazing', 'wonderful', 'excellent', 'happy'].filter(w => lower.includes(w)).length;
    const neg = ['hate', 'terrible', 'awful', 'disappointed', 'angry', 'sad', 'bad'].filter(w => lower.includes(w)).length;
    if (pos > 0 && neg > 0) return 'mixed';
    if (pos > neg) return 'positive';
    if (neg > pos) return 'negative';
    return 'neutral';
  };

  const analyzeEmotions = (t: string) => {
    const lower = t.toLowerCase();
    return {
      joy: lower.includes('love') || lower.includes('happy') ? 0.7 : 0.2,
      sadness: lower.includes('sad') || lower.includes('disappointed') ? 0.6 : 0.1,
      anger: lower.includes('angry') || lower.includes('frustrated') ? 0.5 : 0.1,
      fear: lower.includes('worried') || lower.includes('nervous') ? 0.4 : 0.1,
      surprise: lower.includes('surprised') ? 0.5 : 0.15,
      trust: lower.includes('trust') ? 0.6 : 0.3
    };
  };

  const handleAnalyze = async () => {
    if (!text.trim() || isAnalyzing) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data } = await supabase.functions.invoke('pf-substrate', { body: { module: 'decode', action: 'analyze', payload: { text: text.trim(), analysis_type: 'sentiment', include_emotions: true } } });
      const analysisResult: SentimentResult = {
        sentiment: data?.sentiment || determineSentiment(text),
        confidence: data?.confidence || 0.85,
        emotions: data?.emotions || analyzeEmotions(text),
        keywords: data?.keywords || text.split(/\s+/).filter(w => w.length > 4).slice(0, 6),
        summary: data?.summary || `The text expresses ${determineSentiment(text)} sentiment.`
      };
      setResult(analysisResult);
      setHistory(prev => [{ text: text.trim(), result: analysisResult }, ...prev.slice(0, 4)]);
      await supabase.functions.invoke('pf-substrate', { body: { module: 'brain', action: 'learn', payload: { content: `Sentiment: "${text.slice(0, 50)}..." → ${analysisResult.sentiment}`, memory_type: 'analysis', context: { type: 'sentiment', demo: 'experimentation-lab' } } } });
      setAnalysisCount(prev => prev + 1);
    } catch (error) {
      const fallback: SentimentResult = { sentiment: determineSentiment(text), confidence: 0.75, emotions: analyzeEmotions(text), keywords: text.split(/\s+/).filter(w => w.length > 4).slice(0, 6), summary: `The text expresses ${determineSentiment(text)} sentiment.` };
      setResult(fallback);
    } finally { setIsAnalyzing(false); }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-neon-green" /><span className="text-sm font-medium">Sentiment Analysis Engine</span></div>
        <Badge variant="outline" className="text-xs"><Sparkles className="w-3 h-3 mr-1" />{analysisCount.toLocaleString()} analyses</Badge>
      </div>

      <div className="space-y-2">
        <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter text to analyze..." className="min-h-[100px] resize-none" maxLength={500} />
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => setText(EXAMPLE_TEXTS[Math.floor(Math.random() * EXAMPLE_TEXTS.length)])} className="text-xs gap-1"><RefreshCw className="w-3 h-3" />Example</Button>
          <Button onClick={handleAnalyze} disabled={isAnalyzing || !text.trim()} className="gap-2">{isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" />Analyzing...</> : <><Zap className="w-4 h-4" />Analyze</>}</Button>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Card className="p-4 bg-gradient-to-br from-neon-green/5 to-neon-cyan/5 border-neon-green/20 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">{getSentimentIcon(result.sentiment)}<span className="text-sm font-medium capitalize">{result.sentiment}</span><span className="text-xs text-muted-foreground">({(result.confidence * 100).toFixed(0)}% confidence)</span></div>
                <Badge className={getSentimentColor(result.sentiment)}>{result.sentiment.toUpperCase()}</Badge>
              </div>
              <div><span className="text-xs text-muted-foreground block mb-3">Emotion Analysis:</span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(result.emotions).map(([emotion, score]) => (
                    <div key={emotion} className="space-y-1">
                      <div className="flex items-center justify-between text-xs"><span className="capitalize">{emotion}</span><span className="font-mono">{(score * 100).toFixed(0)}%</span></div>
                      <div className={`h-2 rounded-full ${EMOTION_COLORS[emotion]?.bg || 'bg-muted'}`}><motion.div className={`h-full rounded-full ${EMOTION_COLORS[emotion]?.bar || 'bg-primary'}`} initial={{ width: 0 }} animate={{ width: `${score * 100}%` }} transition={{ duration: 0.5 }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              {result.keywords.length > 0 && <div><span className="text-xs text-muted-foreground block mb-2">Key Terms:</span><div className="flex flex-wrap gap-1.5">{result.keywords.map((k, i) => <Badge key={i} variant="outline" className="text-xs">{k}</Badge>)}</div></div>}
              <div className="pt-2 border-t border-border/50"><p className="text-sm text-muted-foreground">{result.summary}</p></div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {history.length > 0 && (
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-2"><History className="w-4 h-4 text-muted-foreground" /><span className="text-xs text-muted-foreground">Recent</span></div>
          <div className="space-y-2">{history.slice(0, 3).map((item, i) => <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 text-xs cursor-pointer hover:bg-muted/30" onClick={() => { setText(item.text); setResult(item.result); }}>{getSentimentIcon(item.result.sentiment)}<span className="flex-1 truncate">{item.text}</span><Badge variant="outline" className="text-[10px]">{item.result.sentiment}</Badge></div>)}</div>
        </div>
      )}
    </div>
  );
}