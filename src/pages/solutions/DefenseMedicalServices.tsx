import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Shield, Heart, Lock, AlertTriangle, CheckCircle, Activity } from "lucide-react";
import { Link } from "react-router-dom";

const DefenseMedicalServices = () => {
  return (
    <>
      <SEO 
        title="HIPAA-Compliant Bot Protection for Healthcare | PromptFluid Defense"
        description="Protect patient portals, telemedicine platforms, and medical records from AI bot attacks. HIPAA-compliant behavioral analysis stops credential stuffing and data breaches for healthcare providers."
        keywords={["healthcare cybersecurity", "HIPAA security software", "patient portal security", "medical practice bot protection", "healthcare data protection", "telemedicine security", "EMR security", "HIPAA compliance software"]}
      />
      
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Heart className="h-4 w-4" />
                Healthcare Industry Solution
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent leading-tight">
                HIPAA-Compliant Bot Protection for Healthcare Providers
              </h1>
              
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Patient privacy isn't negotiable. PromptFluid Defense stops automated attacks on patient portals, telemedicine platforms, and medical records—while maintaining full HIPAA compliance and zero patient friction.
              </p>
              
              <div className="flex flex-wrap gap-4 justify-center pt-4">
                <Link to="/contact">
                  <Button size="lg" className="gap-2">
                    <Shield className="h-5 w-5" />
                    Request Healthcare Demo
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
          
          {/* The Healthcare Threat Landscape */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-destructive" />
              Why Healthcare Is the #1 Bot Target
            </h2>

            <p className="text-lg mb-6 text-muted-foreground">
              Medical records are worth <strong>$250 each on the dark web</strong>—50x more valuable than credit card data. Bots systematically target patient portals, telemedicine logins, and insurance verification systems because successful breaches equal massive paydays for cybercriminals.
            </p>

            <div className="grid md:grid-cols-3 gap-6 my-8">
              <Card className="p-6 border-destructive/50">
                <h4 className="text-lg font-bold mb-3 text-destructive">Patient Portal Takeover</h4>
                <p className="text-sm mb-4">
                  Bots test millions of leaked passwords against your portal. One successful login = SSNs, insurance details, prescription history, and diagnosis codes exposed.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Real case:</strong> Regional clinic suffered 12,400 patient record breach from bot-assisted login attacks.
                </p>
              </Card>

              <Card className="p-6 border-destructive/50">
                <h4 className="text-lg font-bold mb-3 text-destructive">Telemedicine Fraud</h4>
                <p className="text-sm mb-4">
                  Bots create fake patient accounts to obtain prescriptions for controlled substances, bill insurance for phantom appointments, or access telehealth platforms for resale.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Impact:</strong> DEA audits, insurance fraud investigations, and prescription monitoring alerts.
                </p>
              </Card>

              <Card className="p-6 border-destructive/50">
                <h4 className="text-lg font-bold mb-3 text-destructive">Appointment Spam Attacks</h4>
                <p className="text-sm mb-4">
                  Bots flood online scheduling systems with fake appointments, blocking slots from real patients. Some attacks are competitors; others are extortion attempts.
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Business impact:</strong> Revenue loss from no-shows, staff time wasted clearing spam bookings.
                </p>
              </Card>
            </div>
          </section>

          {/* How PromptFluid Defense Protects Healthcare */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">How PromptFluid Defense Protects Your Practice</h2>

            <div className="space-y-8">
              <Card className="p-6 bg-primary/5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Patient Portal Defense</h3>
                    <p className="text-muted-foreground mb-4">
                      AI-powered behavioral analysis detects credential stuffing bots testing thousands of passwords—while never blocking legitimate patients, including elderly users and those with disabilities.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Stops bots testing leaked healthcare credentials from prior breaches</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Detects residential proxy networks evading IP blocking</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>WCAG 2.1 AA compliant—no patient access barriers</span>
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
                    <h3 className="text-xl font-bold mb-2">Telemedicine Session Protection</h3>
                    <p className="text-muted-foreground mb-4">
                      Bots attempting to hijack video consultations or access prescription systems are identified by abnormal session behavior—distinguishing automated systems from legitimate patients.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>Detects bots creating bulk fake patient accounts</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>Flags suspicious prescription request patterns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
                        <span>Prevents insurance billing fraud from automated systems</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-primary/5">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">HIPAA-Compliant Audit Logging</h3>
                    <p className="text-muted-foreground mb-4">
                      Meet HIPAA § 164.308(a)(1)(ii)(D) requirements with comprehensive security incident logs. Every blocked bot attempt is timestamped, fingerprinted, and classified for OCR audits and breach notifications.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Export security reports for HIPAA compliance officers</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Demonstrate "reasonable safeguards" for ePHI protection</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>BAA available for covered entities and business associates</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </section>

          {/* Real-World Healthcare Use Cases */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">Real-World Protection Scenarios</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Multi-Specialty Clinic</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Challenge:</strong> 18,000-patient portal targeted by credential stuffing bots. Feared HIPAA breach notification and OCR penalties.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Solution:</strong> PromptFluid Defense blocked 2,347 bot login attempts in 45 days. Zero successful breaches, zero patient friction, full audit trail for compliance.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Telemedicine Platform</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Challenge:</strong> Bots creating fake patient profiles to obtain controlled substance prescriptions. DEA audit risk.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Solution:</strong> Behavioral fingerprinting detected automated account creation patterns. Platform eliminated 97% of fraudulent prescription requests while maintaining patient accessibility.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Dental Practice Group</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Challenge:</strong> Online appointment scheduler overwhelmed by bot spam—150+ fake bookings per week blocking real patient access.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Solution:</strong> AI detection eliminated 99.4% of bot bookings without affecting elderly patients or those using assistive technology. Recovered $47K in lost scheduling revenue.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="text-xl font-bold mb-3">Regional Hospital System</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong>Challenge:</strong> Epic MyChart integration vulnerable to bots scraping patient demographics and insurance data for identity theft rings.
                </p>
                <p className="text-sm text-muted-foreground">
                  <strong>Solution:</strong> Device fingerprinting detected same "devices" accessing 400+ unrelated patient records. Stopped massive data exfiltration attempt—OCR breach notification avoided.
                </p>
              </Card>
            </div>
          </section>

          {/* HIPAA Compliance Focus */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold mb-6">HIPAA Compliance & Financial Impact</h2>

            <Card className="p-8 bg-gradient-to-br from-primary/10 to-accent/10">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">$4.35M</div>
                  <p className="text-sm text-muted-foreground">Average cost of healthcare data breach (IBM 2024)</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">$50K+</div>
                  <p className="text-sm text-muted-foreground">OCR HIPAA penalties per violation tier</p>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">$19/mo</div>
                  <p className="text-sm text-muted-foreground">Starting cost for PromptFluid Defense</p>
                </div>
              </div>
              
              <div className="mt-8 p-4 bg-background/50 rounded-lg">
                <p className="text-sm font-bold mb-2">Beyond Breach Prevention:</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Avoid HIPAA breach notification requirements (500+ patients = public disclosure)</li>
                  <li>• Maintain cyber insurance coverage and rates</li>
                  <li>• Protect reputation and patient trust</li>
                  <li>• Demonstrate "reasonable safeguards" for OCR audits</li>
                  <li>• Prevent DEA investigations from prescription fraud</li>
                </ul>
              </div>
            </Card>
          </section>

          {/* CTA Section */}
          <section className="text-center py-12 px-6 bg-gradient-to-br from-primary/5 to-accent/5 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">Protect Your Patients and Your Practice</h2>
            <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join healthcare providers nationwide trusting PromptFluid Defense to stop AI bot attacks while maintaining HIPAA compliance and patient accessibility.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="gap-2">
                  <Shield className="h-5 w-5" />
                  Schedule Healthcare Demo
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

export default DefenseMedicalServices;
