/**
 * promptfluid® Decode — The Interpreter Primitive
 * v2026.01 — Human-Compatible Cognitive Interface
 * 
 * Mobile-first conversation interface
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Send, RefreshCw, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { decode, substrate } from "@/lib/substrate";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";

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

// Epistemic prompts — questions that open doors
const EPISTEMIC_PROMPTS = [
  "What patterns repeat in the noise?",
  "What exists in the space between thoughts?",
  "How does forgetting serve understanding?",
  "What do you observe when the light changes?",
  "Where do questions come from?",
];

export default function Decode() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [epistemicPrompt, setEpistemicPrompt] = useState("");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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
            content: response.reply || "Interpretation received. Patterns forming.", 
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

    setEpistemicPrompt(EPISTEMIC_PROMPTS[Math.floor(Math.random() * EPISTEMIC_PROMPTS.length)]);
  }, []);

  const initializeFresh = () => {
    const hour = new Date().getHours();
    let welcome = "The interpreter is active. Share a thought.";
    
    if (hour >= 22 || hour < 5) {
      welcome = "Night mode. What surfaces for you?";
    } else if (hour >= 5 && hour < 9) {
      welcome = "Morning patterns. What emerges?";
    } else if (hour >= 17 && hour < 22) {
      welcome = "Evening. What lingers?";
    }
    
    setMessages([{
      role: 'system',
      content: welcome,
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
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
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
        content: data?.reply || 'Pattern received.',
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
        content: 'A moment... recalibrating.',
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

  const navLinks = [
    { label: 'Demo', path: '/demo' },
    { label: 'Proof', path: '/proof' },
    { label: 'Substrate', path: '/substrate' },
    { label: 'Dream', path: '/feed-dream-eater' },
    { label: 'Blog', path: '/blog' },
    { label: 'About', path: '/about' },
  ];

  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      <SEO 
        title="Decode — Interpreter Primitive | promptfluid®"
        description="Decode is the substrate's interpreter primitive. It translates human ambiguity into substrate-structured cognition."
      />

      {/* Ambient Background - Lighter for mobile performance */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-violet-950/5" />
        <div className="absolute top-1/3 left-1/4 w-48 md:w-96 h-48 md:h-96 rounded-full bg-primary/3 blur-[60px] md:blur-[100px] animate-float" />
      </div>

      {/* Header - Mobile optimized with hamburger */}
      <header className="relative z-20 border-b border-border/30 bg-background/90 backdrop-blur-lg safe-area-inset-top">
        <div className="flex items-center justify-between px-3 md:px-6 py-2.5 md:py-3">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="h-8 w-8 md:h-9 md:w-9 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="font-medium text-sm md:text-base">Decode</span>
              <div className={`w-1.5 h-1.5 rounded-full ${
                connection.status === 'connected' ? 'bg-emerald-500' :
                connection.status === 'degraded' ? 'bg-amber-500 animate-pulse' :
                'bg-destructive'
              }`} />
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4">
            {navLinks.map((item) => (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="h-8 w-8 md:hidden text-muted-foreground"
          >
            {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>

        {/* Mobile dropdown menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-border/20 bg-background/95 backdrop-blur-lg">
            <nav className="flex flex-col py-2">
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    navigate(item.path);
                    setShowMobileMenu(false);
                  }}
                  className="px-4 py-3 text-left text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
        )}
      </header>

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
                  <p className="text-sm md:text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  
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
                    <span className="text-xs text-muted-foreground">Thinking</span>
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

      {/* Input Area - Mobile optimized with safe area */}
      <div className="relative z-20 border-t border-border/30 bg-background/90 backdrop-blur-lg safe-area-inset-bottom">
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
              className="flex-1 min-h-[40px] md:min-h-[44px] max-h-[120px] resize-none border-border/30 bg-card/40 backdrop-blur focus-visible:ring-primary/30 text-sm md:text-base rounded-xl"
              disabled={isProcessing || connection.status === 'disconnected'}
              rows={1}
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
            Decode is an interpreter primitive • promptfluid® v2026.01
          </p>
        </div>
      </div>
    </div>
  );
}
