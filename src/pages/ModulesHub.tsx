/**
 * Modules Hub — Central index of all 14 substrate modules
 * SEO: /modules — captures "CMPSBL modules", "AI substrate components"
 */

import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { MODULE_REGISTRY, LAYERS, LAYER_COLORS, getModulesByLayer } from "@/lib/modules/module-registry";
import { cn } from "@/lib/utils";

export default function ModulesHub() {
  return (
    <>
      <Helmet>
        <title>Substrate Modules — 14 Core AI Components | CMPSBL</title>
        <meta name="description" content="Explore the 14 core modules powering the CMPSBL Substrate OS — from persistent memory and intelligent routing to AI security and autonomous optimization." />
        <link rel="canonical" href="https://cmpsbl.com/modules" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "CMPSBL Substrate Modules",
          "description": "14 core AI modules organized across 5 architectural layers",
          "url": "https://cmpsbl.com/modules",
          "publisher": { "@type": "Organization", "name": "CMPSBL", "url": "https://cmpsbl.com" },
          "hasPart": MODULE_REGISTRY.map(m => ({
            "@type": "SoftwareApplication",
            "name": `CMPSBL ${m.name}`,
            "description": m.description,
            "url": `https://cmpsbl.com/modules/${m.slug}`,
            "applicationCategory": "AI Infrastructure",
          }))
        })}</script>
      </Helmet>

      <PublicNav />

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-20 sm:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
          <div className="container mx-auto max-w-5xl px-4 relative">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-primary mb-4">
                Substrate Architecture
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                14 Modules. 5 Layers.{" "}
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  One Intelligence.
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Each module is a specialized AI subsystem. Together, they form a cognitive operating system 
                that learns, adapts, and evolves — autonomously.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Modules by Layer */}
        {LAYERS.map((layer, layerIdx) => {
          const modules = getModulesByLayer(layer);
          return (
            <section key={layer} className="py-12 sm:py-16">
              <div className="container mx-auto max-w-6xl px-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.4, delay: layerIdx * 0.05 }}
                >
                  {/* Layer Header */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className={cn("h-8 w-1 rounded-full bg-gradient-to-b", LAYER_COLORS[layer])} />
                    <div>
                      <h2 className="text-2xl font-bold">{layer} Layer</h2>
                      <p className="text-sm text-muted-foreground">
                        {layer === 'Kernel' && 'Boot, events, and identity — the foundation everything runs on'}
                        {layer === 'Cognitive' && 'Memory and personality — how the substrate thinks and speaks'}
                        {layer === 'Operational' && 'Security, routing, monitoring, optimization, and connectivity'}
                        {layer === 'Administrative' && 'Deployment, accessibility, and architecture evolution'}
                        {layer === 'Orchestrator' && 'Cross-module coordination and emergent intelligence'}
                      </p>
                    </div>
                  </div>

                  {/* Module Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {modules.map((mod, idx) => (
                      <Link
                        key={mod.slug}
                        to={`/modules/${mod.slug}`}
                        className="group relative p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-all duration-200 hover:shadow-lg hover:border-primary/30"
                      >
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                            <mod.icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-bold text-foreground">{mod.name}</h3>
                              <span className="text-[10px] font-mono text-muted-foreground">{mod.layer}</span>
                            </div>
                            <p className="text-sm font-medium text-primary/80 mb-2">{mod.tagline}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">{mod.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-4 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                          Explore module <ArrowRight className="w-3 h-3" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </div>
            </section>
          );
        })}
      </main>

      <EnhancedFooter />
    </>
  );
}
