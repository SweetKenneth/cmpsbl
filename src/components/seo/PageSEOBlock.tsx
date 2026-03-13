/**
 * PageSEOBlock — Drop-in SEO authority component for any page
 * Combines: breadcrumb JSON-LD + AuthorityLinkBlock internal/external links
 * 
 * Usage: <PageSEOBlock path="/engines" title="54 Composable Engines" />
 * Place just above <EnhancedFooter /> on any page.
 */

import { AuthorityLinkBlock } from '@/components/seo/AuthorityLinkBlock';
import { Helmet } from 'react-helmet-async';

interface PageSEOBlockProps {
  /** Current route path */
  path: string;
  /** Human-readable title for the breadcrumb */
  title: string;
  /** Optional FAQ pairs for rich snippets */
  faq?: Array<{ question: string; answer: string }>;
  className?: string;
}

export function PageSEOBlock({ path, title, faq, className }: PageSEOBlockProps) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'CMPSBL',
        item: 'https://cmpsbl.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: title,
        item: `https://cmpsbl.com${path}`,
      },
    ],
  };

  const faqSchema = faq && faq.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  } : null;

  return (
    <>
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
        {faqSchema && (
          <script type="application/ld+json">
            {JSON.stringify(faqSchema)}
          </script>
        )}
      </Helmet>
      <AuthorityLinkBlock currentPath={path} className={className} />
    </>
  );
}
