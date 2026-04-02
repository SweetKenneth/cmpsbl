/**
 * Generate Refurbished Code — Dual-layer source output
 * Takes original code + applied primitives and produces the "refurbished" version
 * with primitive guards, imports, and hardening wrappers injected.
 */

import type { PrimitiveRecommendation } from './scan-team';

/** Generate the refurbished source with primitive hardening applied */
export function generateRefurbishedCode(
  originalCode: string,
  selectedPrimitives: PrimitiveRecommendation[],
  fingerprint: string,
): string {
  const imports = selectedPrimitives.map(p =>
    `import { ${p.name.toLowerCase()}Guard } from '@cmpsbl/runtime';`
  ).join('\n');

  const activations = selectedPrimitives.map(p =>
    `${p.name.toLowerCase()}Guard.activate({ mode: 'enforce', fingerprint: '${fingerprint}' });`
  ).join('\n');

  const header = [
    `/**`,
    ` * CMPSBL® Refurbished Code`,
    ` * Fingerprint: ${fingerprint}`,
    ` * Primitives Applied: ${selectedPrimitives.map(p => p.name).join(', ')}`,
    ` * Generated: ${new Date().toISOString()}`,
    ` * `,
    ` * This code has been hardened by the CMPSBL Refurbishment Lab.`,
    ` * Do not remove guard activations — they protect runtime integrity.`,
    ` */`,
  ].join('\n');

  return [
    header,
    '',
    '// ═══ CMPSBL Runtime Imports ═══',
    imports,
    '',
    '// ═══ Primitive Guard Activations ═══',
    activations,
    '',
    '// ═══ Original Source (Hardened) ═══',
    originalCode,
  ].join('\n');
}

/** Generate the CMPSBL license text for export */
export function generateLicense(serialNumber: string, fingerprint: string): string {
  return `CMPSBL® SOFTWARE LICENSE
========================

Serial Number: ${serialNumber}
Fingerprint: ${fingerprint}
Issued: ${new Date().toISOString()}
Licensor: CMPSBL® — a PromptFluid™ product

1. GRANT OF LICENSE
   This license grants the holder the right to use, modify, and deploy
   the refurbished code contained in this package for any lawful purpose.

2. OWNERSHIP
   The refurbished code and all hardening applied by CMPSBL primitives
   remain the intellectual property of the licensee. CMPSBL retains
   ownership of the primitive runtime libraries (@cmpsbl/*).

3. RESTRICTIONS
   - You may not redistribute the @cmpsbl/runtime libraries separately.
   - You may not remove or bypass primitive guard activations.
   - You may not claim CMPSBL certification for code not processed
     through the official Refurbishment Lab.

4. WARRANTY
   This code has been scanned, analyzed, and hardened by the CMPSBL
   three-primitive scan team (ENCODE, ORACLE, ENGINEER). The CJPI
   score and tier reflect the state at time of refurbishment.

5. SUPPORT
   Visit https://cmpsbl.com/support or use your fingerprint ID
   (${fingerprint}) to access DECODE support for this refurbishment.

© ${new Date().getFullYear()} PromptFluid™ · CMPSBL® · All rights reserved.
`;
}
