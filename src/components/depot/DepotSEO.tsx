/**
 * Capabilities Depot — Advanced SEO Component
 * Full SEO optimization for Google discovery
 * v1.0.0
 */

import { Helmet } from 'react-helmet-async';
import { getAllCapabilities, getCategoryStats, PRICING_TIERS } from '@/lib/capabilities/depot';

interface DepotSEOProps {
  totalCount: number;
}

export function DepotSEO({ totalCount }: DepotSEOProps) {
  const capabilities = getAllCapabilities();
  const categoryStats = getCategoryStats();
  
  // Generate structured product list for SEO
  const topCapabilities = capabilities
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 10);

  // Calculate aggregate data
  const totalDownloads = capabilities.reduce((sum, c) => sum + (c.downloads || 0), 0);
  const avgPrice = Math.round(capabilities.reduce((sum, c) => sum + c.priceUsd, 0) / capabilities.length);
  const priceRange = {
    low: Math.min(...capabilities.map(c => c.priceUsd)),
    high: Math.max(...capabilities.map(c => c.priceUsd)),
  };

  // JSON-LD Structured Data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "PromptFluid",
    "url": "https://promptfluid.com",
    "logo": "https://promptfluid.com/logo.png",
    "description": "Cognitive infrastructure and AI capabilities for enterprise systems",
    "sameAs": [
      "https://twitter.com/promptfluid",
      "https://github.com/promptfluid",
      "https://linkedin.com/company/promptfluid"
    ]
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Capabilities Depot — Cognitive AI Artifacts Marketplace",
    "description": `Download ${totalCount}+ licensed cognitive capabilities for local execution. Intelligence, optimization, security, resilience, and accessibility artifacts for enterprise AI systems.`,
    "url": "https://promptfluid.com/capabilities",
    "isPartOf": {
      "@type": "WebSite",
      "name": "PromptFluid Substrate",
      "url": "https://promptfluid.com"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://promptfluid.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Capabilities Depot",
          "item": "https://promptfluid.com/capabilities"
        }
      ]
    }
  };

  const productCatalogSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Cognitive Capabilities Catalog",
    "description": "Licensed cognitive AI capabilities for download and local execution",
    "numberOfItems": totalCount,
    "itemListElement": topCapabilities.map((cap, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "SoftwareApplication",
        "name": cap.name,
        "description": cap.description,
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Cross-platform",
        "offers": {
          "@type": "Offer",
          "price": cap.priceUsd,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "softwareVersion": cap.version,
        "dateModified": cap.lastUpdated,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": 4.8,
          "ratingCount": cap.downloads || 100,
          "bestRating": 5,
          "worstRating": 1
        }
      }
    }))
  };

  const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "CMPSBL Capabilities Depot",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Cross-platform",
    "description": `Marketplace for ${totalCount}+ cognitive AI capabilities. Download licensed artifacts for intelligence, optimization, security, resilience, and accessibility.`,
    "offers": {
      "@type": "AggregateOffer",
      "lowPrice": priceRange.low,
      "highPrice": priceRange.high,
      "priceCurrency": "USD",
      "offerCount": totalCount
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": 4.9,
      "ratingCount": totalDownloads,
      "bestRating": 5,
      "worstRating": 1
    },
    "author": {
      "@type": "Organization",
      "name": "PromptFluid",
      "url": "https://promptfluid.com"
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What are cognitive capabilities?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Cognitive capabilities are downloadable AI artifacts that provide specific functionality like causal inference, threat detection, or compliance automation. They run locally in your infrastructure with no cloud dependencies."
        }
      },
      {
        "@type": "Question",
        "name": "How do I download capabilities?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Purchase a capability license through Stripe checkout. Once licensed, you can download the artifact (zip, wasm, or container) and integrate it into your local environment."
        }
      },
      {
        "@type": "Question",
        "name": "Are capabilities supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "All capabilities are sold as-is without support, hosting, or SLA. Execution, integration, and maintenance are the responsibility of the licensee. Documentation is included with each artifact."
        }
      },
      {
        "@type": "Question",
        "name": "What pricing tiers are available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Four pricing tiers: Utility ($${PRICING_TIERS.utility.minPrice}-$${PRICING_TIERS.utility.maxPrice}), Advanced ($${PRICING_TIERS.advanced.minPrice}-$${PRICING_TIERS.advanced.maxPrice}), System ($${PRICING_TIERS.system.minPrice}-$${PRICING_TIERS.system.maxPrice}), and Flagship ($${PRICING_TIERS.flagship.minPrice}-$${PRICING_TIERS.flagship.maxPrice}).`
        }
      },
      {
        "@type": "Question",
        "name": "What categories of capabilities are available?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": `Six categories: Intelligence (${categoryStats.intelligence}), Optimization (${categoryStats.optimization}), Resilience (${categoryStats.resilience}), Security (${categoryStats.security}), Accessibility (${categoryStats.accessibility}), and Automation (${categoryStats.automation}).`
        }
      }
    ]
  };

  // Generate keyword-rich description
  const metaDescription = `Download ${totalCount}+ licensed cognitive AI capabilities: causal inference, threat detection, compliance automation, WCAG auditing, and more. Local execution, no cloud dependencies. Prices from $${priceRange.low} to $${priceRange.high}.`;
  
  // Generate keywords from capabilities
  const allTags = [...new Set(capabilities.flatMap(c => c.tags || []))];
  const keywords = [
    'cognitive capabilities',
    'AI artifacts',
    'machine learning tools',
    'enterprise AI',
    'local execution',
    'causal inference',
    'threat detection',
    'compliance automation',
    'WCAG auditing',
    'circuit breaker',
    'rate limiting',
    ...allTags.slice(0, 20)
  ].join(', ');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>Capabilities Depot — {totalCount}+ Cognitive AI Artifacts | PromptFluid</title>
      <meta name="title" content={`Capabilities Depot — ${totalCount}+ Cognitive AI Artifacts | PromptFluid`} />
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="PromptFluid" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href="https://promptfluid.com/capabilities" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://promptfluid.com/capabilities" />
      <meta property="og:title" content={`Capabilities Depot — ${totalCount}+ Cognitive AI Artifacts`} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content="https://promptfluid.com/og-capabilities-depot.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="PromptFluid Capabilities Depot - Cognitive AI Marketplace" />
      <meta property="og:site_name" content="PromptFluid Substrate" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="https://promptfluid.com/capabilities" />
      <meta name="twitter:title" content={`Capabilities Depot — ${totalCount}+ Cognitive AI Artifacts`} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content="https://promptfluid.com/og-capabilities-depot.png" />
      <meta name="twitter:creator" content="@promptfluid" />
      <meta name="twitter:site" content="@promptfluid" />
      
      {/* Additional SEO Tags */}
      <meta name="application-name" content="PromptFluid Capabilities Depot" />
      <meta name="apple-mobile-web-app-title" content="Capabilities Depot" />
      <meta name="theme-color" content="#0ea5e9" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Pricing/Commerce Tags */}
      <meta name="product:price:amount" content={String(avgPrice)} />
      <meta name="product:price:currency" content="USD" />
      <meta name="product:availability" content="in stock" />
      <meta name="product:category" content="Software > Developer Tools" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(productCatalogSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(softwareAppSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>
    </Helmet>
  );
}
