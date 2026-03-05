import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Send, X, Sparkles, RefreshCw, WifiOff } from "lucide-react";
import { DecodeMarkdown } from "./DecodeMarkdown";
import { decode, substrate } from "@/lib/substrate";

type Props = {
  anchorId?: string;
};

interface Message {
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  generatedText?: string;
  provider?: string;
}

interface ConnectionState {
  status: "connected" | "degraded" | "disconnected";
  retryCount: number;
}

const quickActions = [
  { icon: "💡", title: "Remember a Fact", prompt: "I want to teach you something about me. Remember this fact:" },
  { icon: "🧠", title: "What Do You Know?", prompt: "What do you know about me? Show me everything you've learned." },
  { icon: "🛡️", title: "Defense Update", prompt: "Give me a defense status update. Any threats detected recently?" },
  { icon: "🚀", title: "Getting Started", prompt: "How do I start using the substrate? Walk me through the key features and modules." },
];

// ─── Smart Position Hook ────────────────────────────────────────
const ORB_SIZE = 56;
const MARGIN = 16;
const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function useSmartPosition(orbRef: React.RefObject<HTMLButtonElement | null>, chatOpen: boolean) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, orbX: 0, orbY: 0 });
  const userPlaced = useRef(false);
  const dodgeRaf = useRef<number>(0);
  const initialized = useRef(false);

  // Set default position
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const safeBottom = 80;
    setPos({
      x: window.innerWidth - ORB_SIZE - MARGIN,
      y: window.innerHeight - ORB_SIZE - safeBottom,
    });
  }, []);

  // Clamp helper
  const clamp = useCallback((x: number, y: number) => ({
    x: Math.max(MARGIN, Math.min(x, window.innerWidth - ORB_SIZE - MARGIN)),
    y: Math.max(MARGIN, Math.min(y, window.innerHeight - ORB_SIZE - MARGIN)),
  }), []);

  // Dodge: check if orb overlaps interactive elements and nudge away
  const dodge = useCallback(() => {
    if (userPlaced.current || chatOpen) return;
    cancelAnimationFrame(dodgeRaf.current);
    dodgeRaf.current = requestAnimationFrame(() => {
      const orbRect = orbRef.current?.getBoundingClientRect();
      if (!orbRect) return;

      const elements = document.querySelectorAll(INTERACTIVE_SELECTOR);
      let needsDodge = false;

      for (const el of elements) {
        if (el === orbRef.current || orbRef.current?.contains(el) || el.closest('[data-decode-panel]')) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;

        // Inflate orb rect by 8px for comfort
        const pad = 8;
        const overlaps =
          orbRect.left - pad < r.right &&
          orbRect.right + pad > r.left &&
          orbRect.top - pad < r.bottom &&
          orbRect.bottom + pad > r.top;

        if (overlaps) {
          needsDodge = true;
          break;
        }
      }

      if (needsDodge) {
        setPos(prev => {
          // Try nudging up first, then left, then down
          const candidates = [
            clamp(prev.x, prev.y - 70),      // up
            clamp(prev.x - 70, prev.y),       // left
            clamp(prev.x, prev.y + 70),       // down
            clamp(prev.x + 70, prev.y),       // right
            clamp(prev.x - 70, prev.y - 70),  // up-left
          ];

          for (const candidate of candidates) {
            // Quick check: would this candidate overlap anything?
            const cRect = {
              left: candidate.x,
              right: candidate.x + ORB_SIZE,
              top: candidate.y,
              bottom: candidate.y + ORB_SIZE,
            };
            let clean = true;
            for (const el of elements) {
              if (el === orbRef.current || orbRef.current?.contains(el) || el.closest('[data-decode-panel]')) continue;
              const r = el.getBoundingClientRect();
              if (r.width === 0 || r.height === 0) continue;
              if (cRect.left - 8 < r.right && cRect.right + 8 > r.left && cRect.top - 8 < r.bottom && cRect.bottom + 8 > r.top) {
                clean = false;
                break;
              }
            }
            if (clean) return candidate;
          }
          return prev;
        });
      }
    });
  }, [chatOpen, clamp, orbRef]);

  // Run dodge on scroll, resize, and periodically
  useEffect(() => {
    if (userPlaced.current) return;
    const handleScroll = () => dodge();
    const handleResize = () => {
      setPos(prev => clamp(prev.x, prev.y));
      dodge();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    const interval = setInterval(dodge, 2000);

    // Initial dodge after layout
    setTimeout(dodge, 500);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      clearInterval(interval);
      cancelAnimationFrame(dodgeRaf.current);
    };
  }, [dodge, clamp]);

  // Drag handlers
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, orbX: pos.x, orbY: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (!isDragging.current && Math.abs(dx) + Math.abs(dy) < 5) return;
    isDragging.current = true;
    setPos(clamp(dragStart.current.orbX + dx, dragStart.current.orbY + dy));
  }, [clamp]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (isDragging.current) {
      userPlaced.current = true;
      isDragging.current = false;
      e.preventDefault();
      e.stopPropagation();

      // Snap to nearest edge (left or right)
      setPos(prev => {
        const midX = window.innerWidth / 2;
        return {
          x: prev.x + ORB_SIZE / 2 < midX ? MARGIN : window.innerWidth - ORB_SIZE - MARGIN,
          y: prev.y,
        };
      });
    }
  }, []);

  // Reset user placement after 30s of no interaction so dodge kicks back in
  useEffect(() => {
    if (!userPlaced.current) return;
    const timeout = setTimeout(() => { userPlaced.current = false; }, 30000);
    return () => clearTimeout(timeout);
  }, [pos]);

  return { pos, onPointerDown, onPointerMove, onPointerUp, isDragging };
}

// ─── Main Component ─────────────────────────────────────────────
export default function DecodeFloat({ anchorId = "decode-float-anchor" }: Props) {
  const orbRef = useRef<HTMLButtonElement | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "DECODE online. I interpret natural language into structured intents and route them to the appropriate substrate execution surfaces.\n\nHow can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [connection, setConnection] = useState<ConnectionState>({ status: "connected", retryCount: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);

  // Stable session ID per browser tab — prevents cross-user bleed for anonymous sessions
  const sessionId = useRef<string>(() => {
    const key = '_decode_sid';
    let sid = sessionStorage.getItem(key);
    if (!sid) {
      sid = `anon_${crypto.randomUUID()}`;
      sessionStorage.setItem(key, sid);
    }
    return sid;
  });

  const { pos, onPointerDown, onPointerMove, onPointerUp, isDragging } = useSmartPosition(orbRef, chatOpen);

  useEffect(() => { setMounted(true); }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Lock scroll when chat is open
  useEffect(() => {
    if (!chatOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => inputRef.current?.focus(), 200);
    return () => { document.body.style.overflow = prev; };
  }, [chatOpen]);

  const attemptRecovery = useCallback(async () => {
    if (connection.retryCount >= 3) {
      setConnection({ status: "disconnected", retryCount: connection.retryCount });
      return;
    }
    try {
      const response = await substrate.invoke({ module: "decode", action: "status" });
      if (response.success) setConnection({ status: "connected", retryCount: 0 });
    } catch {
      setConnection(prev => ({ status: "degraded", retryCount: prev.retryCount + 1 }));
    }
  }, [connection.retryCount]);

  const sendMessage = async (messageText?: string) => {
    const userMessage = messageText || input.trim();
    if (!userMessage || isLoading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);
    setShowMenu(false);

    try {
      // Build conversation history from local state for context (no server-side bleed)
      const conversationHistory = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await substrate.invoke({
        module: 'decode',
        action: 'chat',
        payload: {
          message: userMessage,
          sessionId: sessionId.current,
          conversationHistory,
        },
      });
      if (!response.success) throw new Error(response.error || "Chat failed");
      const data = response.data as any;
      setConnection({ status: "connected", retryCount: 0 });
      setMessages(prev => [...prev, {
        role: "assistant",
        content: data?.reply || "Request processed.",
        imageUrl: data?.imageUrl,
        generatedText: data?.generatedText,
        provider: data?.provider,
      }]);
    } catch {
      setConnection(prev => ({ status: "degraded", retryCount: prev.retryCount + 1 }));
      setMessages(prev => [...prev, { role: "assistant", content: "Connection interrupted. Attempting recovery...", provider: "fallback" }]);
      setTimeout(() => attemptRecovery(), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!mounted) return null;

  const portalContent = (
    <>
      {/* ─── Floating Orb — draggable + auto-dodge ─── */}
      <button
        id={anchorId}
        ref={orbRef}
        type="button"
        onClick={(e) => {
          if (isDragging.current) { e.preventDefault(); return; }
          setChatOpen(prev => !prev);
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label="Decode — substrate voice"
        className={cn(
          "group cursor-grab active:cursor-grabbing touch-manipulation select-none",
          "w-[56px] h-[56px] rounded-full grid place-items-center",
          chatOpen && "scale-90 opacity-70"
        )}
        style={{
          position: "fixed",
          left: pos.x,
          top: pos.y,
          zIndex: 10001,
          contain: "layout",
          transition: isDragging.current ? "none" : "left 0.35s cubic-bezier(0.22,1,0.36,1), top 0.35s cubic-bezier(0.22,1,0.36,1)",
          willChange: "left, top",
        }}
      >
        {/* Outer glow aura */}
        <span
          className="absolute inset-0 rounded-full opacity-60 group-hover:opacity-90 transition-opacity duration-500"
          style={{
            background: "conic-gradient(from 0deg, hsl(var(--neon-cyan)), hsl(var(--neon-magenta)), hsl(var(--neon-purple)), hsl(var(--neon-amber)), hsl(var(--neon-green)), hsl(var(--neon-blue)), hsl(var(--neon-cyan)))",
            filter: "blur(10px)",
            animation: "decodeOrbSpin 6s linear infinite",
          }}
        />
        {/* Main orb body */}
        <span className="absolute inset-[3px] rounded-full" style={{ background: "hsl(var(--background))", boxShadow: "inset 0 0 12px hsl(var(--neon-cyan) / 0.15)" }} />
        {/* Rotating neon ring */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 56 56" fill="none" style={{ animation: "decodeOrbSpin 6s linear infinite" }}>
          <defs>
            <linearGradient id="decode-ring-grad" gradientTransform="rotate(90)">
              <stop offset="0%" stopColor="hsl(var(--neon-cyan))" />
              <stop offset="25%" stopColor="hsl(var(--neon-magenta))" />
              <stop offset="50%" stopColor="hsl(var(--neon-purple))" />
              <stop offset="75%" stopColor="hsl(var(--neon-amber))" />
              <stop offset="100%" stopColor="hsl(var(--neon-green))" />
            </linearGradient>
          </defs>
          <circle cx="28" cy="28" r="25.5" stroke="url(#decode-ring-grad)" strokeWidth="2" strokeDasharray="6 3" fill="none" />
        </svg>
        {/* Bio-evolutionary circular arrows */}
        <svg className="absolute w-[34px] h-[34px]" viewBox="0 0 34 34" fill="none" style={{ animation: "decodeOrbSpin 8s linear infinite reverse" }}>
          <defs>
            <linearGradient id="da1" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="hsl(var(--neon-cyan))" /><stop offset="100%" stopColor="hsl(var(--neon-blue))" /></linearGradient>
            <linearGradient id="da2" x1="1" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="hsl(var(--neon-magenta))" /><stop offset="100%" stopColor="hsl(var(--neon-purple))" /></linearGradient>
            <linearGradient id="da3" x1="0" y1="1" x2="1" y2="0"><stop offset="0%" stopColor="hsl(var(--neon-green))" /><stop offset="100%" stopColor="hsl(var(--neon-amber))" /></linearGradient>
          </defs>
          <path d="M 17 4 A 13 13 0 0 1 29 13" stroke="url(#da1)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <polygon points="29,13 26,10.5 27.5,14.5" fill="hsl(var(--neon-blue))" />
          <path d="M 29 21 A 13 13 0 0 1 17 30" stroke="url(#da2)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <polygon points="17,30 20,27.5 18.5,31.5" fill="hsl(var(--neon-purple))" />
          <path d="M 5 17 A 13 13 0 0 1 14 5" stroke="url(#da3)" strokeWidth="2" strokeLinecap="round" fill="none" />
          <polygon points="14,5 11.5,8 15.5,6.5" fill="hsl(var(--neon-amber))" />
        </svg>
        {/* Center nucleus */}
        <span className="relative w-2 h-2 rounded-full" style={{
          background: "conic-gradient(from 120deg, hsl(var(--neon-cyan)), hsl(var(--neon-magenta)), hsl(var(--neon-green)), hsl(var(--neon-cyan)))",
          boxShadow: "0 0 8px hsl(var(--neon-cyan) / 0.7), 0 0 16px hsl(var(--neon-magenta) / 0.4)",
          animation: "decodeNucleusPulse 2.5s ease-in-out infinite",
        }} />
      </button>

      {/* ─── Chat Panel ─── */}
      {chatOpen && (
        <div
          data-decode-panel
          className="animate-scale-in"
          style={{
            position: "fixed",
            bottom: "calc(144px + env(safe-area-inset-bottom, 0px))",
            right: 16,
            width: "min(384px, calc(100vw - 32px))",
            height: "min(520px, calc(100vh - 120px))",
            zIndex: 10002,
            display: "flex",
            flexDirection: "column",
            borderRadius: 16,
            overflow: "hidden",
            border: "1px solid hsl(var(--border) / 0.5)",
            background: "hsl(var(--card))",
            boxShadow: "0 20px 60px hsl(var(--primary) / 0.15), 0 0 0 1px hsl(var(--primary) / 0.08)",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50"
            style={{ background: "linear-gradient(135deg, hsl(var(--primary) / 0.08), hsl(var(--neon-purple) / 0.06))" }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-foreground">Decode</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">substrate</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-muted-foreground">cognitive interface</span>
                  <span className={cn("w-1.5 h-1.5 rounded-full", {
                    "bg-[hsl(var(--system-green))]": connection.status === "connected",
                    "bg-[hsl(var(--system-amber))] animate-pulse": connection.status === "degraded",
                    "bg-destructive": connection.status === "disconnected",
                  })} />
                </div>
              </div>
            </div>
            <button type="button" onClick={() => setChatOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Close chat">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed", {
                  "bg-primary text-primary-foreground": msg.role === "user",
                  "bg-muted/80 text-foreground": msg.role === "assistant" && msg.provider !== "fallback",
                  "bg-muted/50 text-foreground/60 border border-border/40": msg.provider === "fallback",
                })}>
                  {msg.imageUrl && <img src={msg.imageUrl} alt="Generated" className="w-full rounded-lg mb-2" />}
                  {msg.generatedText && (
                    <div className="mb-2 p-2 bg-background/50 rounded-lg border border-border/40 text-xs">
                      <p className="text-muted-foreground mb-0.5">Generated:</p>
                      <p>{msg.generatedText}</p>
                    </div>
                  )}
                  <DecodeMarkdown content={msg.content} isUser={msg.role === "user"} />
                </div>
              </div>
            ))}

            {/* Quick Actions */}
            {showMenu && messages.length === 1 && !isLoading && (
              <div className="grid grid-cols-2 gap-2 animate-fade-in">
                {quickActions.map((a, i) => (
                  <button key={i} type="button" onClick={() => sendMessage(a.prompt)}
                    className="flex flex-col items-start p-2.5 rounded-xl bg-primary/5 border border-primary/15 hover:border-primary/30 hover:bg-primary/10 transition-all text-left">
                    <span className="text-lg mb-0.5">{a.icon}</span>
                    <span className="font-medium text-xs text-foreground">{a.title}</span>
                  </button>
                ))}
              </div>
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-4 py-2 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                  <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-border/50">
            {connection.status === "disconnected" && (
              <div className="flex items-center gap-1.5 text-xs text-destructive mb-2">
                <WifiOff className="w-3 h-3" />
                <span>Connection lost.</span>
                <button type="button" onClick={attemptRecovery} className="underline">Retry</button>
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Decode anything..."
                disabled={isLoading || connection.status === "disconnected"}
                className="flex-1 h-10 px-3 rounded-xl text-sm bg-muted/60 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading || connection.status === "disconnected"}
                className="h-10 w-10 rounded-xl grid place-items-center bg-primary text-primary-foreground disabled:opacity-40 hover:opacity-90 transition-opacity"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop when chat is open (mobile) */}
      {chatOpen && (
        <div
          onClick={() => setChatOpen(false)}
          className="md:hidden"
          style={{
            position: "fixed",
            inset: 0,
            background: "hsl(var(--background) / 0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 10000,
          }}
        />
      )}
    </>
  );

  return createPortal(portalContent, document.body);
}
