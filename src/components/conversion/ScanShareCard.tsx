/**
 * Scan Share Card — Social sharing for scan results
 * Item #3: Make scan results shareable with unique URLs
 */

import { useState } from 'react';
import { Share2, Copy, Check, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ScanShareCardProps {
  scanId?: string;
  domain: string;
  score?: number;
  scanType?: string;
  className?: string;
}

export function ScanShareCard({ scanId, domain, score, scanType = 'accessibility', className = '' }: ScanShareCardProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = scanId 
    ? `${window.location.origin}/scan/results/${scanId}`
    : `${window.location.origin}/scan?domain=${encodeURIComponent(domain)}`;

  const shareText = score !== undefined
    ? `${domain} scored ${score}/100 on ${scanType} — scanned with CMPSBL`
    : `I just scanned ${domain} for ${scanType} issues — check it out`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  const linkedinUrl = `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Button variant="outline" size="sm" onClick={copyLink} className="gap-1.5">
        {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? 'Copied!' : 'Share'}
      </Button>
      <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="inline-flex"rel="noopener noreferrer">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Twitter className="h-3.5 w-3.5" />
        </Button>
      </a>
      <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="inline-flex"rel="noopener noreferrer">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Linkedin className="h-3.5 w-3.5" />
        </Button>
      </a>
    </div>
  );
}
