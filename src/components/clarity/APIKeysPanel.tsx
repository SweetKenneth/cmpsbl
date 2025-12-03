import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Key, Copy, Trash2, Eye, EyeOff, Plus } from "lucide-react";

interface APIKey {
  id: string;
  key_prefix: string;
  name: string;
  last_used_at: string | null;
  rate_limit: number;
  active: boolean;
  created_at: string;
}

export function APIKeysPanel() {
  const { toast } = useToast();
  const [keys, setKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState("");
  const [showNewKey, setShowNewKey] = useState(false);

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("pf-clarity-api-key", {
        body: { action: "list" }
      });

      if (error) throw error;
      setKeys(data.keys || []);
    } catch (error) {
      console.error("Load keys error:", error);
      toast({
        title: "Error",
        description: "Failed to load API keys",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    if (!newKeyName) {
      toast({
        title: "Error",
        description: "Please enter a name for the API key",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("pf-clarity-api-key", {
        body: {
          action: "create",
          name: newKeyName,
        }
      });

      if (error) throw error;

      setNewKey(data.api_key);
      setShowNewKey(true);
      setNewKeyName("");

      toast({
        title: "Success",
        description: "API key created successfully. Save it now - you won't see it again!",
      });

      loadKeys();
    } catch (error) {
      console.error("Create key error:", error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "API key copied to clipboard",
    });
  };

  const revokeKey = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key?")) return;

    try {
      const { error } = await supabase.functions.invoke("pf-clarity-api-key", {
        body: {
          action: "revoke",
          key_id: id,
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "API key revoked",
      });

      loadKeys();
    } catch (error) {
      console.error("Revoke key error:", error);
      toast({
        title: "Error",
        description: "Failed to revoke API key",
        variant: "destructive",
      });
    }
  };

  const deleteKey = async (id: string) => {
    if (!confirm("Are you sure you want to delete this API key?")) return;

    try {
      const { error } = await supabase.functions.invoke("pf-clarity-api-key", {
        body: {
          action: "delete",
          key_id: id,
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "API key deleted",
      });

      loadKeys();
    } catch (error) {
      console.error("Delete key error:", error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading API keys...</div>;
  }

  return (
    <div className="space-y-6">
      {showNewKey && newKey && (
        <div className="p-6 rounded-xl bg-primary/10 border-2 border-primary">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Key className="w-5 h-5" />
            Your New API Key
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Save this key now - you won't be able to see it again!
          </p>
          <div className="flex items-center gap-2 mb-4">
            <code className="flex-1 p-3 rounded-lg bg-background border border-border text-sm font-mono">
              {newKey}
            </code>
            <Button size="sm" onClick={() => copyToClipboard(newKey)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={() => { setShowNewKey(false); setNewKey(""); }}>
            I've saved my key
          </Button>
        </div>
      )}

      <div className="p-6 rounded-xl glass border border-border/50">
        <h3 className="text-lg font-semibold mb-4">Create New API Key</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="API Key Name"
            className="flex-1 px-4 py-2 rounded-lg bg-background border border-border focus:border-primary focus:outline-none"
          />
          <Button onClick={createKey}>
            <Plus className="mr-2 h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your API Keys</h3>
        {keys.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No API keys yet</p>
        ) : (
          keys.map((key) => (
            <div key={key.id} className="p-4 rounded-xl glass border border-border/50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Key className="w-4 h-4 text-primary" />
                    <span className="font-medium">{key.name}</span>
                    {!key.active && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-destructive/20 text-destructive">
                        Revoked
                      </span>
                    )}
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div>
                      Key: <code className="px-2 py-0.5 rounded bg-muted">{key.key_prefix}...</code>
                    </div>
                    <div>Rate Limit: {key.rate_limit}/hour</div>
                    {key.last_used_at && (
                      <div>Last used: {new Date(key.last_used_at).toLocaleString()}</div>
                    )}
                    <div>Created: {new Date(key.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {key.active && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => revokeKey(key.id)}
                      title="Revoke"
                    >
                      <EyeOff className="h-4 w-4 text-orange-500" />
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteKey(key.id)}
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-6 rounded-xl bg-muted/50 border border-border/50">
        <h4 className="font-semibold mb-2">API Documentation</h4>
        <p className="text-sm text-muted-foreground mb-3">
          Use your API key to integrate Clarity accessibility scanning into your applications.
        </p>
        <div className="space-y-2 text-sm">
          <div>
            <strong>Endpoint:</strong> <code className="px-2 py-0.5 rounded bg-background">{import.meta.env.VITE_SUPABASE_URL}/functions/v1/pf-clarity-api</code>
          </div>
          <div>
            <strong>Header:</strong> <code className="px-2 py-0.5 rounded bg-background">x-api-key: clf_your_key_here</code>
          </div>
        </div>
      </div>
    </div>
  );
}
