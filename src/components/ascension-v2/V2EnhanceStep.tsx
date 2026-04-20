/**
 * V2 Enhance Step — Optional Mana attachment + CMPSBL Layer selection
 *
 * Mode A (Now): Upload SDK-built software to merge with host code
 * Mode B (Now): Select CMPSBL Layers (Crown Jewels) to auto-wire into Layer 2
 * Mode C (Future): Browse/purchase Store add-ons (placeholder in docs)
 *
 * Skippable — user can proceed directly to Analyze.
 *
 * U.S. Patent App. No. 64/031,637 (Mana)
 * © CMPSBL® — All rights reserved.
 */

import { useState, useCallback, useRef, useMemo } from 'react';
import { Upload, SkipForward, Loader2, CheckCircle2, FileCode2, Layers, Package, Zap, Check, Lock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { analyzeUploadedFiles } from '@/components/proprietary-evolution/ingest-utils';
import { detectFunctionBoundaries, buildAttachmentPlan, serializeAttachmentPlan } from '@/lib/mana';
import { getAvailableLayers, type CmpsblLayerDefinition } from '@/lib/export/cmpsbl-layers';
import { INVENTORY_LAYERS } from '@/lib/export/layers/inventory';
import { CANONICAL_PRIMITIVES } from '@/lib/ascension-v2/canonical-primitives';
import { TIER_LAYERS, TIER_META, type LayerTier } from '@/lib/ascension-v2/tier-layers';
import { useEngineSubscription, type SubscriptionTier } from '@/hooks/useEngineSubscription';
import { useUserRole } from '@/hooks/useUserRole';
import { useLayerEntitlements } from '@/hooks/useLayerEntitlements';
import { Link } from 'react-router-dom';
import { V2SmartRecommendations } from './V2SmartRecommendations';

/**
 * Build a rank → tier lookup from the canonical TIER_LAYERS map.
 * Rank-based (not name-based) so it stays correct even when display names
 * drift between the catalog source files and the canonical tier mapping.
 */
const LAYER_RANK_TO_TIER: Record<number, LayerTier> = (() => {
  const map: Record<number, LayerTier> = {};
  (Object.keys(TIER_LAYERS) as Array<keyof typeof TIER_LAYERS>).forEach((tier) => {
    TIER_LAYERS[tier].forEach((entry) => {
      map[entry.rank] = tier as LayerTier;
    });
  });
  return map;
})();

function tierForLayer(layer: CmpsblLayerDefinition): LayerTier {
  return LAYER_RANK_TO_TIER[layer.crownJewelRank] ?? 'architect';
}

/** Numeric rank for tier comparison (higher number = more access). */
const TIER_RANK: Record<LayerTier, number> = {
  builder: 1,
  studio: 2,
  creator: 3,
  architect: 4,
  enterprise: 5,
};

/** Map subscription tier → effective LayerTier for access checks. */
function subscriptionToLayerTier(sub: SubscriptionTier): LayerTier {
  switch (sub) {
    case 'free':
    case 'starter':
    case 'builder':
      return 'builder';
    case 'studio':
      return 'studio';
    case 'creator':
    case 'pro':
      return 'creator';
    case 'architect':
      return 'architect';
    case 'enterprise':
      return 'enterprise';
    default:
      return 'builder';
  }
}

interface Props {
  onComplete: (enhanced: boolean, selectedLayerIds?: string[]) => void;
}

export function V2EnhanceStep({ onComplete }: Props) {
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [attachmentCount, setAttachmentCount] = useState(0);
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const { tier: subscriptionTier } = useEngineSubscription();
  const { isGovernor } = useUserRole();
  const { ownedLayerIds, loading: entitlementsLoading } = useLayerEntitlements();

  // Effective tier = subscription tier (Governor sees everything regardless).
  const effectiveTier = useMemo<LayerTier>(
    () => (isGovernor ? 'enterprise' : subscriptionToLayerTier(subscriptionTier)),
    [isGovernor, subscriptionTier],
  );
  const userTierRank = TIER_RANK[effectiveTier];

  // Tier-gated catalog: exclude the 25 store INVENTORY_LAYERS — those are
  // purchase-only and surface in the "Your Purchased Layers" section below.
  const inventoryLayerIds = useMemo(
    () => new Set(INVENTORY_LAYERS.map((l) => l.id)),
    [],
  );
  const availableLayers = useMemo(
    () => getAvailableLayers().filter((l) => !inventoryLayerIds.has(l.id)),
    [inventoryLayerIds],
  );

  // Inventory layers (25 store SKUs) the user has purchased — ranked by CJPI desc.
  const purchasedInventoryLayers = useMemo<CmpsblLayerDefinition[]>(
    () =>
      INVENTORY_LAYERS
        .filter((l) => ownedLayerIds.has(l.id))
        .slice()
        .sort((a, b) => b.cjpi - a.cjpi),
    [ownedLayerIds],
  );

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = Array.from(e.dataTransfer.files);
    if (dropped.length > 0) setFiles(dropped);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) setFiles(Array.from(e.target.files));
  }, []);

  const handleSkip = useCallback(() => {
    // Even when skipping Mana, pass selected layers
    const layerIds = selectedLayers.size > 0 ? [...selectedLayers] : undefined;
    onComplete(false, layerIds);
  }, [onComplete, selectedLayers]);

  const handleAttach = async () => {
    if (files.length === 0 || !user) return;
    setProcessing(true);

    try {
      const analysis = await analyzeUploadedFiles(files);

      if (analysis.ingestedFiles.length === 0) {
        toast({ title: 'No code found', description: 'Could not read source code from package.', variant: 'destructive' });
        setProcessing(false);
        return;
      }

      const combinedSource = analysis.ingestedFiles.map(f => f.content).join('\n');
      const boundaries = detectFunctionBoundaries(combinedSource);
      const activePrimitives = new Set<string>(CANONICAL_PRIMITIVES);
      const plan = buildAttachmentPlan(boundaries, activePrimitives);
      const serializedPlan = serializeAttachmentPlan(plan);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('artifact_registry').insert({
        user_id: user.id,
        name: `MANA_ENHANCE_${analysis.name}`,
        slug: `v2-mana-enhance-${analysis.name.toLowerCase()}-${Date.now().toString(36)}`,
        tier: 'enhancement',
        category: 'proprietary-mana-attachment-v2',
        description: `SDK-built enhancement: ${analysis.language} — ${analysis.fileCount} files, ${boundaries.length} attachment points`,
        metadata: {
          attachment_type: 'sdk-built',
          language: analysis.language,
          file_count: analysis.fileCount,
          size_kb: analysis.sizeKb,
          function_boundaries: boundaries.length,
          attachment_plan: serializedPlan,
          mana_wrapped: true,
          pipeline_version: 'v2',
          attached_at: new Date().toISOString(),
          source_files: analysis.ingestedFiles.map(f => ({
            name: f.name,
            extension: f.extension,
            language: f.language,
            size_bytes: f.sizeBytes,
            char_count: f.charCount,
            content: f.content,
          })),
        },
      });

      if (error) throw new Error(error.message);

      setAttachmentCount(boundaries.length);
      setDone(true);
      toast({
        title: 'Enhancement attached',
        description: `${boundaries.length} function boundaries detected and wrapped.`,
      });
      const layerIds = selectedLayers.size > 0 ? [...selectedLayers] : undefined;
      setTimeout(() => onComplete(true, layerIds), 600);
    } catch (err) {
      toast({ title: 'Attachment failed', description: String(err), variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 sm:py-16 animate-in fade-in">
        <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
        <p className="text-foreground font-medium text-sm sm:text-base">Enhancement Attached</p>
        <p className="text-muted-foreground text-xs">
          {attachmentCount} function boundaries wrapped via Mana
          {selectedLayers.size > 0 && ` · ${selectedLayers.size} layer${selectedLayers.size > 1 ? 's' : ''} selected`}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-base sm:text-lg font-semibold text-foreground">Enhance with Mana</h2>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">
          Optionally attach SDK-built software to merge with your code before Ascension.
        </p>
      </div>

      {/* Smart Recommendations — pre-run heuristic; one-tap add to selection */}
      <V2SmartRecommendations
        coveredPrimitives={[]}
        selectedLayerIds={Array.from(selectedLayers)}
        onSelect={(layerId) => {
          setSelectedLayers((prev) => {
            const next = new Set(prev);
            if (next.has(layerId)) next.delete(layerId);
            else next.add(layerId);
            return next;
          });
        }}
        title="Suggested Layers — Start Here"
      />

      {/* SDK Upload Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-5 sm:p-8 text-center cursor-pointer transition-all',
          dragOver ? 'border-primary bg-primary/5' :
          files.length > 0 ? 'border-primary/30 bg-primary/[0.03]' :
          'border-border/30 hover:border-border/50'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} />
        {files.length > 0 ? (
          <div className="space-y-1">
            <Package className="w-7 h-7 sm:w-8 sm:h-8 mx-auto text-primary" />
            <p className="text-foreground font-medium text-xs sm:text-sm">
              {files.length} file{files.length > 1 ? 's' : ''} selected
            </p>
            <p className="text-muted-foreground text-[10px] sm:text-xs break-all">
              {files.map(f => f.name).slice(0, 3).join(', ')}
              {files.length > 3 && ` +${files.length - 3} more`}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <Layers className="w-7 h-7 sm:w-8 sm:h-8 mx-auto text-muted-foreground" />
            <p className="text-foreground text-xs sm:text-sm">Drop your SDK-built package here</p>
            <p className="text-muted-foreground text-[10px] sm:text-xs">
              Software built with @cmpsbl/sdk for function-boundary attachment
            </p>
          </div>
        )}
      </div>

      {/* ── CMPSBL Layer Selection ─────────────────────────────────────── */}
      {availableLayers.length > 0 && (
        <div className="bg-muted/20 border border-primary/20 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-foreground">Add CMPSBL Layers</span>
            <span
              className={cn(
                'text-[8px] sm:text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wide text-foreground',
                TIER_META[effectiveTier].accent,
              )}
              title={`Your tier: ${TIER_META[effectiveTier].name}`}
            >
              {TIER_META[effectiveTier].name}
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground ml-auto">Optional</span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Production-grade infrastructure injected into Layer 2. Your code stays untouched.
            Layers above your tier are locked — <Link to="/plans" className="text-primary hover:underline">upgrade</Link> to unlock.
          </p>
          <div className="space-y-1.5">
            {availableLayers.map((layer) => {
              const isSelected = selectedLayers.has(layer.id);
              const layerTier = tierForLayer(layer);
              const meta = TIER_META[layerTier];
              const isLocked = TIER_RANK[layerTier] > userTierRank;
              return (
                <button
                  key={layer.id}
                  disabled={isLocked}
                  onClick={() => {
                    if (isLocked) return;
                    setSelectedLayers(prev => {
                      const next = new Set(prev);
                      if (next.has(layer.id)) next.delete(layer.id);
                      else next.add(layer.id);
                      return next;
                    });
                  }}
                  title={isLocked
                    ? `Locked — requires ${meta.name} (${meta.priceLabel}). Click your tier to upgrade.`
                    : `${meta.name} tier — included in your plan`}
                  className={cn(
                    'w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg border transition-all text-left',
                    isLocked
                      ? 'border-border/40 bg-muted/10 opacity-50 cursor-not-allowed'
                      : isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40 hover:bg-muted/40',
                  )}
                >
                  <div className={cn(
                    'w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors',
                    isLocked
                      ? 'bg-muted/40 text-muted-foreground'
                      : isSelected
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                  )}>
                    {isLocked
                      ? <Lock className="w-3 h-3" />
                      : isSelected
                        ? <Check className="w-3 h-3" />
                        : <Zap className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className={cn(
                        'text-[10px] sm:text-xs font-medium',
                        isLocked ? 'text-muted-foreground' : 'text-foreground',
                      )}>
                        {layer.name}
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-muted-foreground font-mono">
                        CJ #{layer.crownJewelRank} · CJPI {layer.cjpi}
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                      {layer.description}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-[8px] sm:text-[9px] font-semibold flex-shrink-0 px-1.5 py-0.5 rounded border uppercase tracking-wide text-foreground',
                      meta.accent,
                    )}
                  >
                    {meta.name}
                  </span>
                </button>
              );
            })}
          </div>
          {selectedLayers.size > 0 && (
            <p className="text-[9px] sm:text-[10px] text-primary font-medium">
              ✓ {selectedLayers.size} layer{selectedLayers.size > 1 ? 's' : ''} will auto-wire into Layer 2
            </p>
          )}
        </div>
      )}

      {/* ── Your Purchased Layers (Inventory / Store) ───────────────────── */}
      {entitlementsLoading ? (
        <div className="bg-muted/10 border border-border/30 rounded-xl p-3 sm:p-4 flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
          <span className="text-[10px] sm:text-xs text-muted-foreground">Loading purchased layers…</span>
        </div>
      ) : purchasedInventoryLayers.length > 0 ? (
        <div className="bg-muted/20 border border-primary/20 rounded-xl p-3 sm:p-4 space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-foreground">Your Purchased Layers</span>
            <span className="text-[8px] sm:text-[9px] font-semibold px-1.5 py-0.5 rounded border border-primary/30 bg-primary/5 uppercase tracking-wide text-primary">
              {purchasedInventoryLayers.length} owned
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground ml-auto">Optional</span>
          </div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Store-purchased layers ready to auto-wire into Layer 2. No tier gate — these are yours.
          </p>
          <div className="space-y-1.5">
            {purchasedInventoryLayers.map((layer) => {
              const isSelected = selectedLayers.has(layer.id);
              return (
                <button
                  key={layer.id}
                  onClick={() => {
                    setSelectedLayers((prev) => {
                      const next = new Set(prev);
                      if (next.has(layer.id)) next.delete(layer.id);
                      else next.add(layer.id);
                      return next;
                    });
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg border transition-all text-left',
                    isSelected
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/40 hover:bg-muted/40',
                  )}
                >
                  <div
                    className={cn(
                      'w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors',
                      isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    {isSelected ? <Check className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] sm:text-xs font-medium text-foreground truncate">
                        {layer.name}
                      </span>
                      <span className="text-[8px] sm:text-[9px] text-muted-foreground font-mono whitespace-nowrap">
                        CJPI {layer.cjpi}
                      </span>
                    </div>
                    <p className="text-[9px] sm:text-[10px] text-muted-foreground truncate">
                      {layer.description}
                    </p>
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-semibold flex-shrink-0 px-1.5 py-0.5 rounded border border-primary/30 bg-primary/5 uppercase tracking-wide text-primary">
                    Owned
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-muted/20 border border-border/30 rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShoppingBag className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
              No purchased layers yet
            </span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-muted-foreground leading-relaxed">
            Browse the{' '}
            <Link to="/store" className="text-primary hover:underline">
              Substrate Store
            </Link>{' '}
            for 25 standalone layers (Privacy, Quantum, Robotics, Compliance and more) you can wire into any Ascension export.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-2">
        <Button
          onClick={handleAttach}
          disabled={files.length === 0 || processing || !user}
          className="w-full h-10 sm:h-11 rounded-xl text-sm"
        >
          {processing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Wrapping with Mana…</>
          ) : (
            <><Upload className="w-4 h-4 mr-2" />Attach &amp; Continue</>
          )}
        </Button>

        <Button
          variant="ghost"
          onClick={handleSkip}
          className="w-full text-muted-foreground text-xs sm:text-sm"
        >
          <SkipForward className="w-3 h-3 mr-1" />
          {selectedLayers.size > 0
            ? `Continue with ${selectedLayers.size} Layer${selectedLayers.size > 1 ? 's' : ''}`
            : 'Skip — Ascend Without Enhancements'}
        </Button>
      </div>
    </div>
  );
}
