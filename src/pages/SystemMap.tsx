import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  LayoutDashboard, Brain, Shield, Zap, Accessibility, Megaphone, Key,
  Users, CreditCard, BarChart3, Eye, Search, FileText, Network, Database,
  Code, Wrench, RefreshCw, Rocket, Sparkles, Combine, TrendingUp, Upload,
  Activity, AlertTriangle, Target, LockKeyhole, Microscope, Palette, Map,
  Briefcase, Download, HeartPulse, Cpu, DollarSign, GitBranch, ScrollText,
  Settings, Package
} from "lucide-react";

interface FeatureRoute {
  name: string;
  path: string;
  description: string;
  category: string;
  icon: any;
  status: "live" | "beta" | "planned";
}

const allRoutes: FeatureRoute[] = [
  // Dashboards
  { name: "Main Dashboard", path: "/dashboard", description: "Overview of all systems", category: "Dashboards", icon: LayoutDashboard, status: "live" },
  { name: "Vision Control", path: "/vision-dashboard", description: "AI orchestration hub", category: "Dashboards", icon: Brain, status: "live" },
  { name: "Defense Shield", path: "/defense-dashboard", description: "Security monitoring", category: "Dashboards", icon: Shield, status: "live" },
  { name: "Projects", path: "/projects-dashboard", description: "Project management", category: "Dashboards", icon: Briefcase, status: "live" },
  
  // Brain Intelligence
  { name: "Nexus Brain", path: "/nexus-brain", description: "AI model routing", category: "Brain Intelligence", icon: Brain, status: "live" },
  { name: "Brain Memory", path: "/brain-memory", description: "Knowledge storage", category: "Brain Intelligence", icon: Database, status: "live" },
  { name: "Brain Reports", path: "/brain-reports", description: "Learning reports", category: "Brain Intelligence", icon: FileText, status: "live" },
  { name: "Brain Training", path: "/brain/training", description: "Upload training data", category: "Brain Intelligence", icon: Upload, status: "live" },
  { name: "Brain Learning", path: "/brain-learning", description: "Continuous learning", category: "Brain Intelligence", icon: TrendingUp, status: "live" },
  { name: "Brain Analytics", path: "/brain-analytics", description: "Intelligence metrics", category: "Brain Intelligence", icon: BarChart3, status: "live" },
  { name: "ML Models", path: "/brain-ml", description: "Machine learning", category: "Brain Intelligence", icon: Cpu, status: "live" },
  { name: "Learning Intelligence", path: "/learning-intelligence", description: "Pattern discovery", category: "Brain Intelligence", icon: TrendingUp, status: "live" },
  
  // Defense & Security
  { name: "Defense Console", path: "/defense", description: "Security command center", category: "Defense & Security", icon: Shield, status: "live" },
  { name: "Detections", path: "/detections", description: "Threat detections", category: "Defense & Security", icon: Eye, status: "live" },
  { name: "Bot Detection", path: "/bot-detection", description: "Bot traffic analysis", category: "Defense & Security", icon: Search, status: "live" },
  { name: "Behavior Analysis", path: "/behavior-analysis", description: "User behavior patterns", category: "Defense & Security", icon: Activity, status: "live" },
  { name: "Captcha", path: "/captcha", description: "Captcha management", category: "Defense & Security", icon: LockKeyhole, status: "live" },
  { name: "Device Fingerprint", path: "/device-fingerprint", description: "Device tracking", category: "Defense & Security", icon: Target, status: "live" },
  { name: "Threat Intelligence", path: "/threat-intelligence", description: "Threat analysis", category: "Defense & Security", icon: AlertTriangle, status: "live" },
  { name: "Threat Feed", path: "/threat-feed", description: "Live threat updates", category: "Defense & Security", icon: Zap, status: "live" },
  { name: "Security Rules", path: "/rules", description: "Security policies", category: "Defense & Security", icon: FileText, status: "live" },
  { name: "Red Team", path: "/red-team", description: "Security testing", category: "Defense & Security", icon: Microscope, status: "live" },
  { name: "Reflex Keys", path: "/admin/reflex-keys", description: "Admin access keys", category: "Defense & Security", icon: Key, status: "live" },
  
  // Studio & Creation
  { name: "Studio", path: "/studio", description: "App builder", category: "Studio & Creation", icon: Zap, status: "live" },
  { name: "Creative Generation", path: "/creative-generation", description: "AI content creation", category: "Studio & Creation", icon: Sparkles, status: "live" },
  { name: "Prompt Merger", path: "/prompt-merger", description: "Merge prompts", category: "Studio & Creation", icon: Combine, status: "live" },
  { name: "Marketing Studio", path: "/marketing-studio", description: "Marketing automation", category: "Studio & Creation", icon: Palette, status: "live" },
  
  // Access & Ripple
  { name: "Access Console", path: "/access-console", description: "Accessibility tools", category: "Access & Ripple", icon: Accessibility, status: "live" },
  { name: "Ripple Studio", path: "/ripple-studio", description: "Network integration", category: "Access & Ripple", icon: Megaphone, status: "live" },
  { name: "Sites Management", path: "/sites", description: "Manage sites", category: "Access & Ripple", icon: Network, status: "live" },
  { name: "SEO Intelligence", path: "/seo", description: "SEO optimization", category: "Access & Ripple", icon: TrendingUp, status: "live" },
  
  // Core Management
  { name: "Users", path: "/core/users", description: "User management", category: "Core Management", icon: Users, status: "live" },
  { name: "Subscriptions", path: "/core/subscriptions", description: "Billing management", category: "Core Management", icon: CreditCard, status: "live" },
  { name: "Usage Analytics", path: "/core/usage", description: "Usage tracking", category: "Core Management", icon: BarChart3, status: "live" },
  { name: "Customers", path: "/customers", description: "Customer data", category: "Core Management", icon: Users, status: "live" },
  { name: "Integrations", path: "/integrations", description: "API integrations", category: "Core Management", icon: GitBranch, status: "live" },
  
  // System Operations
  { name: "System Health", path: "/system-health", description: "Module monitoring", category: "System Operations", icon: HeartPulse, status: "live" },
  { name: "Health Monitor", path: "/health", description: "System health", category: "System Operations", icon: Activity, status: "live" },
  { name: "Diagnostics", path: "/diagnostics", description: "System diagnostics", category: "System Operations", icon: Microscope, status: "live" },
  { name: "Repair Tools", path: "/repair", description: "System repair", category: "System Operations", icon: Wrench, status: "live" },
  { name: "Updates", path: "/updates", description: "System updates", category: "System Operations", icon: RefreshCw, status: "live" },
  { name: "Deployment", path: "/deployment", description: "Deploy modules", category: "System Operations", icon: Rocket, status: "live" },
  { name: "APIs", path: "/apis", description: "API management", category: "System Operations", icon: Code, status: "live" },
  { name: "Logs", path: "/logs", description: "System logs", category: "System Operations", icon: ScrollText, status: "live" },
  
  // Business & Resources
  { name: "Market Portal", path: "/market-portal", description: "Marketplace", category: "Business & Resources", icon: DollarSign, status: "live" },
  { name: "Investor Packets", path: "/investor-packets", description: "Investment docs", category: "Business & Resources", icon: Briefcase, status: "live" },
  { name: "WordPress Plugin", path: "/projects/defense", description: "WP security plugin", category: "Business & Resources", icon: Download, status: "live" },
  { name: "Roadmap", path: "/roadmap", description: "Product roadmap", category: "Business & Resources", icon: Map, status: "live" },
  
  // Settings
  { name: "Settings", path: "/settings", description: "App configuration", category: "Settings", icon: Settings, status: "live" },
  { name: "System Map", path: "/system-map", description: "This page", category: "Settings", icon: Map, status: "live" },
];

export default function SystemMap() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredRoutes = allRoutes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const categories = Array.from(new Set(allRoutes.map(r => r.category)));
  
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      live: "default",
      beta: "secondary",
      planned: "outline"
    };
    const colors: Record<string, string> = {
      live: "bg-success/20 text-success border-success/30",
      beta: "bg-warning/20 text-warning border-warning/30",
      planned: "bg-muted/20 text-muted-foreground border-muted-foreground/30"
    };
    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };
  
  return (
    <div className="min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            System Feature Map
          </h1>
          <p className="text-muted-foreground">
            Complete directory of all {allRoutes.length} features and pages in PromptFluid
          </p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search features, pages, or categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allRoutes.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Live</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">
                {allRoutes.filter(r => r.status === "live").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Search Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredRoutes.length}</div>
            </CardContent>
          </Card>
        </div>
        
        {/* Features by Category */}
        {categories.map((category) => {
          const categoryRoutes = filteredRoutes.filter(r => r.category === category);
          if (categoryRoutes.length === 0) return null;
          
          return (
            <div key={category} className="space-y-4">
              <h2 className="text-2xl font-semibold flex items-center gap-2">
                {category}
                <Badge variant="secondary">{categoryRoutes.length}</Badge>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryRoutes.map((route) => (
                  <Link key={route.path} to={route.path}>
                    <Card className="h-full hover:border-primary/50 transition-all cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between mb-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <route.icon className="h-5 w-5 text-primary" />
                          </div>
                          {getStatusBadge(route.status)}
                        </div>
                        <CardTitle className="text-base">{route.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {route.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <code className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          {route.path}
                        </code>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
