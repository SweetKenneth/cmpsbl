/**
 * Terminal Watch Mode
 * Execute commands on a schedule and display updates
 */

import { useState, useCallback, useRef, useEffect } from 'react';

export interface WatchSession {
  id: string;
  command: string;
  interval: number; // seconds
  startedAt: Date;
  lastRun: Date | null;
  runCount: number;
  isActive: boolean;
}

export interface WatchResult {
  timestamp: Date;
  output: string;
  success: boolean;
}

export function useTerminalWatch() {
  const [sessions, setSessions] = useState<Map<string, WatchSession>>(new Map());
  const [results, setResults] = useState<Map<string, WatchResult[]>>(new Map());
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach(timer => clearInterval(timer));
      timersRef.current.clear();
    };
  }, []);

  const startWatch = useCallback((
    command: string, 
    interval: number, 
    onTick: (cmd: string) => Promise<{ success: boolean; output: string }>
  ) => {
    const id = `watch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: WatchSession = {
      id,
      command,
      interval,
      startedAt: new Date(),
      lastRun: null,
      runCount: 0,
      isActive: true,
    };

    setSessions(prev => new Map(prev).set(id, session));
    setResults(prev => new Map(prev).set(id, []));

    // Execute immediately
    const runCommand = async () => {
      const result = await onTick(command);
      const watchResult: WatchResult = {
        timestamp: new Date(),
        output: result.output,
        success: result.success,
      };

      setSessions(prev => {
        const updated = new Map(prev);
        const s = updated.get(id);
        if (s) {
          updated.set(id, { ...s, lastRun: new Date(), runCount: s.runCount + 1 });
        }
        return updated;
      });

      setResults(prev => {
        const updated = new Map(prev);
        const existing = updated.get(id) || [];
        // Keep last 10 results
        updated.set(id, [...existing, watchResult].slice(-10));
        return updated;
      });
    };

    runCommand();

    // Set up interval
    const timer = setInterval(runCommand, interval * 1000);
    timersRef.current.set(id, timer);

    return id;
  }, []);

  const stopWatch = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearInterval(timer);
      timersRef.current.delete(id);
    }

    setSessions(prev => {
      const updated = new Map(prev);
      const session = updated.get(id);
      if (session) {
        updated.set(id, { ...session, isActive: false });
      }
      return updated;
    });
  }, []);

  const stopAllWatches = useCallback(() => {
    timersRef.current.forEach(timer => clearInterval(timer));
    timersRef.current.clear();

    setSessions(prev => {
      const updated = new Map(prev);
      updated.forEach((session, id) => {
        updated.set(id, { ...session, isActive: false });
      });
      return updated;
    });
  }, []);

  const getSession = useCallback((id: string) => sessions.get(id), [sessions]);
  const getResults = useCallback((id: string) => results.get(id) || [], [results]);
  const getActiveSessions = useCallback(() => 
    Array.from(sessions.values()).filter(s => s.isActive), 
    [sessions]
  );

  return {
    sessions,
    results,
    startWatch,
    stopWatch,
    stopAllWatches,
    getSession,
    getResults,
    getActiveSessions,
  };
}

export function formatWatchOutput(session: WatchSession, results: WatchResult[]): string {
  const duration = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
  
  let output = `
┌─ WATCH: ${session.command} ──────────────────────────────────────
│
│  Interval: ${session.interval}s │ Runs: ${session.runCount} │ Duration: ${duration}s
│  Status: ${session.isActive ? '● ACTIVE' : '○ STOPPED'}
│
├─ LATEST RESULTS ─────────────────────────────────────────────
│
`;

  if (results.length === 0) {
    output += `│  Waiting for first result...\n`;
  } else {
    const latest = results[results.length - 1];
    output += `│  ${latest.success ? '✓' : '✗'} ${latest.timestamp.toLocaleTimeString()}\n`;
    output += `│\n`;
    // Indent the output
    const lines = latest.output.split('\n').slice(0, 15);
    lines.forEach(line => {
      output += `│  ${line}\n`;
    });
    if (results[results.length - 1].output.split('\n').length > 15) {
      output += `│  ... (truncated)\n`;
    }
  }

  output += `│\n│  Press Ctrl+C or run 'watch stop ${session.id.slice(0, 8)}' to stop\n`;
  output += `└──────────────────────────────────────────────────────────────`;
  return output;
}

export function formatWatchListOutput(sessions: WatchSession[]): string {
  if (sessions.length === 0) {
    return '◉ No active watch sessions.';
  }

  let output = `
┌─ ACTIVE WATCH SESSIONS ──────────────────────────────────────
│
`;

  sessions.forEach((session, i) => {
    const shortId = session.id.slice(0, 8);
    const duration = Math.floor((Date.now() - session.startedAt.getTime()) / 1000);
    output += `│  ${i + 1}. [${shortId}] ${session.command}\n`;
    output += `│     Interval: ${session.interval}s │ Runs: ${session.runCount} │ ${duration}s elapsed\n`;
  });

  output += `│\n│  watch stop <id> to stop a session\n`;
  output += `│  watch stop all to stop all sessions\n`;
  output += `└──────────────────────────────────────────────────────────────`;
  return output;
}
