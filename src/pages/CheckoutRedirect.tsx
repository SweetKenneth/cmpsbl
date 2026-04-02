import { useEffect, useMemo, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ExternalLink, RotateCcw, Home } from "lucide-react";
import { decodeCheckoutBody, type CheckoutFunctionName } from "@/lib/checkout/checkoutRedirect";

type ViewState =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error"; message: string; url?: string };

const ALLOWED_FNS: CheckoutFunctionName[] = [
  "marketplace-checkout",
  "capability-checkout",
  "licensing-checkout",
  "showroom-checkout",
];

export default function CheckoutRedirect() {
  const [searchParams] = useSearchParams();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ViewState>({ status: "loading" });

  const fn = useMemo(() => {
    const raw = searchParams.get("fn") ?? "";
    return (ALLOWED_FNS.includes(raw as CheckoutFunctionName)
      ? (raw as CheckoutFunctionName)
      : null);
  }, [searchParams]);

  const bodyEncoded = useMemo(() => searchParams.get("body"), [searchParams]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!fn) {
        setState({ status: "error", message: "Invalid checkout request (missing fn)." });
        return;
      }
      if (!bodyEncoded) {
        setState({ status: "error", message: "Invalid checkout request (missing body)." });
        return;
      }

      setState({ status: "loading" });

      try {
        const body = decodeCheckoutBody<Record<string, unknown>>(bodyEncoded);
        const { data, error } = await supabase.functions.invoke(fn, { body });

        if (error) throw error;

        const url = (data as any)?.url as string | undefined;
        if (!url) throw new Error("No checkout URL returned");

        if (cancelled) return;
        setState({ status: "ready", url });

        // Navigate in-tab. If navigation is blocked for any reason, the UI provides a manual link.
        window.location.assign(url);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "Checkout failed";
        setState({ status: "error", message });
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [fn, bodyEncoded, attempt]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Redirecting to secure checkout…</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {state.status === "loading" && (
            <div className="flex items-center gap-3 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Creating your checkout session</span>
            </div>
          )}

          {state.status === "ready" && (
            <Alert>
              <AlertTitle>Almost there</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>If you’re not redirected automatically, use the button below:</p>
                <Button asChild className="w-full">
                  <a href={state.url} rel="noreferrer" target="_self">
                    Continue to Stripe Checkout
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {state.status === "error" && (
            <Alert variant="destructive">
              <AlertTitle>Checkout failed</AlertTitle>
              <AlertDescription className="space-y-3">
                <p>{state.message}</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" onClick={() => setAttempt((x) => x + 1)}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Try again
                  </Button>
                  <Button asChild variant="secondary">
                    <Link to="/">
                      <Home className="mr-2 h-4 w-4" />
                      Go home
                    </Link>
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <p className="text-xs text-muted-foreground">
            Tip: If you use aggressive popup blockers, this flow will continue in the current tab.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
