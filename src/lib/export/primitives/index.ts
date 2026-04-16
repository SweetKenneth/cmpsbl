/**
 * Polyglot Primitives — Public Barrel
 * Single entry point for the BehavioralSpec system.
 */
export {
  PRIMITIVE_SPECS,
  SPEC_BY_MODULE,
  KNOWN_PRIMITIVES,
  getSpec,
  type PrimitiveSpec,
  type SpecField,
  type SpecOp,
} from './behavioral-spec';

export {
  TIER_A_ADAPTERS,
  getAdapter,
  RUST_ADAPTER,
  GO_ADAPTER,
  JAVA_ADAPTER,
  CSHARP_ADAPTER,
  SWIFT_ADAPTER,
  KOTLIN_ADAPTER,
  RUBY_ADAPTER,
  LUA_ADAPTER,
  DART_ADAPTER,
  SCALA_ADAPTER,
  C_ADAPTER,
  CPP_ADAPTER,
  type LanguageAdapter,
} from './language-adapters';

export {
  transpileHandlers,
  transpileHandlersFor,
  reportTranspilation,
  type TranspileReport,
} from './transpiler';
