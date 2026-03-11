/**
 * ECONOMY — S-Tier Primitives
 * Cost attribution, ROI, billing reconciliation, cost arbitrage, waste detection
 */

export * from '@/crownjewels/s-tier/049-realtime-cost-attribution';
export * from '@/crownjewels/s-tier/087-roi-attribution';
export * from '@/crownjewels/s-tier/110-billing-reconciliation';
export * from '@/crownjewels/s-tier/126-autonomous-cost-arbitrage';
export * from '@/crownjewels/s-tier/085-resource-waste-profiler';
export * from '@/crownjewels/s-tier/089-quota-intelligence';
// waste-detection-intelligence has ResourceUsage/WasteItem/WasteReport collision with 085
export {
  WasteDetectionIntelligence,
  type ResourceUsage as WasteResourceUsage,
  type WasteItem as DetectedWasteItem,
  type WasteReport as WasteDetectionReport,
} from '@/crownjewels/s-tier/128-waste-detection-intelligence';
