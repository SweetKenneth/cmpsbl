/**
 * Image Optimization Utilities
 * Item #7: Responsive image helpers for WebP/AVIF with srcset
 */

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  loading?: 'lazy' | 'eager';
  sizes?: string;
  priority?: boolean;
}

/**
 * Generate srcset string for responsive images.
 * For imported assets, Vite handles this. For public/ images, we generate breakpoints.
 */
export function generateSrcSet(baseSrc: string, widths: number[] = [320, 640, 960, 1280, 1920]): string {
  // For external URLs or public/ paths, return the base src
  // (actual resizing would need a CDN or image service)
  if (baseSrc.startsWith('http') || baseSrc.startsWith('/')) {
    return widths.map(w => `${baseSrc} ${w}w`).join(', ');
  }
  return baseSrc;
}

/**
 * OptimizedImage component with explicit width/height to prevent CLS,
 * lazy loading by default, and proper alt text.
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  sizes = '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  priority = false,
}: OptimizedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? 'eager' : loading}
      decoding={priority ? 'sync' : 'async'}
      sizes={sizes}
      className={className}
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
}

/**
 * PictureElement with WebP/AVIF source fallback pattern.
 * Usage: provide .avif and .webp versions alongside the fallback.
 */
interface PictureProps extends OptimizedImageProps {
  avifSrc?: string;
  webpSrc?: string;
}

export function OptimizedPicture({
  src,
  avifSrc,
  webpSrc,
  alt,
  width,
  height,
  className = '',
  loading = 'lazy',
  sizes,
  priority = false,
}: PictureProps) {
  return (
    <picture>
      {avifSrc && <source srcSet={avifSrc} type="image/avif" sizes={sizes} />}
      {webpSrc && <source srcSet={webpSrc} type="image/webp" sizes={sizes} />}
      <OptimizedImage
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={loading}
        sizes={sizes}
        priority={priority}
      />
    </picture>
  );
}
