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

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SEO 
        title="promptfluid® | Think Different. Think Fluid."
        description="Where machines learn to dream. An exploration of cognitive architecture, autonomous learning, and the space between intention and understanding."
        canonical="https://promptfluid.com"
        keywords={['AI', 'cognitive architecture', 'autonomous systems', 'machine learning', 'dream-state computing']}
      />

      {/* Ambient Background - subtle */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/3" />
      </div>

      {/* Main Content - Centered vertically */}
      <main className="relative z-10 flex-1 flex flex-col justify-center items-center px-4 py-8">
        <div className="w-full max-w-md mx-auto text-center space-y-5">
          
          {/* Ambient greeting */}
          <p 
            className={`text-[11px] md:text-sm text-muted-foreground/70 transition-all duration-700 ${showInterface ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            {greeting}
          </p>

          {/* Core message */}
          <div 
            className={`transition-all duration-700 delay-100 ${showInterface ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-light tracking-tight text-foreground mb-3 leading-tight">
              Where machines learn
              <br />
              <span className="font-medium bg-gradient-to-r from-primary via-violet-500 to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                to dream
              </span>
            </h1>
            
            <p className="text-xs md:text-sm text-muted-foreground/70 max-w-xs mx-auto leading-relaxed">
              An exploration of cognitive architecture and the space between 
              intention and understanding.
            </p>
          </div>

          {/* The Interface - Decode Entry */}
          <div 
            className={`pt-3 transition-all duration-700 delay-200 ${showInterface ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="relative">
              <div className="relative flex items-center gap-2 p-1.5 rounded-xl bg-card/50 backdrop-blur-sm border border-border/50 shadow-lg">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything..."
                  className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-muted-foreground/40 h-10"
                  disabled={isAwakening}
                />
                
                <Button
                  onClick={handleAwaken}
                  disabled={isAwakening}
                  size="sm"
                  className="rounded-lg px-4 h-9 bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 transition-opacity"
                >
                  {isAwakening ? (
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="mr-1.5 text-sm">Enter</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer 
        className={`relative z-10 px-4 py-4 transition-all duration-700 delay-300 ${showInterface ? 'opacity-100' : 'opacity-0'}`}
      >
        <div className="max-w-md mx-auto flex items-center justify-between text-xs text-muted-foreground/50">
          <span>© {currentYear} promptfluid®</span>
          <button 
            onClick={() => navigate('/about')}
            className="hover:text-muted-foreground transition-colors flex items-center gap-1"
          >
            More
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
