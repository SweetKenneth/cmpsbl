/**
 * AutoBlog Image Expander v1.0
 * Adds up to 8 contextual images to posts.
 * Placement: after intro, after major H2 sections.
 * Constraints: max 2 consecutive, descriptive alt text, cap at 6 if insufficient relevance.
 */

export interface ImageExpansionResult {
  modifiedBody: string;
  imagesAdded: number;
  placements: string[];
}

/**
 * Generate a contextual image markdown block.
 */
function createImageBlock(context: string, index: number): string {
  // Use descriptive alt text derived from context
  const alt = context.replace(/[#*_\[\]]/g, '').trim().substring(0, 120);
  // Use a placeholder image service with contextual query
  const query = encodeURIComponent(
    context.replace(/[^a-zA-Z0-9 ]/g, ' ').trim().substring(0, 60)
  );
  return `\n\n![${alt}](https://images.unsplash.com/photo-placeholder?w=800&q=80&auto=format&fit=crop&sig=${index}-${query})\n`;
}

/**
 * Extract section contexts from a markdown body.
 */
function extractSections(body: string): { index: number; context: string; type: string }[] {
  const sections: { index: number; context: string; type: string }[] = [];
  const lines = body.split('\n');
  let currentIndex = 0;

  // Find intro end (first paragraph break or first H2)
  const introEnd = lines.findIndex((l, i) => i > 0 && (l.startsWith('## ') || (l.trim() === '' && i > 2)));
  if (introEnd > 0) {
    sections.push({
      index: lines.slice(0, introEnd + 1).join('\n').length,
      context: lines.slice(0, Math.min(introEnd, 3)).join(' '),
      type: 'after_intro',
    });
  }

  // Find H2 sections
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('## ')) {
      const headerText = lines[i].replace(/^## /, '');
      // Find end of section content (next line break after some content)
      const sectionContentEnd = lines.findIndex((l, j) => j > i + 2 && l.trim() === '');
      const endIdx = sectionContentEnd > i ? sectionContentEnd : Math.min(i + 5, lines.length - 1);
      const offset = lines.slice(0, endIdx + 1).join('\n').length;

      sections.push({
        index: offset,
        context: headerText,
        type: 'after_h2',
      });
    }
  }

  return sections;
}

/**
 * Expand a post body with contextual images.
 * - Up to 8 images
 * - No more than 2 consecutive
 * - Cap at 6 if insufficient section relevance
 * - Never duplicates
 */
export function expandImages(body: string): ImageExpansionResult {
  const existing = (body.match(/!\[/g) || []).length;
  const maxNew = Math.min(8, 10 - existing); // Total cap of ~10 images

  if (maxNew <= 0) {
    return { modifiedBody: body, imagesAdded: 0, placements: [] };
  }

  const sections = extractSections(body);

  if (sections.length === 0) {
    return { modifiedBody: body, imagesAdded: 0, placements: [] };
  }

  // Cap at 6 if we don't have enough distinct sections
  const effectiveMax = sections.length < 4 ? Math.min(6, maxNew) : maxNew;

  // Select placement points (spread evenly)
  const placements: string[] = [];
  let modifiedBody = body;
  let imagesAdded = 0;
  let consecutiveCount = 0;
  let offset = 0;

  // Sort sections by position (reverse so we insert from back to avoid index shift)
  const sortedSections = [...sections].sort((a, b) => b.index - a.index);

  for (const section of sortedSections) {
    if (imagesAdded >= effectiveMax) break;

    // Check for consecutive image constraint
    const insertPos = section.index + offset;
    const nearbyContent = modifiedBody.substring(
      Math.max(0, insertPos - 100),
      Math.min(modifiedBody.length, insertPos + 100)
    );

    // Count existing images nearby
    const nearbyImages = (nearbyContent.match(/!\[/g) || []).length;
    if (nearbyImages >= 2) {
      consecutiveCount++;
      if (consecutiveCount >= 2) continue; // Skip to avoid 3+ consecutive
    } else {
      consecutiveCount = 0;
    }

    const imageBlock = createImageBlock(section.context, imagesAdded);
    modifiedBody = modifiedBody.substring(0, section.index) +
      imageBlock +
      modifiedBody.substring(section.index);

    placements.push(section.type);
    imagesAdded++;
    offset += imageBlock.length;
  }

  return { modifiedBody, imagesAdded, placements };
}
