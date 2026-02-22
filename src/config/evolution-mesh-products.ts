/**
 * Evolution Mesh — Stripe Product Configuration
 * Monthly subscriptions + one-time standalone lifetime license.
 */

export const EVOLUTION_MESH_PRODUCTS = {
  pro: {
    price_id: 'price_1T3kFQQ7FtTiAL4ayKv1251c',
    product_id: 'prod_U1nrp2Nt3zX5Mq',
    amount: 2900, // $29/mo
    interval: 'month' as const,
    mode: 'subscription' as const,
  },
  team: {
    price_id: 'price_1T3kFRQ7FtTiAL4aJ11S85t2',
    product_id: 'prod_U1nrElLNfuSaZs',
    amount: 9900, // $99/mo
    interval: 'month' as const,
    mode: 'subscription' as const,
  },
  standalone: {
    price_id: 'price_1T3kMBQ7FtTiAL4a4f2LZKXv',
    product_id: 'prod_U1nypQlcl7qMeR',
    amount: 39900, // $399 one-time
    interval: null,
    mode: 'payment' as const,
  },
} as const;

export type EvolutionMeshTier = keyof typeof EVOLUTION_MESH_PRODUCTS;
