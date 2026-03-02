/**
 * AgentChat — DECODE-powered chat interface for any agent
 * Streams responses in DECODE's sovereign voice profile.
 */

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Radio, Loader2, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import type { AgentWithPowers } from "@/lib/agents/crownJewelPowers";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-decode-chat`;

const QUICK_COMMANDS = [
  { label: "Status", cmd: "report" },
  { label: "Learning", cmd: "What has this agent learned recently?" },
  { label: "Health", cmd: "Report full health diagnostics" },
  { label: "Capabilities", cmd: "List all capabilities and their readiness" },
];

export function AgentChat({
  agent,
  open,
  onClose,
}: {
  agent: AgentWithPowers;
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-greet on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      sendMessage("report");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;

      const userMsg: ChatMessage = { role: "user", content: text.trim() };
      const updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
      setInput("");
      setIsStreaming(true);

      let assistantSoFar = "";

      try {
        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: updatedMessages,
            agentId: agent.id,
            agentName: agent.name,
            agentSubtitle: agent.subtitle,
            agentPowers: agent.powers.map((p) => p.name),
          }),
        });

        if (!resp.ok || !resp.body) {
          const errorData = resp.status === 429 || resp.status === 402
            ? await resp.json()
            : null;
          const errorMsg = errorData?.error || "DECODE relay offline. Retry.";
          setMessages((prev) => [
            ...prev,
            { role: "assistant", content: `⚠ ${errorMsg}` },
          ]);
          setIsStreaming(false);
          return;
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
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
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content as
                | string
                | undefined;
              if (content) {
                assistantSoFar += content;
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant") {
                    return prev.map((m, i) =>
                      i === prev.length - 1
                        ? { ...m, content: assistantSoFar }
                        : m
                    );
                  }
                  return [
                    ...prev,
                    { role: "assistant", content: assistantSoFar },
                  ];
                });
              }
            } catch {
              buffer = line + "\n" + buffer;
              break;
            }
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
              const content = parsed.choices?.[0]?.delta?.content as
                | string
                | undefined;
              if (content) {
                assistantSoFar += content;
                setMessages((prev) => {
                  const last = prev[prev.length - 1];
                  if (last?.role === "assistant") {
                    return prev.map((m, i) =>
                      i === prev.length - 1
                        ? { ...m, content: assistantSoFar }
                        : m
                    );
                  }
                  return [
                    ...prev,
                    { role: "assistant", content: assistantSoFar },
                  ];
                });
              }
            } catch {
              /* ignore partial leftovers */
            }
          }
        }
      } catch (err) {
        console.error("DECODE stream error:", err);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "⚠ DECODE relay disrupted. Connection lost.",
          },
        ]);
      }

      setIsStreaming(false);
    },
    [messages, isStreaming, agent]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-4 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[440px] sm:h-[600px] z-50 flex flex-col rounded-2xl border border-border/60 bg-card/95 backdrop-blur-xl shadow-2xl overflow-hidden"
        style={{ boxShadow: `0 0 80px -20px ${agent.glowColor}` }}
      >
        {/* Header */}
        <div className={cn("flex items-center gap-3 p-4 border-b border-border/40 bg-gradient-to-r", agent.gradient, "bg-opacity-10")}>
          <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-md", agent.gradient)}>
            <agent.icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white tracking-tight">{agent.name}</h3>
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            </div>
            <p className="text-[9px] font-mono text-white/50 break-words">DECODE RELAY · SOVEREIGN CHANNEL</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-7 h-7 text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed",
                  msg.role === "user"
                    ? "bg-primary/15 text-foreground border border-primary/20"
                    : "bg-muted/50 text-foreground border border-border/30"
                )}
              >
                {msg.role === "assistant" ? (
                  <div className="prose prose-sm prose-invert max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0 [&_strong]:text-primary/90 [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-xs [&_ul]:mt-1 [&_li]:text-xs">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <span className="font-mono text-xs">{msg.content}</span>
                )}
              </div>
            </div>
          ))}

          {isStreaming && messages[messages.length - 1]?.role !== "assistant" && (
            <div className="flex justify-start">
              <div className="bg-muted/50 border border-border/30 rounded-xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin text-primary" />
                <span className="text-[10px] font-mono text-muted-foreground">
                  DECODE processing…
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Commands */}
        <div className="px-4 py-2 flex gap-1.5 flex-wrap border-t border-border/20">
          {QUICK_COMMANDS.map((qc) => (
            <button
              key={qc.label}
              onClick={() => sendMessage(qc.cmd)}
              disabled={isStreaming}
              className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary/80 border border-primary/15 hover:bg-primary/20 transition-colors disabled:opacity-40"
            >
              {qc.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-3 border-t border-border/40 flex gap-2">
          <div className="flex-1 relative">
            <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground/40" />
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Command or query…"
              disabled={isStreaming}
              className="w-full bg-muted/30 border border-border/40 rounded-lg pl-8 pr-3 py-2.5 text-xs font-mono text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 transition-colors disabled:opacity-50"
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={isStreaming || !input.trim()}
            className="w-10 h-10 rounded-lg shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
}
