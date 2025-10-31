"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { ErrorHandler, ErrorType, AppError } from "@/lib/errorHandler";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError) => void;
}

interface State {
  hasError: boolean;
  error: AppError | null;
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

  static getDerivedStateFromError(error: Error): State {
    // Convertir el error de React a nuestro AppError
    const appError = ErrorHandler.fromSupabaseError(error);

    return {
      hasError: true,
      error: appError,
      errorBoundaryId: Math.random().toString(36).substr(2, 9),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const appError = ErrorHandler.createError(
      ErrorType.UNKNOWN,
      `Error en componente React: ${error.message}`,
      "REACT_ERROR",
      {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorBoundary: this.state.errorBoundaryId,
      },
      true
    );

    // Llamar callback personalizado si existe
    if (this.props.onError) {
      this.props.onError(appError);
    }

    // Log adicional para desarrollo
    if (process.env.NODE_ENV === "development") {
      console.group("🔥 Error Boundary - Información Detallada");
      console.error("Error original:", error);
      console.error("Error info:", errorInfo);
      console.error("App Error:", appError);
      console.groupEnd();
    }
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
      // Si se proporciona un fallback personalizado, usarlo
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback por defecto elegante
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
                  {ErrorHandler.getUserFriendlyMessage(this.state.error)}
                </p>
              </div>

              {/* Mostrar detalles en desarrollo */}
              {process.env.NODE_ENV === "development" && (
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs font-mono break-all">
                    <strong>Error:</strong> {this.state.error.message}
                  </p>
                  {this.state.error.code && (
                    <p className="text-xs font-mono">
                      <strong>Código:</strong> {this.state.error.code}
                    </p>
                  )}
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                {this.state.error.retryable && (
                  <Button
                    onClick={this.handleRetry}
                    className="flex-1"
                    variant="default"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reintentar
                  </Button>
                )}

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

// HOC para componentes funcionales
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

// Hook para manejar errores asincrónicos en componentes funcionales
export const useAsyncErrorBoundary = () => {
  const [, setError] = React.useState();

  return React.useCallback(
    (error: unknown) => {
      setError(() => {
        throw error;
      });
    },
    [setError]
  );
};
