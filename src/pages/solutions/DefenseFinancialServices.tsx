import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, DollarSign, Lock, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

const DefenseFinancialServices = () => {
  return (
    <>
      <SEO 
        title="Bot Protection for Financial Services | PromptFluid Defense"
        description="Protect banking portals, investment platforms, and payment systems from AI bot attacks. Stop account takeover, transaction fraud, and credential stuffing with behavioral AI security."
        keywords={["fintech cybersecurity", "banking bot protection", "financial services security", "account takeover prevention", "payment fraud protection", "fintech compliance security", "PCI DSS bot defense", "financial app security"]}
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <DollarSign className="h-4 w-4" />
                Financial Services Solution
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
                Stop Financial Fraud with AI-Powered Bot Defense
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Every second counts in financial security. PromptFluid Defense stops account takeover attacks, payment fraud, and credential stuffing before unauthorized transactions clear—protecting your customers and your reputation.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Link to="/contact">
                  <Button size="lg" className="gap-2">
                    <Shield className="h-5 w-5" />
                    Request Fintech Demo
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
          
          {/* The Financial Threat Landscape */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              Why Financial Services Are Under Siege
            </h2>

            <p className="text-lg mb-6 text-muted-foreground">
              <strong>Financial institutions lose $1.8 billion annually to bot-driven fraud.</strong> Unlike other industries, fintech attacks have immediate financial consequences: stolen funds, fraudulent wire transfers, and account takeovers that drain customer balances in minutes.
            </p>

            <div className="grid md:grid-cols-3 gap-6 my-8">
              <Card className="p-6 border-destructive/50">
                <h4 className="text-lg font-bold mb-3 text-destructive">Account Takeover (ATO)</h4>
                <p className="text-sm mb-4">
                  Bots test 100,000+ password combinations per minute against banking portals. One success = full account access, wire transfer capability, and linked account compromise.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Real case:</strong> Credit union lost $840K in fraudulent ACH transfers after bot-assisted ATO attack.
                </p>
              </Card>

              <Card className="p-6 border-destructive/50">
                <h4 className="text-lg font-bold mb-3 text-destructive">Payment Card Testing</h4>
                <p className="text-sm mb-4">
                  Bots systematically test stolen card numbers with $1 transactions to validate active accounts, then sell verified cards at premium prices on dark web markets.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Impact:</strong> Chargebacks, card reissuance costs, and merchant account penalties.
                </p>
              </Card>

              <Card className="p-6 border-destructive/50">
                <h4 className="text-lg font-bold mb-3 text-destructive">Investment Account Fraud</h4>
                <p className="text-sm mb-4">
                  Bots compromise brokerage accounts to execute unauthorized trades, manipulate penny stocks, or transfer securities before victims notice account access.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Regulatory risk:</strong> SEC enforcement actions and FINRA violations for inadequate account security.
                </p>
              </Card>
            </div>
          </section>

          {/* How PromptFluid Defense Protects Finance */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">How PromptFluid Defense Protects Your Institution</h2>

            <div className="space-y-8">
              <Card className="p-6 bg-primary/5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Real-Time ATO Prevention</h3>
                    <p className="text-muted-foreground mb-4">
                      Behavioral AI analyzes 40+ signals per login attempt—detecting credential stuffing bots before they succeed. When a single IP tests 500 username/password combinations, we block it instantly while legitimate customers never experience friction.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Stops bots using leaked credentials from third-party breaches</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Detects residential proxy rotation evading IP blocking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Zero false positives—customers aren't locked out unnecessarily</span>
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
                    <h3 className="text-xl font-bold mb-2">Payment Fraud Detection</h3>
                    <p className="text-muted-foreground mb-4">
                      Advanced device fingerprinting identifies bots testing payment cards through velocity checks. Our system recognizes when 1,000 $1 transactions hit your payment gateway from spoofed devices in 10 minutes.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>Blocks automated card validation attempts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>Prevents chargeback fraud and card testing abuse</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>Maintains PCI DSS requirement 6.6 compliance</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-primary/5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Regulatory Compliance Logging</h3>
                    <p className="text-muted-foreground mb-4">
                      Meet FFIEC cybersecurity requirements with comprehensive audit trails. Every blocked bot attempt is logged with timestamp, device fingerprint, threat classification, and risk score for regulatory examiners.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Export security reports for FDIC/OCC audits</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Demonstrate "layered security" for examiner reviews</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>SOC 2, PCI DSS, and GLBA documentation support</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Real-World Finance Use Cases */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Protection Scenarios</h2>
            <p className="text-muted-foreground mb-6">
              These scenarios illustrate the types of threats financial institutions face and how PromptFluid Defense is designed to address them.
            </p>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Online Banking Protection</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Threat:</strong> Credential stuffing bots targeting online banking portals with stolen username/password combinations.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Defense Approach:</strong> Behavioral fingerprinting identifies automated login patterns and blocks bot attempts while maintaining seamless access for legitimate customers.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Investment Platform Security</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Threat:</strong> Bots attempting to compromise brokerage accounts for unauthorized trading activity.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Defense Approach:</strong> Behavioral analysis detects abnormal login velocity and device spoofing to help prevent unauthorized account access.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Payment Processing Protection</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Threat:</strong> Bots testing stolen credit cards through merchant accounts, leading to chargebacks.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Defense Approach:</strong> Device fingerprinting identifies card testing patterns to help prevent fraudulent transactions before they complete.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Account Fraud Prevention</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Threat:</strong> Bots creating fake accounts to exploit signup bonuses and promotional offers.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Defense Approach:</strong> Multi-factor behavioral correlation detects bulk account creation patterns while maintaining smooth onboarding for legitimate customers.
                </p>
              </Card>
            </div>
          </section>

          {/* Financial ROI Section */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">The Business Case: ROI for Financial Institutions</h2>

            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">$5.72M</div>
                  <p className="text-sm text-muted-foreground">Average cost of financial services data breach (IBM 2024)</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">92%</div>
                  <p className="text-sm text-muted-foreground">Of financial fraud involves bot-driven attacks</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">$49/mo</div>
                  <p className="text-sm text-muted-foreground">Pro tier pricing for PromptFluid Defense</p>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-background/50 rounded-lg">
                <p className="text-sm font-bold mb-2">Beyond Fraud Prevention:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Avoid FFIEC enforcement actions and consent orders</li>
                  <li>• Reduce fraud losses and chargeback penalties</li>
                  <li>• Maintain cyber insurance coverage and premium rates</li>
                  <li>• Protect brand reputation and customer trust</li>
                  <li>• Meet PCI DSS 4.0 requirement 6.4.3 (bot mitigation)</li>
                </ul>
              </div>
            </Card>
          </section>

          {/* CTA Section */}
          <section className="text-center py-12 px-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Secure Your Institution and Your Customers</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              PromptFluid Defense stops AI-powered bot attacks while maintaining seamless customer experiences. Coming soon to WordPress.org.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="gap-2">
                  <Shield className="h-5 w-5" />
                  Schedule Financial Services Demo
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

export default DefenseFinancialServices;
