import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, Accessibility, ArrowRight, CheckCircle } from 'lucide-react';

export default function ClaritySubscription() {
  const navigate = useNavigate();

  const openClarity = () => {
    window.open("https://clarity.promptfluid.com", "_blank");
  };

  // Redirect to Clarity after a brief delay showing the message
  useEffect(() => {
    const timer = setTimeout(() => {
      window.open("https://clarity.promptfluid.com", "_blank");
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="p-8 md:p-12 bg-gradient-to-br from-primary/10 via-primary-variant/5 to-accent/10 border-primary/20 text-center">
          <Heart className="w-16 h-16 text-red-500 mx-auto mb-6" />
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Accessibility is Now Free For All
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            We believe accessibility should never be locked behind a paywall. 
            All accessibility scanning and AI-powered fixes are now 100% free, forever.
          </p>

          <div className="space-y-3 mb-8 text-left max-w-md mx-auto">
            {[
              'Unlimited WCAG 2.2 scans',
              'AI-powered auto-fix',
              'No signup required',
              'No credit card needed',
              'Free forever'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          <Button size="lg" onClick={openClarity} className="shadow-glow hover:shadow-glow-lg">
            <Accessibility className="w-5 h-5 mr-2" />
            Go to Free Scanner
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          
          <p className="text-sm text-muted-foreground mt-6">
            Redirecting to clarity.promptfluid.com...
          </p>

          <div className="mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground">
              "Accessibility is not a feature. It's a fundamental right."
              <br />
              — Kenneth Sweet, Founder
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
