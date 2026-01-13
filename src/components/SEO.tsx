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
  title = 'promptfluid® — Cognitive Orchestration Substrate',
  description = 'promptfluid is a cognitive orchestration substrate that provides routing, memory, learning cycles, observability, defense, and execution coordination for AI systems. Model-agnostic. Provider-agnostic. Commodity cloud.',
  canonical = 'https://promptfluid.com',
  image = 'https://promptfluid.com/og-default.jpg',
  type = 'website',
  author = 'Kenneth E Sweet Jr',
  publishedTime,
  modifiedTime,
  keywords = ['cognitive orchestration', 'AI substrate', 'AI routing', 'AI memory', 'learning cycles', 'observability', 'AI defense', 'model-agnostic', 'provider-agnostic'],
  noindex = false,
  breadcrumbs,
  faq,
  product,
  video,
  howTo
}: SEOProps) {
  const siteName = 'promptfluid';
  const twitterHandle = '@promptfluid';
  const fullTitle = title.includes('promptfluid') ? title : `${title} | ${siteName}`;
  const currentDate = new Date().toISOString();

  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://promptfluid.com/#organization',
    name: 'promptfluid',
    alternateName: ['promptfluid substrate', 'promptfluid®'],
    url: 'https://promptfluid.com',
    logo: {
      '@type': 'ImageObject',
      '@id': 'https://promptfluid.com/#logo',
      url: 'https://promptfluid.com/logo.png',
      contentUrl: 'https://promptfluid.com/logo.png',
      width: 512,
      height: 512,
      caption: 'promptfluid logo'
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://promptfluid.com/og-default.jpg',
      width: 1200,
      height: 630
    },
    description: 'Cognitive orchestration substrate for AI systems. Model-agnostic. Provider-agnostic. Commodity cloud.',
    foundingDate: '2009',
    slogan: 'Cognitive Orchestration Substrate',
    founder: {
      '@type': 'Person',
      '@id': 'https://promptfluid.com/#founder',
      name: 'Kenneth E Sweet Jr',
      jobTitle: 'Founder',
      email: 'promptfluid@gmail.com',
      url: 'https://promptfluid.com/about'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Palm Springs',
      addressRegion: 'CA',
      postalCode: '92262',
      addressCountry: 'US'
    },
    sameAs: [
      'https://twitter.com/promptfluid',
      'https://x.com/promptfluid',
      'https://linkedin.com/company/promptfluid',
      'https://github.com/promptfluid'
    ],
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'general',
        email: 'promptfluid@gmail.com',
        telephone: '+1-760-358-4324',
        availableLanguage: ['English'],
        areaServed: 'Worldwide'
      }
    ],
    knowsAbout: [
      'Cognitive Orchestration',
      'AI Routing',
      'AI Memory Systems',
      'Learning Cycles',
      'Observability',
      'AI Defense',
      'Model-Agnostic AI',
      'Provider-Agnostic AI'
    ],
    areaServed: 'Worldwide'
  };

  // Website Schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://promptfluid.com/#website',
    name: siteName,
    alternateName: 'promptfluid substrate',
    url: 'https://promptfluid.com',
    description: description,
    inLanguage: 'en-US',
    publisher: { '@id': 'https://promptfluid.com/#organization' },
    potentialAction: [
      {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://promptfluid.com/blog?q={search_term_string}'
        },
        'query-input': 'required name=search_term_string'
      }
    ]
  };

  // WebPage Schema
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : type === 'product' ? 'ProductPage' : 'WebPage',
    '@id': `${canonical}#webpage`,
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
    isPartOf: { '@id': 'https://promptfluid.com/#website' },
    about: { '@id': 'https://promptfluid.com/#organization' },
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
        url: 'https://promptfluid.com/about'
      }
    }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical
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
    '@id': 'https://promptfluid.com/#software',
    name: 'promptfluid substrate',
    applicationCategory: 'DeveloperApplication',
    applicationSubCategory: 'Cognitive Orchestration Substrate',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript',
    softwareVersion: 'v2026.01',
    screenshot: image,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    description: 'Cognitive orchestration substrate for AI systems with routing, memory, learning cycles, observability, and defense.',
    featureList: [
      'Multi-provider AI routing',
      'Dual-tier memory architecture',
      'Autonomous learning cycles',
      'Real-time observability',
      'Behavioral threat detection',
      'Model-agnostic design'
    ],
    author: { '@id': 'https://promptfluid.com/#organization' },
    provider: { '@id': 'https://promptfluid.com/#organization' }
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
    description: description,
    image: image,
    brand: { '@id': 'https://promptfluid.com/#organization' },
    offers: {
      '@type': 'Offer',
      price: product.price || '0',
      priceCurrency: product.currency || 'USD',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      seller: { '@id': 'https://promptfluid.com/#organization' }
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
    publisher: { '@id': 'https://promptfluid.com/#organization' }
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
    '@id': `${canonical}#article`,
    headline: fullTitle,
    description: description,
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
      url: 'https://promptfluid.com/about'
    },
    publisher: { '@id': 'https://promptfluid.com/#organization' },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical
    },
    articleSection: 'Technology',
    keywords: keywords.join(', ')
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="publisher" content="promptfluid" />
      <meta name="copyright" content="© 2009-2026 promptfluid®" />
      <link rel="canonical" href={canonical} />
      
      {/* Performance Hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://promptfluid.com" />
      
      {/* Viewport & Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      <meta name="theme-color" content="#7A5FFF" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#4a90c2" media="(prefers-color-scheme: dark)" />
      <meta name="color-scheme" content="light dark" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="promptfluid" />
      
      {/* Open Graph */}
      <meta property="og:type" content={type === 'article' ? 'article' : 'website'} />
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
      <meta property="og:updated_time" content={modifiedTime || currentDate} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={fullTitle} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:domain" content="promptfluid.com" />
      
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
      
      {/* RSS & Alternates */}
      <link rel="alternate" type="application/rss+xml" title={`${siteName} Blog RSS`} href="/rss.xml" />
      <link rel="alternate" hrefLang="en" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />
      
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
