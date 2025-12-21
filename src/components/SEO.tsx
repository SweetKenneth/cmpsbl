import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  noindex?: boolean;
  breadcrumbs?: Array<{ name: string; url: string }>;
  faq?: Array<{ question: string; answer: string }>;
}

export function SEO({
  title = 'PromptFluid™ — Applied AI Infrastructure',
  description = 'Applied AI company building autonomous systems, infrastructure tooling, and experimental interfaces. Six live products. 100+ projects shipped over 15 years.',
  canonical = 'https://promptfluid.com',
  image = 'https://promptfluid.com/og-default.jpg',
  type = 'website',
  author = 'Kenneth E Sweet Jr',
  publishedTime,
  modifiedTime,
  keywords = ['AI infrastructure', 'autonomous systems', 'WordPress security', 'accessibility compliance', 'AI orchestration', 'enterprise AI', 'bot detection', 'WCAG compliance'],
  noindex = false,
  breadcrumbs,
  faq
}: SEOProps) {
  const siteName = 'PromptFluid';
  const twitterHandle = '@promptfluid';
  const fullTitle = title.includes('PromptFluid') ? title : `${title} | ${siteName}`;

  // Structured Data - Organization (2026 Enhanced)
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PromptFluid',
    alternateName: ['PromptFluid AI', 'PF'],
    url: 'https://promptfluid.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://promptfluid.com/logo.png',
      width: 512,
      height: 512
    },
    image: 'https://promptfluid.com/og-default.jpg',
    description: 'Applied AI company building autonomous systems, infrastructure tooling, and experimental interfaces that scale.',
    foundingDate: '2009',
    founder: {
      '@type': 'Person',
      name: 'Kenneth E Sweet Jr',
      jobTitle: 'Founder & CEO',
      email: 'PromptFluid@gmail.com',
      url: 'https://promptfluid.com/about'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Palm Springs',
      addressRegion: 'CA',
      addressCountry: 'US'
    },
    sameAs: [
      'https://twitter.com/promptfluid',
      'https://x.com/promptfluid',
      'https://linkedin.com/company/promptfluid',
      'https://github.com/promptfluid',
      'https://youtube.com/@promptfluid'
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'Customer Service',
        email: 'PromptFluid@gmail.com',
        telephone: '+1-760-358-4324',
        availableLanguage: ['English']
      },
      {
        '@type': 'ContactPoint',
        contactType: 'Investor Relations',
        email: 'PromptFluid@gmail.com',
        availableLanguage: ['English']
      }
    ],
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      value: '1-10'
    },
    knowsAbout: [
      'Artificial Intelligence',
      'Machine Learning',
      'WordPress Security',
      'Web Accessibility',
      'WCAG Compliance',
      'Bot Detection',
      'Autonomous Systems'
    ]
  };

  // Structured Data - Website (Enhanced)
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    alternateName: 'PromptFluid AI',
    url: 'https://promptfluid.com',
    description: description,
    inLanguage: 'en-US',
    publisher: {
      '@type': 'Organization',
      name: 'PromptFluid',
      logo: {
        '@type': 'ImageObject',
        url: 'https://promptfluid.com/logo.png'
      }
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://promptfluid.com/blog?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };

  // Structured Data - WebPage (Enhanced)
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebPage',
    name: fullTitle,
    headline: fullTitle,
    description: description,
    url: canonical,
    image: {
      '@type': 'ImageObject',
      url: image,
      width: 1200,
      height: 630
    },
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      url: 'https://promptfluid.com',
      name: 'PromptFluid'
    },
    about: {
      '@type': 'Thing',
      name: 'Applied AI Infrastructure'
    },
    ...(author && {
      author: {
        '@type': 'Person',
        name: author,
        url: 'https://promptfluid.com/about'
      }
    }),
    ...(publishedTime && { datePublished: publishedTime }),
    ...(modifiedTime && { dateModified: modifiedTime }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical
    }
  };

  // Structured Data - SoftwareApplication
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PromptFluid Platform',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      ratingCount: '312',
      bestRating: '5',
      worstRating: '1'
    },
    description: 'Enterprise AI platform with six integrated modules for autonomous systems, security, and accessibility.',
    featureList: [
      'AI-Powered Bot Detection',
      'WCAG 2.2 Accessibility Scanning',
      'Autonomous System Orchestration',
      'Multi-Provider AI Gateway'
    ]
  };

  // Breadcrumb Schema (if provided)
  const breadcrumbSchema = breadcrumbs ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  } : null;

  // FAQ Schema (if provided)
  const faqSchema = faq ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonical} />
      
      {/* 2026 SEO Enhancements */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="google" content="notranslate" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      
      {/* Performance Hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://promptfluid.com" />
      <link rel="preload" as="image" href={image} />
      
      {/* Viewport & Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      <meta name="theme-color" content="#1e6bb8" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#4a90c2" media="(prefers-color-scheme: dark)" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="PromptFluid" />
      
      {/* Open Graph / Facebook (2026 Enhanced) */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:updated_time" content={modifiedTime || new Date().toISOString()} />
      
      {/* Twitter Card (2026 Enhanced) */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={fullTitle} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:domain" content="promptfluid.com" />
      
      {/* Article-specific (if article) */}
      {type === 'article' && publishedTime && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:author" content={author} />
          <meta property="article:section" content="Technology" />
        </>
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      
      {/* Advanced Robots & Indexing */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large"} />
      <meta name="bingbot" content={noindex ? "noindex, nofollow" : "index, follow"} />
      
      {/* RSS & Alternates */}
      <link rel="alternate" type="application/rss+xml" title={`${siteName} Blog RSS`} href="/rss.xml" />
      <link rel="alternate" hrefLang="en" href={canonical} />
      
      {/* Structured Data JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(webPageSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(softwareSchema)}
      </script>
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
    </Helmet>
  );
}
