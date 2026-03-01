/**
 * Crown Jewel Vault — Core Types
 */

export interface STierEntry {
  rank: number;
  id: string;
  name: string;
  cjpi: number;
  module: string;
  type: string;
  cluster?: string;
  description: string;
  dependencyFootprint: string[];
  exportMode: 'PureStandalone' | 'AdapterRequired';
  signatureHash: string;
  version: string;
  approved: boolean;
  generatedAt: string;
  hasCode: boolean;
}

export interface STierRegistry {
  version: string;
  generatedAt: string;
  totalArtifacts: number;
  canonicalModules: string[];
  entries: STierEntry[];
}
