/**
 * Referral Center — Referral codes and credit tracking for paid members
 */
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Gift, Copy, Users, CheckCircle2, Clock, Sparkles, Trophy,
} from 'lucide-react';

interface ReferralCode {
  id: string;
  code: string;
  uses: number;
  max_uses: number;
  credit_days_per_referral: number;
  is_active: boolean;
  created_at: string;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CMPSBL-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export function ReferralCenter({ tier }: { tier: string }) {
  const { user } = useAuth();
  const [codes, setCodes] = useState<ReferralCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) setCodes(data as ReferralCode[]);
      setLoading(false);
    };
    load();
  }, [user]);

  const handleGenerate = async () => {
    if (!user) return;
    const code = generateCode();
    const { data, error } = await supabase
      .from('referral_codes')
      .insert({ user_id: user.id, code })
      .select()
      .single();

    if (error) {
      toast.error('Failed to generate code');
      return;
    }
    if (data) {
      setCodes(prev => [data as ReferralCode, ...prev]);
      toast.success('Referral code generated!');
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied to clipboard');
  };

  const totalReferrals = codes.reduce((sum, c) => sum + c.uses, 0);
  const totalCredits = totalReferrals * 7;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Gift className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold">Referral Credits</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Referrals', value: totalReferrals, icon: Users, color: 'text-primary' },
          { label: 'Credits Earned', value: `${totalCredits}d`, icon: Trophy, color: 'text-neon-amber' },
          { label: 'Active Codes', value: codes.filter(c => c.is_active).length, icon: Sparkles, color: 'text-neon-green' },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-border/40 bg-card/50 p-4 text-center"
          >
            <s.icon className={cn("w-4 h-4 mx-auto mb-2", s.color)} />
            <div className="text-xl font-black font-mono">{s.value}</div>
            <div className="text-[10px] text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/5 to-transparent p-5"
      >
        <h3 className="text-sm font-bold mb-3">How It Works</h3>
        <ol className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">1</span>
            Share your referral code with other developers
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">2</span>
            They sign up and subscribe using your code
          </li>
          <li className="flex items-start gap-2">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">3</span>
            You both earn <strong className="text-foreground">7 free days</strong> added to your billing cycle
          </li>
        </ol>
      </motion.div>

      {/* Generate / manage codes */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Your Codes</span>
          <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={handleGenerate}>
            <Gift className="w-3.5 h-3.5" /> Generate Code
          </Button>
        </div>

        {codes.length === 0 && !loading && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No referral codes yet. Generate one to start earning credits!
          </div>
        )}

        {codes.map((code, i) => (
          <motion.div
            key={code.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-card/50"
          >
            <div>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono font-bold text-primary">{code.code}</code>
                {!code.is_active && <Badge variant="secondary" className="text-[9px]">Inactive</Badge>}
              </div>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {code.uses}/{code.max_uses} uses
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {new Date(code.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            <Button size="sm" variant="ghost" className="h-8 gap-1 text-xs" onClick={() => handleCopy(code.code)}>
              <Copy className="w-3 h-3" /> Copy
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
