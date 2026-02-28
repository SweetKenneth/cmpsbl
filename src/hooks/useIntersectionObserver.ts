/**
 * useIntersectionObserver — Observe element visibility with IntersectionObserver
 */

import { useState, useEffect, useRef, type RefObject } from 'react';

interface UseIntersectionOptions {
  threshold?: number | number[];
  rootMargin?: string;
  root?: Element | null;
  triggerOnce?: boolean;
}

export function useIntersectionObserver<T extends Element = HTMLDivElement>(
  options: UseIntersectionOptions = {},
): { ref: RefObject<T>; isIntersecting: boolean; entry: IntersectionObserverEntry | null } {
  const { threshold = 0, rootMargin = '0px', root = null, triggerOnce = false } = options;
  const ref = useRef<T>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([e]) => {
        setIsIntersecting(e.isIntersecting);
        setEntry(e);
        if (triggerOnce && e.isIntersecting) {
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin, root },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, root, triggerOnce]);

  return { ref, isIntersecting, entry };
}
