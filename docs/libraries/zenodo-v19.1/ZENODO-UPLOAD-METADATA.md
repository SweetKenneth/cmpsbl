# Zenodo Upload Metadata — v19.1

> Copy-paste ready fields for the Zenodo deposit form.
> © CMPSBL® · PromptFluid™ · Kenneth E. Sweet Jr.

---

## Title
**CMPSBL® Substrate — Zenodo Research Library v19.1**

## Subtitle / Short Description (one line)
Governed cognitive infrastructure: Ascension v2 (Patent #1) + Mana (Patent #2) — the first public research library since v13.5.

## Upload Type
**Publication** → *Working paper* (or *Other* if working paper is unavailable)

## Publication Date
2026-04-18 *(use deposit date)*

## Authors / Creators
| Name | Affiliation | ORCID | Role |
|------|-------------|-------|------|
| Sweet, Kenneth E. Jr. | CMPSBL® / PromptFluid™ | *(add if available)* | Sole Author / Founder |

*No co-authors. Solo founder model.*

---

## Description (HTML-safe, paste into Zenodo description field)

```
<p><strong>CMPSBL® Substrate — Zenodo Research Library v19.1</strong> is the first public research deposit since v13.5, documenting the governed cognitive infrastructure built and operated by Kenneth E. Sweet Jr. (sole founder).</p>

<p>This 16-document library covers the substrate's flagship product (Ascension v2), its attachment runtime (Mana), the Convex Core™ deterministic processing layer, the Merkle audit chain, the 9-language Polyglot export, and the formal Internal IP Boundary that defines what is — and is not — disclosed.</p>

<p><strong>Patents referenced:</strong></p>
<ul>
  <li>U.S. Patent App. No. 64/029,678 — Ascension (restoration pipeline)</li>
  <li>U.S. Patent App. — Mana (attachment runtime)</li>
</ul>

<p><strong>What is reproducible from this library:</strong> verification of any Ascension artifact at <code>/verify/:fingerprint</code>, the determinism guarantee, patent abstracts, plan structure, terminology mapping, Convex Core™ topology, Merkle audit chain structure, and the polyglot language target list.</p>

<p><strong>What is intentionally not reproducible</strong> (documented in Doc 10 — Internal IP Boundary): the substrate itself, CJPI scoring, DREAM synthesis weights, Lex priority resolution, FNV salts, Layer 2 engine source, Discovery Engine heuristics, and vertical operations.</p>

<p><strong>Library contents (16 documents):</strong></p>
<ol start="0">
  <li>Index</li>
  <li>What CMPSBL Is</li>
  <li>Plans and Product Surface</li>
  <li>Ascension v2 Pipeline</li>
  <li>Mana Distribution</li>
  <li>Layers, Meta Engines, Meta Agents</li>
  <li>DREAM Synthesis</li>
  <li>Convex Core™ Architecture</li>
  <li>Merkle Audit Chain</li>
  <li>Polyglot Export (9 languages)</li>
  <li>Internal IP Boundary</li>
  <li>Terminology Updates (v13.5 → v19.1)</li>
  <li>Patent Map</li>
  <li>Research Appendix</li>
  <li>Citation and Reproducibility</li>
  <li>Customer Clarity Roadmap</li>
</ol>

<p>This library supersedes v13.5 and the internal v19 set for citation purposes.</p>

<p><em>© CMPSBL® · PromptFluid™ · 2026 · Kenneth E. Sweet Jr. · Apache-2.0</em></p>
```

---

## Keywords (comma-separated)

```
governed cognitive infrastructure, deterministic computing, software restoration, code provenance, Merkle audit chain, attachment runtime, policy governance, fingerprint verification, polyglot export, patent-pending, CMPSBL, Ascension, Mana, Convex Core, DREAM synthesis, substrate architecture, solo founder research
```

## Additional Notes (optional field)

```
This deposit is the first public CMPSBL® research library since v13.5. The internal v19 document set was never independently DOI'd; v19.1 supersedes both for citation purposes. Future revisions will be v19.2, v19.3, etc., each with a permanent Zenodo DOI.

Authored, operated, and deposited by Kenneth E. Sweet Jr. — sole founder. No co-authors. No external editing.
```

---

## License
**Apache License 2.0** (matches all CMPSBL® monorepo packages)

## Access Rights
**Open Access**

## Language
English

---

## Related Identifiers

| Relation | Identifier | Type |
|----------|------------|------|
| `isNewVersionOf` | *(v13.5 DOI if available)* | DOI |
| `isSupplementTo` | https://cmpsbl.com | URL |
| `isDocumentedBy` | https://cmpsbl.com/ascension-v2 | URL |
| `references` | U.S. Patent App. No. 64/029,678 | Other |

---

## Communities (suggest adding)

- *(none required — solo deposit)*
- Optionally: `zenodo` default community

## Funding
*None — self-funded solo founder.*

## Contributors
*None.*

---

## Files to Upload

Upload **all 16 markdown files** from `docs/libraries/zenodo-v19.1/` as a single ZIP, **plus** a flat copy of the index for browser preview:

```
zenodo-v19.1.zip
├── 00-INDEX.md
├── 01-what-cmpsbl-is.md
├── 02-plans-and-product-surface.md
├── 03-ascension-v2-pipeline.md
├── 04-mana-distribution.md
├── 05-layers-meta-engines-meta-agents.md
├── 06-dream-synthesis.md
├── 07-convex-core-architecture.md
├── 08-merkle-audit-chain.md
├── 09-polyglot-export.md
├── 10-internal-ip-boundary.md
├── 11-terminology-updates.md
├── 12-patent-map.md
├── 13-research-appendix.md
├── 14-citation-and-reproducibility.md
└── 15-customer-clarity-roadmap.md
```

Plus a standalone `00-INDEX.md` outside the ZIP for the Zenodo preview pane.

---

## Post-Upload Checklist

- [ ] DOI minted by Zenodo
- [ ] Update `docs/libraries/README.md` with the new DOI
- [ ] Update `docs/libraries/zenodo-v19.1/14-citation-and-reproducibility.md` with the actual DOI (replace "assigned at upload time")
- [ ] Add DOI badge to repo README
- [ ] Update homepage / `/research` page citation block with new DOI
- [ ] Tweet / announce: "CMPSBL® v19.1 research library published — first public deposit since v13.5"

---

## Versioning Strategy

- **v19.1** is a *new* Zenodo record (not a new version of v13.5) because the scope, structure, and document count have changed substantively.
- Subsequent v19.x releases will be uploaded as **new versions of the v19.1 record** so they share a concept DOI.
- Editorial corrections (typos, broken links) will be appended as errata to the existing record without a new DOI.

---

*© CMPSBL® · PromptFluid™ · 2026*
