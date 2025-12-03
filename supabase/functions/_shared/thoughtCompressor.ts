/**
 * Thought Compression Utility
 * Reduces long-form memories to semantic essentials using AI reasoning
 */

/**
 * Compress a thought into its core semantic meaning
 * Uses OpenAI o3-mini for efficient, high-quality compression
 */
export async function compressThought(text: string): Promise<{
  summary: string;
  ratio: number;
}> {
  if (!text || text.length < 200) {
    return { summary: text, ratio: 1.0 };
  }

  try {
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiKey) {
      console.warn('OPENAI_API_KEY not configured, returning original text');
      return { summary: text.substring(0, 500), ratio: text.length / 500 };
    }

    const prompt = `Compress this into essential technical and conceptual insights. Remove fluff, keep factual and causal links only. Be concise but preserve meaning:\n\n${text.substring(0, 4000)}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Fast, efficient for summarization
        messages: [
          {
            role: 'system',
            content: 'You are a semantic compression engine. Extract core meaning from text while preserving key technical details and relationships.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI compression error:', response.status, errorText);
      return { summary: text.substring(0, 500), ratio: text.length / 500 };
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || text.substring(0, 500);
    const ratio = text.length / Math.max(1, summary.length);

    return { summary, ratio };
  } catch (error) {
    console.error('Thought compression failed:', error);
    return { summary: text.substring(0, 500), ratio: text.length / 500 };
  }
}

/**
 * Batch compress multiple thoughts efficiently
 */
export async function compressBatch(
  entries: Array<{ id: string; content: string }>
): Promise<Array<{ id: string; summary: string; ratio: number }>> {
  const results = [];
  
  for (const entry of entries) {
    const compressed = await compressThought(entry.content);
    results.push({
      id: entry.id,
      summary: compressed.summary,
      ratio: compressed.ratio
    });
    
    // Rate limiting: small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}
