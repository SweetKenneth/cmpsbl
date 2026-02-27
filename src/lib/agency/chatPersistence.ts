/**
 * Agency Chat Persistence — Store and retrieve chat messages
 * Uses secure storage for sensitive conversation data
 */

import { secureSet, secureGet, secureRemove, migrateLegacyKey } from '@/lib/system/secureStorage';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  metadata?: {
    command?: string;
    respondingMember?: string;
    processingTime?: number;
    tasksCreated?: string[];
  };
}

const STORAGE_KEY_PREFIX = 'agency_chat_';
const MAX_MESSAGES = 100;

function getStorageKey(agencyId: string): string {
  return `${STORAGE_KEY_PREFIX}${agencyId}`;
}

/**
 * Load chat messages for an agency
 */
export function loadChatMessages(agencyId: string): ChatMessage[] {
  try {
    const key = getStorageKey(agencyId);
    migrateLegacyKey(key);
    const messages = secureGet<ChatMessage[]>(key);
    if (!messages) return [];
    return messages.slice(-MAX_MESSAGES);
  } catch (err) {
    console.error('Error loading chat messages:', err);
    return [];
  }
}

/**
 * Save chat messages for an agency
 */
export function saveChatMessages(agencyId: string, messages: ChatMessage[]): void {
  try {
    const toSave = messages.slice(-MAX_MESSAGES);
    secureSet(getStorageKey(agencyId), toSave);
  } catch (err) {
    console.error('Error saving chat messages:', err);
  }
}

/**
 * Add a message and save
 */
export function addChatMessage(agencyId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage {
  const messages = loadChatMessages(agencyId);
  
  const newMessage: ChatMessage = {
    ...message,
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
  };
  
  messages.push(newMessage);
  saveChatMessages(agencyId, messages);
  
  return newMessage;
}

/**
 * Clear chat history for an agency
 */
export function clearChatHistory(agencyId: string): void {
  try {
    secureRemove(getStorageKey(agencyId));
  } catch (err) {
    console.error('Error clearing chat history:', err);
  }
}

/**
 * Get conversation summary for context
 */
export function getConversationContext(agencyId: string, lastN: number = 10): string {
  const messages = loadChatMessages(agencyId);
  const recent = messages.slice(-lastN);
  
  if (recent.length === 0) return '';
  
  return recent
    .map(m => `${m.role === 'user' ? 'User' : 'Leader'}: ${m.content.slice(0, 200)}`)
    .join('\n');
}