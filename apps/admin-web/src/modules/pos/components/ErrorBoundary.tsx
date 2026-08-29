/**
 * ssrone ERP - POS Module Error Boundary
 * Prevents unhandled exceptions from crashing the parent shell and presents a clean recovery UI.
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@ssrone/ui";

interface Props {
  children: ReactNode;
  moduleName?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to telemetry / logger
    console.error(`[POS ErrorBoundary] Caught exception in ${this.props.moduleName || "POS"}:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 bg-destructive/5 border border-destructive/20 rounded-2xl text-center space-y-4 my-4">
          <div className="p-3 bg-destructive/10 text-destructive rounded-full">
            <AlertTriangle size={32} />
          </div>
          <div>
            <h4 className="font-display font-bold text-lg text-foreground">
              {this.props.moduleName || "Module"} Encountered an Error
            </h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">
              {this.state.error?.message || "An unexpected error occurred while rendering this view."}
            </p>
          </div>
          <Button onClick={this.handleReset} variant="outline" size="sm" className="gap-2">
            <RefreshCw size={14} /> Retry Workspace
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
