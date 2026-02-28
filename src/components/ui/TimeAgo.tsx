/**
 * TimeAgo — Human-readable relative time display
 */

import { useState, useEffect } from 'react';

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

interface TimeAgoProps {
  date: string | Date | number;
  className?: string;
  live?: boolean;
  interval?: number;
}

export function TimeAgo({ date, className = '', live = true, interval = 30000 }: TimeAgoProps) {
  const d = date instanceof Date ? date : new Date(date);
  const [text, setText] = useState(() => formatTimeAgo(d));

  useEffect(() => {
    if (!live) return;
    const timer = setInterval(() => setText(formatTimeAgo(d)), interval);
    return () => clearInterval(timer);
  }, [d, live, interval]);

  return (
    <time dateTime={d.toISOString()} title={d.toLocaleString()} className={`text-muted-foreground ${className}`}>
      {text}
    </time>
  );
}
