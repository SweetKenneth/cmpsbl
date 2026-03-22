/**
 * MarketplaceAuthPrompt — Encourage sign up for observer access
 */

import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  User, Heart, Bell, Package, Sparkles, ArrowRight,
  Eye, Download, Star, Shield, ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface MarketplaceAuthPromptProps {
  variant?: 'banner' | 'sidebar' | 'modal';
}

export function MarketplaceAuthPrompt({ variant = 'banner' }: MarketplaceAuthPromptProps) {
  const { user } = useAuth();

  if (user) {
    return null;
  }

  const benefits = [
    { icon: Heart, label: 'Save favorites', color: 'text-neon-magenta' },
    { icon: Bell, label: 'Release alerts', color: 'text-neon-amber' },
    { icon: Package, label: 'Track purchases', color: 'text-primary' },
    { icon: Sparkles, label: 'Get recommendations', color: 'text-neon-purple' },
  ];

  if (variant === 'sidebar') {
    return (
      <Card className="bg-gradient-to-br from-primary/5 via-neon-purple/5 to-muted/50">
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Create Free Account</h3>
              <p className="text-xs text-muted-foreground">Unlock personalization</p>
            </div>
          </div>

          <div className="space-y-2">
            {benefits.map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-2 text-xs">
                <Icon className={cn("w-3.5 h-3.5", color)} />
                <span>{label}</span>
              </div>
            ))}
          </div>

          <Button asChild className="w-full" size="sm">
            <Link to="/auth">
              Sign Up Free
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto px-4 py-6"
    >
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="flex flex-col md:flex-row">
            {/* Left: Benefits */}
            <div className="flex-1 p-6 bg-gradient-to-br from-primary/5 via-neon-purple/5 to-transparent">
              <Badge className="bg-neon-purple/10 text-neon-purple border-neon-purple/30 mb-4">
                <Eye className="w-3 h-3 mr-1" />
                Observer Access
              </Badge>
              
              <h2 className="text-2xl font-bold mb-2">
                Create Your Free Observer Profile
              </h2>
              <p className="text-muted-foreground mb-6">
                Save templates, get personalized recommendations, and never miss a new release.
              </p>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Heart, title: 'Save Favorites', desc: 'Bookmark templates for later' },
                  { icon: Sparkles, title: 'Smart Recommendations', desc: 'AI-powered suggestions' },
                  { icon: Bell, title: 'Release Alerts', desc: 'Know when new templates drop' },
                  { icon: Package, title: 'Purchase History', desc: 'Access your templates anytime' },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="flex items-start gap-3 p-3 rounded-lg bg-background/50">
                    <div className="p-1.5 rounded-lg bg-primary/10">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium text-sm">{title}</div>
                      <div className="text-xs text-muted-foreground">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: CTA */}
            <div className="md:w-80 p-6 bg-muted/30 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              
              <h3 className="font-bold text-lg mb-2">Join Free</h3>
              <p className="text-sm text-muted-foreground mb-6">
                No credit card required. Start browsing with full features.
              </p>

              <div className="space-y-3 w-full">
                <Button asChild className="w-full" size="lg">
                  <Link to="/auth">
                    Create Account
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/auth">
                    Sign In
                  </Link>
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                <Shield className="w-3 h-3" />
                Secure & Private
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
