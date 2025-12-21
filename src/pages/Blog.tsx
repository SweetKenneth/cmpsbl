import { FileText, Calendar, ArrowRight, Search, Sparkles, Bot } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
import earthWindowImage from "@/assets/hero/earth-window-station-2.jpg";

export default function Blog() {
  const [searchQuery, setSearchQuery] = useState("");
  const [autoPosts, setAutoPosts] = useState<Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    category: string;
    published_at: string;
  }>>([]);

  // Fetch auto-generated posts
  useEffect(() => {
    const fetchAutoPosts = async () => {
      const { data } = await supabase
        .from("auto_blog_posts")
        .select("id, title, slug, excerpt, category, published_at")
        .eq("status", "published")
        .order("published_at", { ascending: false })
        .limit(20);
      
      if (data) setAutoPosts(data);
    };
    fetchAutoPosts();
  }, []);

  const blogPosts = [
    {
      title: "Experimental AI Systems That Dream",
      excerpt: "Cascade and SimNap explore autonomous dreaming, reflection, and self-improvement.",
      href: "/blog/ai-systems-that-dream-press-release",
      category: "Research",
      date: "2025-01-18",
      readTime: "6 min",
      image: cascadeAIImg,
      imageAlt: "Cascade AI autonomous dreaming system",
      featured: true
    },
    {
      title: "WordPress Bot Defense Guide",
      excerpt: "Protect your site from sophisticated bot attacks with AI-powered behavioral analysis.",
      href: "/blog/wordpress-bot-defense",
      category: "Security",
      date: "2025-01-15",
      readTime: "15 min",
      image: wpBotDefenseImg,
      imageAlt: "WordPress security with AI protection"
    },
    {
      title: "Top Security Plugins 2025",
      excerpt: "Comprehensive comparison of WordPress security plugins, featuring RCKBL.",
      href: "/blog/top-security-plugins-2025",
      category: "Security",
      date: "2025-01-10",
      readTime: "12 min",
      image: topSecurityPluginsImg,
      imageAlt: "WordPress security plugins comparison"
    },
    {
      title: "AI Cybersecurity Evolution",
      excerpt: "How artificial intelligence is revolutionizing predictive threat detection.",
      href: "/blog/ai-cybersecurity-evolution-2025",
      category: "AI Security",
      date: "2025-01-08",
      readTime: "10 min",
      image: aiCybersecurityImg,
      imageAlt: "AI cybersecurity evolution"
    },
    {
      title: "AI Hackers Underground",
      excerpt: "Inside look at how malicious actors weaponize AI for sophisticated attacks.",
      href: "/blog/ai-hackers-underground-2025",
      category: "Threat Intel",
      date: "2025-01-05",
      readTime: "14 min",
      image: aiHackersImg,
      imageAlt: "AI-powered cyber threats"
    },
    {
      title: "How PromptFluid Works",
      excerpt: "Deep dive: dream cycles, neural orchestration, and experimental AI concepts.",
      href: "/blog/how-promptfluid-works-cascade-ai-ecosystem",
      category: "Technology",
      date: "2025-01-10",
      readTime: "18 min",
      image: howPFWorksImg,
      imageAlt: "PromptFluid Cascade AI ecosystem"
    },
    {
      title: "Cascade AI: Adaptive Intelligence",
      excerpt: "How autonomous dream cycles enable continuous learning and reflection.",
      href: "/blog/cascade-ai-adaptive-intelligence-brain",
      category: "AI Technology",
      date: "2025-01-08",
      readTime: "16 min",
      image: cascadeAIImg,
      imageAlt: "Adaptive AI brain in dream state"
    },
    {
      title: "PromptFluid Studio",
      excerpt: "AI-assisted development platform generating production-ready code.",
      href: "/blog/promptfluid-studio-build-apps-that-think",
      category: "Development",
      date: "2025-01-05",
      readTime: "13 min",
      image: pfStudioImg,
      imageAlt: "AI-powered app development studio"
    },
    {
      title: "Free-Tier AI Routing",
      excerpt: "Multi-provider gateway optimized for cost and performance.",
      href: "/blog/ai-triad-intelligent-routing",
      category: "Technology",
      date: "2025-01-02",
      readTime: "11 min",
      image: aiTriadImg,
      imageAlt: "AI network routing visualization"
    },
    {
      title: "Adaptive Learning Core",
      excerpt: "Machine learning engine powering behavioral analysis and threat intelligence.",
      href: "/blog/promptfluid-brain-adaptive-learning-core",
      category: "AI Technology",
      date: "2024-12-28",
      readTime: "15 min",
      image: pfBrainImg,
      imageAlt: "Machine learning brain core"
    },
    {
      title: "Unified Dashboard Guide",
      excerpt: "Central command for monitoring AI orchestration and analytics.",
      href: "/blog/promptfluid-vision-unified-dashboard",
      category: "Platform",
      date: "2024-12-25",
      readTime: "12 min",
      image: pfVisionImg,
      imageAlt: "Unified command center dashboard"
    },
    {
      title: "AI Security Deep Dive",
      excerpt: "Advanced bot detection, behavioral fingerprinting, and adaptive security.",
      href: "/blog/promptfluid-defense-ai-security",
      category: "Security",
      date: "2024-12-22",
      readTime: "14 min",
      image: pfDefenseImg,
      imageAlt: "AI security defense system"
    }
  ];

  const categories = ["All", "Security", "AI Technology", "Technology", "Platform", "Research", "Development"];
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
        title="Blog — PromptFluid AI & Security Insights"
        description="Research and insights on AI security, autonomous systems, WordPress protection, and intelligent orchestration."
        canonical="https://promptfluid.com/blog"
        keywords={['AI security blog', 'WordPress security', 'AI automation', 'cybersecurity research']}
      />
      
      <PublicNav />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-20 md:pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground tracking-tight">
            Research & Insights
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-3xl leading-relaxed">
            Documentation of what we're building, what we've learned, and where the field is headed.
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-lg bg-card border-border"
            />
          </div>
        </div>
      </section>

      {/* Earth Window */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        <img 
          src={earthWindowImage}
          alt="Orbital observation deck overlooking Earth from space"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <blockquote className="text-center max-w-3xl px-8">
            <p className="text-2xl md:text-5xl font-bold text-white [text-shadow:_0_4px_24px_rgba(0,0,0,0.8)]">
              "We document what we build. We share what we learn."
            </p>
          </blockquote>
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className="cursor-pointer hover:bg-primary/20 transition-colors text-sm py-2 px-4"
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
        <section className="container mx-auto px-4 py-12">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Featured</h2>
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
                  <div className="p-8 md:p-12 flex flex-col justify-center">
                    <Badge variant="outline" className="w-fit mb-4 border-primary/30 text-primary">
                      {featuredPost.category}
                    </Badge>
                    <h3 className="text-2xl md:text-3xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">
                      {featuredPost.title}
                    </h3>
                    <p className="text-muted-foreground mb-6 leading-relaxed">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{featuredPost.date}</span>
                      <span>·</span>
                      <span>{featuredPost.readTime}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </section>
      )}

      {/* Second Earth Window */}
      <section className="relative w-full h-[40vh] overflow-hidden">
        <img 
          src={earthWindowImage}
          alt="Orbital observation deck overlooking Earth from space"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background opacity-70" />
      </section>

      {/* Blog Posts Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{post.excerpt}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{post.date}</span>
                      <span>·</span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {/* Auto-Generated Posts Section */}
          {autoPosts.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-3 mb-8">
                <Bot className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold text-foreground">AI-Generated Insights</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {autoPosts.map((post) => (
                  <Link key={post.id} to={`/blog/auto/${post.slug}`}>
                    <Card className="group h-full p-6 bg-card border-border hover:border-primary/40 transition-all">
                      <Badge variant="outline" className="mb-3 text-xs border-primary/30 text-primary">
                        {post.category}
                      </Badge>
                      <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                      <span className="text-xs text-muted-foreground">
                        {new Date(post.published_at).toLocaleDateString()}
                      </span>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <EnhancedFooter />
    </div>
  );
}
