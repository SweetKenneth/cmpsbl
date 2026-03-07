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
        
        // Navigate on successful sign-in — respect stored redirect or ?redirect param, fallback to /os
        // IMPORTANT: Don't redirect if this is a token refresh (user already on an authenticated page)
        if (_event === 'SIGNED_IN' && session) {
          const currentPath = window.location.pathname;
          const isAlreadyAuthenticated = currentPath.startsWith('/os') || currentPath.startsWith('/admin') || currentPath.startsWith('/evolution');
          if (isAlreadyAuthenticated) return; // Don't redirect — user is already where they need to be

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
      
      if (error) throw error;
      
      toast.success('Check your email for a secure sign-in link.', {
        description: 'No password needed — click the link to authenticate.',
        duration: 6000,
      });
    } catch (error: any) {
      console.error('Magic link error:', error);
      toast.error(error.message || 'Failed to send sign-in link');
      throw error;
    }
  };

  const signUpWithMagicLink = async (email: string, displayName?: string) => {
    try {
      const supabase = await getSupabase();
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
      
      // Send welcome email
      if (data) {
        supabase.functions.invoke('welcome-email', {
          body: { 
            email,
            name: displayName || email.split('@')[0]
          }
        }).catch(err => console.log('Welcome email error:', err));
      }
      
      toast.success('Secure link sent! Check your email.', {
        description: 'Click the link to create your account — zero passwords, ever.',
        duration: 6000,
      });
    } catch (error: any) {
      console.error('Sign up error:', error);
      toast.error(error.message || 'Failed to send sign-up link');
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
