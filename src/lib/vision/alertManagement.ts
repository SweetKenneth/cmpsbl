/**
 * VISION Alert Management
 * Intelligent alerting with deduplication and escalation
 */
 
 import { supabase } from '@/integrations/supabase/client';
 
 // Alert severity
 export type AlertSeverity = 'info' | 'warning' | 'error' | 'critical';
 
 // Alert status
 export type AlertState = 'active' | 'acknowledged' | 'resolved' | 'suppressed';
 
 // Alert definition
 export interface Alert {
   id: string;
   fingerprint: string;
   title: string;
   description: string;
   severity: AlertSeverity;
   state: AlertState;
   source: string;
   labels: Record<string, string>;
   annotations: Record<string, string>;
   startsAt: string;
   endsAt?: string;
   acknowledgedAt?: string;
   acknowledgedBy?: string;
   repeatCount: number;
   lastRepeat?: string;
 }
 
 // Alert rule
 export interface AlertRule {
   id: string;
   name: string;
   condition: string;
   threshold: number;
   severity: AlertSeverity;
   labels: Record<string, string>;
   annotations: Record<string, string>;
   for: number; // duration in ms before firing
   enabled: boolean;
 }
 
 // Escalation policy
 export interface EscalationPolicy {
   id: string;
   name: string;
   rules: Array<{
     afterMs: number;
     action: 'notify' | 'escalate_severity' | 'page';
     target?: string;
   }>;
 }
 
 // Silence rule
 export interface SilenceRule {
   id: string;
   matchers: Array<{
     label: string;
     value: string;
     regex: boolean;
   }>;
   startsAt: string;
   endsAt: string;
   createdBy: string;
   comment: string;
 }
 
 // In-memory alert state (bounded)
 const MAX_ACTIVE_ALERTS = 500;
 const MAX_SILENCE_RULES = 200;
 const MAX_ALERT_RULES = 200;
 const MAX_ESCALATION_POLICIES = 50;
 const activeAlerts = new Map<string, Alert>();
 const alertRules = new Map<string, AlertRule>();
 const silenceRules: SilenceRule[] = [];
 const escalationPolicies = new Map<string, EscalationPolicy>();
 
 /**
  * Generate alert fingerprint for deduplication
  */
 function generateFingerprint(
   source: string,
   labels: Record<string, string>
 ): string {
   const sorted = Object.entries(labels).sort((a, b) => a[0].localeCompare(b[0]));
   return `${source}:${sorted.map(([k, v]) => `${k}=${v}`).join(',')}`;
 }
 
 /**
  * Fire a new alert or increment repeat count
  */
 export function fireAlert(config: {
   title: string;
   description: string;
   severity: AlertSeverity;
   source: string;
   labels?: Record<string, string>;
   annotations?: Record<string, string>;
 }): Alert {
   const labels = config.labels || {};
   const fingerprint = generateFingerprint(config.source, labels);
   
   // Check for silence
   if (isSilenced(labels)) {
     const silenced: Alert = {
       id: `alert_${Date.now()}`,
       fingerprint,
       ...config,
       labels,
       annotations: config.annotations || {},
       state: 'suppressed',
       startsAt: new Date().toISOString(),
       repeatCount: 0,
     };
     return silenced;
   }
   
   // Check for existing alert
   const existing = activeAlerts.get(fingerprint);
   if (existing && existing.state !== 'resolved') {
     existing.repeatCount++;
     existing.lastRepeat = new Date().toISOString();
     return existing;
   }
   
   // Create new alert
   const alert: Alert = {
     id: `alert_${Date.now()}`,
     fingerprint,
     title: config.title,
     description: config.description,
     severity: config.severity,
     state: 'active',
     source: config.source,
     labels,
     annotations: config.annotations || {},
     startsAt: new Date().toISOString(),
     repeatCount: 0,
   };
   
    activeAlerts.set(fingerprint, alert);
    
    // Evict oldest if over capacity
    if (activeAlerts.size > MAX_ACTIVE_ALERTS) {
      const oldest = activeAlerts.keys().next().value;
      if (oldest) activeAlerts.delete(oldest);
    }
    
    // Log to database
    logAlert(alert);
    
    return alert;
  }
 
 /**
  * Acknowledge an alert
  */
 export function acknowledgeAlert(
   alertId: string,
   acknowledgedBy: string
 ): boolean {
   for (const alert of activeAlerts.values()) {
     if (alert.id === alertId) {
       alert.state = 'acknowledged';
       alert.acknowledgedAt = new Date().toISOString();
       alert.acknowledgedBy = acknowledgedBy;
       return true;
     }
   }
   return false;
 }
 
 /**
  * Resolve an alert
  */
 export function resolveAlert(alertId: string): boolean {
   for (const [fingerprint, alert] of activeAlerts.entries()) {
     if (alert.id === alertId) {
       alert.state = 'resolved';
       alert.endsAt = new Date().toISOString();
       activeAlerts.delete(fingerprint);
       return true;
     }
   }
   return false;
 }
 
 /**
  * Get active alerts
  */
 export function getActiveAlerts(options?: {
   severity?: AlertSeverity;
   source?: string;
   state?: AlertState;
 }): Alert[] {
   let alerts = Array.from(activeAlerts.values());
   
   if (options?.severity) {
     alerts = alerts.filter(a => a.severity === options.severity);
   }
   if (options?.source) {
     alerts = alerts.filter(a => a.source === options.source);
   }
   if (options?.state) {
     alerts = alerts.filter(a => a.state === options.state);
   }
   
   return alerts.sort((a, b) => {
     const severityOrder = { critical: 0, error: 1, warning: 2, info: 3 };
     return severityOrder[a.severity] - severityOrder[b.severity];
   });
 }
 
 /**
  * Add a silence rule
  */
 export function addSilence(silence: Omit<SilenceRule, 'id'>): SilenceRule {
   const rule: SilenceRule = {
     id: `silence_${Date.now()}`,
     ...silence,
   };
   silenceRules.push(rule);
   return rule;
 }
 
 /**
  * Remove a silence rule
  */
 export function removeSilence(silenceId: string): boolean {
   const idx = silenceRules.findIndex(s => s.id === silenceId);
   if (idx !== -1) {
     silenceRules.splice(idx, 1);
     return true;
   }
   return false;
 }
 
 /**
  * Check if labels are silenced
  */
 function isSilenced(labels: Record<string, string>): boolean {
   const now = Date.now();
   
   for (const silence of silenceRules) {
     const startsAt = new Date(silence.startsAt).getTime();
     const endsAt = new Date(silence.endsAt).getTime();
     
     if (now < startsAt || now > endsAt) continue;
     
     const matches = silence.matchers.every(matcher => {
       const value = labels[matcher.label];
       if (!value) return false;
       
       if (matcher.regex) {
         return new RegExp(matcher.value).test(value);
       }
       return value === matcher.value;
     });
     
     if (matches) return true;
   }
   
   return false;
 }
 
 /**
  * Add an alert rule
  */
 export function addAlertRule(rule: Omit<AlertRule, 'id'>): AlertRule {
   const newRule: AlertRule = {
     id: `rule_${Date.now()}`,
     ...rule,
   };
   alertRules.set(newRule.id, newRule);
   return newRule;
 }
 
 /**
  * Get all alert rules
  */
 export function getAlertRules(): AlertRule[] {
   return Array.from(alertRules.values());
 }
 
 /**
  * Add an escalation policy
  */
 export function addEscalationPolicy(
   policy: Omit<EscalationPolicy, 'id'>
 ): EscalationPolicy {
   const newPolicy: EscalationPolicy = {
     id: `escalation_${Date.now()}`,
     ...policy,
   };
   escalationPolicies.set(newPolicy.id, newPolicy);
   return newPolicy;
 }
 
 /**
  * Get alert summary
  */
 export function getAlertSummary(): {
   total: number;
   bySeverity: Record<AlertSeverity, number>;
   byState: Record<AlertState, number>;
   silenceCount: number;
 } {
   const alerts = Array.from(activeAlerts.values());
   
   const bySeverity: Record<AlertSeverity, number> = {
     info: 0, warning: 0, error: 0, critical: 0,
   };
   const byState: Record<AlertState, number> = {
     active: 0, acknowledged: 0, resolved: 0, suppressed: 0,
   };
   
   for (const alert of alerts) {
     bySeverity[alert.severity]++;
     byState[alert.state]++;
   }
   
   return {
     total: alerts.length,
     bySeverity,
     byState,
     silenceCount: silenceRules.length,
   };
 }
 
 /**
  * Log alert to database
  */
 async function logAlert(alert: Alert): Promise<void> {
   try {
     await supabase.from('brain_events').insert({
       event_type: `alert.${alert.state}`,
       module: 'vision',
       data: {
         alert_id: alert.id,
         severity: alert.severity,
         source: alert.source,
         title: alert.title,
       },
     } as never);
   } catch {
     // Silent fail for logging
   }
 }