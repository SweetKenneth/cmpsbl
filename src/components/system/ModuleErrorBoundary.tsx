/**
 * Module-Level Error Boundary
 * v10.5.4 ARCHITECT — Prevents single module failures from crashing the UI
 *
 * Wraps substrate module views with graceful degradation.
 */

import React, { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  moduleName: string;
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, moduleName: string) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ModuleErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error, this.props.moduleName);
    console.error(`[${this.props.moduleName}] Module error boundary caught:`, error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
          <h3 className="font-semibold text-sm text-foreground">
            {this.props.moduleName} — Module Error
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            This module encountered an error and has been isolated. Other modules continue operating normally.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={this.handleRetry}
            className="gap-1.5"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
