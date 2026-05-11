import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background text-center">
          <div className="bg-destructive/10 p-6 rounded-full mb-6">
            <AlertTriangle className="w-12 h-12 text-destructive" />
          </div>
          <h1 className="text-3xl font-serif text-primary mb-4">Something went wrong</h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            We apologize for the inconvenience. A technical error has occurred. 
            Please try refreshing the page or contact support if the problem persists.
          </p>
          <div className="flex gap-4">
            <Button 
              onClick={() => window.location.reload()} 
              variant="default"
            >
              Refresh Page
            </Button>
            <Button 
              onClick={() => window.location.href = "/"} 
              variant="outline"
            >
              Go to Homepage
            </Button>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <pre className="mt-12 p-4 bg-muted rounded text-left overflow-auto max-w-full text-xs">
              {this.state.error?.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
