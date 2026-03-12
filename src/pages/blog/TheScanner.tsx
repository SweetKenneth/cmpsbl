/**
 * Chapter 39: The Scanner — March 2026
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/defense-ai-security.jpg";

const SLUG = "the-scanner";

export default function TheScanner() {
  return (
    <BlogArticleLayout slug={SLUG} title="The Scanner" subtitle="Automated security and accessibility auditing for every website" date="March 1, 2026" readTime="15 min read" heroImage={heroImg} heroAlt="The Scanner — automated security and accessibility auditing" chapter={39} head={<><SEO title="The Scanner — Automated Security & Accessibility Auditing" description="The Scanner runs automated security and accessibility audits and generates actionable fix reports." type="article" image={heroImg} publishedTime="2026-03-01" keywords={["security scanner", "accessibility scanner", "automated auditing"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-tools" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "The Scanner", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="The Scanner" description="Automated security and accessibility auditing." slug={SLUG} datePublished="2026-03-01" imageUrl={heroImg} keywords={["scanner", "security", "accessibility"]} /></>}>
      <p className="text-lg leading-relaxed">Most websites have security vulnerabilities and accessibility failures they don't know about. Professional audits cost thousands. Automated tools are shallow. We built the Scanner to bridge that gap.</p>
      <p>The Scanner wasn't planned. It emerged from a customer demo. We were showing a prospect how DEFENSE and INCLUSIVE work, and we scanned their website live. The prospect saw their security score and accessibility violations displayed in real-time and said, "Can I just have this? Just the scan part, without the API subscription?" We realized the scan itself was a product — and potentially the best introduction to the substrate's capabilities.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Two Scanners, One System</h2>
      <p>The Scanner combines <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> security analysis with <Link to="/blog/accessibility-is-infrastructure" className="text-primary hover:underline">INCLUSIVE</Link> accessibility auditing. One scan, two reports. Security gets a vulnerability assessment with severity scoring. Accessibility gets WCAG compliance status with specific remediation guidance.</p>
      <p>The combined process is more than the sum of its parts. Some vulnerabilities are also accessibility issues — a form without CSRF protection is both a security risk and potentially inaccessible if the error handling fails silently. The Scanner identifies these overlaps and presents them as unified findings rather than duplicates. In our analysis, about 12% of findings have both security and accessibility dimensions. Presenting them together gives site owners a more accurate picture of their actual risk surface.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Beyond Detection</h2>
      <p>Most scanners tell you what's wrong. Ours tells you how to fix it. Each finding includes a priority level, an effort estimate, and generated fix code. <Link to="/blog/from-thought-to-artifact" className="text-primary hover:underline">FORGE</Link> produces the remediation discoveries. <Link to="/blog/trust-but-verify" className="text-primary hover:underline">PROOF</Link> validates the fixes before suggesting them.</p>
      <p>The fix generation process is sophisticated. For security findings, FORGE generates platform-specific fixes — a WordPress vulnerability gets a WordPress-specific patch, not generic guidance. For accessibility findings, FORGE generates the exact HTML/CSS/ARIA changes needed, targeted to the specific CMS or framework detected on the site. Fix accuracy (the percentage of generated fixes that resolve the finding without side effects) is currently 84% for security and 91% for accessibility. We're working to close the gap on security fix accuracy, which is lower because security patches have more potential for unintended interactions.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Scoring Model</h2>
      <p>Every scan produces a composite score from 0-100. The score weights findings by severity, adjusts for site complexity, and benchmarks against industry averages. A score of 80+ is good. Below 50 is concerning. Below 30 needs immediate attention. The score is designed to be actionable — it tells you not just where you are but how much effort is needed to improve. We show estimated effort (in developer hours) to reach each 10-point improvement threshold.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Free Tier</h2>
      <p>The Scanner is free for basic scans. We made this decision deliberately. Security and accessibility shouldn't be gated by budget. The free tier runs the same analysis as the paid tier — it just limits scan frequency and discovery generation. This aligns with our <Link to="/blog/open-standards" className="text-primary hover:underline">open standards</Link> philosophy: some things should be accessible to everyone.</p>
      <p>The free tier has strategic value beyond altruism. It's our primary acquisition channel. Users scan their site for free, see the findings, and realize they need the remediation discoveries. That conversion path — free scan to paid fixes — has a 23% conversion rate, which is 4x higher than our next best acquisition channel. The Scanner pays for itself through downstream conversions within two weeks of each new user's first scan.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Shareable Results</h2>
      <p>Scan results are shareable via unique URLs. This was added after we noticed users screenshotting their scores and posting them on social media. Now they share direct links that show live, interactive results — a much better experience than screenshots and a built-in referral mechanism. Every shared result page includes a "Scan your own site" CTA, which drives 15% of our new scans.</p>
      <p>The Scanner is the most tangible thing the substrate produces. Enter a URL, get a report. No API keys, no onboarding, no commitment. It's how most new users discover CMPSBL — and how we demonstrate that cognitive infrastructure produces real, measurable value.</p>
    </BlogArticleLayout>
  );
}
