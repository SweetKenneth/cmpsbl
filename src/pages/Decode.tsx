/**
 * promptfluid® Decode — The Cognitive Interface
 * v2026.01 — A full-screen conversational experience
 * 
 * This is the primary entry point into the promptfluid ecosystem.
 * Decode is not a chatbot. It's an interface to cognitive architecture.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { ArrowLeft, Send, Sparkles, RefreshCw, Menu, X, Moon, Brain, Shield, Eye, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { decode, substrate } from "@/lib/substrate";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { toast } from "sonner";

interface Message {
  role: 'user' | 'assistant' | 'system';
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

const AMBIENT_PROMPTS = [
  "What exists in the space between thoughts?",
  "Tell me what you remember...",
  "What patterns repeat in the noise?",
  "How does forgetting serve us?",
  "What do you see when you dream?",
];

export default function Decode() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [ambientPrompt, setAmbientPrompt] = useState("");
  const [connection, setConnection] = useState<ConnectionState>({
    status: 'connected',
    lastSuccess: null,
    retryCount: 0
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial message if coming from homepage
  useEffect(() => {
    const initialMessage = sessionStorage.getItem('decode_initial_message');
    const initialResponse = sessionStorage.getItem('decode_initial_response');
    
    if (initialMessage && initialResponse) {
      try {
        const response = JSON.parse(initialResponse);
        setMessages([
          { role: 'user', content: initialMessage, timestamp: new Date() },
          { 
            role: 'assistant', 
            content: response.reply || "I hear you. Let's explore this together.", 
            timestamp: new Date(),
            metadata: { provider: response.provider }
          }
        ]);
        sessionStorage.removeItem('decode_initial_message');
        sessionStorage.removeItem('decode_initial_response');
      } catch (e) {
        // Start fresh
        setMessages([{
          role: 'system',
          content: "Welcome. I'm Decode — a cognitive interface. Share a thought, a question, or simply observe.",
          timestamp: new Date()
        }]);
      }
    } else {
      // Fresh start with ambient welcome — poetic, not corporate
      const hour = new Date().getHours();
      let welcomeMessage = "You've arrived... somewhere between question and answer. I'm listening.";
      
      if (hour >= 22 || hour < 5) {
        welcomeMessage = "The night brings different thoughts. Slower ones. What surfaces for you in the quiet?";
      } else if (hour >= 5 && hour < 9) {
        welcomeMessage = "Morning. The light changes how we see things... including ourselves. What's emerging?";
      } else if (hour >= 17 && hour < 22) {
        welcomeMessage = "Evening arrives. The space between today and tomorrow. What lingers?";
      }
      
      setMessages([{
        role: 'system',
        content: welcomeMessage,
        timestamp: new Date()
      }]);
    }

    // Set random ambient prompt
    setAmbientPrompt(AMBIENT_PROMPTS[Math.floor(Math.random() * AMBIENT_PROMPTS.length)]);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Auto-resize textarea
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

  const sendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    const newUserMessage: Message = { 
      role: 'user', 
      content: userMessage, 
      timestamp: new Date() 
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      const startTime = Date.now();
      const response = await decode.chat(userMessage, `session_${Date.now()}`);

      if (!response.success) throw new Error(response.error || 'Request failed');

      const data = response.data as any;
      const processingTime = Date.now() - startTime;

      setConnection({ status: 'connected', lastSuccess: Date.now(), retryCount: 0 });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data?.reply || 'I received your thought.',
        timestamp: new Date(),
        metadata: {
          provider: data?.provider,
          processing_time: processingTime,
          module: 'decode'
        }
      }]);

    } catch (error: any) {
      console.error('Decode error:', error);
      
      setConnection(prev => ({
        status: 'degraded',
        lastSuccess: prev.lastSuccess,
        retryCount: prev.retryCount + 1
      }));

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'A moment... something shifted. Let me find my way back to you.',
        timestamp: new Date(),
        metadata: { module: 'fallback' }
      }]);

      retryTimeoutRef.current = setTimeout(attemptRecovery, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const navigationItems = [
    { label: 'Brain', description: 'Memory & Learning', icon: Brain, path: '/brain-hub' },
    { label: 'Dreams', description: 'Feed the Dream-Eater', icon: Moon, path: '/feed-dream-eater' },
    { label: 'Defense', description: 'Protection Layer', icon: Shield, path: '/projects' },
    { label: 'Vision', description: 'Observability', icon: Eye, path: '/admin' },
    { label: 'Explore', description: 'All Modules', icon: Layers, path: '/substrate' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <SEO 
        title="Decode | promptfluid®"
        description="The cognitive interface. Ask anything, explore ideas, or simply observe the space between thoughts."
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
              <div className={`w-1.5 h-1.5 rounded-full ${
                connection.status === 'connected' ? 'bg-[hsl(var(--system-green))]' :
                connection.status === 'degraded' ? 'bg-[hsl(var(--system-amber))] animate-pulse' :
                'bg-destructive'
              }`} />
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMenu(!showMenu)}
            className="text-muted-foreground hover:text-foreground"
          >
            {showMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Navigation Drawer */}
      {showMenu && (
        <div className="relative z-30 border-b border-border/30 bg-card/80 backdrop-blur-xl animate-slide-up">
          <div className="container mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {navigationItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => { navigate(item.path); setShowMenu(false); }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/50 border border-border/30 transition-all text-left group"
                >
                  <item.icon className="w-4 h-4 text-primary/60 group-hover:text-primary transition-colors" />
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
                  
                  {msg.metadata?.processing_time && msg.role === 'assistant' && (
                    <p className="text-[10px] text-muted-foreground/50 mt-2">
                      {msg.metadata.processing_time}ms
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-card/60 backdrop-blur rounded-2xl px-5 py-4 border border-border/30">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
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
          {/* Ambient prompt suggestion */}
          {messages.length <= 1 && !input && (
            <button
              onClick={() => setInput(ambientPrompt)}
              className="w-full text-left text-sm text-muted-foreground/50 hover:text-muted-foreground mb-3 transition-colors"
            >
              <span className="italic">Try: "{ambientPrompt}"</span>
            </button>
          )}

          <div className="flex items-end gap-3">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="What's on your mind..."
              className="flex-1 min-h-[44px] max-h-[200px] resize-none border-border/30 bg-card/40 backdrop-blur focus-visible:ring-primary/30"
              disabled={isLoading || connection.status === 'disconnected'}
              rows={1}
            />
            
            <Button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading || connection.status === 'disconnected'}
              size="icon"
              className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {connection.status === 'disconnected' && (
            <div className="flex items-center gap-2 mt-3 text-xs text-destructive">
              <span>Connection lost.</span>
              <button 
                onClick={attemptRecovery}
                className="flex items-center gap-1 underline"
              >
                <RefreshCw className="w-3 h-3" /> Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
