"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";

export function useAuthGuard() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  return {
    isAuthenticated: !!user,
    isLoading,
    user,
  };
}
