// src/hooks/useUser.tsx
"use client";
import { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

type UserProfile = Database["public"]["Tables"]["users"]["Row"];

export const UserContext = createContext<{
  user: User | null;
  profile: UserProfile | null;
}>({
  user: null,
  profile: null,
});

export const UserContextProvider = (props: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        const { data: userProfile } = await supabase
          .from("users")
          .select("*")
          .eq("user_id", session.user.id)
          .single();
        setProfile(userProfile as UserProfile);
      } else {
        setProfile(null);
      }
    });

    // Carga inicial del usuario
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        supabase
          .from("users")
          .select("*")
          .eq("user_id", session.user.id)
          .single()
          .then(({ data }) => {
            setProfile(data as UserProfile);
          });
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
  };

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider.");
  }
  return context;
};
    