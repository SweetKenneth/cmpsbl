/**
 * S-Tier 031 — Context Threading Engine
 * CJPI: 94 | Node: DECODE | ID: S-103
 *
 * Manages branching conversation contexts with parent-child thread lineage,
 * enabling parallel exploration of topics without losing history.
 */

export interface ThreadMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: number;
}

export interface ConversationThread {
  id: string;
  parentId: string | null;
  branchPoint: string | null; // message ID where branch originated
  messages: ThreadMessage[];
  createdAt: number;
  label?: string;
}

export interface ThreadManager {
  createThread(label?: string): string;
  branch(threadId: string, atMessageId: string, label?: string): string;
  addMessage(threadId: string, message: Omit<ThreadMessage, 'id' | 'timestamp'>): string;
  getThread(threadId: string): ConversationThread | null;
  getLineage(threadId: string): ConversationThread[];
  listThreads(): ConversationThread[];
  mergeThreads(sourceId: string, targetId: string): void;
}

let idCounter = 0;
const nextId = (prefix: string) => `${prefix}-${++idCounter}-${Date.now().toString(36)}`;

export function createThreadManager(): ThreadManager {
  const threads = new Map<string, ConversationThread>();

  const createThread = (label?: string): string => {
    const id = nextId('thread');
    threads.set(id, { id, parentId: null, branchPoint: null, messages: [], createdAt: Date.now(), label });
    return id;
  };

  const branch = (threadId: string, atMessageId: string, label?: string): string => {
    const parent = threads.get(threadId);
    if (!parent) throw new Error(`Thread ${threadId} not found`);
    const branchIdx = parent.messages.findIndex(m => m.id === atMessageId);
    if (branchIdx === -1) throw new Error(`Message ${atMessageId} not found in thread`);

    const id = nextId('branch');
    const inheritedMessages = parent.messages.slice(0, branchIdx + 1).map(m => ({ ...m }));
    threads.set(id, { id, parentId: threadId, branchPoint: atMessageId, messages: inheritedMessages, createdAt: Date.now(), label });
    return id;
  };

  const addMessage = (threadId: string, msg: Omit<ThreadMessage, 'id' | 'timestamp'>): string => {
    const thread = threads.get(threadId);
    if (!thread) throw new Error(`Thread ${threadId} not found`);
    const id = nextId('msg');
    thread.messages.push({ ...msg, id, timestamp: Date.now() });
    return id;
  };

  const getThread = (threadId: string) => threads.get(threadId) ?? null;

  const getLineage = (threadId: string): ConversationThread[] => {
    const lineage: ConversationThread[] = [];
    let current = threads.get(threadId);
    while (current) {
      lineage.unshift(current);
      current = current.parentId ? threads.get(current.parentId) : undefined;
    }
    return lineage;
  };

  const listThreads = () => [...threads.values()];

  const mergeThreads = (sourceId: string, targetId: string) => {
    const source = threads.get(sourceId);
    const target = threads.get(targetId);
    if (!source || !target) throw new Error('Thread not found');
    const existingIds = new Set(target.messages.map(m => m.id));
    for (const msg of source.messages) {
      if (!existingIds.has(msg.id)) target.messages.push({ ...msg });
    }
    target.messages.sort((a, b) => a.timestamp - b.timestamp);
    threads.delete(sourceId);
  };

  return { createThread, branch, addMessage, getThread, getLineage, listThreads, mergeThreads };
}
