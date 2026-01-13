# PromptFluid Brain - Research Autonomy Patch

## Overview
The Research Autonomy Patch enables PromptFluid Brain to autonomously fetch, verify, and store external information. This creates a self-improving intelligence system that can research topics, cross-verify findings, and route insights to relevant modules.

## Architecture

### Core Components

#### 1. Research Spine (`/src/lib/research/spine.ts`)
- Submit research queries programmatically
- Execute research using external APIs
- Manage pending queries
- Extract high-confidence insights
- Route insights to Defense, Vision, and Learning modules

#### 2. Database Tables
- **learning_queries**: Tracks research questions and topics
- **learning_results**: Stores raw research findings
- **learning_confidence**: Tracks confidence scores and verification status

#### 3. Edge Functions
- **pf-research-fetch**: Executes research via Perplexity and Firecrawl APIs
- **pf-research-verify**: Cross-verifies research findings
- **pf-research-cron**: Nightly job to process pending queries

## API Integration

### Perplexity API (Optional)
For real-time web research with citations:
```bash
# Add to Supabase secrets
PERPLEXITY_API_KEY=your_key_here
```

### Firecrawl API (Optional)
For deep web scraping and content extraction:
```bash
# Add to Supabase secrets
FIRECRAWL_API_KEY=your_key_here
```

## Usage

### Submit Research Query
```typescript
import { submitResearchQuery } from '@/lib/research/spine';

await submitResearchQuery({
  query_text: "Latest WordPress security vulnerabilities 2025",
  query_type: "research",
  source_module: "defense",
  priority: 8,
  metadata: { category: "security" }
});
```

### Get High-Confidence Insights
```typescript
import { getHighConfidenceInsights } from '@/lib/research/spine';

const insights = await getHighConfidenceInsights(0.7, 20);
// Returns verified insights with confidence >= 0.7
```

### Route Insights to Modules
```typescript
import { routeInsights } from '@/lib/research/spine';

await routeInsights(insights, ['defense', 'vision', 'learning']);
```

### React Hook
```typescript
import { useResearch } from '@/hooks/useResearch';

function ResearchDashboard() {
  const { stats, insights, pendingQueries, submitQuery } = useResearch();
  
  return (
    <div>
      <h2>Research Stats</h2>
      <p>Total Queries: {stats.total_queries}</p>
      <p>Verified Results: {stats.verified_results}</p>
      <p>Avg Confidence: {(stats.avg_confidence * 100).toFixed(1)}%</p>
    </div>
  );
}
```

## Nightly Research Cron

The system automatically processes pending high-priority queries every night:

1. Fetches top 10 pending queries
2. Executes research via external APIs
3. Stores results with confidence scores
4. Routes insights to Defense, Vision, and Learning modules

### Manual Trigger
```bash
curl -X POST https://hxgbibtkftocyrnuzxwd.supabase.co/functions/v1/pf-research-cron \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

## Research Flow

```
User/System → Submit Query → learning_queries (pending)
                              ↓
                    pf-research-fetch (execute)
                              ↓
                    External APIs (Perplexity/Firecrawl)
                              ↓
                    learning_results (store findings)
                              ↓
                    pf-research-verify (cross-verify)
                              ↓
                    learning_confidence (update score)
                              ↓
                    Route to Modules (Defense/Vision/Learning)
```

## Confidence Scoring

Research results are scored based on:
- **Source reliability**: Perplexity (0.2), Firecrawl (0.1)
- **Insight count**: +0.05 per insight (max 0.2)
- **Citation count**: +0.05 per source (max 0.15)
- **Relevance score**: Base score from query matching

Results with confidence >= 0.6 are marked as "verified".

## Module Integration

### Defense Module
Receives security-related research insights for threat intelligence.

### Vision Module
Receives operational insights for system monitoring and optimization.

### Learning Module
Receives all insights for pattern analysis and continuous improvement.

## Performance

- **Query Processing**: ~2-5 seconds per query
- **Batch Processing**: 10 queries per cron execution
- **Storage**: Unlimited queries, auto-purge old unverified results after 90 days
- **API Costs**: Pay-per-use (Perplexity/Firecrawl)

## Security

- All edge functions use service role key for database access
- Research queries are logged for audit trail
- External API keys stored securely in Supabase secrets
- RLS policies restrict data access to admins only

## Monitoring

Track research performance in Vision Dashboard:
- Total queries processed
- Average confidence scores
- Verification rates
- API usage and costs

## Future Enhancements

1. **Multi-source verification**: Compare findings across 3+ sources
2. **Semantic search**: Vector-based insight retrieval
3. **Auto-tagging**: AI-powered categorization of findings
4. **Smart scheduling**: Priority-based query execution
5. **Cost optimization**: Cache common queries, fallback APIs

---

**Status**: ✅ Operational  
**Version**: 1.0.0  
**Last Updated**: 2025-10-31
