import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface DevTemplate {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  difficulty: string;
  is_featured: boolean;
  install_count: number;
  required_modules: string[];
  default_config: Record<string, unknown>;
  sdk_snippet?: string;
  example_code?: string;
  created_at: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  count: number;
  icon: string;
}

export function useDevTemplates(category?: string) {
  return useQuery({
    queryKey: ["dev-templates", category],
    queryFn: async () => {
      let query = supabase
        .from("developer_templates")
        .select("*")
        .eq("is_active", true)
        .order("is_featured", { ascending: false })
        .order("install_count", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as unknown as DevTemplate[];
    },
  });
}

export function useTemplateCategories() {
  return useQuery({
    queryKey: ["template-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("developer_templates")
        .select("category")
        .eq("is_active", true);

      if (error) throw error;

      const counts = (data || []).reduce((acc: Record<string, number>, t: any) => {
        acc[t.category] = (acc[t.category] || 0) + 1;
        return acc;
      }, {});

      return [
        { id: "all", name: "All Templates", count: data?.length || 0, icon: "📦" },
        { id: "gaming", name: "Gaming", count: counts["gaming"] || 0, icon: "🎮" },
        { id: "world_engine", name: "World Engine", count: counts["world_engine"] || 0, icon: "🌍" },
        { id: "chatbot", name: "Chatbot", count: counts["chatbot"] || 0, icon: "💬" },
        { id: "agent", name: "AI Agent", count: counts["agent"] || 0, icon: "🤖" },
        { id: "rag", name: "RAG Pipeline", count: counts["rag"] || 0, icon: "📚" },
        { id: "utility", name: "Utility", count: counts["utility"] || 0, icon: "🔧" },
      ] as TemplateCategory[];
    },
  });
}

export function useInstallTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ slug }: { slug: string; developerId: string }) => {
      const { data: template } = await supabase
        .from("developer_templates")
        .select("*")
        .eq("slug", slug)
        .single();

      if (template) {
        await supabase
          .from("developer_templates")
          .update({ install_count: ((template as any).install_count || 0) + 1 })
          .eq("id", (template as any).id);
      }

      return template as unknown as DevTemplate;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dev-templates"] });
    },
  });
}
