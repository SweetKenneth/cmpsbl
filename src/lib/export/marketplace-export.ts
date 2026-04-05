/**
 * Marketplace Export — Generates Convex Core™ Sealed Artifact ZIP for marketplace purchases
 * 
 * Reuses the universal export infrastructure to deliver the full artifact package:
 * source code variants, HTML report, User Guide, Integration Guide, LICENSE, README,
 * and Convex Core™ — all in a single downloadable ZIP.
 *
 * © 2025–2026 CMPSBL® · PromptFluid™. All rights reserved.
 */

import type { MarketplaceItem } from '@/agents/merchant/merchant-engine';
import { downloadTieredFoundryZip, type TieredFoundryExportArtifact } from './foundry-tiered-zip';

/** Map a MarketplaceItem to the universal export artifact shape */
function toExportArtifact(item: MarketplaceItem): TieredFoundryExportArtifact {
  return {
    id: item.id,
    name: item.title,
    score: item.cjpiScore,
    publicTier: item.tier,
    category: item.category,
    systemChain: item.primitiveChain,
    description: item.description,
    fingerprint: item.sourceId,
    source: `CMPSBL Marketplace · ${item.sourceSubstrate.toUpperCase()} Substrate`,
  };
}

/**
 * Download a single marketplace item as a full Convex Core™ Sealed Artifact ZIP.
 * Works for both paid purchases (post-checkout) and free drops (no auth).
 */
export async function downloadMarketplaceArtifact(item: MarketplaceItem): Promise<void> {
  const artifact = toExportArtifact(item);

  await downloadTieredFoundryZip({
    artifacts: [artifact],
    filePrefix: `cmpsbl-marketplace-${item.slug}`,
    sourceLabel: `Marketplace · ${item.tier} Tier`,
  });
}
