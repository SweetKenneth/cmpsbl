/**
 * Example: AI Chatbot with Memory
 * 
 * A conversational AI that remembers context and learns from interactions.
 * 
 * BYOK: You must provide your own API keys.
 */

import { SubstrateClient } from '../substrate-client';

// Initialize substrate with your credentials
const substrate = new SubstrateClient({
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!
});

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

class MemoryChatbot {
  private sessionId: string;
  private history: ChatMessage[] = [];

  constructor(sessionId: string) {
    this.sessionId = sessionId;
  }

  async chat(userMessage: string): Promise<string> {
    // 1. Recall relevant context from memory
    const context = await substrate.brain.query(userMessage, 5);
    
    // 2. Extract intent for smarter routing
    const intent = await substrate.decode.intent(userMessage);
    
    // 3. Chat with context
    const response = await substrate.decode.chat(userMessage, this.sessionId);
    
    if (!response.success || !response.data) {
      throw new Error(response.error || 'Chat failed');
    }

    const reply = (response.data as any).reply || 'I understand.';

    // 4. Store in memory for future context
    await substrate.brain.learn(
      `User asked: ${userMessage}\nAssistant replied: ${reply}`,
      'conversation'
    );

    // 5. Track in history
    this.history.push(
      { role: 'user', content: userMessage, timestamp: new Date() },
      { role: 'assistant', content: reply, timestamp: new Date() }
    );

    return reply;
  }

  async reflect(): Promise<void> {
    // Trigger reflection to consolidate learnings
    await substrate.brain.reflect();
  }

  getHistory(): ChatMessage[] {
    return this.history;
  }
}

// Usage example
async function main() {
  const chatbot = new MemoryChatbot('session_' + Date.now());

  console.log('Chatbot ready. Type your messages.\n');

  // Simulate conversation
  const messages = [
    'What is machine learning?',
    'How does it relate to AI?',
    'Can you give an example?'
  ];

  for (const msg of messages) {
    console.log(`You: ${msg}`);
    const reply = await chatbot.chat(msg);
    console.log(`Bot: ${reply}\n`);
  }

  // Reflect on the conversation
  await chatbot.reflect();
  console.log('Session complete. Memory updated.');
}

main().catch(console.error);
