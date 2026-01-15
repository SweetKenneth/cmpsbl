/**
 * promptfluid® — The Gateway
 * v2026.01 — Where cognitive infrastructure begins
 */

import { useState, useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { decode } from "@/lib/substrate";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

export default function Index() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isAwakening, setIsAwakening] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [showInterface, setShowInterface] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ambient greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("The morning reveals new patterns.");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Clarity emerges.");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("Shadows lengthen. Insights deepen.");
    } else {
      setGreeting("In darkness, we dream forward.");
    }
  }, []);

  // Reveal interface immediately for better LCP
  useEffect(() => {
    const timer = setTimeout(() => setShowInterface(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleAwaken = async () => {
    if (!input.trim()) {
      navigate('/decode');
      return;
    }

    setIsAwakening(true);

    try {
      const response = await decode.chat(input, `visitor_${Date.now()}`);
      if (response.success) {
        sessionStorage.setItem('decode_initial_message', input);
        sessionStorage.setItem('decode_initial_response', JSON.stringify(response.data));
      }
    } catch (e) {
      // Continue anyway
    }
    navigate('/decode');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAwaken();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="promptfluid® | Think Different. Think Fluid."
        description="Where machines learn to dream. An exploration of cognitive architecture, autonomous learning, and the space between intention and understanding."
        canonical="https://promptfluid.com"
        keywords={['AI', 'cognitive architecture', 'autonomous systems', 'machine learning', 'dream-state computing']}
      />

      {/* Shared Navigation */}
      <PublicNav />

      {/* Ambient Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
        <div className="absolute top-1/4 left-1/4 w-48 md:w-96 h-48 md:h-96 rounded-full bg-primary/8 dark:bg-primary/15 blur-[80px] md:blur-[120px] animate-float" />
        <div 
          className="absolute bottom-1/4 right-1/4 w-40 md:w-80 h-40 md:h-80 rounded-full bg-violet-500/8 dark:bg-violet-500/12 blur-[60px] md:blur-[100px] animate-float" 
          style={{ animationDelay: '2s', animationDuration: '8s' }} 
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 md:px-6 py-8 md:py-20 min-h-0">
        <div className="max-w-2xl w-full text-center">
          
          {/* Ambient greeting */}
          <p 
            className={`text-xs md:text-sm text-muted-foreground mb-2 md:mb-6 transition-all duration-500 ${showInterface ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {greeting}
          </p>

          {/* Core message */}
          <div 
            className={`mb-4 md:mb-8 transition-all duration-500 ${showInterface ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-2 md:mb-4 leading-[1.1]">
              Where machines learn
              <br />
              <span className="font-medium bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                to dream
              </span>
            </h1>
            
            <p className="text-xs md:text-base text-muted-foreground/80 max-w-xs md:max-w-md mx-auto leading-relaxed">
              An exploration of cognitive architecture and the space between 
              intention and understanding.
            </p>
          </div>

          {/* The Interface - Decode Entry */}
          <div 
            className={`transition-all duration-500 delay-100 ${showInterface ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="relative max-w-md mx-auto">
              <div className="relative flex items-center gap-2 p-1.5 md:p-2 rounded-xl md:rounded-2xl bg-card/40 backdrop-blur-xl border border-border/50 shadow-xl md:shadow-2xl">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything..."
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm md:text-base placeholder:text-muted-foreground/50 h-9 md:h-11"
                  disabled={isAwakening}
                />
                
                <Button
                  onClick={handleAwaken}
                  disabled={isAwakening}
                  size="sm"
                  className="rounded-lg md:rounded-xl px-3 md:px-4 h-8 md:h-10 bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 transition-opacity"
                >
                  {isAwakening ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="mr-1 text-xs md:text-sm">Enter</span>
                      <ArrowRight className="w-3 h-3 md:w-4 md:h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Shared Footer */}
      <EnhancedFooter />
    </div>
  );
}
