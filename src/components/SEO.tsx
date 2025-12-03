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
}

export function SEO({
  title = 'PromptFluid™ — AI That Flows',
  description = 'Enterprise AI development ecosystem with six integrated modules: Reflex Security, Nexus Brain, Sites Manager, Access Console, Ripple Studio, and Market Portal. Built for Silicon Valley standards.',
  canonical = 'https://www.promptfluid.com',
  image = 'https://www.promptfluid.com/og-default.jpg',
  type = 'website',
  author = 'Kenneth Sweet',
  publishedTime,
  modifiedTime,
  keywords = ['AI development', 'artificial intelligence', 'bot detection', 'SEO automation', 'accessibility', 'marketing automation', 'AI orchestration', 'enterprise AI'],
  noindex = false
}: SEOProps) {
  const siteName = 'PromptFluid';
  const twitterHandle = '@promptfluid';
  const fullTitle = title.includes('PromptFluid') ? title : `${title} | ${siteName}`;

  // Structured Data - Organization
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'PromptFluid',
    alternateName: 'PromptFluid AI',
    url: 'https://promptfluid.com',
    logo: 'https://promptfluid.com/logo.png',
    description: 'Enterprise AI development ecosystem providing intelligent automation solutions',
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'Kenneth Sweet',
      email: 'PromptFluid@gmail.com'
    },
    sameAs: [
      'https://twitter.com/promptfluid',
      'https://linkedin.com/company/promptfluid',
      'https://github.com/promptfluid'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      email: 'PromptFluid@gmail.com',
      availableLanguage: ['English']
    }
  };

  // Structured Data - Website
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    alternateName: 'PromptFluid AI',
    url: canonical,
    description: description,
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
        urlTemplate: 'https://promptfluid.com/search?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string'
    }
  };

  // Structured Data - WebPage
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: fullTitle,
    description: description,
    url: canonical,
    image: image,
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'WebSite',
      url: 'https://promptfluid.com'
    },
    ...(author && {
      author: {
        '@type': 'Person',
        name: author
      }
    }),
    ...(publishedTime && { datePublished: publishedTime }),
    ...(modifiedTime && { dateModified: modifiedTime })
  };

  // Structured Data - SoftwareApplication
  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'PromptFluid Platform',
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '247'
    },
    description: 'Enterprise AI development platform with six integrated modules for intelligent automation'
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang="en" />
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />
      <meta name="author" content={author} />
      <link rel="canonical" href={canonical} />
      
      {/* Viewport & Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#0098ff" />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1920" />
      <meta property="og:image:height" content="1920" />
      <meta property="og:image:alt" content={fullTitle} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      
      {/* Additional SEO */}
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"} />
      <meta name="googlebot" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <meta name="bingbot" content={noindex ? "noindex, nofollow" : "index, follow"} />
      <link rel="alternate" type="application/rss+xml" title={`${siteName} RSS Feed`} href="/rss.xml" />
      
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
    </Helmet>
  );
}
