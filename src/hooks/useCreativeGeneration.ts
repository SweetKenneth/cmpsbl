import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TextGenerationOptions {
  prompt: string;
  model?: string;
  max_tokens?: number;
  project_id?: string;
}

export const useCreativeGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateText = async (options: TextGenerationOptions) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-substrate', {
        body: {
          module: 'nexus',
          action: 'text',
          prompt: options.prompt,
          model: options.model,
          maxTokens: options.max_tokens,
        }
      });

      if (error) throw error;

      toast.success(`Text generated with ${data.provider} (${data.model})`);

      return data;
    } catch (error: any) {
      toast.error(`Text generation failed: ${error.message}`);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateText,
    isGenerating
  };
};
