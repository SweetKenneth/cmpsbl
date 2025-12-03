import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Mail, Building2 } from 'lucide-react';

export default function ClarityClients() {
  const [clients, setClients] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newClient, setNewClient] = useState({
    client_name: '',
    client_email: '',
    client_company: '',
    site_quota: 5,
    scan_quota_monthly: 50,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    const { data, error } = await supabase.functions.invoke('pf-clarity-whitelabel', {
      body: { action: 'manage_clients', sub_action: 'list' },
    });

    if (!error && data.success) {
      setClients(data.clients || []);
    }
  };

  const createClient = async () => {
    const { data, error } = await supabase.functions.invoke('pf-clarity-whitelabel', {
      body: {
        action: 'manage_clients',
        sub_action: 'create',
        client_data: newClient,
      },
    });

    if (error || !data.success) {
      toast({ title: 'Error creating client', description: error?.message, variant: 'destructive' });
      return;
    }

    toast({ title: 'Client created successfully' });
    setIsDialogOpen(false);
    setNewClient({
      client_name: '',
      client_email: '',
      client_company: '',
      site_quota: 5,
      scan_quota_monthly: 50,
    });
    loadClients();
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Client Management</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Client Name</Label>
                <Input
                  value={newClient.client_name}
                  onChange={(e) => setNewClient({ ...newClient, client_name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newClient.client_email}
                  onChange={(e) => setNewClient({ ...newClient, client_email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <Label>Company</Label>
                <Input
                  value={newClient.client_company}
                  onChange={(e) => setNewClient({ ...newClient, client_company: e.target.value })}
                  placeholder="Acme Corp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Site Quota</Label>
                  <Input
                    type="number"
                    value={newClient.site_quota}
                    onChange={(e) => setNewClient({ ...newClient, site_quota: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label>Monthly Scans</Label>
                  <Input
                    type="number"
                    value={newClient.scan_quota_monthly}
                    onChange={(e) => setNewClient({ ...newClient, scan_quota_monthly: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <Button onClick={createClient} className="w-full">
                Create Client
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {client.client_name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.client_email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span>{client.client_company || 'No company'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Site Quota:</span> {client.site_quota}
                </div>
                <div>
                  <span className="text-muted-foreground">Monthly Scans:</span> {client.scan_quota_monthly}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {clients.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No clients yet. Add your first client above.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
