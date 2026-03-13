/**
 * Privacy Policy — Legal page with TOC sidebar and active section tracking
 */

import { useState, useEffect, useRef } from "react";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";
import { RelatedCapabilities } from "@/components/RelatedCapabilities";
import { SEO } from "@/components/SEO";
import { Badge } from "@/components/ui/badge";
import { Shield, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

const sections = [
  {
    id: "introduction",
    title: "1. Introduction",
    content: `CMPSBL® ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or use our services.`,
  },
  {
    id: "information",
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
    id: "usage",
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
    id: "security",
    title: "4. Data Security",
    content: "We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.",
  },
  {
    id: "retention",
    title: "5. Data Retention",
    content: "We retain your personal information for as long as necessary to fulfill the purposes for which it was collected and to comply with our legal obligations.",
  },
  {
    id: "rights",
    title: "6. Your Rights",
    content: "Depending on your location, you may have the right to:",
    list: ["Access your personal information", "Correct inaccurate data", "Request deletion of your data", "Object to processing of your data", "Data portability", "Withdraw consent"],
  },
  {
    id: "third-party",
    title: "7. Third-Party Services",
    content: "Our services may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.",
  },
  {
    id: "children",
    title: "8. Children's Privacy",
    content: "Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.",
  },
  {
    id: "changes",
    title: "9. Changes to This Policy",
    content: 'We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.',
  },
  {
    id: "contact",
    title: "10. Contact Us",
    content: "If you have questions about this Privacy Policy, please contact us at:",
    contact: true,
  },
];

export default function Privacy() {
  const [activeSection, setActiveSection] = useState(sections[0].id);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px" }
    );

    sections.forEach((s) => {
      const el = sectionRefs.current[s.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Privacy Policy — Your Data Rights | CMPSBL®"
        description="How CMPSBL collects, stores, and safeguards your data. Covers Memory Stream crystallization ownership, GDPR compliance, cookie usage, third-party sharing, and your right to deletion."
        keywords={['CMPSBL privacy policy', 'AI data privacy', 'GDPR compliant AI', 'memory stream data rights']}
      />
      <PublicNav />

      <main className="container mx-auto px-4 pt-24 pb-16 max-w-6xl relative">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-40 right-1/4 w-[300px] h-[300px] rounded-full animate-hero-orb-2" style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 60%)" }} />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10">
          <nav className="mb-8">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors min-h-[44px] py-2">
              <ChevronRight className="w-3 h-3 rotate-180 mr-1" /> Back to Home
            </Link>
          </nav>

          <div className="mb-10">
            <Badge variant="outline" className="mb-4 gap-1.5 border-primary/30 px-4 py-1.5">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-xs font-semibold">Legal</span>
            </Badge>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Privacy Policy</h1>
            <p className="text-muted-foreground text-sm">Last updated: February 14, 2026</p>
          </div>

          <div className="flex gap-8">
            {/* Sticky TOC — desktop only */}
            <aside className="hidden lg:block w-56 shrink-0">
              <div className="sticky top-28">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground/60 font-mono mb-3">On this page</p>
                <nav className="space-y-0.5">
                  {sections.map((s) => (
                    <a
                      key={s.id}
                      href={`#${s.id}`}
                      className={cn(
                        "block text-xs py-1.5 pl-3 border-l-2 transition-all duration-200",
                        activeSection === s.id
                          ? "border-primary text-primary font-medium"
                          : "border-transparent text-muted-foreground/60 hover:text-muted-foreground hover:border-border"
                      )}
                    >
                      {s.title.replace(/^\d+\.\s*/, "")}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-5">
              {sections.map((section, i) => (
                <motion.section
                  key={section.id}
                  id={section.id}
                  ref={(el) => { sectionRefs.current[section.id] = el; }}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02 }}
                  className="p-5 sm:p-6 rounded-2xl border border-border/30 bg-card/40 backdrop-blur-sm glass-edge scroll-mt-28"
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
                        <ul className="space-y-1.5 ml-1">
                          {sub.list.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <span className="w-1 h-1 rounded-full bg-primary/60 mt-2 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                  {section.list && (
                    <ul className="space-y-1.5 ml-1">
                      {section.list.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="w-1 h-1 rounded-full bg-primary/60 mt-2 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.contact && (
                    <div className="mt-3 p-4 rounded-xl bg-muted/30 border border-border/30">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">Email:</strong> Dev@CMPSBL.com<br />
                        <strong className="text-foreground">Phone:</strong> (760) 358-4324
                      </p>
                    </div>
                  )}
                </motion.section>
              ))}
            </div>
          </div>
        </motion.div>
      </main>

      <RelatedCapabilities />
      <EnhancedFooter />
    </div>
  );
}
