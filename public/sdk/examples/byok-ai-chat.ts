/**
 * Example: BYOK AI Chat with Multi-Provider Support
 * 
 * Use YOUR OWN API keys to make AI calls. You pay the provider directly.
 * Zero compute costs for the substrate operator.
 * 
 * BYOK: You must register your own API keys before using AI calls.
 */

import { SubstrateClient } from '../substrate-client';

// Initialize substrate with your credentials
const substrate = new SubstrateClient({
  url: process.env.SUPABASE_URL!,
  anonKey: process.env.SUPABASE_ANON_KEY!,
  developerId: process.env.DEVELOPER_ID!, // Your developer UUID
  appId: process.env.APP_ID! // Your app UUID
});

/**
 * Step 1: Register your API keys (do this once, stored encrypted)
 */
async function registerKeys() {
  // Register your OpenAI key
  await substrate.keys.register('openai', process.env.OPENAI_API_KEY!, {
    rateLimitRpm: 60 // Optional: your custom rate limit
  });

  // Register your Anthropic key
  await substrate.keys.register('anthropic', process.env.ANTHROPIC_API_KEY!);

  // Register Groq for fast inference
  await substrate.keys.register('groq', process.env.GROQ_API_KEY!);

  console.log('✓ API keys registered (encrypted at rest)');
}

/**
 * Step 2: Make AI calls using YOUR keys
 * All costs are billed directly to YOUR provider account
 */
async function chat() {
  // OpenAI GPT-4o
  const openaiResponse = await substrate.ai.chat(
    [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user', content: 'Explain quantum computing in one sentence.' }
    ],
    { 
      provider: 'openai', 
      model: 'gpt-4o',
      max_tokens: 150,
      temperature: 0.7
    }
  );
  console.log('OpenAI:', openaiResponse.data?.content);

  // Anthropic Claude
  const anthropicResponse = await substrate.ai.chat(
    [{ role: 'user', content: 'What is the meaning of life?' }],
    { provider: 'anthropic', model: 'claude-3-5-sonnet-20241022' }
  );
  console.log('Anthropic:', anthropicResponse.data?.content);

  // Groq (ultra-fast)
  const groqResponse = await substrate.ai.prompt(
    'Write a haiku about AI',
    { provider: 'groq', model: 'llama-3.3-70b-versatile' }
  );
  console.log('Groq:', groqResponse.data?.content);
}

/**
 * Step 3: Check your usage (metered per provider)
 */
async function checkUsage() {
  const usage = await substrate.keys.usage('openai', 30); // Last 30 days
  console.log('OpenAI Usage:', usage.data);

  // List all registered keys (masked)
  const keys = await substrate.keys.list();
  console.log('Registered Keys:', keys.data?.keys.map(k => ({
    provider: k.provider,
    masked: k.key_preview // Shows: sk-...xxxx
  })));
}

/**
 * Step 4: Rotate keys when needed
 */
async function rotateKey() {
  await substrate.keys.rotate('openai', process.env.NEW_OPENAI_KEY!);
  console.log('✓ OpenAI key rotated');
}

// Main
async function main() {
  console.log('=== BYOK AI Chat Example ===\n');

  // First time setup
  await registerKeys();

  // Make AI calls with YOUR keys
  await chat();

  // Check your usage
  await checkUsage();
}

main().catch(console.error);

export { registerKeys, chat, checkUsage, rotateKey };
