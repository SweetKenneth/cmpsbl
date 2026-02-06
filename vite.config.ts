import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from "vite-plugin-pwa";

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
        manifest: {
          name: "PromptFluid",
          short_name: "PromptFluid",
          description: "AI That Flows - Advanced AI security and administration platform",
          theme_color: "#7A5FFF",
          background_color: "#0A0B10",
          display: "standalone",
          start_url: "/",
          icons: [
            {
              src: "/pwa-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any",
            },
            {
              src: "/pwa-512x512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "any maskable",
            },
          ],
        },
        workbox: {
          skipWaiting: true,
          clientsClaim: true,
        },
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Enable modulepreload polyfill for older browsers and proper preloading
    modulePreload: {
      polyfill: true,
    },
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
            // Charts - defer heavily (recharts is huge)
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts';
            }
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
            // Framer Motion - defer animations
            if (id.includes('framer-motion')) {
              return 'motion';
            }
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
