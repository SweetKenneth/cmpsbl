# PromptFluid Creative Generation Setup

## API Keys Status

### Ready to Configure
- [ ] STABILITY_API_KEY - Stability.ai for SDXL image generation
- [ ] REPLICATE_API_KEY - Replicate for open model access
- [ ] FAL_API_KEY - Fal.ai for low-cost image fallback
- [ ] MORPH_API_KEY - Morph for custom fine-tuned models
- [ ] RUNWAYML_API_KEY - RunwayML for high-quality video
- [ ] LUMA_API_KEY - Luma for video generation
- [ ] KAIBER_API_KEY - Kaiber for creative motion stills

### Pending
- [ ] PIKA_API_KEY - Pika Labs (on waiting list)

## Next Steps

1. ✅ Add all available API keys via Lovable interface
2. ✅ Update edge functions to use provider fallback logic  
3. ⚠️ Test each endpoint with real API calls
4. ✅ Implement cost tracking per provider
5. ⏳ Add PIKA integration once access is granted

## Research Findings (2025)

### Optimal Provider Routing

**Text Generation (Cost-Optimized)**
- **Research/Web-Grounded**: Perplexity Sonar ($1/1M tokens) ✅
- **Speed**: Groq Llama ($0.10/1M tokens) ✅  
- **General**: Lovable AI/Gemini ($0.50/1M tokens) ✅
- **Reasoning**: Anthropic Claude 4.5 ($3-15/1M tokens) ✅
- **Complex**: OpenAI GPT-5 (not added yet)

**Image Generation (Cost-Optimized)**
- **Fastest/Cheapest**: Together AI, SiliconFlow ($0.0003-0.001/image) ⏳ TO ADD
- **Fast**: Fal.ai ($0.02/image) ✅
- **Quality**: Lovable AI Nano Banana ($0.002/image) ✅
- **Professional**: Stability SDXL ($0.04/image) ✅
- **Flexible**: Replicate FLUX ($0.03/image) ✅
- **Custom**: Morph fine-tuned ($0.015/image) ✅

**Video Generation (Quality-Optimized)**  
- **Fast**: Luma Dream Machine ($0.08/sec) ✅
- **Quality**: RunwayML Gen-3 ($0.10/sec) ✅
- **Creative**: Kaiber ($0.06/sec) ✅
- **Waitlist**: Pika Labs ⏳
- **Not Added**: Kling AI, Mochi 1 (open source), Veo 3.1 ⏳

### Missing Integrations to Consider

**High Priority**
- [ ] Together AI - Extremely cheap FLUX hosting
- [ ] SiliconFlow - Cheapest image generation option found
- [ ] Segmind - Cost-effective alternative

**Medium Priority**  
- [ ] Kling AI - Competitive video quality with Runway
- [ ] Mochi 1 - Open source video option
- [ ] Leonardo AI - Popular Midjourney alternative

**Low Priority**
- [ ] OpenAI GPT-5 direct (currently using Lovable AI gateway)
- [ ] DALL-E 3 (via OpenAI)
- [ ] Veo 3.1 (if API becomes available)

### Current Routing Logic

✅ **pf-nexus-text**: Perplexity → Lovable → Groq → Anthropic
✅ **pf-nexus-image**: Lovable → Stability → Replicate → Fal → Morph  
✅ **pf-nexus-video**: RunwayML → Luma → Kaiber (with async queue fallback)

### Brain Knowledge  

✅ **pf-brain-seed-knowledge**: SEO best practices + PromptFluid company knowledge seeded

## Edge Functions to Update

- `pf-nexus-image` - Add Stability, Replicate, Fal, Morph providers
- `pf-nexus-video` - Add RunwayML, Luma, Kaiber providers with queue

## Testing Checklist

- [ ] Text generation (Groq → OpenAI → Anthropic)
- [ ] Image generation (Lovable AI → Stability → Replicate → Fal → Morph)
- [ ] Video generation (RunwayML → Luma → Kaiber)
- [ ] Cache verification
- [ ] Cost logging
- [ ] Brain learning integration
