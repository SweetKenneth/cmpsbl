/**
 * ENCODE — S-Tier Primitives
 * Semantic encoding, pipeline construction
 */

// semantic-encoding-pipeline has EncodingStage collision
export {
  encode as semanticEncode,
  createCustomStage,
  type EncodingStage as SemanticEncodingStage,
  type EncodedOutput,
} from '@/crownjewels/s-tier/040-semantic-encoding-pipeline';
