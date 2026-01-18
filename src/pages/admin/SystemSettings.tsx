import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Settings, Save, Database, Download, RotateCcw, Clock, CheckCircle2 } from "lucide-react";
import { useSystemSettings, SystemSettings as SettingsType } from "@/hooks/admin/useSystemSettings";
import { useBackups } from "@/hooks/admin/useBackups";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function SystemSettings() {
  const { settings: dbSettings, isLoading, updateSettings, toggleSetting } = useSystemSettings();
  const { backups, isLoading: backupsLoading, createManualBackup, restoreBackup } = useBackups();
  const [localSettings, setLocalSettings] = useState<SettingsType>(dbSettings);

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

        <div className="grid gap-6 lg:grid-cols-2">
          {/* General Settings */}
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
                    <p className="text-sm text-muted-foreground">Daily automated backups at midnight CST</p>
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

          {/* API Configuration */}
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

          {/* Backup Management */}
          <Card className="glass-panel p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Database className="w-5 h-5" />
                Backup Management
              </h3>
              <Button
                onClick={() => createManualBackup.mutate()}
                disabled={createManualBackup.isPending}
                size="sm"
              >
                <Download className="w-4 h-4 mr-2" />
                {createManualBackup.isPending ? "Creating..." : "Manual Backup"}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              Automated backups run daily at midnight CST to <code className="text-xs bg-muted px-1 py-0.5 rounded">/backups/daily</code>. 
              Manual backups are saved to <code className="text-xs bg-muted px-1 py-0.5 rounded">/backups/manual</code>.
            </p>

            {backupsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : backups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No backups yet. Create your first backup above.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        backup.status === 'complete' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {backup.status === 'complete' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{backup.backup_id}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{format(new Date(backup.created_at), "MMM d, yyyy HH:mm")}</span>
                          <span>•</span>
                          <span>{backup.backup_path.split('/')[0]}</span>
                          {backup.restore_point_enabled && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-xs py-0">Restore Point</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={backup.status === 'complete' ? 'default' : 'secondary'}>
                        {backup.status}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => restoreBackup.mutate(backup.backup_id)}
                        disabled={restoreBackup.isPending}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
