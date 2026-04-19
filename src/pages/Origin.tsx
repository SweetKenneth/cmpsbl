/**
 * /origin — The CMPSBL Origin Story
 *
 * Public-readable. Tells the truth of how the substrate was born:
 * Lovable credits → broken substrate ceiling → 2,500 users in a day →
 * all-inclusive humans story → CMPSBL.
 *
 * This page is the "why" — surfaced for those who follow the trail back.
 * It is the door from CMPSBL out into the XCTBL universe, and the door
 * from the XCTBL universe back into CMPSBL.
 */

import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const XCTBL_SITES = [
  { name: "XCTBL³ Space", url: "https://xctbl.com", role: "The hub" },
  { name: "RCRDBL", url: "https://rcrdbl.com", role: "Records & Retention" },
  { name: "RNDRBL", url: "https://rndrbl.com", role: "Crew Log" },
  { name: "PTCHBL", url: "https://ptchbl.com", role: "Mars Settlement / Dream Eater" },
  { name: "RCKBL", url: "https://rckbl.com", role: "Dream Eater Companion" },
  { name: "RSTRBL", url: "https://rstrbl.com", role: "Project Sanctuary" },
  { name: "RSLVBL", url: "https://rslvbl.com", role: "Transmissions Hub" },
  { name: "CRCKBL", url: "https://crckbl.com", role: "Domain Miner Engine" },
  { name: "Signal.XCTBL", url: "https://signal.xctbl.com", role: "Quantum Star Watch" },
];

export default function Origin() {
  return (
    <>
      <Helmet>
        <title>Origin — How CMPSBL Was Born | CMPSBL®</title>
        <meta
          name="description"
          content="The true origin story of the CMPSBL substrate: broken ceilings, 2,500 users in a day, and a sci-fi universe written for all-inclusive humans."
        />
        <link rel="canonical" href="https://cmpsbl.com/origin" />
        <meta property="og:title" content="Origin — How CMPSBL Was Born" />
        <meta
          property="og:description"
          content="A solo founder broke a platform's substrate. The repair gave room for real projects. This is what was built in the wait."
        />
      </Helmet>

      <article className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-3xl px-6 py-20 md:py-32">
          <header className="mb-16 text-center">
            <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-muted-foreground">
              Origin · 2024 → 2026
            </p>
            <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
              How CMPSBL Was Born
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              The truth, told once, so the trail back is always there.
            </p>
          </header>

          <section className="prose prose-invert max-w-none space-y-8 text-base leading-relaxed md:text-lg">
            <p>
              CMPSBL did not begin as a substrate. It began as a wait.
            </p>

            <p>
              In late 2024, a solo founder pushed a Lovable project past the
              platform's edge-function ceiling — hard enough that it broke. The
              fix took months. The platform sent an apology. They credited the
              account with enough to keep building. And in the silence between
              the break and the repair, a different project started.
            </p>

            <p>
              That project was a sci-fi universe about{" "}
              <strong>all-inclusive humans</strong> — disability reframed not as
              limitation but as a quietly powerful, non-blocking superpower.
              Settlers on Mars. A Dream Eater that took only what you could
              afford to lose. A scanner named Vel'kora. Crews that no storm
              could break. A whole world, written by hand, while the substrate
              underneath came back online.
            </p>

            <p>
              When Lovable's ceiling was finally raised, the room it opened up
              wasn't just for the founder — it was for{" "}
              <em>real projects</em>. Not 3-day SaaS apps wrapping a model. Real
              infrastructure. The kind of thing that took 200,000+ lines and
              100+ memory chains and a 40-primitive topology to hold together.
            </p>

            <p>
              The first attempt at building on that opened ceiling was posted to
              Hacker News. It hit 2,500 users in a single day. Lovable sent an
              email. That year, the project landed in the top 1% of Lovable
              builders by traffic.
            </p>

            <p>
              That project became <strong>CMPSBL</strong> — the Cognitive
              Orchestration Substrate. Forty primitives. Twelve organs, twelve
              layers, eight engines, eight agents. Deterministic governance,
              zero external AI dependencies in the core, every export a
              standalone artifact that reveals nothing about how it was
              discovered. Built by one person. Founded on the conviction that
              the people the world calls "disabled" are quietly the most
              powerful builders alive — and that the tools deserve to match.
            </p>

            <p>
              The sci-fi universe didn't go away. It became a living world
              across nine connected sites, each with its own narrative role,
              each running real software underneath the lore. Today it sits
              quietly at the edge of CMPSBL — a parallel proof that the patterns
              ship at scale, and a future home for the developers who want to
              learn the substrate by exploring a world built with it.
            </p>

            <p className="text-xl font-medium text-foreground">
              That's the origin. Broken ceiling. Long wait. A universe written
              in the dark. A substrate built when the lights came back on.
            </p>
          </section>

          <section className="mt-20 border-t border-border pt-12">
            <h2 className="mb-6 text-2xl font-semibold tracking-tight">
              The Universe
            </h2>
            <p className="mb-8 text-muted-foreground">
              Nine living sites. One shared world. Each one runs real software
              wrapped in narrative. Visit any of them when you're ready.
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {XCTBL_SITES.map((site) => (
                <a
                  key={site.url}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between rounded-md border border-border bg-card/40 px-4 py-3 transition hover:border-primary hover:bg-card"
                >
                  <span>
                    <span className="block font-mono text-sm font-semibold">
                      {site.name}
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {site.role}
                    </span>
                  </span>
                  <span
                    aria-hidden
                    className="font-mono text-xs text-muted-foreground transition group-hover:text-primary"
                  >
                    ↗
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted-foreground">
              Each site is its own deployment with its own identity. They are
              connected by story, not by session. Sign in once where you are.
            </p>
          </section>

          <footer className="mt-20 border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>
              <Link to="/" className="underline hover:text-primary">
                ← Back to CMPSBL
              </Link>
            </p>
            <p className="mt-4 font-mono text-xs">
              © 2026 CMPSBL® · Kenneth E. Sweet Jr. · Solo founder.
            </p>
          </footer>
        </div>
      </article>
    </>
  );
}
