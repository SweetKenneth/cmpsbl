import { Helmet } from 'react-helmet-async';


interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  image?: string;
  type?: 'website' | 'article' | 'product' | 'service';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  noindex?: boolean;
  breadcrumbs?: Array<{ name: string; url: string }>;
  faq?: Array<{ question: string; answer: string }>;
  product?: {
    name: string;
    price?: string;
    currency?: string;
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
    rating?: number;
    reviewCount?: number;
  };
  video?: {
    name: string;
    description: string;
    thumbnailUrl: string;
    uploadDate: string;
    duration?: string;
    embedUrl?: string;
  };
  howTo?: {
    name: string;
    description: string;
    steps: Array<{ name: string; text: string; image?: string }>;
    totalTime?: string;
  };
  // 2026 GEO (Generative Engine Optimization) props
  entityType?: string;
  expertise?: string[];
  contentFreshness?: 'evergreen' | 'news' | 'dated';
  topicCluster?: string;
  relatedTopics?: string[];
  // 2026 Local SEO
  localBusiness?: {
    name: string;
    telephone?: string;
    address?: {
      streetAddress?: string;
      addressLocality: string;
      addressRegion: string;
      postalCode: string;
      addressCountry: string;
    };
    geo?: {
      latitude: number;
      longitude: number;
    };
    openingHours?: string;
  };
  // 2026 Event Schema
  event?: {
    name: string;
    startDate: string;
    endDate?: string;
    location?: string;
    description?: string;
    organizer?: string;
  };
  // 2026 Review Schema
  review?: {
    itemReviewed: string;
    rating: number;
    author: string;
    reviewBody?: string;
  };
}

export function SEO({
  title = 'Composable AI Infrastructure | CMPSBL',
  description = 'CMPSBL is governed cognitive infrastructure where intelligence persists, adapts, and compounds. Modular AI substrate for self-improving systems.',
  canonical,
  image = 'https://cmpsbl.com/og-memory-stream.jpg',
  type = 'website',
  author = 'CMPSBL Research Team',
  publishedTime,
  modifiedTime,
  keywords = ['composable AI', 'cognitive infrastructure', 'AI substrate', 'persistent memory', 'self-improving software', 'governed AI', 'adaptive intelligence'],
  noindex = false,
  breadcrumbs,
  faq,
  product,
  video,
  howTo
}: SEOProps) {
  const siteName = 'CMPSBL';
  const twitterHandle = '@cmpsbl';

  // Strip version numbers from all SEO-facing strings (per custom instructions)
  const stripVersions = (text: string): string =>
    text
      .replace(/\bv\d+(?:\.\d+)*/gi, '')    // v12, v12.0, v12.0.0
      .replace(/\bversion\s*\d+[\.\d]*/gi, '') // version 12.0.0
      .replace(/\s{2,}/g, ' ')
      .trim();

  const safeTitle = stripVersions(title);
  const safeDescription = stripVersions(description);
  const fullTitle = safeTitle.includes('CMPSBL') ? safeTitle : `${safeTitle} | ${siteName}`;
  const currentDate = new Date().toISOString();

  // Route-aware canonical: auto-generate from current path if not provided
  const resolvedCanonical = canonical || (() => {
    if (typeof window === 'undefined') return 'https://cmpsbl.com';
    const path = window.location.pathname;
    return `https://cmpsbl.com${path === '/' ? '' : path}`;
  })();

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://cmpsbl.com/#organization',
    name: 'CMPSBL',
    alternateName: ['CMPSBL Substrate', 'CMPSBL®', 'Composable', 'Clockless Cognitive Reality'],
    url: 'https://cmpsbl.com',
    logo: {
      '@type': 'ImageObject',
      '@id': 'https://cmpsbl.com/#logo',
      url: 'https://cmpsbl.com/logo.png',
      contentUrl: 'https://cmpsbl.com/logo.png',
      width: 512,
      height: 512,
      caption: 'CMPSBL logo'
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://cmpsbl.com/og-default.jpg',
      width: 1200,
      height: 630
    },
    description: 'Composable cognitive infrastructure for AI applications. Persistent memory, adaptive intelligence, governed orchestration.',
    foundingDate: '2009',
    slogan: 'Where Machines Learn To Think',
    founder: {
      '@type': 'Person',
      '@id': 'https://cmpsbl.com/#founder',
      name: 'Kenneth E Sweet Jr',
      jobTitle: 'Founder',
      email: 'Dev@CMPSBL.com',
      url: 'https://cmpsbl.com/about'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Dallas',
      addressRegion: 'TX',
      postalCode: '75201',
      addressCountry: 'US'
    },
    sameAs: [
      'https://twitter.com/cmpsbl',
      'https://x.com/cmpsbl',
      'https://linkedin.com/company/cmpsbl',
      'https://github.com/cmpsbl'
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'general',
        email: 'Dev@CMPSBL.com',
        telephone: '+1-760-358-4324',
        availableLanguage: ['English'],
        areaServed: 'Worldwide'
      }
    ],
    knowsAbout: [
      'Cognitive Infrastructure',
      'AI Memory Systems',
      'Persistent Memory',
      'Self-Learning AI',
      'Multi-Provider Routing',
      'AI Orchestration',
      'Enterprise AI'
    ],
    areaServed: 'Worldwide'
  };

  // Website Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://cmpsbl.com/#website',
    name: siteName,
    alternateName: 'CMPSBL Substrate — Featuring Clockless Cognitive Reality',
    url: 'https://cmpsbl.com',
    description: safeDescription,
    inLanguage: 'en-US',
    publisher: { '@id': 'https://cmpsbl.com/#organization' },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://cmpsbl.com/blog?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    ]
  };

  // WebPage Schema
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : type === 'product' ? 'ProductPage' : 'WebPage',
    '@id': `${resolvedCanonical}#webpage`,
    name: fullTitle,
    headline: fullTitle,
    description: safeDescription,
    url: resolvedCanonical,
    image: {
      '@type': 'ImageObject',
      url: image,
      width: 1200,
      height: 630
    },
    inLanguage: 'en-US',
    isPartOf: { '@id': 'https://cmpsbl.com/#website' },
    about: { '@id': 'https://cmpsbl.com/#organization' },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: image
    },
    datePublished: publishedTime || '2009-01-01',
    dateModified: modifiedTime || currentDate,
    ...(author && {
      author: {
        '@type': 'Person',
        name: author,
        url: 'https://cmpsbl.com/about'
      }
    }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': resolvedCanonical
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.hero-description', '.product-title', 'article p:first-of-type']
    }
  };

  // Software Schema
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://cmpsbl.com/#software',
    name: 'CMPSBL Substrate — Featuring Clockless Cognitive Reality',
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'Cognitive Infrastructure Layer',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript',
    screenshot: image,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    description: 'Composable cognitive infrastructure for AI applications with persistent memory, adaptive intelligence, governed orchestration, and recursive improvement.',
    featureList: [
      'Persistent memory system',
      'Self-improving dream cycles',
      'Multi-provider AI routing',
      'Modular cognitive architecture',
      'Composable AI capabilities',
      'Enterprise-ready governed AI'
    ],
    author: { '@id': 'https://cmpsbl.com/#organization' },
    provider: { '@id': 'https://cmpsbl.com/#organization' }
  };

  // Breadcrumb Schema
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

  // FAQ Schema
  const faqSchema = faq && faq.length > 0 ? {
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

  // Product Schema
  const productSchema = product ? {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: safeDescription,
    image: image,
    brand: { '@id': 'https://cmpsbl.com/#organization' },
    offers: {
      '@type': 'Offer',
      price: product.price || '0',
      priceCurrency: product.currency || 'USD',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      seller: { '@id': 'https://cmpsbl.com/#organization' }
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount || 1
      }
    })
  } : null;

  // Video Schema
  const videoSchema = video ? {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: video.name,
    description: video.description,
    thumbnailUrl: video.thumbnailUrl,
    uploadDate: video.uploadDate,
    duration: video.duration,
    embedUrl: video.embedUrl,
    publisher: { '@id': 'https://cmpsbl.com/#organization' }
  } : null;

  // HowTo Schema
  const howToSchema = howTo ? {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    description: howTo.description,
    totalTime: howTo.totalTime,
    step: howTo.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && { image: step.image })
    }))
  } : null;

  // Article Schema
  const articleSchema = type === 'article' ? {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${resolvedCanonical}#article`,
    headline: fullTitle,
    description: safeDescription,
    image: {
      '@type': 'ImageObject',
      url: image,
      width: 1200,
      height: 630
    },
    datePublished: publishedTime,
    dateModified: modifiedTime || currentDate,
    author: {
      '@type': 'Person',
      name: author,
      url: 'https://cmpsbl.com/about'
    },
    publisher: { '@id': 'https://cmpsbl.com/#organization' },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': resolvedCanonical
    },
    articleSection: 'Technology',
    keywords: keywords.join(', ')
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={safeDescription} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="publisher" content="CMPSBL" />
      <meta name="copyright" content="© 2009-2026 CMPSBL®" />
      <link rel="canonical" href={resolvedCanonical} />
      
      {/* Performance Hints — preconnect for fonts already in index.html, only dns-prefetch here */}
      <link rel="dns-prefetch" href="https://cmpsbl.com" />
      
      {/* Viewport & Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      <meta name="theme-color" content="#7A5FFF" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#4a90c2" media="(prefers-color-scheme: dark)" />
      <meta name="color-scheme" content="light dark" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="CMPSBL" />
      
      {/* Open Graph */}
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
      <meta property="og:url" content={resolvedCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={safeDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:image:secure_url" content={image} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      <meta property="og:updated_time" content={modifiedTime || currentDate} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={resolvedCanonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={safeDescription} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={fullTitle} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:domain" content="cmpsbl.com" />
      
      {/* Article-specific */}
      {type === 'article' && publishedTime && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:author" content={author} />
          <meta property="article:section" content="Technology" />
          <meta property="article:tag" content={keywords.slice(0, 5).join(', ')} />
        </>
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      
      {/* Robots */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />
      
      {/* Sitemap & RSS & Alternates */}
      <link rel="sitemap" type="application/xml" href="/sitemap.xml" />
      <link rel="alternate" type="application/rss+xml" title={`${siteName} Blog RSS`} href="/rss.xml" />
      <link rel="alternate" hrefLang="en" href={resolvedCanonical} />
      <link rel="alternate" hrefLang="x-default" href={resolvedCanonical} />
      
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
      {productSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      )}
      {videoSchema && (
        <script type="application/ld+json">
          {JSON.stringify(videoSchema)}
        </script>
      )}
      {howToSchema && (
        <script type="application/ld+json">
          {JSON.stringify(howToSchema)}
        </script>
      )}
      {articleSchema && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
    </Helmet>
  );
}
