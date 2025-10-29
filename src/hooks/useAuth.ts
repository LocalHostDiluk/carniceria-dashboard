"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { authService, type AuthUser } from "@/services/authService";
import { supabase } from "@/lib/supabaseClient";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  validateManager: (email: string, password: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar sesión existente al cargar
    const initializeAuth = async () => {
      try {
        const authUser = await authService.getCurrentSession();
        setUser(authUser);
      } catch (error) {
        console.error("Error loading user profile:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session) {
        try {
          const authUser = await authService.getCurrentSession();
          setUser(authUser);
        } catch (error) {
          console.error("Error loading user profile:", error);
          setUser(null);
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const authUser = await authService.login(email, password);
      setUser(authUser);
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      throw error;
    }
  };

  const validateManager = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      return await authService.validateManagerCredentials(email, password);
    } catch (error) {
      console.error("Error validating manager credentials:", error);
      return false;
    }
  };

  const contextValue: AuthContextType = {
    user,
    loading,
    login,
    logout,
    validateManager,
  };

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
