/**
 * Chapter 30: Packing Intelligence — November 2025
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/clockless-account-setup-artifact-packs.jpg";

const SLUG = "packing-intelligence";

export default function PackingIntelligence() {
  return (
    <BlogArticleLayout
      slug={SLUG}
      title="Packing Intelligence"
      subtitle="Bundled AI capabilities in themed collections"
      date="November 5, 2025"
      readTime="13 min read"
      heroImage={heroImg}
      heroAlt="Capability Packs bundling substrate capabilities"
      chapter={30}
      head={
        <>
          <SEO title="Packing Intelligence — Capability Packs" description="Packs bundle related capabilities into themed collections — curated, priced, and instantly deployable." type="article" image={heroImg} publishedTime="2025-11-05" keywords={["capability packs", "bundled AI", "substrate bundles"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-platform" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Packing Intelligence", url: `https://cmpsbl.com/blog/${SLUG}` }]} />
          <BlogArticleJsonLd title="Packing Intelligence — Capability Packs" description="Bundled AI capabilities in themed collections." slug={SLUG} datePublished="2025-11-05" imageUrl={heroImg} keywords={["packs", "bundles", "capabilities"]} />
        </>
      }
    >
      <p className="text-lg leading-relaxed">Individual capabilities solved individual problems. But customers didn't want to assemble solutions from components — they wanted solutions. "I need a complete security posture" not "I need a bot detector, a vulnerability scanner, and an audit logger."</p>

      <p>We were watching the same pattern repeat across customer segments. Security teams deployed 4-6 related capabilities. Content teams deployed 3-5. Data teams deployed 5-8. Each time, they had to discover the capabilities individually, verify compatibility between them, and configure integrations manually. It was the <Link to="/blog/the-marketplace" className="text-primary hover:underline">Store</Link> working against itself — offering everything à la carte when most customers wanted the tasting menu.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Curated Bundles</h2>
      <p>Packs are curated collections of related capabilities. The Security Pack includes <Link to="/blog/when-bots-found-us-first" className="text-primary hover:underline">DEFENSE</Link> configurations, vulnerability scanning tools, and <Link to="/blog/the-governance-question" className="text-primary hover:underline">AUDIT</Link> compliance reports. The Content Pack includes research tools, writing agents, and editorial workflows. Each Pack is tested as a complete solution, not a grab bag.</p>

      <p>"Tested as a complete solution" means something specific. Every Pack goes through integration testing where all included capabilities are deployed together and exercised with realistic workloads. We verify that data flows correctly between capabilities, that there are no conflicting configurations, and that the combined output exceeds what any individual capability produces. A Pack that doesn't deliver more value than the sum of its parts doesn't ship.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Activation Slots</h2>
      <p>Packs don't just include capabilities — they include activation slots. A slot lets you deploy the Pack's capabilities into your own substrate environment. Slot capacity determines how many concurrent operations the Pack can handle. This solved the "I bought it but how do I run it" problem.</p>

      <p>The slot model was inspired by how enterprise software licensing works, but adapted for AI workloads. Each slot includes a compute budget, a memory allocation, and a priority level. The Security Pack's basic plan includes two slots — enough for daily scans and on-demand audits. The enterprise plan includes ten slots with priority routing — enough for continuous monitoring across large infrastructure. Customers scale by adding slots, not by reconfiguring their deployment.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Pack Economics</h2>
      <p>Packs are cheaper than buying components individually — typically 30-40% savings. But the real value is in integration. Every artifact in a Pack is pre-configured to work with every other artifact in the same Pack. No glue code, no integration headaches.</p>

      <p>We ran the numbers on integration time savings. A customer deploying the Security Pack individually spent an average of 18 hours configuring artifact integrations, testing data flows, and resolving compatibility issues. The Pack deployment takes 12 minutes. At typical consulting rates, the integration time savings alone exceed the Pack's annual cost. The 30-40% price discount is actually secondary to the time savings — but it's what customers ask about first.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Cross-Pack Compatibility</h2>
      <p>Packs are designed to work together. The Security Pack and the Compliance Pack share data through standardized interfaces. The Content Pack feeds the Marketing Pack's distribution flow. We publish a compatibility matrix showing which Packs integrate natively and which require additional configuration. Over 60% of enterprise customers deploy two or more Packs, and cross-Pack data flows are the most frequently cited value driver in customer feedback.</p>

      <p>Packs were the product that enterprise customers actually wanted to buy. Not infrastructure, not APIs, not agents — solutions in a box. The <Link to="/blog/the-marketplace" className="text-primary hover:underline">Store</Link> became a Pack-first experience, and our conversion rate doubled within a month of launching the Pack format.</p>
    </BlogArticleLayout>
  );
}
