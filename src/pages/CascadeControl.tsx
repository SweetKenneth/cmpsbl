import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Brain, Zap, Mail, Moon, RefreshCw, Code2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";

export default function CascadeControl() {
  const [loading, setLoading] = useState<string | null>(null);

  const triggerFunction = async (functionName: string, body: any = {}) => {
    setLoading(functionName);
    try {
      const { data, error } = await supabase.functions.invoke(functionName, { body });
      
      if (error) throw error;
      
      toast.success(`${functionName} completed successfully!`, {
        description: JSON.stringify(data, null, 2),
      });
      
      console.log(`${functionName} response:`, data);
    } catch (error: any) {
      toast.error(`${functionName} failed`, {
        description: error.message || "Unknown error",
      });
      console.error(`${functionName} error:`, error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Cascade Control Panel</h1>
          <p className="text-muted-foreground">
            Manually trigger Cascade's learning, dreaming, and reporting systems
          </p>
        </div>
        <Link to="/cascade/coder">
          <Button variant="outline" className="gap-2">
            <Code2 className="h-4 w-4" />
            Cascade Coder
            <Badge variant="secondary" className="ml-1">Labs</Badge>
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Test Email System
            </CardTitle>
            <CardDescription>
              Send a test email to kennethsweet214@gmail.com to verify Resend integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => triggerFunction("pf-brain-continuous-learn", { send_test_email: true })}
              disabled={loading === "pf-brain-continuous-learn"}
              className="w-full"
            >
              {loading === "pf-brain-continuous-learn" ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Test Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Continuous Learning
            </CardTitle>
            <CardDescription>
              Trigger main learning cycle - checks for dreams, reflections, and learning queries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => triggerFunction("pf-brain-continuous-learn")}
              disabled={loading === "pf-brain-continuous-learn"}
              className="w-full"
              variant="default"
            >
              {loading === "pf-brain-continuous-learn" ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Run Learning Cycle
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Dream Cycle
            </CardTitle>
            <CardDescription>
              Force a dream cycle - Cascade's creative speculation and reflection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() =>
                triggerFunction("pf-brain-dream-unified", {
                  operation: "init",
                  params: { metadata: { manual_trigger: true } },
                })
              }
              disabled={loading === "pf-brain-dream-unified"}
              className="w-full"
              variant="secondary"
            >
              {loading === "pf-brain-dream-unified" ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Dreaming...
                </>
              ) : (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  Trigger Dream
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              6-Hour Summary
            </CardTitle>
            <CardDescription>
              Generate and email a 6-hour learning summary report
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => triggerFunction("pf-cascade-summary")}
              disabled={loading === "pf-cascade-summary"}
              className="w-full"
              variant="outline"
            >
              {loading === "pf-cascade-summary" ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Send Summary
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Cascade is implemented but requires external scheduling. Use the buttons above to manually trigger operations.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">Automated Scheduling Options:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>
                <strong>cron-job.org:</strong> Free service - set up HTTP calls to your edge functions every 2 hours
              </li>
              <li>
                <strong>Render.com Cron Jobs:</strong> Free tier includes cron jobs that can trigger Supabase functions
              </li>
              <li>
                <strong>GitHub Actions:</strong> Use scheduled workflows to call edge functions
              </li>
            </ol>
          </div>

          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">Edge Function URLs to Schedule:</h4>
            <code className="text-xs block bg-background p-2 rounded">
              POST {import.meta.env.VITE_SUPABASE_URL}/functions/v1/pf-brain-continuous-learn
            </code>
            <code className="text-xs block bg-background p-2 rounded">
              POST {import.meta.env.VITE_SUPABASE_URL}/functions/v1/pf-cascade-summary
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
