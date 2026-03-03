# Support Bot Training Data — Knowledge Base v1.0.0

**Document ID:** CMPSBL-LIB-097  
**Version:** v1.0.0  
**Last Updated:** February 2026  
**Classification:** Public

---

## Overview

The Support Bot is pre-trained with a curated knowledge base covering four core topic areas. This training enables immediate utility without requiring runtime learning cycles.

---

## Training Categories

### 1. CodeLab (6 entries)

| ID | Topic | Priority |
|----|-------|----------|
| codelab_001 | What is CodeLab? | Critical |
| codelab_002 | Getting started | High |
| codelab_003 | Available commands | High |
| codelab_004 | Demo vs. production distinction | High |
| codelab_005 | Troubleshooting terminal issues | Medium |
| codelab_006 | Saving work | Medium |

**Key Knowledge Points:**
- CodeLab is NOT a demo or sandbox
- Real schedulers and cognition execution
- Live substrate integration
- Professional builder/researcher tool

---

### 2. Marketplace (7 entries)

| ID | Topic | Priority |
|----|-------|----------|
| marketplace_001 | What is the Marketplace? | Critical |
| marketplace_002 | How to purchase templates | High |
| marketplace_003 | AI Template Generator | High |
| marketplace_004 | Template tiers explained | High |
| marketplace_005 | Refund policy | Medium |
| marketplace_006 | Accessing purchased templates | High |
| marketplace_007 | Rarity system | Medium |

**Key Knowledge Points:**
- 109+ production-ready templates
- AI Generator ($87) with 82,944+ combinations
- Tiers: Elite ($299-499), Pro ($99-249), Standard ($27-79)
- Rarity: Common → Mythic based on complexity

---

### 3. Licensing (8 entries)

| ID | Topic | Priority |
|----|-------|----------|
| licensing_001 | Available licensing options | Critical |
| licensing_002 | Pricing structure | Critical |
| licensing_003 | Developer License purchase | High |
| licensing_004 | Templates vs. licenses | High |
| licensing_005 | Downgrade policy | Medium |
| licensing_006 | Rights and permissions | High |
| licensing_007 | Enterprise contact | High |
| licensing_008 | Free trial availability | Medium |

**Key Knowledge Points:**
- Developer: $15,000/yr (automated checkout)
- Research: $80,000/yr (contract)
- Enterprise: $180,000/yr (contract)
- No mid-term downgrades permitted
- 25% annual billing discount

---

### 4. General (5 entries)

| ID | Topic | Priority |
|----|-------|----------|
| general_001 | How to contact support | High |
| general_002 | What is CMPSBL? | Critical |
| general_003 | Password reset | High |
| general_004 | Data security | High |
| general_005 | Browser compatibility | Medium |

**Key Knowledge Points:**
- CMPSBL = Composable OS substrate
- 140,000+ LOC in production
- Encryption at rest and in transit
- RLS on all user data

---

## Knowledge Entry Structure

Each entry contains:

```typescript
interface KnowledgeEntry {
  id: string;              // Unique identifier
  question_pattern: string; // The question being answered
  answer: string;          // Full response content
  category: IntentCategory; // question | how_to | troubleshoot | account
  keywords: string[];      // Matching keywords
  confidence: number;      // Base confidence (0.87-0.95)
  verified: boolean;       // All pre-trained = true
  priority: 'critical' | 'high' | 'medium' | 'low';
}
```

---

## Matching Algorithm

The knowledge base search uses:

1. **Keyword Matching** — +0.15 per matched keyword
2. **Category Match** — +0.25 if intent category matches
3. **Word Overlap** — +0.05 per overlapping word in question
4. **Priority Boost** — +0.15 (critical), +0.10 (high), +0.05 (medium)

Minimum relevance threshold: 0.2

---

## Fallback Behavior

If no knowledge base match exceeds threshold:
1. Memory core recall is attempted
2. If both fail, escalation response is generated
3. Human handoff offered if configured

---

## Extending the Knowledge Base

To add new training data:

1. Edit `src/lib/substrate/support-bot/knowledge-base.ts`
2. Add entries to appropriate category array
3. Ensure unique ID with category prefix
4. Set appropriate priority and confidence
5. Test with `support.kb search [query]` terminal command

---

## Terminal Commands

```bash
# View knowledge base stats
support.kb stats

# List all entries
support.kb list

# Search knowledge base
support.kb search "marketplace"
```

---

## Statistics (v1.0.0)

| Metric | Value |
|--------|-------|
| Total Entries | 26 |
| CodeLab | 6 |
| Marketplace | 7 |
| Licensing | 8 |
| General | 5 |
| Critical Priority | 6 |
| High Priority | 14 |
| Medium Priority | 6 |

---

*Support Bot Training Data v1.0.0*  
*© 2026 promptfluid®. All rights reserved.*
