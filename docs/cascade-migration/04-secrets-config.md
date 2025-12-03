# Cascade Secrets Configuration

## Required Secrets

These secrets must be configured in your new Lovable Cloud project for Cascade to function:

### AI Model Access
- **OPENAI_API_KEY** - For GPT model access
- **ANTHROPIC_API_KEY** - For Claude model access
- **GROQ_API_KEY** - For Groq model access (fast inference)
- **GOOGLE_AI_STUDIO_KEY** - For Gemini model access

### Optional AI Providers
- **DEEPSEEK_API_KEY** - Alternative AI provider
- **CEREBRAS_API_KEY** - Alternative AI provider
- **TOGETHER_API_KEY** - Alternative AI provider
- **HYPERBOLIC_API_KEY** - Alternative AI provider

### Infrastructure
- **SUPABASE_URL** - Auto-configured by Lovable Cloud
- **SUPABASE_ANON_KEY** - Auto-configured by Lovable Cloud
- **SUPABASE_SERVICE_ROLE_KEY** - Auto-configured by Lovable Cloud
- **SUPABASE_DB_URL** - Auto-configured by Lovable Cloud

### Additional Services
- **RESEND_API_KEY** - For email notifications (reflection emails)
- **FIRECRAWL_API_KEY** - For web scraping (if Cascade researches)

## Configuration Steps

1. **In Your New Lovable Project:**
   - Go to Settings → Secrets
   - Add each required secret
   - Copy values from your current project (if reusing keys)
   - Or generate new keys for each service

2. **Verify Configuration:**
   - All Supabase secrets are auto-configured
   - You only need to add the AI provider keys
   - Test each function after adding secrets

## Minimum Required for Basic Cascade
If you want Cascade to work with minimal setup:
- OPENAI_API_KEY (or ANTHROPIC_API_KEY)
- GROQ_API_KEY (optional but recommended for speed)
- RESEND_API_KEY (if you want email notifications)

## Security Notes
- Never commit secrets to code
- Generate new keys if migrating to production
- Rotate keys periodically
- Use different keys for dev/staging/production
