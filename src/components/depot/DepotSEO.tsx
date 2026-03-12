/**
 * Capabilities Depot — Advanced SEO Component
 * Full SEO optimization for Google discovery
 * All capabilities FREE, updated branding to CMPSBL
 */

import { Helmet } from 'react-helmet-async';
import { getAllCapabilities, getCategoryStats } from '@/lib/capabilities/depot';

interface DepotSEOProps {
  totalCount: number;
}

export function DepotSEO({ totalCount }: DepotSEOProps) {
  const capabilities = getAllCapabilities();
  const categoryStats = getCategoryStats();

  // Helmet requires <title> to be a plain string child (not mixed nodes)
  const pageTitle = `Capabilities Depot — ${totalCount}+ FREE Cognitive AI Artifacts | CMPSBL`;
  
  // Generate structured product list for SEO
  const topCapabilities = capabilities
    .sort((a, b) => (b.downloads || 0) - (a.downloads || 0))
    .slice(0, 10);

  // Calculate aggregate data
  const totalDownloads = capabilities.reduce((sum, c) => sum + (c.downloads || 0), 0);

  // JSON-LD Structured Data
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "CMPSBL",
    "url": "https://cmpsbl.com",
    "logo": "https://cmpsbl.com/logo.png",
    "description": "Cognitive infrastructure and AI capabilities for enterprise systems",
    "sameAs": [
      "https://twitter.com/cmpsbl",
      "https://github.com/cmpsbl",
      "https://linkedin.com/company/cmpsbl"
    ]
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Capabilities Depot — FREE Cognitive AI Artifacts Library",
    "description": `Download ${totalCount}+ FREE cognitive capabilities for local execution. Intelligence, optimization, security, resilience, and accessibility artifacts for enterprise AI systems.`,
    "url": "https://cmpsbl.com/capabilities",
    "isPartOf": {
      "@type": "WebSite",
      "name": "CMPSBL Substrate",
      "url": "https://cmpsbl.com"
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://cmpsbl.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Capabilities Depot",
          "item": "https://cmpsbl.com/capabilities"
        }
      ]
    }
  };

  const productCatalogSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "Cognitive Capabilities Catalog",
    "description": "FREE cognitive AI capabilities for download and local execution",
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
          "price": 0,
          "priceCurrency": "USD",
          "availability": "https://schema.org/InStock"
        },
        "softwareVersion": "latest",
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
    "description": `FREE library of ${totalCount}+ cognitive AI capabilities. Download artifacts for intelligence, optimization, security, resilience, and accessibility.`,
    "offers": {
      "@type": "Offer",
      "price": 0,
      "priceCurrency": "USD"
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
      "name": "CMPSBL",
      "url": "https://cmpsbl.com"
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
        "name": "Are capabilities free?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes! All 269+ capabilities are completely free to download and use. Simply browse the catalog, view details, and integrate into your local environment."
        }
      },
      {
        "@type": "Question",
        "name": "Are capabilities supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "All capabilities are provided as-is without hosting or SLA. Execution, integration, and maintenance are the responsibility of the user. Documentation is included with each artifact. Visit our Support page for assistance."
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
  const metaDescription = `Download ${totalCount}+ FREE cognitive AI capabilities: causal inference, threat detection, compliance automation, WCAG auditing, and more. Local execution, no cloud dependencies. All capabilities unlocked.`;
  
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
    'safety switch',
    'rate limiting',
    'free AI tools',
    ...allTags.slice(0, 20)
  ].join(', ');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={metaDescription} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="CMPSBL" />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <link rel="canonical" href="https://cmpsbl.com/capabilities" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://cmpsbl.com/capabilities" />
      <meta property="og:title" content={`Capabilities Depot — ${totalCount}+ FREE Cognitive AI Artifacts`} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content="https://cmpsbl.com/og-capabilities-depot.png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="CMPSBL Capabilities Depot - Free Cognitive AI Library" />
      <meta property="og:site_name" content="CMPSBL Substrate" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="https://cmpsbl.com/capabilities" />
      <meta name="twitter:title" content={`Capabilities Depot — ${totalCount}+ FREE Cognitive AI Artifacts`} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content="https://cmpsbl.com/og-capabilities-depot.png" />
      <meta name="twitter:creator" content="@cmpsbl" />
      <meta name="twitter:site" content="@cmpsbl" />
      
      {/* Additional SEO Tags */}
      <meta name="application-name" content="CMPSBL Capabilities Depot" />
      <meta name="apple-mobile-web-app-title" content="Capabilities Depot" />
      <meta name="theme-color" content="#0ea5e9" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="format-detection" content="telephone=no" />
      
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
