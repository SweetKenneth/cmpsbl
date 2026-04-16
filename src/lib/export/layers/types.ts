/**
 * CMPSBL® Layer — Shared Type Definitions
 * Pillar files import from here; consumers import from `cmpsbl-layers.ts`.
 */

export interface CmpsblLayerDefinition {
  /** Unique layer ID (e.g., 'self-healing') */
  id: string;
  /** Display name */
  name: string;
  /** Crown Jewel rank */
  crownJewelRank: number;
  /** CJPI score */
  cjpi: number;
  /** Primitive module this layer belongs to */
  module: string;
  /** Short description */
  description: string;
  /** Price in cents (0 = free) */
  priceCents: number;
  /** TypeScript code to embed in Layer 2 */
  tsCode: string;
  /** Python code to embed in Layer 2 */
  pyCode: string;
  /** Auto-wire spec: how the layer wraps customer functions */
  autoWire: {
    /** The wrapper function name exposed in Layer 2 */
    wrapperName: string;
    /** Description of what auto-wiring does */
    behavior: string;
    /** TS auto-wire code — wraps cmpsbl_execute */
    tsWire: string;
    /** PY auto-wire code — wraps cmpsbl_execute */
    pyWire: string;
  };
}
