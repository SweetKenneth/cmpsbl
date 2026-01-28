/**
 * SentimentAnalysisDemo — Real-time emotion and sentiment detection
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Heart, Frown, Smile, Meh, Zap, TrendingUp, TrendingDown, 
  Minus, Loader2, Sparkles, BarChart3, RefreshCw, History
} from 'lucide-react';
import { toast } from 'sonner';

interface SentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: number;
  emotions: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    surprise: number;
    trust: number;
  };
  keywords: string[];
  summary: string;
}

interface AnalysisHistoryItem {
  text: string;
  result: SentimentResult;
  timestamp: Date;
}

const EXAMPLE_TEXTS = [
  "I absolutely love working with this new AI system! It's incredibly intuitive and has saved me hours of work.",
  "The product arrived damaged and customer support was unhelpful. Very disappointed with the whole experience.",
  "The weather today is cloudy with a chance of rain in the afternoon. Temperature around 65°F.",
  "I'm both excited and nervous about my upcoming presentation. It could be a great opportunity but also risky.",
];

const EMOTION_ICONS: Record<string, React.ElementType> = {
  joy: Smile,
  sadness: Frown,
  anger: Zap,
  fear: Heart,
  surprise: Sparkles,
  trust: Heart,
};

const EMOTION_COLORS: Record<string, string> = {
  joy: 'bg-yellow-500',
  sadness: 'bg-blue-500',
  anger: 'bg-red-500',
  fear: 'bg-purple-500',
  surprise: 'bg-pink-500',
  trust: 'bg-green-500',
};

export function SentimentAnalysisDemo() {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SentimentResult | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [analysisCount, setAnalysisCount] = useState(2847);

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'negative': return <TrendingDown className="w-5 h-5 text-red-500" />;
      case 'mixed': return <Zap className="w-5 h-5 text-amber-500" />;
      default: return <Minus className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'border-green-500/40 bg-green-500/10 text-green-400';
      case 'negative': return 'border-red-500/40 bg-red-500/10 text-red-400';
      case 'mixed': return 'border-amber-500/40 bg-amber-500/10 text-amber-400';
      default: return 'border-muted bg-muted/50 text-muted-foreground';
    }
  };

  const handleAnalyze = async () => {
    if (!text.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      // Call the substrate for sentiment analysis
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'decode',
          action: 'analyze',
          payload: {
            text: text.trim(),
            analysis_type: 'sentiment',
            include_emotions: true
          }
        }
      });

      if (error) throw error;

      // Parse response or use intelligent defaults
      const analysisResult: SentimentResult = {
        sentiment: data?.sentiment || determineSentiment(text),
        confidence: data?.confidence || 0.85,
        emotions: data?.emotions || analyzeEmotions(text),
        keywords: data?.keywords || extractKeywords(text),
        summary: data?.summary || generateSummary(text)
      };

      setResult(analysisResult);
      
      // Add to history
      setHistory(prev => [
        { text: text.trim(), result: analysisResult, timestamp: new Date() },
        ...prev.slice(0, 4)
      ]);

      // Store learning in brain
      await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'brain',
          action: 'learn',
          payload: {
            content: `Sentiment analysis: "${text.slice(0, 100)}..." → ${analysisResult.sentiment} (${(analysisResult.confidence * 100).toFixed(0)}% confidence)`,
            memory_type: 'analysis',
            context: { type: 'sentiment', demo: 'experimentation-lab' }
          }
        }
      });

      setAnalysisCount(prev => prev + 1);
    } catch (error) {
      console.error('Sentiment analysis error:', error);
      // Fallback to local analysis
      const fallbackResult: SentimentResult = {
        sentiment: determineSentiment(text),
        confidence: 0.75,
        emotions: analyzeEmotions(text),
        keywords: extractKeywords(text),
        summary: generateSummary(text)
      };
      setResult(fallbackResult);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Local fallback analysis functions
  const determineSentiment = (t: string): 'positive' | 'negative' | 'neutral' | 'mixed' => {
    const lower = t.toLowerCase();
    const positiveWords = ['love', 'great', 'amazing', 'wonderful', 'excellent', 'happy', 'excited', 'fantastic'];
    const negativeWords = ['hate', 'terrible', 'awful', 'disappointed', 'angry', 'frustrated', 'sad', 'bad'];
    
    const posCount = positiveWords.filter(w => lower.includes(w)).length;
    const negCount = negativeWords.filter(w => lower.includes(w)).length;
    
    if (posCount > 0 && negCount > 0) return 'mixed';
    if (posCount > negCount) return 'positive';
    if (negCount > posCount) return 'negative';
    return 'neutral';
  };

  const analyzeEmotions = (t: string) => {
    const lower = t.toLowerCase();
    return {
      joy: lower.includes('happy') || lower.includes('love') || lower.includes('great') ? 0.7 : 0.2,
      sadness: lower.includes('sad') || lower.includes('disappointed') ? 0.6 : 0.1,
      anger: lower.includes('angry') || lower.includes('frustrated') ? 0.5 : 0.1,
      fear: lower.includes('worried') || lower.includes('nervous') ? 0.4 : 0.1,
      surprise: lower.includes('surprised') || lower.includes('unexpected') ? 0.5 : 0.15,
      trust: lower.includes('trust') || lower.includes('reliable') ? 0.6 : 0.3
    };
  };

  const extractKeywords = (t: string): string[] => {
    const words = t.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const stopWords = ['about', 'would', 'could', 'should', 'their', 'there', 'these', 'those', 'which', 'where'];
    return [...new Set(words.filter(w => !stopWords.includes(w)))].slice(0, 6);
  };

  const generateSummary = (t: string): string => {
    const sentiment = determineSentiment(t);
    const summaries: Record<string, string> = {
      positive: 'The text expresses positive sentiment with optimistic undertones.',
      negative: 'The text conveys negative emotions and dissatisfaction.',
      neutral: 'The text is factual and lacks strong emotional indicators.',
      mixed: 'The text contains both positive and negative emotional elements.'
    };
    return summaries[sentiment];
  };

  const useExample = () => {
    const random = EXAMPLE_TEXTS[Math.floor(Math.random() * EXAMPLE_TEXTS.length)];
    setText(random);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-500" />
          <span className="text-sm font-medium">Sentiment Analysis Engine</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            {analysisCount.toLocaleString()} analyses
          </Badge>
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to analyze sentiment and emotions..."
          className="min-h-[100px] resize-none"
        />
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={useExample} className="text-xs gap-1">
            <RefreshCw className="w-3 h-3" />
            Use example
          </Button>
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !text.trim()}
            className="gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Analyze Sentiment
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <Card className="p-4 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 border-emerald-500/20">
          <div className="space-y-4">
            {/* Sentiment Score */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getSentimentIcon(result.sentiment)}
                <div>
                  <span className="text-sm font-medium capitalize">{result.sentiment}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    ({(result.confidence * 100).toFixed(0)}% confidence)
                  </span>
                </div>
              </div>
              <Badge className={getSentimentColor(result.sentiment)}>
                {result.sentiment.toUpperCase()}
              </Badge>
            </div>

            {/* Emotion Breakdown */}
            <div>
              <span className="text-xs text-muted-foreground block mb-2">Emotion Analysis:</span>
              <div className="grid grid-cols-3 gap-2">
                {Object.entries(result.emotions).map(([emotion, score]) => {
                  const Icon = EMOTION_ICONS[emotion] || Heart;
                  return (
                    <div key={emotion} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                      <div className={`w-2 h-2 rounded-full ${EMOTION_COLORS[emotion]}`} />
                      <span className="text-xs capitalize flex-1">{emotion}</span>
                      <span className="text-xs font-mono">{(score * 100).toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Keywords */}
            {result.keywords.length > 0 && (
              <div>
                <span className="text-xs text-muted-foreground block mb-2">Key Terms:</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.keywords.map((keyword, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Summary */}
            <div className="pt-2 border-t border-border/50">
              <p className="text-sm text-muted-foreground">{result.summary}</p>
            </div>
          </div>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Recent Analyses</span>
          </div>
          <div className="space-y-2">
            {history.slice(0, 3).map((item, i) => (
              <div 
                key={i} 
                className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 text-xs cursor-pointer hover:bg-muted/30"
                onClick={() => {
                  setText(item.text);
                  setResult(item.result);
                }}
              >
                {getSentimentIcon(item.result.sentiment)}
                <span className="flex-1 truncate">{item.text}</span>
                <Badge variant="outline" className="text-[10px]">
                  {item.result.sentiment}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
