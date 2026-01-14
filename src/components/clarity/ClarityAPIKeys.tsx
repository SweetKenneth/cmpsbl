import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Key, Trash2, Plus, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ClarityAPIKeys() {
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("pf_clarity_api_keys")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApiKeys(data || []);
    } catch (error: any) {
      toast.error("Failed to load API keys");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createKey = async () => {
    if (!newKeyName.trim()) {
      toast.error("Please enter a key name");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const apiKey = `clf_${crypto.randomUUID().replace(/-/g, '')}`;
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const keyHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

      const { error } = await supabase
        .from("pf_clarity_api_keys")
        .insert({
          user_id: user.id,
          key_name: newKeyName,
          api_key_hash: keyHash,
          metadata: { key_prefix: apiKey.substring(0, 11), rate_limit: 1000 }
        });

      if (error) throw error;
      
      toast.success("API key created! Copy it now - you won't see it again.");
      
      // Show the full key temporarily
      const tempKey = { 
        id: 'temp', 
        key_name: newKeyName, 
        api_key_hash: apiKey, 
        metadata: { key_prefix: apiKey },
        temp: true,
        user_id: user.id,
        created_at: new Date().toISOString()
      };
      setApiKeys([tempKey, ...apiKeys]);
      setVisibleKeys(new Set(['temp']));
      
      setNewKeyName("");
      setTimeout(() => loadKeys(), 5000);
    } catch (error: any) {
      toast.error(error.message || "Failed to create API key");
    }
  };

  const deleteKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from("pf_clarity_api_keys")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("API key deleted");
      loadKeys();
    } catch (error: any) {
      toast.error("Failed to delete API key");
    }
  };

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API key copied to clipboard");
  };

  const toggleKeyVisibility = (id: string) => {
    const newVisible = new Set(visibleKeys);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisibleKeys(newVisible);
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <Key className="w-5 h-5" />
            API Keys
          </h3>
          <p className="text-sm text-muted-foreground">
            Create API keys to integrate Clarity scanning into your applications
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Key name (e.g., Production API)"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createKey()}
            className="flex-1"
          />
          <Button onClick={createKey} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : apiKeys.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No API keys yet. Create one to get started.
          </div>
        ) : (
          <div className="space-y-3">
            {apiKeys.map((key) => (
              <div
                key={key.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border bg-card gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-medium text-sm sm:text-base truncate">{key.key_name}</span>
                    {key.temp && (
                      <Badge variant="secondary" className="text-xs">New - Copy Now!</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto">
                    <code className="text-xs sm:text-sm font-mono bg-muted px-2 py-1 rounded whitespace-nowrap">
                      {visibleKeys.has(key.id) 
                        ? (key.metadata?.key_prefix || key.api_key_hash?.substring(0, 11))
                        : (key.metadata?.key_prefix?.substring(0, 11) || key.api_key_hash?.substring(0, 11)) + "••••••••"}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleKeyVisibility(key.id)}
                      className="flex-shrink-0"
                    >
                      {visibleKeys.has(key.id) ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Created: {new Date(key.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyKey(key.metadata?.key_prefix || key.api_key_hash)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {!key.temp && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteKey(key.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-muted/30 rounded-lg p-3 sm:p-4 text-sm">
          <p className="font-medium mb-2">API Documentation</p>
          <div className="bg-background p-2 sm:p-3 rounded text-xs overflow-x-auto">
            <code className="block whitespace-pre-wrap break-all sm:whitespace-nowrap">
              POST /functions/v1/pf-clarity-api/scan{'\n'}
              Headers: x-api-key: clf_your_key_here{'\n'}
              Body: {JSON.stringify({ site_url: "https://example.com" })}
            </code>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Full endpoint URL provided with API key issuance.
          </p>
        </div>
      </div>
    </Card>
  );
}
