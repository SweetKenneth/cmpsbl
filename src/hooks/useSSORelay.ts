/**
 * useSSORelay — Handles inbound SSO token relay on vertical subdomains
 *
 * On mount, checks the URL fragment for an SSO relay token from the
 * home substrate. If found and valid, sets the Supabase session
 * automatically — zero user interaction required.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useEffect, useRef } from 'react';
import { extractSSOToken } from '@/lib/relay/sso/crossVerticalSSO';
import { toast } from 'sonner';

export function useSSORelay() {
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const token = extractSSOToken();
    if (!token) return;

    // Lazy-load Supabase and set the session
    import('@/integrations/supabase/client').then(async ({ supabase }) => {
      try {
        const { error } = await supabase.auth.setSession({
          access_token: token.accessToken,
          refresh_token: token.refreshToken,
        });

        if (error) {
          toast.error('Session relay failed — please sign in again');
        } else {
          toast.success('Authenticated via CMPSBL® SSO', {
            description: 'Your identity carried over from the home substrate.',
            duration: 3000,
          });
        }
      } catch {
        toast.error('SSO relay error — please sign in again');
      }
    });
  }, []);
}
