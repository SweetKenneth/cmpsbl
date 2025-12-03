import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/ui/StatCard";
import { DataTable } from "@/components/admin/ui/DataTable";
import { ActionButton } from "@/components/admin/ui/ActionButton";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Key, Plus, Trash2, Copy } from "lucide-react";
import { useApiKeys } from "@/hooks/admin/useApiKeys";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function ApiKeysManagement() {
  const { keys, isLoading, generateKey, revokeKey } = useApiKeys();
  const [newKeyName, setNewKeyName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleGenerate = () => {
    if (!newKeyName) return;
    generateKey.mutate(
      { name: newKeyName, permissions: { bot_control: true, view_logs: true } },
      {
        onSuccess: () => {
          setNewKeyName("");
          setDialogOpen(false);
        },
      }
    );
  };

  const stats = [
    { title: "Active Keys", value: keys.length, icon: Key },
    { title: "API Calls (24h)", value: "47.2K", icon: Key, trend: "+8%" },
  ];

  const columns = [
    { key: "name", label: "Name" },
    {
      key: "key_prefix",
      label: "Key",
      render: (val: string) => (
        <code className="text-xs bg-muted px-2 py-1 rounded">{val}••••••••</code>
      ),
    },
    {
      key: "created_at",
      label: "Created",
      render: (val: string) => new Date(val).toLocaleDateString(),
    },
    {
      key: "expires_at",
      label: "Status",
      render: (val: string | null) =>
        val && new Date(val) < new Date() ? (
          <Badge className="bg-red-500/20 text-red-500">Expired</Badge>
        ) : (
          <Badge className="bg-green-500/20 text-green-500">Active</Badge>
        ),
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">API Keys</h1>
            <p className="text-muted-foreground mt-1">Manage API access and credentials</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <ActionButton icon={Plus}>Generate Key</ActionButton>
            </DialogTrigger>
            <DialogContent aria-describedby="generate-key-description">
              <DialogHeader>
                <DialogTitle>Generate New API Key</DialogTitle>
              </DialogHeader>
              <p id="generate-key-description" className="text-sm text-muted-foreground pt-2">
                Create a new API key for programmatic access to the system.
              </p>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Key Name</Label>
                  <Input
                    placeholder="Production API Key"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                  />
                </div>
                <Button onClick={handleGenerate} className="w-full">
                  Generate Key
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {stats.map((stat, i) => (
            <StatCard key={i} {...stat} />
          ))}
        </div>

        <div className="glass-panel p-6">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : keys.length > 0 ? (
            <DataTable data={keys} columns={columns} />
          ) : (
            <EmptyState
              icon={Key}
              title="No API keys"
              description="Generate your first API key to get started"
            />
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
