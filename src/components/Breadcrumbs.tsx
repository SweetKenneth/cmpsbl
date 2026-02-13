import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

/**
 * Breadcrumbs Component
 * Provides hierarchical navigation and schema markup for SEO
 * Implements 2026 best practices for internal linking and user experience
 */
export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  // Generate schema.org BreadcrumbList markup
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://cmpsbl.com"
      },
      ...items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        ...(item.href && { "item": `https://cmpsbl.com${item.href}` })
      }))
    ]
  };

  return (
    <>
      {/* Schema markup */}
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>

      {/* Visual breadcrumbs */}
      <nav 
        aria-label="Breadcrumb" 
        className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}
      >
        <Link 
          to="/" 
          className="inline-flex items-center gap-1 hover:text-primary transition-colors"
          aria-label="Home"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </Link>
        
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <div key={index} className="flex items-center gap-2">
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
              {item.href && !isLast ? (
                <Link 
                  to={item.href}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <span className={isLast ? "text-foreground font-medium" : ""} aria-current={isLast ? "page" : undefined}>
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>
    </>
  );
}
