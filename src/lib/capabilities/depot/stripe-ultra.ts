/**
 * Capabilities Depot — Stripe Ultra Expansion
 * Normalized Stripe product/price mappings for ultra capabilities
 * v2.0.0 — Unified Pricing ($19-$299 public range)
 */

import type { CapabilityStripeConfig } from './stripe-config';

// Ultra expansion capabilities Stripe config — Normalized to $19-$299 range
export const ULTRA_STRIPE_CONFIG: Record<string, CapabilityStripeConfig> = {
  // === Data & Pipeline ===
  'cap-data-pipeline-orchestrator': {
    productId: 'prod_TtztP86hJKHjJg',
    priceId: 'price_1SwBtNQ7FtTiAL4a3VGhbd8A',
    priceUsd: 199, // normalized from 499
  },
  'cap-vector-similarity': {
    productId: 'prod_Ttzt6LhlGgCa2a',
    priceId: 'price_1SwBtNQ7FtTiAL4a2P0fIupg',
    priceUsd: 149, // normalized from 349
  },
  'cap-prompt-engineering': {
    productId: 'prod_TtztXvWM1m2CBW',
    priceId: 'price_1SwBtOQ7FtTiAL4abBdbZwYB',
    priceUsd: 149, // normalized from 299
  },

  // === Multi-Modal & Fusion ===
  'cap-multi-modal-fusion': {
    productId: 'prod_Ttzt18CElN7KTa',
    priceId: 'price_1SwBtPQ7FtTiAL4azbo2ffUr',
    priceUsd: 299, // normalized from 799
  },
  'cap-agent-collaboration': {
    productId: 'prod_TtztDIKUpozn7V',
    priceId: 'price_1SwBtRQ7FtTiAL4a5AvVYYFU',
    priceUsd: 299, // normalized from 899
  },

  // === Streaming & Real-Time ===
  'cap-streaming-response': {
    productId: 'prod_TtztHKiu9xXBSJ',
    priceId: 'price_1SwBtSQ7FtTiAL4aKnm16SBY',
    priceUsd: 149, // normalized from 199
  },
  'cap-context-window-manager': {
    productId: 'prod_TtztKsjiCytYhQ',
    priceId: 'price_1SwBtTQ7FtTiAL4a2s7dIYCQ',
    priceUsd: 99, // normalized from 249
  },

  // === Caching & Performance ===
  'cap-embedding-cache': {
    productId: 'prod_Ttzt0vEnZOAbQR',
    priceId: 'price_1SwBtVQ7FtTiAL4a80Abl3hf',
    priceUsd: 99, // normalized from 179
  },
  'cap-function-calling': {
    productId: 'prod_TtztMGd5OZj7lw',
    priceId: 'price_1SwBtWQ7FtTiAL4ahG4wAOsj',
    priceUsd: 149, // normalized from 329
  },

  // === RAG & Retrieval ===
  'cap-rag-pipeline-pro': {
    productId: 'prod_TtztFR9bOG36QC',
    priceId: 'price_1SwBtXQ7FtTiAL4a7kK7saus',
    priceUsd: 199, // normalized from 599
  },
  'cap-document-intelligence': {
    productId: 'prod_TtztO1HxnxcvLP',
    priceId: 'price_1SwBtaQ7FtTiAL4aNUJGvTsT',
    priceUsd: 199, // normalized from 449
  },
  'cap-structured-output': {
    productId: 'prod_TtztIpQcC6ZW9W',
    priceId: 'price_1SwBtbQ7FtTiAL4aFGRG80tP',
    priceUsd: 149, // normalized from 279
  },

  // === Enterprise & Advanced — OFF-MENU ===
  'cap-model-fine-tuning': {
    productId: 'prod_TtztKT0Zd5rP72',
    priceId: 'price_1SwBtdQ7FtTiAL4aZbEHzQYe',
    priceUsd: 1199,
    offMenu: true, // Enterprise capability
  },
  'cap-conversation-threading': {
    productId: 'prod_TtztyJ8Hqw0JIo',
    priceId: 'price_1SwBteQ7FtTiAL4aSEuVClZA',
    priceUsd: 99, // normalized from 159
  },
  'cap-semantic-search-platform': {
    productId: 'prod_TtztwK1RzDJgfh',
    priceId: 'price_1SwBtfQ7FtTiAL4ad6KCrRWH',
    priceUsd: 199, // normalized from 699
  },
  'cap-language-processing-hub': {
    productId: 'prod_TtztTElBFzQsG5',
    priceId: 'price_1SwBtgQ7FtTiAL4aclzHNIv8',
    priceUsd: 199, // normalized from 529
  },
  'cap-response-quality': {
    productId: 'prod_TtztDziuLFDVUp',
    priceId: 'price_1SwBthQ7FtTiAL4aZi2g2dUK',
    priceUsd: 149, // normalized from 379
  },
  'cap-output-parser-pro': {
    productId: 'prod_TtztmpsBBXs92o',
    priceId: 'price_1SwBtiQ7FtTiAL4amwXjdgsk',
    priceUsd: 149, // normalized from 219
  },
  'cap-workflow-automation': {
    productId: 'prod_TtztSoNoQLbZ7c',
    priceId: 'price_1SwBtjQ7FtTiAL4aDhfTewRL',
    priceUsd: 299, // normalized from 999
  },
  'cap-advanced-memory': {
    productId: 'prod_TtztuZSFbyKawa',
    priceId: 'price_1SwBtlQ7FtTiAL4a5oH7LP9P',
    priceUsd: 299, // normalized from 849
  },
  'cap-code-generation': {
    productId: 'prod_TtztP0bSP65pwr',
    priceId: 'price_1SwBtoQ7FtTiAL4aVr8rHLUv',
    priceUsd: 299, // normalized from 1399
  },
  'cap-sentiment-analysis': {
    productId: 'prod_TtztXOoPODozhM',
    priceId: 'price_1SwBtpQ7FtTiAL4aCV4ncJT2',
    priceUsd: 199, // normalized from 429
  },
  'cap-entity-extraction': {
    productId: 'prod_Ttztq81veRV9Zx',
    priceId: 'price_1SwBtqQ7FtTiAL4aDbplLSoa',
    priceUsd: 199, // normalized from 679
  },
  'cap-text-classification': {
    productId: 'prod_TtztrEGNXJemwS',
    priceId: 'price_1SwBtrQ7FtTiAL4ax6s9J55f',
    priceUsd: 149, // normalized from 239
  },
  'cap-content-moderation': {
    productId: 'prod_TtztWCXdfA5Pqc',
    priceId: 'price_1SwBtsQ7FtTiAL4amFozzfI3',
    priceUsd: 149, // normalized from 399
  },
  'cap-knowledge-graph-builder': {
    productId: 'prod_TtztdLN2FyJ8xw',
    priceId: 'price_1SwBttQ7FtTiAL4ajyeEVVy1',
    priceUsd: 299, // normalized from 749
  },
  'cap-question-answering': {
    productId: 'prod_TtztScjAKNtpXg',
    priceId: 'price_1SwBtuQ7FtTiAL4azvmjr3qw',
    priceUsd: 199, // normalized from 549
  },
  'cap-document-summarizer': {
    productId: 'prod_TtztBRi7lmvkrF',
    priceId: 'price_1SwBtvQ7FtTiAL4aqlmIpR36',
    priceUsd: 199, // normalized from 469
  },
  'cap-model-evaluation': {
    productId: 'prod_Ttztlfo3Q0Efyw',
    priceId: 'price_1SwBtwQ7FtTiAL4aMnpm3rzf',
    priceUsd: 299, // normalized from 1599
  },
  'cap-privacy-protection': {
    productId: 'prod_TtztNHlQmqara2',
    priceId: 'price_1SwBtxQ7FtTiAL4axNxbuNXI',
    priceUsd: 199, // normalized from 649
  },
};

// Get ultra config
export function getUltraStripeConfig(capabilityId: string): CapabilityStripeConfig | undefined {
  return ULTRA_STRIPE_CONFIG[capabilityId];
}

// Check if capability is in ultra expansion
export function hasUltraStripeConfig(capabilityId: string): boolean {
  return capabilityId in ULTRA_STRIPE_CONFIG;
}
