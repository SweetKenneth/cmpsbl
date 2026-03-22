/**
 * Email List Panel — Governor observability for marketplace_mailing_list
 * View, search, filter, and export email subscribers
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Mail, Download, Users, Search, CheckCircle2, XCircle,
  Loader2, RefreshCw, Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface MailingListEntry {
  id: string;
  email: string;
  is_active: boolean | null;
  preferences: any;
  subscribed_at: string | null;
  unsubscribed_at: string | null;
  user_id: string | null;
}

function useMailingList() {
  return useQuery({
    queryKey: ['admin-mailing-list'],
    queryFn: async (): Promise<MailingListEntry[]> => {
      const { data, error } = await supabase
        .from('marketplace_mailing_list')
        .select('*')
        .order('subscribed_at', { ascending: false });
      if (error) throw error;
      return (data || []) as MailingListEntry[];
    },
    staleTime: 30_000,
  });
}

function exportCSV(entries: MailingListEntry[]) {
  const headers = ['Email', 'Status', 'Subscribed At', 'Unsubscribed At', 'User ID'];
  const rows = entries.map(e => [
    e.email,
    e.is_active !== false ? 'Active' : 'Unsubscribed',
    e.subscribed_at ? format(new Date(e.subscribed_at), 'yyyy-MM-dd HH:mm') : '',
    e.unsubscribed_at ? format(new Date(e.unsubscribed_at), 'yyyy-MM-dd HH:mm') : '',
    e.user_id || '',
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mailing-list-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${entries.length} records`);
}

export default function EmailListPanel() {
  const { data: entries = [], isLoading, refetch } = useMailingList();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'unsubscribed'>('all');

  const filtered = entries.filter(e => {
    const matchesSearch = !search || e.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && e.is_active !== false) ||
      (filterStatus === 'unsubscribed' && e.is_active === false);
    return matchesSearch && matchesStatus;
  });

  const activeCount = entries.filter(e => e.is_active !== false).length;
  const unsubCount = entries.filter(e => e.is_active === false).length;

  return (
    <div className="space-y-5 sm:space-y-6 p-4 sm:p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue/15 to-neon-purple/10 border border-neon-blue/25 flex items-center justify-center shrink-0">
          <Mail className="w-5 h-5 text-neon-blue dark:text-neon-blue" />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl font-bold tracking-tight">Email Lists</h1>
          <p className="text-[10px] text-muted-foreground/60 font-mono tracking-wider">SUBSCRIBER MANAGEMENT · EXPORT · OBSERVABILITY</p>
        </div>
        <Badge className="text-[9px] bg-neon-blue/10 text-neon-blue dark:text-neon-blue border-neon-blue/20 shrink-0">GOVERNOR</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {[
          { label: 'Total', value: entries.length, icon: Users, color: 'text-neon-blue' },
          { label: 'Active', value: activeCount, icon: CheckCircle2, color: 'text-neon-green' },
          { label: 'Unsubscribed', value: unsubCount, icon: XCircle, color: 'text-destructive' },
        ].map(s => (
          <Card key={s.label} className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
            <CardContent className="p-3 text-center">
              <s.icon className={cn('w-4 h-4 mx-auto mb-1', s.color)} />
              <div className="text-lg font-bold font-mono tabular-nums">{isLoading ? '—' : s.value}</div>
              <div className="text-[10px] text-muted-foreground/50 uppercase">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
          <Input
            placeholder="Search emails…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-sm bg-muted/10 border-border/15"
          />
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
            <TabsList className="h-9 bg-muted/15 border border-border/15">
              <TabsTrigger value="all" className="text-xs h-7 px-2.5">All</TabsTrigger>
              <TabsTrigger value="active" className="text-xs h-7 px-2.5">Active</TabsTrigger>
              <TabsTrigger value="unsubscribed" className="text-xs h-7 px-2.5">Unsub</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button size="sm" variant="outline" onClick={() => refetch()} className="gap-1.5 h-9">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" onClick={() => exportCSV(filtered)} disabled={filtered.length === 0} className="gap-1.5 h-9 bg-neon-blue hover:bg-neon-blue text-white">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border-border/15 dark:border-border/10 bg-card/50 dark:bg-card/20">
        <ScrollArea className="h-[400px] sm:h-[500px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/40" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Mail className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground/50">{search ? 'No matching subscribers' : 'No subscribers yet'}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/10">
                  <TableHead className="text-xs font-mono">Email</TableHead>
                  <TableHead className="text-xs font-mono w-[80px]">Status</TableHead>
                  <TableHead className="text-xs font-mono hidden sm:table-cell">Subscribed</TableHead>
                  <TableHead className="text-xs font-mono hidden md:table-cell">User ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(entry => (
                  <TableRow key={entry.id} className="border-border/5 hover:bg-muted/10">
                    <TableCell className="text-sm font-medium py-2.5">{entry.email}</TableCell>
                    <TableCell className="py-2.5">
                      <Badge variant="outline" className={cn(
                        'text-[10px] h-5',
                        entry.is_active !== false
                          ? 'bg-neon-green/10 text-neon-green dark:text-neon-green border-neon-green/20'
                          : 'bg-destructive/10 text-destructive dark:text-destructive border-destructive/20'
                      )}>
                        {entry.is_active !== false ? 'Active' : 'Unsub'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground/60 font-mono hidden sm:table-cell py-2.5">
                      {entry.subscribed_at ? format(new Date(entry.subscribed_at), 'MMM d, yyyy') : '—'}
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground/40 font-mono hidden md:table-cell py-2.5 truncate max-w-[120px]">
                      {entry.user_id ? entry.user_id.slice(0, 8) + '…' : '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </Card>

      <p className="text-[10px] text-muted-foreground/40 text-center font-mono">
        Showing {filtered.length} of {entries.length} subscribers
      </p>
    </div>
  );
}
