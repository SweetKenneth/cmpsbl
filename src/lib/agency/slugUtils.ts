/**
 * Agency slug utilities — Generate URL-safe slugs for agencies
 */

/**
 * Generate a URL-safe slug from a name
 * Adds random suffix to ensure uniqueness
 */
export function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .slice(0, 40); // Limit length

  // Add 6-char random suffix for uniqueness
  const suffix = Math.random().toString(36).substring(2, 8);
  
  return base ? `${base}-${suffix}` : suffix;
}

/**
 * Generate the full portal URL for an agency slug
 */
export function getAgencyPortalUrl(slug: string): string {
  // Use current origin or fallback to production domain
  const origin = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://cmpsbl.com';
  
  return `${origin}/a/${slug}`;
}

/**
 * Validate a slug format
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length < 3 || slug.length > 50) return false;
  return /^[a-z0-9-]+$/.test(slug);
}
