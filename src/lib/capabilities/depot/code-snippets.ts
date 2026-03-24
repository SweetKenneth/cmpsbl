/**
 * Code Snippet Generator for Capabilities
 * Generates SDK import and usage examples for each capability
 *
 */

import type { CapabilityArtifact } from './types';

/**
 * Generate SDK import statement for a capability
 */
export function getSDKImport(capability: CapabilityArtifact): string {
  // Convert capability slug to camelCase function name
  const functionName = slugToCamelCase(capability.slug);
  return `import { ${functionName} } from '@cmpsbl/sdk/capabilities';`;
}

/**
 * Generate a code snippet for a capability
 */
export function getCodeSnippet(capability: CapabilityArtifact): string {
  const functionName = slugToCamelCase(capability.slug);
  const modulesComment = capability.requiredModules.join(', ');
  
  // Base template
  return `// ${capability.name}
// Required modules: ${modulesComment}
import { ${functionName} } from '@cmpsbl/sdk/capabilities';
import { createClient } from '@cmpsbl/sdk';

// Initialize the CMPSBL client
const client = createClient({
  apiKey: process.env.CMPSBL_API_KEY,
});

// Execute the capability
const result = await ${functionName}(client, {
  // Configure your parameters here
  ${getDefaultParams(capability)}
});

console.log('Result:', result);`;
}

/**
 * Get default parameters based on capability category
 */
function getDefaultParams(capability: CapabilityArtifact): string {
  switch (capability.category) {
    case 'intelligence':
      return `input: "Your data or query here",
  model: "default", // or specify a model
  confidence: 0.8,`;
    case 'optimization':
      return `target: "performance", // or "cost", "latency"
  constraints: {},
  maxIterations: 100,`;
    case 'resilience':
      return `fallbackEnabled: true,
  retryCount: 3,
  timeout: 30000,`;
    case 'security':
      return `scanLevel: "standard", // or "deep", "quick"
  includeRemediation: true,`;
    case 'accessibility':
      return `url: "https://your-site.com",
  wcagLevel: "AA", // or "A", "AAA"
  autoFix: false,`;
    case 'automation':
      return `workflow: "default",
  dryRun: false,
  verbose: true,`;
    case 'orchestration':
      return `pipeline: [],
  parallelism: 4,
  errorHandling: "continue",`;
    default:
      return `// Add your configuration`;
  }
}

/**
 * Convert slug to camelCase function name
 */
function slugToCamelCase(slug: string): string {
  return slug
    .split('-')
    .map((word, index) => 
      index === 0 
        ? word.toLowerCase() 
        : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    )
    .join('');
}

/**
 * Generate Playground URL for a capability
 */
export function getCodeLabUrl(capability: CapabilityArtifact): string {
  const code = encodeURIComponent(getCodeSnippet(capability));
  return `/codelab?capability=${capability.id}&code=${code}`;
}

/**
 * Generate a minimal quick-start snippet
 */
export function getQuickStartSnippet(capability: CapabilityArtifact): string {
  const functionName = slugToCamelCase(capability.slug);
  return `import { ${functionName} } from '@cmpsbl/sdk/capabilities';

const result = await ${functionName}(client, { /* config */ });`;
}
