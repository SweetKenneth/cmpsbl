/**
 * promptfluid® Decode Chat
 * v2026.01 — User-facing cognitive interface to the substrate
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, RefreshCw, WifiOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { decode, substrate } from "@/lib/substrate";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  generatedText?: string;
  provider?: string;
  healthScore?: number;
}

interface ConnectionState {
  status: 'connected' | 'degraded' | 'disconnected';
  lastSuccess: number | null;
  retryCount: number;
}

export function DecodeChat() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '✨ Hello! I\'m Decode — the cognitive interface of the promptfluid® substrate.\n\nHow can I help you explore cognitive orchestration today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'customer_service' | 'admin'>('customer_service');
  const [showMenu, setShowMenu] = useState(true);
  const [connection, setConnection] = useState<ConnectionState>({
    status: 'connected',
    lastSuccess: null,
    retryCount: 0
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();

  // Hide on homepage and decode page - these have their own UI
  const hiddenPaths = ['/', '/decode'];
  const shouldHide = hiddenPaths.includes(location.pathname);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cleanup retry timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Return null AFTER all hooks have been called
  if (shouldHide) {
    return null;
  }

  // Self-healing connection recovery
  const attemptRecovery = useCallback(async () => {
    if (connection.retryCount >= 3) {
      setConnection(prev => ({ ...prev, status: 'disconnected' }));
      toast.error('Connection issues', {
        description: 'Unable to reach Decode. Please try again later.'
      });
      return;
    }

    console.log(`🔄 Attempting connection recovery (attempt ${connection.retryCount + 1})...`);
    
    try {
      // Use substrate client for health check
      const response = await substrate.invoke({ module: 'decode', action: 'status' });

      if (response.success) {
        setConnection({
          status: 'connected',
          lastSuccess: Date.now(),
          retryCount: 0
        });
        toast.success('Connection restored', {
          description: 'Decode is back online.'
        });
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
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setShowMenu(false);

    try {
      // Use the substrate client directly
      const response = await decode.chat(userMessage, `session_${Date.now()}`);

      if (!response.success) throw new Error(response.error || 'Chat failed');

      const data = response.data as any;

      // Update connection state on success
      setConnection({
        status: 'connected',
        lastSuccess: Date.now(),
        retryCount: 0
      });

      if (data?.mode) {
        setMode(data.mode);
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data?.reply || 'I received your message.',
        imageUrl: data?.imageUrl,
        generatedText: data?.generatedText,
        provider: data?.provider,
        healthScore: data?.healthScore
      }]);

      if (data?.isAdmin) {
        toast.success('Admin mode activated', {
          description: 'Decode recognizes you.'
        });
      }

      // Show provider info for admins
      if (data?.provider && mode === 'admin') {
        console.log(`📡 Response via ${data.provider} (health: ${data.healthScore}%)`);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Update connection state and attempt recovery
      setConnection(prev => ({
        status: 'degraded',
        lastSuccess: prev.lastSuccess,
        retryCount: prev.retryCount + 1
      }));

      // Show graceful error with retry option
      toast.error('Message delivery issue', {
        description: 'Decode is gathering thoughts. Retrying...',
        action: {
          label: 'Retry Now',
          onClick: () => sendMessage(userMessage)
        }
      });

      // Add graceful fallback message
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '🌙 I\'m experiencing a brief moment of reflection. Let me try again...',
        provider: 'fallback'
      }]);

      // Schedule automatic retry
      retryTimeoutRef.current = setTimeout(() => {
        attemptRecovery();
      }, 3000);

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

  const quickActions = [
    {
      icon: "🎨",
      title: "Generate Image",
      description: "Create AI-powered visuals",
      prompt: "Generate a futuristic PromptFluid logo with fluid, flowing elements"
    },
    {
      icon: "✍️",
      title: "Write Content",
      description: "Create marketing copy",
      prompt: "Write compelling marketing copy for PromptFluid's AI security platform"
    },
    {
      icon: "🧠",
      title: "Brain Analytics",
      description: "View learning patterns",
      prompt: "Show me analytics about the Brain's recent learning activity"
    },
    {
      icon: "🎯",
      title: "See Products",
      description: "Explore what we ship",
      prompt: "Tell me about RCKBL, PTCHBL, RNDRBL, SPLCBL, and XCTBL Space"
    }
  ];

  // Connection status indicator
  const ConnectionIndicator = () => {
    const colors = {
      connected: 'bg-[hsl(var(--system-green))]',
      degraded: 'bg-[hsl(var(--system-amber))]',
      disconnected: 'bg-destructive'
    };

    return (
      <div className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${colors[connection.status]} ${connection.status === 'degraded' ? 'animate-pulse' : ''}`} />
        {connection.status === 'disconnected' && (
          <Button
            variant="ghost"
            size="icon"
            className="w-6 h-6"
            onClick={attemptRecovery}
          >
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-glow-lg z-50 bg-gradient-to-r from-primary via-primary-variant to-accent hover:scale-110 transition-transform"
        size="icon"
        aria-label="Open Decode AI chat"
      >
        <MessageCircle className="w-6 h-6" />
        {connection.status !== 'connected' && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[hsl(var(--system-amber))] rounded-full animate-pulse" />
        )}
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] glass border border-primary/30 rounded-2xl shadow-glow-lg z-50 flex flex-col overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 via-primary-variant/10 to-accent/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">Decode</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">substrate</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                promptfluid® cognitive interface
              </p>
              <ConnectionIndicator />
            </div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="hover:bg-destructive/10"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-inter">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-5 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground shadow-glow'
                  : msg.provider === 'fallback' 
                    ? 'bg-muted/60 text-foreground/70 border border-border/50'
                    : 'bg-muted/80 text-foreground backdrop-blur-sm'
              }`}
            >
              {msg.imageUrl && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <img 
                    src={msg.imageUrl} 
                    alt="Generated" 
                    className="w-full h-auto"
                  />
                </div>
              )}
              {msg.generatedText && (
                <div className="mb-3 p-3 bg-background/50 rounded-lg border border-border/50">
                  <p className="text-sm text-muted-foreground mb-1">Generated Content:</p>
                  <p className="text-[1.05rem] leading-relaxed">{msg.generatedText}</p>
                </div>
              )}
              <p className="text-[1.05rem] leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {/* Admin: show provider badge */}
              {mode === 'admin' && msg.provider && msg.provider !== 'fallback' && (
                <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className="px-1.5 py-0.5 rounded bg-primary/10">{msg.provider}</span>
                  {msg.healthScore && (
                    <span className="px-1.5 py-0.5 rounded bg-[hsl(var(--system-green))]/10">
                      {msg.healthScore}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Quick Actions Menu */}
        {showMenu && messages.length === 1 && !isLoading && (
          <div className="grid grid-cols-2 gap-2 px-2 animate-fade-in">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  sendMessage(action.prompt);
                }}
                className="flex flex-col items-start p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-all hover:scale-105 text-left group"
              >
                <span className="text-2xl mb-1">{action.icon}</span>
                <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
                  {action.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {action.description}
                </p>
              </button>
            ))}
          </div>
        )}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask Decode anything..."
            className="flex-1"
            disabled={isLoading || connection.status === 'disconnected'}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading || connection.status === 'disconnected'}
            size="icon"
            className="bg-gradient-to-r from-primary to-primary-variant"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        {connection.status === 'disconnected' && (
          <p className="text-xs text-destructive mt-2 flex items-center gap-1">
            <WifiOff className="w-3 h-3" />
            Connection lost. Click retry to reconnect.
          </p>
        )}
      </div>
    </div>
  );
}