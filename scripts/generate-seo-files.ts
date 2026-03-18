/**
 * Generate static SEO files (robots.txt, sitemap.xml, llms.txt) from the route registry.
 * Run: npx tsx scripts/generate-seo-files.ts
 * Also called automatically at build time via Vite plugin.
 */

import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";

// We import the generators from the registry
// Since this is a build script, we need to handle the TS imports
async function main() {
  // Dynamic import with tsx support
  const {
    generateRobotsTxt,
    generateSitemapXml,
    generateLlmsKeyPages,
    SITE_DOMAIN,
  } = await import("../src/config/routeRegistry");

  const publicDir = resolve(__dirname, "..", "public");
  const today = new Date().toISOString().slice(0, 10);

  // 1. robots.txt
  writeFileSync(resolve(publicDir, "robots.txt"), generateRobotsTxt(), "utf-8");
  console.log("✅ robots.txt generated");

  // 2. sitemap.xml
  writeFileSync(resolve(publicDir, "sitemap.xml"), generateSitemapXml(), "utf-8");
  console.log("✅ sitemap.xml generated");

  // 3. llms.txt — rebuild KEY PAGES section, keep rest intact
  const llmsPath = resolve(publicDir, "llms.txt");
  const existing = readFileSync(llmsPath, "utf-8");

  // Replace the KEY PAGES through COMPANY sections
  const keyPagesMarker = "## KEY PAGES";
  const afterSections = "## API ENDPOINTS";
  const keyPagesStart = existing.indexOf(keyPagesMarker);
  const afterEnd = existing.indexOf(afterSections);

  if (keyPagesStart !== -1 && afterEnd !== -1) {
    const before = existing.slice(0, keyPagesStart);
    const after = existing.slice(afterEnd);
    const newKeyPages = generateLlmsKeyPages();
    const updated = `${before}${newKeyPages}\n---\n\n${after}`;
    // Update the date
    const withDate = updated.replace(/# Updated: \d{4}-\d{2}-\d{2}/, `# Updated: ${today}`);
    writeFileSync(llmsPath, withDate, "utf-8");
    console.log("✅ llms.txt updated (key pages refreshed)");
  } else {
    console.warn("⚠️ Could not find KEY PAGES markers in llms.txt, skipping update");
  }
}

main().catch(console.error);
