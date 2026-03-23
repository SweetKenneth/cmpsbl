/**
 * CMPSBL Team Directory
 * Centralized team member data, department contacts, and blog author pool
 */

// Photo imports
import founderPhoto from "@/assets/founder-kenneth-sweet.png";
import sarahChenPhoto from "@/assets/team/sarah-chen.jpg";
import marcusRodriguezPhoto from "@/assets/team/marcus-rodriguez.jpg";
import priyaNakamuraPhoto from "@/assets/team/priya-nakamura.jpg";
import jamesWhitfieldPhoto from "@/assets/team/james-whitfield.jpg";
import elenaVasquezPhoto from "@/assets/team/elena-vasquez.jpg";

export interface TeamMember {
  name: string;
  role: string;
  department: string;
  photo: string;
  bio: string;
  email: string;
  expertise: string[];
  isFounder?: boolean;
  orcid?: string;
}

export interface Department {
  name: string;
  email: string;
  phone: string;
  description: string;
  head: string;
}

export const COMPANY_PHONE = "(760) FLUID-AI";
export const COMPANY_PHONE_TEL = "tel:+17603584324";

export const TEAM_MEMBERS: TeamMember[] = [
  {
    name: "Kenneth E Sweet Jr",
    role: "Founder & Chief Architect",
    department: "Executive",
    photo: founderPhoto,
    bio: "Kenneth E Sweet Jr is the founder of CMPSBL and the architect behind the cognitive orchestration substrate — a 40-primitive AI operating system organized across 4 categories with 675+ capabilities spanning 175,000+ lines of production code. He has been shipping software since 2009 and leads the company's vision for persistent memory, governed orchestration, and autonomous self-improvement in enterprise AI.",
    email: "founder@CMPSBL.com",
    expertise: ["AI Architecture", "Persistent Memory", "Cognitive Systems", "Multi-Provider Routing", "Self-Evolving Code"],
    isFounder: true,
    orcid: "https://orcid.org/0009-0001-4237-1243",
  },
  {
    name: "Dr. Sarah Chen",
    role: "Head of AI Research",
    department: "Research",
    photo: sarahChenPhoto,
    bio: "Dr. Sarah Chen leads CMPSBL's AI research division, focusing on multi-agent cognition, dream cycle optimization, and memory consolidation architectures. She holds a PhD in Machine Learning from Stanford and previously worked on large-scale distributed AI systems at Google DeepMind.",
    email: "research@CMPSBL.com",
    expertise: ["Machine Learning", "Multi-Agent Systems", "Memory Architectures", "Dream Cycles"],
  },
  {
    name: "Marcus Rodriguez",
    role: "Senior Systems Engineer",
    department: "Engineering",
    photo: marcusRodriguezPhoto,
    bio: "Marcus Rodriguez is a senior systems engineer at CMPSBL responsible for substrate runtime performance, edge function orchestration, and the NEXUS multi-provider routing layer. He specializes in low-latency distributed systems and has contributed to infrastructure at Cloudflare and Vercel.",
    email: "engineering@CMPSBL.com",
    expertise: ["Distributed Systems", "Runtime Performance", "Edge Computing", "Infrastructure"],
  },
  {
    name: "Priya Nakamura",
    role: "Junior Developer & DevOps",
    department: "Engineering",
    photo: priyaNakamuraPhoto,
    bio: "Priya Nakamura is a junior developer and DevOps engineer at CMPSBL, working on CI/CD chains, capability pack tooling, and developer experience. She contributes to the EVOLUTION node's self-upgrade capabilities and maintains the substrate's deployment infrastructure.",
    email: "devops@CMPSBL.com",
    expertise: ["DevOps", "CI/CD", "Developer Experience", "Automation"],
  },
  {
    name: "James Whitfield",
    role: "Security Researcher",
    department: "Security",
    photo: jamesWhitfieldPhoto,
    bio: "James Whitfield is a security researcher at CMPSBL leading threat modeling, penetration testing, and behavioral fingerprinting development for the DEFENSE module. He previously served as a security analyst at CrowdStrike and holds OSCP and GIAC certifications.",
    email: "security@CMPSBL.com",
    expertise: ["Threat Modeling", "Penetration Testing", "Behavioral Analysis", "Zero-Trust Architecture"],
  },
  {
    name: "Elena Vasquez",
    role: "VP of Communications",
    department: "Public Relations",
    photo: elenaVasquezPhoto,
    bio: "Elena Vasquez leads CMPSBL's communications, press relations, and brand strategy. She oversees the company's public-facing content, media partnerships, and community engagement. She previously managed tech communications at Salesforce and IBM Research.",
    email: "press@CMPSBL.com",
    expertise: ["Communications", "Brand Strategy", "Media Relations", "Community"],
  },
];

export const DEPARTMENTS: Department[] = [
  {
    name: "General Inquiries",
    email: "hello@CMPSBL.com",
    phone: COMPANY_PHONE,
    description: "Questions about CMPSBL, partnership opportunities, or general information.",
    head: "Elena Vasquez",
  },
  {
    name: "Sales & Enterprise",
    email: "sales@CMPSBL.com",
    phone: COMPANY_PHONE,
    description: "Custom deployments, enterprise licensing, volume pricing, and self-hosted solutions.",
    head: "Kenneth E Sweet Jr",
  },
  {
    name: "Engineering & Support",
    email: "engineering@CMPSBL.com",
    phone: COMPANY_PHONE,
    description: "Technical support, API access, integration guidance, and developer relations.",
    head: "Marcus Rodriguez",
  },
  {
    name: "AI Research",
    email: "research@CMPSBL.com",
    phone: COMPANY_PHONE,
    description: "Research collaborations, academic partnerships, and publication inquiries.",
    head: "Dr. Sarah Chen",
  },
  {
    name: "Security",
    email: "security@CMPSBL.com",
    phone: COMPANY_PHONE,
    description: "Vulnerability reports, security audits, compliance certifications, and threat intelligence.",
    head: "James Whitfield",
  },
  {
    name: "Public Relations & Press",
    email: "press@CMPSBL.com",
    phone: COMPANY_PHONE,
    description: "Media inquiries, press kits, speaking engagements, and interview requests.",
    head: "Elena Vasquez",
  },
  {
    name: "Human Resources",
    email: "hr@CMPSBL.com",
    phone: COMPANY_PHONE,
    description: "Career opportunities, internships, and workplace culture inquiries.",
    head: "Elena Vasquez",
  },
];

/** Blog author pool — used to vary bylines across posts */
export const BLOG_AUTHORS = {
  founder: TEAM_MEMBERS[0],
  research: TEAM_MEMBERS[1],
  engineering: TEAM_MEMBERS[2],
  devops: TEAM_MEMBERS[3],
  security: TEAM_MEMBERS[4],
  communications: TEAM_MEMBERS[5],
};

/** Get team member by name */
export function getTeamMember(name: string): TeamMember | undefined {
  return TEAM_MEMBERS.find(m => m.name === name);
}

/** Get founder specifically */
export function getFounder(): TeamMember {
  return TEAM_MEMBERS[0];
}
