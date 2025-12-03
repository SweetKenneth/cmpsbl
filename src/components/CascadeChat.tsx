import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  generatedText?: string;
}

export function CascadeChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '✨ Hello! I\'m Cascade AI.\n\nHow can I help you discover the perfect PromptFluid solution today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'customer_service' | 'admin'>('customer_service');
  const [showMenu, setShowMenu] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || isLoading) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setShowMenu(false);

    try {
      const { data, error } = await supabase.functions.invoke('pf-cascade-chat', {
        body: {
          message: userMessage,
          userEmail: user?.email || 'anonymous',
          conversationHistory: messages
        }
      });

      if (error) throw error;

      if (data.mode) {
        setMode(data.mode);
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.reply,
        imageUrl: data.imageUrl,
        generatedText: data.generatedText
      }]);

      if (data.isAdmin) {
        toast.success('Admin mode activated', {
          description: 'Cascade recognizes you, Kenneth.'
        });
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      toast.error('Failed to send message', {
        description: error.message || 'Please try again'
      });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I apologize, but I encountered an error. Please try again.' 
      }]);
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
      title: "See Capabilities",
      description: "Explore what I can do",
      prompt: "What are all the things you can help me with?"
    }
  ];

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-glow-lg z-50 bg-gradient-to-r from-primary via-primary-variant to-accent hover:scale-110 transition-transform"
        size="icon"
      >
        <MessageCircle className="w-6 h-6" />
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
            <h3 className="font-semibold">Cascade AI</h3>
            <p className="text-xs text-muted-foreground">
              {mode === 'admin' ? 'Admin Mode' : 'Customer Service'}
            </p>
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
            placeholder="Ask Cascade anything..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="bg-gradient-to-r from-primary to-primary-variant"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}