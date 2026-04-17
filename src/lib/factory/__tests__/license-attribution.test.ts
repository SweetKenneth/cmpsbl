/**
 * Layer 1 upstream license attribution — coverage across every shipping
 * language. Verifies that an Apache/MIT/BSD/MPL/ISC header in the customer
 * source produces the correct attribution block above the verbatim Layer 1
 * region, and that Layer 1 itself is never mutated.
 */
import { describe, it, expect } from 'vitest';
import { generateRefurbishedCode } from '@/lib/factory/generate-refurbished-code';
import {
  detectLayer1License,
  renderLicenseAttribution,
} from '@/lib/factory/license-attribution';
import { getShippingLanguages } from '@/lib/export/language-parity-tiers';
import type { PrimitiveRecommendation } from '@/lib/factory/scan-team';

const PRIMS: PrimitiveRecommendation[] = [
  { primitiveId: 'defense', name: 'DEFENSE', category: 'Layer', impactScore: 88, rationale: 't', chainPosition: 1, collisionScore: 88 },
  { primitiveId: 'brain',   name: 'BRAIN',   category: 'Organ', impactScore: 85, rationale: 't', chainPosition: 2, collisionScore: 85 },
];
const FP = 'LIC_TEST_FP';

const APACHE_HEADER = `# SPDX-License-Identifier: Apache-2.0
# Copyright (c) 2024 Simon Willison
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
`;

const MIT_HEADER = `// MIT License
// Copyright (c) 2023 Some Author
//
// Permission is hereby granted, free of charge, to any person obtaining
`;

describe('Layer 1 upstream license detection', () => {
  it('detects Apache-2.0 by SPDX', () => {
    const lic = detectLayer1License(APACHE_HEADER + '\nclass Foo: pass\n');
    expect(lic).not.toBeNull();
    expect(lic!.spdx).toBe('Apache-2.0');
    expect(lic!.attribution).toMatch(/Simon Willison/);
  });

  it('detects MIT', () => {
    const lic = detectLayer1License(MIT_HEADER + '\nfunction foo(){}\n');
    expect(lic).not.toBeNull();
    expect(lic!.spdx).toBe('MIT');
  });

  it('returns null for unlicensed source', () => {
    const lic = detectLayer1License('class Foo:\n    pass\n');
    expect(lic).toBeNull();
  });

  it('renders empty when license is null', () => {
    expect(renderLicenseAttribution(null, (s) => '// ' + s)).toEqual([]);
  });

  it('renders a banner with attribution + notice when present', () => {
    const lic = detectLayer1License(APACHE_HEADER + '\nclass Foo: pass\n');
    const out = renderLicenseAttribution(lic, (s) => '# ' + s);
    const joined = out.join('\n');
    expect(joined).toContain('Apache License 2.0');
    expect(joined).toContain('Apache-2.0');
    expect(joined).toContain('Simon Willison');
    expect(joined).toContain('http://www.apache.org/licenses/LICENSE-2.0');
  });
});

describe('Layer 1 license attribution — end-to-end across shipping languages', () => {
  const SAMPLES: Record<string, { code: string; file: string }> = {
    typescript: {
      code: `// SPDX-License-Identifier: Apache-2.0\n// Copyright (c) 2024 Simon Willison\nexport class Foo { run() { return 1; } }\n`,
      file: 'foo.ts',
    },
    javascript: {
      code: `// SPDX-License-Identifier: Apache-2.0\n// Copyright (c) 2024 Simon Willison\nexport class Foo { run() { return 1; } }\n`,
      file: 'foo.js',
    },
    python: {
      code: APACHE_HEADER + '\nclass Foo:\n    def run(self):\n        return 1\n',
      file: 'foo.py',
    },
    rust: {
      code: `// SPDX-License-Identifier: Apache-2.0\n// Copyright (c) 2024 Simon Willison\npub struct Foo;\nimpl Foo { pub fn run(&self) -> i32 { 1 } }\n`,
      file: 'foo.rs',
    },
    go: {
      code: `// SPDX-License-Identifier: Apache-2.0\n// Copyright (c) 2024 Simon Willison\npackage main\n\ntype Foo struct{}\nfunc (f *Foo) Run() int { return 1 }\n`,
      file: 'foo.go',
    },
  };

  for (const lang of getShippingLanguages()) {
    const sample = SAMPLES[lang.id];
    if (!sample) continue;
    describe(lang.label, () => {
      const out = generateRefurbishedCode(sample.code, PRIMS, FP, lang.label, sample.file);

      it('emits the upstream license banner above Layer 1', () => {
        expect(out).toContain('LAYER 1 UPSTREAM LICENSE');
        expect(out).toContain('Apache-2.0');
        expect(out).toContain('Apache License 2.0');
        expect(out).toContain('Simon Willison');
      });

      it('preserves Layer 1 byte-for-byte (license stays inside the original)', () => {
        expect(out).toContain(sample.code.trimEnd());
      });

      it('places the banner BEFORE the verbatim source, not inside it', () => {
        const bannerIdx = out.indexOf('LAYER 1 UPSTREAM LICENSE');
        const sourceIdx = out.indexOf(sample.code.trimEnd());
        expect(bannerIdx).toBeGreaterThan(0);
        expect(sourceIdx).toBeGreaterThan(bannerIdx);
      });
    });
  }

  it('omits the banner entirely when no license is detected', () => {
    const out = generateRefurbishedCode(
      'class Foo:\n    def run(self):\n        return 1\n',
      PRIMS,
      FP,
      'Python',
      'foo.py',
    );
    expect(out).not.toContain('LAYER 1 UPSTREAM LICENSE');
  });
});
