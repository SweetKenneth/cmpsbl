/**
 * FullBackupButton — Admin-only button to download a complete project backup ZIP
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { HardDrive, Loader2, Download, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function FullBackupButton() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle');

  const handleBackup = async () => {
    setStatus('loading');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('You must be logged in as an admin');
        setStatus('idle');
        return;
      }

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const url = `${supabaseUrl}/functions/v1/full-backup`;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      // Check content-type before treating as ZIP — error responses return JSON
      const contentType = res.headers.get('Content-Type') || '';
      if (!res.ok || contentType.includes('application/json')) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || `Backup failed: HTTP ${res.status}`);
      }

      const blob = await res.blob();
      if (blob.size < 100) {
        throw new Error('Backup file is too small — likely an error response');
      }
      const disposition = res.headers.get('Content-Disposition') || '';
      const filenameMatch = disposition.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `cmpsbl-full-backup-${new Date().toISOString().slice(0, 10)}.zip`;

      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(a.href);

      setStatus('done');
      toast.success('Full backup downloaded successfully');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err: any) {
      console.error('[FullBackup]', err);
      toast.error(`Backup failed: ${err.message}`);
      setStatus('idle');
    }
  };

  return (
    <Button
      onClick={handleBackup}
      disabled={status === 'loading'}
      variant="outline"
      className="gap-2"
    >
      {status === 'loading' ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating backup…
        </>
      ) : status === 'done' ? (
        <>
          <CheckCircle2 className="h-4 w-4 text-neon-green" />
          Downloaded
        </>
      ) : (
        <>
          <HardDrive className="h-4 w-4" />
          Full Backup
        </>
      )}
    </Button>
  );
}
