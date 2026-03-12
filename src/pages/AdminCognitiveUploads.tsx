/**
 * Admin Cognitive Uploads — Manage ZIP packages for each cognitive SKU
 */
import { useState, useEffect, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, CheckCircle, XCircle, Loader2, FileArchive, RefreshCw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import researchImg from "@/assets/cognitives/research.png";
import codingImg from "@/assets/cognitives/coding.png";
import analystImg from "@/assets/cognitives/analyst.png";
import opsImg from "@/assets/cognitives/ops.png";
import writerImg from "@/assets/cognitives/writer.png";
import hybridImg from "@/assets/cognitives/hybrid.png";

const SKU_META: Record<string, { label: string; image: string; price: string }> = {
  research: { label: "Research Cognitive", image: researchImg, price: "$39" },
  coding: { label: "Coding Agent", image: codingImg, price: "$39" },
  analyst: { label: "Analyst Cognitive", image: analystImg, price: "$39" },
  ops: { label: "Ops Cognitive", image: opsImg, price: "$39" },
  writer: { label: "Cognitive Writer", image: writerImg, price: "$39" },
  hybrid: { label: "Hybrid Cognitive", image: hybridImg, price: "FREE" },
};

interface SkuStatus {
  exists: boolean;
  size?: number;
  updatedAt?: string;
}

export default function AdminCognitiveUploads() {
  const [inventory, setInventory] = useState<Record<string, SkuStatus>>({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cognitives-admin-upload`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
        }
      );
      const json = await res.json();
      if (json.ok) {
        setInventory(json.inventory);
      } else {
        setError(json.error || "Failed to load inventory");
      }
    } catch (err) {
      setError("Could not reach upload service");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleUpload = async (sku: string, file: File) => {
    setUploading(sku);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append("sku", sku);
      formData.append("file", file);

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cognitives-admin-upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          },
          body: formData,
        }
      );

      const json = await res.json();
      if (json.ok) {
        toast.success(`${SKU_META[sku]?.label} ZIP uploaded successfully`);
        fetchInventory();
      } else {
        toast.error(json.error || "Upload failed");
      }
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setUploading(null);
    }
  };

  const formatBytes = (bytes?: number) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <AdminLayout>
      <Helmet>
        <title>Cognitive Uploads — Admin</title>
      </Helmet>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">Cognitive Uploads</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Upload or replace ZIP artifacts for each cognitive SKU. New uploads overwrite the previous version.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchInventory} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(SKU_META).map(([sku, meta]) => {
            const status = inventory[sku];
            const isUploading = uploading === sku;

            return (
              <Card key={sku} className="border border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-start gap-3">
                    <img
                      src={meta.image}
                      alt={meta.label}
                      className="w-12 h-12 rounded-lg object-cover border border-border/30"
                    />
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold">{meta.label}</CardTitle>
                      <CardDescription className="text-xs">
                        SKU: <code className="text-primary">{sku}</code> · {meta.price}
                      </CardDescription>
                    </div>
                    {status?.exists ? (
                      <Badge variant="outline" className="text-[hsl(var(--system-green))] border-[hsl(var(--system-green))]/30 text-xs shrink-0">
                        <CheckCircle className="w-3 h-3 mr-1" /> Live
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-destructive border-destructive/30 text-xs shrink-0">
                        <XCircle className="w-3 h-3 mr-1" /> Missing
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {status?.exists && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Size</span>
                        <span className="font-mono">{formatBytes(status.size)}</span>
                      </div>
                      {status.updatedAt && (
                        <div className="flex justify-between">
                          <span>Updated</span>
                          <span>{new Date(status.updatedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <label className="block">
                    <input
                      type="file"
                      accept=".zip"
                      className="hidden"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(sku, file);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      variant={status?.exists ? "outline" : "default"}
                      size="sm"
                      className="w-full cursor-pointer"
                      disabled={isUploading}
                      asChild
                    >
                      <span>
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Uploading...
                          </>
                        ) : status?.exists ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Replace ZIP
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Upload ZIP
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-border/30">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">
              <FileArchive className="w-4 h-4 inline mr-1" />
              Uploaded ZIPs are stored in a private bucket and served via time-limited signed URLs after Stripe payment verification.
              Uploading a new ZIP to the same SKU slot automatically replaces the previous version — the old file is destroyed.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
