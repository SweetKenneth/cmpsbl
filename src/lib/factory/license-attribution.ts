/**
 * CMPSBL® Layer 1 License Attribution
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 * Detects open-source license markers inside the customer's original source
 * (Layer 1) and emits the legally-required attribution notice as a comment
 * block that sits just above the verbatim Layer 1 region.
 *
 * Layer 1 itself is NEVER modified — we only annotate the wrapper around it
 * with the upstream license text so the dual-layer artifact stays compliant
 * with attribution-required licenses (Apache-2.0, MIT, BSD, MPL-2.0, ISC).
 *
 * This is patent-orthogonal: Kenneth's dual-layer claim is on the wrapping
 * architecture, not on the customer's source. Carrying the upstream notice
 * is the correct legal posture and signals good faith to the OSS ecosystem.
 *
 * © CMPSBL® — All rights reserved.
 */

export interface DetectedLicense {
  /** SPDX identifier (e.g. 'Apache-2.0', 'MIT'). */
  readonly spdx: string;
  /** Human-readable label for the comment banner. */
  readonly label: string;
  /** Optional copyright/author line lifted from the source header. */
  readonly attribution?: string;
  /** The notice text that must accompany derivative works. */
  readonly notice: string;
}

/** SPDX identifiers we accept as a manual upstream-license declaration. */
export type SupportedSpdx =
  | 'Apache-2.0'
  | 'MIT'
  | 'BSD-3-Clause'
  | 'BSD-2-Clause'
  | 'MPL-2.0'
  | 'ISC';

/** Catalog used by both the detector and the manual override. Single source of truth. */
const LICENSE_CATALOG: Record<SupportedSpdx, Omit<DetectedLicense, 'attribution'>> = {
  'Apache-2.0': {
    spdx: 'Apache-2.0',
    label: 'Apache License 2.0',
    notice:
      'Licensed under the Apache License, Version 2.0 (the "License"); ' +
      'you may not use this file except in compliance with the License. ' +
      'You may obtain a copy of the License at ' +
      'http://www.apache.org/licenses/LICENSE-2.0 — Unless required by ' +
      'applicable law or agreed to in writing, software distributed under ' +
      'the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES ' +
      'OR CONDITIONS OF ANY KIND, either express or implied.',
  },
  'MIT': {
    spdx: 'MIT',
    label: 'MIT License',
    notice:
      'Permission is hereby granted, free of charge, to any person obtaining ' +
      'a copy of this software and associated documentation files (the ' +
      '"Software"), to deal in the Software without restriction. ' +
      'THE SOFTWARE IS PROVIDED "AS IS".',
  },
  'BSD-3-Clause': {
    spdx: 'BSD-3-Clause',
    label: 'BSD 3-Clause License',
    notice:
      'Redistribution and use in source and binary forms, with or without ' +
      'modification, are permitted provided that the conditions of the ' +
      'BSD 3-Clause License are met. THE SOFTWARE IS PROVIDED "AS IS".',
  },
  'BSD-2-Clause': {
    spdx: 'BSD-2-Clause',
    label: 'BSD 2-Clause License',
    notice:
      'Redistribution and use in source and binary forms, with or without ' +
      'modification, are permitted provided the BSD 2-Clause conditions ' +
      'are met. THE SOFTWARE IS PROVIDED "AS IS".',
  },
  'MPL-2.0': {
    spdx: 'MPL-2.0',
    label: 'Mozilla Public License 2.0',
    notice:
      'This Source Code Form is subject to the terms of the Mozilla Public ' +
      'License, v. 2.0. If a copy of the MPL was not distributed with this ' +
      'file, You can obtain one at https://mozilla.org/MPL/2.0/.',
  },
  'ISC': {
    spdx: 'ISC',
    label: 'ISC License',
    notice:
      'Permission to use, copy, modify, and/or distribute this software ' +
      'for any purpose with or without fee is hereby granted, provided ' +
      'that the above copyright notice appears in all copies. ' +
      'THE SOFTWARE IS PROVIDED "AS IS".',
  },
};

/**
 * Build a DetectedLicense from a manual SPDX declaration. Returns null when
 * spdx is empty/unknown so callers can spread the result safely.
 *
 * Use this when the customer's source has no inline header but they know
 * the upstream license (e.g. files extracted from an Apache-2.0 repo where
 * the LICENSE file lives at the repo root, not in each source file).
 */
export function buildLicenseFromSpdx(
  spdx: string | null | undefined,
  attribution?: string,
): DetectedLicense | null {
  if (!spdx) return null;
  const entry = LICENSE_CATALOG[spdx as SupportedSpdx];
  if (!entry) return null;
  return attribution ? { ...entry, attribution } : { ...entry };
}

/** Stable, ordered list for UI dropdowns. */
export const SUPPORTED_UPSTREAM_LICENSES: ReadonlyArray<{ spdx: SupportedSpdx; label: string }> = [
  { spdx: 'Apache-2.0', label: 'Apache License 2.0' },
  { spdx: 'MIT', label: 'MIT License' },
  { spdx: 'BSD-3-Clause', label: 'BSD 3-Clause License' },
  { spdx: 'BSD-2-Clause', label: 'BSD 2-Clause License' },
  { spdx: 'MPL-2.0', label: 'Mozilla Public License 2.0' },
  { spdx: 'ISC', label: 'ISC License' },
];

/**
 * Scan only the first ~200 lines of source — license headers always live
 * at the top. We never read the whole file and never mutate it.
 */
function headerSlice(source: string): string {
  return source.split('\n').slice(0, 200).join('\n');
}

/** Pull the first `Copyright (c) YEAR Author` line out of the header, if present. */
function extractCopyright(header: string): string | undefined {
  const m = header.match(/(?:Copyright|©)\s*(?:\(c\)\s*)?[\s\S]{0,120}?(?:\n|\*\/|"""|$)/i);
  if (!m) return undefined;
  return m[0]
    .replace(/[\r\n]+/g, ' ')
    .replace(/[#*\/]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 200);
}

/**
 * Detect the upstream license, if any. Conservative: only returns a hit when
 * the SPDX id or canonical license name appears in the header. Unknown or
 * missing → returns null and we emit no attribution (no false claims).
 */
export function detectLayer1License(source: string): DetectedLicense | null {
  const header = headerSlice(source);
  const lower = header.toLowerCase();
  const attribution = extractCopyright(header);

  // Order matters — check most-specific markers first so MIT's catch-all
  // "permission is hereby granted" doesn't swallow ISC, etc.
  let spdx: SupportedSpdx | null = null;

  if (
    /spdx-license-identifier:\s*apache-2\.0/i.test(header) ||
    lower.includes('apache license, version 2.0') ||
    lower.includes('apache license version 2.0') ||
    /licensed under the apache license/i.test(header)
  ) {
    spdx = 'Apache-2.0';
  } else if (
    /spdx-license-identifier:\s*mpl-2\.0/i.test(header) ||
    lower.includes('mozilla public license, v. 2.0') ||
    lower.includes('mozilla public license version 2.0')
  ) {
    spdx = 'MPL-2.0';
  } else if (/spdx-license-identifier:\s*bsd-3-clause/i.test(header) || lower.includes('bsd 3-clause')) {
    spdx = 'BSD-3-Clause';
  } else if (/spdx-license-identifier:\s*bsd-2-clause/i.test(header) || lower.includes('bsd 2-clause')) {
    spdx = 'BSD-2-Clause';
  } else if (/spdx-license-identifier:\s*isc/i.test(header) || /\bisc license\b/i.test(header)) {
    spdx = 'ISC';
  } else if (
    /spdx-license-identifier:\s*mit\b/i.test(header) ||
    /\bmit license\b/i.test(header) ||
    /permission is hereby granted, free of charge/i.test(header)
  ) {
    spdx = 'MIT';
  }

  return buildLicenseFromSpdx(spdx, attribution);
}

/**
 * Resolve the effective Layer 1 license to attach. Manual SPDX override always
 * wins (the user knows their upstream). Falls back to header detection. This
 * is the function the export pipeline should call — never the detector alone.
 */
export function resolveLayer1License(
  source: string,
  overrideSpdx?: string | null,
): DetectedLicense | null {
  if (overrideSpdx) {
    const attribution = extractCopyright(headerSlice(source));
    const built = buildLicenseFromSpdx(overrideSpdx, attribution);
    if (built) return built;
  }
  return detectLayer1License(source);
}

/**
 * Render a detected license as a language-aware comment block that can be
 * injected above the verbatim Layer 1 region. Caller passes the adapter's
 * `comment` function so each line uses the correct comment prefix.
 *
 * Returns an empty array when no license was detected — the caller can spread
 * it without a guard.
 */
export function renderLicenseAttribution(
  license: DetectedLicense | null,
  comment: (text: string) => string,
): string[] {
  if (!license) return [];

  const lines = [
    comment('═══════════════════════════════════════════════════════════'),
    comment(`LAYER 1 UPSTREAM LICENSE — ${license.label} (${license.spdx})`),
    comment('Carried forward verbatim per upstream license requirements.'),
    comment('CMPSBL® makes no claim over Layer 1; this notice attaches'),
    comment('to the original source only.'),
  ];

  if (license.attribution) {
    lines.push(comment(`  ${license.attribution}`));
  }

  // Wrap the notice at ~78 chars so the block stays readable.
  const wrapped = wrapText(license.notice, 76);
  for (const w of wrapped) {
    lines.push(comment(`  ${w}`));
  }

  lines.push(comment('═══════════════════════════════════════════════════════════'));
  return lines;
}

function wrapText(text: string, width: number): string[] {
  const words = text.split(/\s+/);
  const out: string[] = [];
  let line = '';
  for (const w of words) {
    if (line.length + 1 + w.length > width) {
      if (line) out.push(line);
      line = w;
    } else {
      line = line ? line + ' ' + w : w;
    }
  }
  if (line) out.push(line);
  return out;
}
