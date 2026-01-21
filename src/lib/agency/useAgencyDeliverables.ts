/**
 * Agency Deliverables — Hook for exporting and emailing task results
 */

import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type DeliverableFormat = 'markdown' | 'html' | 'json' | 'csv';

export interface TaskDeliverable {
  id: string;
  task_id: string;
  agency_id: string;
  deliverable_type: DeliverableFormat;
  title: string;
  content: string | null;
  file_path: string | null;
  file_size_bytes: number | null;
  download_count: number;
  emailed_to: string[];
  metadata: Record<string, any>;
  expires_at: string | null;
  created_at: string;
}

export interface ExportOptions {
  taskId: string;
  format: DeliverableFormat;
  sendEmail?: boolean;
  recipientEmail?: string;
}

export function useAgencyDeliverables() {
  const [loading, setLoading] = useState(false);
  const [deliverables, setDeliverables] = useState<TaskDeliverable[]>([]);

  const fetchDeliverables = useCallback(async (agencyId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('agency_task_deliverables')
        .select('*')
        .eq('agency_id', agencyId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliverables((data || []) as TaskDeliverable[]);
      return data as TaskDeliverable[];
    } catch (err) {
      console.error('Failed to fetch deliverables:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const exportTask = useCallback(async (options: ExportOptions): Promise<{
    success: boolean;
    content?: string;
    filename?: string;
    deliverableId?: string;
  }> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-agency-export', {
        body: options,
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`Export created: ${data.filename}`);
        return {
          success: true,
          content: data.content,
          filename: data.filename,
          deliverableId: data.deliverableId,
        };
      } else {
        throw new Error(data?.error || 'Export failed');
      }
    } catch (err) {
      console.error('Failed to export task:', err);
      toast.error('Failed to export task');
      return { success: false };
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadContent = useCallback((content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Download started');
  }, []);

  const exportAndDownload = useCallback(async (taskId: string, format: DeliverableFormat) => {
    const result = await exportTask({ taskId, format });
    
    if (result.success && result.content && result.filename) {
      const mimeTypes: Record<DeliverableFormat, string> = {
        markdown: 'text/markdown',
        html: 'text/html',
        json: 'application/json',
        csv: 'text/csv',
      };
      downloadContent(result.content, result.filename, mimeTypes[format]);
    }
    
    return result;
  }, [exportTask, downloadContent]);

  const emailReport = useCallback(async (taskId: string, recipientEmail: string, format: DeliverableFormat = 'html') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-agency-export', {
        body: {
          taskId,
          format,
          sendEmail: true,
          recipientEmail,
        },
      });

      if (error) throw error;

      if (data?.success && data?.emailQueued) {
        toast.success(`Report sent to ${recipientEmail}`);
        return true;
      } else {
        throw new Error(data?.error || 'Failed to send email');
      }
    } catch (err) {
      console.error('Failed to email report:', err);
      toast.error('Failed to send report');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const requestDailyBrief = useCallback(async (agencyId: string, recipientEmail?: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pf-agency-daily-brief', {
        body: { agencyId, recipientEmail },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Daily brief sent');
        return true;
      } else {
        throw new Error(data?.error || 'Failed to generate brief');
      }
    } catch (err) {
      console.error('Failed to request daily brief:', err);
      toast.error('Failed to send daily brief');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    deliverables,
    fetchDeliverables,
    exportTask,
    exportAndDownload,
    emailReport,
    requestDailyBrief,
    downloadContent,
  };
}
