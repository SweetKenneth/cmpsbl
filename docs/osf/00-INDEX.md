# PromptFluid Ecosystem: Open Source Foundation Documentation

## Citation Index for Academic & Research Publication

**Document Set Version:** 1.0.0  
**Release Date:** January 13, 2026  
**DOI Placeholder:** 10.5281/zenodo.XXXXXXX  
**License:** Apache 2.0 (Core) | GPL v2 (WordPress Plugins)

---

## Abstract

PromptFluid is an open-source AI orchestration substrate designed for extensibility, autonomous learning, and multi-provider intelligence routing. This documentation set provides comprehensive technical specifications, architectural blueprints, and implementation guides suitable for academic citation, developer onboarding, and research publication on platforms including OSF (Open Science Framework), ORCID, and Zenodo.

The ecosystem represents a novel approach to persistent AI memory systems ("Dreaming AI"), multi-provider routing with intelligent fallback, and unified observability across distributed AI workloads.

---

## Document Inventory

### Core Architecture

| Document | Filename | Description |
|----------|----------|-------------|
| Architecture Overview | `01-ARCHITECTURE.md` | System-wide architectural blueprint |
| Brain Substrate | `02-BRAIN-SUBSTRATE.md` | Persistent memory, learning cycles, dream mechanics |
| Nexus Routing Layer | `03-NEXUS-ROUTING.md` | Multi-provider AI gateway with fallback cascade |
| Defense Intelligence | `04-DEFENSE-INTELLIGENCE.md` | Behavioral bot detection and threat modeling |
| Vision Observability | `05-VISION-OBSERVABILITY.md` | Unified dashboard and telemetry pipeline |

### Developer Substrate

| Document | Filename | Description |
|----------|----------|-------------|
| Edge Function Catalog | `06-EDGE-FUNCTIONS.md` | Complete function registry (268+ functions) |
| Database Schema | `07-DATABASE-SCHEMA.md` | PostgreSQL tables, RLS policies, relationships |
| API Reference | `08-API-REFERENCE.md` | REST endpoints, authentication, rate limits |
| Extension Guide | `09-EXTENSION-GUIDE.md` | How to build on the PromptFluid substrate |

### Operational Intelligence

| Document | Filename | Description |
|----------|----------|-------------|
| Cascade System | `10-CASCADE-OPERATIVE.md` | Autonomous reporting, threat modeling, signal classification |
| Learning Cycles | `11-LEARNING-CYCLES.md` | Continuous learning, reflection, reinforcement |
| Dream Protocol | `12-DREAM-PROTOCOL.md` | Autonomous dream cycles and shared dream artifacts |

### Deployment & Governance

| Document | Filename | Description |
|----------|----------|-------------|
| Deployment Guide | `13-DEPLOYMENT.md` | Infrastructure requirements, environment setup |
| Security Model | `14-SECURITY-MODEL.md` | RLS policies, authentication, threat posture |
| Contribution Guidelines | `15-CONTRIBUTION.md` | How to contribute to the ecosystem |
| License & Attribution | `16-LICENSE.md` | Licensing terms and citation format |

---

## Citation Format

### BibTeX

```bibtex
@software{promptfluid_ecosystem_2026,
  author       = {Sese, Kenneth},
  title        = {{PromptFluid Ecosystem: Open Source AI Orchestration Substrate}},
  year         = 2026,
  publisher    = {Zenodo},
  version      = {v1.0.0},
  doi          = {10.5281/zenodo.XXXXXXX},
  url          = {https://github.com/promptfluid/ecosystem}
}
```

### APA

Sese, K. (2026). *PromptFluid Ecosystem: Open Source AI Orchestration Substrate* (Version 1.0.0) [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.XXXXXXX

### Chicago

Sese, Kenneth. "PromptFluid Ecosystem: Open Source AI Orchestration Substrate." Version 1.0.0. Zenodo, 2026. https://doi.org/10.5281/zenodo.XXXXXXX.

---

## Historical Context

PromptFluid follows in the tradition of foundational open-source projects:

- **Linux (1991):** Monolithic kernel released by Linus Torvalds, enabling decades of collaborative development
- **Bitcoin (2009):** Distributed ledger protocol released by Satoshi Nakamoto, establishing trustless consensus
- **PromptFluid (2025-2026):** Distributed AI orchestration substrate enabling persistent memory, autonomous learning, and multi-provider intelligence

Like its predecessors, PromptFluid is released as a substrate—a foundation upon which future developers, researchers, and organizations can build.

---

## Semantic Versioning

This documentation follows SemVer 2.0.0:

- **MAJOR:** Breaking changes to core APIs or architecture
- **MINOR:** New features, backward compatible
- **PATCH:** Bug fixes, documentation updates

Current Version: **1.0.0**

---

## Maintainers

| Role | Name | Contact |
|------|------|---------|
| Founder & Principal Author | Kenneth Sese | kenneth@promptfluid.com |
| Documentation Lead | PromptFluid Team | docs@promptfluid.com |

---

## Repository Structure

```
promptfluid/
├── docs/
│   └── osf/                    # This documentation set
├── src/                        # Frontend React application
├── supabase/
│   ├── functions/              # 268+ Edge Functions
│   └── migrations/             # Database migrations
├── wordpress-plugins/          # GPL v2 WordPress plugins
├── README.md                   # Project entry point
└── LICENSE                     # Apache 2.0 / GPL v2
```

---

**Last Updated:** January 13, 2026  
**Document Status:** RELEASE CANDIDATE
