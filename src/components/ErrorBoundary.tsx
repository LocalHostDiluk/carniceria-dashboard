"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorBoundaryId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorBoundaryId: Math.random().toString(36).substr(2, 9),
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error: error,
      errorBoundaryId: Math.random().toString(36).substr(2, 9),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log del error sin props de función
    console.group("🔥 Error Boundary - React Error");
    console.error("Error:", error.message);
    console.error("Component Stack:", errorInfo.componentStack);
    console.groupEnd();
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorBoundaryId: Math.random().toString(36).substr(2, 9),
    });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">¡Oops! Algo salió mal</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Ha ocurrido un error inesperado. Por favor intenta nuevamente.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleRetry}
                  className="flex-1"
                  variant="default"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>

                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Ir al Inicio
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                ID de error: {this.state.errorBoundaryId}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
