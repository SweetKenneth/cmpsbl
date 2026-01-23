-- Create substrate install configuration table
CREATE TABLE public.substrate_install_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.substrate_install_config ENABLE ROW LEVEL SECURITY;

-- Allow read access for everyone (install config is public)
CREATE POLICY "Anyone can view install config"
  ON public.substrate_install_config FOR SELECT
  USING (true);

-- Only operators can modify
CREATE POLICY "Operators can manage install config"
  ON public.substrate_install_config FOR ALL
  USING (public.has_role_text(auth.uid(), 'operator') OR public.has_role_text(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_install_config_timestamp
  BEFORE UPDATE ON public.substrate_install_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default homepage themes
INSERT INTO public.substrate_install_config (config_key, config_value) VALUES 
('homepage_themes', '{
  "dark_professional": {
    "name": "Dark Professional",
    "description": "Sleek dark theme with cyan accents",
    "primary": "180 100% 50%",
    "secondary": "220 80% 60%",
    "background": "240 10% 5%",
    "foreground": "0 0% 95%"
  },
  "light_corporate": {
    "name": "Light Corporate",
    "description": "Clean light theme for enterprise",
    "primary": "220 80% 55%",
    "secondary": "200 70% 50%",
    "background": "0 0% 98%",
    "foreground": "220 10% 15%"
  },
  "minimal_mono": {
    "name": "Minimal Mono",
    "description": "Minimalist black and white",
    "primary": "0 0% 10%",
    "secondary": "0 0% 40%",
    "background": "0 0% 100%",
    "foreground": "0 0% 5%"
  },
  "neon_cyber": {
    "name": "Neon Cyber",
    "description": "Vibrant cyberpunk aesthetic",
    "primary": "160 100% 50%",
    "secondary": "280 100% 60%",
    "background": "260 20% 8%",
    "foreground": "0 0% 95%"
  }
}'::jsonb),
('homepage_layouts', '{
  "full_marketing": {
    "name": "Full Marketing",
    "description": "Complete landing page with hero, features, pricing",
    "sections": ["hero", "features", "modules", "pricing", "cta"]
  },
  "dashboard_only": {
    "name": "Dashboard Only",
    "description": "Direct access to dashboard, no marketing pages",
    "sections": ["login_redirect"]
  },
  "minimal_landing": {
    "name": "Minimal Landing",
    "description": "Simple landing with quick login access",
    "sections": ["hero_minimal", "cta"]
  }
}'::jsonb),
('module_defaults', '{
  "core": {"enabled": true, "required": true},
  "ripple": {"enabled": true, "required": true},
  "access": {"enabled": true, "required": true},
  "brain": {"enabled": true, "required": false},
  "decode": {"enabled": true, "required": false},
  "defense": {"enabled": true, "required": false},
  "nexus": {"enabled": false, "required": false},
  "vision": {"enabled": false, "required": false},
  "dream": {"enabled": false, "required": false},
  "system": {"enabled": true, "required": true},
  "modernizer": {"enabled": false, "required": false}
}'::jsonb),
('ai_providers', '{
  "groq": {"name": "Groq", "models": ["llama-3.3-70b-versatile", "mixtral-8x7b-32768"], "required_secret": "GROQ_API_KEY"},
  "cerebras": {"name": "Cerebras", "models": ["llama-3.3-70b"], "required_secret": "CEREBRAS_API_KEY"},
  "deepseek": {"name": "DeepSeek", "models": ["deepseek-chat", "deepseek-reasoner"], "required_secret": "DEEPSEEK_API_KEY"},
  "google": {"name": "Google AI", "models": ["gemini-2.0-flash", "gemini-1.5-pro"], "required_secret": "GOOGLE_AI_API_KEY"},
  "together": {"name": "Together AI", "models": ["meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo"], "required_secret": "TOGETHER_API_KEY"},
  "openai": {"name": "OpenAI", "models": ["gpt-4o", "gpt-4o-mini"], "required_secret": "OPENAI_API_KEY"}
}'::jsonb),
('storage_quotas', '{
  "memory_hot_limit": 1000,
  "memory_warm_limit": 5000,
  "memory_cold_limit": 50000,
  "backup_retention_days": 30,
  "max_backups": 10,
  "rate_limit_per_minute": 60
}'::jsonb);