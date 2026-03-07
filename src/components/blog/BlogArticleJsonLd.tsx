/**
 * JSON-LD structured data for blog articles.
 * Outputs Article schema + BreadcrumbList for rich results.
 */
import { Helmet } from "react-helmet-async";

interface Props {
  title: string;
  description: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  imageUrl?: string;
  keywords?: string[];
}

const SITE = "https://cmpsbl.com";
const ORG = {
  "@type": "Organization",
  name: "CMPSBL",
  url: SITE,
  logo: `${SITE}/og-image.png`,
};

export function BlogArticleJsonLd({
  title,
  description,
  slug,
  datePublished,
  dateModified,
  imageUrl,
  keywords,
}: Props) {
  const url = `${SITE}/blog/${slug}`;

  const article = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished,
    dateModified: dateModified || datePublished,
    author: { "@type": "Organization", name: "CMPSBL" },
    publisher: ORG,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(keywords?.length ? { keywords: keywords.join(", ") } : {}),
    inLanguage: "en-US",
    isPartOf: {
      "@type": "Blog",
      name: "CMPSBL Research & Insights",
      url: `${SITE}/blog`,
    },
  };

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
      { "@type": "ListItem", position: 3, name: title, item: url },
    ],
  };

  return (
    <Helmet>
      <link rel="canonical" href={url} />
      <script type="application/ld+json">{JSON.stringify(article)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbs)}</script>
    </Helmet>
  );
}
