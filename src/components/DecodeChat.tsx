/**
 * CMPSBL® DECODE Chat — Unified Conversational Interface
 * Modes: assistant | support | builder | governor
 * Single persistent conversation memory across all modes.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Sparkles, RefreshCw, WifiOff } from "lucide-react";
import { DecodeMarkdown } from "./decode/DecodeMarkdown";
import { DecodeStatusBar } from "./decode/DecodeStatusBar";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";
import { useDecodeStore, type DecodeMode } from "@/stores/decodeStore";
import { isCommand, routeCommand } from "@/lib/decode/command-router";

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

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-decode-chat`;
const SESSION_STORAGE_KEY = 'decode_chat_messages';

const MODE_GREETINGS: Record<DecodeMode, string> = {
  assistant: "Hey! 👋 I'm **DECODE** — your guide to everything CMPSBL.\n\nAsk me anything about the substrate, features, or how to get started. I'm here to help! ✨",
  support: "Hey there 🛠️ — **DECODE** here, in **support mode**.\n\nTell me what's going on and I'll help you sort it out. If I can't fix it, I'll connect you with a human at **support@cmpsbl.com**.",
  builder: "**DECODE** online — **builder mode** active 🏗️\n\nReady to help with substrate configuration, pipelines, and capability integration. What are we building?",
  governor: "**DECODE** online — **governor mode** active 👑\n\nFull substrate telemetry and governance controls are live. All **40 nodes** across **12 sectors** reporting.\n\nUse slash commands like `/health`, `/caps`, `/govern` for live data — or just talk to me. What do you need, Governor?",
};

function persistMessages(msgs: Message[]) {
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(msgs.slice(-60)));
  } catch { /* storage full */ }
}

function loadPersistedMessages(): Message[] {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupt */ }
  return [];
}

export function DecodeChat() {
  const location = useLocation();
  const { isOpen, mode, identityRole, close, toggle, pendingModeOnOpen, setMode } = useDecodeStore();
  const [messages, setMessages] = useState<Message[]>(() => {
    const persisted = loadPersistedMessages();
    if (persisted.length > 0) return persisted;
    return [{ role: 'assistant', content: MODE_GREETINGS.assistant }];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [connection, setConnection] = useState<ConnectionState>({
    status: 'connected', lastSuccess: null, retryCount: 0,
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastModeRef = useRef<DecodeMode>(mode);
  const { user } = useAuth();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Persist messages
  useEffect(() => {
    if (messages.length > 1) persistMessages(messages);
  }, [messages]);

  // Cleanup
  useEffect(() => {
    return () => { if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current); };
  }, []);

  // Inject mode-switch greeting when mode changes
  useEffect(() => {
    if (mode !== lastModeRef.current) {
      lastModeRef.current = mode;
      const greeting = MODE_GREETINGS[mode];
      setMessages(prev => [...prev, { role: 'assistant', content: `---\n\n*Mode switched to **${mode.toUpperCase()}***\n\n${greeting}` }]);
    }
  }, [mode]);

  // Self-healing connection recovery
  const attemptRecovery = useCallback(async () => {
    if (connection.retryCount >= 3) {
      setConnection(prev => ({ ...prev, status: 'disconnected' }));
      toast.error('Connection issues', { description: 'Unable to reach DECODE. Please try again later.' });
      return;
    }
    setConnection(prev => ({ ...prev, retryCount: prev.retryCount + 1, status: 'degraded' }));
  }, [connection.retryCount]);

  // Hide on homepage and decode page
  const hiddenPaths = ['/', '/decode'];
  if (hiddenPaths.includes(location.pathname) && !isOpen) {
    return null;
  }

  const sendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || isLoading) return;
    setInput('');
    setShowMenu(false);

    // ─── Terminal Command Layer ───
    if (isCommand(userMessage)) {
      const { capabilities } = useDecodeStore.getState();
      const result = routeCommand(userMessage, {
        mode,
        identityRole,
        capabilities,
        connectionStatus: connection.status,
        messageCount: messages.length,
      });

      if (result.handled) {
        if (result.output === '__CLEAR__') {
          clearHistory();
          return;
        }
        setMessages(prev => [
          ...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: result.output },
        ]);
        return;
      }
    }

    const newUserMsg: Message = { role: 'user', content: userMessage };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const llmMessages = updatedMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role, content: m.content }));

      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: llmMessages,
          agentId: "decode-global",
          agentName: "DECODE",
          agentSubtitle: "Sovereign Cognitive Interface",
          agentPowers: ["Intent Interpretation", "Memory Recall", "Module Routing", "Personality Engine"],
          decodeMode: mode,
          identityRole: identityRole,
        }),
      });

      if (!resp.ok || !resp.body) {
        const errorData = resp.status === 429 || resp.status === 402
          ? await resp.json() : null;
        const errorMsg = errorData?.error || "DECODE relay offline. Retry.";
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠ ${errorMsg}` }]);
        setIsLoading(false);
        return;
      }

      // Stream the response
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let assistantSoFar = "";
      let streamDone = false;

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") { streamDone = true; break; }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant" && prev.length > 1 && prev[prev.length - 2]?.content === userMessage) {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }

      // Flush remaining buffer
      if (buffer.trim()) {
        for (let raw of buffer.split("\n")) {
          if (!raw) continue;
          if (raw.endsWith("\r")) raw = raw.slice(0, -1);
          if (raw.startsWith(":") || raw.trim() === "") continue;
          if (!raw.startsWith("data: ")) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === "[DONE]") continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === "assistant") {
                  return prev.map((m, i) => i === prev.length - 1 ? { ...m, content: assistantSoFar } : m);
                }
                return [...prev, { role: "assistant", content: assistantSoFar }];
              });
            }
          } catch { /* ignore partial leftovers */ }
        }
      }

      setConnection({ status: 'connected', lastSuccess: Date.now(), retryCount: 0 });

    } catch (error: any) {
      console.error('Chat error:', error);
      setConnection(prev => ({
        status: 'degraded',
        lastSuccess: prev.lastSuccess,
        retryCount: prev.retryCount + 1
      }));
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠ Connection interrupted. Attempting recovery…',
        provider: 'fallback'
      }]);
      retryTimeoutRef.current = setTimeout(() => attemptRecovery(), 3000);
    } finally {
      setIsLoading(false);
    }
  };




  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearHistory = () => {
    const fresh: Message[] = [{ role: 'assistant', content: MODE_GREETINGS[mode] }];
    setMessages(fresh);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setShowMenu(true);
  };

  const quickActions = mode === 'support'
    ? [
        { icon: "❓", title: "Getting Started", description: "Setup walkthrough", prompt: "How do I get started with CMPSBL? Walk me through the basics." },
        { icon: "🔧", title: "Troubleshoot", description: "Fix an issue", prompt: "I'm having an issue and need help troubleshooting." },
        { icon: "💰", title: "Plans & Pricing", description: "Subscription tiers", prompt: "Explain the CMPSBL subscription tiers and what each includes." },
        { icon: "👤", title: "Talk to a Human", description: "Escalate to support", prompt: "I'd like to escalate this to a human support agent." },
      ]
    : [
        { icon: "💡", title: "Remember a Fact", description: "Teach me about you", prompt: "I want to teach you something about me. Remember this fact:" },
        { icon: "🧠", title: "What Do You Know?", description: "Recall your memories", prompt: "What do you know about me? Show me everything you've learned from our conversation." },
        { icon: "🛡️", title: "Defense Update", description: "Security status check", prompt: "Give me a defense status update. Any threats detected recently?" },
        { icon: "🚀", title: "Getting Started", description: "Learn the substrate", prompt: "How do I start using the substrate? Walk me through the key features and modules." },
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
          <Button variant="ghost" size="icon" className="w-6 h-6" onClick={attemptRecovery}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  };

  if (!isOpen) {
    // Only show the FAB on non-hidden paths
    if (hiddenPaths.includes(location.pathname)) return null;
    return (
      <Button
        onClick={() => toggle()}
        className="fixed bottom-6 right-6 rounded-full w-16 h-16 shadow-glow-lg z-50 bg-gradient-to-r from-primary via-primary-variant to-accent hover:scale-110 transition-transform"
        size="icon"
        aria-label="Open DECODE chat"
      >
        <MessageCircle className="w-6 h-6" />
        {connection.status !== 'connected' && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[hsl(var(--system-amber))] rounded-full animate-pulse" />
        )}
      </Button>
    );
  }

  return (
    <div className="fixed inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-96 sm:h-[600px] glass border border-primary/30 rounded-2xl shadow-glow-lg z-50 flex flex-col overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-gradient-to-r from-primary/10 via-primary-variant/10 to-accent/10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary animate-pulse" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">DECODE</h3>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">sovereign</span>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">CMPSBL® cognitive interface</p>
              <ConnectionIndicator />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={clearHistory} className="hover:bg-primary/10 w-8 h-8" title="Clear conversation">
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
          <Button variant="ghost" size="icon" onClick={close} className="hover:bg-destructive/10">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <DecodeStatusBar />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-inter">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground shadow-glow'
                : msg.provider === 'fallback'
                  ? 'bg-muted/60 text-foreground/70 border border-border/50'
                  : 'bg-muted/80 text-foreground backdrop-blur-sm'
            }`}>
              {msg.imageUrl && (
                <div className="mb-3 rounded-lg overflow-hidden">
                  <img src={msg.imageUrl} alt="Generated" className="w-full h-auto" />
                </div>
              )}
              <DecodeMarkdown content={msg.content} isUser={msg.role === 'user'} className="text-[1.05rem]" />
            </div>
          </div>
        ))}

        {/* Quick Actions */}
        {showMenu && messages.length <= 1 && !isLoading && (
          <div className="grid grid-cols-2 gap-2 px-2 animate-fade-in">
            {quickActions.map((action, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(action.prompt)}
                className="flex flex-col items-start p-3 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 hover:border-primary/40 transition-all hover:scale-105 text-left group"
              >
                <span className="text-2xl mb-1">{action.icon}</span>
                <h4 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">{action.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
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
            placeholder={mode === 'support' ? "Describe your issue or type /help…" : "Speak to DECODE or type /help…"}
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
