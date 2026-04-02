/**
 * useWorkbenchItems — Cross-device workbench persistence via database
 * Falls back to localStorage for unauthenticated state (shouldn't happen since workbench requires auth)
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useWorkbenchItems() {
  const { user } = useAuth();
  const [itemIds, setItemIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch from DB on mount / user change
  useEffect(() => {
    if (!user) {
      setItemIds([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      const { data, error } = await supabase
        .from('workbench_items')
        .select('item_id, added_at')
        .eq('user_id', user!.id)
        .order('added_at', { ascending: false });

      if (cancelled) return;

      if (error) {
        // Fallback to localStorage if DB fails
        const stored = localStorage.getItem('cmpsbl_workbench_items');
        setItemIds(stored ? JSON.parse(stored) : []);
      } else {
        const ids = (data || []).map(r => r.item_id);
        setItemIds(ids);
        // Sync to localStorage for offline access
        localStorage.setItem('cmpsbl_workbench_items', JSON.stringify(ids));
      }
      setLoading(false);
    }

    load();

    // Migrate localStorage items to DB on first load
    migrateLocalStorage(user.id);

    return () => { cancelled = true; };
  }, [user]);

  const addItem = useCallback(async (itemId: string) => {
    if (!user) return;
    
    // Optimistic update
    setItemIds(prev => {
      if (prev.includes(itemId)) return prev;
      const next = [itemId, ...prev];
      localStorage.setItem('cmpsbl_workbench_items', JSON.stringify(next));
      return next;
    });

    await supabase.from('workbench_items').insert({
      user_id: user.id,
      item_id: itemId,
    });
  }, [user]);

  const removeItem = useCallback(async (itemId: string) => {
    if (!user) return;

    // Optimistic update
    setItemIds(prev => {
      const next = prev.filter(id => id !== itemId);
      localStorage.setItem('cmpsbl_workbench_items', JSON.stringify(next));
      return next;
    });

    await supabase.from('workbench_items')
      .delete()
      .eq('user_id', user.id)
      .eq('item_id', itemId);
  }, [user]);

  const hasItem = useCallback((itemId: string) => itemIds.includes(itemId), [itemIds]);

  return { itemIds, loading, addItem, removeItem, hasItem };
}

/** One-time migration: push localStorage items to DB */
async function migrateLocalStorage(userId: string) {
  const KEY = 'cmpsbl_workbench_migrated';
  if (localStorage.getItem(KEY)) return;

  const stored = localStorage.getItem('cmpsbl_workbench_items');
  if (!stored) {
    localStorage.setItem(KEY, '1');
    return;
  }

  const ids: string[] = JSON.parse(stored);
  if (ids.length === 0) {
    localStorage.setItem(KEY, '1');
    return;
  }

  // Upsert all items (ignore conflicts)
  const rows = ids.map(item_id => ({ user_id: userId, item_id }));
  await supabase.from('workbench_items').upsert(rows, { onConflict: 'user_id,item_id' });
  localStorage.setItem(KEY, '1');
}
