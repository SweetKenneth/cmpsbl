/**
 * Realtime data subscription hook
 * Subscribe to Supabase realtime channels for live updates
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface UseRealtimeOptions<T> {
  table: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  onData?: (payload: T) => void;
}

export function useRealtime<T = any>(options: UseRealtimeOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    const channelName = `realtime:${options.table}`;
    
    const realtimeChannel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as any,
        {
          event: options.event || '*',
          schema: 'public',
          table: options.table,
          filter: options.filter,
        },
        (payload: any) => {
          const newData = payload.new as T;
          setData(newData);
          
          if (options.onData) {
            options.onData(newData);
          }
        }
      )
      .subscribe();

    setChannel(realtimeChannel);

    return () => {
      if (realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, [options.table, options.event, options.filter]);

  return { data, channel };
}

/**
 * Subscribe to multiple tables at once
 */
export function useMultipleRealtime(subscriptions: UseRealtimeOptions<any>[]) {
  const [channels, setChannels] = useState<RealtimeChannel[]>([]);

  useEffect(() => {
    const newChannels = subscriptions.map((sub, index) => {
      return supabase
        .channel(`realtime:${sub.table}:${index}`)
        .on(
          'postgres_changes' as any,
          {
            event: sub.event || '*',
            schema: 'public',
            table: sub.table,
            filter: sub.filter,
          },
          (payload: any) => {
            if (sub.onData) {
              sub.onData(payload.new);
            }
          }
        )
        .subscribe();
    });

    setChannels(newChannels);

    return () => {
      newChannels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [subscriptions.length]);

  return channels;
}
