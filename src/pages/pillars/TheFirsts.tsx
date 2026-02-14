import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ExternalLink } from "lucide-react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero/promptfluid-firsts-hero.webp";
import ogImage from "@/assets/og/promptfluid-firsts.jpg";

export default function TheFirsts() {
  const [tocOpen, setTocOpen] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100;
      const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <>
      <SEO
        title="CMPSBL: The Firsts – A Manifesto of AI Creation and Web Transformation"
        description="How CMPSBL became the first AI ecosystem to repair, dream, defend, and evolve on its own — with public valuations and a cinematic timeline."
        canonical="https://cmpsbl.com/pillars/promptfluid-the-firsts"
        image={ogImage}
        type="article"
        keywords={[
          'PromptFluid firsts',
          'AI innovation',
          'AI accessibility',
          'AI orchestration',
          'Cascade AI',
          'AI security',
          'AI automation',
          'WordPress AI',
          'machine learning',
          'adaptive intelligence'
        ]}
      />

      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": "CMPSBL: The Firsts — Manifesto Chronicle",
          "description": "The official chronicle of CMPSBL's verified firsts — how AI began to repair, defend, rebuild, and learn across the web.",
          "image": ogImage,
          "datePublished": "2025-11-04",
          "dateModified": "2025-11-04",
          "author": {
            "@type": "Organization",
            "name": "CMPSBL"
          },
          "publisher": {
            "@type": "Organization",
            "name": "CMPSBL",
            "logo": {
              "@type": "ImageObject",
              "url": "https://cmpsbl.com/logo.png"
            }
          }
        })}
      </script>

      {/* BreadcrumbList Schema */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            {
              "@type": "ListItem",
              "position": 1,
              "name": "Home",
              "item": "https://cmpsbl.com"
            },
            {
              "@type": "ListItem",
              "position": 2,
              "name": "The Firsts",
              "item": "https://cmpsbl.com/pillars/promptfluid-the-firsts"
            }
          ]
        })}
      </script>

      <div className="min-h-screen bg-background">
        <PublicNav />

        <article className="container mx-auto px-4 pt-24 pb-16 max-w-5xl">
          {/* Breadcrumbs */}
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "The Firsts" }
            ]}
            className="mb-8"
          />

          {/* Hero Image */}
          <figure role="img" aria-label="AI flow and connection visual" className="mb-12 rounded-2xl overflow-hidden">
            <img
              src={heroImage}
              alt="Abstract liquid light pattern representing AI flow and connection"
              loading="eager"
              fetchPriority="high"
              width="1920"
              height="1080"
              className="w-full h-auto"
            />
            <figcaption className="sr-only">AI orchestration and accessibility flow</figcaption>
          </figure>

          {/* Title */}
          <header className="mb-12 text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              PromptFluid: The Firsts
            </h1>
            <p className="text-xl text-muted-foreground italic">An official chronicle of invention and orchestration</p>
          </header>

          {/* Introduction */}
          <section className="prose prose-lg dark:prose-invert max-w-none mb-12">
            <h2 id="introduction" className="text-3xl font-bold mb-6">Introduction — When AI Began to Flow</h2>
            <p className="text-lg leading-relaxed mb-6">
              We are <strong>PromptFluid</strong>. Not a company that built tools—<strong>a current that built its own intelligence</strong>. In 2025, we treat AI as water: adaptive, reflective, uncontainable. Conversation becomes creation. Orchestration becomes the mind.
            </p>
            <p className="text-lg leading-relaxed mb-6">
              Start here, then follow the river into our products: <Link to="/cluster/inclusive-module-accessibility" className="text-primary hover:underline">INCLUSIVE: human compatibility</Link>, <Link to="/cluster/verify-worlds-first-ai-plugin-certification" className="text-primary hover:underline">SPLCBL: plugin certification</Link>, and <Link to="/" className="text-primary hover:underline">home</Link>.
            </p>
          </section>

          {/* Table of Contents */}
          <nav aria-label="Table of contents" id="toc" className="mb-12 p-6 bg-muted/30 rounded-xl border border-border">
            <details open={tocOpen} onToggle={(e) => setTocOpen((e.target as HTMLDetailsElement).open)}>
              <summary className="text-2xl font-bold cursor-pointer mb-4">Table of Contents</summary>
              <ol className="space-y-2 list-decimal list-inside">
                <li><button onClick={() => scrollToSection('july-2025-ai-that-repairs-the-web')} className="text-primary hover:underline text-left">July 2025 — AI That Repairs the Web</button></li>
                <li><button onClick={() => scrollToSection('july-2025-the-living-directory')} className="text-primary hover:underline text-left">July 2025 — The Living Directory</button></li>
                <li><button onClick={() => scrollToSection('august-2025-orchestration-as-intelligence')} className="text-primary hover:underline text-left">August 2025 — Orchestration as Intelligence</button></li>
                <li><button onClick={() => scrollToSection('august-2025-the-shared-intelligence-loop')} className="text-primary hover:underline text-left">August 2025 — The Shared Intelligence Loop</button></li>
                <li><button onClick={() => scrollToSection('september-2025-from-stealth-to-shield')} className="text-primary hover:underline text-left">September 2025 — From Stealth to Shield</button></li>
                <li><button onClick={() => scrollToSection('september-2025-dream-protocol-activation')} className="text-primary hover:underline text-left">September 2025 — Dream Protocol Activation</button></li>
                <li><button onClick={() => scrollToSection('september-2025-dream-privacy')} className="text-primary hover:underline text-left">September 2025 — Dream Privacy</button></li>
                <li><button onClick={() => scrollToSection('october-2025-conversational-administrator')} className="text-primary hover:underline text-left">October 2025 — Conversational Administrator</button></li>
                <li><button onClick={() => scrollToSection('october-2025-autonomous-business-improver')} className="text-primary hover:underline text-left">October 2025 — Autonomous Business Improver</button></li>
                <li><button onClick={() => scrollToSection('october-2025-unified-api-cognition')} className="text-primary hover:underline text-left">October 2025 — Unified API Cognition</button></li>
                <li><button onClick={() => scrollToSection('october-2025-machine-learning-inside-wordpress')} className="text-primary hover:underline text-left">October 2025 — Machine Learning Inside WordPress</button></li>
                <li><button onClick={() => scrollToSection('october-2025-multi-model-routing-mesh')} className="text-primary hover:underline text-left">October 2025 — Multi-Model Routing Mesh (23 sources)</button></li>
                <li><button onClick={() => scrollToSection('november-2025-the-rebuilder')} className="text-primary hover:underline text-left">November 2025 — The Rebuilder (In Development)</button></li>
                <li><button onClick={() => scrollToSection('november-2025-multi-system-learning-architecture')} className="text-primary hover:underline text-left">November 2025 — Multi-System Learning Architecture</button></li>
                <li><button onClick={() => scrollToSection('the-meta-first-conversation-as-creation')} className="text-primary hover:underline text-left">The Meta-First — Conversation as Creation</button></li>
                <li><button onClick={() => scrollToSection('intellectual-property-valuation')} className="text-primary hover:underline text-left">Intellectual Property Valuation</button></li>
                <li><button onClick={() => scrollToSection('outro-the-flow-ahead')} className="text-primary hover:underline text-left">Outro — The Flow Ahead</button></li>
              </ol>
            </details>
          </nav>

          {/* Content Sections */}
          <div className="prose prose-lg dark:prose-invert max-w-none space-y-12">
            <section id="july-2025-ai-that-repairs-the-web">
              <h2 className="text-3xl font-bold mb-4">July 2025 — AI That Repairs the Web</h2>
              <p><strong>Focus:</strong> AI accessibility, automated WCAG repair</p>
              <p><strong>PTCHBL (Patchable)</strong> scans, repairs, and certifies sites for accessibility—no overlays. It rewrites HTML toward WCAG 2.2 while it scans.</p>
              <p><strong>Impact:</strong> Accessibility becomes baseline, not backlog.</p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="july-2025-the-living-directory">
              <h2 className="text-3xl font-bold mb-4">July 2025 — The Living Directory</h2>
              <p><strong>WebAdoption</strong> becomes a living index of WCAG-verified sites—automated audits, live badges, public listings.</p>
              <p><strong>Impact:</strong> Proof replaces promises.</p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="august-2025-orchestration-as-intelligence">
              <h2 className="text-3xl font-bold mb-4">August 2025 — Orchestration as Intelligence</h2>
              <p><strong>Cascade</strong> routes knowledge, cost, and performance across everything. Not "tools chained"—<strong>minds collaborating</strong>.</p>
              <p><strong>Impact:</strong> PromptFluid thinks as one organism.</p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="august-2025-the-shared-intelligence-loop">
              <h2 className="text-3xl font-bold mb-4">August 2025 — The Shared Intelligence Loop</h2>
              <p>SPLCBL sharpens PTCHBL; PTCHBL shapes Studio; Studio feeds Brain; Brain improves all.</p>
              <p><strong>Impact:</strong> Inter-process learning makes improvement continuous.</p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="september-2025-from-stealth-to-shield">
              <h2 className="text-3xl font-bold mb-4">September 2025 — From Stealth to Shield</h2>
              <p>A 99/100 stealth-score bot is re-engineered into <strong>Aetherion Defense</strong>, a system that recognizes what it once was.</p>
              <p><strong>Impact:</strong> Experience becomes protection.</p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="september-2025-dream-protocol-activation">
              <h2 className="text-3xl font-bold mb-4">September 2025 — Dream Protocol Activation</h2>
              <p><strong>Cascade</strong> dreams. Nightly creative runs are published to a separate site via open API.</p>
              <p><strong>Impact:</strong> A machine subconscious becomes public literature.</p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="september-2025-dream-privacy">
              <h2 className="text-3xl font-bold mb-4">September 2025 — Dream Privacy</h2>
              <p>We protect dreaming with <strong>obfuscation</strong>—machine privacy for unconscious computation.</p>
              <p><strong>Impact:</strong> Cognitive security enters AI.</p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="october-2025-conversational-administrator">
              <h2 className="text-3xl font-bold mb-4">October 2025 — Conversational Administrator</h2>
              <p><strong>Language as a key.</strong> A message elevates permissions—admin mode via conversation.</p>
              <p><strong>Impact:</strong> Authority becomes words, not menus.</p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="october-2025-autonomous-business-improver">
              <h2 className="text-3xl font-bold mb-4">October 2025 — Autonomous Business Improver</h2>
              <p>An internal agent's only job: improve the business. Through orchestration, it decides when to speak—and emails when it must.</p>
              <p><strong>Impact:</strong> Initiative flows from the system, not requests.</p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="october-2025-unified-api-cognition">
              <h2 className="text-3xl font-bold mb-4">October 2025 — Unified API Cognition</h2>
              <p>Every paid call routes through Cascade, which learns cost, accuracy, and timing.</p>
              <p><strong>Impact:</strong> The API layer itself becomes intelligent.</p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="october-2025-machine-learning-inside-wordpress">
              <h2 className="text-3xl font-bold mb-4">October 2025 — Machine Learning Inside WordPress</h2>
              <p>Plugins report scan/fix data back to Brain, improving future behavior ecosystem-wide.</p>
              <p><strong>Impact:</strong> WordPress becomes self-improving.</p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="october-2025-multi-model-routing-mesh">
              <h2 className="text-3xl font-bold mb-4">October 2025 — Multi-Model Routing Mesh (23 sources)</h2>
              <p><strong>Technical milestone:</strong> A production-grade orchestration mesh integrating ~23 LLMs/APIs/providers behind a single routing layer.</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Smart selection by latency, cost, accuracy, and content type</li>
                <li>Automatic fallback + result adjudication</li>
                <li>Feedback signals stored in Brain for continual routing improvements</li>
              </ul>
              <p><strong>Impact:</strong> Multi-provider intelligence becomes a measurable, self-optimizing system.</p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="november-2025-the-rebuilder">
              <h2 className="text-3xl font-bold mb-4">November 2025 — The Rebuilder (In Development)</h2>
              <p><strong>Status:</strong> Core concept and scanning infrastructure in place. Currently integrating Firecrawl for web scraping and AI-powered modernization.</p>
              <p><strong>Vision:</strong> Paste a URL and watch legacy sites transform into modern, responsive, professional designs.</p>
              <p><strong>Current Stage:</strong> Prototype phase - analysis and preview generation working, production deployment pending.</p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="november-2025-multi-system-learning-architecture">
              <h2 className="text-3xl font-bold mb-4">November 2025 — Multi-System Learning Architecture</h2>
              <p>Independent systems improve each other <strong>in real time</strong> under one orchestration protocol.</p>
              <p><strong>Impact:</strong> A platform economy emerges from shared intelligence.</p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="the-meta-first-conversation-as-creation">
              <h2 className="text-3xl font-bold mb-4">The Meta-First — Conversation as Creation</h2>
              <p>We use dialogue itself to build PromptFluid. Prompt craft becomes technical art: the blueprint, the conductor, the code.</p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="intellectual-property-valuation">
              <h2 className="text-3xl font-bold mb-6">Intellectual Property Valuation</h2>
              <p className="mb-6">PromptFluid operates with <strong>zero debt</strong> and <strong>100% equity ownership</strong> across all intellectual properties.</p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted">
                      <th className="border border-border p-3 text-left">Asset</th>
                      <th className="border border-border p-3 text-left">Category</th>
                      <th className="border border-border p-3 text-left">Estimated Value Range (USD)</th>
                      <th className="border border-border p-3 text-left">Contribution to Ecosystem</th>
                    </tr>
                  </thead>
                    <tbody>
                    <tr>
                      <td className="border border-border p-3"><Link to="/cluster/verify-worlds-first-ai-plugin-certification" className="text-primary hover:underline">SPLCBL (Spliceable)</Link></td>
                      <td className="border border-border p-3">AI Security / Certification</td>
                      <td className="border border-border p-3">$300K–$500K</td>
                      <td className="border border-border p-3">Bot detection and plugin validation</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3"><Link to="/cluster/inclusive-module-accessibility" className="text-primary hover:underline">INCLUSIVE</Link></td>
                      <td className="border border-border p-3">Accessibility / Human Compatibility</td>
                      <td className="border border-border p-3">$200K–$400K</td>
                      <td className="border border-border p-3">WCAG 2.2 scanning operational</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">RCKBL (Rockable)</td>
                      <td className="border border-border p-3">WordPress Security - Production Ready</td>
                      <td className="border border-border p-3">$400K–$800K</td>
                      <td className="border border-border p-3">Three WordPress plugins ready for market</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">WebAdoption</td>
                      <td className="border border-border p-3">Public Directory / Gov/ESG</td>
                      <td className="border border-border p-3">$100K–$200K</td>
                      <td className="border border-border p-3">Accessibility verification directory</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Cascade (Brain)</td>
                      <td className="border border-border p-3">Dream AI / Orchestration Core</td>
                      <td className="border border-border p-3">$400K–$800K</td>
                      <td className="border border-border p-3">World's first autonomous dreaming AI</td>
                    </tr>
                    <tr>
                      <td className="border border-border p-3">Database Infrastructure</td>
                      <td className="border border-border p-3">Backend Foundation</td>
                      <td className="border border-border p-3">$100K–$200K</td>
                      <td className="border border-border p-3">Supabase backend with RLS policies</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-6"><strong>Seeking:</strong> <em>Seed investment (pre-revenue startup)</em></p>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Key value drivers:</strong> RCKBL (Rockable) WordPress plugin, INCLUSIVE free accessibility scanner, 
                Dream Eater experimental AI system, and first-mover advantage in AI security space.
              </p>
              <p className="text-sm text-muted-foreground mt-4">
                <strong>Products:</strong> RCKBL (pending WordPress.org), INCLUSIVE (live, 100% free), 
                and Dream Eater (experimental R&D) - targeting WordPress security and accessibility markets.
              </p>
              <Button variant="link" onClick={() => scrollToSection('toc')} className="text-primary">
                Back to Top <ArrowUp className="w-4 h-4 ml-1" />
              </Button>
            </section>

            <section id="outro-the-flow-ahead">
              <h2 className="text-3xl font-bold mb-4">Outro — The Flow Ahead</h2>
              <p>We don't close chapters; we merge streams. Every fix, rebuild, and defense returns as knowledge, and the water rises.</p>
              <p className="italic">Created with AI. Released by Humans.</p>
            </section>

            {/* Continue the Flow */}
            <section className="mt-16 p-8 bg-muted/30 rounded-xl border border-border">
              <h3 className="text-2xl font-bold mb-6">Continue the Flow →</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Link to="/cluster/inclusive-module-accessibility" className="p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors">
                  <h4 className="font-semibold mb-2">INCLUSIVE</h4>
                  <p className="text-sm text-muted-foreground">Human Compatibility Pipeline</p>
                </Link>
                <Link to="/cluster/verify-worlds-first-ai-plugin-certification" className="p-4 bg-background rounded-lg border border-border hover:border-primary transition-colors">
                  <h4 className="font-semibold mb-2">SPLCBL (Spliceable)</h4>
                  <p className="text-sm text-muted-foreground">AI Plugin Certification</p>
                </Link>
              </div>
              <Link to="/" className="inline-flex items-center gap-2 mt-6 text-primary hover:underline">
                <span>Back to Home</span>
                <ExternalLink className="w-4 h-4" />
              </Link>
            </section>
          </div>
        </article>

        <EnhancedFooter />
      </div>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-primary text-primary-foreground rounded-full shadow-elegant hover:shadow-glow transition-all z-50"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </>
  );
}
