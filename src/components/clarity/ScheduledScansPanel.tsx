import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Globe, Trash2, Power, PowerOff } from "lucide-react";

interface Schedule {
  id: string;
  site_url: string;
  frequency: string;
  last_scan_at: string | null;
  next_scan_at: string;
  active: boolean;
  created_at: string;
}

export function ScheduledScansPanel() {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSite, setNewSite] = useState("");
  const [frequency, setFrequency] = useState("weekly");

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("pf-clarity-schedule", {
        body: { action: "list" }
      });

      if (error) throw error;
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error("Load schedules error:", error);
      toast({
        title: "Error",
        description: "Failed to load scheduled scans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createSchedule = async () => {
    if (!newSite) {
      toast({
        title: "Error",
        description: "Please enter a site URL",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke("pf-clarity-schedule", {
        body: {
          action: "create",
          schedule: {
            site_url: newSite,
            frequency,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scheduled scan created successfully",
      });

      setNewSite("");
      loadSchedules();
    } catch (error) {
      console.error("Create schedule error:", error);
      toast({
        title: "Error",
        description: "Failed to create scheduled scan",
        variant: "destructive",
      });
    }
  };

  const toggleSchedule = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase.functions.invoke("pf-clarity-schedule", {
        body: {
          action: "update",
          schedule: {
            id,
            active: !currentState,
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Scan schedule ${!currentState ? 'enabled' : 'disabled'}`,
      });

      loadSchedules();
    } catch (error) {
      console.error("Toggle schedule error:", error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm("Are you sure you want to delete this scheduled scan?")) return;

    try {
      const { error } = await supabase.functions.invoke("pf-clarity-schedule", {
        body: {
          action: "delete",
          schedule: { id }
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Scheduled scan deleted",
      });

      loadSchedules();
    } catch (error) {
      console.error("Delete schedule error:", error);
      toast({
        title: "Error",
        description: "Failed to delete scheduled scan",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading scheduled scans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-xl glass border border-border/50">
        <h3 className="text-lg font-semibold mb-4">Create Scheduled Scan</h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Site URL</label>
            <input
              type="url"
              value={newSite}
              onChange={(e) => setNewSite(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Frequency</label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <Button onClick={createSchedule} className="w-full">
            <Calendar className="mr-2 h-4 w-4" />
            Create Schedule
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active Schedules</h3>
        {schedules.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No scheduled scans yet</p>
        ) : (
          schedules.map((schedule) => (
            <div key={schedule.id} className="p-4 rounded-xl glass border border-border/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-primary" />
                    <span className="font-medium">{schedule.site_url}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {schedule.frequency}
                    </div>
                    <div>
                      Next: {new Date(schedule.next_scan_at).toLocaleDateString()}
                    </div>
                    {schedule.last_scan_at && (
                      <div>
                        Last: {new Date(schedule.last_scan_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleSchedule(schedule.id, schedule.active)}
                  >
                    {schedule.active ? (
                      <Power className="h-4 w-4 text-green-500" />
                    ) : (
                      <PowerOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteSchedule(schedule.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
