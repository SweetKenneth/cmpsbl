import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TextGenerationOptions {
  prompt: string;
  model?: string;
  max_tokens?: number;
  project_id?: string;
}

interface ImageGenerationOptions {
  prompt: string;
  style?: string;
  resolution?: string;
  project_id?: string;
}

interface VideoGenerationOptions {
  prompt: string;
  duration?: number;
  format?: string;
  priority?: 'low' | 'medium' | 'high';
  project_id?: string;
}

export const useCreativeGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateText = async (options: TextGenerationOptions) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-nexus-text', {
        body: options
      });

      if (error) throw error;

      if (data.cached) {
        toast.success('Retrieved from cache');
      } else {
        toast.success(`Text generated with ${data.provider} (${data.model})`);
      }

      return data;
    } catch (error: any) {
      toast.error(`Text generation failed: ${error.message}`);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateImage = async (options: ImageGenerationOptions) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-nexus-image', {
        body: options
      });

      if (error) throw error;

      if (data.cached) {
        toast.success('Image retrieved from cache');
      } else {
        toast.success('Image generated successfully');
      }

      return data;
    } catch (error: any) {
      toast.error(`Image generation failed: ${error.message}`);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVideo = async (options: VideoGenerationOptions) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-nexus-video', {
        body: options
      });

      if (error) throw error;

      if (data.status === 'queued') {
        toast.info('Video generation queued. This may take 2-5 minutes.');
      } else if (data.cached) {
        toast.success('Video retrieved from cache');
      }

      return data;
    } catch (error: any) {
      toast.error(`Video generation failed: ${error.message}`);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateText,
    generateImage,
    generateVideo,
    isGenerating
  };
};
