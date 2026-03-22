/**
 * Substrate Package Manager — Export complete sellable packages
 * Integrates with Install Wizard for full customization
 */

import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Package, Download, Upload, Loader2, 
  ShoppingBag, Briefcase, Zap, Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { InstallWizard } from './InstallWizard';
import { cn } from '@/lib/utils';

interface PackageType {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  features: string[];
  color: string;
}

const PACKAGE_TYPES: PackageType[] = [
  {
    id: 'sellable',
    name: 'Sellable Package',
    description: 'Complete substrate for resale with install wizard',
    icon: ShoppingBag,
    features: [
      'Full data export',
      '6-step install wizard',
      'Theme & branding customization',
      'Module activation options',
      'No API keys included',
    ],
    color: 'emerald',
  },
  {
    id: 'full',
    name: 'Full Backup',
    description: 'Complete backup for personal migration',
    icon: Briefcase,
    features: [
      'All data & configuration',
      'Secrets manifest included',
      'Quick restore option',
      'No wizard required',
    ],
    color: 'blue',
  },
  {
    id: 'minimal',
    name: 'Minimal Core',
    description: 'Core system without data',
    icon: Zap,
    features: [
      'Core tables only',
      'Configuration settings',
      'Fresh start option',
      'Smallest file size',
    ],
    color: 'amber',
  },
];

export function SubstratePackageManager() {
  const [selectedType, setSelectedType] = useState<string>('sellable');
  const [showWizard, setShowWizard] = useState(false);
  const [importedPackage, setImportedPackage] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create package mutation
  const createPackage = useMutation({
    mutationFn: async (exportType: string) => {
      const { data, error } = await supabase.functions.invoke('pf-substrate-package', {
        body: {
          action: 'export',
          export_type: exportType,
          include_data: true,
          include_config: true,
        }
      });
      if (error) throw error;
      if (!data?.success) {
        throw new Error(data?.error || 'Package creation failed');
      }
      return data;
    },
    onSuccess: (data) => {
      if (data?.download_url) {
        // Trigger proper download from URL
        const link = document.createElement('a');
        link.href = data.download_url;
        link.download = `substrate-${data.package_id || 'package'}.json`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        setTimeout(() => document.body.removeChild(link), 100);
        
        toast.success('Package download started', {
          description: `${data.size_mb || 0} MB — ${(data.total_records || 0).toLocaleString()} records`,
        });
      } else if (data?.package_data || data?.data) {
        // Inline data — create blob download
        const content = JSON.stringify(data.package_data || data.data || data, null, 2);
        const blob = new Blob([content], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `substrate-${data.package_id || 'backup'}-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => { document.body.removeChild(link); URL.revokeObjectURL(url); }, 100);
        
        toast.success('Package downloaded', {
          description: `${(content.length / 1024).toFixed(1)} KB — ${(data.total_records || 0).toLocaleString()} records`,
        });
      } else {
        toast.info('Package created', {
          description: 'No download data returned from the server.',
        });
      }
    },
    onError: (error) => {
      toast.error('Package creation failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  // Import package mutation
  const importPackage = useMutation({
    mutationFn: async ({ packageData, config }: { packageData: any; config: any }) => {
      const { data, error } = await supabase.functions.invoke('pf-backup-import', {
        body: {
          export_package: packageData,
          install_config: config,
          dry_run: false,
          clear_existing: false,
        }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success('Installation complete', {
        description: `Restored ${data?.total_restored?.toLocaleString()} records`,
      });
      setShowWizard(false);
      setImportedPackage(null);
    },
    onError: (error) => {
      toast.error('Installation failed', {
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const packageData = JSON.parse(content);

        if (!packageData._manifest && !packageData._meta) {
          toast.error('Invalid package', {
            description: 'Not a valid substrate package file',
          });
          return;
        }

        // Check if it has install wizard
        if (packageData._install_wizard) {
          setImportedPackage(packageData);
          setShowWizard(true);
          toast.info('Package loaded', {
            description: 'Starting installation wizard...',
          });
        } else {
          // Direct import for non-wizard packages
          if (confirm(`Import ${packageData._manifest?.total_records || packageData._meta?.total_records} records?`)) {
            importPackage.mutate({ packageData, config: {} });
          }
        }
      } catch {
        toast.error('Invalid file', {
          description: 'Could not parse package file',
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleWizardComplete = (config: any) => {
    if (importedPackage) {
      importPackage.mutate({ packageData: importedPackage, config });
    }
  };

  return (
    <>
      <Card className="border border-neon-purple/20 bg-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Package className="w-5 h-5 text-neon-purple" />
            Substrate Package Manager
          </CardTitle>
          <CardDescription>
            Export complete packages for resale or create backups for migration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Package Types */}
          <div className="grid gap-4 md:grid-cols-3">
            {PACKAGE_TYPES.map((pkg) => (
              <button
                key={pkg.id}
                onClick={() => setSelectedType(pkg.id)}
                className={cn(
                  "p-4 rounded-lg border text-left transition-all",
                  selectedType === pkg.id
                    ? `border-${pkg.color}-500/50 bg-${pkg.color}-500/10`
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    `bg-${pkg.color}-500/20`
                  )}>
                    <pkg.icon className={cn("w-5 h-5", `text-${pkg.color}-400`)} />
                  </div>
                  <div>
                    <p className="font-medium">{pkg.name}</p>
                    <p className="text-xs text-muted-foreground">{pkg.description}</p>
                  </div>
                </div>
                <ul className="space-y-1">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                      <span className={cn("w-1 h-1 rounded-full", `bg-${pkg.color}-400`)} />
                      {feature}
                    </li>
                  ))}
                </ul>
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Download className="w-4 h-4 text-neon-green" />
                Export Package
              </h3>
              <Button
                onClick={() => createPackage.mutate(selectedType)}
                disabled={createPackage.isPending}
                className="w-full gap-2 bg-neon-green/20 border border-neon-green/40 text-neon-green hover:bg-neon-green/30"
              >
                {createPackage.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Package className="w-4 h-4" />
                )}
                Create {PACKAGE_TYPES.find(p => p.id === selectedType)?.name}
              </Button>
              {selectedType === 'sellable' && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  <span>Includes 6-step installation wizard for buyers</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-3">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Upload className="w-4 h-4 text-neon-blue" />
                Import Package
              </h3>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={importPackage.isPending}
                variant="outline"
                className="w-full gap-2 border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10"
              >
                {importPackage.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                Upload Package File
              </Button>
              <p className="text-xs text-muted-foreground">
                Supports .json packages with or without install wizard
              </p>
            </div>
          </div>

          {/* Info */}
          <div className="bg-neon-purple/5 border border-neon-purple/20 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Badge className="bg-neon-purple/20 text-neon-purple border-neon-purple/40">
                NEW
              </Badge>
              <div className="text-sm">
                <p className="font-medium text-foreground mb-1">Sellable Packages</p>
                <p className="text-muted-foreground text-xs">
                  Export your complete substrate as a sellable package. Buyers get a 6-step 
                  wizard to customize branding, themes, modules, and more. API keys are 
                  configured separately for security.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Install Wizard Modal */}
      {showWizard && importedPackage && (
        <InstallWizard
          packageData={importedPackage}
          onComplete={handleWizardComplete}
          onCancel={() => {
            setShowWizard(false);
            setImportedPackage(null);
          }}
        />
      )}
    </>
  );
}
