/**
 * AdaptiveLearningDemo — Self-adjusting quiz that learns from responses
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { 
  Brain, CheckCircle2, XCircle, Lightbulb, Trophy, 
  RotateCcw, Sparkles, Target, TrendingUp, Zap, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  explanation: string;
}

interface UserProfile {
  totalAnswered: number;
  correctAnswers: number;
  streak: number;
  maxStreak: number;
  topicStrengths: Record<string, number>;
  adaptedDifficulty: 'easy' | 'medium' | 'hard';
}

const QUESTION_BANK: Question[] = [
  // Easy
  { id: 'e1', question: 'What does AI stand for?', options: ['Artificial Intelligence', 'Automated Integration', 'Advanced Interface', 'Applied Innovation'], correctIndex: 0, difficulty: 'easy', topic: 'basics', explanation: 'AI stands for Artificial Intelligence, the simulation of human intelligence by machines.' },
  { id: 'e2', question: 'Which company created ChatGPT?', options: ['Google', 'OpenAI', 'Meta', 'Microsoft'], correctIndex: 1, difficulty: 'easy', topic: 'industry', explanation: 'OpenAI developed ChatGPT, first releasing it in November 2022.' },
  { id: 'e3', question: 'What is machine learning?', options: ['Programming robots', 'A type of database', 'Algorithms that learn from data', 'Cloud computing'], correctIndex: 2, difficulty: 'easy', topic: 'basics', explanation: 'Machine learning enables systems to learn and improve from experience without explicit programming.' },
  
  // Medium
  { id: 'm1', question: 'What is a neural network inspired by?', options: ['Computer circuits', 'The human brain', 'Quantum mechanics', 'Social networks'], correctIndex: 1, difficulty: 'medium', topic: 'architecture', explanation: 'Neural networks are inspired by biological neural networks in human brains.' },
  { id: 'm2', question: 'What does "transformer" refer to in AI?', options: ['Power converter', 'Attention-based architecture', 'Data transformer', 'Robot type'], correctIndex: 1, difficulty: 'medium', topic: 'architecture', explanation: 'Transformers are attention-based architectures that power models like GPT and BERT.' },
  { id: 'm3', question: 'What is "fine-tuning" in machine learning?', options: ['Adjusting hardware', 'Training on specific data', 'Debugging code', 'Optimizing speed'], correctIndex: 1, difficulty: 'medium', topic: 'training', explanation: 'Fine-tuning adapts a pre-trained model to a specific task using additional training.' },
  
  // Hard
  { id: 'h1', question: 'What is the purpose of attention mechanisms?', options: ['User engagement', 'Weighting input relevance', 'Memory optimization', 'Error handling'], correctIndex: 1, difficulty: 'hard', topic: 'architecture', explanation: 'Attention mechanisms allow models to focus on relevant parts of input when generating output.' },
  { id: 'h2', question: 'What does RLHF stand for?', options: ['Rapid Learning High Frequency', 'Reinforcement Learning from Human Feedback', 'Real-time Language Hierarchy Framework', 'Recursive Logic Hardware Function'], correctIndex: 1, difficulty: 'hard', topic: 'training', explanation: 'RLHF uses human feedback to fine-tune models for better alignment with human preferences.' },
  { id: 'h3', question: 'What is "emergent behavior" in large language models?', options: ['Bug patterns', 'Capabilities arising at scale', 'Programmed responses', 'Error states'], correctIndex: 1, difficulty: 'hard', topic: 'theory', explanation: 'Emergent behaviors are capabilities that appear in larger models but not in smaller ones.' },
];

export function AdaptiveLearningDemo() {
  const [profile, setProfile] = useState<UserProfile>({
    totalAnswered: 0,
    correctAnswers: 0,
    streak: 0,
    maxStreak: 0,
    topicStrengths: {},
    adaptedDifficulty: 'easy'
  });
  
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [learnersCount, setLearnersCount] = useState(1284);

  useEffect(() => {
    selectNextQuestion();
  }, []);

  const selectNextQuestion = () => {
    // Adaptive question selection based on performance
    const availableQuestions = QUESTION_BANK.filter(q => {
      if (profile.totalAnswered < 2) return q.difficulty === 'easy';
      if (profile.correctAnswers / Math.max(1, profile.totalAnswered) > 0.8) {
        return q.difficulty === 'hard' || q.difficulty === 'medium';
      }
      if (profile.correctAnswers / Math.max(1, profile.totalAnswered) < 0.4) {
        return q.difficulty === 'easy';
      }
      return q.difficulty === profile.adaptedDifficulty;
    });

    // Prioritize topics user is weak in
    const weakTopics = Object.entries(profile.topicStrengths)
      .filter(([_, score]) => score < 0.5)
      .map(([topic]) => topic);

    let candidates = availableQuestions;
    if (weakTopics.length > 0) {
      const weakTopicQuestions = availableQuestions.filter(q => weakTopics.includes(q.topic));
      if (weakTopicQuestions.length > 0) {
        candidates = weakTopicQuestions;
      }
    }

    const randomIndex = Math.floor(Math.random() * candidates.length);
    setCurrentQuestion(candidates[randomIndex] || QUESTION_BANK[0]);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const handleAnswer = async (index: number) => {
    if (showResult || !currentQuestion) return;
    
    setSelectedAnswer(index);
    setShowResult(true);
    setIsLoading(true);

    const isCorrect = index === currentQuestion.correctIndex;
    
    // Update profile
    const newProfile = { ...profile };
    newProfile.totalAnswered += 1;
    if (isCorrect) {
      newProfile.correctAnswers += 1;
      newProfile.streak += 1;
      newProfile.maxStreak = Math.max(newProfile.maxStreak, newProfile.streak);
    } else {
      newProfile.streak = 0;
    }

    // Update topic strength
    const topicScore = newProfile.topicStrengths[currentQuestion.topic] || 0.5;
    newProfile.topicStrengths[currentQuestion.topic] = isCorrect 
      ? Math.min(1, topicScore + 0.1)
      : Math.max(0, topicScore - 0.15);

    // Adapt difficulty
    const accuracy = newProfile.correctAnswers / newProfile.totalAnswered;
    if (accuracy > 0.75 && newProfile.streak >= 2) {
      newProfile.adaptedDifficulty = newProfile.adaptedDifficulty === 'easy' ? 'medium' : 'hard';
    } else if (accuracy < 0.4) {
      newProfile.adaptedDifficulty = newProfile.adaptedDifficulty === 'hard' ? 'medium' : 'easy';
    }

    setProfile(newProfile);

    // Store learning in brain
    try {
      await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'brain',
          action: 'learn',
          payload: {
            content: `Quiz: "${currentQuestion.question}" → ${isCorrect ? 'Correct' : 'Incorrect'} (Topic: ${currentQuestion.topic}, Difficulty: ${currentQuestion.difficulty})`,
            memory_type: 'learning',
            context: { 
              type: 'adaptive_quiz', 
              topic: currentQuestion.topic,
              difficulty: currentQuestion.difficulty,
              correct: isCorrect,
              demo: 'experimentation-lab' 
            }
          }
        }
      });

      if (isCorrect && newProfile.streak >= 3) {
        toast.success(`🔥 ${newProfile.streak} correct in a row!`);
      }
    } catch (error) {
      console.error('Failed to store learning:', error);
    } finally {
      setIsLoading(false);
      setLearnersCount(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (profile.totalAnswered >= 5) {
      setQuizComplete(true);
    } else {
      selectNextQuestion();
    }
  };

  const resetQuiz = () => {
    setProfile({
      totalAnswered: 0,
      correctAnswers: 0,
      streak: 0,
      maxStreak: 0,
      topicStrengths: {},
      adaptedDifficulty: 'easy'
    });
    setQuizComplete(false);
    selectNextQuestion();
  };

  const accuracy = profile.totalAnswered > 0 
    ? Math.round((profile.correctAnswers / profile.totalAnswered) * 100) 
    : 0;

  const getDifficultyColor = (d: string) => {
    switch (d) {
      case 'easy': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case 'medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'hard': return 'bg-red-500/20 text-red-400 border-red-500/40';
      default: return 'bg-muted';
    }
  };

  if (quizComplete) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-violet-500" />
            <span className="text-sm font-medium">Adaptive Learning Assistant</span>
          </div>
        </div>

        <Card className="p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border-violet-500/20 text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4 text-amber-500" />
          <h3 className="text-xl font-bold mb-2">Quiz Complete!</h3>
          <p className="text-muted-foreground mb-4">
            You answered {profile.correctAnswers} out of {profile.totalAnswered} correctly
          </p>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-primary">{accuracy}%</div>
              <div className="text-xs text-muted-foreground">Accuracy</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-amber-500">{profile.maxStreak}</div>
              <div className="text-xs text-muted-foreground">Best Streak</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold capitalize text-violet-400">{profile.adaptedDifficulty}</div>
              <div className="text-xs text-muted-foreground">Final Level</div>
            </div>
          </div>

          {Object.entries(profile.topicStrengths).length > 0 && (
            <div className="mb-6">
              <span className="text-xs text-muted-foreground block mb-2">Topic Mastery:</span>
              <div className="flex flex-wrap justify-center gap-2">
                {Object.entries(profile.topicStrengths).map(([topic, score]) => (
                  <Badge 
                    key={topic} 
                    variant="outline" 
                    className={score > 0.6 ? 'border-green-500/40 text-green-400' : 'border-amber-500/40 text-amber-400'}
                  >
                    {topic}: {Math.round(score * 100)}%
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button onClick={resetQuiz} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Start New Quiz
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-violet-500" />
          <span className="text-sm font-medium">Adaptive Learning Assistant</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            {learnersCount.toLocaleString()} learners
          </Badge>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-2 rounded-lg bg-muted/30 text-center">
          <div className="text-lg font-bold">{profile.totalAnswered}/5</div>
          <div className="text-[10px] text-muted-foreground">Progress</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/30 text-center">
          <div className="text-lg font-bold text-green-400">{accuracy}%</div>
          <div className="text-[10px] text-muted-foreground">Accuracy</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/30 text-center">
          <div className="text-lg font-bold text-amber-400">{profile.streak}🔥</div>
          <div className="text-[10px] text-muted-foreground">Streak</div>
        </div>
        <div className="p-2 rounded-lg bg-muted/30 text-center">
          <Badge className={`${getDifficultyColor(profile.adaptedDifficulty)} text-[10px]`}>
            {profile.adaptedDifficulty}
          </Badge>
          <div className="text-[10px] text-muted-foreground mt-1">Level</div>
        </div>
      </div>

      <Progress value={(profile.totalAnswered / 5) * 100} className="h-2" />

      {/* Question */}
      {currentQuestion && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="outline" className="text-xs capitalize">
              {currentQuestion.topic}
            </Badge>
            <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
              {currentQuestion.difficulty}
            </Badge>
          </div>

          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>

          <div className="space-y-2">
            <AnimatePresence mode="wait">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrect = index === currentQuestion.correctIndex;
                const showCorrect = showResult && isCorrect;
                const showWrong = showResult && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleAnswer(index)}
                    disabled={showResult}
                    className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${
                      showCorrect 
                        ? 'border-green-500 bg-green-500/10' 
                        : showWrong 
                          ? 'border-red-500 bg-red-500/10'
                          : isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50 hover:bg-muted/30'
                    }`}
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-medium ${
                      showCorrect 
                        ? 'bg-green-500 text-white' 
                        : showWrong 
                          ? 'bg-red-500 text-white'
                          : 'bg-muted'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {showCorrect && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {showWrong && <XCircle className="w-5 h-5 text-red-500" />}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Explanation */}
          {showResult && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50"
            >
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5" />
                <div>
                  <span className="text-xs font-medium block mb-1">Explanation:</span>
                  <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Next Button */}
          {showResult && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4"
            >
              <Button onClick={nextQuestion} className="w-full gap-2">
                {profile.totalAnswered >= 5 ? 'View Results' : 'Next Question'}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}
        </Card>
      )}

      {/* Adaptation Notice */}
      <div className="flex items-center gap-2 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs">
        <TrendingUp className="w-4 h-4 text-violet-400" />
        <span className="text-muted-foreground">
          The quiz adapts to your performance—get answers right to increase difficulty!
        </span>
      </div>
    </div>
  );
}
