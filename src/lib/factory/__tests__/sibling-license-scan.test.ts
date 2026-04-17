/**
 * Sibling LICENSE file scanner — covers the common case where a repo's
 * LICENSE lives at the root, not in every source-file header (Simon
 * Willison's `llm`, most Python/Rust/Go projects).
 */
import { describe, it, expect } from 'vitest';
import { detectLicenseFromSiblingFile } from '@/lib/factory/sibling-license-scan';

const APACHE_LICENSE_BODY = `                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION
`;

const MIT_LICENSE_BODY = `MIT License

Copyright (c) 2024 Some Author

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction.
`;

describe('Sibling LICENSE file scanner', () => {
  it('detects Apache-2.0 from a sibling LICENSE file', () => {
    const result = detectLicenseFromSiblingFile([
      { name: 'cli.py', content: 'import asyncio\n' },
      { name: 'LICENSE', content: APACHE_LICENSE_BODY },
    ]);
    expect(result?.spdx).toBe('Apache-2.0');
  });

  it('detects MIT from LICENSE.txt', () => {
    const result = detectLicenseFromSiblingFile([
      { name: 'index.ts', content: 'export const x = 1\n' },
      { name: 'LICENSE.txt', content: MIT_LICENSE_BODY },
    ]);
    expect(result?.spdx).toBe('MIT');
  });

  it('detects from COPYING (GNU convention)', () => {
    const result = detectLicenseFromSiblingFile([
      { name: 'main.go', content: 'package main\n' },
      { name: 'COPYING', content: APACHE_LICENSE_BODY },
    ]);
    expect(result?.spdx).toBe('Apache-2.0');
  });

  it('handles nested paths (original/LICENSE)', () => {
    const result = detectLicenseFromSiblingFile([
      { name: 'original/src/cli.py', content: 'import asyncio\n' },
      { name: 'original/LICENSE', content: APACHE_LICENSE_BODY },
    ]);
    expect(result?.spdx).toBe('Apache-2.0');
  });

  it('returns null when no sibling LICENSE exists', () => {
    const result = detectLicenseFromSiblingFile([
      { name: 'cli.py', content: 'import asyncio\n' },
      { name: 'README.md', content: '# project\n' },
    ]);
    expect(result).toBeNull();
  });

  it('returns null for empty input', () => {
    expect(detectLicenseFromSiblingFile(undefined)).toBeNull();
    expect(detectLicenseFromSiblingFile([])).toBeNull();
  });

  it('skips supplementary LICENSE-3rdparty files (not the primary license)', () => {
    const result = detectLicenseFromSiblingFile([
      { name: 'cli.py', content: 'import asyncio\n' },
      { name: 'LICENSE-3rdparty.txt', content: APACHE_LICENSE_BODY },
    ]);
    expect(result).toBeNull();
  });

  it('returns null when LICENSE body is unrecognized', () => {
    const result = detectLicenseFromSiblingFile([
      { name: 'cli.py', content: 'import asyncio\n' },
      { name: 'LICENSE', content: 'All rights reserved. Proprietary. Do not redistribute.' },
    ]);
    expect(result).toBeNull();
  });
});
