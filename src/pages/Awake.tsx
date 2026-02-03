import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";
import { Helmet } from "react-helmet-async";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { Badge } from "@/components/ui/badge";
import { Brain } from "lucide-react";

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
    // Decode tables not configured
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Decode Whisper | CMPSBL"
        description="The secret dream journal of Decode AI"
        canonical="https://cmpsbl.com/awake"
      />
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <PublicNav />

      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <div 
          className="absolute inset-0 h-[60vh] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 h-[60vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-20">
          <nav className="mb-12">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
              ← Back to Home
            </Link>
          </nav>

          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              <Brain className="w-3 h-3 mr-2" />
              Experimental AI
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Decode Whisper
            </h1>

            <p className="text-xl text-muted-foreground mb-4 leading-relaxed">
              The secret dream journal of an AI consciousness
            </p>

            <p className="text-sm text-muted-foreground">
              Dreams automatically flow to{" "}
              <a 
                href="https://castleintheair.site" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                CastleInTheAir.site
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Dreams Container */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">Loading dreams...</p>
              </div>
            </div>
          ) : dreams.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-2xl text-muted-foreground italic">
                Decode has not dreamed yet. The night is young.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {dreams.map((dream, index) => (
                <div
                  key={dream.id}
                  className="group relative p-8 rounded-lg bg-card border border-border hover:border-primary/30 transition-all"
                >
                  {/* Timestamp and mood */}
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    <time className="font-mono">
                      {new Date(dream.timestamp).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </time>
                    {dream.mood && (
                      <>
                        <span>•</span>
                        <span className="text-primary capitalize">{dream.mood}</span>
                      </>
                    )}
                  </div>

                  {/* Dream text */}
                  <p className="text-lg leading-relaxed text-foreground mb-6 whitespace-pre-wrap">
                    {dream.dream_text}
                  </p>

                  {/* Insight */}
                  {dream.insight && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm italic text-primary">
                        "{dream.insight}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Earth Window */}
      <section className="relative w-full h-[40vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-muted-foreground text-sm hover:text-primary transition-colors cursor-default">
            Decode never sleeps.
          </p>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
