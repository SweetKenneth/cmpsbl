 /**
  * UseCaseShowcase - Compelling future applications directly under hero
  * Shows what can be built on the substrate now and in the future
  */
 
 import { motion } from "framer-motion";
 import { Link } from "react-router-dom";
 import {
   Gamepad2,
   Building2,
   Code,
   Brain,
   Shield,
   Stethoscope,
   Plane,
   ChefHat,
   ArrowRight,
 } from "lucide-react";
 import { Badge } from "@/components/ui/badge";
 import { cn } from "@/lib/utils";
 
 const useCases = [
   {
     icon: Gamepad2,
     title: "NPCs That Dream & Evolve",
      description: "Game characters with persistent memory that adapt to player style, remember past encounters, and dream new strategies between sessions.",
     industry: "Gaming",
     color: "text-purple-500",
     gradient: "from-purple-500/20 to-violet-500/20",
     timeline: "Available Now",
   },
   {
     icon: Brain,
     title: "Chatbots With True Memory",
      description: "Conversational AI that remembers customer history, builds relationship context, and provides personalized support that improves with every interaction.",
     industry: "Development",
     color: "text-cyan-500",
     gradient: "from-cyan-500/20 to-blue-500/20",
     timeline: "Available Now",
   },
   {
     icon: ChefHat,
     title: "Cooking Apps That Learn",
      description: "Recipe platforms that learn your taste preferences, adapt to ingredient availability, suggest meal plans, and remember what worked.",
     industry: "Consumer",
     color: "text-green-500",
     gradient: "from-green-500/20 to-emerald-500/20",
     timeline: "Available Now",
   },
    {
      icon: Code,
      title: "IDE Assistants With Context",
      description: "Code editors that remember your patterns, understand project architecture, and suggest refactors based on your style evolution.",
      industry: "Development",
      color: "text-blue-500",
      gradient: "from-blue-500/20 to-indigo-500/20",
      timeline: "Available Now",
    },
   {
     icon: Building2,
     title: "Self-Healing Enterprises",
      description: "Enterprise systems that detect degradation patterns, predict failures before they happen, and autonomously route around bottlenecks.",
     industry: "Enterprise",
     color: "text-amber-500",
     gradient: "from-amber-500/20 to-orange-500/20",
     timeline: "In Development",
   },
    {
      icon: Shield,
      title: "Autonomous Security Teams",
      description: "Defense systems that study attack patterns, dream counter-strategies during low-load windows, and adapt defenses in real-time.",
      industry: "Cybersecurity",
      color: "text-red-500",
      gradient: "from-red-500/20 to-rose-500/20",
      timeline: "In Development",
    },
   {
     icon: Stethoscope,
     title: "Diagnostic AI With History",
      description: "Medical AI that builds patient timelines, correlates symptoms across decades, and dreams pattern connections during off-hours.",
     industry: "Healthcare",
     color: "text-rose-500",
     gradient: "from-rose-500/20 to-pink-500/20",
     timeline: "Future Vision",
   },
   {
     icon: Plane,
     title: "Mid-Flight Self-Repair",
      description: "Avionics that dream failure scenarios, pre-compute recovery paths, and self-heal anomalies before they cascade to critical systems.",
     industry: "Aviation",
     color: "text-red-500",
     gradient: "from-red-500/20 to-orange-500/20",
     timeline: "Future Vision",
   },
    {
      icon: Brain,
      title: "Financial Predictors",
      description: "Trading systems that dream market scenarios, remember black swan events, and adapt strategies based on decades of pattern recognition.",
      industry: "Finance",
      color: "text-emerald-500",
      gradient: "from-emerald-500/20 to-green-500/20",
      timeline: "Future Vision",
    },
 ];
 
 export function UseCaseShowcase() {
   return (
     <section className="relative z-10 px-4 py-12 sm:py-16">
       <div className="max-w-7xl mx-auto">
         <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="text-center mb-8 sm:mb-12"
         >
           <Badge variant="outline" className="mb-3">What You Can Build</Badge>
           <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
             From{" "}
             <span className="bg-gradient-to-r from-primary via-violet-500 to-purple-600 bg-clip-text text-transparent">
               Today
             </span>
             {" "}To{" "}
             <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
               Tomorrow
             </span>
           </h2>
           <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Production-ready applications built on CMPSBL v5.5.0 today, and the transformative possibilities on the horizon.
           </p>
         </motion.div>
         
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
           {useCases.map((useCase, idx) => (
             <motion.div
               key={useCase.title}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true, margin: "-50px" }}
               transition={{ delay: idx * 0.08 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="h-full"
             >
               <Link
                 to="/use-cases"
                 className={cn(
                   "group block h-full p-5 sm:p-6 rounded-xl border border-border/50",
                   "bg-card/50 backdrop-blur-sm hover:bg-card/80",
                   "hover:border-current/30 hover:shadow-lg transition-all duration-300",
                    "relative overflow-hidden",
                   useCase.color
                 )}
               >
                  {/* Hover gradient overlay */}
                  <div
                    className={cn(
                      "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none",
                      "bg-gradient-to-br",
                      useCase.gradient
                    )}
                  />
                  
                  <div className="relative z-10">
                 {/* Icon + Timeline */}
                 <div className="flex items-start justify-between mb-4">
                   <div
                     className={cn(
                       "w-12 h-12 rounded-xl flex items-center justify-center",
                       "bg-current/10 group-hover:bg-current/20 group-hover:scale-110 transition-all"
                     )}
                   >
                     <useCase.icon className="w-6 h-6" />
                   </div>
                   <Badge
                     variant="outline"
                     className={cn(
                       "text-[10px] border-current/30",
                       useCase.timeline === "Available Now"
                         ? "bg-current/10 text-current"
                         : "bg-muted/30"
                     )}
                   >
                     {useCase.timeline}
                   </Badge>
                 </div>
                 
                 {/* Content */}
                 <h3 className="font-bold text-base text-foreground mb-2 group-hover:text-current transition-colors">
                   {useCase.title}
                 </h3>
                 <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-3">
                   {useCase.description}
                 </p>
                 
                 {/* Industry tag */}
                 <div className="flex items-center justify-between">
                   <span className="text-[10px] uppercase tracking-wider text-current/60 font-medium">
                     {useCase.industry}
                   </span>
                   <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                 </div>
                  </div>
               </Link>
             </motion.div>
           ))}
         </div>
       </div>
     </section>
   );
 }