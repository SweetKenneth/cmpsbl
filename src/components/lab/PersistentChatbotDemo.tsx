/**
 * PersistentChatbotDemo — Live chatbot with persistent memory
 */

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Send, Bot, User, Brain, Loader2, Sparkles, Clock, Database } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  memoryUsed?: boolean;
}

export function PersistentChatbotDemo() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'This chatbot has persistent memory. It remembers your conversations and learns from interactions. Try asking questions, then come back later—it will remember!',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [memoryCount, setMemoryCount] = useState(0);
  const [sessionId] = useState(() => `lab-demo-${Date.now()}`);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Fetch memory stats
  useEffect(() => {
    fetchMemoryStats();
  }, []);

  const fetchMemoryStats = async () => {
    try {
      const { count } = await supabase
        .from('brain_memory_hot')
        .select('*', { count: 'exact', head: true });
      setMemoryCount(count || 0);
    } catch (e) {
      // Ignore errors
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the substrate for a response with memory context
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'decode',
          action: 'chat',
          payload: {
            message: userMessage.content,
            session_id: sessionId,
            include_memory: true
          }
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: 'assistant',
        content: data?.reply || data?.response || 'I processed your message and stored it in memory.',
        timestamp: new Date(),
        memoryUsed: data?.memory_context?.length > 0
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Store this interaction in brain memory
      await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'brain',
          action: 'learn',
          payload: {
            content: `User: ${userMessage.content}\nAssistant: ${assistantMessage.content}`,
            memory_type: 'conversation',
            context: { session: sessionId, demo: 'experimentation-lab' }
          }
        }
      });

      fetchMemoryStats();
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I encountered an issue processing your message, but I\'ve still stored our conversation for learning.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[450px]">
      {/* Header Stats */}
      <div className="flex items-center justify-between pb-4 border-b border-border/50 mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-500" />
          <span className="text-sm font-medium">Self-Learning Chatbot</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3" />
            <span>{memoryCount.toLocaleString()} memories</span>
          </div>
          <Badge variant="outline" className="text-xs">
            <Sparkles className="w-3 h-3 mr-1" />
            Live
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : msg.role === 'system'
                  ? 'bg-muted'
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white'
              }`}>
                {msg.role === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                <div className={`inline-block px-4 py-2 rounded-2xl ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-sm'
                    : msg.role === 'system'
                    ? 'bg-muted/50 text-muted-foreground text-sm italic'
                    : 'bg-muted rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{msg.timestamp.toLocaleTimeString()}</span>
                  {msg.memoryUsed && (
                    <Badge variant="outline" className="text-[10px] h-4">
                      <Brain className="w-2 h-2 mr-1" />
                      Memory used
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-muted px-4 py-2 rounded-2xl rounded-tl-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="flex gap-2 pt-4 border-t border-border/50 mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask me anything... I'll remember!"
          disabled={isLoading}
          className="flex-1"
        />
        <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
