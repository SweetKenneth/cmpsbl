/**
 * CMPSBL® DECODE — The Interpreter Primitive
 * Human-Compatible Cognitive Interface
 * 
 * Mobile-first conversation interface
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, RefreshCw } from "lucide-react";
import { DecodeMarkdown } from "@/components/decode/DecodeMarkdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { decode, substrate } from "@/lib/substrate";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";
import { PublicNav } from "@/components/PublicNav";

interface Message {
  role: 'user' | 'interpreter' | 'system';
  content: string;
  timestamp?: Date;
  metadata?: {
    provider?: string;
    processing_time?: number;
    module?: string;
  };
}

interface ConnectionState {
  status: 'connected' | 'degraded' | 'disconnected';
  lastSuccess: number | null;
  retryCount: number;
}

// Sample prompts — examples of what DECODE can interpret
const SAMPLE_PROMPTS = [
  "What can the substrate do for my project?",
  "Explain how BRAIN memory works",
  "How do I integrate with NEXUS providers?",
  "What security features does DEFENSE offer?",
  "Help me understand intent extraction",
];

export default function Decode() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [epistemicPrompt, setEpistemicPrompt] = useState("");
  // Removed showMobileMenu state - using PublicNav
  const [connection, setConnection] = useState<ConnectionState>({
    status: 'connected',
    lastSuccess: null,
    retryCount: 0
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize with epistemic welcome
  useEffect(() => {
    const initialMessage = sessionStorage.getItem('decode_initial_message');
    const initialResponse = sessionStorage.getItem('decode_initial_response');
    
    if (initialMessage && initialResponse) {
      try {
        const response = JSON.parse(initialResponse);
        setMessages([
          { role: 'user', content: initialMessage, timestamp: new Date() },
          { 
            role: 'interpreter', 
            content: response.reply || "Intent processed. Ready for next input.", 
            timestamp: new Date(),
            metadata: { provider: response.provider, module: 'decode' }
          }
        ]);
        sessionStorage.removeItem('decode_initial_message');
        sessionStorage.removeItem('decode_initial_response');
      } catch (e) {
        initializeFresh();
      }
    } else {
      initializeFresh();
    }

    setEpistemicPrompt(SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)]);
  }, []);

  const initializeFresh = () => {
    setMessages([{
      role: 'system',
      content: "DECODE ready. I parse natural language into structured intents and route them to the appropriate substrate execution surfaces. What would you like to do?",
      timestamp: new Date()
    }]);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Use requestAnimationFrame to batch layout reads/writes and avoid forced reflow
    requestAnimationFrame(() => {
      textarea.style.height = 'auto';
      requestAnimationFrame(() => {
        textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
      });
    });
  }, [input]);

  const attemptRecovery = useCallback(async () => {
    if (connection.retryCount >= 3) {
      setConnection(prev => ({ ...prev, status: 'disconnected' }));
      return;
    }

    try {
      const response = await substrate.invoke({ module: 'decode', action: 'status' });
      if (response.success) {
        setConnection({ status: 'connected', lastSuccess: Date.now(), retryCount: 0 });
        toast.success('Connection restored');
      }
    } catch (e) {
      setConnection(prev => ({
        ...prev,
        retryCount: prev.retryCount + 1,
        status: 'degraded'
      }));
    }
  }, [connection.retryCount]);

  const interpret = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || isProcessing) return;

    setInput('');
    const newUserMessage: Message = { 
      role: 'user', 
      content: userMessage, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsProcessing(true);

    try {
      const startTime = Date.now();
      const response = await decode.chat(userMessage, `interpret_${Date.now()}`);

      if (!response.success) throw new Error(response.error || 'Interpretation failed');

      const data = response.data as any;
      const processingTime = Date.now() - startTime;

      setConnection({ status: 'connected', lastSuccess: Date.now(), retryCount: 0 });

      setMessages(prev => [...prev, {
        role: 'interpreter',
        content: data?.reply || 'Request processed.',
        timestamp: new Date(),
        metadata: {
          provider: data?.provider,
          processing_time: processingTime,
          module: 'decode'
        }
      }]);

    } catch (error: any) {
      console.error('Interpretation error:', error);
      
      setConnection(prev => ({
        status: 'degraded',
        lastSuccess: prev.lastSuccess,
        retryCount: prev.retryCount + 1
      }));

      setMessages(prev => [...prev, {
        role: 'interpreter',
        content: 'Connection interrupted. Attempting recovery...',
        timestamp: new Date(),
        metadata: { module: 'fallback' }
      }]);

      retryTimeoutRef.current = setTimeout(attemptRecovery, 3000);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      interpret();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="Decode — AI Interpreter & Structured Cognition | CMPSBL®"
        description="Decode translates natural language into substrate-structured cognition. The interpreter primitive powering CMPSBL's layered AI operating system."
        keywords={['AI interpreter', 'natural language processing', 'structured cognition', 'CMPSBL Decode', 'prompt interpretation']}
      />
      
      {/* Consistent Navigation */}
      <PublicNav />

      {/* Ambient Background - Lighter for mobile performance */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/5" />
        <div className="absolute top-1/3 left-1/4 w-48 md:w-96 h-48 md:h-96 rounded-full bg-primary/[0.03] blur-[60px] md:blur-[100px] animate-hero-orb-1" />
      </div>

      {/* Connection Status Bar */}
      <div className="relative z-10 border-b border-border/30 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Decode Interpreter</span>
            <div className={`w-1.5 h-1.5 rounded-full ${
              connection.status === 'connected' ? 'bg-[hsl(var(--system-green))]' :
              connection.status === 'degraded' ? 'bg-[hsl(var(--system-amber))] animate-pulse' :
              'bg-destructive'
            }`} />
            <span className="text-xs text-muted-foreground">
              {connection.status === 'connected' ? 'Active' : 
               connection.status === 'degraded' ? 'Reconnecting...' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Area - Full height with proper scroll */}
      <div className="relative z-10 flex-1 overflow-y-auto overscroll-contain">
        <div className="px-3 md:px-6 py-4 md:py-8 max-w-3xl mx-auto">
          <div className="space-y-4 md:space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[88%] md:max-w-[80%] rounded-2xl px-3.5 py-2.5 md:px-5 md:py-4 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : msg.role === 'system'
                      ? 'bg-transparent text-muted-foreground italic text-center w-full'
                      : 'bg-card/60 backdrop-blur text-foreground border border-border/30'
                  }`}
                >
                  <DecodeMarkdown content={msg.content} isUser={msg.role === 'user'} className="text-sm md:text-[15px]" />
                  
                  {msg.metadata?.processing_time && msg.role === 'interpreter' && (
                    <div className="flex items-center gap-2 mt-1.5 md:mt-2">
                      <span className="text-[10px] text-muted-foreground/50">
                        {msg.metadata.processing_time}ms
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-card/60 backdrop-blur rounded-2xl px-3.5 py-2.5 md:px-5 md:py-4 border border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Processing intent</span>
                    <div className="flex gap-1">
                      <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary/40 rounded-full animate-bounce" />
                      <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1 h-1 md:w-1.5 md:h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area - Fixed at bottom, mobile optimized */}
      <div className="sticky bottom-0 z-20 border-t border-border/30 bg-background/95 backdrop-blur-lg" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="px-3 md:px-6 py-2.5 md:py-4 max-w-3xl mx-auto">
          {messages.length <= 1 && !input && (
            <button
              onClick={() => setInput(epistemicPrompt)}
              className="w-full text-left text-xs md:text-sm text-muted-foreground/50 hover:text-muted-foreground mb-2 md:mb-3 transition-colors truncate"
            >
              <span className="italic">Try: "{epistemicPrompt}"</span>
            </button>
          )}

          <div className="flex items-end gap-2 md:gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Share a thought..."
              className="flex-1 min-h-[40px] md:min-h-[44px] max-h-[120px] resize-none border-border/30 bg-card/40 backdrop-blur focus-visible:ring-primary/30 text-base rounded-xl"
              disabled={isProcessing || connection.status === 'disconnected'}
              rows={1}
              autoComplete="off"
            />
            
            <Button
              onClick={() => interpret()}
              disabled={!input.trim() || isProcessing || connection.status === 'disconnected'}
              size="icon"
              className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-primary hover:bg-primary/90 shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {connection.status === 'disconnected' && (
            <div className="flex items-center gap-2 mt-2 text-xs text-destructive">
              <span>Connection lost.</span>
              <button 
                onClick={attemptRecovery}
                className="flex items-center gap-1 underline"
              >
                <RefreshCw className="w-3 h-3" /> Reconnect
              </button>
            </div>
          )}
        </div>

        {/* Footer Attribution - Hidden on small screens */}
        <div className="hidden md:block px-6 py-2 border-t border-border/20">
          <p className="text-[10px] text-center text-muted-foreground/40">
            Decode is an interpreter primitive • CMPSBL®
          </p>
        </div>
      </div>
    </div>
  );
}
