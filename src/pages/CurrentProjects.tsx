import { Shield, Zap, Globe, Brain, ArrowRight, Code2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate, Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

export default function CurrentProjects() {
  const navigate = useNavigate();

  const projects = [
    {
      id: "defense",
      name: "PromptFluid Reflex",
      tagline: "AI-Powered WordPress Security",
      description: "Stop sophisticated bot attacks with behavioral AI. Advanced threat detection that learns from your site's patterns to protect against credential stuffing, spam bots, and automated attacks.",
      icon: Shield,
      status: "Live",
      statusColor: "bg-green-500",
      features: [
        "AI bot detection with behavioral analysis",
        "Real-time threat blocking",
        "Smart learning system",
        "File integrity monitoring",
        "Web application firewall",
        "Malware scanner"
      ],
      href: "/projects/defense",
      gradient: "from-purple-500 via-blue-500 to-cyan-500",
      version: "v1.0.0",
      downloads: "2.5K+",
      rating: "4.9/5.0"
    },
    {
      id: "studio",
      name: "PromptFluid Studio",
      tagline: "Rapid Application Builder",
      description: "Transform ideas into production-ready applications in minutes. AI-assisted development with automatic deployment, security, and optimization built-in.",
      icon: Code2,
      status: "Beta",
      statusColor: "bg-blue-500",
      features: [
        "AI-powered code generation",
        "Instant deployment",
        "Automatic optimization",
        "Built-in security",
        "Component library",
        "Real-time preview"
      ],
      href: "/products/studio",
      gradient: "from-pink-500 via-purple-500 to-indigo-500",
      version: "v0.9.2",
      downloads: "1.2K+",
      rating: "4.7/5.0"
    },
    {
      id: "brain",
      name: "PromptFluid Brain",
      tagline: "Adaptive AI Orchestration",
      description: "The intelligence layer that powers the entire ecosystem. Machine learning models that analyze patterns, predict threats, and optimize system performance automatically.",
      icon: Brain,
      status: "Live",
      statusColor: "bg-green-500",
      features: [
        "ML-powered threat detection",
        "Behavioral pattern analysis",
        "Anomaly detection",
        "Predictive intelligence",
        "Auto-remediation",
        "Continuous learning"
      ],
      href: "/brain-ml",
      gradient: "from-cyan-500 via-teal-500 to-green-500",
      version: "v2.1.0",
      downloads: "Internal",
      rating: "Enterprise"
    },
    {
      id: "ripple",
      name: "PromptFluid Ripple",
      tagline: "Network Integration Hub",
      description: "Unified platform where all tools communicate seamlessly. API orchestration, service mesh, and real-time data flow between all PromptFluid products.",
      icon: Zap,
      status: "Alpha",
      statusColor: "bg-yellow-500",
      features: [
        "API gateway & routing",
        "Service mesh integration",
        "Real-time webhooks",
        "Queue management",
        "Event streaming",
        "Cross-product sync"
      ],
      href: "/products/ripple",
      gradient: "from-orange-500 via-red-500 to-pink-500",
      version: "v0.5.1",
      downloads: "Internal",
      rating: "Alpha"
    },
    {
      id: "access",
      name: "PromptFluid Access",
      tagline: "Universal Accessibility Platform",
      description: "Make the web accessible to everyone. Automated WCAG compliance, screen reader optimization, and tools that ensure your applications work for all users.",
      icon: Globe,
      status: "Coming Soon",
      statusColor: "bg-gray-500",
      features: [
        "Automated WCAG compliance",
        "Screen reader optimization",
        "Keyboard navigation",
        "Color contrast analyzer",
        "Alt text generation",
        "Accessibility reports"
      ],
      href: "/products/access",
      gradient: "from-indigo-500 via-violet-500 to-purple-500",
      version: "v0.1.0",
      downloads: "TBA",
      rating: "Preview"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <SEO 
        title="Current Projects | PromptFluid™ — Building the Future"
        description="Explore PromptFluid's ecosystem of AI-powered tools: Reflex (WordPress security), Studio (app builder), Brain (ML orchestration), Ripple (integration hub), and Access (accessibility platform)."
        canonical="https://promptfluid.com/projects"
        keywords={[
          'PromptFluid projects',
          'AI security tools',
          'WordPress protection',
          'rapid app development',
          'ML orchestration',
          'API integration platform',
          'web accessibility tools',
          'intelligent software ecosystem',
          'AI-powered products',
          'developer tools'
        ]}
      />

      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Back to Home</span>
        </Link>

        <div className="max-w-4xl mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium">Our Ecosystem</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Current Projects
            </span>
          </h1>

          <p className="text-xl text-muted-foreground leading-relaxed">
            Explore the PromptFluid ecosystem — intelligent tools that work together to secure, build, and optimize your applications. 
            From WordPress security to AI orchestration, each project is designed to flow seamlessly into your workflow.
          </p>
        </div>

        {/* Projects Grid */}
        <div className="grid gap-8 max-w-7xl">
          {projects.map((project, index) => (
            <Card 
              key={project.id}
              className="group p-8 glass border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-elegant cursor-pointer overflow-hidden relative"
              onClick={() => navigate(project.href)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${project.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

              <div className="relative z-10 flex flex-col lg:flex-row gap-8">
                {/* Left: Icon & Status */}
                <div className="flex-shrink-0">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${project.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <project.icon className="w-10 h-10 text-white" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${project.statusColor} animate-pulse`} />
                    <span className="text-sm font-medium text-muted-foreground">{project.status}</span>
                  </div>
                </div>

                {/* Middle: Details */}
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
                    {project.name}
                  </h2>
                  <p className="text-lg text-primary font-medium mb-4">{project.tagline}</p>
                  <p className="text-muted-foreground leading-relaxed mb-6">
                    {project.description}
                  </p>

                  {/* Features Grid */}
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-6">
                    {project.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${project.gradient}`} />
                        <span className="text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Version:</span> {project.version}
                    </div>
                    <div>
                      <span className="font-medium">Downloads:</span> {project.downloads}
                    </div>
                    <div>
                      <span className="font-medium">Rating:</span> {project.rating}
                    </div>
                  </div>
                </div>

                {/* Right: CTA */}
                <div className="flex-shrink-0 flex items-center">
                  <Button 
                    className="group/btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(project.href);
                    }}
                  >
                    <span>View Project</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 max-w-4xl mx-auto text-center p-12 rounded-3xl glass border border-primary/20">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-primary-variant to-accent bg-clip-text text-transparent">
              Want to Contribute?
            </span>
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            PromptFluid is building the future of intelligent software. Join our developer community and help shape the next generation of AI-powered tools.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/contact')}>
              Get in Touch
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/about')}>
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
