import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Award, CheckCircle2, AlertCircle, Copy } from 'lucide-react';

export default function ClarityCertifications() {
  const [sites, setSites] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [selectedSite, setSelectedSite] = useState('');
  const [certType, setCertType] = useState('wcag_aa');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: sitesData } = await supabase
      .from('pf_clarity_sites')
      .select('*')
      .order('created_at', { ascending: false });
    setSites(sitesData || []);

    const { data: certsData, error } = await supabase.functions.invoke('pf-clarity-certification', {
      body: { action: 'get_certifications' },
    });

    if (!error && certsData.success) {
      setCertifications(certsData.certifications);
    }
  };

  const requestCertification = async () => {
    if (!selectedSite) {
      toast({ title: 'Please select a site', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { data, error } = await supabase.functions.invoke('pf-clarity-certification', {
      body: {
        action: 'request_certification',
        site_id: selectedSite,
        certification_type: certType,
      },
    });

    setLoading(false);

    if (error || !data.success) {
      toast({
        title: 'Certification request failed',
        description: data?.error || error?.message,
        variant: 'destructive',
      });
      return;
    }

    toast({ title: 'Certification issued successfully!' });
    loadData();
  };

  const copyBadgeCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({ title: 'Badge code copied to clipboard' });
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Compliance Certifications</h1>
        <Award className="h-8 w-8 text-primary" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Certification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Select Site</label>
            <Select value={selectedSite} onValueChange={setSelectedSite}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a site" />
              </SelectTrigger>
              <SelectContent>
                {sites.map((site) => (
                  <SelectItem key={site.id} value={site.id}>
                    {site.site_url}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Certification Level</label>
            <Select value={certType} onValueChange={setCertType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wcag_a">WCAG Level A (70% minimum)</SelectItem>
                <SelectItem value="wcag_aa">WCAG Level AA (85% minimum)</SelectItem>
                <SelectItem value="wcag_aaa">WCAG Level AAA (95% minimum)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={requestCertification} disabled={loading || !selectedSite}>
            Request Certification
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Certifications</h2>
        {certifications.map((cert) => {
          const isExpired = new Date(cert.expires_at) < new Date();
          const isActive = cert.status === 'active' && !isExpired;

          return (
            <Card key={cert.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{cert.pf_clarity_sites?.site_url}</CardTitle>
                  {isActive ? (
                    <Badge className="bg-green-600">
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <AlertCircle className="mr-1 h-3 w-3" />
                      {isExpired ? 'Expired' : cert.status}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Level:</span>{' '}
                    <span className="font-medium">
                      {cert.certification_type.replace('wcag_', '').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Score:</span>{' '}
                    <span className="font-medium">{cert.score_at_certification}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Expires:</span>{' '}
                    <span className="font-medium">{new Date(cert.expires_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {isActive && (
                  <>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Badge Embed Code</label>
                      <Textarea value={cert.badge_code} readOnly rows={4} className="font-mono text-xs" />
                    </div>
                    <Button size="sm" onClick={() => copyBadgeCode(cert.badge_code)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Badge Code
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          );
        })}

        {certifications.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No certifications yet. Request one above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
