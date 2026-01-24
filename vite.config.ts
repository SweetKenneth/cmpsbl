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
          // Only eagerly load react core - everything else deferred
          if (id.includes('node_modules')) {
            // React core - essential for initial render
            if (id.includes('react-dom') || id.includes('/react/')) {
              return 'react-vendor';
            }
            // React Router - essential for navigation
            if (id.includes('react-router')) {
              return 'react-vendor';
            }
            // Supabase - defer to when auth is actually needed
            if (id.includes('@supabase/')) {
              return 'supabase';
            }
            // Charts - defer heavily (recharts is huge)
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts';
            }
            // Radix UI - split by usage pattern
            if (id.includes('@radix-ui/react-tooltip')) {
              return 'tooltip';
            }
            if (id.includes('@radix-ui/')) {
              return 'ui-vendor';
            }
            // Framer Motion - defer animations
            if (id.includes('framer-motion')) {
              return 'motion';
            }
          }
        },
      },
    },
    // Reduce chunk size warnings threshold
    chunkSizeWarningLimit: 1000,
  },
}));
