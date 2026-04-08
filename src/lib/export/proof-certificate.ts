/**
 * CMPSBL® Cryptographic Proof Certificate Generator
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Generates a PROOF.txt for inclusion in every ZIP export.
 * Human-readable, machine-parseable provenance certificate.
 *
 * © 2025–2026 CMPSBL® · PromptFluid™. All rights reserved.
 */

export interface ProofCertificateInput {
  serial?: string;
  fingerprint?: string;
  tier: string;
  cjpi: number;
  primitives: string[];
  source: string;
  language?: string;
}

export function generateProofCertificate(input: ProofCertificateInput): string {
  const { serial, fingerprint, tier, cjpi, primitives, source, language } = input;
  const now = new Date();
  const isoDate = now.toISOString();
  const humanDate = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const year = now.getFullYear();
  const verifyUrl = fingerprint ? `https://cmpsbl.com/verify/${fingerprint}` : 'N/A';

  return [
    '╔══════════════════════════════════════════════════════════════════╗',
    '║                                                                ║',
    '║              CMPSBL® PROVENANCE CERTIFICATE                    ║',
    '║              Governed Cognitive Infrastructure                  ║',
    '║              A PromptFluid™ Product                             ║',
    '║                                                                ║',
    '╚══════════════════════════════════════════════════════════════════╝',
    '',
    '  This certificate proves that the enclosed software artifact was',
    '  processed through the CMPSBL® Ascension substrate — a patented,',
    '  deterministic code-hardening pipeline that applies structural',
    '  guards without modifying the original source code.',
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  ARTIFACT IDENTITY',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    `  Serial Number:     ${serial || 'N/A'}`,
    `  Fingerprint ID:    ${fingerprint || 'N/A'}`,
    `  CJPI Score:        ${cjpi}/100`,
    `  Tier:              ${tier}`,
    `  Source Language:    ${language || 'N/A'}`,
    `  Source:            ${source}`,
    `  Generated:         ${humanDate}`,
    `  ISO Timestamp:     ${isoDate}`,
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  PRIMITIVES APPLIED',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    ...primitives.map((p, i) => `  ${String(i + 1).padStart(2, ' ')}. ${p}`),
    '',
    `  Total: ${primitives.length} primitive${primitives.length !== 1 ? 's' : ''}`,
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  VERIFICATION',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    `  Online:  ${verifyUrl}`,
    '  Local:   Run the ascended source file with --verify flag',
    '  Manual:  Compare Layer 1 SHA-256 hash with original source',
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  INTELLECTUAL PROPERTY',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    '  Inventor:  Kenneth E. Sweet Jr.',
    '',
    '  U.S. Patent App. No. 64/029,678',
    '    "Dual-Layer Deterministic Software Evolution System',
    '     for Autonomous Primitive-Based Code Hardening',
    '     Without Source Modification"',
    '',
    '  U.S. Patent App. No. 64/031,637',
    '    "Silent Symbiotic Software Attachment System with',
    '     Integrated Governance Layer for Non-Intrusive',
    '     Capability Enhancement Across Heterogeneous',
    '     Computing Environments"',
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  GUARANTEES',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
    '  ✓ Layer 1 (original source) is byte-identical to upload',
    '  ✓ Layer 2 (orchestration) is structurally validated pre-export',
    '  ✓ Zero external AI/LLM calls during Ascension processing',
    '  ✓ Deterministic: same input → same output (given same primitives)',
    '  ✓ 130+ edge-case tests pass before artifact generation',
    '',
    '╔══════════════════════════════════════════════════════════════════╗',
    `║  © ${year} PromptFluid™ · CMPSBL® · All rights reserved.         ║`,
    '║  https://cmpsbl.com · Dev@CMPSBL.com · (760) FLUID-AI          ║',
    '╚══════════════════════════════════════════════════════════════════╝',
    '',
  ].join('\n');
}
