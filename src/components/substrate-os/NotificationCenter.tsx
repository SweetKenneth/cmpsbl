/**
 * Dashboard Notification Center
 * Real-time alerts for escalations, health drops, SEBA proposals, and Shadow Mesh events
 */

import { useState, useEffect, useCallback } from "react";
import { Bell, AlertTriangle, CheckCircle2, Info, Shield, Zap, X, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

type NotifLevel = "info" | "warning" | "error" | "success";

interface Notification {
  id: string;
  level: NotifLevel;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  source: string;
}

const LEVEL_CONFIG: Record<NotifLevel, { icon: React.ElementType; color: string; bg: string }> = {
  info: { icon: Info, color: "text-neon-blue", bg: "bg-neon-blue/10" },
  warning: { icon: AlertTriangle, color: "text-neon-amber", bg: "bg-neon-amber/10" },
  error: { icon: Shield, color: "text-destructive", bg: "bg-destructive/10" },
  success: { icon: CheckCircle2, color: "text-neon-green", bg: "bg-neon-green/10" },
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = useCallback(async () => {
    const notifs: Notification[] = [];

    try {
      // 1. Recent escalations (last 2 hours)
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { data: escalations } = await supabase
        .from("immune_escalations" as any)
        .select("id, executor, severity, status, created_at")
        .gte("created_at", twoHoursAgo)
        .order("created_at", { ascending: false })
        .limit(5);

      for (const esc of (escalations ?? []) as any[]) {
        notifs.push({
          id: `esc-${esc.id}`,
          level: esc.severity === "critical" ? "error" : "warning",
          title: `Escalation: ${esc.executor}`,
          message: `${esc.severity} severity · ${esc.status === "resolved" ? "Resolved" : "Open"}`,
          timestamp: new Date(esc.created_at),
          read: esc.status === "resolved",
          source: "Immunity Mesh",
        });
      }

      // 2. Recent evolution runs (SEBA proposals)
      const { data: evoRuns } = await supabase
        .from("evolution_runs" as any)
        .select("run_id, phase, strategy, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      for (const run of (evoRuns ?? []) as any[]) {
        notifs.push({
          id: `evo-${run.run_id}`,
          level: run.phase === "verified" ? "success" : "info",
          title: `SEBA ${run.phase === "verified" ? "Verified" : "Proposal"}`,
          message: `Strategy: ${run.strategy ?? "autonomous"} · Phase: ${run.phase}`,
          timestamp: new Date(run.created_at),
          read: run.phase === "verified",
          source: "SEBA",
        });
      }

      // 3. Recent audit events
      const { data: audits } = await supabase
        .from("audit_logs")
        .select("id, action, entity_type, created_at")
        .order("created_at", { ascending: false })
        .limit(3);

      for (const audit of (audits ?? []) as any[]) {
        notifs.push({
          id: `audit-${audit.id}`,
          level: "info",
          title: `Audit: ${audit.action}`,
          message: audit.entity_type ?? "system",
          timestamp: new Date(audit.created_at),
          read: true,
          source: "Audit",
        });
      }
    } catch {
      // Silent fail — notifications are non-critical
    }

    // Sort by timestamp descending
    notifs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    setNotifications(notifs);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const timeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label="Notifications">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-white"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
          <h3 className="text-sm font-bold">Notifications</h3>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2" onClick={markAllRead}>
                Mark all read
              </Button>
            )}
            <Badge variant="secondary" className="text-[9px]">
              {notifications.length}
            </Badge>
          </div>
        </div>
        
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.map((notif) => {
                const config = LEVEL_CONFIG[notif.level];
                const Icon = config.icon;
                return (
                  <div
                    key={notif.id}
                    className={cn(
                      "flex gap-3 px-4 py-3 transition-colors hover:bg-muted/30",
                      !notif.read && "bg-primary/[0.02]"
                    )}
                  >
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", config.bg)}>
                      <Icon className={cn("w-3.5 h-3.5", config.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-semibold truncate">{notif.title}</span>
                        {!notif.read && <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />}
                      </div>
                      <p className="text-[10px] text-muted-foreground truncate">{notif.message}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] text-muted-foreground/50">{timeAgo(notif.timestamp)}</span>
                        <span className="text-[9px] text-muted-foreground/30">·</span>
                        <Badge variant="outline" className="text-[8px] h-3.5 px-1">{notif.source}</Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
