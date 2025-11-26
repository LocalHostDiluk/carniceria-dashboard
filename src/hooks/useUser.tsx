"use client";
import { useEffect, useState, createContext, useContext, useMemo, useCallback, useRef } from "react";
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
  const initializingRef = useRef(false);

  // Cargar perfil del usuario
  const loadUserProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error loading profile:", error);
        return null;
      }

      return data as UserProfile;
    } catch (error) {
      console.error("Exception loading profile:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    // Evitar múltiples inicializaciones
    if (initializingRef.current) return;
    initializingRef.current = true;

    const initializeUser = async () => {
      try {
        // Timeout de seguridad de 5 segundos
        const timeoutId = setTimeout(() => {
          console.warn('⏱️ Session check timeout, forcing loading to false');
          setIsLoading(false);
        }, 5000);

        const { data: { session }, error } = await supabase.auth.getSession();
        
        clearTimeout(timeoutId);

        if (error) {
          console.error("Session error:", error);
          setUser(null);
          setProfile(null);
          setIsLoading(false);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          const userProfile = await loadUserProfile(session.user.id);
          setProfile(userProfile);
        } else {
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error("Init error:", error);
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();

    // Listener de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth event:', event);

        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          const userProfile = await loadUserProfile(session.user.id);
          setProfile(userProfile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setUser(session.user);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
      initializingRef.current = false;
    };
  }, [loadUserProfile]);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error("Credenciales inválidas");
      if (!data.user) throw new Error("Error al iniciar sesión");

      // El state se actualiza automáticamente por onAuthStateChange
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Siempre limpiar el estado
      setUser(null);
      setProfile(null);
    }
  }, []);

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

      if (error || !data.user) return false;

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", data.user.id)
        .single();

      const isManager = profileData?.role === "encargado";
      
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
