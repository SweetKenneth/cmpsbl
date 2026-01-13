/**
 * promptfluid® Decode — The Interpreter Primitive
 * v2026.01 — Human-Compatible Cognitive Interface
 * 
 * Decode is NOT a chatbot, persona, agent, or assistant.
 * Decode is a protocol surface that translates between human 
 * language and substrate-structured cognition.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Send, Sparkles, RefreshCw, Brain, Shield, Eye, Layers, Activity } from "lucide-react";
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
    let welcome = "⟨ The interpreter surface is active. Share a thought, question, or observation. ⟩";
    
    if (hour >= 22 || hour < 5) {
      welcome = "⟨ Night mode. The substrate processes differently in the dark. What surfaces for you? ⟩";
    } else if (hour >= 5 && hour < 9) {
      welcome = "⟨ Morning patterns. Fresh connections form. What emerges? ⟩";
    } else if (hour >= 17 && hour < 22) {
      welcome = "⟨ Evening. The space between day and night. What lingers? ⟩";
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
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
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
        toast.success('Substrate connection restored');
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

      // Wrap in epistemic markers
      const interpretedContent = `⟨ ${data?.reply || 'Pattern received.'} ⟩`;

      setMessages(prev => [...prev, {
        role: 'interpreter',
        content: interpretedContent,
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
        content: '⟨ A moment... the pattern shifted. Recalibrating. ⟩',
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

  const substrateLinks = [
    { label: 'Brain', description: 'Memory substrate', icon: Brain, path: '/brain-hub' },
    { label: 'Defense', description: 'Security layer', icon: Shield, path: '/bot-sniper' },
    { label: 'Vision', description: 'Observability', icon: Eye, path: '/admin/dashboard' },
    { label: 'Substrate', description: 'Full view', icon: Layers, path: '/substrate' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <SEO 
        title="Decode — Interpreter Primitive | promptfluid®"
        description="Decode is the substrate's interpreter primitive. It translates human ambiguity into substrate-structured cognition without asserting facts, agency, or execution authority."
      />

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-violet-950/10" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 rounded-full bg-primary/3 blur-[100px] animate-float" />
        <div 
          className="absolute bottom-1/3 right-1/4 w-72 h-72 rounded-full bg-violet-500/3 blur-[80px] animate-float" 
          style={{ animationDelay: '3s' }} 
        />
      </div>

      {/* Header */}
      <header className="relative z-20 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-medium">Decode</span>
              <span className="text-[10px] text-muted-foreground/50 hidden sm:inline">
                Interpreter Primitive
              </span>
              <div className={`w-1.5 h-1.5 rounded-full ml-2 ${
                connection.status === 'connected' ? 'bg-emerald-500' :
                connection.status === 'degraded' ? 'bg-amber-500 animate-pulse' :
                'bg-destructive'
              }`} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {substrateLinks.map((item) => (
              <Button
                key={item.label}
                variant="ghost"
                size="sm"
                onClick={() => navigate(item.path)}
                className="text-muted-foreground hover:text-foreground hidden md:flex gap-1"
              >
                <item.icon className="w-3 h-3" />
                <span className="text-xs">{item.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Contract Indicator */}
      <div className="relative z-10 border-b border-border/20 bg-muted/30 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-4 text-[10px] text-muted-foreground/60">
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Epistemic Layer Active
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">No Identity Claims</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">No Agency Claims</span>
          <span className="hidden sm:inline">•</span>
          <span className="hidden sm:inline">Routing Authority Only</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="relative z-10 flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8 max-w-3xl">
          <div className="space-y-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : msg.role === 'system'
                      ? 'bg-transparent text-muted-foreground italic'
                      : 'bg-card/60 backdrop-blur text-foreground border border-border/30'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  
                  {msg.metadata?.processing_time && msg.role === 'interpreter' && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] text-muted-foreground/50">
                        {msg.metadata.processing_time}ms
                      </span>
                      {msg.metadata.provider && (
                        <span className="text-[10px] text-muted-foreground/30">
                          via {msg.metadata.provider}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isProcessing && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-card/60 backdrop-blur rounded-2xl px-5 py-4 border border-border/30">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Interpreting</span>
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="relative z-20 border-t border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4 max-w-3xl">
          {messages.length <= 1 && !input && (
            <button
              onClick={() => setInput(epistemicPrompt)}
              className="w-full text-left text-sm text-muted-foreground/50 hover:text-muted-foreground mb-3 transition-colors"
            >
              <span className="italic">Try: "{epistemicPrompt}"</span>
            </button>
          )}

          <div className="flex items-end gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Share a thought, question, or observation..."
              className="flex-1 min-h-[44px] max-h-[200px] resize-none border-border/30 bg-card/40 backdrop-blur focus-visible:ring-primary/30"
              disabled={isProcessing || connection.status === 'disconnected'}
              rows={1}
            />
            
            <Button
              onClick={() => interpret()}
              disabled={!input.trim() || isProcessing || connection.status === 'disconnected'}
              size="icon"
              className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {connection.status === 'disconnected' && (
            <div className="flex items-center gap-2 mt-3 text-xs text-destructive">
              <span>Substrate connection lost.</span>
              <button 
                onClick={attemptRecovery}
                className="flex items-center gap-1 underline"
              >
                <RefreshCw className="w-3 h-3" /> Reconnect
              </button>
            </div>
          )}
        </div>

        {/* Footer Attribution */}
        <div className="container mx-auto px-4 py-2 border-t border-border/20">
          <p className="text-[10px] text-center text-muted-foreground/40">
            Decode is an interpreter primitive, not an agent. Output is epistemic, not assertive.
            <span className="hidden sm:inline"> • promptfluid® Cognitive Orchestration Substrate v2026.01</span>
          </p>
        </div>
      </div>
    </div>
  );
}
