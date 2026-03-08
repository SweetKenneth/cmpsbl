/**
 * TryItChat — No-signup conversational demo powered by NEXUS router.
 * Shows AI routing + memory persistence in a simple chat UI.
 */
import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Zap, Brain, Trash2, Sparkles, CornerDownLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  provider?: string;
  latency?: number;
  timestamp?: number;
}

const SYSTEM_PROMPT = `You are a friendly demo assistant for CMPSBL, a cognitive infrastructure platform. You demonstrate persistent memory and intelligent routing. Keep replies concise (2-3 sentences). If the user tells you something personal (name, preferences), acknowledge you'll remember it. If they ask you to recall, reference earlier messages.`;

const STARTER_PROMPTS = [
  { text: "My name is Alex and I love building AI agents", icon: "👋" },
  { text: "What makes CMPSBL different from LangChain?", icon: "🔍" },
  { text: "Remember that I prefer Python over JS", icon: "🧠" },
];

export function TryItChat({ className }: { className?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setMessageCount(c => c + 1);

    const conversationContext = newMessages
      .filter(m => m.role !== "system")
      .map(m => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`)
      .join("\n");

    const prompt = `${conversationContext}\nAssistant:`;

    try {
      const { data, error } = await supabase.functions.invoke("pf-nexus-router", {
        body: {
          prompt,
          systemPrompt: SYSTEM_PROMPT,
          taskType: "chat",
          maxTokens: 200,
          temperature: 0.7,
        },
      });

      if (error) throw error;

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data?.content || data?.response || "I'm thinking...",
        provider: data?.provider,
        latency: data?.latencyMs,
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "NEXUS is warming up — try again in a moment.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, loading]);

  const clearChat = () => {
    setMessages([]);
    setInput("");
    setMessageCount(0);
  };

  return (
    <div className={cn(
      "flex flex-col rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden",
      "shadow-lg shadow-black/5",
      className
    )}>
      {/* ─── Header ─── */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-tight">NEXUS Chat</h3>
            <p className="text-[10px] text-muted-foreground font-mono leading-tight">
              Live routing · Persistent memory
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-[10px] border-emerald-500/30 text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </Badge>
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              onClick={clearChat}
              aria-label="Clear chat"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* ─── Messages ─── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[300px] max-h-[420px]">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-6 space-y-5"
          >
            <div className="relative mx-auto w-14 h-14">
              <div className="absolute inset-0 rounded-2xl bg-primary/5 border border-primary/10" />
              <Brain className="w-7 h-7 text-primary/40 absolute inset-0 m-auto" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/80 mb-1">Talk to the substrate</p>
              <p className="text-[11px] text-muted-foreground/50">
                Tell it your name — then ask it to remember
              </p>
            </div>
            <div className="flex flex-col gap-2 max-w-xs mx-auto">
              {STARTER_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(p.text)}
                  className={cn(
                    "flex items-center gap-2.5 text-left text-[12px] px-3.5 py-2.5 rounded-xl",
                    "border border-border/40 text-muted-foreground",
                    "hover:text-foreground hover:border-primary/30 hover:bg-primary/5",
                    "transition-all duration-200"
                  )}
                >
                  <span className="text-sm shrink-0">{p.icon}</span>
                  <span className="line-clamp-1">{p.text}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.2 }}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted/40 border border-border/30 rounded-bl-md"
                )}
              >
                {msg.content}
                {msg.provider && (
                  <div className="flex items-center gap-1.5 mt-2 pt-1.5 border-t border-current/10 text-[9px] opacity-40 font-mono">
                    <Zap className="w-2.5 h-2.5" />
                    <span>{msg.provider}</span>
                    {msg.latency && <span>· {msg.latency}ms</span>}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-start"
          >
            <div className="bg-muted/40 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-primary/60" />
              <span className="text-[11px] text-muted-foreground/50 font-mono">Routing…</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* ─── Input ─── */}
      <div className="border-t border-border/30 p-3 bg-muted/5">
        <form
          onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything…"
            disabled={loading}
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/30 focus:outline-none min-h-[44px] px-2"
          />
          <div className="flex items-center gap-1.5">
            {input.trim() && !loading && (
              <span className="hidden sm:flex items-center gap-0.5 text-[9px] text-muted-foreground/30 font-mono">
                <CornerDownLeft className="w-2.5 h-2.5" />
              </span>
            )}
            <Button
              type="submit"
              size="icon"
              disabled={loading || !input.trim()}
              className="h-9 w-9 rounded-xl shrink-0"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>

        {/* Message counter */}
        {messageCount > 0 && (
          <div className="mt-1.5 text-[9px] text-muted-foreground/30 font-mono text-center">
            {messageCount} message{messageCount !== 1 ? 's' : ''} in memory
          </div>
        )}
      </div>
    </div>
  );
}
