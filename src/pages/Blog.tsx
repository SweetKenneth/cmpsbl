import { FileText, Calendar, ArrowRight, Search, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { useState } from "react";

// Blog post images
import wpBotDefenseImg from "@/assets/blog/wordpress-bot-defense.jpg";
import topSecurityPluginsImg from "@/assets/blog/top-security-plugins-2025.jpg";
import aiCybersecurityImg from "@/assets/blog/ai-cybersecurity-evolution-2025.jpg";
import aiHackersImg from "@/assets/blog/ai-hackers-underground-2025.jpg";
import howPFWorksImg from "@/assets/blog/how-promptfluid-works-cascade.jpg";
import cascadeAIImg from "@/assets/blog/cascade-ai-adaptive-intelligence.jpg";
import pfStudioImg from "@/assets/blog/promptfluid-studio-build-apps.jpg";
import aiTriadImg from "@/assets/blog/ai-triad-intelligent-routing.jpg";
import pfBrainImg from "@/assets/blog/promptfluid-brain-learning-core.jpg";
import pfVisionImg from "@/assets/blog/promptfluid-vision-dashboard.jpg";
import pfDefenseImg from "@/assets/blog/promptfluid-defense-ai-security.jpg";
import pfRippleImg from "@/assets/blog/promptfluid-ripple-network.jpg";
import pfAccessImg from "@/assets/blog/promptfluid-access-identity-billing.jpg";
import pfNexusImg from "@/assets/blog/promptfluid-nexus-api-gateway.jpg";
import aiComparisonImg from "@/assets/blog/ai-product-comparison-2025.jpg";
import marketDisruptorImg from "@/assets/blog/promptfluid-market-disruptor.jpg";
import roadmapImg from "@/assets/blog/product-roadmap-2025.jpg";
import automationTrendsImg from "@/assets/blog/ai-automation-trends-2025.jpg";
import businessOpsImg from "@/assets/blog/ai-business-operations-2025.jpg";
import cmptblMissionImg from "@/assets/blog/cmptbl-mission-accessibility.jpg";
import wpAccessibilityImg from "@/assets/blog/wordpress-accessibility-guide.jpg";
import wcag22Img from "@/assets/blog/wcag-2-2-wordpress-changes.jpg";
import autoAccessibilityImg from "@/assets/blog/automated-accessibility-fixes.jpg";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");

  const blogPosts = [
    {
      title: "PromptFluid Introduces the First AI Systems That Dream",
      excerpt: "Revolutionary announcement: Cascade and SimNap become the first documented AI systems capable of autonomous dreaming, reflection, and self-improvement.",
      href: "/blog/ai-systems-that-dream-press-release",
      category: "Press Release",
      date: "2025-01-18",
      readTime: "6 min read",
      image: cascadeAIImg,
      imageAlt: "Cascade AI autonomous dreaming system with neural pathways lighting up",
      featured: true
    },
    {
      title: "WordPress Bot Defense: Complete Guide to AI-Powered Security",
      excerpt: "Learn how to protect your WordPress site from sophisticated bot attacks using AI-powered behavioral analysis and machine learning.",
      href: "/blog/wordpress-bot-defense",
      category: "Security",
      date: "2025-01-15",
      readTime: "15 min read",
      image: wpBotDefenseImg,
      imageAlt: "WordPress security fortress with AI shield protecting website from bot attacks"
    },
    {
      title: "Top Security Plugins for WordPress in 2025",
      excerpt: "Comprehensive comparison of the best WordPress security plugins, featuring PromptFluid Reflex Bot Sniper and industry leaders.",
      href: "/blog/top-security-plugins-2025",
      category: "Security",
      date: "2025-01-10",
      readTime: "12 min read",
      image: topSecurityPluginsImg,
      imageAlt: "WordPress security plugins dashboard with comparative ratings and analysis"
    },
    {
      title: "AI Cybersecurity Evolution: What Changed in 2025",
      excerpt: "Explore how artificial intelligence is revolutionizing cybersecurity with predictive threat detection and autonomous defense systems.",
      href: "/blog/ai-cybersecurity-evolution-2025",
      category: "AI Security",
      date: "2025-01-08",
      readTime: "10 min read",
      image: aiCybersecurityImg,
      imageAlt: "AI brain neural network analyzing cybersecurity threats in real-time"
    },
    {
      title: "AI Hackers Underground: The Dark Side of 2025",
      excerpt: "Inside look at how malicious actors are weaponizing AI for sophisticated attacks and what it means for security professionals.",
      href: "/blog/ai-hackers-underground-2025",
      category: "Threat Intelligence",
      date: "2025-01-05",
      readTime: "14 min read",
      image: aiHackersImg,
      imageAlt: "Dark underground hacker scene with AI-powered attack vectors and sophisticated bot armies"
    },
    {
      title: "How PromptFluid Works: Cascade AI Ecosystem Explained",
      excerpt: "Deep dive into the PromptFluid architecture: dream cycles, neural orchestration, and the world's first dreaming AI.",
      href: "/blog/how-promptfluid-works-cascade-ai-ecosystem",
      category: "Technology",
      date: "2025-01-10",
      readTime: "18 min read",
      image: howPFWorksImg,
      imageAlt: "PromptFluid Cascade AI ecosystem architecture with flowing liquid intelligence streams"
    },
    {
      title: "Cascade AI: Adaptive Intelligence Brain Deep Dive",
      excerpt: "Explore how Cascade's autonomous dream cycles enable continuous learning, reflection, and innovation without human intervention.",
      href: "/blog/cascade-ai-adaptive-intelligence-brain",
      category: "AI Technology",
      date: "2025-01-08",
      readTime: "16 min read",
      image: cascadeAIImg,
      imageAlt: "Adaptive AI brain in dream state with glowing autonomous learning neural pathways"
    },
    {
      title: "PromptFluid Studio: Build Apps That Think",
      excerpt: "Revolutionary AI-assisted development platform that generates production-ready code with instant deployment and auto-optimization.",
      href: "/blog/promptfluid-studio-build-apps-that-think",
      category: "Development",
      date: "2025-01-05",
      readTime: "13 min read",
      image: pfStudioImg,
      imageAlt: "AI-powered app development studio interface with real-time code generation"
    },
    {
      title: "Free-Tier AI Network: Intelligent Routing Explained",
      excerpt: "How PromptFluid's multi-provider AI gateway intelligently routes between Groq, Cerebras, Together AI, DeepSeek, and Hyperbolic—all free-tier.",
      href: "/blog/ai-triad-intelligent-routing",
      category: "Technology",
      date: "2025-01-02",
      readTime: "11 min read",
      image: aiTriadImg,
      imageAlt: "AI network routing visualization with six free-tier AI providers interconnected"
    },
    {
      title: "PromptFluid Brain: Adaptive Learning Core",
      excerpt: "Machine learning engine that powers behavioral analysis, anomaly detection, and predictive threat intelligence across the ecosystem.",
      href: "/blog/promptfluid-brain-adaptive-learning-core",
      category: "AI Technology",
      date: "2024-12-28",
      readTime: "15 min read",
      image: pfBrainImg,
      imageAlt: "Machine learning brain core with adaptive neural networks and behavioral analysis patterns"
    },
    {
      title: "PromptFluid Vision: Unified Dashboard Guide",
      excerpt: "Central command center for monitoring AI orchestration, real-time analytics, and complete ecosystem visibility.",
      href: "/blog/promptfluid-vision-unified-dashboard",
      category: "Platform",
      date: "2024-12-25",
      readTime: "12 min read",
      image: pfVisionImg,
      imageAlt: "Unified command center dashboard with real-time AI orchestration analytics"
    },
    {
      title: "PromptFluid Defense: AI Security Deep Dive",
      excerpt: "Advanced bot detection, behavioral fingerprinting, and adaptive CAPTCHA powered by machine learning threat intelligence.",
      href: "/blog/promptfluid-defense-ai-security",
      category: "Security",
      date: "2024-12-22",
      readTime: "14 min read",
      image: pfDefenseImg,
      imageAlt: "Advanced AI security defense system with bot detection fingerprinting network"
    },
    {
      title: "PromptFluid Ripple: Network Integration Explained",
      excerpt: "API orchestration mesh that seamlessly connects services, routes requests, and manages backend queues with intelligent routing.",
      href: "/blog/promptfluid-ripple-network-integration",
      category: "Technology",
      date: "2024-12-19",
      readTime: "10 min read",
      image: pfRippleImg,
      imageAlt: "Network integration mesh with API routing pathways and service orchestration"
    },
    {
      title: "PromptFluid Access: Identity & Billing System",
      excerpt: "Complete authentication, permissions, licensing, and billing infrastructure with deferral credits and trust-based retention.",
      href: "/blog/promptfluid-access-identity-billing",
      category: "Platform",
      date: "2024-12-16",
      readTime: "11 min read",
      image: pfAccessImg,
      imageAlt: "Identity and billing system architecture with secure authentication pathways"
    },
    {
      title: "PromptFluid Nexus: API Gateway Architecture",
      excerpt: "Unified gateway routing to multiple AI providers with smart caching, cost optimization, and automatic provider selection.",
      href: "/blog/promptfluid-nexus-api-gateway",
      category: "Technology",
      date: "2024-12-13",
      readTime: "13 min read",
      image: pfNexusImg,
      imageAlt: "API gateway architecture with multiple AI provider connections and intelligent caching"
    },
    {
      title: "AI Product Comparison: PromptFluid vs Competitors 2025",
      excerpt: "Comprehensive analysis comparing PromptFluid's dream intelligence against traditional AI platforms and automation tools.",
      href: "/blog/ai-product-comparison-2025",
      category: "Business",
      date: "2024-12-10",
      readTime: "16 min read",
      image: aiComparisonImg,
      imageAlt: "AI product comparison chart showing PromptFluid versus competitors side by side"
    },
    {
      title: "PromptFluid Market Disruptor: Industry Analysis",
      excerpt: "How PromptFluid's first-mover advantage in dream cycle intelligence is disrupting the AI automation and security markets.",
      href: "/blog/promptfluid-market-disruptor",
      category: "Business",
      date: "2024-11-22",
      readTime: "12 min read",
      image: marketDisruptorImg,
      imageAlt: "Market disruption visualization with rising growth charts and innovation breakthrough"
    },
    {
      title: "Product Roadmap 2025: What's Coming to PromptFluid",
      excerpt: "Exclusive look at upcoming features, integrations, and innovations across all PromptFluid modules in 2025.",
      href: "/blog/product-roadmap-2025",
      category: "Product Updates",
      date: "2024-11-20",
      readTime: "14 min read",
      image: roadmapImg,
      imageAlt: "Product roadmap timeline for 2025 showing futuristic feature releases"
    },
    {
      title: "AI Automation Trends 2025: What to Expect",
      excerpt: "Industry forecast covering autonomous AI, dream intelligence, behavioral analysis, and next-generation automation systems.",
      href: "/blog/ai-automation-trends-2025",
      category: "Industry",
      date: "2024-11-18",
      readTime: "13 min read",
      image: automationTrendsImg,
      imageAlt: "AI automation trends forecast with autonomous intelligence systems visualization"
    },
    {
      title: "AI in Business Operations: 2025 Transformation Guide",
      excerpt: "How businesses are leveraging AI for operations, security, customer service, and workflow automation in 2025.",
      href: "/blog/ai-business-operations-2025",
      category: "Business",
      date: "2024-11-15",
      readTime: "15 min read",
      image: businessOpsImg,
      imageAlt: "Business operations transformation with AI integration and workflow automation"
    },
    {
      title: "CMPTBL Mission: Making the Web Accessible for All",
      excerpt: "Our commitment to universal web accessibility through AI-powered WCAG compliance and automated remediation systems.",
      href: "/blog/cmptbl-mission",
      category: "Accessibility",
      date: "2024-11-12",
      readTime: "11 min read",
      image: cmptblMissionImg,
      imageAlt: "Universal web accessibility mission with diverse people connecting through technology"
    },
    {
      title: "WordPress Accessibility Guide: WCAG 2.2 Compliance",
      excerpt: "Complete guide to making WordPress sites accessible with automated AI fixes, compliance scanning, and remediation tools.",
      href: "/blog/wordpress-accessibility-guide",
      category: "Accessibility",
      date: "2024-11-10",
      readTime: "17 min read",
      image: wpAccessibilityImg,
      imageAlt: "WordPress accessibility compliance guide with WCAG 2.2 checkmarks and standards"
    },
    {
      title: "WCAG 2.2 Changes: What WordPress Owners Need to Know",
      excerpt: "Breaking down the new WCAG 2.2 requirements and how they impact WordPress sites with actionable compliance steps.",
      href: "/blog/wcag-2-2-wordpress-changes",
      category: "Accessibility",
      date: "2024-11-08",
      readTime: "12 min read",
      image: wcag22Img,
      imageAlt: "WCAG 2.2 standards documentation with compliance requirements visualization"
    },
    {
      title: "Automated Accessibility Fixes for WordPress: AI Solutions",
      excerpt: "How AI solves 80% of accessibility issues automatically with intelligent detection and auto-remediation technology.",
      href: "/blog/automated-accessibility-fixes-wordpress",
      category: "Accessibility",
      date: "2024-11-05",
      readTime: "14 min read",
      image: autoAccessibilityImg,
      imageAlt: "Automated AI accessibility fixes with intelligent detection and remediation"
    }
  ];

  const categories = ["All", "Security", "AI Technology", "Technology", "Platform", "Business", "Accessibility", "Development"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPost = blogPosts.find(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Blog — PromptFluid AI Security & Technology Insights"
        description="Expert articles on AI security, WordPress protection, accessibility automation, and intelligent orchestration. Learn from the creators of Cascade AI dream intelligence."
        canonical="https://promptfluid.com/blog"
        keywords={[
          'AI security blog',
          'WordPress security articles',
          'AI automation insights',
          'cybersecurity blog',
          'machine learning security',
          'WordPress protection guide',
          'AI technology articles',
          'accessibility automation',
          'dream intelligence AI',
          'behavioral analysis security'
        ]}
      />
      
      <PublicNav />

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <FileText className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">Knowledge Hub</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              PromptFluid Blog
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8">
            Insights on AI security, dream intelligence, WordPress protection, and the future of autonomous automation.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg"
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="border-y bg-muted/30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors"
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {featuredPost && (
            <div className="mb-16">
              <div className="flex items-center gap-3 mb-8">
                <div className="relative">
                  <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                  <div className="absolute inset-0 h-8 w-8 bg-primary/20 blur-xl rounded-full animate-pulse"></div>
                </div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                  Featured Article
                </h2>
              </div>
              <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 group border-2 border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 backdrop-blur-sm">
                <Link to={featuredPost.href} className="block">
                  <div className="relative h-96 overflow-hidden">
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="absolute top-6 right-6">
                      <Badge variant="secondary" className="bg-primary text-primary-foreground shadow-lg backdrop-blur-sm px-4 py-2 text-sm font-bold border border-primary-foreground/20">
                        ⭐ Featured
                      </Badge>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-8">
                      <div className="flex items-center gap-4 text-sm text-foreground/90 mb-3">
                        <Badge variant="outline" className="bg-background/80 backdrop-blur-sm border-primary/50 text-foreground font-semibold">
                          {featuredPost.category}
                        </Badge>
                        <span className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full">
                          <Calendar className="h-4 w-4 text-primary" />
                          {new Date(featuredPost.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                        <span className="bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full font-medium">
                          {featuredPost.readTime}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="p-10 relative">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                    <h3 className="text-4xl font-bold mb-6 group-hover:text-primary transition-colors duration-300 leading-tight">
                      {featuredPost.title}
                    </h3>
                    <p className="text-muted-foreground text-xl mb-8 leading-relaxed">
                      {featuredPost.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-3 text-primary font-bold text-lg group-hover:gap-5 transition-all duration-300">
                      Read Full Article 
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              </Card>
            </div>
          )}

          {filteredPosts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">No articles found matching your search.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Latest Articles</h2>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post, index) => (
                <Link key={index} to={post.href}>
                  <Card className="overflow-hidden glass border-border/50 hover:border-primary/50 transition-all duration-300 h-full flex flex-col group">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.imageAlt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                      <Badge variant="secondary" className="absolute top-3 left-3 text-xs">
                        {post.category}
                      </Badge>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">{post.readTime}</span>
                      </div>
                      
                      <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      
                      <p className="text-sm text-muted-foreground mb-4 flex-grow line-clamp-3">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-end text-sm">
                        <span className="text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                          Read more
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </>
          )}
        </div>
      </div>

      <EnhancedFooter />
    </div>
  );
}
