/**
 * Vite Plugin: Auto-generate SEO files (robots.txt, sitemap.xml) from route registry at build time.
 * This ensures the static files always stay in sync with the route registry.
 */

import { writeFileSync } from "fs";
import { resolve } from "path";
import type { Plugin } from "vite";

export function seoFileGenerator(): Plugin {
  return {
    name: "vite-seo-file-generator",
    apply: "build",
    async buildStart() {
      try {
        const {
          generateRobotsTxt,
          generateSitemapXml,
        } = await import("../src/config/routeRegistry");

        const publicDir = resolve(__dirname, "..", "public");

        writeFileSync(resolve(publicDir, "robots.txt"), generateRobotsTxt(), "utf-8");
        writeFileSync(resolve(publicDir, "sitemap.xml"), generateSitemapXml(), "utf-8");

        console.log("✅ SEO files generated from route registry");
      } catch (e) {
        console.warn("⚠️ SEO file generation skipped:", (e as Error).message);
      }
    },
  };
}
