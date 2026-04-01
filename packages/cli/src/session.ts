/**
 * CMPSBL® CLI — Session Continuity & Agent Personality
 * 
 * Manages: session bookmarks, agent identity, task ledger,
 * pins, streaks, welcome-back, and DREAM-powered projections.
 * 
 * All state lives in ~/.cmpsbl/session/ as JSON files.
 * Zero infrastructure. Zero API calls. Pure filesystem.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface AgentIdentity {
  name: string;
  namedAt: string;
  namedBy: string; // 'cli' | 'sdk' | 'export'
}

export interface SessionBookmark {
  summary: string;
  lastCommand: string;
  timestamp: string;
  workingDir: string;
  memoriesStored: number;
  discoveryCount: number;
}

export interface TodoItem {
  id: string;
  text: string;
  createdAt: string;
  completedAt: string | null;
  priority: 'normal' | 'high';
}

export interface PinItem {
  id: string;
  text: string;
  pinnedAt: string;
  source: string; // which command/context created it
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  totalSessions: number;
  totalMemoriesStored: number;
  totalTasksCompleted: number;
  totalPins: number;
}

export interface SessionState {
  identity: AgentIdentity | null;
  bookmark: SessionBookmark | null;
  todos: TodoItem[];
  pins: PinItem[];
  streak: StreakData;
  sessionHistory: Array<{ date: string; commands: number; memoriesStored: number }>;
}

// ═══════════════════════════════════════════════════════════════
// Paths
// ═══════════════════════════════════════════════════════════════

const SESSION_DIR = path.join(os.homedir(), '.cmpsbl', 'session');
const STATE_FILE = path.join(SESSION_DIR, 'state.json');

function ensureDir(): void {
  if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
  }
}

// ═══════════════════════════════════════════════════════════════
// State persistence
// ═══════════════════════════════════════════════════════════════

const DEFAULT_STATE: SessionState = {
  identity: null,
  bookmark: null,
  todos: [],
  pins: [],
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    totalSessions: 0,
    totalMemoriesStored: 0,
    totalTasksCompleted: 0,
    totalPins: 0,
  },
  sessionHistory: [],
};

function loadState(): SessionState {
  try {
    if (!fs.existsSync(STATE_FILE)) return { ...DEFAULT_STATE, todos: [], pins: [], sessionHistory: [] };
    const raw = fs.readFileSync(STATE_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    return {
      identity: parsed.identity ?? null,
      bookmark: parsed.bookmark ?? null,
      todos: Array.isArray(parsed.todos) ? parsed.todos : [],
      pins: Array.isArray(parsed.pins) ? parsed.pins : [],
      streak: parsed.streak ?? { ...DEFAULT_STATE.streak },
      sessionHistory: Array.isArray(parsed.sessionHistory) ? parsed.sessionHistory : [],
    };
  } catch {
    return { ...DEFAULT_STATE, todos: [], pins: [], sessionHistory: [] };
  }
}

function saveState(state: SessionState): void {
  ensureDir();
  // Cap history to prevent unbounded growth
  if (state.sessionHistory.length > 90) {
    state.sessionHistory = state.sessionHistory.slice(-90);
  }
  if (state.todos.length > 100) {
    // Keep 50 most recent, prioritize incomplete
    const incomplete = state.todos.filter(t => !t.completedAt);
    const completed = state.todos.filter(t => t.completedAt).slice(-20);
    state.todos = [...incomplete, ...completed].slice(-100);
  }
  if (state.pins.length > 50) {
    state.pins = state.pins.slice(-50);
  }
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ═══════════════════════════════════════════════════════════════
// Identity
// ═══════════════════════════════════════════════════════════════

export function getAgentName(): string | null {
  return loadState().identity?.name ?? null;
}

export function setAgentName(name: string, source: string = 'cli'): AgentIdentity {
  const state = loadState();
  const identity: AgentIdentity = {
    name: name.trim(),
    namedAt: new Date().toISOString(),
    namedBy: source,
  };
  state.identity = identity;
  saveState(state);
  return identity;
}

// ═══════════════════════════════════════════════════════════════
// Session Bookmarks
// ═══════════════════════════════════════════════════════════════

export function saveBookmark(summary: string, lastCommand: string, memoriesStored: number = 0, discoveryCount: number = 0): void {
  const state = loadState();
  state.bookmark = {
    summary,
    lastCommand,
    timestamp: new Date().toISOString(),
    workingDir: process.cwd(),
    memoriesStored,
    discoveryCount,
  };
  saveState(state);
}

export function getBookmark(): SessionBookmark | null {
  return loadState().bookmark;
}

export function clearBookmark(): void {
  const state = loadState();
  state.bookmark = null;
  saveState(state);
}

// ═══════════════════════════════════════════════════════════════
// Streak tracking
// ═══════════════════════════════════════════════════════════════

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export function recordSessionStart(): StreakData {
  const state = loadState();
  const today = todayStr();

  if (state.streak.lastActiveDate === today) {
    // Already recorded today
    return state.streak;
  }

  // Update streak
  if (state.streak.lastActiveDate === yesterdayStr()) {
    state.streak.currentStreak += 1;
  } else if (state.streak.lastActiveDate !== today) {
    state.streak.currentStreak = 1;
  }

  if (state.streak.currentStreak > state.streak.longestStreak) {
    state.streak.longestStreak = state.streak.currentStreak;
  }

  state.streak.lastActiveDate = today;
  state.streak.totalSessions += 1;

  // Add to session history
  state.sessionHistory.push({ date: today, commands: 0, memoriesStored: 0 });

  saveState(state);
  return state.streak;
}

export function getStreak(): StreakData {
  return loadState().streak;
}

export function incrementMemoryCount(): void {
  const state = loadState();
  state.streak.totalMemoriesStored += 1;
  saveState(state);
}

// ═══════════════════════════════════════════════════════════════
// Task Ledger
// ═══════════════════════════════════════════════════════════════

export function addTodo(text: string, priority: 'normal' | 'high' = 'normal'): TodoItem {
  const state = loadState();
  const item: TodoItem = {
    id: `todo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    text: text.trim(),
    createdAt: new Date().toISOString(),
    completedAt: null,
    priority,
  };
  state.todos.push(item);
  saveState(state);
  return item;
}

export function completeTodo(idOrIndex: string): TodoItem | null {
  const state = loadState();
  // Try by index first (1-based)
  const idx = parseInt(idOrIndex, 10);
  const incomplete = state.todos.filter(t => !t.completedAt);

  let target: TodoItem | undefined;
  if (!isNaN(idx) && idx >= 1 && idx <= incomplete.length) {
    target = incomplete[idx - 1];
  } else {
    target = state.todos.find(t => t.id === idOrIndex && !t.completedAt);
  }

  if (!target) return null;
  target.completedAt = new Date().toISOString();
  state.streak.totalTasksCompleted += 1;
  saveState(state);
  return target;
}

export function removeTodo(idOrIndex: string): boolean {
  const state = loadState();
  const idx = parseInt(idOrIndex, 10);
  const incomplete = state.todos.filter(t => !t.completedAt);

  let targetId: string | undefined;
  if (!isNaN(idx) && idx >= 1 && idx <= incomplete.length) {
    targetId = incomplete[idx - 1]?.id;
  } else {
    targetId = idOrIndex;
  }

  const before = state.todos.length;
  state.todos = state.todos.filter(t => t.id !== targetId);
  if (state.todos.length < before) {
    saveState(state);
    return true;
  }
  return false;
}

export function getTodos(includeCompleted: boolean = false): TodoItem[] {
  const state = loadState();
  if (includeCompleted) return state.todos;
  return state.todos.filter(t => !t.completedAt);
}

// ═══════════════════════════════════════════════════════════════
// Pins
// ═══════════════════════════════════════════════════════════════

export function addPin(text: string, source: string = 'cli'): PinItem {
  const state = loadState();
  const pin: PinItem = {
    id: `pin-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    text: text.trim(),
    pinnedAt: new Date().toISOString(),
    source,
  };
  state.pins.push(pin);
  state.streak.totalPins += 1;
  saveState(state);
  return pin;
}

export function removePin(idOrIndex: string): boolean {
  const state = loadState();
  const idx = parseInt(idOrIndex, 10);

  let targetId: string | undefined;
  if (!isNaN(idx) && idx >= 1 && idx <= state.pins.length) {
    targetId = state.pins[idx - 1]?.id;
  } else {
    targetId = idOrIndex;
  }

  const before = state.pins.length;
  state.pins = state.pins.filter(p => p.id !== targetId);
  if (state.pins.length < before) {
    saveState(state);
    return true;
  }
  return false;
}

export function getPins(): PinItem[] {
  return loadState().pins;
}

// ═══════════════════════════════════════════════════════════════
// Welcome-Back Generation
// ═══════════════════════════════════════════════════════════════

export interface WelcomeBackData {
  agentName: string;
  timeSinceLastSession: string;
  bookmark: SessionBookmark | null;
  streak: StreakData;
  openTodos: TodoItem[];
  pins: PinItem[];
  urgentTodos: TodoItem[]; // todos that are getting old
}

function formatTimeSince(isoTimestamp: string): string {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h ago`;
}

function daysSince(isoTimestamp: string): number {
  return Math.floor((Date.now() - new Date(isoTimestamp).getTime()) / 86400000);
}

export function getWelcomeBackData(): WelcomeBackData {
  const state = loadState();
  const agentName = state.identity?.name ?? 'Substrate';
  const openTodos = state.todos.filter(t => !t.completedAt);
  const urgentTodos = openTodos.filter(t => daysSince(t.createdAt) >= 2);

  return {
    agentName,
    timeSinceLastSession: state.bookmark?.timestamp ? formatTimeSince(state.bookmark.timestamp) : 'first session',
    bookmark: state.bookmark,
    streak: state.streak,
    openTodos,
    pins: state.pins,
    urgentTodos,
  };
}

// ═══════════════════════════════════════════════════════════════
// Full State Access (for JSON mode)
// ═══════════════════════════════════════════════════════════════

export function getFullState(): SessionState {
  return loadState();
}
