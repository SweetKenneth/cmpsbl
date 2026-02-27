// CMPSBL Substrate — Schema Generator
// Automatic JSON-LD structured data generation

export interface SchemaConfig {
  type: 'Organization' | 'Website' | 'Article' | 'Product' | 'FAQPage' | 'Breadcrumb';
  data: Record<string, any>;
}

export class SchemaGenerator {
  /**
   * Generate Organization schema
   */
  static generateOrganization(data: {
    name: string;
    url: string;
    logo?: string;
    description?: string;
    founder?: string;
    foundingDate?: string;
    address?: any;
    socialLinks?: string[];
  }): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": data.name,
      "url": data.url,
      "logo": data.logo || `${data.url}/logo.png`,
      "description": data.description,
      "founder": data.founder ? {
        "@type": "Person",
        "name": data.founder,
        "sameAs": "https://orcid.org/0009-0001-4237-1243"
      } : undefined,
      "foundingDate": data.foundingDate,
      "address": data.address,
      "sameAs": data.socialLinks
    };

    return JSON.stringify(schema, null, 2);
  }

  /**
   * Generate Website schema
   */
  static generateWebsite(data: {
    name: string;
    url: string;
    description?: string;
    publisher?: string;
  }): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": data.name,
      "url": data.url,
      "description": data.description,
      "publisher": data.publisher ? {
        "@type": "Organization",
        "name": data.publisher
      } : undefined,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${data.url}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };

    return JSON.stringify(schema, null, 2);
  }

  /**
   * Generate Article schema
   */
  static generateArticle(data: {
    headline: string;
    description: string;
    author: string;
    datePublished: string;
    dateModified?: string;
    url: string;
    image?: string;
    publisher: { name: string; logo: string };
  }): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": data.headline,
      "description": data.description,
      "author": {
        "@type": "Person",
        "name": data.author,
        ...(data.author === "Kenneth E Sweet Jr" ? { "sameAs": "https://orcid.org/0009-0001-4237-1243" } : {})
      },
      "datePublished": data.datePublished,
      "dateModified": data.dateModified || data.datePublished,
      "url": data.url,
      "image": data.image,
      "publisher": {
        "@type": "Organization",
        "name": data.publisher.name,
        "logo": {
          "@type": "ImageObject",
          "url": data.publisher.logo
        }
      }
    };

    return JSON.stringify(schema, null, 2);
  }

  /**
   * Generate Product schema
   */
  static generateProduct(data: {
    name: string;
    description: string;
    image: string;
    brand: string;
    offers?: {
      price: string;
      priceCurrency: string;
      availability: string;
    };
    aggregateRating?: {
      ratingValue: number;
      reviewCount: number;
    };
  }): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": data.name,
      "description": data.description,
      "image": data.image,
      "brand": {
        "@type": "Brand",
        "name": data.brand
      },
      "offers": data.offers ? {
        "@type": "Offer",
        "price": data.offers.price,
        "priceCurrency": data.offers.priceCurrency,
        "availability": `https://schema.org/${data.offers.availability}`
      } : undefined,
      "aggregateRating": data.aggregateRating ? {
        "@type": "AggregateRating",
        "ratingValue": data.aggregateRating.ratingValue,
        "reviewCount": data.aggregateRating.reviewCount
      } : undefined
    };

    return JSON.stringify(schema, null, 2);
  }

  /**
   * Generate FAQ schema
   */
  static generateFAQ(questions: { question: string; answer: string }[]): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": questions.map(q => ({
        "@type": "Question",
        "name": q.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": q.answer
        }
      }))
    };

    return JSON.stringify(schema, null, 2);
  }

  /**
   * Generate Breadcrumb schema
   */
  static generateBreadcrumb(items: { name: string; url: string }[]): string {
    const schema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    };

    return JSON.stringify(schema, null, 2);
  }

  /**
   * Inject schema into HTML head
   */
  static injectSchema(schemaJson: string): void {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = schemaJson;
    document.head.appendChild(script);
  }

  /**
   * Generate all schemas for a typical business website
   */
  static generateCompleteSchemaSet(siteData: {
    name: string;
    url: string;
    description: string;
    logo: string;
    founder: string;
    socialLinks: string[];
  }): string[] {
    return [
      this.generateOrganization({
        name: siteData.name,
        url: siteData.url,
        logo: siteData.logo,
        description: siteData.description,
        founder: siteData.founder,
        foundingDate: "2009",
        socialLinks: siteData.socialLinks
      }),
      this.generateWebsite({
        name: siteData.name,
        url: siteData.url,
        description: siteData.description,
        publisher: siteData.name
      })
    ];
  }
}
