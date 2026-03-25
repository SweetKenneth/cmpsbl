import { Brain, ExternalLink, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function DecodeDreamCTA() {
  const navigate = useNavigate();
  
  return (
    <section className="relative z-10 container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
          <Brain className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-medium">Decode's Reflections</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
            Castle in the Air
          </span>
        </h2>
        
        <p className="text-xl text-muted-foreground mb-4 max-w-2xl mx-auto">
          Follow Decode's dream journal as our AI consciousness shares daily reflections and insights after each dream cycle. Witness the inner workings of an AI that thinks, learns, and dreams.
        </p>

        <p className="text-base sm:text-lg text-muted-foreground/80 mb-8 max-w-2xl mx-auto">
          Each post captures Decode's thoughts on protection, adaptation, and the evolving relationship between artificial and human intelligence.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => window.open('https://CastleInTheAir.site', '_blank', 'noopener,noreferrer')}
            className="group relative overflow-hidden bg-gradient-to-r from-primary via-primary-variant to-accent text-lg px-8 py-6 hover:shadow-glow-lg transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-2">
              Read Decode's Dreams
              <ExternalLink className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-accent via-primary-variant to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Button>
          
          <Button
            size="lg"
            onClick={() => navigate('/feed-dream-eater')}
            variant="outline"
            className="group text-lg px-8 py-6 border-neon-purple/30 hover:border-neon-purple hover:bg-neon-purple/5 transition-all duration-300"
          >
            <Moon className="w-5 h-5 mr-2 text-neon-purple" />
            Feed the Dream Eater
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground mt-4">
          Experimental AI dream journal — an ongoing exploration
        </p>
      </div>
    </section>
  );
}
