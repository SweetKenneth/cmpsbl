import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Save } from "lucide-react";
import { useSystemSettings, SystemSettings as SettingsType } from "@/hooks/admin/useSystemSettings";
import { Skeleton } from "@/components/ui/skeleton";

export default function SystemSettings() {
  const { settings: dbSettings, isLoading, updateSettings, toggleSetting } = useSystemSettings();
  const [localSettings, setLocalSettings] = useState<SettingsType>(dbSettings);

  // Sync local state with database state
  useEffect(() => {
    setLocalSettings(dbSettings);
  }, [dbSettings]);

  const handleToggle = (key: keyof SettingsType, value: boolean) => {
    setLocalSettings({ ...localSettings, [key]: value });
    toggleSetting.mutate({ key, value });
  };

  const handleInputChange = (key: keyof SettingsType, value: number) => {
    setLocalSettings({ ...localSettings, [key]: value });
  };

  const handleSave = () => {
    updateSettings.mutate(localSettings);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">System Settings</h1>
            <p className="text-muted-foreground mt-1">Configure global system parameters</p>
          </div>
          <Button 
            onClick={handleSave}
            disabled={updateSettings.isPending}
          >
            <Save className="w-4 h-4 mr-2" />
            {updateSettings.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

        <div className="grid gap-6">
          <Card className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              General Settings
            </h3>
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-6 w-11 rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Temporarily disable public access
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.maintenance_mode}
                    onCheckedChange={(val) => handleToggle("maintenance_mode", val)}
                    disabled={toggleSetting.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Debug Logging</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable verbose system logs
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.debug_logging}
                    onCheckedChange={(val) => handleToggle("debug_logging", val)}
                    disabled={toggleSetting.isPending}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto Backups</Label>
                    <p className="text-sm text-muted-foreground">Daily automated backups</p>
                  </div>
                  <Switch
                    checked={localSettings.auto_backups}
                    onCheckedChange={(val) => handleToggle("auto_backups", val)}
                    disabled={toggleSetting.isPending}
                  />
                </div>
              </div>
            )}
          </Card>

          <Card className="glass-panel p-6">
            <h3 className="text-lg font-semibold mb-4">API Configuration</h3>
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-6 w-11 rounded-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Rate Limiting</Label>
                  <Switch
                    checked={localSettings.rate_limiting}
                    onCheckedChange={(val) => handleToggle("rate_limiting", val)}
                    disabled={toggleSetting.isPending}
                  />
                </div>

                <div>
                  <Label>API Rate Limit (req/min)</Label>
                  <Input
                    type="number"
                    value={localSettings.api_rate_limit}
                    onChange={(e) => handleInputChange("api_rate_limit", parseInt(e.target.value) || 0)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Max File Size (MB)</Label>
                  <Input
                    type="number"
                    value={localSettings.max_file_size}
                    onChange={(e) => handleInputChange("max_file_size", parseInt(e.target.value) || 0)}
                    className="mt-2"
                  />
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
