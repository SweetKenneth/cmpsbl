/**
 * Diagnostic Error Boundary
 * Catches render crashes and logs to diag system
 */

import { Component, ReactNode } from "react";
import { diagLog, diagEnabled } from "@/lib/client/diag";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: { componentStack: string };
}

export class DiagErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    this.setState({ errorInfo });
    
    // Always log to diag system if enabled
    diagLog("error", "ErrorBoundary caught", {
      name: error.name,
      message: error.message,
      stack: error.stack?.slice(0, 500),
      componentStack: errorInfo.componentStack?.slice(0, 300),
    });

    // Also log to console in development
    console.error("[DiagErrorBoundary]", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDiagMode = diagEnabled();

      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            backgroundColor: "#0a0b10",
            color: "#fff",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <div
            style={{
              maxWidth: "480px",
              textAlign: "center",
              padding: "32px",
              backgroundColor: "#1a1b20",
              borderRadius: "12px",
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                margin: "0 auto 24px",
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "28px",
              }}
            >
              ⚠️
            </div>

            <h2 style={{ fontSize: "20px", marginBottom: "12px" }}>
              Something went wrong
            </h2>

            <p style={{ color: "#888", marginBottom: "20px", fontSize: "14px" }}>
              The app encountered an unexpected error.
              {isDiagMode && " Check the DIAG panel below for details."}
            </p>

            {this.state.error && (
              <div
                style={{
                  textAlign: "left",
                  padding: "12px",
                  backgroundColor: "#0d0e12",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  fontSize: "12px",
                  fontFamily: "monospace",
                  color: "#ff6b6b",
                  maxHeight: "120px",
                  overflow: "auto",
                }}
              >
                <strong>{this.state.error.name}:</strong> {this.state.error.message}
              </div>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#7A5FFF",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Try Again
              </button>
              <button
                onClick={() => {
                  // Clear all stale data that may cause the crash
                  try { localStorage.clear(); } catch {}
                  try { sessionStorage.clear(); } catch {}
                  if ('caches' in window) {
                    caches.keys().then(names => names.forEach(n => caches.delete(n)));
                  }
                  if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.getRegistrations().then(regs => regs.forEach(r => r.unregister()));
                  }
                  setTimeout(() => window.location.replace('/'), 300);
                }}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "#1a6b3c",
                  color: "#fff",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
              >
                Clear Cache &amp; Reload
              </button>
            </div>

            {!isDiagMode && (
              <p style={{ color: "#666", fontSize: "11px", marginTop: "20px" }}>
                💡 Add <code style={{ color: "#888" }}>?diag=1</code> to URL for detailed diagnostics
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
