/**
 * Enhanced Terminal History with Ctrl+R Search
 */

import { useState, useCallback, useMemo } from 'react';

export interface HistoryEntry {
  command: string;
  timestamp: Date;
  success: boolean;
}

const MAX_HISTORY_SIZE = 200;
const STORAGE_KEY = 'substrate_command_history';

// Load persisted history
function loadHistory(): HistoryEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as HistoryEntry[];
      return parsed.map(e => ({ ...e, timestamp: new Date(e.timestamp) }));
    }
  } catch (e) {
    console.warn('Failed to load command history');
  }
  return [];
}

function saveHistory(history: HistoryEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_HISTORY_SIZE)));
  } catch (e) {
    console.warn('Failed to save command history');
  }
}

export function useTerminalHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  const [searchMode, setSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchIndex, setSearchIndex] = useState(0);

  // Filtered results for search
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return history
      .filter(e => e.command.toLowerCase().includes(query))
      .reverse(); // Most recent first
  }, [history, searchQuery]);

  const addEntry = useCallback((command: string, success: boolean) => {
    const entry: HistoryEntry = { command, timestamp: new Date(), success };
    setHistory(prev => {
      // Avoid duplicating the most recent command
      const filtered = prev.filter(e => e.command !== command);
      const updated = [...filtered, entry].slice(-MAX_HISTORY_SIZE);
      saveHistory(updated);
      return updated;
    });
  }, []);

  const startSearch = useCallback(() => {
    setSearchMode(true);
    setSearchQuery('');
    setSearchIndex(0);
  }, []);

  const endSearch = useCallback(() => {
    setSearchMode(false);
    setSearchQuery('');
    setSearchIndex(0);
  }, []);

  const updateSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSearchIndex(0);
  }, []);

  const navigateSearch = useCallback((direction: 'up' | 'down') => {
    if (searchResults.length === 0) return;
    
    setSearchIndex(prev => {
      if (direction === 'up') {
        return Math.min(prev + 1, searchResults.length - 1);
      } else {
        return Math.max(prev - 1, 0);
      }
    });
  }, [searchResults.length]);

  const getSearchResult = useCallback(() => {
    if (searchResults.length === 0) return null;
    return searchResults[searchIndex] || null;
  }, [searchResults, searchIndex]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Format for terminal display
  const formatHistorySearch = useCallback(() => {
    if (searchResults.length === 0) {
      return searchQuery ? `(reverse-i-search) '${searchQuery}': [no match]` : `(reverse-i-search) '': `;
    }
    const current = searchResults[searchIndex];
    return `(reverse-i-search) '${searchQuery}': ${current?.command || ''}`;
  }, [searchQuery, searchResults, searchIndex]);

  const getRecentCommands = useCallback((limit = 20) => {
    return [...history].reverse().slice(0, limit);
  }, [history]);

  const getFrequentCommands = useCallback((limit = 10) => {
    const freq: Record<string, number> = {};
    history.forEach(e => {
      freq[e.command] = (freq[e.command] || 0) + 1;
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([cmd, count]) => ({ command: cmd, count }));
  }, [history]);

  return {
    history,
    addEntry,
    searchMode,
    searchQuery,
    searchResults,
    searchIndex,
    startSearch,
    endSearch,
    updateSearch,
    navigateSearch,
    getSearchResult,
    formatHistorySearch,
    clearHistory,
    getRecentCommands,
    getFrequentCommands,
  };
}

export function formatHistoryOutput(history: HistoryEntry[]): string {
  if (history.length === 0) {
    return '◉ No command history yet.';
  }

  const recent = [...history].reverse().slice(0, 50);
  
  let output = `
┌─ COMMAND HISTORY (${history.length} total) ──────────────────────────────
│
│  Ctrl+R to search • ↑↓ to navigate
│
`;

  recent.forEach((entry, i) => {
    const num = (i + 1).toString().padStart(3);
    const status = entry.success ? '✓' : '✗';
    const time = entry.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    output += `│  ${num} │ ${status} │ ${time} │ ${entry.command}\n`;
  });

  output += `│\n└──────────────────────────────────────────────────────────────`;
  return output;
}
