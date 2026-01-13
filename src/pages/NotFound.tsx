import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 rounded-full bg-primary/5 blur-[80px]" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-violet-500/5 blur-[60px]" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="w-5 h-5 text-primary/60" />
          <span className="text-sm text-muted-foreground">Lost in the substrate</span>
        </div>

        <h1 className="text-6xl font-light text-foreground mb-4">404</h1>
        
        <p className="text-lg text-muted-foreground mb-8">
          This path dissolves into the void.
        </p>

        <Button
          onClick={() => navigate('/')}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to origin
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
