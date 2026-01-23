import { useState } from "react";
import { useDevTemplates, useTemplateCategories, useInstallTemplate } from "@/hooks/useDevTemplates";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Gamepad2, 
  Globe, 
  MessageSquare, 
  Bot, 
  BookOpen, 
  Wrench,
  Download,
  Star,
  Code,
  Copy,
  Check,
  Sparkles,
  Package
} from "lucide-react";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  gaming: Gamepad2,
  world_engine: Globe,
  chatbot: MessageSquare,
  agent: Bot,
  rag: BookOpen,
  utility: Wrench,
  all: Package,
};

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "bg-green-500/20 text-green-400 border-green-500/30",
  intermediate: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  advanced: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function TemplateGallery() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const { data: templates, isLoading: templatesLoading } = useDevTemplates(selectedCategory);
  const { data: categories } = useTemplateCategories();
  const installMutation = useInstallTemplate();

  const handleInstall = async (template: any) => {
    try {
      await installMutation.mutateAsync({
        slug: template.slug,
        developerId: "demo-developer",
      });
      toast.success(`${template.name} installed successfully!`);
      setSelectedTemplate(template);
    } catch (error) {
      toast.error("Failed to install template");
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex flex-wrap h-auto gap-2 bg-muted/50 p-2">
          {categories?.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id] || Package;
            return (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
                <span>{cat.name}</span>
                <Badge variant="secondary" className="ml-1 text-xs">
                  {cat.count}
                </Badge>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templatesLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))
        ) : (
          templates?.map((template) => {
            const Icon = CATEGORY_ICONS[template.category] || Package;
            return (
              <Card
                key={template.id}
                className="group hover:border-primary/50 transition-all cursor-pointer"
                onClick={() => setSelectedTemplate(template)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {template.name}
                          {template.is_featured && (
                            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant="outline"
                            className={DIFFICULTY_COLORS[template.difficulty] || ""}
                          >
                            {template.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardDescription className="mt-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-1">
                    {template.required_modules?.slice(0, 4).map((mod: string) => (
                      <Badge key={mod} variant="secondary" className="text-xs">
                        {mod}
                      </Badge>
                    ))}
                    {template.required_modules?.length > 4 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.required_modules.length - 4}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      {template.install_count || 0} installs
                    </span>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInstall(template);
                      }}
                      disabled={installMutation.isPending}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Install
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Template Detail Modal */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedTemplate && (
                <>
                  {(() => {
                    const Icon = CATEGORY_ICONS[selectedTemplate.category] || Package;
                    return <Icon className="h-6 w-6 text-primary" />;
                  })()}
                  {selectedTemplate.name}
                  {selectedTemplate.is_featured && (
                    <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                  )}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedTemplate?.description}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-4">
            {selectedTemplate && (
              <div className="space-y-6">
                {/* Metadata */}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className={DIFFICULTY_COLORS[selectedTemplate.difficulty]}>
                    {selectedTemplate.difficulty}
                  </Badge>
                  <Badge variant="secondary">{selectedTemplate.category}</Badge>
                  <Badge variant="outline">
                    <Download className="h-3 w-3 mr-1" />
                    {selectedTemplate.install_count} installs
                  </Badge>
                </div>

                {/* Required Modules */}
                <div>
                  <h4 className="font-medium mb-2">Required Modules</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.required_modules?.map((mod: string) => (
                      <Badge key={mod} variant="secondary">
                        {mod}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* SDK Code */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      Quick Start Code
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyCode(selectedTemplate.sdk_snippet || "")}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{selectedTemplate.sdk_snippet}</code>
                  </pre>
                </div>

                {/* Config Preview */}
                {selectedTemplate.default_config && (
                  <div>
                    <h4 className="font-medium mb-2">Default Configuration</h4>
                    <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{JSON.stringify(selectedTemplate.default_config, null, 2)}</code>
                    </pre>
                  </div>
                )}

                {/* Install Button */}
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleInstall(selectedTemplate)}
                  disabled={installMutation.isPending}
                >
                  <Download className="h-5 w-5 mr-2" />
                  Install Template
                </Button>
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
