/**
 * Recurring Scan Scheduler — Gap #6
 * Allows users to set weekly/monthly automated re-scans
 */

import { useState } from 'react';
import { CalendarClock, Plus, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ScheduleEntry {
  id: string;
  domain: string;
  frequency: 'weekly' | 'monthly';
  dayOfWeek?: number;
  dayOfMonth?: number;
  enabled: boolean;
}

export function ScanScheduler() {
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [domain, setDomain] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [saving, setSaving] = useState(false);

  const handleAdd = () => {
    if (!domain.trim()) return;
    setSaving(true);
    const entry: ScheduleEntry = {
      id: crypto.randomUUID(),
      domain: domain.trim(),
      frequency,
      dayOfWeek: frequency === 'weekly' ? 1 : undefined,
      dayOfMonth: frequency === 'monthly' ? 1 : undefined,
      enabled: true,
    };
    // Store in localStorage for now — persist to DB when backend table exists
    const existing = JSON.parse(localStorage.getItem('cmpsbl_scan_schedules') || '[]');
    existing.push(entry);
    localStorage.setItem('cmpsbl_scan_schedules', JSON.stringify(existing));
    setSchedules(prev => [...prev, entry]);
    setDomain('');
    setSaving(false);
    toast.success(`Scheduled ${frequency} scan for ${entry.domain}`);
  };

  const handleRemove = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    const existing = JSON.parse(localStorage.getItem('cmpsbl_scan_schedules') || '[]');
    localStorage.setItem('cmpsbl_scan_schedules', JSON.stringify(existing.filter((s: ScheduleEntry) => s.id !== id)));
    toast.success('Schedule removed');
  };

  // Load on mount
  useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cmpsbl_scan_schedules') || '[]');
      setSchedules(stored);
    } catch { /* ignore */ }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <CalendarClock className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Recurring Scans</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Automate periodic scans to track score changes over time.
      </p>

      {/* Existing schedules */}
      <div className="space-y-2">
        {schedules.map(s => (
          <div key={s.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border">
            <code className="flex-1 text-xs text-foreground truncate">{s.domain}</code>
            <span className="text-xs text-muted-foreground capitalize">{s.frequency}</span>
            <Button variant="ghost" size="icon" onClick={() => handleRemove(s.id)} className="h-8 w-8">
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        ))}
        {schedules.length === 0 && (
          <p className="text-xs text-muted-foreground italic">No recurring scans configured.</p>
        )}
      </div>

      {/* Add new */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={domain}
          onChange={e => setDomain(e.target.value)}
          placeholder="example.com"
          className="flex-1 px-3 py-2 text-sm bg-muted/30 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground placeholder:text-muted-foreground"
        />
        <select
          value={frequency}
          onChange={e => setFrequency(e.target.value as 'weekly' | 'monthly')}
          className="px-3 py-2 text-sm bg-muted/30 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <Button onClick={handleAdd} disabled={saving} size="sm" className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Schedule
        </Button>
      </div>
    </div>
  );
}
