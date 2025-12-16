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
        title="Top WordPress Security Plugins 2025: Overview & Comparison"
        description="Overview of leading WordPress security plugins in 2025 including Wordfence, Sucuri, and upcoming AI-powered solutions. Learn about bot detection, performance impact, and choosing the right plugin for your site."
        keywords={["wordpress security plugins 2025", "best wordpress firewall plugin", "wordfence vs sucuri 2025", "wordpress bot protection plugin", "security plugin comparison"]}
      />
      
      {/* Article Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TechArticle",
          "headline": "WordPress Security Plugins Overview 2025",
          "description": "Overview of WordPress security plugins and upcoming AI-powered solutions",
          "author": {
            "@type": "Person",
            "name": "Kenneth E Sweet Jr",
            "jobTitle": "Founder"
          },
          "publisher": {
            "@type": "Organization",
            "name": "PromptFluid"
          },
          "datePublished": "2025-01-19",
          "mainEntityOfPage": "https://promptfluid.com/blog/top-security-plugins-2025"
        })}
      </script>
      
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <Link to="/blog" className="text-sm text-primary hover:underline mb-4 inline-block">
            ← Back to Blog
          </Link>
          
          <div className="relative w-full h-[400px] rounded-xl overflow-hidden mb-8">
            <img 
              src={heroImage} 
              alt="WordPress security plugins overview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent"></div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">WordPress Security Plugins Overview 2025</h1>
          <p className="text-lg text-muted-foreground mb-8">An overview of leading WordPress security plugins and what to look for when protecting your site.</p>

          <AuthorBio publishDate="2025-01-19" readTime="8 min read" />

          <div className="prose prose-lg max-w-none mt-8">
            <h2>Established Security Plugin Leaders</h2>
            <p>
              The WordPress security market has several well-established players with proven track records:
            </p>
          </div>

          {/* Plugin overview */}
          <div className="space-y-8 mt-8">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-2">Wordfence</h3>
              <p className="text-sm mb-2"><DollarSign className="h-4 w-4 inline" /> Free - $950/year</p>
              <p className="text-muted-foreground mb-4">
                Market leader with a massive user base and extensive threat intelligence network. 
                Offers both free and premium tiers with comprehensive firewall and malware scanning.
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Shield className="h-4 w-4" />
                <span>Established, widely trusted, active development</span>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-2">Sucuri Security</h3>
              <p className="text-sm mb-2"><DollarSign className="h-4 w-4 inline" /> $199-$499/year</p>
              <p className="text-muted-foreground mb-4">
                Cloud-based WAF with professional incident response services. 
                Strong reputation for malware cleanup and DDoS protection.
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Shield className="h-4 w-4" />
                <span>Professional services, CDN included, enterprise-ready</span>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-2">iThemes Security (Solid Security)</h3>
              <p className="text-sm mb-2"><DollarSign className="h-4 w-4 inline" /> Free - $199/year</p>
              <p className="text-muted-foreground mb-4">
                User-friendly security plugin with strong brute force protection and two-factor authentication.
                Good option for sites that want security hardening without complexity.
              </p>
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Shield className="h-4 w-4" />
                <span>Easy setup, good for beginners</span>
              </div>
            </Card>
          </div>

          <div className="mt-12 prose prose-lg max-w-none">
            <h2>Upcoming: PromptFluid Reflex (Bot Sniper)</h2>
            <Card className="p-6 border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-2 text-amber-600 mb-4">
                <Zap className="h-5 w-5" />
                <span className="font-medium">Pending WordPress.org Approval</span>
              </div>
              <p className="text-muted-foreground mb-4">
                PromptFluid Reflex is our upcoming AI-powered WordPress security plugin focused on behavioral bot detection. 
                Currently pending WordPress.org review. Features planned include:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• AI-powered behavioral analysis</li>
                <li>• Device fingerprinting</li>
                <li>• Adaptive challenge system</li>
                <li>• Free tier planned</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-4 italic">
                Join the waitlist at <Link to="/bot-sniper" className="text-primary hover:underline">promptfluid.com/bot-sniper</Link> to be notified when available.
              </p>
            </Card>
          </div>

          <div className="mt-12 p-6 bg-primary/10 rounded-lg">
            <p className="font-bold mb-2">Learn more about WordPress security:</p>
            <Link to="/blog/wordpress-bot-defense" className="text-primary hover:underline">
              WordPress Bot Protection: Defense Strategies →
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default TopSecurityPlugins2025;