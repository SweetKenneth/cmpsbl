import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Play, CheckCircle, XCircle, Loader2 } from "lucide-react";

export default function BrainActivationTest() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  async function runTest() {
    // Brain test initiated
    setTesting(true);
    setResults(null);

    try {
      // Invoking brain test cycle
      toast.info('Running Brain activation test...');
      
      const { data, error } = await supabase.functions.invoke('pf-brain-test-cycle');
      
      
      
      if (error) {
        console.error('❌ Error from function:', error);
        throw error;
      }
      
      setResults(data);
      
      if (data?.activation_status?.overall_status === 'fully_operational') {
        toast.success('Brain is fully operational!');
      } else {
        toast.warning('Brain partially operational - check results');
      }
    } catch (error: any) {
      console.error('❌ Test failed:', error);
      toast.error('Test failed: ' + error.message);
      setResults({ error: error.message });
    } finally {
      // Test complete
      setTesting(false);
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-foreground">Brain Activation Test</h3>
        <Button
          onClick={runTest}
          disabled={testing}
          size="sm"
          className="gap-2"
        >
          {testing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Testing...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run Test
            </>
          )}
        </Button>
      </div>

      {results && (
        <div className="space-y-4">
          {/* Overall Status */}
          {results.activation_status && (
            <div className={`p-4 rounded-lg border ${
              results.activation_status.overall_status === 'fully_operational'
                ? 'bg-neon-green/10 border-neon-green/30'
                : 'bg-neon-amber/10 border-neon-amber/30'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                {results.activation_status.overall_status === 'fully_operational' ? (
                  <CheckCircle className="h-5 w-5 text-neon-green" />
                ) : (
                  <XCircle className="h-5 w-5 text-neon-amber" />
                )}
                <span className="font-semibold text-foreground">
                  Status: {results.activation_status.overall_status}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>Tests Passed: {results.activation_status.tests_passed}/{results.activation_status.tests_total}</div>
                <div>Success Rate: {results.activation_status.success_rate}</div>
                <div>Cascade Active: {results.activation_status.cascade_active ? 'Yes' : 'No'}</div>
                <div>Learning: {results.activation_status.brain_learning ? 'Active' : 'Inactive'}</div>
              </div>
            </div>
          )}

          {/* Test Results */}
          {results.tests && results.tests.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold text-foreground text-sm mb-2">Test Results:</h4>
              {results.tests.map((test: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded border text-sm ${
                    test.status === 'passed'
                      ? 'bg-neon-green/5 border-neon-green/20'
                      : 'bg-destructive/5 border-destructive/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{test.name}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      test.status === 'passed'
                        ? 'bg-neon-green/20 text-neon-green'
                        : 'bg-destructive/20 text-destructive'
                    }`}>
                      {test.status}
                    </span>
                  </div>
                  {test.count !== undefined && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Count: {test.count}
                    </div>
                  )}
                  {test.error && (
                    <div className="text-xs text-destructive mt-1">
                      Error: {test.error}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {results.error && (
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm text-destructive">{results.error}</p>
            </div>
          )}
        </div>
      )}

      {!results && !testing && (
        <p className="text-sm text-muted-foreground text-center py-8">
          Click "Run Test" to verify Brain activation and learning status
        </p>
      )}
    </Card>
  );
}
