/**
 * AdaptiveLearningDemo — Self-adjusting quiz that learns from responses
 */

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Brain, CheckCircle2, XCircle, Lightbulb, Trophy, RotateCcw, Sparkles, TrendingUp, ChevronRight, Flame, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Question { id: string; question: string; options: string[]; correctIndex: number; difficulty: 'easy' | 'medium' | 'hard'; topic: string; explanation: string; }
interface UserProfile { totalAnswered: number; correctAnswers: number; streak: number; maxStreak: number; topicStrengths: Record<string, number>; adaptedDifficulty: 'easy' | 'medium' | 'hard'; }

const QUESTION_BANK: Question[] = [
  { id: 'e1', question: 'What does AI stand for?', options: ['Artificial Intelligence', 'Automated Integration', 'Advanced Interface', 'Applied Innovation'], correctIndex: 0, difficulty: 'easy', topic: 'basics', explanation: 'AI stands for Artificial Intelligence.' },
  { id: 'e2', question: 'Which company created ChatGPT?', options: ['Google', 'OpenAI', 'Meta', 'Microsoft'], correctIndex: 1, difficulty: 'easy', topic: 'industry', explanation: 'OpenAI developed ChatGPT.' },
  { id: 'e3', question: 'What is machine learning?', options: ['Programming robots', 'A type of database', 'Algorithms that learn from data', 'Cloud computing'], correctIndex: 2, difficulty: 'easy', topic: 'basics', explanation: 'ML enables systems to learn from experience.' },
  { id: 'm1', question: 'What is a neural network inspired by?', options: ['Computer circuits', 'The human brain', 'Quantum mechanics', 'Social networks'], correctIndex: 1, difficulty: 'medium', topic: 'architecture', explanation: 'Neural networks are inspired by biological neurons.' },
  { id: 'm2', question: 'What does "transformer" refer to in AI?', options: ['Power converter', 'Attention-based architecture', 'Data transformer', 'Robot type'], correctIndex: 1, difficulty: 'medium', topic: 'architecture', explanation: 'Transformers power models like GPT and BERT.' },
  { id: 'h1', question: 'What is the purpose of attention mechanisms?', options: ['User engagement', 'Weighting input relevance', 'Memory optimization', 'Error handling'], correctIndex: 1, difficulty: 'hard', topic: 'architecture', explanation: 'Attention mechanisms focus on relevant input parts.' },
  { id: 'h2', question: 'What does RLHF stand for?', options: ['Rapid Learning High Frequency', 'Reinforcement Learning from Human Feedback', 'Real-time Language Hierarchy', 'Recursive Logic Function'], correctIndex: 1, difficulty: 'hard', topic: 'training', explanation: 'RLHF uses human feedback to fine-tune models.' },
];

const TOTAL_QUESTIONS = 5;

export function AdaptiveLearningDemo() {
  const [profile, setProfile] = useState<UserProfile>({ totalAnswered: 0, correctAnswers: 0, streak: 0, maxStreak: 0, topicStrengths: {}, adaptedDifficulty: 'easy' });
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [learnersCount] = useState(1284);

  const selectNextQuestion = useCallback(() => {
    const available = QUESTION_BANK.filter(q => {
      if (usedQuestions.has(q.id)) return false;
      if (profile.totalAnswered < 2) return q.difficulty === 'easy';
      return q.difficulty === profile.adaptedDifficulty || q.difficulty === 'medium';
    });
    const candidates = available.length > 0 ? available : QUESTION_BANK.filter(q => !usedQuestions.has(q.id));
    if (candidates.length === 0) { setQuizComplete(true); return; }
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    setCurrentQuestion(selected);
    setUsedQuestions(prev => new Set([...prev, selected.id]));
    setSelectedAnswer(null);
    setShowResult(false);
  }, [profile, usedQuestions]);

  useEffect(() => { selectNextQuestion(); }, []);

  const handleAnswer = async (index: number) => {
    if (showResult || !currentQuestion) return;
    setSelectedAnswer(index);
    setShowResult(true);
    const isCorrect = index === currentQuestion.correctIndex;
    const newProfile = { ...profile };
    newProfile.totalAnswered += 1;
    if (isCorrect) { newProfile.correctAnswers += 1; newProfile.streak += 1; newProfile.maxStreak = Math.max(newProfile.maxStreak, newProfile.streak); if (newProfile.streak >= 3) toast.success(`🔥 ${newProfile.streak} correct in a row!`); } else { newProfile.streak = 0; }
    const topicScore = newProfile.topicStrengths[currentQuestion.topic] || 0.5;
    newProfile.topicStrengths[currentQuestion.topic] = isCorrect ? Math.min(1, topicScore + 0.15) : Math.max(0, topicScore - 0.1);
    const accuracy = newProfile.correctAnswers / newProfile.totalAnswered;
    if (accuracy > 0.75 && newProfile.streak >= 2) newProfile.adaptedDifficulty = newProfile.adaptedDifficulty === 'easy' ? 'medium' : 'hard';
    else if (accuracy < 0.4) newProfile.adaptedDifficulty = newProfile.adaptedDifficulty === 'hard' ? 'medium' : 'easy';
    setProfile(newProfile);
    try { await supabase.functions.invoke('pf-substrate', { body: { module: 'brain', action: 'learn', payload: { content: `Quiz: "${currentQuestion.question}" → ${isCorrect ? 'Correct' : 'Incorrect'}`, memory_type: 'learning', context: { type: 'adaptive_quiz', topic: currentQuestion.topic, correct: isCorrect } } } }); } catch (e) { console.warn('[AdaptiveLearning] Brain learn failed:', e); }
  };

  const nextQuestion = () => { if (profile.totalAnswered >= TOTAL_QUESTIONS) setQuizComplete(true); else selectNextQuestion(); };
  const resetQuiz = () => { setProfile({ totalAnswered: 0, correctAnswers: 0, streak: 0, maxStreak: 0, topicStrengths: {}, adaptedDifficulty: 'easy' }); setUsedQuestions(new Set()); setQuizComplete(false); selectNextQuestion(); };

  const accuracy = profile.totalAnswered > 0 ? Math.round((profile.correctAnswers / profile.totalAnswered) * 100) : 0;
  const getDifficultyColor = (d: string) => d === 'easy' ? 'bg-neon-green/20 text-neon-green border-neon-green/40' : d === 'medium' ? 'bg-neon-amber/20 text-neon-amber border-neon-amber/40' : 'bg-destructive/20 text-destructive border-destructive/40';

  if (quizComplete) {
    const grade = accuracy >= 80 ? 'A' : accuracy >= 60 ? 'B' : accuracy >= 40 ? 'C' : 'D';
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-border/50"><div className="flex items-center gap-2"><Brain className="w-5 h-5 text-neon-purple" /><span className="text-sm font-medium">Adaptive Learning Assistant</span></div></div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="p-6 bg-gradient-to-br from-neon-purple/10 to-neon-purple/10 border-neon-purple/20 text-center">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-neon-amber" />
            <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
            <p className="text-muted-foreground mb-2">You scored {profile.correctAnswers}/{profile.totalAnswered}</p>
            <div className="text-4xl font-bold text-primary mb-4">Grade: {grade}</div>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 rounded-lg bg-muted/30"><div className="text-2xl font-bold">{accuracy}%</div><div className="text-xs text-muted-foreground">Accuracy</div></div>
              <div className="p-3 rounded-lg bg-muted/30"><div className="text-2xl font-bold text-neon-amber flex items-center justify-center gap-1">{profile.maxStreak}<Flame className="w-5 h-5" /></div><div className="text-xs text-muted-foreground">Best Streak</div></div>
              <div className="p-3 rounded-lg bg-muted/30"><Badge className={getDifficultyColor(profile.adaptedDifficulty)}>{profile.adaptedDifficulty}</Badge><div className="text-xs text-muted-foreground mt-1">Final Level</div></div>
            </div>
            <Button onClick={resetQuiz} className="gap-2" size="lg"><RotateCcw className="w-4 h-4" />Try Again</Button>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-4 border-b border-border/50"><div className="flex items-center gap-2"><Brain className="w-5 h-5 text-neon-purple" /><span className="text-sm font-medium">Adaptive Learning Assistant</span></div><Badge variant="outline" className="text-xs"><Sparkles className="w-3 h-3 mr-1" />{learnersCount.toLocaleString()} learners</Badge></div>
      <div className="grid grid-cols-4 gap-2">
        <div className="p-2 rounded-lg bg-muted/30 text-center"><div className="text-lg font-bold flex items-center justify-center gap-1"><BookOpen className="w-4 h-4" />{profile.totalAnswered}/{TOTAL_QUESTIONS}</div><div className="text-[10px] text-muted-foreground">Progress</div></div>
        <div className="p-2 rounded-lg bg-muted/30 text-center"><div className="text-lg font-bold text-neon-green">{accuracy}%</div><div className="text-[10px] text-muted-foreground">Accuracy</div></div>
        <div className="p-2 rounded-lg bg-muted/30 text-center"><div className="text-lg font-bold text-neon-amber flex items-center justify-center gap-1">{profile.streak}<Flame className={`w-4 h-4 ${profile.streak >= 2 ? 'animate-pulse' : ''}`} /></div><div className="text-[10px] text-muted-foreground">Streak</div></div>
        <div className="p-2 rounded-lg bg-muted/30 text-center"><Badge className={`${getDifficultyColor(profile.adaptedDifficulty)} text-[10px]`}>{profile.adaptedDifficulty}</Badge><div className="text-[10px] text-muted-foreground mt-1">Level</div></div>
      </div>
      <Progress value={(profile.totalAnswered / TOTAL_QUESTIONS) * 100} className="h-2" />
      {currentQuestion && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3"><Badge variant="outline" className="text-xs capitalize">{currentQuestion.topic}</Badge><Badge className={getDifficultyColor(currentQuestion.difficulty)}>{currentQuestion.difficulty}</Badge></div>
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctIndex;
              const showCorrect = showResult && isCorrect;
              const showWrong = showResult && isSelected && !isCorrect;
              return (
                <motion.button key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }} onClick={() => handleAnswer(index)} disabled={showResult} className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${showCorrect ? 'border-neon-green bg-neon-green/10' : showWrong ? 'border-destructive bg-destructive/10' : isSelected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-muted/30'}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${showCorrect ? 'bg-neon-green text-white' : showWrong ? 'bg-destructive text-white' : 'bg-muted'}`}>{String.fromCharCode(65 + index)}</span>
                  <span className="flex-1">{option}</span>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-neon-green" />}
                  {showWrong && <XCircle className="w-5 h-5 text-destructive" />}
                </motion.button>
              );
            })}
          </div>
          <AnimatePresence>
            {showResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-start gap-2"><Lightbulb className="w-4 h-4 text-neon-amber mt-0.5 shrink-0" /><div><span className="text-xs font-medium block mb-1">Explanation:</span><p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p></div></div>
              </motion.div>
            )}
          </AnimatePresence>
          {showResult && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="mt-4"><Button onClick={nextQuestion} className="w-full gap-2" size="lg">{profile.totalAnswered >= TOTAL_QUESTIONS ? <><Trophy className="w-4 h-4" />View Results</> : <>Next Question<ChevronRight className="w-4 h-4" /></>}</Button></motion.div>}
        </Card>
      )}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-neon-purple/10 border border-neon-purple/20 text-xs"><TrendingUp className="w-4 h-4 text-neon-purple shrink-0" /><span className="text-muted-foreground">The quiz adapts to your performance—get answers right to increase difficulty!</span></div>
    </div>
  );
}