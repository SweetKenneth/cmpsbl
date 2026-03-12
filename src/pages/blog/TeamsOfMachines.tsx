/**
 * Chapter 26: Teams of Machines — August 2025
 */
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { BlogArticleJsonLd } from "@/components/blog/BlogArticleJsonLd";
import { BlogArticleLayout } from "@/components/blog/BlogArticleLayout";
import heroImg from "@/assets/blog/ai-business-operations-2025.jpg";

const SLUG = "teams-of-machines";

export default function TeamsOfMachines() {
  return (
    <BlogArticleLayout slug={SLUG} title="Teams of Machines" subtitle="Multi-agent orchestration with the Agency system" date="August 12, 2025" readTime="19 min read" heroImage={heroImg} heroAlt="Agency system orchestrating agent teams" chapter={26} head={<><SEO title="Teams of Machines — The Agency System" description="One agent isn't enough for real work. The Agency system orchestrates teams of cognitives with leaders, specialists, and shared learning." type="article" image={heroImg} publishedTime="2025-08-12" keywords={["AI agency system", "multi-agent orchestration", "agent teams"]} canonical={`https://cmpsbl.com/blog/${SLUG}`} topicCluster="substrate-agents" breadcrumbs={[{ name: "Home", url: "https://cmpsbl.com" }, { name: "Blog", url: "https://cmpsbl.com/blog" }, { name: "Teams of Machines", url: `https://cmpsbl.com/blog/${SLUG}` }]} /><BlogArticleJsonLd title="Teams of Machines — The Agency System" description="Multi-agent orchestration with leaders, specialists, and shared learning." slug={SLUG} datePublished="2025-08-12" imageUrl={heroImg} keywords={["agency", "multi-agent", "orchestration"]} /></>}>
      <p className="text-lg leading-relaxed">A single <Link to="/blog/the-composable-agent" className="text-primary hover:underline">Cognitive</Link> can handle a task. But real business operations aren't single tasks — they're workflows requiring multiple specialists working in coordination.</p>
      <p>We realized this when an early customer tried to automate their weekly competitive intelligence process. It required web scraping, data normalization, trend analysis, competitor profiling, report writing, and executive summary generation. One Cognitive couldn't do all of this well — the skill weights needed for web scraping are almost opposite to those needed for executive writing. They needed a team.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">The Agency Model</h2>
      <p>An Agency is a team of Cognitives. Every Agency has a leader Cognitive that coordinates work, delegates to specialists, and synthesizes results. A market research Agency might have a web scraper, a data analyst, a report writer, and a quality reviewer — each a Cognitive with different skill weights.</p>
      <p>The leader role is critical. Without it, multi-agent systems devolve into cacophony — agents duplicating work, contradicting each other, or deadlocking on shared resources. The leader Cognitive has a specialized skill: coordination. It breaks incoming work into delegatable tasks, assigns them based on specialist capabilities, monitors progress, handles failures (reassigning work when a specialist gets stuck), and synthesizes individual outputs into a cohesive deliverable. We tested leaderless Agencies early on. They worked for simple workflows but collapsed on anything requiring more than three sequential steps.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Shared Learning</h2>
      <p>The breakthrough was shared learning. When one Cognitive in an Agency learns something — a new heuristic, a better approach, a discovered edge case — that knowledge propagates to the whole team through <Link to="/blog/what-if-software-could-dream" className="text-primary hover:underline">DREAM's consolidation</Link>. The team gets collectively smarter, not just individually.</p>
      <p>Shared learning operates through what we call "heuristic propagation." When the data analyst Cognitive discovers that a particular data source is unreliable, it records this as a heuristic. During DREAM consolidation, this heuristic is evaluated for team-wide relevance. If it applies to other specialists (the web scraper should also know about unreliable sources), it propagates. If it's specialist-specific, it stays local. This selective propagation prevents noise — not every insight is relevant to every team member, just like in human teams.</p>
      <p>The compound effect is remarkable. A fresh Agency starts with competency scores around 40 across its members. After three months of operation, the team-wide average typically reaches 72 — higher than any individual Cognitive would reach in isolation. The shared learning effect accounts for about 40% of that improvement. Cognitives in teams learn faster than Cognitives working alone because they benefit from each other's experience.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Economics</h2>
      <p>Every Agency tracks its own economics. Task cost, compute time, ROI per operation. We built the economics layer because we needed to answer a simple question: "Is this Agency saving money compared to doing it manually?" If the answer is no, something is wrong with the configuration.</p>
      <p>The ROI calculation factors in everything: model inference costs, compute time, error rates (and the cost of errors), human review time, and output quality scores weighted by business value. We found that well-configured Agencies typically hit positive ROI within their first week of operation. Poorly configured ones never do — and the economics dashboard makes that visible immediately rather than letting them burn budget for months before someone notices.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Templates</h2>
      <p>Configuring Agencies from scratch is complex. Agency Templates are pre-configured team compositions for common use cases — content creation, market research, security auditing, data enrichment. Deploy a template, customize the specifics, and you have a working AI team in minutes.</p>
      <p>Templates encode best practices. Our security auditing template, for example, includes five specialists (scanner, analyzer, reporter, compliance checker, reviewer) with skill weights tuned from thousands of real audits. The content creation template has four specialists (researcher, writer, editor, SEO optimizer) with personality profiles calibrated for different content types. Templates aren't just convenient — they perform 30-40% better out of the box than manually configured Agencies because they embed operational knowledge from across our customer base.</p>

      <h2 className="text-2xl font-bold text-foreground mt-8">Scheduled Operations</h2>
      <p>Real business operations aren't one-shots — they're recurring. The Agency system supports scheduled tasks: daily competitive monitoring, weekly market reports, monthly compliance audits. Each scheduled execution benefits from everything the Agency learned in previous runs. A weekly market report Agency doesn't start from scratch each Monday — it remembers last week's analysis, detects changes, and focuses its compute on what's actually different. This makes recurring tasks progressively cheaper and better over time.</p>
      <p>Agencies were where the substrate stopped being infrastructure and started being a product. Not "here are nodes" but "here is a team that does your job." The discoveries those teams produce needed somewhere to go — which led to <Link to="/blog/from-thought-to-artifact" className="text-primary hover:underline">FORGE</Link>.</p>
    </BlogArticleLayout>
  );
}
