/**
 * AutoBlogPost — Dynamic page for auto-generated blog posts
 * Renders posts from auto_blog_posts table with beautiful typography
 */

import { useParams, Link, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Calendar, Tag, Bot, Clock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicNav } from '@/components/PublicNav';
import { EnhancedFooter } from '@/components/EnhancedFooter';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Import autoblog images
import autoblog1 from '@/assets/autoblog/autoblog-1.jpg';
import autoblog2 from '@/assets/autoblog/autoblog-2.jpg';
import autoblog3 from '@/assets/autoblog/autoblog-3.jpg';
import autoblog4 from '@/assets/autoblog/autoblog-4.jpg';
import autoblog5 from '@/assets/autoblog/autoblog-5.jpg';
import autoblog6 from '@/assets/autoblog/autoblog-6.jpg';
import autoblog7 from '@/assets/autoblog/autoblog-7.jpg';
import autoblog8 from '@/assets/autoblog/autoblog-8.jpg';

const AUTOBLOG_IMAGES = [
  autoblog1, autoblog2, autoblog3, autoblog4,
  autoblog5, autoblog6, autoblog7, autoblog8
];

// Get consistent image for a post based on its ID
function getImageForPost(postId: string): string {
  // Use the first 8 chars of the ID to generate a consistent index
  const hash = postId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AUTOBLOG_IMAGES[hash % AUTOBLOG_IMAGES.length];
}

interface AutoPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  published_at: string;
  topic_seed: string | null;
}

export default function AutoBlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<AutoPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // Try exact match first, then partial match
      let { data, error } = await supabase
        .from('auto_blog_posts')
        .select('*')
        .eq('status', 'published')
        .ilike('slug', `%${slug}%`)
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        setNotFound(true);
      } else {
        setPost(data);
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  if (notFound) {
    return <Navigate to="/blog" replace />;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      changelog: 'border-green-500/50 text-green-400 bg-green-500/10',
      insight: 'border-blue-500/50 text-blue-400 bg-blue-500/10',
      release: 'border-purple-500/50 text-purple-400 bg-purple-500/10',
      update: 'border-amber-500/50 text-amber-400 bg-amber-500/10',
      internal: 'border-cyan-500/50 text-cyan-400 bg-cyan-500/10',
      research: 'border-pink-500/50 text-pink-400 bg-pink-500/10',
    };
    return colors[category] || 'border-primary/50 text-primary bg-primary/10';
  };

  const heroImage = post ? getImageForPost(post.id) : AUTOBLOG_IMAGES[0];

  return (
    <div className="min-h-screen bg-background">
      {post && (
        <Helmet>
          <title>{post.title} | Substrate AutoBlog</title>
          <meta name="description" content={post.excerpt} />
        </Helmet>
      )}

      <PublicNav />

      {loading ? (
        <div className="container mx-auto px-4 py-20 max-w-4xl">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-12 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-12" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ) : post ? (
        <>
          {/* Hero Section */}
          <section className="relative w-full h-[50vh] min-h-[400px] overflow-hidden">
            <img 
              src={heroImage}
              alt={post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/30" />
            
            <div className="absolute inset-0 flex items-end">
              <div className="container mx-auto px-4 pb-12 max-w-4xl">
                <Link 
                  to="/blog" 
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Blog
                </Link>
                
                <div className="flex items-center gap-3 mb-4">
                  <Badge className={getCategoryColor(post.category)}>
                    <Tag className="w-3 h-3 mr-1" />
                    {post.category}
                  </Badge>
                  <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5">
                    <Bot className="w-3 h-3 mr-1" />
                    AutoBlog
                  </Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
                  {post.title}
                </h1>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(post.published_at)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {Math.ceil(post.content.split(' ').length / 200)} min read
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Content Section */}
          <article className="container mx-auto px-4 py-16 max-w-4xl">
            {/* Autonomous Generation Notice */}
            <div className="mb-12 p-6 rounded-xl bg-card/50 border border-border/50">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Autonomously Generated</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    This content was generated by the Substrate's Constant Learning Mode (CLM) as part of its 
                    24/7 autonomous self-improvement cycle. It represents the system's internal reflections 
                    and research findings.
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content with Beautiful Typography */}
            <div className="prose prose-lg prose-invert max-w-none space-y-8
              prose-headings:font-bold prose-headings:text-foreground prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:!mt-12 prose-h2:!mb-6 prose-h2:border-b prose-h2:border-border/30 prose-h2:pb-4
              prose-h3:text-xl prose-h3:!mt-8 prose-h3:!mb-4
              prose-p:text-muted-foreground prose-p:leading-[1.8] prose-p:!mb-6
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground prose-strong:font-semibold
              prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-primary
              prose-pre:bg-card prose-pre:border prose-pre:border-border/50 prose-pre:rounded-xl prose-pre:p-6 prose-pre:!my-8
              prose-ul:!space-y-3 prose-ul:!my-6 prose-ul:pl-6
              prose-ol:!space-y-3 prose-ol:!my-6 prose-ol:pl-6
              prose-li:text-muted-foreground prose-li:leading-relaxed prose-li:!my-2
              prose-blockquote:border-l-primary prose-blockquote:bg-muted/30 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic prose-blockquote:!my-8
              prose-hr:!my-10 prose-hr:border-border/50
            ">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {post.content}
              </ReactMarkdown>
            </div>

            {/* Topic Seed */}
            {post.topic_seed && (
              <div className="mt-16 pt-8 border-t border-border/30">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Topic Origin:</span> {post.topic_seed}
                </p>
              </div>
            )}

            {/* Back to Blog */}
            <div className="mt-12 pt-8 border-t border-border/30">
              <Link 
                to="/blog" 
                className="inline-flex items-center gap-2 text-primary hover:underline"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to all articles
              </Link>
            </div>
          </article>
        </>
      ) : null}

      <EnhancedFooter />
    </div>
  );
}
