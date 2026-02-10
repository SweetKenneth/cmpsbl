import { motion } from "framer-motion";
import { Download, Clock, Sparkles, ArrowRight, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LnchblCTA() {
  return (
    <section className="relative z-10 px-4 py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-4xl mx-auto"
      >
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card/80 to-violet-500/10 backdrop-blur-sm shadow-xl shadow-primary/5">
          {/* Animated glow border */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/20 via-transparent to-violet-500/20 opacity-50 animate-pulse pointer-events-none" />
          
          <div className="relative p-8 sm:p-10 md:p-12">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 mb-6"
            >
              <Rocket className="w-4 h-4 text-primary" />
              <span className="text-sm font-bold tracking-wide text-primary">100% FREE — No Strings Attached</span>
            </motion.div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 leading-tight">
              <span className="text-foreground">Download the World's First </span>
              <span className="bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent">
                Public Cognitive Substrate
              </span>
            </h2>

            <p className="text-lg sm:text-xl text-muted-foreground mb-6 max-w-2xl leading-relaxed">
              Get your own copy of the full CMPSBL substrate — the same 14-module, self-evolving AI operating system 
              you see here — completely free from our companion site.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/40 border border-border/50">
                <Download className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-foreground">Free Download</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/40 border border-border/50">
                <Clock className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium text-foreground">Add Memory in 10 Minutes</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/40 border border-border/50">
                <Sparkles className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium text-foreground">Persistent Memory Guide Included</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                asChild
                className="group text-lg px-8 py-6 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <a href="https://LNCHBL.com" target="_blank" rel="noopener noreferrer">
                  <Download className="w-5 h-5 mr-2" />
                  Get Your Free Copy
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-lg px-8 py-6"
              >
                <a href="https://LNCHBL.com" target="_blank" rel="noopener noreferrer">
                  View Setup Guide
                </a>
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-6">
              No account required • Full substrate • Persistent memory in minutes • Powered by LNCHBL
            </p>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
