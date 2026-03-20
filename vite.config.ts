import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";
import { seoPrerender } from "./plugins/vite-seo-prerender";
import { prerenderRoutes } from "./plugins/prerender-routes";
import { performanceBudget } from "./plugins/vite-performance-budget";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),

    // IMPORTANT: Disable PWA in preview/dev to avoid manifest/CORS loops.
    mode === "production" &&
      VitePWA({
        registerType: "autoUpdate",
        injectRegister: false, // Disable auto-injection to manually defer SW registration
        includeAssets: ["favicon.png", "icon-192.png", "icon-512.png", "apple-touch-icon.png"],

        // Critical: prevent build-time injection of <link rel="manifest">.
        // We manage the manifest link manually in index.html (and disable it in editor/preview)
        // to avoid auth-bridge/CORS loops that can cause mobile reload/crash behavior.
        manifest: false,

        workbox: {
          skipWaiting: true,
          clientsClaim: true,
          navigateFallbackDenylist: [/^\/~oauth/],
          // Cache vault and admin routes for offline access
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/bxodolqqczjuahwdrswy\.supabase\.co\/rest\/v1\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'supabase-api-cache',
                expiration: { maxEntries: 100, maxAgeSeconds: 86400 },
                networkTimeoutSeconds: 5,
              },
            },
          ],
        },
      }),

    // SEO: Generate per-route static HTML shells with correct meta tags
    mode === "production" &&
      seoPrerender({
        baseUrl: 'https://cmpsbl.com',
        routes: prerenderRoutes,
      }),

    // Performance budget enforcement (Item #24)
    mode === "production" &&
      performanceBudget({
        maxInitialJs: 600,
        maxChunkSize: 350,
        maxCss: 200,
        mode: 'warn',
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: [
      "react", "react-dom", "react/jsx-runtime",
      "@tanstack/react-query", "zustand", "framer-motion",
    ],
  },
  build: {
    // Disable automatic modulepreload to prevent eager loading of lazy chunks (charts, motion)
    // This reduces unused JS on landing page by ~200KB
    modulePreload: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // React core + router — essential for initial render
            if (id.includes('react-dom') || id.includes('/react/') || id.includes('react-router')) {
              return 'react-vendor';
            }
            // Supabase — split realtime (large, rarely needed initially)
            if (id.includes('@supabase/realtime')) {
              return 'supabase-realtime';
            }
            if (id.includes('@supabase/')) {
              return 'supabase';
            }
            // All Radix UI in one chunk to avoid circular init order issues
            if (id.includes('@radix-ui/')) {
              return 'ui-radix';
            }
            // TanStack Query
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
            // Recharts — heavy charting lib, deduplicate across lazy chunks
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
              return 'recharts-vendor';
            }
            // Framer Motion — split from entry bundle
            if (id.includes('framer-motion')) {
              return 'framer-motion';
            }
            // Three.js — 3D rendering, rarely needed on initial load
            if (id.includes('three') || id.includes('@react-three')) {
              return 'three-vendor';
            }
            // Date utilities — used by many pages but not landing
            if (id.includes('date-fns')) {
              return 'date-fns';
            }
            // Markdown renderer — only blog/docs pages
            if (id.includes('react-markdown') || id.includes('remark') || id.includes('rehype') || id.includes('unified') || id.includes('micromark') || id.includes('mdast')) {
              return 'markdown-vendor';
            }
            // Zod — validation, defer from entry
            if (id.includes('zod')) {
              return 'zod';
            }
            // JSZip/file-saver — download features only
            if (id.includes('jszip') || id.includes('file-saver')) {
              return 'download-vendor';
            }
          }
        },
      },
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
  },
}));
