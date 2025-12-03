import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Clock, Trash2, Plus } from 'lucide-react';

export default function ClaritySchedules() {
  const [sites, setSites] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [scheduleTime, setScheduleTime] = useState('00:00');
  const [scheduleDay, setScheduleDay] = useState('0');
  const [scheduleDate, setScheduleDate] = useState('1');
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: sitesData } = await supabase
      .from('pf_clarity_sites')
      .select('*')
      .order('created_at', { ascending: false });

    setSites(sitesData || []);

    const { data: schedulesData } = await supabase
      .from('pf_clarity_scheduled_scans')
      .select('*, pf_clarity_sites(site_url)')
      .order('created_at', { ascending: false });

    setSchedules(schedulesData || []);
  };

  const createSchedule = async () => {
    if (!selectedSite) {
      toast({ title: 'Please select a site', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.functions.invoke('pf-clarity-schedule-manager', {
      body: {
        action: 'create_schedule',
        site_id: selectedSite,
        frequency,
        schedule_time: scheduleTime,
        schedule_day: frequency === 'weekly' ? parseInt(scheduleDay) : null,
        schedule_date: frequency === 'monthly' ? parseInt(scheduleDate) : null,
        notification_enabled: notificationEnabled,
      },
    });

    setLoading(false);

    if (error || !data.success) {
      toast({ title: 'Error creating schedule', description: error?.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Schedule created successfully' });
    loadData();
    setSelectedSite('');
  };

  const deleteSchedule = async (scheduleId: string) => {
    setLoading(true);
    const { error } = await supabase.functions.invoke('pf-clarity-schedule-manager', {
      body: { action: 'delete_schedule', schedule_id: scheduleId },
    });

    setLoading(false);

    if (error) {
      toast({ title: 'Error deleting schedule', description: error.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Schedule deleted' });
    loadData();
  };

  const toggleSchedule = async (scheduleId: string, isActive: boolean) => {
    const { error } = await supabase.functions.invoke('pf-clarity-schedule-manager', {
      body: { action: 'update_schedule', schedule_id: scheduleId, is_active: !isActive },
    });

    if (error) {
      toast({ title: 'Error updating schedule', description: error.message, variant: 'destructive' });
      return;
    }

    loadData();
  };

  const formatNextRun = (nextRun: string | null) => {
    if (!nextRun) return 'Not scheduled';
    return new Date(nextRun).toLocaleString();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Scheduled Scans</h1>
        <Calendar className="h-8 w-8 text-primary" />
      </div>

      {/* Create Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Site</Label>
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.site_url}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Time</Label>
            <Input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
          </div>

          {frequency === 'weekly' && (
            <div>
              <Label>Day of Week</Label>
              <Select value={scheduleDay} onValueChange={setScheduleDay}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sunday</SelectItem>
                  <SelectItem value="1">Monday</SelectItem>
                  <SelectItem value="2">Tuesday</SelectItem>
                  <SelectItem value="3">Wednesday</SelectItem>
                  <SelectItem value="4">Thursday</SelectItem>
                  <SelectItem value="5">Friday</SelectItem>
                  <SelectItem value="6">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {frequency === 'monthly' && (
            <div>
              <Label>Day of Month</Label>
              <Input
                type="number"
                min="1"
                max="31"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Switch checked={notificationEnabled} onCheckedChange={setNotificationEnabled} />
            <Label>Send notifications</Label>
          </div>

          <Button onClick={createSchedule} disabled={loading}>
            Create Schedule
          </Button>
        </CardContent>
      </Card>

      {/* Active Schedules */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Schedules</h2>
        {schedules.map((schedule) => (
          <Card key={schedule.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium">{schedule.pf_clarity_sites?.site_url}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {schedule.frequency.charAt(0).toUpperCase() + schedule.frequency.slice(1)} at{' '}
                      {schedule.schedule_time}
                    </span>
                    <span>Next run: {formatNextRun(schedule.next_run_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={schedule.is_active}
                    onCheckedChange={() => toggleSchedule(schedule.id, schedule.is_active)}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSchedule(schedule.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {schedules.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No schedules yet. Create one above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
