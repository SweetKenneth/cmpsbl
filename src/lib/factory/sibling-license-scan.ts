/**
 * Sibling LICENSE file scanner
 * ─────────────────────────────────────────────────────────────────────────
 * Many real repositories (e.g. Simon Willison's `llm`, most Python/Rust/Go
 * projects) keep their license in a sibling `LICENSE` / `LICENSE.txt` /
 * `LICENSE.md` file at the repo root rather than as an inline header in
 * every source file. When the user uploads a folder (or selects multiple
 * files), we scan that set for a sibling LICENSE and use it to detect the
 * upstream SPDX — exactly the same algorithm as the inline detector, just
 * pointed at the LICENSE file's body instead of a source-file header.
 *
 * Pure data + string scanning. Returns the same DetectedLicense shape so
 * callers can substitute it transparently for the inline detector result.
 *
 * © CMPSBL® — All rights reserved.
 */

import { detectLayer1License, type DetectedLicense } from './license-attribution';

interface ScannedFile {
  readonly name: string;
  readonly content: string;
}

/**
 * Conservative match: filename basename equals LICENSE / LICENCE / COPYING
 * (case-insensitive), with optional .txt / .md / .rst extension. Anything
 * else (e.g. `LICENSE-3rdparty.txt`) is skipped — those are usually
 * supplementary, not the primary upstream license.
 */
const LICENSE_FILENAME = /^(LICEN[SC]E|COPYING)(\.(txt|md|rst))?$/i;

function isLicenseFile(name: string): boolean {
  // Strip any folder path before the basename — the upload pipeline keeps
  // relative paths (e.g. `original/LICENSE`).
  const basename = name.split(/[/\\\\]/).pop() ?? name;
  return LICENSE_FILENAME.test(basename);
}

/**
 * Scan a set of uploaded files for a sibling LICENSE. Returns the first
 * one detected as a known SPDX (Apache-2.0, MIT, BSD-2/3, MPL-2.0, ISC).
 * Returns null when no sibling LICENSE exists or when the LICENSE body
 * is not a recognized open-source license.
 */
export function detectLicenseFromSiblingFile(
  files: ReadonlyArray<ScannedFile> | undefined,
): DetectedLicense | null {
  if (!files || files.length === 0) return null;

  for (const f of files) {
    if (!isLicenseFile(f.name)) continue;
    if (!f.content || f.content.length < 20) continue;

    // Reuse the inline detector on the LICENSE body — same SPDX patterns,
    // same conservative matching. Any false positives would have to fool
    // both detectors, which is vanishingly rare.
    const detected = detectLayer1License(f.content);
    if (detected) return detected;
  }
  return null;
}
