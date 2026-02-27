import { SEO } from "@/components/SEO";
import { AuthorBio } from "@/components/AuthorBio";
import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Zap } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import heroImage from "@/assets/blog/top-security-plugins-2025.jpg";

const TopSecurityPlugins2025 = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Top WordPress Security Plugins Compared"
        description="Comprehensive comparison of WordPress security plugins: AI-powered defense, firewall strength, and malware detection capabilities."
        type="article"
        publishedTime="2025-10-20"
        keywords={["WordPress security plugins", "best security plugins", "WordPress firewall comparison", "WordPress malware protection", "Wordfence vs Sucuri"]}
      />
      
      <PublicNav />

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-20 md:pt-32 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Research
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-foreground tracking-tight">
            WordPress Security Plugins Overview 2025
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            An overview of leading WordPress security plugins and what to look for when protecting your site.
          </p>

          <AuthorBio publishDate="2025-01-19" readTime="8 min read" />
        </div>
      </section>

      {/* Hero Image */}
      <section className="relative w-full h-[50vh] overflow-hidden">
        <img 
          src={heroImage} 
          alt="WordPress security plugins overview with shield protection visualization"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </section>

      {/* Content */}
      <article className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-foreground">
              <Shield className="h-8 w-8 text-primary" />
              Established Security Plugin Leaders
            </h2>
            
            <div className="space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p>
                The WordPress security market has several well-established players with proven track records. Each offers different approaches to protection.
              </p>
            </div>
          </section>

          {/* Plugin Cards */}
          <section className="space-y-8 mb-16">
            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-2 text-foreground">Wordfence</h3>
              <p className="text-sm text-muted-foreground mb-4">Free - $950/year</p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Market leader with a massive user base and extensive threat intelligence network. 
                Offers both free and premium tiers with comprehensive firewall and malware scanning.
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Shield className="h-4 w-4" />
                <span>Established, widely trusted, active development</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-2 text-foreground">Sucuri Security</h3>
              <p className="text-sm text-muted-foreground mb-4">$199-$499/year</p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Cloud-based WAF with professional incident response services. 
                Strong reputation for malware cleanup and DDoS protection.
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Shield className="h-4 w-4" />
                <span>Professional services, CDN included, enterprise-ready</span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
              <h3 className="text-2xl font-bold mb-2 text-foreground">iThemes Security (Solid Security)</h3>
              <p className="text-sm text-muted-foreground mb-4">Free - $199/year</p>
              <p className="text-muted-foreground leading-relaxed mb-4">
                User-friendly security plugin with strong brute force protection and two-factor authentication.
                Good option for sites that want security hardening without complexity.
              </p>
              <div className="flex items-center gap-2 text-sm text-primary">
                <Shield className="h-4 w-4" />
                <span>Easy setup, good for beginners</span>
              </div>
            </div>
          </section>

          {/* Quote Break */}
          <section className="my-16 py-12 border-y border-border">
            <blockquote className="text-2xl md:text-3xl font-light text-center text-foreground">
              "The best security solution is one that adapts faster than attackers can evolve."
            </blockquote>
          </section>

          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3 text-foreground">
              <Zap className="h-8 w-8 text-primary" />
              Upcoming: CMPSBL Defense Module
            </h2>
            
            <div className="bg-card border border-primary/30 rounded-lg p-8">
              <div className="flex items-center gap-2 text-primary mb-4">
                <Zap className="h-5 w-5" />
                <span className="font-medium">Pending WordPress.org Approval</span>
              </div>
              <p className="text-muted-foreground leading-relaxed mb-6">
                The CMPSBL Defense Module is our AI-powered WordPress security plugin focused on behavioral bot detection. 
                Currently pending WordPress.org review.
              </p>
              <ul className="space-y-2 text-muted-foreground mb-6">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  AI-powered behavioral analysis
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Device fingerprinting
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Adaptive challenge system
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Free tier planned
                </li>
              </ul>
              <p className="text-sm text-muted-foreground italic">
                Join the waitlist at <Link to="/bot-sniper" className="text-primary hover:underline">cmpsbl.com/bot-sniper</Link> to be notified when available.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-card border border-border rounded-lg p-8 text-center">
            <h3 className="text-xl font-bold mb-4 text-foreground">Continue Reading</h3>
            <p className="text-muted-foreground mb-6">
              Learn more about WordPress bot protection strategies.
            </p>
            <Link 
              to="/blog/wordpress-bot-defense" 
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              WordPress Bot Defense Guide →
            </Link>
          </section>

        </div>
      </article>

      <EnhancedFooter />
    </div>
  );
};

export default TopSecurityPlugins2025;