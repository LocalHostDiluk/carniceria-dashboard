"use client";
import { useEffect, useState, createContext, useContext, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export type UserRole = "empleado" | "encargado";

export interface UserProfile {
  id: string;
  username: string;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export interface UserContextType {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  validateManager: (email: string, password: string) => Promise<boolean>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  profile: null,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  validateManager: async () => false,
});

export const UserContextProvider = (props: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar perfil del usuario desde user_profiles
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error loading user profile:", error);
        setProfile(null);
        return;
      }

      setProfile(data as UserProfile);
    } catch (error) {
      console.error("Error in loadUserProfile:", error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    // Verificar sesión inicial
    const initializeUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Session error:", error);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error initializing user:", error);
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth event:', event);
        
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserProfile]);

  // Función de login
  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error("Credenciales inválidas");
    }

    if (!data.user) {
      throw new Error("Error al iniciar sesión");
    }
  }, []);

  // Función de logout
  const logout = useCallback(async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
    } catch (error) {
      console.error("Error in logout:", error);
      // Forzar limpieza incluso si hay error
      setUser(null);
      setProfile(null);
    }
  }, []);

  // Validar credenciales de encargado (para cierre de caja)
  const validateManager = useCallback(async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        return false;
      }

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const isManager = profileData?.role === "encargado";
      
      // Restaurar sesión original si era diferente
      if (currentSession && currentSession.user.id !== data.user.id) {
        await supabase.auth.setSession({
          access_token: currentSession.access_token,
          refresh_token: currentSession.refresh_token,
        });
      }

      return isManager;
    } catch {
      return false;
    }
  }, []);

  const value: UserContextType = useMemo(
    () => ({
      user,
      profile,
      isLoading,
      login,
      logout,
      validateManager,
    }),
    [user, profile, isLoading, login, logout, validateManager]
  );

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider.");
  }
  return context;
};
