/**
 * Evolution Mesh — Stripe Product Configuration
 * Monthly subscription pricing for the standalone SDK product.
 */

export const EVOLUTION_MESH_PRODUCTS = {
  pro: {
    price_id: 'price_1T3kFQQ7FtTiAL4ayKv1251c',
    product_id: 'prod_U1nrp2Nt3zX5Mq',
    amount: 2900, // $29/mo
    interval: 'month' as const,
  },
  team: {
    price_id: 'price_1T3kFRQ7FtTiAL4aJ11S85t2',
    product_id: 'prod_U1nrElLNfuSaZs',
    amount: 9900, // $99/mo
    interval: 'month' as const,
  },
} as const;

export type EvolutionMeshTier = keyof typeof EVOLUTION_MESH_PRODUCTS;
