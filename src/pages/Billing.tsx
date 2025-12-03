import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Clock, DollarSign, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Invoice {
  id: string;
  amount: number;
  status: string;
  date: string;
  plan: string;
}

export default function Billing() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    currentPlan: "Pro",
    monthlySpend: 99,
    nextBilling: "2025-12-01",
    totalSpent: 1287
  });

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      // Mock subscription data for now
      setStats(prev => ({
        ...prev,
        currentPlan: 'Pro'
      }));

      // Mock invoices for now - in production, connect to Stripe
      setInvoices([
        { id: '1', amount: 99, status: 'paid', date: '2025-11-01', plan: 'Pro' },
        { id: '2', amount: 99, status: 'paid', date: '2025-10-01', plan: 'Pro' },
        { id: '3', amount: 49, status: 'paid', date: '2025-09-01', plan: 'Starter' },
      ]);
    } catch (error) {
      console.error('Error loading billing:', error);
      toast.error('Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = (invoiceId: string) => {
    toast.success(`Downloading invoice ${invoiceId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Billing & Payments</h1>
          <p className="text-muted-foreground">Manage your subscription and payment history</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Current Plan</p>
              <p className="text-2xl font-bold text-primary">{stats.currentPlan}</p>
            </div>
            <CreditCard className="w-8 h-8 text-primary/40" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Spend</p>
              <p className="text-2xl font-bold text-foreground">${stats.monthlySpend}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-500/40" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Next Billing</p>
              <p className="text-sm font-bold text-foreground">{stats.nextBilling}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-500/40" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-foreground">${stats.totalSpent}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-500/40" />
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Payment Method</h2>
          <Button variant="outline">Update Card</Button>
        </div>
        <div className="flex items-center gap-4 p-4 bg-secondary/20 rounded-lg">
          <CreditCard className="w-6 h-6 text-primary" />
          <div>
            <p className="font-medium">•••• •••• •••• 4242</p>
            <p className="text-sm text-muted-foreground">Expires 12/2027</p>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Invoice History</h2>
        {invoices.map((invoice) => (
          <Card key={invoice.id} className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <CreditCard className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{invoice.plan} Plan</p>
                  <p className="text-sm text-muted-foreground">{invoice.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-bold text-lg">${invoice.amount}</p>
                  <Badge variant={invoice.status === 'paid' ? 'default' : 'destructive'}>
                    {invoice.status.toUpperCase()}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadInvoice(invoice.id)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
