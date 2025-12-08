/**
 * FREE-ONLY AI Routing
 * Routes requests across 6 free providers with zero paid APIs
 * Groq (PRIMARY) → Cerebras → Google → Together → DeepSeek → Hyperbolic
 */

export interface FreeTierConfig {
  maxTokens?: number;
  temperature?: number;
  systemPrompt?: string;
}

export async function callFreeTierAI(
  prompt: string,
  config: FreeTierConfig = {}
): Promise<{ content: string; model: string; provider: string }> {
  
  const { maxTokens = 800, temperature = 0.2, systemPrompt = '' } = config;
  
  const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
  const CEREBRAS_API_KEY = Deno.env.get('CEREBRAS_API_KEY');
  const GOOGLE_AI_KEY = Deno.env.get('GOOGLE_AI_STUDIO_KEY');
  const TOGETHER_API_KEY = Deno.env.get('TOGETHER_API_KEY');
  const DEEPSEEK_API_KEY = Deno.env.get('DEEPSEEK_API_KEY');
  const HYPERBOLIC_API_KEY = Deno.env.get('HYPERBOLIC_API_KEY');
  
  // Try providers in order - GROQ IS PRIMARY
  
  try {
    // 1. Groq (PRIMARY - Fast and reliable)
    if (GROQ_API_KEY) {
      console.log('🚀 Attempting Groq (Primary Provider)...');
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: systemPrompt
            ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
            : [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Groq responded successfully');
        return {
          content: data.choices[0].message.content,
          model: 'llama-3.3-70b-versatile',
          provider: 'groq'
        };
      }
      console.log('⚠️ Groq returned non-ok status:', response.status);
    }
  } catch (e) {
    console.log('Groq failed, trying Cerebras...', e);
  }
  
  try {
    // 2. Cerebras (Secondary - Very fast inference)
    if (CEREBRAS_API_KEY) {
      console.log('🔄 Attempting Cerebras (Secondary)...');
      const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${CEREBRAS_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b',
          messages: systemPrompt 
            ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
            : [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Cerebras responded successfully');
        return {
          content: data.choices[0].message.content,
          model: 'llama-3.3-70b',
          provider: 'cerebras'
        };
      }
    }
  } catch (e) {
    console.log('Cerebras failed, trying Google...');
  }
  
  try {
    // 3. Google AI Studio (Tertiary)
    if (GOOGLE_AI_KEY) {
      console.log('🔄 Attempting Google AI Studio (Tertiary)...');
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': GOOGLE_AI_KEY,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: fullPrompt }] }],
          generationConfig: { temperature, maxOutputTokens: maxTokens }
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Google responded successfully');
        return {
          content: data.candidates[0].content.parts[0].text,
          model: 'gemini-2.0-flash',
          provider: 'google'
        };
      }
    }
  } catch (e) {
    console.log('Google failed, trying Together...');
  }
  
  try {
    // 4. Together AI
    if (TOGETHER_API_KEY) {
      console.log('🔄 Attempting Together AI...');
      const response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${TOGETHER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.1-70B-Instruct-Turbo',
          messages: systemPrompt
            ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
            : [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Together responded successfully');
        return {
          content: data.choices[0].message.content,
          model: 'llama-3.1-70b-turbo',
          provider: 'together'
        };
      }
    }
  } catch (e) {
    console.log('Together failed, trying DeepSeek...');
  }
  
  try {
    // 5. DeepSeek
    if (DEEPSEEK_API_KEY) {
      console.log('🔄 Attempting DeepSeek...');
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: systemPrompt
            ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
            : [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ DeepSeek responded successfully');
        return {
          content: data.choices[0].message.content,
          model: 'deepseek-chat',
          provider: 'deepseek'
        };
      }
    }
  } catch (e) {
    console.log('DeepSeek failed, trying Hyperbolic...');
  }
  
  try {
    // 6. Hyperbolic (Last resort)
    if (HYPERBOLIC_API_KEY) {
      console.log('🔄 Attempting Hyperbolic (Last Resort)...');
      const response = await fetch('https://api.hyperbolic.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${HYPERBOLIC_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-3.1-70B-Instruct',
          messages: systemPrompt
            ? [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }]
            : [{ role: 'user', content: prompt }],
          temperature,
          max_tokens: maxTokens,
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Hyperbolic responded successfully');
        return {
          content: data.choices[0].message.content,
          model: 'llama-3.1-70b',
          provider: 'hyperbolic'
        };
      }
    }
  } catch (e) {
    console.error('All providers failed:', e);
  }
  
  throw new Error('All 6 free providers exhausted or unavailable');
}
