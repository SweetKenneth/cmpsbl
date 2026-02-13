import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { BrainPasscode } from "@/components/BrainPasscode";
import { SEO } from "@/components/SEO";
import CuriosityHeatmap from "@/components/vision/CuriosityHeatmap";
import CompressionStats from "@/components/vision/CompressionStats";
import ReflectionFeed from "@/components/vision/ReflectionFeed";
import MemoryGraph from "@/components/vision/MemoryGraph";
import ReinforcementStats from "@/components/vision/ReinforcementStats";
import CuriosityMonitor from "@/components/vision/CuriosityMonitor";
import TemporalForecast from "@/components/vision/TemporalForecast";
import MetaFeedback from "@/components/vision/MetaFeedback";
import InsightFeed from "@/components/vision/InsightFeed";
import DecisionCenter from "@/components/vision/DecisionCenter";
import DecodeIdentity from "@/components/vision/DecodeIdentity";
import BrainActivationTest from "@/components/vision/BrainActivationTest";

export default function BrainAnalytics() {
  const navigate = useNavigate();

  return (
    <>
      <SEO 
        title="Brain Analytics — AI Learning & Memory Monitoring | CMPSBL®"
        description="Monitor AI learning patterns, memory recall accuracy, and autonomous decision-making across CMPSBL's cognitive substrate in real-time."
        keywords={['AI analytics', 'brain monitoring', 'AI learning patterns', 'memory analytics', 'cognitive metrics']}
      />
      <BrainPasscode>
        <div className="w-full max-w-7xl mx-auto space-y-6 px-3 sm:px-4">
          <DecodeIdentity />
        
        <Card className="p-4 sm:p-6 w-full">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">PromptFluid Brain Analytics</h2>
        
        {/* Analytics Grid - Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <CuriosityHeatmap />
          <CompressionStats />
        </div>

        {/* Analytics Grid - Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ReflectionFeed />
          <MemoryGraph />
        </div>

        {/* Analytics Grid - Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ReinforcementStats />
          <CuriosityMonitor />
        </div>

        {/* Analytics Grid - Row 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <TemporalForecast />
          <MetaFeedback />
        </div>

        {/* Analytics Grid - Row 5 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <InsightFeed />
          <BrainActivationTest />
        </div>

        {/* Analytics Grid - Row 6 */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          <DecisionCenter />
        </div>

        {/* System Info */}
        <div className="glass glass-hover p-6 rounded-xl">
          <h2 className="text-xl font-semibold mb-4">Brain Evolution Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="font-medium">Patch 1: Contextual Memory Mapper</span>
              <span className="text-green-400 font-semibold">✓ Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="font-medium">Patch 2: Weighted Curiosity Engine</span>
              <span className="text-green-400 font-semibold">✓ Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="font-medium">Patch 3: Thought Compression Layer</span>
              <span className="text-green-400 font-semibold">✓ Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="font-medium">Patch 4: Reflective Feedback Loop</span>
              <span className="text-green-400 font-semibold">✓ Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="font-medium">Patch 5: Memory Relationship Graph</span>
              <span className="text-green-400 font-semibold">✓ Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="font-medium">Patch 6: Context Reinforcement</span>
              <span className="text-green-400 font-semibold">✓ Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="font-medium">Patch 7: Curiosity Balancer</span>
              <span className="text-green-400 font-semibold">✓ Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="font-medium">Patch 8: Temporal Reasoning Layer</span>
              <span className="text-green-400 font-semibold">✓ Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="font-medium">Patch 9: Meta-Feedback Loop</span>
              <span className="text-green-400 font-semibold">✓ Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="font-medium">Patch 10: Cross-Module Insight Engine</span>
              <span className="text-green-400 font-semibold">✓ Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="font-medium">Patch 11: Predictive Decision Kernel</span>
              <span className="text-green-400 font-semibold">✓ Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
              <span className="font-medium">CATALYST 1.0: Decode Persona</span>
              <span className="text-green-400 font-semibold">✓ Active</span>
            </div>
          </div>
          </div>
        </Card>
      </div>
    </BrainPasscode>
    </>
  );
}
