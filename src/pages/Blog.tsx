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
      title: "PromptFluid Introduces Experimental AI Systems That Dream",
      excerpt: "Experimental concept: Cascade and SimNap explore autonomous dreaming, reflection, and self-improvement capabilities.",
      href: "/blog/ai-systems-that-dream-press-release",
      category: "Press Release",
      date: "2025-01-18",
      readTime: "6 min read",
      image: cascadeAIImg,
      imageAlt: "Cascade AI autonomous dreaming system",
      featured: true
    },
    {
      title: "WordPress Bot Defense: Complete Guide to AI-Powered Security",
      excerpt: "Learn how to protect your WordPress site from sophisticated bot attacks using AI-powered behavioral analysis.",
      href: "/blog/wordpress-bot-defense",
      category: "Security",
      date: "2025-01-15",
      readTime: "15 min read",
      image: wpBotDefenseImg,
      imageAlt: "WordPress security with AI protection"
    },
    {
      title: "Top Security Plugins for WordPress in 2025",
      excerpt: "Comprehensive comparison of the best WordPress security plugins, featuring RCKBL (Rockable).",
      href: "/blog/top-security-plugins-2025",
      category: "Security",
      date: "2025-01-10",
      readTime: "12 min read",
      image: topSecurityPluginsImg,
      imageAlt: "WordPress security plugins comparison"
    },
    {
      title: "AI Cybersecurity Evolution: What Changed in 2025",
      excerpt: "Explore how artificial intelligence is revolutionizing cybersecurity with predictive threat detection.",
      href: "/blog/ai-cybersecurity-evolution-2025",
      category: "AI Security",
      date: "2025-01-08",
      readTime: "10 min read",
      image: aiCybersecurityImg,
      imageAlt: "AI cybersecurity evolution"
    },
    {
      title: "AI Hackers Underground: The Dark Side of 2025",
      excerpt: "Inside look at how malicious actors are weaponizing AI for sophisticated attacks.",
      href: "/blog/ai-hackers-underground-2025",
      category: "Threat Intelligence",
      date: "2025-01-05",
      readTime: "14 min read",
      image: aiHackersImg,
      imageAlt: "AI-powered cyber threats"
    },
    {
      title: "How PromptFluid Works: Cascade AI Ecosystem Explained",
      excerpt: "Deep dive into the PromptFluid architecture: dream cycles, neural orchestration, and experimental AI concepts.",
      href: "/blog/how-promptfluid-works-cascade-ai-ecosystem",
      category: "Technology",
      date: "2025-01-10",
      readTime: "18 min read",
      image: howPFWorksImg,
      imageAlt: "PromptFluid Cascade AI ecosystem"
    },
    {
      title: "Cascade AI: Adaptive Intelligence Brain Deep Dive",
      excerpt: "Explore how Cascade's autonomous dream cycles enable continuous learning and reflection.",
      href: "/blog/cascade-ai-adaptive-intelligence-brain",
      category: "AI Technology",
      date: "2025-01-08",
      readTime: "16 min read",
      image: cascadeAIImg,
      imageAlt: "Adaptive AI brain in dream state"
    },
    {
      title: "PromptFluid Studio: Build Apps That Think",
      excerpt: "AI-assisted development platform that generates production-ready code with instant deployment.",
      href: "/blog/promptfluid-studio-build-apps-that-think",
      category: "Development",
      date: "2025-01-05",
      readTime: "13 min read",
      image: pfStudioImg,
      imageAlt: "AI-powered app development studio"
    },
    {
      title: "Free-Tier AI Network: Intelligent Routing Explained",
      excerpt: "How PromptFluid's multi-provider AI gateway routes between 20+ providers—all optimized for cost.",
      href: "/blog/ai-triad-intelligent-routing",
      category: "Technology",
      date: "2025-01-02",
      readTime: "11 min read",
      image: aiTriadImg,
      imageAlt: "AI network routing visualization"
    },
    {
      title: "PromptFluid Brain: Adaptive Learning Core",
      excerpt: "Machine learning engine powering behavioral analysis and predictive threat intelligence.",
      href: "/blog/promptfluid-brain-adaptive-learning-core",
      category: "AI Technology",
      date: "2024-12-28",
      readTime: "15 min read",
      image: pfBrainImg,
      imageAlt: "Machine learning brain core"
    },
    {
      title: "PromptFluid Vision: Unified Dashboard Guide",
      excerpt: "Central command center for monitoring AI orchestration and real-time analytics.",
      href: "/blog/promptfluid-vision-unified-dashboard",
      category: "Platform",
      date: "2024-12-25",
      readTime: "12 min read",
      image: pfVisionImg,
      imageAlt: "Unified command center dashboard"
    },
    {
      title: "PromptFluid Defense: AI Security Deep Dive",
      excerpt: "Advanced bot detection, behavioral fingerprinting, and adaptive security powered by ML.",
      href: "/blog/promptfluid-defense-ai-security",
      category: "Security",
      date: "2024-12-22",
      readTime: "14 min read",
      image: pfDefenseImg,
      imageAlt: "AI security defense system"
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
        description="Expert articles on AI security, WordPress protection, accessibility automation, and intelligent orchestration."
        canonical="https://promptfluid.com/blog"
        keywords={['AI security blog', 'WordPress security articles', 'AI automation insights', 'cybersecurity blog']}
      />
      
      <PublicNav />

      {/* Hero with Earth Window */}
      <section className="relative w-full">
        <div 
          className="absolute inset-0 h-[50vh] bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1497366216548-37526070297c?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 h-[50vh] bg-gradient-to-b from-background/80 via-background/40 to-background" />
        
        <div className="relative container mx-auto px-4 pt-32 pb-16">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="outline" className="mb-6 border-primary/30 text-primary">
              <FileText className="w-3 h-3 mr-2" />
              Knowledge Hub
            </Badge>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              PromptFluid Blog
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Insights on AI security, autonomous systems, WordPress protection, and the future of infrastructure.
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
      </section>

      {/* Categories */}
      <section className="border-y border-border bg-muted/30">
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
      </section>

      {/* Featured Post */}
      {featuredPost && selectedCategory === "All" && !searchQuery && (
        <section className="container mx-auto px-4 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Featured</h2>
            </div>
            
            <Link to={featuredPost.href}>
              <Card className="group overflow-hidden bg-card border-border hover:border-primary/40 transition-all">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="aspect-video md:aspect-auto overflow-hidden">
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <Badge variant="outline" className="w-fit mb-4 border-primary/30 text-primary">
                      {featuredPost.category}
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h3>
                    <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {featuredPost.date}
                      </span>
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </section>
      )}

      {/* Earth Window */}
      <section className="relative w-full h-[40vh] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1920&q=80')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-70" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
            <p className="text-2xl md:text-4xl font-light text-white drop-shadow-lg">
              "Knowledge is the foundation of every system we build."
            </p>
          </blockquote>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Link key={post.href} to={post.href}>
                <Card className="group h-full overflow-hidden bg-card border-border hover:border-primary/40 transition-all">
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={post.image} 
                      alt={post.imageAlt}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <Badge variant="outline" className="mb-3 text-xs border-muted-foreground/30">
                      {post.category}
                    </Badge>
                    <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
