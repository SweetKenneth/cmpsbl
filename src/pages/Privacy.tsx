/**
 * Privacy Policy — Legal page with premium design treatment
 */

import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import { motion } from "framer-motion";

const sections = [
  {
    title: "1. Introduction",
    content: `CMPSBL® ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.`,
  },
  {
    title: "2. Information We Collect",
    content: null,
    subsections: [
      {
        title: "Personal Information",
        content: "We may collect personal information that you voluntarily provide to us, including:",
        list: ["Name and email address", "Account credentials", "Payment information", "Contact preferences", "Communications with us"],
      },
      {
        title: "Automatically Collected Information",
        content: "When you access our services, we automatically collect certain information including device information, IP address, browser type, operating system, and usage patterns.",
      },
    ],
  },
  {
    title: "3. How We Use Your Information",
    content: "We use the information we collect to:",
    list: [
      "Provide, maintain, and improve our services",
      "Process transactions and send related information",
      "Send promotional communications (with your consent)",
      "Respond to your comments, questions, and requests",
      "Monitor and analyze usage patterns and trends",
      "Detect, investigate, and prevent security incidents",
    ],
  },
  {
    title: "4. Data Security",
    content: "We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.",
  },
  {
    title: "5. Data Retention",
    content: "We retain your personal information for as long as necessary to fulfill the purposes for which it was collected and to comply with our legal obligations.",
  },
  {
    title: "6. Your Rights",
    content: "Depending on your location, you may have the right to:",
    list: ["Access your personal information", "Correct inaccurate data", "Request deletion of your data", "Object to processing of your data", "Data portability", "Withdraw consent"],
  },
  {
    title: "7. Third-Party Services",
    content: "Our services may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.",
  },
  {
    title: "8. Children's Privacy",
    content: "Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.",
  },
  {
    title: "9. Changes to This Policy",
    content: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.',
  },
  {
    title: "10. Contact Us",
    content: "If you have questions about this Privacy Policy, please contact us at:",
    contact: true,
  },
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy — CMPSBL®"
        description="CMPSBL privacy policy: how we collect, store, and protect your data. GDPR-compliant, transparent data practices."
        keywords={['CMPSBL privacy policy', 'AI data privacy', 'GDPR compliant AI', 'data protection policy']}
      />
      <PublicNav />

      <main className="container mx-auto px-4 pt-24 pb-16 max-w-4xl relative">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-40 right-1/4 w-[300px] h-[300px] rounded-full animate-hero-orb-2" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 60%)" }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <nav className="mb-8">
            <a href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] py-2">← Back to Home</a>
          </nav>

          <div className="mb-10">
            <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold">Legal</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground text-sm">Last updated: February 14, 2026</p>
          </div>

          <div className="space-y-6">
            {sections.map((section, i) => (
              <motion.section
                key={section.title}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.03 }}
                className="p-5 sm:p-6 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm glass-edge"
              >
                <h2 className="text-lg sm:text-xl font-bold mb-3 text-foreground">{section.title}</h2>
                {section.content && (
                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{section.content}</p>
                )}
                {section.subsections?.map((sub) => (
                  <div key={sub.title} className="mt-4">
                    <h3 className="text-base font-semibold mb-2">{sub.title}</h3>
                    {sub.content && <p className="text-sm text-muted-foreground leading-relaxed mb-2">{sub.content}</p>}
                    {sub.list && (
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-1">
                        {sub.list.map((item) => <li key={item}>{item}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
                {section.list && (
                  <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 ml-1">
                    {section.list.map((item) => <li key={item}>{item}</li>)}
                  </ul>
                )}
                {section.contact && (
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Email:</strong> Dev@CMPSBL.com<br />
                    <strong>Phone:</strong> (760) 358-4324
                  </p>
                )}
              </motion.section>
            ))}
          </div>
        </motion.div>
      </main>

      <EnhancedFooter />
    </div>
  );
}
