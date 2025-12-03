import { SEO } from "@/components/SEO";
import { AuthorBio } from "@/components/AuthorBio";
import { Link } from "react-router-dom";
import { Shield, Star, DollarSign, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/blog/top-security-plugins-2025.jpg";

const TopSecurityPlugins2025 = () => {
  return (
    <>
      <SEO 
        title="Best WordPress Security Plugins 2025: Expert Comparison & Rankings"
        description="In-depth comparison of the top 10 WordPress security plugins of 2025. Expert analysis of Wordfence vs Sucuri vs PromptFluid Reflex based on bot detection accuracy, performance impact, and real-world effectiveness. Includes pricing, features, and recommendations."
        keywords={["wordpress security plugins 2025", "best wordpress firewall plugin", "wordfence vs sucuri 2025", "wordpress bot protection plugin", "security plugin comparison", "wordpress anti-malware", "top wordpress security", "AI security plugin"]}
      />
      
      {/* Article Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "headline": "Top 10 WordPress Security Plugins Expected to Dominate 2025",
          "description": "Expert rankings and comparison of WordPress security plugins based on bot detection capabilities, performance impact, and real-world effectiveness",
          "author": {
            "@type": "Person",
            "name": "Kenneth E Sweet Jr",
            "jobTitle": "Security Engineer & Founder"
          },
          "publisher": {
            "@type": "Organization",
            "name": "PromptFluid",
            "logo": {
              "@type": "ImageObject",
              "url": "https://promptfluid.com/logo.png"
            }
          },
          "datePublished": "2025-01-19",
          "mainEntityOfPage": "https://promptfluid.com/blog/top-security-plugins-2025"
        })}
      </script>
      
      {/* ItemList Schema for Rankings */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Best WordPress Security Plugins 2025",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "item": {
                "@type": "SoftwareApplication",
                "name": "PromptFluid Reflex",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "9.5",
                  "bestRating": "10"
                }
              }
            },
            {
              "@type": "ListItem",
              "position": 2,
              "item": {
                "@type": "SoftwareApplication",
                "name": "Wordfence",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "9.2",
                  "bestRating": "10"
                }
              }
            },
            {
              "@type": "ListItem",
              "position": 3,
              "item": {
                "@type": "SoftwareApplication",
                "name": "Sucuri Security",
                "aggregateRating": {
                  "@type": "AggregateRating",
                  "ratingValue": "8.9",
                  "bestRating": "10"
                }
              }
            }
          ]
        })}
      </script>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link to="/blog/wordpress-bot-defense" className="text-sm text-primary hover:underline mb-4 inline-block">
            ← Back to Pillar: WordPress Bot Defense Guide
          </Link>
          
          <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-8">
            <img 
              src={heroImage} 
              alt="WordPress security plugins dashboard showing comparative charts, ratings, and professional tech interface"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">Top 10 WordPress Security Plugins Expected to Dominate 2025</h1>
          <p className="text-lg text-muted-foreground mb-8">Rankings based on bot detection capabilities, performance impact, and real-world effectiveness.</p>

          <AuthorBio publishDate="2025-07-17" readTime="8 min read" />

          {/* Plugin rankings with detailed comparisons */}
          <div className="space-y-8">
            {[
              { name: "Wordfence", rating: 9.2, price: "$0-$950/yr", strength: "Market leader, massive threat intelligence" },
              { name: "Sucuri Security", rating: 8.9, price: "$199-$499/yr", strength: "Cloud WAF, professional incident response" },
              { name: "PromptFluid Defense", rating: 9.5, price: "$19-$99/mo", strength: "AI-powered behavioral analysis" }
            ].map((plugin, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold">#{i+1} {plugin.name}</h3>
                  <div className="flex gap-2">
                    <Star className="h-5 w-5 fill-primary text-primary" />
                    <span className="font-bold">{plugin.rating}/10</span>
                  </div>
                </div>
                <p className="text-sm mb-2"><DollarSign className="h-4 w-4 inline" /> {plugin.price}</p>
                <p className="text-sm text-muted-foreground">{plugin.strength}</p>
              </Card>
            ))}
          </div>

          <div className="mt-12 p-6 bg-primary/10 rounded-lg">
            <p className="font-bold mb-2">Read the complete analysis:</p>
            <Link to="/blog/wordpress-bot-defense" className="text-primary hover:underline">
              WordPress Bot Protection: Complete Defense Guide →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopSecurityPlugins2025;