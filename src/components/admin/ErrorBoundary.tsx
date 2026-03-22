import { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error("Admin Error Boundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-background/95">
          <Card className="glass-panel p-8 max-w-lg w-full text-center space-y-6 animate-fade-in">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            
            <div>
              <h2 className="text-2xl font-bold mb-2">Something Went Wrong</h2>
              <p className="text-muted-foreground">
                The admin panel encountered an unexpected error. Please try refreshing the page.
              </p>
            </div>

            {this.state.error && (
              <details className="text-left text-xs bg-muted/50 p-4 rounded-lg">
                <summary className="cursor-pointer font-medium mb-2">Error Details</summary>
                <code className="block mt-2 text-destructive">{this.state.error.message}</code>
              </details>
            )}

            <Button onClick={this.handleReset} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload Page
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
