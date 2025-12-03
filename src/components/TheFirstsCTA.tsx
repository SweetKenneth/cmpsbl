import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TheFirstsCTA() {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">Chronicle of Innovation</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
            See How PromptFluid Changed the Web
          </span>
        </h2>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          A cinematic chronicle of the world firsts that built our ecosystem — from AI accessibility to autonomous orchestration.
        </p>
        
        <Button
          size="lg"
          onClick={() => navigate('/pillars/promptfluid-the-firsts')}
          className="group relative overflow-hidden bg-gradient-to-r from-primary via-primary-variant to-accent text-lg px-8 py-6 hover:shadow-glow-lg transition-all duration-300"
        >
          <span className="relative z-10">Read The Firsts</span>
          <div className="absolute inset-0 bg-gradient-to-r from-accent via-primary-variant to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
        
        <p className="text-sm text-muted-foreground mt-4">
          Animations respect reduced motion preferences
        </p>
      </div>
    </section>
  );
}
