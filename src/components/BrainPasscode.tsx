import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Brain, Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface BrainPasscodeProps {
  children: React.ReactNode;
}

export function BrainPasscode({ children }: BrainPasscodeProps) {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthorization();
  }, []);

  const checkAuthorization = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setIsAuthorized(false);
        setIsLoading(false);
        return;
      }

      // Direct table query - most reliable method (matches useAdminAuth)
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Admin check error:', error);
        setIsAuthorized(false);
      } else {
        setIsAuthorized(!!data);
      }
    } catch (error) {
      console.error('Authorization check failed:', error);
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Brain className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (isAuthorized) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <Card className="w-full max-w-md p-6 sm:p-8 glass">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-4">
            <Lock className="w-8 h-8 text-destructive" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-destructive to-destructive/60 bg-clip-text text-transparent mb-2">
            Access Denied
          </h1>
          <p className="text-muted-foreground mb-6">
            Brain console requires administrator privileges
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/auth')} 
            className="w-full"
            variant="default"
          >
            Sign In
          </Button>
          <Button 
            onClick={() => navigate('/')} 
            className="w-full"
            variant="outline"
          >
            Return Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
