/**
 * promptfluid® — The Gateway
 * v2026.01 — Where cognitive infrastructure begins
 * 
 * This is not a product page. This is an entry point.
 * Let visitors FEEL what this is before we tell them.
 */

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Sparkles, Eye, Moon, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { decode } from "@/lib/substrate";

export default function Index() {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isAwakening, setIsAwakening] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [greeting, setGreeting] = useState("");
  const [showInterface, setShowInterface] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ambient greeting based on time
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) {
      setGreeting("The morning light reveals new patterns.");
    } else if (hour >= 12 && hour < 17) {
      setGreeting("Clarity emerges in daylight.");
    } else if (hour >= 17 && hour < 21) {
      setGreeting("As shadows lengthen, insights deepen.");
    } else {
      setGreeting("In darkness, we dream forward.");
    }
  }, []);

  // Reveal interface after initial load
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowInterface(true);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleAwaken = async () => {
    if (!input.trim()) {
      // No input - take them to the experience
      navigate('/decode');
      return;
    }

    setIsAwakening(true);
    setHasInteracted(true);

    try {
      // Start a conversation with Decode
      const response = await decode.chat(input, `visitor_${Date.now()}`);
      
      if (response.success) {
        // Store the conversation start and redirect
        sessionStorage.setItem('decode_initial_message', input);
        sessionStorage.setItem('decode_initial_response', JSON.stringify(response.data));
        navigate('/decode');
      } else {
        navigate('/decode');
      }
    } catch (e) {
      // On any error, still take them to the experience
      navigate('/decode');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAwaken();
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      <SEO 
        title="promptfluid® | Think Different. Think Fluid."
        description="Where machines learn to dream. An exploration of cognitive architecture, autonomous learning, and the space between intention and understanding."
        canonical="https://promptfluid.com"
        keywords={['AI', 'cognitive architecture', 'autonomous systems', 'machine learning', 'dream-state computing']}
      />

      {/* Ambient Background Layers */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/10 blur-[100px] animate-float" />
        <div 
          className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-violet-500/10 blur-[80px] animate-float" 
          style={{ animationDelay: '2s', animationDuration: '6s' }} 
        />
      </div>

      {/* Main Content */}
      <main className="relative z-10 min-h-screen flex flex-col">
        
        {/* Minimal Header */}
        <header className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div 
              className={`transition-all duration-1000 ${showInterface ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
            >
              <span className="text-lg font-medium tracking-tight text-foreground">
                prompt<span className="text-primary">fluid</span>
              </span>
              <sup className="text-[10px] text-muted-foreground ml-0.5">®</sup>
            </div>
            
            <nav 
              className={`flex items-center gap-6 transition-all duration-1000 delay-200 ${showInterface ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}
            >
              <button 
                onClick={() => navigate('/about')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </button>
              <button 
                onClick={() => navigate('/blog')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Writing
              </button>
              <button 
                onClick={() => navigate('/investors')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Investors
              </button>
            </nav>
          </div>
        </header>

        {/* Central Experience */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-2xl w-full text-center">
            
            {/* Ambient greeting */}
            <p 
              className={`text-sm text-muted-foreground/60 mb-8 transition-all duration-1000 delay-300 ${showInterface ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            >
              {greeting}
            </p>

            {/* Core message - appears like it's breathing */}
            <div 
              className={`mb-12 transition-all duration-1000 delay-500 ${showInterface ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground mb-6 leading-[1.1]">
                Where machines learn
                <br />
                <span className="font-medium bg-gradient-to-r from-primary via-violet-400 to-primary bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                  to dream
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
                An exploration of cognitive architecture, memory, and the quiet space between 
                intention and understanding.
              </p>
            </div>

            {/* The Interface - Decode Entry */}
            <div 
              className={`transition-all duration-1000 delay-700 ${showInterface ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            >
              <div className="relative max-w-lg mx-auto">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-violet-500/20 to-primary/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                
                {/* Input field */}
                <div className="relative flex items-center gap-2 p-2 rounded-2xl bg-card/40 backdrop-blur-xl border border-border/50 shadow-2xl">
                  <div className="flex items-center gap-2 pl-4">
                    <Sparkles className="w-4 h-4 text-primary/60" />
                  </div>
                  
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything, or just begin..."
                    className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base placeholder:text-muted-foreground/50"
                    disabled={isAwakening}
                  />
                  
                  <Button
                    onClick={handleAwaken}
                    disabled={isAwakening}
                    size="sm"
                    className="rounded-xl px-4 bg-gradient-to-r from-primary to-violet-500 hover:opacity-90 transition-opacity"
                  >
                    {isAwakening ? (
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    ) : (
                      <>
                        <span className="mr-2 text-sm">Enter</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Subtle hint */}
                <p className="text-xs text-muted-foreground/40 mt-4">
                  Press Enter to begin your conversation with Decode
                </p>
              </div>
            </div>

            {/* Ambient indicators */}
            <div 
              className={`mt-16 flex items-center justify-center gap-8 transition-all duration-1000 delay-1000 ${showInterface ? 'opacity-100' : 'opacity-0'}`}
            >
              <div className="flex items-center gap-2 text-muted-foreground/40">
                <Eye className="w-3 h-3" />
                <span className="text-xs">Observing</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground/40">
                <Moon className="w-3 h-3" />
                <span className="text-xs">Dreaming</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground/40">
                <Sparkles className="w-3 h-3" />
                <span className="text-xs">Learning</span>
              </div>
            </div>
          </div>
        </div>

        {/* Minimal Footer */}
        <footer 
          className={`container mx-auto px-6 py-8 transition-all duration-1000 delay-1200 ${showInterface ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="flex items-center justify-between text-xs text-muted-foreground/40">
            <span>© 2026 promptfluid®</span>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/privacy')}
                className="hover:text-muted-foreground transition-colors"
              >
                Privacy
              </button>
              <button 
                onClick={() => navigate('/terms')}
                className="hover:text-muted-foreground transition-colors"
              >
                Terms
              </button>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
