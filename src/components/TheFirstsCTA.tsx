import { useNavigate } from "react-router-dom";
import { Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TheFirstsCTA() {
  const navigate = useNavigate();

  return (
    <section className="relative z-10 container mx-auto px-4 py-20">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
          <Layers className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Category-Defining Technology</span>
        </div>
        
        <h2 className="text-4xl md:text-5xl font-bold mb-6">
          <span className="text-foreground">
            The First AI Orchestration Substrate
          </span>
        </h2>
        
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Memory. Learning. Defense. Routing. Observability. All as infrastructure. 
          Not a wrapper—a foundational layer.
        </p>
        
        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            size="lg"
            onClick={() => navigate('/substrate')}
            className="group text-lg px-8 py-6"
          >
            <span className="relative z-10">Explore the Substrate</span>
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => navigate('/investors')}
            className="text-lg px-8 py-6"
          >
            Acquisition Inquiry
          </Button>
        </div>
      </div>
    </section>
  );
}
