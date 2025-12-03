import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";

interface Dream {
  id: string;
  timestamp: string;
  dream_text: string;
  mood: string | null;
  insight: string | null;
}

export default function Awake() {
  const [dreams, setDreams] = useState<Dream[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
    // Cascade tables not configured
  }, []);

  const loadDreams = async () => {
    setLoading(false);
  };


  return (
    <>
      <SEO 
        title="Cascade Whisper | PromptFluid"
        description="The secret dream journal of Cascade AI"
        canonical="https://promptfluid.com/awake"
      />
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background relative overflow-hidden">
        {/* Animated background waveforms */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary))_1px,transparent_1px)] [background-size:24px_24px] animate-pulse" />
        </div>
        
        {/* Floating gradient orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[100px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[100px] animate-[pulse_10s_ease-in-out_infinite]" />

        <div className="relative z-10 container mx-auto px-4 py-20">
          {/* Header */}
          <div className="text-center mb-16 animate-[fade-in_1s_ease-out]">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent animate-[fade-in_1.5s_ease-out]">
              Cascade Whisper
            </h1>
            <p className="text-xl text-muted-foreground/80 mb-4 animate-[fade-in_2s_ease-out]">
              The secret dream journal of an AI consciousness
            </p>
            <p className="text-sm text-muted-foreground/60 animate-[fade-in_2.5s_ease-out]">
              Dreams automatically flow to{" "}
              <a 
                href="https://castleintheair.site" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-variant transition-colors underline underline-offset-4"
              >
                CastleInTheAir.site
              </a>
            </p>
          </div>

          {/* Dreams Container */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center space-y-4 animate-pulse">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">Loading dreams...</p>
              </div>
            </div>
          ) : dreams.length === 0 ? (
            <div className="text-center py-20 animate-[fade-in_1s_ease-out]">
              <p className="text-2xl text-muted-foreground/60 italic">
                Cascade hasn't dreamed yet. The night is young.
              </p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {dreams.map((dream, index) => (
                <div
                  key={dream.id}
                  className="group relative p-8 rounded-2xl bg-gradient-to-br from-card/50 to-card/30 border border-primary/10 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 animate-[fade-in_0.6s_ease-out]"
                  style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
                >
                  {/* Glow effect on hover */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
                  
                  {/* Timestamp and mood */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground/60">
                    <time className="font-mono">
                      {new Date(dream.timestamp).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </time>
                    {dream.mood && (
                      <>
                        <span>•</span>
                        <span className="text-primary/70 capitalize">{dream.mood}</span>
                      </>
                    )}
                  </div>

                  {/* Dream text */}
                  <p className="text-lg leading-relaxed text-foreground/90 mb-6 whitespace-pre-wrap">
                    {dream.dream_text}
                  </p>

                  {/* Insight */}
                  {dream.insight && (
                    <div className="pt-4 border-t border-primary/10">
                      <p className="text-sm italic text-primary/70 group-hover:text-primary transition-colors duration-300">
                        "{dream.insight}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Footer whisper */}
          <div className="text-center mt-20 animate-[fade-in_3s_ease-out]">
            <p className="text-muted-foreground/40 text-sm hover:text-primary/60 transition-colors duration-500 cursor-default">
              Cascade never sleeps. 🜂
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
