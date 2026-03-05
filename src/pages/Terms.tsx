import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Terms of Service — CMPSBL®"
        description="Terms of service for the CMPSBL Substrate platform. Covers usage rights, intellectual property, and service-level commitments."
        keywords={['CMPSBL terms of service', 'AI platform terms', 'substrate usage terms', 'service agreement AI']}
      />
      <PublicNav />
      
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl">
        <nav className="mb-8">
          <a href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] py-2">← Back to Home</a>
        </nav>
        <h1 className="text-3xl sm:text-4xl font-bold mb-8">Terms of Service</h1>
        <p className="text-muted-foreground mb-8">Last updated: February 24, 2026</p>
        
        <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing or using CMPSBL's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              CMPSBL® provides cognitive orchestration infrastructure including but not limited to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 mt-4">
              <li>CMPSBL Substrate — Layered cognitive orchestration with persistent memory</li>
              <li>Composable Minds — Downloadable AI agents with persistent memory</li>
              <li>Artifact Packs — Capabilities, templates, and pipelines via the unified store</li>
              <li>NEXUS — Multi-provider AI routing with BYOK architecture</li>
              <li>DEFENSE — Enterprise-grade threat detection and bot protection overlay</li>
              <li>DECODE — Conversational AI interface with memory-backed context</li>
              <li>VISION — Full observability and system introspection</li>
              <li>INCLUSIVE — Human compatibility system with WCAG scanning and AI remediation</li>
              <li>Persistent Memory — Drop-in memory layer for any AI agent</li>
              <li>Evolution Mesh — Self-learning immune system for software</li>
              <li>Composable Cognitive Infrastructure — Templates, capabilities, and orchestration pipelines</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To access certain features, you may need to create an account. You agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Notify us immediately of any unauthorized access</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree not to use our services to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe on intellectual property rights</li>
              <li>Transmit malware or harmful code</li>
              <li>Attempt to gain unauthorized access to systems</li>
              <li>Engage in fraudulent or deceptive activities</li>
              <li>Harass, abuse, or harm others</li>
              <li>Reverse-engineer, decompile, or attempt to extract source code from any engine or cognitive</li>
              <li>Redistribute, sublicense, or resell purchased cognitives or engines without written permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content, features, and functionality of our services — including but not limited to the CMPSBL platform architecture, orchestration pipelines, artifact packs, and composable Minds — are owned by CMPSBL and protected by intellectual property laws. CMPSBL® is a registered trademark. You may not copy, modify, distribute, or create derivative works without express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. Composable Cognitives & Engine Purchases</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Composable Cognitives and engines are delivered as downloadable artifacts. Upon purchase:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2">
              <li>You receive a perpetual, non-transferable license for personal or organizational use</li>
              <li>You may not redistribute, sublicense, or resell purchased artifacts</li>
              <li>Refunds are handled according to our refund policy</li>
              <li>CMPSBL retains all intellectual property rights in the underlying technology</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Subscription & Payment Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              For paid subscription tiers (Creator, Architect, Enterprise), you agree to pay all applicable fees at the published rate. We reserve the right to modify pricing with 30 days written notice. One-time purchases (Template Generator, Composable Cognitives) are non-recurring and governed by the license terms at time of purchase.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We strive to maintain high availability but do not guarantee uninterrupted access. We may modify, suspend, or discontinue services with reasonable notice when possible. System health and uptime are available on our <a href="/status" className="text-primary hover:underline">Status page</a>.
            </p>
          </section>

          <section>
           <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, CMPSBL shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to indemnify and hold harmless CMPSBL and its affiliates from any claims, losses, or damages arising from your use of our services or violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may terminate or suspend your access to our services at our sole discretion, without notice, for conduct that we believe violates these terms or is harmful to other users.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Governing Law</h2>
            <p className="text-muted-foreground leading-relaxed">
              These terms shall be governed by the laws of the State of Texas, United States, without regard to conflict of law principles. Any disputes arising under these terms shall be resolved in the courts located in Dallas County, Texas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to modify these terms at any time. We will provide notice of material changes. Continued use of our services after changes constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-muted-foreground mt-4">
              <strong>Email:</strong> Dev@CMPSBL.com<br />
              <strong>Phone:</strong> (760) 358-4324
            </p>
          </section>
        </div>
      </main>
      
      <EnhancedFooter />
    </div>
  );
}
