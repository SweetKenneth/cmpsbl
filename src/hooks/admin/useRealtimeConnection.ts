import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import { toast } from "sonner";
import { debugMode } from '@/lib/debug-mode';

interface ConnectionStatus {
  isConnected: boolean;
  lastPing?: Date;
  channels: string[];
  isReconnecting: boolean;
}

export function useRealtimeConnection() {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    channels: [],
    isReconnecting: false,
  });

  const [healthChannel, setHealthChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    // Skip if debug mode is active
    if (!debugMode.allowRealtime()) {
      setStatus(prev => ({ ...prev, isConnected: false, channels: ['debug-mode-active'] }));
      return;
    }
    
    // Create a health check channel that's always connected
    const channel = supabase
      .channel('admin-health-check')
      .on('presence', { event: 'sync' }, () => {
        setStatus(prev => ({ ...prev, isConnected: true, lastPing: new Date() }));
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setStatus(prev => ({ 
            ...prev, 
            isConnected: true, 
            lastPing: new Date(),
            channels: ['admin-health-check']
          }));
        } else if (status === 'CLOSED') {
          setStatus(prev => ({ ...prev, isConnected: false }));
        }
      });

    setHealthChannel(channel);

    // Monitor all channels (respects debug mode)
    const checkConnection = () => {
      if (!debugMode.allowPolling()) return;
      
      const channels = supabase.getChannels();
      const isConnected = channels.some(
        (ch) => ch.state === "joined" || ch.state === "joining"
      );

      setStatus(prev => ({
        ...prev,
        isConnected,
        lastPing: new Date(),
        channels: channels.map((ch) => ch.topic),
      }));
    };

    // Check every 5 seconds
    const interval = setInterval(checkConnection, 5000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const reconnect = useCallback(async () => {
    setStatus(prev => ({ ...prev, isReconnecting: true }));
    toast.info("Reconnecting to realtime services...");

    try {
      // Unsubscribe from health channel
      if (healthChannel) {
        await healthChannel.unsubscribe();
      }

      // Reconnect all channels
      const channels = supabase.getChannels();
      await Promise.all(
        channels.map(async (channel) => {
          await channel.unsubscribe();
        })
      );

      // Wait a bit before reconnecting
      await new Promise(resolve => setTimeout(resolve, 500));

      // Resubscribe to health channel
      const newChannel = supabase
        .channel('admin-health-check')
        .on('presence', { event: 'sync' }, () => {
          setStatus(prev => ({ ...prev, isConnected: true, lastPing: new Date() }));
        })
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setStatus(prev => ({ 
              ...prev, 
              isConnected: true, 
              lastPing: new Date(),
              isReconnecting: false,
              channels: ['admin-health-check']
            }));
            toast.success("Reconnected successfully!");
          } else if (status === 'CHANNEL_ERROR') {
            setStatus(prev => ({ ...prev, isConnecting: false }));
            toast.error("Reconnection failed. Please refresh the page.");
          }
        });

      setHealthChannel(newChannel);
    } catch (error) {
      console.error("Error reconnecting:", error);
      setStatus(prev => ({ ...prev, isReconnecting: false }));
      toast.error("Failed to reconnect. Please refresh the page.");
    }
  }, [healthChannel]);

  return { status, reconnect };
}
