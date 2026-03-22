import { useState } from "react";
import { usePlugins, useInstallPlugin, useMyPlugins, useUninstallPlugin, useTogglePlugin } from "@/hooks/usePlugins";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Puzzle,
  Download,
  Star,
  Shield,
  ExternalLink,
  BookOpen,
  Search,
  Trash2,
  Settings,
  CheckCircle,
  Package,
} from "lucide-react";
import { toast } from "sonner";

const CATEGORY_OPTIONS = [
  { id: "all", label: "All" },
  { id: "brain_hook", label: "Brain Hooks" },
  { id: "defense_hook", label: "Defense Hooks" },
  { id: "nexus_hook", label: "Nexus Hooks" },
  { id: "dream_hook", label: "Dream Hooks" },
  { id: "vision_hook", label: "Vision Hooks" },
  { id: "custom", label: "Custom" },
];

export function PluginMarketplace() {
  const [activeTab, setActiveTab] = useState("browse");
  const [category, setCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: plugins, isLoading } = usePlugins(category);
  const { data: myPlugins } = useMyPlugins("demo-developer");
  const installMutation = useInstallPlugin();
  const uninstallMutation = useUninstallPlugin();
  const toggleMutation = useTogglePlugin();

  const filteredPlugins = plugins?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInstall = async (pluginId: string) => {
    try {
      await installMutation.mutateAsync({
        pluginId,
        developerId: "demo-developer",
      });
      toast.success("Plugin installed successfully");
    } catch (error) {
      toast.error("Failed to install plugin");
    }
  };

  const handleUninstall = async (installationId: string) => {
    try {
      await uninstallMutation.mutateAsync(installationId);
      toast.success("Plugin uninstalled");
    } catch (error) {
      toast.error("Failed to uninstall plugin");
    }
  };

  const handleToggle = async (installationId: string, enabled: boolean) => {
    try {
      await toggleMutation.mutateAsync({ installationId, enabled });
      toast.success(enabled ? "Plugin enabled" : "Plugin disabled");
    } catch (error) {
      toast.error("Failed to toggle plugin");
    }
  };

  const isInstalled = (pluginId: string) =>
    myPlugins?.some((p: any) => p.plugin_id === pluginId);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Puzzle className="h-4 w-4" />
              Browse
            </TabsTrigger>
            <TabsTrigger value="installed" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Installed
              {myPlugins?.length ? (
                <Badge variant="secondary" className="ml-1">
                  {myPlugins.length}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search plugins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value="browse" className="space-y-4">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORY_OPTIONS.map((cat) => (
              <Button
                key={cat.id}
                variant={category === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat.id)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Plugin Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full mt-2" />
                  </CardHeader>
                </Card>
              ))
            ) : (
              filteredPlugins?.map((plugin) => (
                <Card key={plugin.id} className="group hover:border-primary/50 transition-all">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Puzzle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                            {plugin.name}
                            {plugin.is_official && (
                              <Shield className="h-4 w-4 text-neon-blue" />
                            )}
                            {plugin.is_verified && (
                              <CheckCircle className="h-4 w-4 text-neon-green" />
                            )}
                          </CardTitle>
                          <p className="text-xs text-muted-foreground">by {plugin.author}</p>
                        </div>
                      </div>
                    </div>
                    <CardDescription className="mt-2">{plugin.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-1">
                      {plugin.hook_points?.slice(0, 3).map((hook: string) => (
                        <Badge key={hook} variant="secondary" className="text-xs">
                          {hook}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-neon-amber" />
                          {plugin.rating?.toFixed(1) || "N/A"}
                        </span>
                        <span className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {plugin.install_count || 0}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {plugin.documentation_url && (
                          <Button variant="ghost" size="icon" asChild>
                            <a href={plugin.documentation_url} target="_blank" rel="noopener">
                              <BookOpen className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleInstall(plugin.id)}
                          disabled={isInstalled(plugin.id) || installMutation.isPending}
                        >
                          {isInstalled(plugin.id) ? "Installed" : "Install"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="installed" className="space-y-4">
          {!myPlugins?.length ? (
            <Card className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No plugins installed</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Browse the marketplace to find plugins that extend your substrate.
              </p>
              <Button onClick={() => setActiveTab("browse")}>Browse Plugins</Button>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                {myPlugins.map((installation: any) => (
                  <Card key={installation.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Puzzle className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {installation.plugin?.name || "Unknown Plugin"}
                            {installation.plugin?.is_official && (
                              <Shield className="h-4 w-4 text-neon-blue" />
                            )}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            v{installation.plugin?.version || "1.0.0"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {installation.is_enabled ? "Enabled" : "Disabled"}
                          </span>
                          <Switch
                            checked={installation.is_enabled}
                            onCheckedChange={(checked) =>
                              handleToggle(installation.id, checked)
                            }
                          />
                        </div>

                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleUninstall(installation.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
