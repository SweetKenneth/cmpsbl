/**
 * Developer Signup Form
 * Email-only signup for instant API key generation
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Key, Mail, Loader2, Copy, CheckCircle2, Terminal, ArrowRight, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface SignupResult {
  success: boolean;
  apiKey?: string;
  keyPrefix?: string;
  message?: string;
  quickstart?: {
    install: string;
    usage: string;
    docs: string;
  };
  terminalCommands?: string[];
  limits?: {
    requestsPerMinute: number;
    requestsPerDay: number;
    tier: string;
  };
  error?: string;
}

export function DeveloperSignupForm({ className }: { className?: string }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SignupResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('developer-signup', {
        body: { email, name }
      });

      if (error) throw error;
      setResult(data);
      
      if (data.success && data.apiKey) {
        toast.success('API key generated! Save it now - you won\'t see it again.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Signup failed';
      toast.error(message);
      setResult({ success: false, error: message });
    } finally {
      setLoading(false);
    }
  };

  const copyApiKey = () => {
    if (result?.apiKey) {
      navigator.clipboard.writeText(result.apiKey);
      setCopied(true);
      toast.success('API key copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card className={cn("border-primary/20 bg-card/50 backdrop-blur-sm", className)}>
      <CardHeader className="text-center pb-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-neon-purple/20 flex items-center justify-center mx-auto mb-4">
          <Key className="w-7 h-7 text-primary" />
        </div>
        <CardTitle className="text-xl">Get Your API Key</CardTitle>
        <p className="text-sm text-muted-foreground">
          Free tier • 1,000 requests/day • No credit card
        </p>
      </CardHeader>
      
      <CardContent>
        <AnimatePresence mode="wait">
          {!result?.success ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              <div className="space-y-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="developer@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
                <Input
                  type="text"
                  placeholder="Your name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate API Key
                  </>
                )}
              </Button>
              
              <p className="text-[10px] text-center text-muted-foreground">
                By signing up, you agree to our Terms of Service
              </p>
            </motion.form>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              {result.apiKey ? (
                <>
                  <div className="bg-neon-green/5 border border-neon-green/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className="bg-neon-green/10 text-neon-green border-neon-green/20">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Generated
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">Save this now!</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="flex-1 px-3 py-2 bg-background rounded text-xs font-mono break-all">
                        {result.apiKey}
                      </code>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={copyApiKey}
                        className="shrink-0"
                      >
                        {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {result.quickstart && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium">Quick Start:</p>
                      <pre className="bg-muted/50 p-3 rounded-lg text-xs overflow-x-auto">
                        <code>{result.quickstart.install}</code>
                      </pre>
                    </div>
                  )}

                  {result.terminalCommands && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <Terminal className="w-4 h-4" />
                        Terminal Commands:
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg space-y-1">
                        {result.terminalCommands.map((cmd, i) => (
                          <code key={i} className="block text-xs text-muted-foreground font-mono">
                            {cmd}
                          </code>
                        ))}
                      </div>
                    </div>
                  )}

                  <Button variant="outline" className="w-full" asChild>
                    <a href="/docs/persistent-memory">
                      View Full Documentation
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </a>
                  </Button>
                </>
              ) : (
                <div className="text-center text-sm text-muted-foreground">
                  {result.message || 'Check your email for your existing API key.'}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
