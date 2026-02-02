/**
 * Capabilities Depot — Artifact Contract & Types
 * Downloadable, licensed capability artifacts (no support, no hosting)
 * v1.0.0
 */

// === Capability Categories ===
export type CapabilityCategory = 
  | 'intelligence'
  | 'optimization'
  | 'resilience'
  | 'security'
  | 'accessibility'
  | 'automation'
  | 'orchestration';

// === Executor Types ===
export type ExecutorType = 'js' | 'edge' | 'wasm' | 'container';

// === Artifact Formats ===
export type ArtifactFormat = 'zip' | 'tar' | 'npm' | 'wasm' | 'container';

// === Governance Levels ===
export type GovernanceLevel = 'manual' | 'governed' | 'bounded';

// === Pricing Tiers ===
export type PricingTier = 'utility' | 'advanced' | 'system' | 'flagship';

// === Core Capability Artifact Contract ===
export interface CapabilityArtifact {
  /** Unique identifier */
  id: string;
  
  /** URL-safe slug */
  slug: string;
  
  /** Display name */
  name: string;
  
  /** Functional category */
  category: CapabilityCategory;
  
  /** Short description (max 200 chars) */
  description: string;
  
  /** Long description with markdown support */
  longDescription?: string;
  
  /** Required substrate modules */
  requiredModules: string[];
  
  /** Compatible substrate modules */
  compatibleModules?: string[];
  
  /** Executor type for local execution */
  executorType: ExecutorType;
  
  /** Downloadable artifact format */
  artifactFormat: ArtifactFormat;
  
  /** Semantic version */
  version: string;
  
  /** SHA-256 checksum of artifact */
  checksum: string;
  
  /** Markdown release notes */
  releaseNotes: string;
  
  /** Governance classification */
  governanceLevel: GovernanceLevel;
  
  /** Execution mode — always local_only for depot */
  executionMode: 'local_only';
  
  /** Support policy */
  supportPolicy: 'unsupported' | 'licensed_support';
  
  /** License required for download */
  licenseRequired: true;
  
  /** Price in USD */
  priceUsd: number;
  
  /** Pricing tier classification */
  pricingTier: PricingTier;
  
  /** ISO date of last update */
  lastUpdated: string;
  
  /** ISO date of initial release */
  releaseDate: string;
  
  /** Download count */
  downloads?: number;
  
  /** Feature highlights */
  features?: string[];
  
  /** Usage examples */
  usageExamples?: string[];
  
  /** Tags for search */
  tags?: string[];
  
  /** Preview image URL */
  previewImage?: string;
  
  /** Estimated setup time in minutes */
  setupTimeMinutes?: number;
  
  /** Difficulty level */
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  /** Target buyer persona (S-tier) */
  buyerPersona?: string;
  
  /** Sales pitch tagline (S-tier) */
  salesPitch?: string;
}

// === Version History Entry ===
export interface VersionHistoryEntry {
  version: string;
  releaseDate: string;
  releaseNotes: string;
  checksum: string;
  breaking?: boolean;
}

// === Capability with Version History ===
export interface CapabilityWithHistory extends CapabilityArtifact {
  versionHistory: VersionHistoryEntry[];
}

// === User License ===
export interface CapabilityLicense {
  /** License ID */
  id: string;
  
  /** User ID */
  userId: string;
  
  /** Capability ID */
  capabilityId: string;
  
  /** Purchase date */
  purchaseDate: string;
  
  /** License status */
  status: 'active' | 'revoked' | 'expired';
  
  /** Purchased version */
  purchasedVersion: string;
  
  /** Latest downloaded version */
  lastDownloadedVersion?: string;
  
  /** Download count */
  downloadCount: number;
  
  /** Last download date */
  lastDownloadDate?: string;
  
  /** Order reference */
  orderRef?: string;
}

// === Download Request ===
export interface DownloadRequest {
  capabilityId: string;
  userId: string;
  version?: string; // defaults to latest
}

// === Download Response ===
export interface DownloadResponse {
  success: boolean;
  downloadUrl?: string;
  expiresAt?: string;
  error?: string;
  errorCode?: 'NO_LICENSE' | 'LICENSE_REVOKED' | 'LICENSE_EXPIRED' | 'VERSION_NOT_FOUND' | 'DOWNLOAD_LIMIT';
}

// === Artifact Package Manifest (capability.json) ===
export interface CapabilityManifest {
  name: string;
  version: string;
  description: string;
  category: CapabilityCategory;
  executorType: ExecutorType;
  requiredModules: string[];
  governanceLevel: GovernanceLevel;
  author?: string;
  license: string;
  repository?: string;
  main: string; // entry point file
  exports?: Record<string, string>;
}

// === Validation Result ===
export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

// === Filter Options ===
export interface CapabilityFilters {
  category?: CapabilityCategory;
  executorType?: ExecutorType;
  pricingTier?: PricingTier;
  search?: string;
  tags?: string[];
  sortBy?: 'price' | 'name' | 'downloads' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
}
