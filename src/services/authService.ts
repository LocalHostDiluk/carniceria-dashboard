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

export interface AuthUser {
  user: User;
  profile: UserProfile;
}

class AuthService {
  // Login normal (empleados y encargados)
  async login(email: string, password: string): Promise<AuthUser> {
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

    // Obtener perfil del usuario
    const profile = await this.getUserProfile(data.user.id);

    return {
      user: data.user,
      profile,
    };
  }

  // Logout
  async logout(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error("Error al cerrar sesión");
    }
  }

  // Obtener sesión actual
  async getCurrentSession(): Promise<AuthUser | null> {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      return null;
    }

    try {
      const profile = await this.getUserProfile(session.user.id);
      return {
        user: session.user,
        profile,
      };
    } catch (error) {
      // Si no encuentra perfil, logout automático
      await this.logout();
      return null;
    }
  }

  // Validar credenciales de encargado (para cierre de caja)
  async validateManagerCredentials(
    email: string,
    password: string
  ): Promise<boolean> {
    try {
      const authUser = await this.login(email, password);
      return authUser.profile.role === "encargado";
    } catch {
      return false;
    }
  }

  // Obtener perfil de usuario (método privado)
  private async getUserProfile(userId: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from("user_profiles")
      .select("id, username, role, created_at, updated_at")
      .eq("id", userId)
      .single();

    if (error || !data) {
      throw new Error("Perfil de usuario no encontrado");
    }

    return {
      id: data.id,
      username: data.username,
      role: data.role as UserRole,
      created_at: data.created_at,
      updated_at: data.updated_at,
    };
  }

  // Crear perfil (para usuarios nuevos - solo admin)
  async createProfile(
    userId: string,
    username: string,
    role: UserRole
  ): Promise<void> {
    const { error } = await supabase.from("user_profiles").insert({
      id: userId,
      username,
      role,
    });

    if (error) {
      throw new Error("Error al crear perfil de usuario");
    }
  }
}

export const authService = new AuthService();
