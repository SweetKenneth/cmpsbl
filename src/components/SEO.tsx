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
  faq,
  product,
  video,
  howTo
}: SEOProps) {
  const siteName = 'PromptFluid';
  const twitterHandle = '@promptfluid';
  const fullTitle = title.includes('PromptFluid') ? title : `${title} | ${siteName}`;
  const currentDate = new Date().toISOString();

  // 2026 SEO: Enhanced Organization Schema with more signals
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://promptfluid.com/#organization',
    name: 'PromptFluid',
    alternateName: ['PromptFluid AI', 'PF', 'PromptFluid Inc'],
    url: 'https://promptfluid.com',
    logo: {
      '@type': 'ImageObject',
      '@id': 'https://promptfluid.com/#logo',
      url: 'https://promptfluid.com/logo.png',
      contentUrl: 'https://promptfluid.com/logo.png',
      width: 512,
      height: 512,
      caption: 'PromptFluid Logo'
    },
    image: {
      '@type': 'ImageObject',
      url: 'https://promptfluid.com/og-default.jpg',
      width: 1200,
      height: 630
    },
    description: 'Applied AI company building autonomous systems, infrastructure tooling, and experimental interfaces that scale.',
    foundingDate: '2009',
    slogan: 'AI That Flows',
    founder: {
      '@type': 'Person',
      '@id': 'https://promptfluid.com/#founder',
      name: 'Kenneth E Sweet Jr',
      jobTitle: 'Founder & CEO',
      email: 'PromptFluid@gmail.com',
      url: 'https://promptfluid.com/about'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Palm Springs',
      addressRegion: 'CA',
      postalCode: '92262',
      addressCountry: 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 33.8303,
      longitude: -116.5453
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
        contactType: 'customer service',
        email: 'PromptFluid@gmail.com',
        telephone: '+1-760-358-4324',
        availableLanguage: ['English'],
        areaServed: 'Worldwide'
      },
      {
        '@type': 'ContactPoint',
        contactType: 'sales',
        email: 'PromptFluid@gmail.com',
        availableLanguage: ['English']
      }
    ],
    numberOfEmployees: {
      '@type': 'QuantitativeValue',
      minValue: 1,
      maxValue: 10
    },
    knowsAbout: [
      'Artificial Intelligence',
      'Machine Learning',
      'WordPress Security',
      'Web Accessibility',
      'WCAG Compliance',
      'Bot Detection',
      'Autonomous Systems',
      'AI Orchestration'
    ],
    areaServed: 'Worldwide',
    award: '100+ Projects Shipped'
  };

  // 2026 SEO: Enhanced Website Schema with SearchAction
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://promptfluid.com/#website',
    name: siteName,
    alternateName: 'PromptFluid AI',
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

  // 2026 SEO: Enhanced WebPage Schema with Speakable
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
    // 2026: Speakable for voice search optimization
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.hero-description', '.product-title', 'article p:first-of-type']
    }
  };

  // 2026 SEO: Enhanced SoftwareApplication Schema
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://promptfluid.com/#software',
    name: 'PromptFluid Platform',
    applicationCategory: 'BusinessApplication',
    applicationSubCategory: 'AI Infrastructure',
    operatingSystem: 'Web Browser',
    browserRequirements: 'Requires JavaScript',
    softwareVersion: '2.0',
    releaseNotes: 'https://promptfluid.com/blog/product-roadmap-2025',
    screenshot: image,
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
      priceValidUntil: '2026-12-31'
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
      'Multi-Provider AI Gateway',
      'WordPress Security Plugins',
      'Real-time Threat Analysis'
    ],
    author: { '@id': 'https://promptfluid.com/#organization' },
    provider: { '@id': 'https://promptfluid.com/#organization' }
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

  // FAQ Schema (if provided) - 2026 Enhanced
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

  // 2026 SEO: Product Schema (if provided)
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

  // 2026 SEO: Video Schema (if provided)
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

  // 2026 SEO: HowTo Schema (if provided)
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

  // 2026 SEO: Article Schema for blog posts
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
    wordCount: 1500,
    keywords: keywords.join(', '),
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', 'article p:first-of-type', '.article-summary']
    }
  } : null;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <meta name="publisher" content="PromptFluid" />
      <meta name="copyright" content="© 2009-2026 PromptFluid" />
      <link rel="canonical" href={canonical} />
      
      {/* 2026 SEO Enhancements */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="google" content="notranslate" />
      <meta name="revisit-after" content="7 days" />
      <meta name="rating" content="general" />
      <meta name="distribution" content="global" />
      <meta name="ai-content-declaration" content="human-authored" />
      
      {/* Performance Hints */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://promptfluid.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      
      {/* Viewport & Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, viewport-fit=cover" />
      <meta name="theme-color" content="#7A5FFF" media="(prefers-color-scheme: light)" />
      <meta name="theme-color" content="#4a90c2" media="(prefers-color-scheme: dark)" />
      <meta name="color-scheme" content="light dark" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="PromptFluid" />
      
      {/* Open Graph / Facebook (2026 Enhanced) */}
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
          <meta property="article:tag" content={keywords.slice(0, 5).join(', ')} />
        </>
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      
      {/* Advanced Robots & Indexing (2026) */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"} />
      <meta name="bingbot" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="slurp" content={noindex ? "noindex, nofollow" : "index, follow"} />
      
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