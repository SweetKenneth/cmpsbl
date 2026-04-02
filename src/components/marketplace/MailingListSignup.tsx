/**
 * MailingListSignup — Subscribe to new template releases and featured alerts
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  Mail, Bell, Sparkles, Gift, Check, Zap, 
  Loader2, ArrowRight, Star
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MailingListSignupProps {
  variant?: 'inline' | 'card' | 'floating';
  onSuccess?: () => void;
}

export function MailingListSignup({ variant = 'card', onSuccess }: MailingListSignupProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || '');
  const [preferences, setPreferences] = useState({
    new_releases: true,
    featured: true,
    deals: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('marketplace_mailing_list')
        .upsert({
          email,
          user_id: user?.id || null,
          preferences,
          is_active: true,
        }, {
          onConflict: 'email'
        });

      if (error) throw error;

      setIsSuccess(true);
      toast.success('Successfully subscribed! You\'ll be the first to know about new templates.');
      onSuccess?.();
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "text-center p-6 rounded-xl",
          variant === 'card' && "bg-gradient-to-br from-primary/10 via-primary/5 to-muted/50 border",
          variant === 'floating' && "bg-card border shadow-xl"
        )}
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-system-green/10 border border-system-green/30 flex items-center justify-center">
          <Check className="w-8 h-8 text-system-green" />
        </div>
        <h3 className="text-lg font-bold mb-2">You're In!</h3>
        <p className="text-sm text-muted-foreground">
          We'll notify you when new templates drop.
        </p>
      </motion.div>
    );
  }

  if (variant === 'inline') {
    return (
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10"
            disabled={isSubmitting}
          />
        </div>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              Subscribe
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </Button>
      </form>
    );
  }

  return (
    <Card className={cn(
      "overflow-hidden",
      variant === 'floating' && "shadow-2xl"
    )}>
      <CardContent className="p-0">
        <div className="bg-gradient-to-br from-primary/10 via-neon-purple/10 to-neon-cyan/10 p-6 border-b">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30">
              <Bell className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Never Miss a Release</h3>
              <p className="text-sm text-muted-foreground">
                Get notified when new templates drop
              </p>
            </div>
          </div>

          {/* Benefits */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge variant="outline" className="gap-1 bg-background/50">
              <Zap className="w-3 h-3 text-neon-amber" />
              Early Access
            </Badge>
            <Badge variant="outline" className="gap-1 bg-background/50">
              <Gift className="w-3 h-3 text-neon-magenta" />
              Exclusive Deals
            </Badge>
            <Badge variant="outline" className="gap-1 bg-background/50">
              <Star className="w-3 h-3 text-neon-purple" />
              Featured Templates
            </Badge>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email Input */}
          <div className="space-y-2">
            <Label htmlFor="mailing-email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="mailing-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3">
            <Label className="text-sm text-muted-foreground">Notify me about:</Label>
            
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <Checkbox
                  checked={preferences.new_releases}
                  onCheckedChange={(checked) => 
                    setPreferences(p => ({ ...p, new_releases: !!checked }))
                  }
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">New Template Releases</div>
                  <div className="text-xs text-muted-foreground">
                    Be first to know when new templates are available
                  </div>
                </div>
                <Sparkles className="w-4 h-4 text-primary" />
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <Checkbox
                  checked={preferences.featured}
                  onCheckedChange={(checked) => 
                    setPreferences(p => ({ ...p, featured: !!checked }))
                  }
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">Featured Picks</div>
                  <div className="text-xs text-muted-foreground">
                    Handpicked templates recommended by CMPSBL
                  </div>
                </div>
                <Star className="w-4 h-4 text-neon-amber" />
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors">
                <Checkbox
                  checked={preferences.deals}
                  onCheckedChange={(checked) => 
                    setPreferences(p => ({ ...p, deals: !!checked }))
                  }
                />
                <div className="flex-1">
                  <div className="font-medium text-sm">Exclusive Deals</div>
                  <div className="text-xs text-muted-foreground">
                    Special discounts and bundle offers
                  </div>
                </div>
                <Gift className="w-4 h-4 text-neon-magenta" />
              </label>
            </div>
          </div>

          {/* Submit */}
          <Button type="submit" className="w-full gap-2" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Subscribing...
              </>
            ) : (
              <>
                <Bell className="w-4 h-4" />
                Subscribe to Updates
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Unsubscribe anytime. We respect your inbox.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
