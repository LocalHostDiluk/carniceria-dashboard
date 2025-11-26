"use client";

import { Toaster } from "sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { UserContextProvider, useUser } from "@/hooks/useUser";
import { SWRConfig } from "swr";
import { ErrorHandler, ErrorType } from "@/lib/errorHandler";
import { useRouter } from "next/navigation";

interface ClientWrapperProps {
  children: React.ReactNode;
}

export function ClientWrapper({ children }: ClientWrapperProps) {
  return (
    <ErrorBoundary>
      <UserContextProvider>
        <SWRConfigWrapper>{children}</SWRConfigWrapper>
      </UserContextProvider>
      <Toaster position="top-right" richColors closeButton duration={4000} />
    </ErrorBoundary>
  );
}

function SWRConfigWrapper({ children }: { children: React.ReactNode }) {
  const { logout } = useUser();
  const router = useRouter();

  return (
    <SWRConfig
      value={{
        onError: (error) => {
          const appError = ErrorHandler.fromSupabaseError(error);
          if (appError.type === ErrorType.AUTHENTICATION) {
            logout();
            router.push("/login");
          }
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
