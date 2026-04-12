/**
 * StructuredData — JSON-LD injection for rich results in Google Search.
 * Supports: FAQ, Article, BreadcrumbList, Organization, SoftwareApplication,
 * WebApplication, Product, WebSite.
 */

import { Helmet } from "react-helmet-async";

// ── FAQ Schema ──
interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  type: "faq";
  data: { items: FAQItem[] };
}

// ── Article Schema ──
interface ArticleProps {
  type: "article";
  data: {
    title: string;
    description: string;
    author: string;
    datePublished: string;
    dateModified?: string;
    image?: string;
    url: string;
  };
}

// ── Breadcrumb Schema ──
interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbProps {
  type: "breadcrumb";
  data: { items: BreadcrumbItem[] };
}

// ── Organization Schema ──
interface OrgProps {
  type: "organization";
  data?: Record<string, never>;
}

// ── SoftwareApplication Schema ──
interface SoftwareAppProps {
  type: "softwareApplication";
  data?: {
    name?: string;
    description?: string;
    price?: string;
    features?: string;
  };
}

// ── WebApplication Schema ──
interface WebAppProps {
  type: "webApplication";
  data: {
    name: string;
    description: string;
    url: string;
    features: string;
  };
}

// ── Product Schema ──
interface ProductProps {
  type: "product";
  data: {
    name: string;
    description: string;
    url: string;
    price: string;
    priceCurrency?: string;
    image?: string;
    sku?: string;
    category?: string;
  };
}

// ── WebSite Schema ──
interface WebSiteProps {
  type: "webSite";
  data?: Record<string, never>;
}

type StructuredDataProps =
  | FAQProps
  | ArticleProps
  | BreadcrumbProps
  | OrgProps
  | SoftwareAppProps
  | WebAppProps
  | ProductProps
  | WebSiteProps;

function buildFAQ(items: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(i => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: i.answer,
      },
    })),
  };
}

function buildArticle(data: ArticleProps["data"]) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: data.title,
    description: data.description,
    author: { "@type": "Person", name: data.author },
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    image: data.image || "https://cmpsbl.com/og/home.jpg",
    url: data.url,
    publisher: {
      "@type": "Organization",
      name: "CMPSBL",
      url: "https://cmpsbl.com",
      logo: { "@type": "ImageObject", url: "https://cmpsbl.com/logo.png" },
    },
  };
}

function buildBreadcrumb(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

function buildOrganization() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "CMPSBL",
    alternateName: "CMPSBL®",
    url: "https://cmpsbl.com",
    logo: "https://cmpsbl.com/logo.png",
    description: "Governed cognitive infrastructure — patented dual-layer technology where your code stays unchanged and everything around it evolves.",
    foundingDate: "2024",
    founder: {
      "@type": "Person",
      name: "Kenneth E. Sweet Jr.",
    },
    parentOrganization: {
      "@type": "Organization",
      name: "PromptFluid™",
      url: "https://promptfluid.com",
    },
    sameAs: [
      "https://github.com/cmpsbl",
      "https://www.npmjs.com/org/cmpsbl",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@cmpsbl.com",
    },
  };
}

function buildSoftwareApplication(data?: SoftwareAppProps["data"]) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: data?.name || "CMPSBL",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    description: data?.description || "Governed cognitive infrastructure with 40 primitives — persistent memory, AI routing, security hardening, and autonomous evolution for any codebase.",
    url: "https://cmpsbl.com",
    offers: {
      "@type": "Offer",
      price: data?.price || "0",
      priceCurrency: "USD",
      description: "Builder tier — free forever",
    },
    featureList: data?.features || "Persistent Memory, AI Routing (NEXUS), Security Hardening (DEFENSE), Autonomous Evolution, Code Ascension, Crown Jewel Discovery",
  };
}

function buildWebApplication(data: WebAppProps["data"]) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: data.name,
    description: data.description,
    url: data.url,
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    featureList: data.features,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    creator: {
      "@type": "Organization",
      name: "CMPSBL",
      url: "https://cmpsbl.com",
    },
  };
}

function buildProduct(data: ProductProps["data"]) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: data.name,
    description: data.description,
    url: data.url,
    image: data.image,
    sku: data.sku,
    category: data.category,
    brand: {
      "@type": "Organization",
      name: "CMPSBL",
    },
    offers: {
      "@type": "Offer",
      price: data.price,
      priceCurrency: data.priceCurrency || "USD",
      availability: "https://schema.org/InStock",
      url: data.url,
    },
  };
}

function buildWebSite() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CMPSBL",
    url: "https://cmpsbl.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://cmpsbl.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function StructuredData(props: StructuredDataProps) {
  let jsonLd: object;

  switch (props.type) {
    case "faq":
      jsonLd = buildFAQ(props.data.items);
      break;
    case "article":
      jsonLd = buildArticle(props.data);
      break;
    case "breadcrumb":
      jsonLd = buildBreadcrumb(props.data.items);
      break;
    case "organization":
      jsonLd = buildOrganization();
      break;
    case "softwareApplication":
      jsonLd = buildSoftwareApplication(props.data);
      break;
    case "webApplication":
      jsonLd = buildWebApplication(props.data);
      break;
    case "product":
      jsonLd = buildProduct(props.data);
      break;
    case "webSite":
      jsonLd = buildWebSite();
      break;
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
