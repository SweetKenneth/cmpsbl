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
        includeAssets: ["favicon.png", "pwa-192x192.png", "pwa-512x512.png", "apple-touch-icon.png"],

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
          // Aggressive code-splitting to reduce unused JS
          if (id.includes('node_modules')) {
            // React core - essential for initial render (minimal)
            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'react-vendor';
            }
            // React Router - essential for navigation
            if (id.includes('react-router')) {
              return 'react-vendor';
            }
            // Supabase - split into auth vs realtime vs core for granular loading
            if (id.includes('@supabase/realtime')) {
              return 'supabase-realtime';
            }
            if (id.includes('@supabase/auth')) {
              return 'supabase-auth';
            }
            if (id.includes('@supabase/')) {
              return 'supabase';
            }
            // Charts: Do NOT assign to manualChunks — let Rollup naturally
            // place recharts/d3 in the lazy chunk that imports them.
            // Forcing them into a named chunk creates a static import edge
            // from the entry bundle, loading 106KB on every page load.
            // Radix UI - split into micro-chunks by component for tree-shaking
            // Critical UI (needed immediately)
            if (id.includes('@radix-ui/react-slot') || id.includes('@radix-ui/react-primitive')) {
              return 'ui-core';
            }
            // Tooltip - separate chunk (often lazy-triggered)
            if (id.includes('@radix-ui/react-tooltip')) {
              return 'tooltip';
            }
            // Dialog/Modal components - defer (user action triggered)
            if (id.includes('@radix-ui/react-dialog') || id.includes('@radix-ui/react-alert-dialog')) {
              return 'ui-dialog';
            }
            // Dropdown/Menu components - defer (user action triggered)
            if (id.includes('@radix-ui/react-dropdown') || id.includes('@radix-ui/react-menu') || id.includes('@radix-ui/react-context-menu')) {
              return 'ui-menu';
            }
            // Form components - defer (not on initial render)
            if (id.includes('@radix-ui/react-select') || id.includes('@radix-ui/react-checkbox') || id.includes('@radix-ui/react-radio') || id.includes('@radix-ui/react-switch') || id.includes('@radix-ui/react-slider')) {
              return 'ui-form';
            }
            // Navigation components
            if (id.includes('@radix-ui/react-navigation') || id.includes('@radix-ui/react-tabs') || id.includes('@radix-ui/react-accordion')) {
              return 'ui-nav';
            }
            // Popover/HoverCard - defer (user action triggered)
            if (id.includes('@radix-ui/react-popover') || id.includes('@radix-ui/react-hover-card')) {
              return 'ui-popover';
            }
            // All other Radix UI
            if (id.includes('@radix-ui/')) {
              return 'ui-misc';
            }
            // Lucide icons & Framer Motion: Do NOT assign to manualChunks.
            // Named manual chunks create static import edges from the entry bundle,
            // loading ~103KB (icons 47KB + motion 56KB) on every page even when
            // only a fraction is used. Let Rollup naturally inline them into the
            // lazy chunks that import them — each route loads only what it needs.
            // TanStack Query - essential but separate
            if (id.includes('@tanstack/react-query')) {
              return 'query';
            }
          }
        },
      },
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
  },
}));
