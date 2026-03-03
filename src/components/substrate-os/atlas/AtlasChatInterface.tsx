/**
 * Atlas Chat Interface
 * Conversational control for the substrate
 * 
 * Natural language interface for controlling SEBA, viewing logs,
 * running cycles, and managing the entire substrate.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, MessageSquare, Bot, User, Loader2, Sparkles,
  ChevronUp, ChevronDown, X, Terminal, Compass
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatChatMessage } from '@/lib/ui/formatChatMessage';
import { atlasInterpreter, type CommandResult } from '@/lib/atlas/command-interpreter';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  data?: unknown;
  suggestions?: string[];
}

interface AtlasChatInterfaceProps {
  className?: string;
  compact?: boolean;
}

export function AtlasChatInterface({ className, compact = false }: AtlasChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'system',
      content: "Atlas Control ready. Try: \"activate SEBA\", \"show status\", or \"help\" for commands.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!compact);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Handle message send
  const sendMessage = useCallback(async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsProcessing(true);

    try {
      // Parse command
      const parsed = atlasInterpreter.parse(userMessage.content);
      
      // Execute command
      const result: CommandResult = await atlasInterpreter.execute(parsed);

      // Handle clear session
      if (result.data && typeof result.data === 'object' && 'action' in result.data && result.data.action === 'clear_session') {
        setMessages([{
          id: 'welcome',
          role: 'system',
          content: "Session cleared. Atlas Command ready. Try: \"activate SEBA\", \"show status\", or \"help\" for commands.",
          timestamp: new Date(),
        }]);
        setIsProcessing(false);
        return;
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: result.message,
        timestamp: new Date(),
        data: result.data,
        suggestions: result.suggestions,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Something went wrong processing that command. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  }, [input, isProcessing]);

  // Handle suggestion click
  const handleSuggestion = (suggestion: string) => {
    setInput(suggestion);
    inputRef.current?.focus();
  };

  // Handle key press
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Quick commands
  const quickCommands = [
    { label: 'Status', command: 'show status' },
    { label: 'Usage', command: 'check usage' },
    { label: 'SEBA On', command: 'activate SEBA' },
    { label: 'Run Cycle', command: 'run evolution cycle' },
    { label: 'Health', command: 'health check' },
    { label: 'Help', command: 'help' },
  ];

  if (compact && !isExpanded) {
    return (
      <motion.button
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={() => setIsExpanded(true)}
        className={cn(
          "fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50",
          "w-14 h-14 rounded-full",
          "bg-gradient-to-br from-cyan-600 via-primary to-purple-600",
          "flex items-center justify-center",
          "shadow-xl shadow-primary/30",
          "border-2 border-primary/50",
          "hover:scale-105 transition-transform",
          className
        )}
      >
        <Compass className="w-6 h-6 text-white" />
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-cyan-400/50"
          animate={{ scale: [1, 1.3, 1.3], opacity: [0.6, 0, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={cn(
        compact 
          ? "fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-[calc(100%-2rem)] max-w-md"
          : "w-full",
        "flex flex-col",
        "bg-card/95 backdrop-blur-xl",
        "border border-cyan-500/30 rounded-2xl",
        "shadow-2xl shadow-primary/20",
        "overflow-hidden",
        className
      )}
      style={{ maxHeight: compact ? '70vh' : '600px', height: compact ? 'auto' : '600px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center border border-cyan-400/40">
            <Compass className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold flex items-center gap-2">
              Atlas Command
              <Badge className="text-[9px] bg-emerald-500/20 text-emerald-300 border-emerald-400/40">
                LIVE
              </Badge>
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono">Conversational substrate control</p>
          </div>
        </div>
        {compact && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setIsExpanded(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <div 
        className="flex-1 overflow-y-auto p-4 min-h-0" 
        ref={scrollRef}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {messages.map((msg, index) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: index * 0.02 }}
                className={cn(
                  "flex gap-3",
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                )}
              >
                {/* Avatar */}
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  msg.role === 'user' 
                    ? "bg-primary/20 border border-primary/40"
                    : msg.role === 'system'
                    ? "bg-amber-500/20 border border-amber-400/40"
                    : "bg-cyan-500/20 border border-cyan-400/40"
                )}>
                  {msg.role === 'user' ? (
                    <User className="w-4 h-4 text-primary" />
                  ) : msg.role === 'system' ? (
                    <Terminal className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Bot className="w-4 h-4 text-cyan-400" />
                  )}
                </div>

                {/* Content */}
                <div className={cn(
                  "flex-1 max-w-[85%]",
                  msg.role === 'user' ? 'text-right' : 'text-left'
                )}>
                  <div className={cn(
                    "inline-block px-4 py-3 rounded-2xl text-sm",
                    msg.role === 'user'
                      ? "bg-primary/20 border border-primary/30 text-foreground"
                      : msg.role === 'system'
                      ? "bg-amber-500/10 border border-amber-400/30 text-foreground/90"
                      : "bg-muted/50 border border-border/50 text-foreground/90"
                  )}>
                    <div 
                      className="whitespace-pre-wrap leading-relaxed 
                        [&_strong]:text-cyan-300 [&_strong]:font-semibold
                        [&_em]:text-muted-foreground [&_a]:text-primary"
                      dangerouslySetInnerHTML={{ __html: formatChatMessage(msg.content) }}
                    />
                  </div>

                  {/* Suggestions */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestion(suggestion)}
                          className="px-2.5 py-1 text-[11px] rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/25 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">
                    {msg.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Processing indicator */}
          {isProcessing && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
                <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-muted/50 border border-border/50">
                <span className="text-sm text-muted-foreground">Processing...</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Quick Commands */}
      <div className="px-4 py-2 border-t border-border/30 bg-muted/30">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {quickCommands.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => handleSuggestion(cmd.command)}
              className="flex-shrink-0 px-3 py-1.5 text-[11px] font-medium rounded-lg bg-background/60 border border-border/50 text-muted-foreground hover:text-foreground hover:border-cyan-400/50 transition-colors"
            >
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input — elevated z-index to stay above DECODE floating icon */}
      <div className="p-3 border-t border-border/50 bg-background/50 relative z-50">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Atlas anything..."
              rows={1}
              className={cn(
                "w-full px-4 py-3 pr-14",
                "bg-muted/50 border border-border/50 rounded-xl",
                "text-sm placeholder:text-muted-foreground/60",
                "focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50",
                "resize-none",
                "transition-all"
              )}
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <Button
              size="icon"
              disabled={!input.trim() || isProcessing}
              onClick={sendMessage}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg z-50",
                "bg-gradient-to-r from-cyan-600 to-primary",
                "hover:from-cyan-500 hover:to-primary/90",
                "disabled:opacity-40"
              )}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
