import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Loader2, Save, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationPrefs {
  email: string;
  scan_complete: boolean;
  critical_issues: boolean;
  weekly_summary: boolean;
  auto_fix_applied: boolean;
}

export default function ClarityNotificationSettings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    email: '',
    scan_complete: true,
    critical_issues: true,
    weekly_summary: true,
    auto_fix_applied: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('pf_clarity_notifications')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setPrefs({
          email: data.email,
          scan_complete: data.scan_complete,
          critical_issues: data.critical_issues,
          weekly_summary: data.weekly_summary,
          auto_fix_applied: data.auto_fix_applied,
        });
      } else {
        // Initialize with user email
        setPrefs({ ...prefs, email: user.email || '' });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('pf_clarity_notifications')
        .upsert({
          user_id: user.id,
          ...prefs,
        });

      if (error) throw error;

      toast({
        title: 'Preferences saved',
        description: 'Your notification settings have been updated',
      });
    } catch (error: any) {
      toast({
        title: 'Error saving preferences',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Button variant="ghost" onClick={() => navigate('/clarity/dashboard')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Bell className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-4xl font-bold">Notification Settings</h1>
            <p className="text-muted-foreground">Manage how you receive updates from Clarity</p>
          </div>
        </div>

        <Card className="p-6 space-y-6">
          <div>
            <Label htmlFor="email" className="text-base font-semibold mb-4 block">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={prefs.email}
              onChange={(e) => setPrefs({ ...prefs, email: e.target.value })}
              placeholder="your@email.com"
            />
            <p className="text-sm text-muted-foreground mt-2">
              All notifications will be sent to this email address
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Email Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="scan-complete" className="font-medium">
                    Scan Complete
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when accessibility scans finish
                  </p>
                </div>
                <Switch
                  id="scan-complete"
                  checked={prefs.scan_complete}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, scan_complete: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="critical-issues" className="font-medium">
                    Critical Issues
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts when critical accessibility issues are detected
                  </p>
                </div>
                <Switch
                  id="critical-issues"
                  checked={prefs.critical_issues}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, critical_issues: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="auto-fix" className="font-medium">
                    Auto-Fix Applied
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when AI automatically fixes issues
                  </p>
                </div>
                <Switch
                  id="auto-fix"
                  checked={prefs.auto_fix_applied}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, auto_fix_applied: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="weekly-summary" className="font-medium">
                    Weekly Summary
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a weekly summary of your accessibility metrics
                  </p>
                </div>
                <Switch
                  id="weekly-summary"
                  checked={prefs.weekly_summary}
                  onCheckedChange={(checked) => setPrefs({ ...prefs, weekly_summary: checked })}
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6 flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate('/clarity/dashboard')}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !prefs.email}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
