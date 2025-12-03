import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Zap, Activity, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface NetworkNode {
  id: string;
  name: string;
  status: 'active' | 'idle' | 'error';
  requests: number;
  latency: number;
  uptime: string;
}

export default function RippleNetwork() {
  const [nodes] = useState<NetworkNode[]>([
    { id: '1', name: 'Nexus Gateway', status: 'active', requests: 12847, latency: 45, uptime: '99.98%' },
    { id: '2', name: 'Groq Router', status: 'active', requests: 8234, latency: 32, uptime: '99.95%' },
    { id: '3', name: 'OpenAI Router', status: 'active', requests: 6543, latency: 67, uptime: '99.99%' },
    { id: '4', name: 'Anthropic Router', status: 'active', requests: 4321, latency: 89, uptime: '99.97%' },
    { id: '5', name: 'Anthropic Router', status: 'idle', requests: 892, latency: 108, uptime: '99.94%' },
    { id: '6', name: 'Defense Engine', status: 'active', requests: 15678, latency: 23, uptime: '99.99%' },
  ]);

  const totalRequests = nodes.reduce((sum, node) => sum + node.requests, 0);
  const avgLatency = Math.round(nodes.reduce((sum, node) => sum + node.latency, 0) / nodes.length);
  const activeNodes = nodes.filter(n => n.status === 'active').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Network className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Ripple Network</h1>
          <p className="text-muted-foreground">Network integrator and API router status</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Nodes</p>
              <p className="text-3xl font-bold text-primary">{activeNodes}/{nodes.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500/40" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-3xl font-bold text-foreground">{totalRequests.toLocaleString()}</p>
            </div>
            <Activity className="w-8 h-8 text-blue-500/40" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Avg Latency</p>
              <p className="text-3xl font-bold text-foreground">{avgLatency}ms</p>
            </div>
            <Zap className="w-8 h-8 text-yellow-500/40" />
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Network Nodes</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {nodes.map((node) => (
            <Card key={node.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    node.status === 'active' ? 'bg-green-500/20' : 
                    node.status === 'idle' ? 'bg-yellow-500/20' : 
                    'bg-red-500/20'
                  }`}>
                    <Network className={`w-5 h-5 ${
                      node.status === 'active' ? 'text-green-500' : 
                      node.status === 'idle' ? 'text-yellow-500' : 
                      'text-red-500'
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{node.name}</h3>
                    <Badge variant={node.status === 'active' ? 'default' : 'secondary'}>
                      {node.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Requests</p>
                  <p className="font-semibold">{node.requests.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Latency</p>
                  <p className="font-semibold">{node.latency}ms</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Uptime</p>
                  <p className="font-semibold text-green-500">{node.uptime}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
