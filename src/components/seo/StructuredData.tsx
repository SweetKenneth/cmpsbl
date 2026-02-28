/**
 * StructuredData — JSON-LD injection for FAQ, Article, BreadcrumbList, and Organization schemas.
 * Wire into any page via <StructuredData type="faq" data={...} />
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

type StructuredDataProps = FAQProps | ArticleProps | BreadcrumbProps | OrgProps;

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
    url: "https://cmpsbl.com",
    logo: "https://cmpsbl.com/logo.png",
    description: "Composable AI infrastructure — cognitive orchestration substrate for agentic systems.",
    sameAs: [
      "https://github.com/cmpsbl",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: "https://cmpsbl.com/contact",
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
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </Helmet>
  );
}
