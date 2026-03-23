# Documentation Style Guide

## Tone

All documentation must maintain a neutral, technical, OS-manual tone. Avoid marketing language, superlatives, and promotional framing.

## Section Structure

Every canonical document must include:

1. **Purpose** — One paragraph stating why this document exists.
2. **Numbered sections** — As defined per document specification.
3. **Revision History** — Table with date, author, and change summary.
4. **Related Documents** — Cross-references to other canonical documents.

## Formatting Rules

| Rule | Standard |
|------|----------|
| Module names | ALL CAPS (e.g., NEXUS, CORE, DEFENSE) |
| Headings | Sentence case, H2 for major sections, H3 for subsections |
| Diagrams | Mermaid syntax only |
| Tables | Used for registries, matrices, and policy definitions |
| Code blocks | Used for configuration examples and schemas |
| Lists | Bullet for unordered, numbered for sequential procedures |

## File Naming

- Directories use numbered prefixes: `01-architecture/`, `02-governance/`
- Files use kebab-case: `master-architecture-spec.md`
- Index files: `00-index/`

## Cross-References

Use relative paths: `../01-architecture/master-architecture-spec.md`

## Revision History Format

| Date | Author | Change |
|------|--------|--------|
| YYYY-MM-DD | Name | Description of change |

---

© 2025–2026 CMPSBL®. All rights reserved.
