import { useRef, useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Send, X, Sparkles, RefreshCw, WifiOff } from "lucide-react";
import { DecodeMarkdown } from "./DecodeMarkdown";
import { DecodeStatusBar } from "./DecodeStatusBar";
import { decode, substrate } from "@/lib/substrate";
import { useDecodeStore, type DecodeMode } from "@/stores/decodeStore";
import { isCommand, routeCommand } from "@/lib/decode/command-router";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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

const SESSION_STORAGE_KEY = 'decode_float_messages';
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-decode-chat`;

const MODE_GREETINGS: Record<DecodeMode, string> = {
  assistant: "Hello. I'm DECODE — the interface between you and the CMPSBL substrate.\n\nI can answer questions, guide you through the system, or help troubleshoot issues.\n\nIf you need support, just ask.",
  support: "Hello — I'm DECODE. I translate intent between you and the CMPSBL substrate.\n\nYou're currently in **support mode**. Tell me what you need help with.\n\nI can troubleshoot issues, explain features, walk you through setup, or escalate to a human at support@cmpsbl.com.",
  builder: "DECODE online — builder mode active.\n\nReady to assist with substrate configuration, memory setup, and capability integration.\n\nState your objective.",
  governor: "DECODE online — **governor mode** active.\n\nFull substrate telemetry and governance controls are available.\n\nAll 40 nodes across 12 sectors reporting. Awaiting directive.",
};

function persistMessages(msgs: Message[]) {
  try { sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(msgs.slice(-60))); } catch {}
}

function loadPersistedMessages(): Message[] {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

// ─── Smart Position Hook ────────────────────────────────────────
const ORB_SIZE = 56;
const MARGIN = 16;
const INTERACTIVE_SELECTOR = 'a, button, [role="button"], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function useSmartPosition(orbRef: React.RefObject<HTMLButtonElement | null>, chatOpen: boolean) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, orbX: 0, orbY: 0 });
  const userPlaced = useRef(false);
  const dodgeRaf = useRef<number>(0);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const safeBottom = 80;
    setPos({ x: window.innerWidth - ORB_SIZE - MARGIN, y: window.innerHeight - ORB_SIZE - safeBottom });
  }, []);

  const clamp = useCallback((x: number, y: number) => ({
    x: Math.max(MARGIN, Math.min(x, window.innerWidth - ORB_SIZE - MARGIN)),
    y: Math.max(MARGIN, Math.min(y, window.innerHeight - ORB_SIZE - MARGIN)),
  }), []);

  const dodge = useCallback(() => {
    if (userPlaced.current || chatOpen) return;
    cancelAnimationFrame(dodgeRaf.current);
    dodgeRaf.current = requestAnimationFrame(() => {
      const orbRect = orbRef.current?.getBoundingClientRect();
      if (!orbRect) return;
      const elements = document.querySelectorAll(INTERACTIVE_SELECTOR);

      // Batch ALL layout reads upfront to avoid forced reflows
      const rects: DOMRect[] = [];
      const validIndices: number[] = [];
      let idx = 0;
      for (const el of elements) {
        if (el === orbRef.current || orbRef.current?.contains(el) || el.closest('[data-decode-panel]')) { idx++; continue; }
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) { idx++; continue; }
        rects.push(r);
        validIndices.push(idx);
        idx++;
      }

      // Check overlap using cached rects (no further layout reads)
      let needsDodge = false;
      const pad = 8;
      for (const r of rects) {
        if (orbRect.left - pad < r.right && orbRect.right + pad > r.left && orbRect.top - pad < r.bottom && orbRect.bottom + pad > r.top) {
          needsDodge = true;
          break;
        }
      }
      if (needsDodge) {
        setPos(prev => {
          const candidates = [
            clamp(prev.x, prev.y - 70), clamp(prev.x - 70, prev.y),
            clamp(prev.x, prev.y + 70), clamp(prev.x + 70, prev.y),
            clamp(prev.x - 70, prev.y - 70),
          ];
          for (const candidate of candidates) {
            const cRect = { left: candidate.x, right: candidate.x + ORB_SIZE, top: candidate.y, bottom: candidate.y + ORB_SIZE };
            let clean = true;
            for (const r of rects) {
              if (cRect.left - 8 < r.right && cRect.right + 8 > r.left && cRect.top - 8 < r.bottom && cRect.bottom + 8 > r.top) { clean = false; break; }
            }
            if (clean) return candidate;
          }
          return prev;
        });
      }
    });
  }, [chatOpen, clamp, orbRef]);

  useEffect(() => {
    if (userPlaced.current) return;
    let scrollTimeout: ReturnType<typeof setTimeout>;
    let resizeTimeout: ReturnType<typeof setTimeout>;
    const handleScroll = () => { clearTimeout(scrollTimeout); scrollTimeout = setTimeout(dodge, 300); };
    const handleResize = () => { clearTimeout(resizeTimeout); resizeTimeout = setTimeout(() => { setPos(prev => clamp(prev.x, prev.y)); dodge(); }, 300); };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    const interval = setInterval(dodge, 5000);
    const scheduleInitialDodge = typeof requestIdleCallback === 'function'
      ? () => requestIdleCallback(() => dodge(), { timeout: 3000 })
      : () => setTimeout(dodge, 2500);
    scheduleInitialDodge();
    return () => { window.removeEventListener("scroll", handleScroll); window.removeEventListener("resize", handleResize); clearTimeout(scrollTimeout); clearTimeout(resizeTimeout); clearInterval(interval); cancelAnimationFrame(dodgeRaf.current); };
  }, [dodge, clamp]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    isDragging.current = false;
    dragStart.current = { x: e.clientX, y: e.clientY, orbX: pos.x, orbY: pos.y };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    if (!isDragging.current && Math.abs(dx) + Math.abs(dy) < 5) return;
    if (!isDragging.current) {
      isDragging.current = true;
      setDragging(true);
    }
    setPos(clamp(dragStart.current.orbX + dx, dragStart.current.orbY + dy));
  }, [clamp]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (isDragging.current) {
      isDragging.current = false;
      setDragging(false);
      userPlaced.current = true;
      e.preventDefault();
      e.stopPropagation();
      setPos(prev => {
        const midX = window.innerWidth / 2;
        return { x: prev.x + ORB_SIZE / 2 < midX ? MARGIN : window.innerWidth - ORB_SIZE - MARGIN, y: prev.y };
      });
    }
  }, []);

  useEffect(() => {
    if (!userPlaced.current) return;
    const timeout = setTimeout(() => { userPlaced.current = false; }, 30000);
    return () => clearTimeout(timeout);
  }, [pos]);

  return { pos, onPointerDown, onPointerMove, onPointerUp, isDragging, dragging };
}

// ─── Quick Actions by Mode ──────────────────────────────────────
function getQuickActions(mode: DecodeMode) {
  if (mode === 'support') return [
    { icon: "❓", title: "Getting Started", prompt: "How do I get started with CMPSBL? Walk me through the basics." },
    { icon: "🔧", title: "Troubleshoot", prompt: "I'm having an issue and need help troubleshooting." },
    { icon: "💰", title: "Plans & Pricing", prompt: "Explain the CMPSBL subscription tiers and what each includes." },
    { icon: "👤", title: "Talk to a Human", prompt: "I'd like to escalate this to a human support agent." },
  ];
  if (mode === 'governor') return [
    { icon: "📡", title: "Node Status", prompt: "Report full 40-node health status across all 12 sectors." },
    { icon: "🔬", title: "Topology View", prompt: "Show me the current substrate topology and safety switch states." },
    { icon: "🩺", title: "System Heal", prompt: "Run a diagnostic and heal any degraded nodes." },
    { icon: "📊", title: "Memory Metrics", prompt: "Show memory scoring and foundry reactor metrics." },
  ];
  return [
    { icon: "💡", title: "Remember a Fact", prompt: "I want to teach you something about me. Remember this fact:" },
    { icon: "🧠", title: "What Do You Know?", prompt: "What do you know about me? Show me everything you've learned." },
    { icon: "🛡️", title: "Defense Update", prompt: "Give me a defense status update. Any threats detected recently?" },
    { icon: "🚀", title: "Getting Started", prompt: "How do I start using the substrate? Walk me through the key features." },
  ];
}

// ─── Main Component ─────────────────────────────────────────────
export default function DecodeFloat({ anchorId = "decode-float-anchor" }: Props) {
  const orbRef = useRef<HTMLButtonElement | null>(null);
  const { isOpen, mode, identityRole, open, close, toggle, setIdentityRole, pendingModeOnOpen } = useDecodeStore();
  const { user } = useAuth();

  const [messages, setMessages] = useState<Message[]>(() => {
    const persisted = loadPersistedMessages();
    if (persisted.length > 0) return persisted;
    return [{ role: "assistant", content: MODE_GREETINGS.assistant }];
  });
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(true);
  const [connection, setConnection] = useState<ConnectionState>({ status: "connected", retryCount: 0 });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [mounted, setMounted] = useState(false);
  const lastModeRef = useRef<DecodeMode>(mode);

  // Stable session ID
  const sessionId = useRef<string>('');
  useEffect(() => {
    const key = '_decode_sid';
    let sid = sessionStorage.getItem(key);
    if (!sid) { sid = `anon_${crypto.randomUUID()}`; sessionStorage.setItem(key, sid); }
    sessionId.current = sid;
  }, []);

  // Sync identity role from auth
  useEffect(() => {
    if (!user) {
      setIdentityRole('anonymous');
      return;
    }
    // Check role via RPC
    (async () => {
      try {
        const { data: isAdmin } = await supabase.rpc('has_role_text', { _user_id: user.id, _role: 'admin' });
        if (isAdmin) { setIdentityRole('governor'); return; }
        const { data: isMod } = await supabase.rpc('has_role_text', { _user_id: user.id, _role: 'moderator' });
        if (isMod) { setIdentityRole('architect'); return; }
        const { data: isOp } = await supabase.rpc('has_role_text', { _user_id: user.id, _role: 'operator' });
        if (isOp) { setIdentityRole('creator'); return; }
        setIdentityRole('user');
      } catch { setIdentityRole('user'); }
    })();
  }, [user, setIdentityRole]);

  const { pos, onPointerDown, onPointerMove, onPointerUp, isDragging, dragging } = useSmartPosition(orbRef, isOpen);

  useEffect(() => { setMounted(true); }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Persist messages
  useEffect(() => {
    if (messages.length > 1) persistMessages(messages);
  }, [messages]);

  // Lock scroll when chat is open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setTimeout(() => inputRef.current?.focus(), 200);
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  // Inject mode-switch greeting
  useEffect(() => {
    if (mode !== lastModeRef.current) {
      lastModeRef.current = mode;
      const greeting = MODE_GREETINGS[mode];
      setMessages(prev => [...prev, { role: 'assistant', content: `---\n\n*Mode switched to **${mode.toUpperCase()}***\n\n${greeting}` }]);
      setShowMenu(true);
    }
  }, [mode]);

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

    const newUserMsg: Message = { role: "user", content: userMessage };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      // Build full conversation history for the LLM
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
        const errorData = resp.status === 429 || resp.status === 402 ? await resp.json() : null;
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

      // Flush remaining
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
          } catch {}
        }
      }

      setConnection({ status: "connected", retryCount: 0 });

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

  const clearHistory = () => {
    const fresh: Message[] = [{ role: 'assistant', content: MODE_GREETINGS[mode] }];
    setMessages(fresh);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setShowMenu(true);
  };

  if (!mounted) return null;

  const quickActions = getQuickActions(mode);

  const portalContent = (
    <>
      {/* ─── Floating Orb — draggable + auto-dodge ─── */}
      <button
        id={anchorId}
        ref={orbRef}
        type="button"
        onClick={(e) => {
          if (isDragging.current) { e.preventDefault(); return; }
          toggle();
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        aria-label="DECODE — substrate voice"
        className={cn(
          "group cursor-grab active:cursor-grabbing touch-manipulation select-none",
          "w-[56px] h-[56px] rounded-full grid place-items-center",
          isOpen && "scale-90 opacity-70"
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
        <span
          className="absolute inset-0 rounded-full opacity-60 group-hover:opacity-90 transition-opacity duration-500"
          style={{
            background: "conic-gradient(from 0deg, hsl(var(--neon-cyan)), hsl(var(--neon-magenta)), hsl(var(--neon-purple)), hsl(var(--neon-amber)), hsl(var(--neon-green)), hsl(var(--neon-blue)), hsl(var(--neon-cyan)))",
            filter: "blur(10px)",
            animation: "decodeOrbSpin 6s linear infinite",
          }}
        />
        <span className="absolute inset-[3px] rounded-full" style={{ background: "hsl(var(--background))", boxShadow: "inset 0 0 12px hsl(var(--neon-cyan) / 0.15)" }} />
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
        <span className="relative w-2 h-2 rounded-full" style={{
          background: "conic-gradient(from 120deg, hsl(var(--neon-cyan)), hsl(var(--neon-magenta)), hsl(var(--neon-green)), hsl(var(--neon-cyan)))",
          boxShadow: "0 0 8px hsl(var(--neon-cyan) / 0.7), 0 0 16px hsl(var(--neon-magenta) / 0.4)",
          animation: "decodeNucleusPulse 2.5s ease-in-out infinite",
        }} />
      </button>

      {/* ─── Chat Panel ─── */}
      {isOpen && (
        <div
          data-decode-panel
          className="animate-scale-in"
          style={{
            position: "fixed",
            bottom: "calc(144px + env(safe-area-inset-bottom, 0px))",
            right: 16,
            width: "min(384px, calc(100vw - 32px))",
            height: "min(560px, calc(100vh - 120px))",
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
                  <span className="font-semibold text-sm text-foreground">DECODE</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary font-medium">sovereign</span>
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
            <div className="flex items-center gap-1">
              <button type="button" onClick={clearHistory} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Clear conversation" title="Clear conversation">
                <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
              <button type="button" onClick={close} className="p-1.5 rounded-lg hover:bg-muted transition-colors" aria-label="Close chat">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <DecodeStatusBar />

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
            {showMenu && messages.length <= 2 && !isLoading && (
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
                placeholder={mode === 'support' ? "Describe your issue or type /help…" : "Speak to DECODE or type /help…"}
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
      {isOpen && (
        <div
          onClick={close}
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
