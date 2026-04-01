import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import type { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Passwordless sign-in via magic link */
  signInWithMagicLink: (email: string) => Promise<void>;
  /** Passwordless sign-up via magic link */
  signUpWithMagicLink: (email: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAdmin: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lazy-load Supabase client to reduce initial bundle size
let supabasePromise: Promise<SupabaseClient> | null = null;
const getSupabase = () => {
  if (!supabasePromise) {
    supabasePromise = import('@/integrations/supabase/client').then(m => m.supabase);
  }
  return supabasePromise;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const supabaseRef = useRef<SupabaseClient | null>(null);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;
    let isMounted = true;
    
    getSupabase().then(supabase => {
      if (!isMounted) return;
      supabaseRef.current = supabase;
      
      // Check for existing session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      });

      // Set up auth state listener
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Navigate ONLY on a genuine new sign-in (not token refresh / tab-switch / reload).
        // INITIAL_SESSION and TOKEN_REFRESHED fire on reload & visibility-change — never redirect for those.
        if (_event === 'SIGNED_IN' && session) {
          const currentPath = window.location.pathname;
          // If the user is already past the auth page, don't yank them away
          if (currentPath !== '/auth' && currentPath !== '/login') return;

          const storedRedirect = sessionStorage.getItem('cmpsbl_auth_redirect');
          if (storedRedirect) sessionStorage.removeItem('cmpsbl_auth_redirect');
          const params = new URLSearchParams(window.location.search);
          const redirectTo = storedRedirect || params.get('redirect');
          const target = redirectTo || '/os';
          if (currentPath !== target) {
            navigate(target);
          }
        }
      });
      subscription = data.subscription;
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithMagicLink = async (email: string) => {
    try {
      const supabase = await getSupabase();

      // Rate limit check
      const { data: rateCheck } = await supabase.functions.invoke('pf-security-gate', {
        body: { action: 'check_rate_limit', email },
      });
      if (rateCheck?.blocked) {
        toast.error('Too many login attempts. Please try again in 15 minutes.');
        return;
      }

      // Disposable email check
      const { data: emailCheck } = await supabase.functions.invoke('pf-security-gate', {
        body: { action: 'validate_signup', email },
      });
      if (emailCheck && !emailCheck.allowed) {
        toast.error(emailCheck.reason || 'This email domain is not permitted.');
        return;
      }

      // Preserve redirect intent across magic link flow
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get('redirect');
      if (redirectTo) {
        sessionStorage.setItem('cmpsbl_auth_redirect', redirectTo);
      }
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/os`,
        },
      });
      
      if (error) {
        // Record failed attempt for rate limiting
        supabase.functions.invoke('pf-security-gate', {
          body: { action: 'record_failed_login', email },
        }).catch(() => {});
        throw error;
      }

      // Log successful auth attempt
      supabase.functions.invoke('pf-security-gate', {
        body: { action: 'log_auth_event', event_type: 'magic_link_sent', email },
      }).catch(() => {});
      
      toast.success('Check your email for a secure sign-in link.', {
        description: 'No password needed — click the link to authenticate.',
        duration: 6000,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send sign-in link';
      toast.error(message);
      throw error;
    }
  };

  const signUpWithMagicLink = async (email: string, displayName?: string) => {
    try {
      const supabase = await getSupabase();

      // Block disposable emails on signup
      const { data: emailCheck } = await supabase.functions.invoke('pf-security-gate', {
        body: { action: 'validate_signup', email },
      });
      if (emailCheck && !emailCheck.allowed) {
        toast.error(emailCheck.reason || 'This email domain is not permitted.');
        return;
      }

      const redirectUrl = `${window.location.origin}/os`;
      
      // Preserve redirect intent across magic link flow
      const params = new URLSearchParams(window.location.search);
      const pendingRedirect = params.get('redirect');
      if (pendingRedirect) {
        sessionStorage.setItem('cmpsbl_auth_redirect', pendingRedirect);
      }
      const { error, data } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });
      
      if (error) throw error;

      // Log signup event
      supabase.functions.invoke('pf-security-gate', {
        body: { action: 'log_auth_event', event_type: 'signup_initiated', email },
      }).catch(() => {});
      
      // Send welcome email
      if (data) {
        supabase.functions.invoke('welcome-email', {
          body: { 
            email,
            name: displayName || email.split('@')[0]
          }
        }).catch(() => {});
      }
      
      toast.success('Secure link sent! Check your email.', {
        description: 'Click the link to create your account — zero passwords, ever.',
        duration: 6000,
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to send sign-up link';
      toast.error(message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast.success('Signed out successfully');
      navigate('/auth');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error(error.message || 'Failed to sign out');
    }
  };

  const isAdmin = async (): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.rpc('has_role_text', {
        _user_id: user.id,
        _role: 'admin'
      });
      
      return !error && data === true;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithMagicLink, signUpWithMagicLink, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
