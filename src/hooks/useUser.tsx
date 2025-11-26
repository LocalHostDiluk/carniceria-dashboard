"use client";
import { useEffect, useState, createContext, useContext, useMemo } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

// Ahora usamos user_profiles en lugar de users
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

  useEffect(() => {
    // Verificar sesión inicial
    const initializeUser = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);

        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
      } catch (error) {
        console.error("Error initializing user:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Cargar perfil del usuario desde user_profiles
  const loadUserProfile = async (userId: string) => {
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
  };

  // Función de login
  const login = async (email: string, password: string): Promise<void> => {
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

    // El perfil se carga automáticamente por el listener
  };

  // Función de logout
  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error("Error al cerrar sesión");
    }
  };

  // Validar credenciales de encargado (para cierre de caja)
  const validateManager = async (
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      // Hacer login temporal para validar
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.user) {
        return false;
      }

      // Verificar si es encargado
      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      return profileData?.role === "encargado";
    } catch {
      return false;
    }
  };

  const value: UserContextType = useMemo(
    () => ({
      user,
      profile,
      isLoading,
      login,
      logout,
      validateManager,
    }),
    [user, profile, isLoading]
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
