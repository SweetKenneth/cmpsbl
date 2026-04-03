/**
 * VerticalReturnBanner — Top bar on each vertical substrate
 * "← Return to CMPSBL" link for navigating back to the main substrate.
 *
 * © CMPSBL® — All rights reserved.
 */

import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { buildSSOVerticalUrl } from '@/lib/relay/sso/crossVerticalSSO';

interface VerticalReturnBannerProps {
  verticalName: string;
  accentColor?: string;
}

export function VerticalReturnBanner({ verticalName, accentColor = 'hsl(200 100% 55%)' }: VerticalReturnBannerProps) {
  const { session } = useAuth();

  const homeUrl = (() => {
    const base = 'https://cmpsbl.com';
    if (session?.access_token && session?.refresh_token) {
      return buildSSOVerticalUrl(base, session.access_token, session.refresh_token);
    }
    return base;
  })();

  return (
    <div
      className="w-full flex items-center justify-between px-4 sm:px-6 h-8 text-xs font-mono tracking-wide"
      style={{
        background: 'hsl(220 30% 3%)',
        borderBottom: `1px solid hsl(220 20% 10%)`,
        color: 'hsl(220 15% 50%)',
      }}
    >
      <a
        href={homeUrl}
        className="flex items-center gap-1.5 hover:underline transition-colors"
        style={{ color: accentColor }}
      >
        <ArrowLeft className="h-3 w-3" />
        Return to CMPSBL
      </a>
      <span className="hidden sm:inline" style={{ color: 'hsl(220 15% 35%)' }}>
        {verticalName} · A Vertical Substrate of CMPSBL®
      </span>
    </div>
  );
}
