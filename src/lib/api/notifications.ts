/**
 * CMPSBL® Notifications System
 * In-app and email notification management
 */

import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'security';

export interface Notification {
  id?: string;
  type: NotificationType;
  title: string;
  message: string;
  module?: string;
  action_url?: string;
  created_at?: string;
  read?: boolean;
}

/**
 * Send in-app notification
 */
export function notifyInApp(notification: Omit<Notification, 'id' | 'created_at' | 'read'>) {
  const variant = notification.type === 'error' ? 'destructive' : 'default';
  
  toast({
    title: notification.title,
    description: notification.message,
    variant,
  });
}

/**
 * Send system alert (high priority)
 */
export function sendSystemAlert(title: string, message: string, severity: 'warning' | 'critical' = 'warning') {
  notifyInApp({
    type: severity === 'critical' ? 'error' : 'warning',
    title: `🚨 ${title}`,
    message,
    module: 'system',
  });
}

/**
 * Send threat detection alert
 */
export function sendThreatAlert(threatType: string, details: string) {
  notifyInApp({
    type: 'security',
    title: '🛡️ Threat Detected',
    message: `${threatType}: ${details}`,
    module: 'defense',
  });
}

/**
 * Send SEO warning
 */
export function sendSEOWarning(issue: string, page: string) {
  notifyInApp({
    type: 'warning',
    title: '📊 SEO Issue Detected',
    message: `${issue} on ${page}`,
    module: 'seo',
  });
}

/**
 * Send success notification
 */
export function sendSuccess(title: string, message: string) {
  notifyInApp({
    type: 'success',
    title: `✅ ${title}`,
    message,
  });
}
