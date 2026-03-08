/**
 * TryItChat — No-signup conversational demo powered by NEXUS router.
 * Shows AI routing + memory persistence in a simple chat UI.
 */
import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Zap, Brain, Trash2, Sparkles } from "lucide-react";
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
}

const SYSTEM_PROMPT = `You are a friendly demo assistant for CMPSBL, a cognitive infrastructure platform. You demonstrate persistent memory and intelligent routing. Keep replies concise (2-3 sentences). If the user tells you something personal (name, preferences), acknowledge you'll remember it. If they ask you to recall, reference earlier messages.`;

const STARTER_PROMPTS = [
  "My name is Alex and I love building AI agents",
  "What makes CMPSBL different from LangChain?",
  "Remember that I prefer Python over JavaScript",
  "What did I tell you my name was?",
];

export function TryItChat({ className }: { className?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Build conversation context (memory simulation)
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
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch {
      setMessages(prev => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: "NEXUS is warming up — try again in a moment." },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
        inputRef.current?.focus();
      }, 100);
    }
  }, [messages, loading]);

  const clearChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div className={cn("flex flex-col rounded-2xl border border-border/40 bg-card/60 backdrop-blur-sm overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-muted/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Try CMPSBL</h3>
            <p className="text-[10px] text-muted-foreground font-mono">NEXUS routing · No signup</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1 text-[10px]">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Live
          </Badge>
          {messages.length > 0 && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={clearChat} aria-label="Clear chat">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[280px] max-h-[400px]">
        {messages.length === 0 && (
          <div className="text-center py-8 space-y-4">
            <Brain className="w-8 h-8 text-primary/30 mx-auto" />
            <div>
              <p className="text-sm text-muted-foreground mb-1">Talk to the substrate</p>
              <p className="text-[11px] text-muted-foreground/50">Tell it your name — then ask it to remember</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm mx-auto">
              {STARTER_PROMPTS.slice(0, 3).map((p, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(p)}
                  className="text-[11px] px-3 py-1.5 rounded-full border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted/50 border border-border/30 rounded-bl-md"
                )}
              >
                {msg.content}
                {msg.provider && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-[9px] opacity-50">
                    <Zap className="w-2.5 h-2.5" />
                    {msg.provider}{msg.latency ? ` · ${msg.latency}ms` : ""}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-muted/50 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border/30 p-3">
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
            className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground/40 focus:outline-none min-h-[44px] px-2"
          />
          <Button
            type="submit"
            size="icon"
            disabled={loading || !input.trim()}
            className="h-9 w-9 rounded-xl shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
