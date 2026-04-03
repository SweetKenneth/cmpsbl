/**
 * CMPSBL ROBOTICS™ — Robotics Vertical Landing Page
 *
 * Titanium/Electric Blue theme. Precision engineering aesthetic.
 * Distinct visual identity for robotics.cmpsbl.com.
 *
 * © CMPSBL® — All rights reserved.
 */

import { useRef } from "react";
import { useSSORelay } from "@/hooks/useSSORelay";
import { Helmet } from "react-helmet-async";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Cpu, Cog, Eye, Navigation, Battery, Gauge, ScanLine, Wrench,
  ArrowRight, ExternalLink, Layers, Zap, Settings, Crosshair,
  Compass, Workflow, Shield, Activity, CircuitBoard, Bot,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { VerticalReturnBanner } from "@/components/shared/VerticalReturnBanner";
import { PublicNav } from "@/components/PublicNav";
import { EnhancedFooter } from "@/components/EnhancedFooter";

/* ═══════════════════════════════════════════════════════════════ */
/* DATA                                                          */
/* ═══════════════════════════════════════════════════════════════ */

const ROBO_STATS = [
  { label: "Motion Algorithms Loaded", value: "1,420", icon: Navigation },
  { label: "Sensor Fusion Channels", value: "24", icon: Eye },
  { label: "Custom Primitives", value: "16", icon: Cpu },
  { label: "Capabilities Active", value: "130+", icon: Layers },
];

const ENGINE_DATA = [
  { id: "SERVO", name: "SERVO", desc: "Motor control & actuator orchestration — PID tuning, torque profiling, multi-axis servo loop execution", icon: Cog, color: "hsl(200 100% 55%)" },
  { id: "KINETIC", name: "KINETIC", desc: "Motion planning & trajectory optimization — RRT* pathfinding, collision avoidance, inverse kinematics", icon: Navigation, color: "hsl(170 80% 50%)" },
  { id: "LIDAR", name: "LIDAR", desc: "Spatial perception — 3D point cloud processing, SLAM mapping, semantic terrain classification", icon: Eye, color: "hsl(45 100% 55%)" },
  { id: "FABRICATOR", name: "FABRICATOR", desc: "Hardware fabrication — CAD pipelines, additive manufacturing, predictive maintenance, digital twins", icon: Wrench, color: "hsl(15 90% 55%)" },
  { id: "FLUX", name: "FLUX", desc: "Power management — battery SOH estimation, regenerative braking, energy budget allocation", icon: Battery, color: "hsl(120 70% 50%)" },
  { id: "VECTOR", name: "VECTOR", desc: "Navigation & localization — GPS/IMU fusion, visual odometry, geofencing, waypoint navigation", icon: Compass, color: "hsl(260 80% 65%)" },
  { id: "TENSOR", name: "TENSOR", desc: "Sensor fusion — Kalman filtering, multi-modal state estimation, anomaly signal detection", icon: CircuitBoard, color: "hsl(330 80% 60%)" },
  { id: "CALIBER", name: "CALIBER", desc: "Precision calibration — kinematic parameter ID, thermal drift compensation, ISO 9283 certification", icon: Crosshair, color: "hsl(200 60% 70%)" },
];

const AGENT_DATA = [
  { id: "GRIPPER", name: "GRIPPER", desc: "Manipulation & dexterous object handling — grasp planning, compliant contact, bin picking orchestration" },
  { id: "SWARM", name: "SWARM", desc: "Multi-robot coordination — fleet task allocation, formation control, collaborative mapping" },
  { id: "ENVIRON", name: "ENVIRON", desc: "Environmental awareness — dynamic scene graphs, workspace zone management, change detection" },
  { id: "GUARDIAN", name: "GUARDIAN", desc: "Safety monitoring — ISO 10218 compliance, human proximity scaling, collision force limiting" },
  { id: "CONDUCTOR", name: "CONDUCTOR", desc: "Workflow automation — finite state machine orchestration, cycle time optimization, error recovery" },
  { id: "WELDER", name: "WELDER", desc: "Assembly operations — adaptive weld parameters, seam tracking, multi-pass strategy planning" },
  { id: "INSPECTOR", name: "INSPECTOR", desc: "Quality inspection — dimensional verification, surface defect classification, SPC monitoring" },
  { id: "PIONEER", name: "PIONEER", desc: "Autonomous exploration — frontier-based planning, terrain risk assessment, progressive mapping" },
];

const CAPABILITIES_PREVIEW = [
  "PID Auto-Tuning", "RRT* Path Planning", "SLAM Mapping",
  "Inverse Kinematics", "Sensor Fusion", "Battery Management",
  "Grasp Planning", "Fleet Coordination", "Safety Zone Enforcement",
  "Weld Parameter Control", "Dimensional Verification", "Terrain Assessment",
  "Torque Profiling", "Visual Odometry", "Kalman Filtering",
  "Predictive Maintenance", "Collision Avoidance", "Frontier Exploration",
];

/* ═══════════════════════════════════════════════════════════════ */
/* COMPONENT                                                     */
/* ═══════════════════════════════════════════════════════════════ */

export default function RoboticsHome() {
  useSSORelay();
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 1], [0, -80]);

  return (
    <>
      <Helmet>
        <title>CMPSBL ROBOTICS™ — Cognitive Robotics Infrastructure</title>
        <meta name="description" content="16 purpose-built robotics primitives. 130+ capabilities. Motion planning, sensor fusion, fleet coordination, and safety compliance. Powered by CMPSBL®." />
        <link rel="canonical" href="https://robotics.cmpsbl.com" />
        <meta property="og:title" content="CMPSBL ROBOTICS™ — Cognitive Robotics Infrastructure" />
        <meta property="og:description" content="16 purpose-built robotics primitives. Autonomous motion, precision calibration, and fleet intelligence." />
        <meta property="og:url" content="https://robotics.cmpsbl.com" />
        <meta property="og:type" content="website" />
        <meta name="author" content="CMPSBL® · PromptFluid™" />
      </Helmet>

      <div className="robotics-substrate min-h-screen font-sans" style={{
        background: 'hsl(215 25% 5%)',
        color: 'hsl(0 0% 92%)',
      }}>

        {/* Return Banner */}
        <VerticalReturnBanner verticalName="CMPSBL ROBOTICS™" accentColor="hsl(200 100% 55%)" />

        {/* NAV */}
        <PublicNav />

        {/* HERO */}
        <motion.section
          ref={heroRef}
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative overflow-hidden"
        >
          {/* Grid background */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `
              linear-gradient(hsl(200 100% 55% / 0.4) 1px, transparent 1px),
              linear-gradient(90deg, hsl(200 100% 55% / 0.4) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }} />

          {/* Radial glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full opacity-15" style={{
            background: "radial-gradient(circle, hsl(200 100% 55% / 0.2), hsl(220 40% 40% / 0.08), transparent 70%)",
          }} />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20 sm:pt-36 sm:pb-28">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
            >
              {/* Status indicator */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border mb-8" style={{
                borderColor: "hsl(200 100% 55% / 0.3)",
                background: "hsl(200 100% 55% / 0.06)",
              }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "hsl(200 100% 55%)" }} />
                <span className="text-xs font-mono tracking-wider uppercase" style={{ color: "hsl(200 100% 65%)" }}>
                  SYSTEMS ONLINE · 16 PRIMITIVES ACTIVE
                </span>
              </div>

              <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter mb-6" style={{
                background: "linear-gradient(135deg, hsl(200 100% 60%), hsl(220 10% 85%), hsl(200 80% 45%))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.05,
              }}>
                CMPSBL ROBOTICS<span style={{ WebkitTextFillColor: "hsl(200 100% 55%)" }}>™</span>
              </h1>

              <p className="text-lg sm:text-xl max-w-3xl mx-auto mb-4 font-light" style={{ color: "hsl(215 15% 65%)" }}>
                Cognitive robotics infrastructure. 16 purpose-built primitives.
                Autonomous motion, precision calibration, and fleet intelligence.
              </p>
              <p className="text-sm max-w-2xl mx-auto mb-10" style={{ color: "hsl(215 15% 42%)" }}>
                A vertical substrate of <a href="https://cmpsbl.com" className="underline hover:no-underline" style={{ color: "hsl(200 100% 55%)" }}>CMPSBL®</a> — 
                Governed Cognitive Infrastructure by PromptFluid™
              </p>

              <div className="flex flex-wrap gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/ascension')}
                  className="h-12 px-8 text-sm font-semibold tracking-wide border-0"
                  style={{
                    background: "linear-gradient(135deg, hsl(200 100% 50%), hsl(200 80% 38%))",
                    color: "white",
                  }}
                >
                  <Bot className="mr-2 h-4 w-4" />
                  START ROBOTICS AUDIT
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/showroom')}
                  className="h-12 px-8 text-sm font-semibold tracking-wide"
                  style={{
                    borderColor: "hsl(220 10% 70% / 0.3)",
                    color: "hsl(220 10% 75%)",
                    background: "hsl(220 10% 70% / 0.05)",
                  }}
                >
                  <ScanLine className="mr-2 h-4 w-4" />
                  BROWSE SCANNERS
                </Button>
              </div>
            </motion.div>

            {/* Stats bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-4xl mx-auto"
            >
              {ROBO_STATS.map((stat) => (
                <div key={stat.label} className="text-center p-4 rounded-lg border" style={{
                  borderColor: "hsl(215 20% 14%)",
                  background: "hsl(215 25% 7%)",
                }}>
                  <stat.icon className="h-5 w-5 mx-auto mb-2" style={{ color: "hsl(200 100% 55%)" }} />
                  <div className="text-2xl font-bold font-mono" style={{ color: "hsl(0 0% 95%)" }}>{stat.value}</div>
                  <div className="text-xs mt-1" style={{ color: "hsl(215 15% 45%)" }}>{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom line */}
          <div className="h-px w-full" style={{
            background: "linear-gradient(90deg, transparent, hsl(200 100% 55% / 0.5), hsl(220 10% 70% / 0.4), transparent)",
          }} />
        </motion.section>

        {/* ENGINES GRID */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="text-center mb-12">
            <Badge className="mb-4 text-xs font-mono tracking-widest border" style={{
              borderColor: "hsl(200 100% 55% / 0.3)",
              background: "hsl(200 100% 55% / 0.08)",
              color: "hsl(200 100% 65%)",
            }}>
              8 ROBOTICS ENGINES
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "hsl(0 0% 95%)" }}>
              Hot-Swapped for <span style={{ color: "hsl(200 100% 55%)" }}>Precision Automation</span>
            </h2>
            <p className="text-sm mt-3 max-w-xl mx-auto" style={{ color: "hsl(215 15% 50%)" }}>
              Each engine replaces a general-purpose CMPSBL primitive with domain-specific
              robotics logic while maintaining the 24-primitive spine.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ENGINE_DATA.map((engine, i) => (
              <motion.div
                key={engine.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.5 }}
              >
                <Card className="h-full border transition-all duration-300 hover:scale-[1.02]" style={{
                  borderColor: "hsl(215 20% 14%)",
                  background: "hsl(215 25% 7%)",
                }}>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg" style={{ background: `${engine.color}15` }}>
                        <engine.icon className="h-5 w-5" style={{ color: engine.color }} />
                      </div>
                      <div>
                        <div className="font-bold text-sm font-mono tracking-wide" style={{ color: "hsl(0 0% 92%)" }}>{engine.name}</div>
                        <div className="text-xs font-mono" style={{ color: "hsl(215 15% 40%)" }}>ENGINE</div>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: "hsl(215 15% 55%)" }}>{engine.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* AGENTS GRID */}
        <section className="border-t border-b" style={{ borderColor: "hsl(215 20% 10%)" }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
            <div className="text-center mb-12">
              <Badge className="mb-4 text-xs font-mono tracking-widest border" style={{
                borderColor: "hsl(220 10% 70% / 0.3)",
                background: "hsl(220 10% 70% / 0.06)",
                color: "hsl(220 10% 75%)",
              }}>
                8 AUTONOMOUS AGENTS
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "hsl(0 0% 95%)" }}>
                Autonomous <span style={{ color: "hsl(220 10% 80%)" }}>Robotics Operations</span>
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {AGENT_DATA.map((agent, i) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="p-5 rounded-xl border" style={{
                    borderColor: "hsl(215 20% 12%)",
                    background: "hsl(215 25% 6%)",
                  }}
                >
                  <div className="font-bold text-sm font-mono tracking-wide mb-1" style={{ color: "hsl(0 0% 90%)" }}>
                    {agent.name}
                  </div>
                  <div className="text-xs font-mono mb-2" style={{ color: "hsl(200 100% 55% / 0.6)" }}>AGENT</div>
                  <p className="text-xs" style={{ color: "hsl(215 15% 50%)" }}>{agent.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CAPABILITIES PREVIEW */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 sm:py-28">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3" style={{ color: "hsl(0 0% 95%)" }}>
              130+ Robotics <span style={{ color: "hsl(170 80% 50%)" }}>Capabilities</span>
            </h2>
            <p className="text-sm max-w-lg mx-auto" style={{ color: "hsl(215 15% 50%)" }}>
              Every capability is a discrete, testable robotics function — auto-discovered, 
              CJPI-scored, and deployable as a sealed runtime.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center max-w-4xl mx-auto">
            {CAPABILITIES_PREVIEW.map((cap) => (
              <span key={cap} className="px-3 py-1.5 rounded-md text-xs font-mono border" style={{
                borderColor: "hsl(215 20% 14%)",
                background: "hsl(215 25% 7%)",
                color: "hsl(215 15% 60%)",
              }}>
                {cap}
              </span>
            ))}
            <span className="px-3 py-1.5 rounded-md text-xs font-mono border" style={{
              borderColor: "hsl(200 100% 55% / 0.3)",
              background: "hsl(200 100% 55% / 0.08)",
              color: "hsl(200 100% 60%)",
            }}>
              +112 more
            </span>
          </div>
        </section>

        {/* ARCHITECTURE */}
        <section className="border-t" style={{ borderColor: "hsl(215 20% 10%)" }}>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
            <div className="p-8 sm:p-12 rounded-2xl border" style={{
              borderColor: "hsl(215 20% 12%)",
              background: "linear-gradient(135deg, hsl(215 25% 7%), hsl(215 30% 4%))",
            }}>
              <Cpu className="h-10 w-10 mx-auto mb-6" style={{ color: "hsl(200 100% 55%)" }} />
              <h3 className="text-2xl font-bold mb-3" style={{ color: "hsl(0 0% 95%)" }}>Same Spine. Different Actuators.</h3>
              <p className="text-sm max-w-xl mx-auto mb-8" style={{ color: "hsl(215 15% 50%)" }}>
                CMPSBL ROBOTICS™ inherits the 24-primitive Organ/Layer spine — CORE, BRAIN, MEMORY, 
                DEFENSE, GOVERNANCE, and the full compliance matrix. Only the Engines and Agents 
                are hot-swapped for robotics operations.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => window.open('https://cmpsbl.com', '_blank')}
                  className="text-xs"
                  style={{
                    borderColor: "hsl(215 20% 20%)",
                    color: "hsl(215 15% 60%)",
                  }}
                >
                  Explore Core Architecture <ExternalLink className="ml-2 h-3 w-3" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/ascension')}
                  className="text-xs"
                  style={{
                    borderColor: "hsl(200 100% 55% / 0.3)",
                    color: "hsl(200 100% 60%)",
                  }}
                >
                  Run Robotics Diagnostic <ArrowRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <RoboFooter />

        {/* JSON-LD */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "CMPSBL ROBOTICS™",
          "url": "https://robotics.cmpsbl.com",
          "description": "Cognitive robotics infrastructure by CMPSBL®",
          "publisher": {
            "@type": "Organization",
            "name": "CMPSBL®",
            "url": "https://cmpsbl.com",
            "parentOrganization": {
              "@type": "Organization",
              "name": "PromptFluid™",
              "url": "https://promptfluid.com",
            },
          },
          "isPartOf": {
            "@type": "WebSite",
            "name": "CMPSBL®",
            "url": "https://cmpsbl.com",
          },
        })}} />
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* ROBO NAV                                                       */
/* ═══════════════════════════════════════════════════════════════ */

function RoboNav({ navigate }: { navigate: (path: string) => void }) {
  return (
    <nav className="sticky top-0 z-50 border-b backdrop-blur-xl" style={{
      borderColor: "hsl(215 20% 10%)",
      background: "hsl(215 25% 4% / 0.9)",
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Cpu className="h-5 w-5" style={{ color: "hsl(200 100% 55%)" }} />
          <span className="font-bold text-sm tracking-wider" style={{ color: "hsl(0 0% 92%)" }}>CMPSBL ROBOTICS™</span>
        </div>
        <div className="hidden sm:flex items-center gap-6">
          <a href="https://cmpsbl.com" className="text-xs hover:underline" style={{ color: "hsl(215 15% 50%)" }}>
            CMPSBL.com
          </a>
          <Link to="/ascension" className="text-xs hover:underline" style={{ color: "hsl(215 15% 50%)" }}>
            Ascension
          </Link>
          <Link to="/showroom" className="text-xs hover:underline" style={{ color: "hsl(215 15% 50%)" }}>
            Scanners
          </Link>
          <Link to="/plans" className="text-xs hover:underline" style={{ color: "hsl(215 15% 50%)" }}>
            Plans
          </Link>
        </div>
        <Button
          size="sm"
          className="h-8 text-xs font-mono tracking-wide border-0"
          style={{
            background: "hsl(200 100% 50%)",
            color: "white",
          }}
          onClick={() => navigate('/ascension')}
        >
          <Bot className="mr-1.5 h-3 w-3" />
          START AUDIT
        </Button>
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
/* ROBO FOOTER                                                    */
/* ═══════════════════════════════════════════════════════════════ */

function RoboFooter() {
  return (
    <footer className="border-t" style={{ borderColor: "hsl(215 20% 10%)", background: "hsl(215 28% 3%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="h-4 w-4" style={{ color: "hsl(200 100% 55%)" }} />
              <span className="font-bold text-sm" style={{ color: "hsl(0 0% 92%)" }}>CMPSBL ROBOTICS™</span>
            </div>
            <p className="text-xs leading-relaxed" style={{ color: "hsl(215 15% 45%)" }}>
              Cognitive robotics infrastructure.
              A vertical substrate of CMPSBL® — Governed Cognitive Infrastructure by PromptFluid™.
            </p>
          </div>
          <div>
            <div className="text-xs font-bold mb-3" style={{ color: "hsl(215 15% 60%)" }}>SUBSTRATE</div>
            <div className="space-y-2">
              <Link to="/ascension" className="block text-xs hover:underline" style={{ color: "hsl(215 15% 45%)" }}>Robotics Audit</Link>
              <Link to="/showroom" className="block text-xs hover:underline" style={{ color: "hsl(215 15% 45%)" }}>Scanners</Link>
              <Link to="/plans" className="block text-xs hover:underline" style={{ color: "hsl(215 15% 45%)" }}>Plans</Link>
              <a href="https://cmpsbl.com" className="block text-xs hover:underline" style={{ color: "hsl(215 15% 45%)" }}>
                CMPSBL.com <ExternalLink className="inline h-3 w-3 ml-1" />
              </a>
            </div>
          </div>
          <div>
            <div className="text-xs font-bold mb-3" style={{ color: "hsl(215 15% 60%)" }}>PARENT</div>
            <div className="space-y-2">
              <a href="https://cmpsbl.com" className="block text-xs hover:underline" style={{ color: "hsl(215 15% 45%)" }}>CMPSBL® — Core Substrate</a>
              <a href="https://promptfluid.com" className="block text-xs hover:underline" style={{ color: "hsl(215 15% 45%)" }}>PromptFluid™ — Parent Company</a>
              <a href="https://security.cmpsbl.com" className="block text-xs hover:underline" style={{ color: "hsl(215 15% 45%)" }}>CMPSBL CYBER™</a>
              <a href="https://cmpsbl.com/privacy" className="block text-xs hover:underline" style={{ color: "hsl(215 15% 45%)" }}>Privacy Policy</a>
            </div>
          </div>
        </div>
        <div className="pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-3" style={{ borderColor: "hsl(215 20% 10%)" }}>
          <p className="text-xs" style={{ color: "hsl(215 15% 35%)" }}>
            © {new Date().getFullYear()} CMPSBL® · PromptFluid™ · All rights reserved.
          </p>
          <p className="text-xs" style={{ color: "hsl(215 15% 30%)" }}>
            robotics.cmpsbl.com · Vertical Cognitive Infrastructure
          </p>
        </div>
      </div>
    </footer>
  );
}
