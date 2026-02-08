/**
 * Mock Usage Dashboard
 * Shows example usage metrics with mock data
 */

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Activity, 
  TrendingUp, 
  Database, 
  Zap, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock data
const mockStats = {
  totalRequests: 47823,
  requestsToday: 1247,
  requestsChange: 12.5,
  memoriesStored: 8432,
  memoriesRecalled: 39391,
  avgLatency: 24,
  latencyChange: -8.2,
  quotaUsed: 47,
};

const mockRecentRequests = [
  { id: 1, action: 'store', status: 'success', latency: 18, timestamp: '2 min ago' },
  { id: 2, action: 'recall', status: 'success', latency: 12, timestamp: '5 min ago' },
  { id: 3, action: 'recall', status: 'success', latency: 31, timestamp: '8 min ago' },
  { id: 4, action: 'store', status: 'success', latency: 22, timestamp: '12 min ago' },
  { id: 5, action: 'status', status: 'success', latency: 8, timestamp: '15 min ago' },
];

const mockTierDistribution = [
  { tier: 'Hot', count: 1247, percentage: 15, color: 'bg-red-500' },
  { tier: 'Warm', count: 3890, percentage: 46, color: 'bg-amber-500' },
  { tier: 'Cold', count: 3295, percentage: 39, color: 'bg-blue-500' },
];

export function MockUsageDashboard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Total Requests"
          value={mockStats.totalRequests.toLocaleString()}
          subValue={`${mockStats.requestsToday.toLocaleString()} today`}
          change={mockStats.requestsChange}
          color="text-primary"
        />
        <StatCard
          icon={Database}
          label="Memories Stored"
          value={mockStats.memoriesStored.toLocaleString()}
          subValue={`${mockStats.memoriesRecalled.toLocaleString()} recalled`}
          color="text-purple-500"
        />
        <StatCard
          icon={Zap}
          label="Avg Latency"
          value={`${mockStats.avgLatency}ms`}
          subValue="p50 response time"
          change={mockStats.latencyChange}
          color="text-green-500"
          invertChange
        />
        <StatCard
          icon={Clock}
          label="Quota Used"
          value={`${mockStats.quotaUsed}%`}
          subValue="of 1,000/day"
          color="text-amber-500"
          progress={mockStats.quotaUsed}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Memory Tier Distribution */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Memory Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockTierDistribution.map((tier) => (
                <div key={tier.tier} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">{tier.tier}</span>
                    <span className="font-medium">{tier.count.toLocaleString()} ({tier.percentage}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className={cn("h-full rounded-full", tier.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${tier.percentage}%` }}
                      transition={{ duration: 1, delay: 0.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Hot memories are accessed frequently. Cold memories are archived for long-term storage.
            </p>
          </CardContent>
        </Card>

        {/* Recent Requests */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Requests</CardTitle>
              <Badge variant="outline" className="text-[10px]">Live</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Action</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs text-right">Latency</TableHead>
                  <TableHead className="text-xs text-right">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRecentRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="text-xs font-medium capitalize">
                      {req.action}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                      >
                        {req.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-right text-muted-foreground">
                      {req.latency}ms
                    </TableCell>
                    <TableCell className="text-xs text-right text-muted-foreground">
                      {req.timestamp}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        This is a demo dashboard with mock data. Sign up to see your real usage metrics.
      </p>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subValue,
  change,
  color,
  progress,
  invertChange,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subValue: string;
  change?: number;
  color: string;
  progress?: number;
  invertChange?: boolean;
}) {
  const isPositive = invertChange ? (change || 0) < 0 : (change || 0) > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="h-full">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between mb-2">
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", `${color}/10`)}>
              <Icon className={cn("w-4 h-4", color)} />
            </div>
            {change !== undefined && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-[10px] gap-0.5",
                  isPositive 
                    ? "text-emerald-500 border-emerald-500/20" 
                    : "text-rose-500 border-rose-500/20"
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {Math.abs(change)}%
              </Badge>
            )}
          </div>
          <div className="text-xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{subValue}</div>
          {progress !== undefined && (
            <Progress value={progress} className="h-1 mt-2" />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
