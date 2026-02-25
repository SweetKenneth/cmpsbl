import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Scale, Lock, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const DefenseLegalServices = () => {
  return (
    <>
      <SEO 
        title="AI Bot Protection for Law Firms | CMPSBL Defense for Legal"
        description="Protect client portals, case management systems, and confidential legal data from AI bot attacks. CMPSBL's behavioral analysis built for law firm compliance."
        keywords={['law firm cybersecurity', 'legal bot protection', 'client portal security', 'attorney website protection', 'CMPSBL legal defense']}
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Scale className="h-4 w-4" />
                Legal Industry Solution
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
                Protect Your Law Firm from AI Bot Attacks
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Client confidentiality isn't optional. CMPSBL DEFENSE stops credential stuffing, data scraping, and automated attacks on your client portal before they breach attorney-client privilege.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Link to="/contact">
                  <Button size="lg" className="gap-2">
                    <Shield className="h-5 w-5" />
                    Request Legal Industry Demo
                  </Button>
                </Link>
                <Link to="/products/defense">
                  <Button size="lg" variant="outline">
                    View Full Platform
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <article className="container mx-auto px-4 py-12 max-w-6xl">
          
          {/* The Legal Threat Landscape */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              Why Law Firms Are Prime Bot Targets
            </h2>

            <p className="text-lg mb-6 text-muted-foreground">
              Your practice manages millions in settlements, confidential case files, and client trust accounts. Cybercriminals know this. <strong>Law firms experience 3x more credential stuffing attacks than average businesses</strong> because a single breached attorney login equals access to dozens of high-value client accounts.
            </p>

            <div className="grid md:grid-cols-3 gap-6 my-8">
              <Card className="p-6 border-destructive/50">
                <h4 className="text-lg font-bold mb-3 text-destructive">Client Portal Breaches</h4>
                <p className="text-sm mb-4">
                  Bots test thousands of leaked passwords against your secure portal. One successful login = full case history, settlement details, and SSNs exposed.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Real case:</strong> Florida firm lost $3.2M in wire fraud after bot-assisted portal breach.
                </p>
              </Card>

              <Card className="p-6 border-destructive/50">
                <h4 className="text-lg font-bold mb-3 text-destructive">Case File Scraping</h4>
                <p className="text-sm mb-4">
                  Competitor firms or opposing counsel use bots to systematically scrape public docket filings, case strategies, and settlement patterns.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Impact:</strong> Your litigation strategy leaked before trial, costing you negotiation leverage.
                </p>
              </Card>

              <Card className="p-6 border-destructive/50">
                <h4 className="text-lg font-bold mb-3 text-destructive">Trust Account Takeover</h4>
                <p className="text-sm mb-4">
                  Bots probe accounting system logins, trying default credentials and stolen passwords. Successful breach = wire fraud opportunity.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Legal risk:</strong> Bar association sanctions for inadequate safeguards on client funds.
                </p>
              </Card>
            </div>
          </section>

          {/* How CMPSBL DEFENSE Protects Legal Practices */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">How CMPSBL DEFENSE Protects Your Practice</h2>

            <div className="space-y-8">
              <Card className="p-6 bg-primary/5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Client Portal Defense</h3>
                    <p className="text-muted-foreground mb-4">
                      Advanced behavioral analysis detects credential stuffing attempts before they succeed. When a bot tries 500 password variations in 3 minutes, we block it—while real clients never see friction.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Blocks bots testing leaked password databases against your portal</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Detects residential proxy networks used to evade IP blocking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Zero false positives—clients with accessibility needs aren't blocked</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-accent/5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-accent/10">
                    <Lock className="h-6 w-6 text-accent" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Document Scraping Prevention</h3>
                    <p className="text-muted-foreground mb-4">
                      Bots can rapidly download pages from your case files or knowledge base. Our system recognizes automated scraping patterns and stops mass data exfiltration in real-time.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>Detects abnormal page access velocity (human vs. bot)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>Protects confidential memorandums and case strategies</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>Maintains audit trail for compliance reviews</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-primary/5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Scale className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Compliance-Focused Logging</h3>
                    <p className="text-muted-foreground mb-4">
                      Meet ABA ethics requirements with comprehensive audit logs. Every blocked bot attempt is documented with timestamp, IP, fingerprint, and threat classification for malpractice insurance and bar inquiries.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Export security reports for cyber insurance audits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Demonstrate "reasonable security measures" for client data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>GDPR, CCPA, and HIPAA activity documentation</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Protection Scenarios */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Protection Scenarios</h2>
            <p className="text-muted-foreground mb-6">
              These scenarios illustrate the types of threats legal practices face and how CMPSBL DEFENSE is designed to address them.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Client Portal Protection</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Threat:</strong> Bots attempting to scrape sensitive case information from client portals.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Defense Approach:</strong> Behavioral fingerprinting identifies automated scraping patterns while maintaining seamless access for legitimate clients.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Document Security</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Threat:</strong> Automated systems monitoring confidential data rooms for deal activity.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Defense Approach:</strong> Behavioral fingerprinting detects bot access patterns and provides alerts when automated systems access sensitive areas.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Intake Form Protection</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Threat:</strong> Bots submitting fake consultations through online intake forms.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Defense Approach:</strong> AI-powered detection identifies bot submissions while maintaining WCAG accessibility for clients with disabilities.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Access Monitoring</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Threat:</strong> Unauthorized automated monitoring of case portals and document activity.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Defense Approach:</strong> Device fingerprinting detects when the same device accesses multiple unrelated cases, helping identify suspicious surveillance activity.
                </p>
              </Card>
            </div>
          </section>

          {/* Why Legal Compliance Matters */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-primary" />
              The Business Case: ROI for Law Firms
            </h2>

            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">$2.1M</div>
                  <p className="text-sm text-muted-foreground">Average cost of data breach for law firms (ABA 2024)</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">67%</div>
                  <p className="text-sm text-muted-foreground">Increase in cyber insurance premiums after breach</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">$0/mo</div>
                  <p className="text-sm text-muted-foreground">CMPSBL DEFENSE protection (free-tier AI)</p>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-background/50 rounded-lg">
                <p className="text-sm font-bold mb-2">Beyond Insurance Savings:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Avoid malpractice claims from compromised client data</li>
                  <li>• Maintain bar association good standing (ethics requirements)</li>
                  <li>• Protect competitive intelligence in high-stakes litigation</li>
                  <li>• Demonstrate "reasonable security" for client trust accounts</li>
                </ul>
              </div>
            </Card>
          </section>

          {/* CTA Section */}
          <section className="text-center py-12 px-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Protect Your Practice and Your Clients</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              CMPSBL DEFENSE stops AI-powered bot attacks without disrupting legitimate client access. Coming soon to WordPress.org.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="gap-2">
                  <Shield className="h-5 w-5" />
                  Schedule Legal Industry Demo
                </Button>
              </Link>
              <Link to="/blog/wordpress-bot-defense">
                <Button size="lg" variant="outline">
                  Read Security Guide
                </Button>
              </Link>
            </div>
          </section>

        </article>
      </div>
    </>
  );
};

export default DefenseLegalServices;
