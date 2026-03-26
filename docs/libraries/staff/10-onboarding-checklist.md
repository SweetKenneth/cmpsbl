# 10 — Onboarding Checklist

**Classification:** INTERNAL — Team Members Only

---

## Week 1 — Foundation

### Day 1
- [ ] Read **01 — What You're Building** — understand what CMPSBL is
- [ ] Read **04 — Non-Negotiables & Red Lines** — know the boundaries
- [ ] Read **09 — Team & Contacts** — know who to reach
- [ ] Set up development environment (clone repo, install deps, run build)
- [ ] Verify you can access the preview deployment

### Day 2–3
- [ ] Read **02 — Architecture & Primitives** — understand the 40-primitive model
- [ ] Read **03 — Codebase Guide** — understand the repo structure
- [ ] Walk through `src/data/team.ts` — confirm your info is correct
- [ ] Run the test suite (`npx vitest`) — all tests should pass
- [ ] Explore the ATLAS dashboard in the running app

### Day 4–5
- [ ] Read **05 — Security & IP Protection** — understand what we protect
- [ ] Read the role-specific document for your department:
  - Engineering → 02, 03, 05
  - Sales → 06, 07
  - Communications → 08
  - Security → 05, 04
  - Research → 02, 05

---

## Week 2 — Depth

### All Roles
- [ ] Read the remaining staff documents you haven't covered
- [ ] Read the **Public documentation** (`docs/libraries/public/`) — this is what the world sees
- [ ] Walk through the Ascension flow in the app (upload → discovery → score → export)
- [ ] Generate a test export in at least 2 languages
- [ ] Review the User documentation (`docs/libraries/users/`) for API and integration patterns

### Engineering
- [ ] Read a sample edge function in `supabase/functions/`
- [ ] Understand the RLS policies on 3 key tables
- [ ] Make a small PR (documentation fix, test improvement, etc.)
- [ ] Trace a `broadcastIntent()` call from UI to resolver to mesh event

### Sales
- [ ] Practice the Ascension demo flow (document 07, section 5)
- [ ] Role-play 3 objection-handling scenarios with a colleague
- [ ] Review the investor documentation for market positioning context
- [ ] Identify 5 companies that match the Ideal Customer Profile

### Communications
- [ ] Audit 3 existing blog posts against the terminology rules
- [ ] Draft a sample social media post following brand guidelines
- [ ] Review the press contact flow and media approval process

### Security
- [ ] Review the black-box protection in `src/lib/export/blackbox.ts`
- [ ] Audit RLS policies on `brain_memories` and `governance` tables
- [ ] Review the incident response priority levels (document 05, section 5)
- [ ] Identify one potential improvement to security posture

---

## Week 3 — Independence

- [ ] Complete your first meaningful contribution (code, content, or process improvement)
- [ ] Present a 5-minute summary of the system to a colleague (verify your understanding)
- [ ] Document one thing you learned that isn't in the staff library → suggest an addition
- [ ] Schedule a 1:1 with the founder to discuss your first impressions and questions

---

## Verification Milestones

| Milestone | Verified By | When |
|-----------|------------|------|
| Can explain what CMPSBL is in 2 sentences | Self-assessment | Day 1 |
| Can name all 4 primitive categories and their count | Quiz (peer) | Day 3 |
| Can recite the 8 non-negotiables from memory | Quiz (lead) | End of Week 1 |
| Can run the test suite and explain 3 test files | Demo (lead) | End of Week 1 |
| Can walk through the Ascension flow end-to-end | Demo (team) | End of Week 2 |
| Can handle 3 common sales objections | Role-play (peer) | End of Week 2 |
| Can identify a security concern in code review | Code review | End of Week 3 |

---

© 2025–2026 CMPSBL®. Internal Use Only.
