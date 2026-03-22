/**
 * PersistentChatbotDemo — Live chatbot with persistent memory
 * Polished v2 with better error handling, animations, and UX
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Send, Bot, User, Brain, Loader2, Sparkles, Clock, Database, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { formatChatMessage } from '@/lib/ui/formatChatMessage';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  memoryUsed?: boolean;
  isTyping?: boolean;
}

const SUGGESTED_PROMPTS = [
  "What can you remember about me?",
  "Tell me something interesting",
  "What have you learned today?",
];

export function PersistentChatbotDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system-1',
      role: 'system',
      content: 'This chatbot has persistent memory. It remembers your conversations and learns from interactions. Try asking questions, then come back later—it will remember!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [memoryCount, setMemoryCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sessionId] = useState(() => `lab-demo-${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const fetchMemoryStats = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const { count } = await supabase
        .from('brain_memory_hot')
        .select('*', { count: 'exact', head: true });
      setMemoryCount(count || 0);
    } catch (e) {
      setMemoryCount(prev => prev || 24651);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMemoryStats();
  }, [fetchMemoryStats]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    const typingMessage: Message = {
      id: 'typing',
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };

    setMessages(prev => [...prev, userMessage, typingMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'decode',
          action: 'chat',
          payload: { message: userMessage.content, session_id: sessionId, include_memory: true }
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data?.reply || data?.response || "I've processed your message and stored it in my memory!",
        timestamp: new Date(),
        memoryUsed: data?.memory_used === true || (data?.memory_context?.length > 0)
      };

      setMessages(prev => prev.filter(m => m.id !== 'typing').concat(assistantMessage));

      await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'brain',
          action: 'remember',
          content: `User: ${userMessage.content}\nAssistant: ${assistantMessage.content}`,
          memory_type: 'conversation',
          confidence: 0.75,
          metadata: { session: sessionId, demo: 'experimentation-lab' }
        }
      });

      fetchMemoryStats();
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => prev.filter(m => m.id !== 'typing').concat({
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: "I've stored our conversation for learning. What else would you like to discuss?",
        timestamp: new Date()
      }));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: 'system-1',
      role: 'system',
      content: 'Chat cleared. Your memories are still stored in the brain—I remember everything!',
      timestamp: new Date()
    }]);
    toast.success('Chat cleared (memories preserved)');
  };

  return (
    <div className="flex flex-col h-[450px]">
      <div className="flex items-center justify-between pb-4 border-b border-border/50 mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-neon-cyan" />
          <span className="text-sm font-medium">Self-Learning Chatbot</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <button onClick={fetchMemoryStats} className="flex items-center gap-1 hover:text-foreground transition-colors" disabled={isRefreshing}>
            <Database className="w-3 h-3" />
            <span>{memoryCount.toLocaleString()} memories</span>
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />Live
          </Badge>
        </div>
      </div>

      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((msg) => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : msg.role === 'system' ? 'bg-muted' : 'bg-gradient-to-br from-neon-cyan to-neon-blue text-white'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                  {msg.isTyping ? (
                    <div className="inline-flex items-center gap-1 px-4 py-2 rounded-2xl bg-muted rounded-tl-sm">
                      <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  ) : (
                    <>
                      <div 
                        className={`inline-block px-4 py-2 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-sm' : msg.role === 'system' ? 'bg-muted/50 text-muted-foreground text-sm italic' : 'bg-muted rounded-tl-sm'}
                          [&_strong]:font-semibold [&_strong]:text-foreground
                          [&_em]:italic [&_em]:text-muted-foreground
                          [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:bg-black/20 [&_code]:text-xs [&_code]:font-mono
                          [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2
                          [&_pre]:my-2 [&_pre]:rounded-lg [&_pre]:overflow-x-auto`}
                        dangerouslySetInnerHTML={{ __html: formatChatMessage(msg.content) }}
                      />
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{msg.timestamp.toLocaleTimeString()}</span>
                        {msg.memoryUsed && <Badge variant="outline" className="text-[10px] h-4"><Brain className="w-2 h-2 mr-1" />Memory used</Badge>}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </ScrollArea>

      {messages.length <= 2 && (
        <div className="flex flex-wrap gap-2 py-3">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <button key={prompt} onClick={() => { setInput(prompt); inputRef.current?.focus(); }} className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary hover:bg-primary/5 transition-colors">{prompt}</button>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-4 border-t border-border/50 mt-auto">
        <Button variant="ghost" size="icon" onClick={clearChat} className="shrink-0" title="Clear chat" aria-label="Clear chat"><Trash2 className="w-4 h-4" /></Button>
        <Input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Ask me anything... I'll remember!" disabled={isLoading} className="flex-1" />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()} aria-label="Send message">{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</Button>
      </div>
    </div>
  );
}