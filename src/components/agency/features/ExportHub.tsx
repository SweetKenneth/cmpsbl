/**
 * ExportHub — One-click export to PDF/CSV, shareable links, email delivery
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AgencyTask } from '@/lib/agency/agencyTasks';
import { 
  Download, FileText, Table, Link2, Mail, 
  Copy, Check, ExternalLink, Share2, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

// ============================================================================
// TYPES
// ============================================================================
export type ExportFormat = 'pdf' | 'csv' | 'json' | 'markdown';

interface ExportOption {
  id: ExportFormat;
  name: string;
  description: string;
  icon: React.ReactNode;
  mimeType: string;
  extension: string;
}

const EXPORT_OPTIONS: ExportOption[] = [
  { 
    id: 'pdf', 
    name: 'PDF Report', 
    description: 'Formatted document with styling', 
    icon: <FileText className="w-5 h-5" />,
    mimeType: 'application/pdf',
    extension: 'pdf'
  },
  { 
    id: 'csv', 
    name: 'CSV Spreadsheet', 
    description: 'Data in tabular format', 
    icon: <Table className="w-5 h-5" />,
    mimeType: 'text/csv',
    extension: 'csv'
  },
  { 
    id: 'json', 
    name: 'JSON Data', 
    description: 'Raw structured data', 
    icon: <FileText className="w-5 h-5" />,
    mimeType: 'application/json',
    extension: 'json'
  },
  { 
    id: 'markdown', 
    name: 'Markdown', 
    description: 'Plain text with formatting', 
    icon: <FileText className="w-5 h-5" />,
    mimeType: 'text/markdown',
    extension: 'md'
  },
];

// ============================================================================
// EXPORT BUTTON
// ============================================================================
interface ExportButtonProps {
  data: any;
  filename?: string;
  format?: ExportFormat;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ExportButton({
  data,
  filename = 'export',
  format = 'json',
  variant = 'outline',
  size = 'sm',
  className,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let content: string;
      let mimeType: string;
      
      switch (format) {
        case 'csv':
          content = convertToCSV(data);
          mimeType = 'text/csv';
          break;
        case 'markdown':
          content = convertToMarkdown(data);
          mimeType = 'text/markdown';
          break;
        case 'json':
        default:
          content = JSON.stringify(data, null, 2);
          mimeType = 'application/json';
          break;
      }
      
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Export complete');
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      className={className}
    >
      {isExporting ? (
        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-1" />
      )}
      Export
    </Button>
  );
}

// ============================================================================
// EXPORT DIALOG
// ============================================================================
interface ExportDialogProps {
  data: any;
  title?: string;
  filename?: string;
  trigger?: React.ReactNode;
  className?: string;
}

export function ExportDialog({
  data,
  title = 'Export Data',
  filename = 'export',
  trigger,
  className,
}: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('json');
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      let content: string;
      const option = EXPORT_OPTIONS.find(o => o.id === selectedFormat)!;
      
      switch (selectedFormat) {
        case 'csv':
          content = convertToCSV(data);
          break;
        case 'markdown':
          content = convertToMarkdown(data);
          break;
        case 'json':
        default:
          content = JSON.stringify(data, null, 2);
          break;
      }
      
      const blob = new Blob([content], { type: option.mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.${option.extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Exported as ${option.name}`);
    } catch (error) {
      toast.error('Export failed');
      console.error(error);
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className={className}>
            <Download className="w-4 h-4 mr-1" />
            Export
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Choose a format for your export
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          {EXPORT_OPTIONS.map((option) => (
            <motion.button
              key={option.id}
              className={cn(
                'p-4 rounded-lg border text-left transition-colors',
                selectedFormat === option.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedFormat(option.id)}
            >
              <div className="flex items-center gap-2 mb-1">
                {option.icon}
                <span className="font-medium">{option.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{option.description}</p>
            </motion.button>
          ))}
        </div>
        
        <Button
          className="w-full mt-4"
          onClick={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Export as {EXPORT_OPTIONS.find(o => o.id === selectedFormat)?.name}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// SHARE LINK
// ============================================================================
interface ShareLinkProps {
  url?: string;
  onGenerate?: () => Promise<string>;
  className?: string;
}

export function ShareLink({ url, onGenerate, className }: ShareLinkProps) {
  const [shareUrl, setShareUrl] = useState(url || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleGenerate = async () => {
    if (onGenerate) {
      setIsGenerating(true);
      try {
        const newUrl = await onGenerate();
        setShareUrl(newUrl);
      } catch (error) {
        toast.error('Failed to generate link');
      } finally {
        setIsGenerating(false);
      }
    }
  };
  
  const handleCopy = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };
  
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Shareable Link</span>
      </div>
      
      <div className="flex gap-2">
        <Input
          value={shareUrl}
          readOnly
          placeholder="Generate a link..."
          className="font-mono text-sm"
        />
        
        {!shareUrl && onGenerate ? (
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              'Generate'
            )}
          </Button>
        ) : (
          <Button variant="outline" onClick={handleCopy}>
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// EMAIL SHARE
// ============================================================================
interface EmailShareProps {
  subject?: string;
  body?: string;
  onSend?: (email: string) => Promise<void>;
  className?: string;
}

export function EmailShare({ subject, body, onSend, className }: EmailShareProps) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const handleSend = async () => {
    if (!email) return;
    
    if (onSend) {
      setIsSending(true);
      try {
        await onSend(email);
        toast.success('Email sent!');
        setEmail('');
      } catch (error) {
        toast.error('Failed to send email');
      } finally {
        setIsSending(false);
      }
    } else {
      // Fallback to mailto
      const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject || '')}&body=${encodeURIComponent(body || '')}`;
      window.open(mailtoUrl);
    }
  };
  
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <Mail className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Send via Email</span>
      </div>
      
      <div className="flex gap-2">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="recipient@example.com"
        />
        
        <Button onClick={handleSend} disabled={!email || isSending}>
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            'Send'
          )}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// FULL EXPORT HUB
// ============================================================================
interface ExportHubProps {
  data: any;
  title?: string;
  filename?: string;
  onGenerateLink?: () => Promise<string>;
  onSendEmail?: (email: string) => Promise<void>;
  className?: string;
}

export function ExportHub({
  data,
  title = 'Share & Export',
  filename = 'export',
  onGenerateLink,
  onSendEmail,
  className,
}: ExportHubProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className={className}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Export your data or share it with others
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 mt-4">
          {/* Export options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Download className="w-4 h-4" />
              Download
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {EXPORT_OPTIONS.map((option) => (
                <ExportButton
                  key={option.id}
                  data={data}
                  filename={filename}
                  format={option.id}
                  variant="outline"
                />
              ))}
            </div>
          </div>
          
          {/* Share link */}
          {onGenerateLink && (
            <ShareLink onGenerate={onGenerateLink} />
          )}
          
          {/* Email */}
          {onSendEmail && (
            <EmailShare onSend={onSendEmail} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function convertToCSV(data: any): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return '';
    const headers = Object.keys(data[0]);
    const rows = data.map(row => 
      headers.map(h => JSON.stringify(row[h] ?? '')).join(',')
    );
    return [headers.join(','), ...rows].join('\n');
  }
  
  // Single object
  const headers = Object.keys(data);
  const values = headers.map(h => JSON.stringify(data[h] ?? ''));
  return [headers.join(','), values.join(',')].join('\n');
}

function convertToMarkdown(data: any): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return '# No Data\n';
    
    const headers = Object.keys(data[0]);
    const headerRow = `| ${headers.join(' | ')} |`;
    const separator = `| ${headers.map(() => '---').join(' | ')} |`;
    const rows = data.map(row => 
      `| ${headers.map(h => String(row[h] ?? '')).join(' | ')} |`
    );
    
    return ['# Data Export', '', headerRow, separator, ...rows].join('\n');
  }
  
  // Single object
  const lines = ['# Data Export', ''];
  for (const [key, value] of Object.entries(data)) {
    lines.push(`## ${key}`);
    lines.push('');
    lines.push(typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value));
    lines.push('');
  }
  
  return lines.join('\n');
}
