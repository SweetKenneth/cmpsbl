/**
 * Support Bot Panel
 * Governed Evolving Support System UI
 * 
 * Interactive chat interface for the substrate-integrated support bot.
 */

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  AlertCircle, 
  CheckCircle, 
  ArrowUpCircle,
  Brain,
  Sparkles,
  Shield,
  TrendingUp,
  Clock,
  Settings,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { useSupportBot } from '@/lib/substrate/support-bot/useSupportBot';
import type { ConversationMessage, SupportResponse } from '@/lib/substrate/support-bot/types';

// ============================================================================
// Chat Message Component
// ============================================================================

interface ChatMessageProps {
  message: ConversationMessage;
  onFeedback?: (helpful: boolean) => void;
}

function ChatMessage({ message, onFeedback }: ChatMessageProps) {
  const isBot = message.role === 'bot';
  const isSystem = message.role === 'system';
  
  return (
    <div className={`flex gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isBot ? '' : 'order-first'}`}>
        <div className={`rounded-lg p-3 ${
          isBot 
            ? 'bg-muted text-muted-foreground' 
            : isSystem
            ? 'bg-neon-amber/10 text-yellow-600 border border-neon-amber/20'
            : 'bg-primary text-primary-foreground'
        }`}>
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          
          {message.metadata?.confidence !== undefined && (
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
              <Badge variant={message.metadata.confidence > 0.7 ? 'default' : 'secondary'} className="text-xs">
                {Math.round(message.metadata.confidence * 100)}% confidence
              </Badge>
              {message.metadata.sources && (
                <span className="text-xs opacity-60">
                  {(message.metadata.sources as string[]).length} sources
                </span>
              )}
            </div>
          )}
        </div>
        
        {isBot && onFeedback && (
          <div className="flex items-center gap-1 mt-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => onFeedback(true)}
            >
              <ThumbsUp className="w-3 h-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0"
              onClick={() => onFeedback(false)}
            >
              <ThumbsDown className="w-3 h-3" />
            </Button>
          </div>
        )}
        
        <span className="text-xs text-muted-foreground mt-1 block">
          {new Date(message.timestamp).toLocaleTimeString()}
        </span>
      </div>
      
      {!isBot && !isSystem && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Stats Card Component
// ============================================================================

interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
}

function StatsCard({ icon, label, value, trend }: StatsCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
      {trend && (
        <TrendingUp className={`w-4 h-4 ml-auto ${
          trend === 'up' ? 'text-neon-green' : trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
        }`} />
      )}
    </div>
  );
}

// ============================================================================
// Main Panel Component
// ============================================================================

export function SupportBotPanel() {
  const {
    state,
    isEnabled,
    isProcessing,
    error,
    messages,
    ask,
    escalate,
    submitFeedback,
    detectPatterns,
    clearSession,
    configure,
    enable,
    disable,
    clearError,
  } = useSupportBot();

  const [input, setInput] = useState('');
  const [lastResponse, setLastResponse] = useState<SupportResponse | null>(null);
  const [showEscalationInfo, setShowEscalationInfo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    
    const question = input.trim();
    setInput('');
    
    const response = await ask(question);
    if (response) {
      setLastResponse(response);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFeedback = async (helpful: boolean) => {
    if (state.current_session?.session_id) {
      await submitFeedback(state.current_session.session_id, { helpful });
    }
  };

  const handleEscalate = async () => {
    await escalate('user_requested');
    setShowEscalationInfo(true);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                Support Bot
                {isEnabled && (
                  <Badge className="bg-neon-green/10 text-neon-green border-neon-green/20">
                    <Zap className="w-3 h-3 mr-1" />
                    Evolving
                  </Badge>
                )}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Memory-backed • Governed • Self-improving
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Switch 
              checked={isEnabled} 
              onCheckedChange={(checked) => checked ? enable() : disable()} 
            />
          </div>
        </div>
      </CardHeader>

      <Tabs defaultValue="chat" className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="mx-4">
          <TabsTrigger value="chat" className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Stats
          </TabsTrigger>
          <TabsTrigger value="learning" className="flex items-center gap-1">
            <Brain className="w-4 h-4" />
            Learning
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="flex-1 flex flex-col overflow-hidden p-4 pt-2">
          {/* Messages Area */}
          <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
            <div className="space-y-4 pb-4">
              {messages.length === 0 ? (
                <div className="text-center py-12">
                  <Bot className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                  <h3 className="font-medium text-muted-foreground">No messages yet</h3>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    Ask a question to start the conversation
                  </p>
                  
                  <div className="flex flex-wrap gap-2 justify-center mt-6">
                     {[
                      'What is CMPSBL?',
                      'What is the Memory Stream?',
                      'What are the pricing tiers?',
                      'How do I get started?',
                      'Can I talk to a human?',
                    ].map((q) => (
                      <Button 
                        key={q}
                        variant="outline" 
                        size="sm"
                        onClick={() => setInput(q)}
                      >
                        {q}
                      </Button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg) => (
                  <ChatMessage 
                    key={msg.id} 
                    message={msg} 
                    onFeedback={msg.role === 'bot' ? handleFeedback : undefined}
                  />
                ))
              )}
              
              {isProcessing && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100" />
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive mb-3">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm flex-1">{error}</span>
              <Button variant="ghost" size="sm" onClick={clearError}>Dismiss</Button>
            </div>
          )}

          {/* Human Escalation Info */}
          {showEscalationInfo && (
            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg mb-3">
              <ArrowUpCircle className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Escalated to our team</p>
                <p className="text-xs text-muted-foreground">
                  Email <a href="mailto:support@cmpsbl.com" className="text-primary hover:underline font-medium">support@cmpsbl.com</a> for
                  fastest response. We'll get back to you within 48 hours.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowEscalationInfo(false)} className="text-xs">✕</Button>
            </div>
          )}

          {lastResponse?.suggested_actions && lastResponse.suggested_actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {lastResponse.suggested_actions.map((action, i) => (
                <Button 
                  key={i} 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    if (action.type === 'escalate') handleEscalate();
                  }}
                >
                  {action.type === 'escalate' && <ArrowUpCircle className="w-3 h-3 mr-1" />}
                  {action.type === 'doc' && <ExternalLink className="w-3 h-3 mr-1" />}
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isEnabled ? "Ask a question..." : "Bot is disabled"}
              disabled={!isEnabled || isProcessing}
              className="flex-1"
            />
            <Button 
              onClick={handleSend} 
              disabled={!isEnabled || isProcessing || !input.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              onClick={clearSession}
              disabled={messages.length === 0}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="stats" className="flex-1 overflow-auto p-4 pt-2">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <StatsCard 
              icon={<MessageCircle className="w-5 h-5 text-primary" />}
              label="Total Questions"
              value={state.stats.total_questions}
            />
            <StatsCard 
              icon={<CheckCircle className="w-5 h-5 text-neon-green" />}
              label="Bot Answered"
              value={state.stats.answered_by_bot}
            />
            <StatsCard 
              icon={<ArrowUpCircle className="w-5 h-5 text-neon-amber" />}
              label="Escalated"
              value={state.stats.escalated}
            />
            <StatsCard 
              icon={<Sparkles className="w-5 h-5 text-neon-purple" />}
              label="Avg Confidence"
              value={`${Math.round(state.stats.avg_confidence * 100)}%`}
            />
          </div>

          <Separator className="my-4" />

          <h4 className="font-medium mb-3">Confidence Threshold</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Minimum answer confidence</span>
              <span className="font-mono">{Math.round(state.config.min_answer_confidence * 100)}%</span>
            </div>
            <Progress value={state.config.min_answer_confidence * 100} />
            
            <div className="flex items-center justify-between text-sm mt-4">
              <span>Escalation threshold</span>
              <span className="font-mono">{Math.round(state.config.escalation_threshold * 100)}%</span>
            </div>
            <Progress value={state.config.escalation_threshold * 100} className="bg-yellow-100" />
          </div>

          <Separator className="my-4" />

          <h4 className="font-medium mb-3">Current Phase</h4>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {state.phase}
          </Badge>
        </TabsContent>

        <TabsContent value="learning" className="flex-1 overflow-auto p-4 pt-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Brain className="w-8 h-8 text-primary" />
                <div>
                  <h4 className="font-medium">Learning State</h4>
                  <p className="text-sm text-muted-foreground">
                    Memory-backed evolution
                  </p>
                </div>
              </div>
              <Badge variant={state.learning.learning_events_today > 0 ? 'default' : 'secondary'}>
                {state.learning.learning_events_today} learned today
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Knowledge Base</p>
                <p className="text-2xl font-bold">{state.stats.knowledge_base_entries || 0}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">KB Matches Used</p>
                <p className="text-2xl font-bold">{state.stats.kb_matches_used || 0}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Budget Remaining</p>
                <p className="text-2xl font-bold">{state.learning.reinforcement_budget_remaining}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground">Memories Created</p>
                <p className="text-2xl font-bold">{state.stats.memories_created}</p>
              </div>
            </div>

            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <h5 className="text-sm font-medium flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Pre-trained Topics
              </h5>
              <div className="flex flex-wrap gap-1">
                {['Platform', 'Pricing', 'Getting Started', 'Security', 'Support'].map((topic) => (
                  <Badge key={topic} variant="outline" className="text-xs">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Learning Governance
              </h4>
              
              <div className="flex items-center justify-between text-sm">
                <span>Verification Required</span>
                <Switch 
                  checked={state.config.verification_required}
                  onCheckedChange={(checked) => configure({ verification_required: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Auto-Reinforce</span>
                <Switch 
                  checked={state.config.auto_reinforce}
                  onCheckedChange={(checked) => configure({ auto_reinforce: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span>Daily Learning Cap</span>
                <span className="font-mono">{state.config.daily_learning_cap}</span>
              </div>
            </div>

            {state.learning.last_learning_at && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                Last learned: {new Date(state.learning.last_learning_at).toLocaleString()}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}

export default SupportBotPanel;
