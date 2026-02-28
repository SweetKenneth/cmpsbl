/**
 * Truncate — Text truncation with tooltip on overflow
 */

import { useState, useRef, useEffect } from 'react';

interface TruncateProps {
  text: string;
  maxWidth?: string;
  className?: string;
}

export function Truncate({ text, maxWidth = '200px', className = '' }: TruncateProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (el) setIsTruncated(el.scrollWidth > el.clientWidth);
  }, [text]);

  return (
    <span
      ref={ref}
      title={isTruncated ? text : undefined}
      className={`block truncate ${className}`}
      style={{ maxWidth }}
    >
      {text}
    </span>
  );
}
