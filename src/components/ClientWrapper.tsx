"use client";

import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { UserContextProvider } from "@/hooks/useUser";

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <ErrorBoundary>
      <UserContextProvider>{children}</UserContextProvider>
      <Toaster position="top-right" richColors closeButton duration={4000} />
    </ErrorBoundary>
  );
}
